# =============================================================================
# CONTROLLER GARA - rispondiamo alle richieste web sulle gare (partite).
#
# Le rotte di lettura (GET) sono pubbliche; quelle di scrittura sono
# protette: per creare/modificare/eliminare una gara devi essere il
# proprietario del torneo a cui la gara appartiene.
# =============================================================================

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.model.gara import Gara
from app.service.account_service import AccountService
from app.service.gara_service import GaraService
from app.service.torneo_service import TorneoService
from app.utils.exceptions import DBException


gara_controller = Blueprint('gara', __name__)
gara_service = GaraService()
torneo_service = TorneoService()
account_service = AccountService()


def _nullable_int(value):
    """Trasforma un valore in intero, oppure ritorna None se è vuoto o non valido.
    Utile perché i numeri arrivano dal frontend a volte come testo."""
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _build_gara_from_payload(data: dict, gara_id=None) -> Gara:
    """Costruisce un oggetto Gara dai dati ricevuti dal frontend."""
    return Gara(
        id=gara_id,
        data=data.get("data"),
        ora=data.get("ora"),
        id_torneo=_nullable_int(data.get("id_torneo")),
        id_gara_precedente=_nullable_int(data.get("id_gara_precedente")),
    )


def _validate_gara_payload(data: dict):
    """Controlla che data e ora siano presenti."""
    if not data.get("data"):
        return jsonify({"error": "Campo obbligatorio mancante: data"}), 400
    if not data.get("ora"):
        return jsonify({"error": "Campo obbligatorio mancante: ora"}), 400
    return None


def _current_account_id():
    """Restituisce l'id dell'account corrispondente al token JWT corrente."""
    email = get_jwt_identity()
    if email is None:
        return None
    for account in account_service.get_accounts():
        if account.email == email:
            return account.id
    return None


def _ensure_owner_of_torneo(id_torneo):
    """Verifica che l'utente loggato sia il proprietario del torneo dato.
    Restituisce None se OK, altrimenti la response Flask con errore.
    Si usa prima di permettere a un utente di gestire le gare di un torneo."""
    if id_torneo is None:
        # Gara "libera" (non legata a un torneo): non controlliamo nulla.
        return None
    torneo = torneo_service.get_torneo_by_id(id_torneo)
    if torneo is None:
        return jsonify({"error": "Torneo collegato non trovato"}), 404
    if torneo.id_proprietario != _current_account_id():
        return (
            jsonify({"error": "Solo il proprietario del torneo puo gestire le gare"}),
            403,
        )
    return None


@gara_controller.route("/")
def get_gare():
    """GET /gara/ - elenco di tutte le gare (pubblico)."""
    gare = gara_service.get_gare()
    return jsonify([gara.to_dict() for gara in gare])


@gara_controller.route("/<int:id>")
def get_gara(id):
    """GET /gara/<id> - dettaglio di una gara (pubblico)."""
    gara = gara_service.get_gara_by_id(id)
    if gara is None:
        return jsonify({"error": "Gara not found"}), 404
    return jsonify(gara.to_dict())


@gara_controller.route("/", methods=["POST"])
@jwt_required()
def new_gara():
    """POST /gara/ - crea una nuova gara. Solo il proprietario del torneo collegato."""
    data = request.json or {}

    # Controlla i dati di base.
    validation_error = _validate_gara_payload(data)
    if validation_error is not None:
        return validation_error

    # Verifica che l'utente sia il proprietario del torneo a cui la gara appartiene.
    id_torneo = _nullable_int(data.get("id_torneo"))
    owner_error = _ensure_owner_of_torneo(id_torneo)
    if owner_error is not None:
        return owner_error

    new_g = _build_gara_from_payload(data)
    try:
        gara_id = gara_service.create_gara(new_g)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"id": gara_id}), 201


@gara_controller.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_gara(id):
    """PUT /gara/<id> - modifica una gara esistente."""
    data = request.json or {}

    validation_error = _validate_gara_payload(data)
    if validation_error is not None:
        return validation_error

    existing = gara_service.get_gara_by_id(id)
    if existing is None:
        return jsonify({"error": "Gara non trovata"}), 404

    # Per modificare devi essere proprietario sia del torneo attuale (a cui
    # la gara è collegata) sia di quello nuovo (se stai cambiando torneo).
    owner_error = _ensure_owner_of_torneo(existing.id_torneo)
    if owner_error is not None:
        return owner_error
    new_id_torneo = _nullable_int(data.get("id_torneo"))
    if new_id_torneo != existing.id_torneo:
        owner_error = _ensure_owner_of_torneo(new_id_torneo)
        if owner_error is not None:
            return owner_error

    gara = _build_gara_from_payload(data, gara_id=id)
    try:
        updated = gara_service.update_gara(gara)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        if updated:
            return jsonify({"message": "Gara aggiornata"}), 200
        return jsonify({"error": "Gara non trovata"}), 404


@gara_controller.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_gara(id):
    """DELETE /gara/<id> - elimina una gara. Solo il proprietario del torneo."""
    existing = gara_service.get_gara_by_id(id)
    if existing is None:
        return jsonify({"error": "Gara non trovata"}), 404

    owner_error = _ensure_owner_of_torneo(existing.id_torneo)
    if owner_error is not None:
        return owner_error

    try:
        deleted = gara_service.delete_gara(id)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        if deleted:
            return jsonify({"message": "Gara eliminata"}), 200
        return jsonify({"error": "Gara non trovata"}), 404
