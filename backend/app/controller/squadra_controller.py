from flask import Blueprint, jsonify, request

from app.model.squadra import Squadra
from app.service.squadra_service import SquadraService
from app.utils.exceptions import DBException


squadra_controller = Blueprint("squadra", __name__)
squadra_service = SquadraService()


def build_squadra_from_payload(data: dict, squadra_id=None) -> Squadra:
    id_proprietario = data.get("id_proprietario")
    if id_proprietario not in (None, ""):
        try:
            id_proprietario = int(id_proprietario)
        except (TypeError, ValueError):
            id_proprietario = None
    else:
        id_proprietario = None

    return Squadra(
        id=squadra_id,
        nome=data.get("nome"),
        id_proprietario=id_proprietario,
    )


def validate_squadra_payload(data: dict):
    if not data.get("nome"):
        return jsonify({"error": "Campo obbligatorio mancante: nome"}), 400
    if not data.get("id_proprietario"):
        return jsonify({"error": "Campo obbligatorio mancante: id_proprietario"}), 400
    try:
        int(data.get("id_proprietario"))
    except (TypeError, ValueError):
        return jsonify({"error": "id_proprietario deve essere un numero intero"}), 400
    return None


@squadra_controller.route("/")
def get_squadre():
    squadre = squadra_service.get_squadre()
    return jsonify([squadra.to_dict() for squadra in squadre])


@squadra_controller.route("/<int:id>")
def get_squadra(id):
    squadra = squadra_service.get_squadra_by_id(id)
    if squadra is None:
        return jsonify({"error": "Squadra non trovata"}), 404
    return jsonify(squadra.to_dict())


@squadra_controller.route("/", methods=["POST"])
def new_squadra():
    data = request.json
    if not data:
        return jsonify({"error": "Dati mancanti"}), 400

    validation_error = validate_squadra_payload(data)
    if validation_error is not None:
        return validation_error

    new_squadra = build_squadra_from_payload(data)
    try:
        squadra_id = squadra_service.create_squadra(new_squadra)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"id": squadra_id}), 201


@squadra_controller.route("/<int:id>", methods=["PUT"])
def update_squadra(id):
    data = request.json
    if not data:
        return jsonify({"error": "Dati mancanti"}), 400

    validation_error = validate_squadra_payload(data)
    if validation_error is not None:
        return validation_error

    squadra = build_squadra_from_payload(data, squadra_id=id)
    try:
        updated = squadra_service.update_squadra(squadra)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        if updated:
            return jsonify({"message": "Squadra aggiornata"}), 200
        return jsonify({"error": "Squadra non trovata"}), 404


@squadra_controller.route("/<int:id>", methods=["DELETE"])
def delete_squadra(id):
    try:
        deleted = squadra_service.delete_squadra(id)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        if deleted:
            return jsonify({"message": "Squadra eliminata"}), 200
        return jsonify({"error": "Squadra non trovata"}), 404
