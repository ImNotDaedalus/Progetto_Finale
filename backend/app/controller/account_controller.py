# =============================================================================
# CONTROLLER ACCOUNT - rispondiamo alle richieste web sugli account.
#
# Cosa fa un controller? È il "cameriere" del backend: riceve le richieste
# che arrivano dal frontend (es. "voglio creare un account", "fammi il login")
# e decide cosa fare. Tipicamente: controlla che i dati siano corretti, poi
# chiama un service che fa il lavoro vero, e infine restituisce una risposta
# al chiamante (in formato JSON, cioè testo strutturato).
#
# Ogni "@account_controller.route(...)" associa un indirizzo web a una funzione.
# Esempio: chi va su /account/login dal browser, finisce nella funzione login().
# =============================================================================

from flask import Blueprint, jsonify, request                                       # strumenti del framework Flask
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required  # gestione token JWT (la "tessera digitale")

from app.model.account import Account
from app.service.account_service import AccountService
from app.utils.exceptions import DBException

# "Blueprint" = un gruppo di rotte; serve a tenere ordinato il codice.
account_controller = Blueprint('account', __name__)
# Creiamo un'istanza del service: questo oggetto sa come gestire gli account.
account_service = AccountService()


# Lista dei campi che DEVONO essere presenti quando ci si registra.
_REQUIRED_REGISTER_FIELDS = (
    "nome", "cognome", "email", "password", "nazionalita",
    "data_nascita", "sesso", "indirizzo",
)
# Valori validi per il campo "sesso".
_ALLOWED_SESSO = {"Maschio", "Femmina"}


def _validate_account_payload(data: dict, *, for_create: bool):
    """Controlla che i dati ricevuti dal frontend siano accettabili.
    Se va tutto bene ritorna None; altrimenti ritorna una risposta di errore."""
    required = _REQUIRED_REGISTER_FIELDS if for_create else (
        "nome", "cognome", "email", "password", "nazionalita",
        "data_nascita", "sesso", "indirizzo",
    )
    # Cerca quali campi obbligatori sono mancanti o vuoti.
    missing = [field for field in required if not data.get(field)]
    if missing:
        return (
            jsonify({"error": f"Campi obbligatori mancanti: {', '.join(missing)}"}),
            400,  # 400 = "richiesta sbagliata"
        )
    # Controlla che il sesso sia uno dei valori permessi.
    if data.get("sesso") not in _ALLOWED_SESSO:
        return (
            jsonify({"error": "Sesso non valido: usa 'Maschio' o 'Femmina'"}),
            400,
        )
    return None  # tutto ok


def _build_account_from_payload(data: dict, account_id=None) -> Account:
    """Costruisce un oggetto Account a partire dai dati ricevuti.
    Gestisce il caso in cui id_squadra sia mancante o vuoto."""
    id_squadra = data.get("id_squadra")
    if id_squadra in ("", None):
        id_squadra = None
    return Account(
        id=account_id,
        nome=data.get("nome"),
        cognome=data.get("cognome"),
        email=data.get("email"),
        password=data.get("password"),
        nazionalita=data.get("nazionalita"),
        data_nascita=data.get("data_nascita"),
        sesso=data.get("sesso"),
        indirizzo=data.get("indirizzo"),
        id_squadra=id_squadra,
    )


@account_controller.route("/")
@jwt_required()  # serve essere loggati per accedere a questa rotta
def get_accounts():
    """GET /account/  - restituisce la lista di TUTTI gli account."""
    accounts = account_service.get_accounts()
    # Trasformiamo ogni Account in dizionario (per spedirli come JSON).
    return jsonify([acc.to_dict() for acc in accounts])


@account_controller.route("/<int:id>")
@jwt_required()
def get_account(id):
    """GET /account/<id>  - restituisce un singolo account dato il suo id."""
    acc = account_service.get_account_by_id(id)
    if acc is None:
        return jsonify({"error": "Account non trovato"}), 404  # 404 = "non trovato"
    return jsonify(acc.to_dict())


@account_controller.route("/login", methods=["POST"])
def login():
    """POST /account/login - controlla email/password e restituisce un token JWT."""
    data = request.json  # i dati arrivano nel "corpo" della richiesta
    if not data:
        return jsonify({"error": "Dati mancanti"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email e password obbligatorie"}), 400

    # Cerca un account con quelle credenziali.
    acc = account_service.get_account_by_email_and_password(email, password)
    if acc is None:
        return jsonify({"error": "Credenziali non valide"}), 401  # 401 = "non autenticato"

    # Crea la "tessera digitale" (token JWT) basata sull'email dell'utente.
    # Il frontend la conserverà e la userà per dimostrare di essere loggato.
    access_token = create_access_token(identity=acc.email)
    return jsonify(access_token=access_token), 200


@account_controller.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    """GET /account/protected - usato dal frontend per sapere chi è l'utente
    attualmente loggato (riconosciuto dal token JWT)."""
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@account_controller.route("/", methods=["POST"])
def new_account():
    """POST /account/ - crea un nuovo account (registrazione)."""
    data = request.json
    if not data:
        return jsonify({"error": "Dati mancanti"}), 400

    # Valida i dati e, in caso di errori, ritorna subito la risposta di errore.
    validation_error = _validate_account_payload(data, for_create=True)
    if validation_error is not None:
        return validation_error

    # Costruisce l'oggetto Account e lo passa al service per il salvataggio.
    new_acc = _build_account_from_payload(data)
    try:
        acc_id = account_service.create_account(new_acc)
    except DBException as e:
        return jsonify({"error": str(e)}), 500  # 500 = errore lato server (es. email già esistente)
    else:
        return jsonify({"id": acc_id}), 201  # 201 = "creato con successo"


@account_controller.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_account(id):
    """PUT /account/<id> - aggiorna i dati di un account.
    Si possono modificare SOLO i propri dati (ricavati dal token)."""
    current_user = get_jwt_identity()              # email dell'utente loggato
    target = account_service.get_account_by_id(id)  # account che si vuole modificare

    if target is None:
        return jsonify({"error": "Account non trovato"}), 404

    # Controllo di sicurezza: si possono modificare solo i propri dati.
    if target.email != current_user:
        return jsonify({"error": "Non autorizzato"}), 403  # 403 = "vietato"

    data = request.json or {}

    validation_error = _validate_account_payload(data, for_create=False)
    if validation_error is not None:
        return validation_error

    acc = _build_account_from_payload(data, account_id=id)
    try:
        updated = account_service.update_account(acc)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        if updated:
            return jsonify({"message": "Account aggiornato"}), 200
        return jsonify({"error": "Account non trovato"}), 404


@account_controller.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_account(id):
    """DELETE /account/<id> - elimina il proprio account."""
    current_user = get_jwt_identity()
    target = account_service.get_account_by_id(id)

    if target is None:
        return jsonify({"error": "Account non trovato"}), 404

    # Sicurezza: posso cancellare SOLO il mio account, non quello di altri.
    if target.email != current_user:
        return jsonify({"error": "Non autorizzato"}), 403

    try:
        deleted = account_service.delete_account(id)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        if deleted:
            return jsonify({"message": "Account eliminato"}), 200
        return jsonify({"error": "Account non trovato"}), 404
