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
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _build_gara_from_payload(data: dict, gara_id=None) -> Gara:
    return Gara(
        id=gara_id,
        data=data.get("data"),
        ora=data.get("ora"),
        id_torneo=_nullable_int(data.get("id_torneo")),
        id_gara_precedente=_nullable_int(data.get("id_gara_precedente")),
    )


def _validate_gara_payload(data: dict):
    if not data.get("data"):
        return jsonify({"error": "Campo obbligatorio mancante: data"}), 400
    if not data.get("ora"):
        return jsonify({"error": "Campo obbligatorio mancante: ora"}), 400
    return None


def _current_account_id():
    email = get_jwt_identity()
    if email is None:
        return None
    for account in account_service.get_accounts():
        if account.email == email:
            return account.id
    return None


def _ensure_owner_of_torneo(id_torneo):
    """Verifica che l'utente loggato sia il proprietario del torneo dato.
    Restituisce None se OK, altrimenti la response Flask con errore."""
    if id_torneo is None:
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
    gare = gara_service.get_gare()
    return jsonify([gara.to_dict() for gara in gare])


@gara_controller.route("/<int:id>")
def get_gara(id):
    gara = gara_service.get_gara_by_id(id)
    if gara is None:
        return jsonify({"error": "Gara not found"}), 404
    return jsonify(gara.to_dict())


@gara_controller.route("/", methods=["POST"])
@jwt_required()
def new_gara():
    data = request.json or {}

    validation_error = _validate_gara_payload(data)
    if validation_error is not None:
        return validation_error

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
    data = request.json or {}

    validation_error = _validate_gara_payload(data)
    if validation_error is not None:
        return validation_error

    existing = gara_service.get_gara_by_id(id)
    if existing is None:
        return jsonify({"error": "Gara non trovata"}), 404

    # Deve essere proprietario sia del torneo attuale che di quello nuovo.
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
