# =============================================================================
# CONTROLLER TORNEO - rispondiamo alle richieste web sui tornei.
#
# Le rotte di lettura (GET) sono pubbliche; quelle di scrittura (POST, PUT,
# DELETE) sono protette: serve essere loggati e, per modifica/cancellazione,
# essere il proprietario del torneo.
# =============================================================================

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.model.torneo import Torneo
from app.service.account_service import AccountService
from app.service.torneo_service import TorneoService
from app.utils.exceptions import DBException


torneo_controller = Blueprint("torneo", __name__)
torneo_service = TorneoService()
# Ci serve anche il service degli account per trovare l'utente loggato.
account_service = AccountService()


def build_torneo_from_payload(data: dict, id_proprietario, torneo_id=None) -> Torneo:
    """Costruisce un oggetto Torneo dai dati ricevuti."""
    return Torneo(
        id=torneo_id,
        nome=data.get("nome"),
        data_inizio=data.get("data_inizio"),
        data_fine=data.get("data_fine"),
        luogo=data.get("luogo"),
        divisione=data.get("divisione"),
        id_proprietario=id_proprietario,
    )


def validate_torneo_payload(data: dict):
    """Controlla che siano presenti tutti i campi obbligatori."""
    required_fields = (
        "nome",
        "data_inizio",
        "data_fine",
        "luogo",
        "divisione",
    )
    missing_fields = [field for field in required_fields if not data.get(field)]

    if missing_fields:
        return (
            jsonify({"error": f"Campi obbligatori mancanti: {', '.join(missing_fields)}"}),
            400,
        )

    return None


def _current_account_id():
    """Restituisce l'id dell'account corrispondente al token JWT corrente.
    In pratica: "chi sta facendo questa richiesta?"."""
    email = get_jwt_identity()  # legge l'email dal token JWT
    if email is None:
        return None
    accounts = account_service.get_accounts()
    # Cerca tra gli account quello con la stessa email.
    for account in accounts:
        if account.email == email:
            return account.id
    return None


@torneo_controller.route("/")
def get_tornei():
    """GET /torneo/ - elenco di tutti i tornei (pubblico)."""
    tornei = torneo_service.get_tornei()
    return jsonify([torneo.to_dict() for torneo in tornei])


@torneo_controller.route("/<int:id>")
def get_torneo(id):
    """GET /torneo/<id> - dettaglio di un torneo (pubblico)."""
    torneo = torneo_service.get_torneo_by_id(id)
    if torneo is None:
        return jsonify({"error": "Torneo non trovato"}), 404
    return jsonify(torneo.to_dict())


@torneo_controller.route("/", methods=["POST"])
@jwt_required()  # bisogna essere loggati per creare un torneo
def new_torneo():
    """POST /torneo/ - crea un nuovo torneo. Il proprietario diventa
    automaticamente l'utente loggato."""
    data = request.json
    if not data:
        return jsonify({"error": "Dati mancanti"}), 400

    validation_error = validate_torneo_payload(data)
    if validation_error is not None:
        return validation_error

    # Trova l'id dell'utente loggato (sarà il proprietario del torneo).
    id_proprietario = _current_account_id()
    if id_proprietario is None:
        return jsonify({"error": "Account non trovato"}), 401

    new_torneo = build_torneo_from_payload(data, id_proprietario=id_proprietario)
    try:
        torneo_id = torneo_service.create_torneo(new_torneo)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"id": torneo_id}), 201


@torneo_controller.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_torneo(id):
    """PUT /torneo/<id> - modifica un torneo. Solo il proprietario può farlo."""
    data = request.json
    if not data:
        return jsonify({"error": "Dati mancanti"}), 400

    validation_error = validate_torneo_payload(data)
    if validation_error is not None:
        return validation_error

    existing = torneo_service.get_torneo_by_id(id)
    if existing is None:
        return jsonify({"error": "Torneo non trovato"}), 404

    # Sicurezza: chi sta modificando deve essere il proprietario del torneo.
    if existing.id_proprietario != _current_account_id():
        return jsonify({"error": "Solo il proprietario puo modificare il torneo"}), 403

    # Manteniamo lo stesso proprietario (non si può cambiare).
    torneo = build_torneo_from_payload(
        data,
        id_proprietario=existing.id_proprietario,
        torneo_id=id,
    )
    try:
        updated = torneo_service.update_torneo(torneo)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        if updated:
            return jsonify({"message": "Torneo aggiornato"}), 200
        return jsonify({"error": "Torneo non trovato"}), 404


@torneo_controller.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_torneo(id):
    """DELETE /torneo/<id> - elimina un torneo. Solo il proprietario può farlo."""
    existing = torneo_service.get_torneo_by_id(id)
    if existing is None:
        return jsonify({"error": "Torneo non trovato"}), 404

    if existing.id_proprietario != _current_account_id():
        return jsonify({"error": "Solo il proprietario puo eliminare il torneo"}), 403

    try:
        deleted = torneo_service.delete_torneo(id)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        if deleted:
            return jsonify({"message": "Torneo eliminato"}), 200
        return jsonify({"error": "Torneo non trovato"}), 404
