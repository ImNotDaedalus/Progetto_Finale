# =============================================================================
# CONTROLLER SQUADRA - rispondiamo alle richieste web sulle squadre.
# Riceve le richieste, le valida, chiama il service e ritorna la risposta.
# =============================================================================

from flask import Blueprint, jsonify, request

from app.model.squadra import Squadra
from app.service.squadra_service import SquadraService
from app.utils.exceptions import DBException


squadra_controller = Blueprint("squadra", __name__)
squadra_service = SquadraService()


def build_squadra_from_payload(data: dict, squadra_id=None) -> Squadra:
    """Costruisce un oggetto Squadra dai dati ricevuti dal frontend.
    Si occupa di trasformare l'id del proprietario in numero (o None se mancante)."""
    id_proprietario = data.get("id_proprietario")
    if id_proprietario not in (None, ""):
        try:
            id_proprietario = int(id_proprietario)
        except (TypeError, ValueError):
            # Se il valore non è un numero valido, lo trattiamo come "non c'è".
            id_proprietario = None
    else:
        id_proprietario = None

    return Squadra(
        id=squadra_id,
        nome=data.get("nome"),
        id_proprietario=id_proprietario,
    )


def validate_squadra_payload(data: dict):
    """Controlla che i dati per creare/aggiornare una squadra siano validi."""
    if not data.get("nome"):
        return jsonify({"error": "Campo obbligatorio mancante: nome"}), 400
    if not data.get("id_proprietario"):
        return jsonify({"error": "Campo obbligatorio mancante: id_proprietario"}), 400
    try:
        # Verifica che l'id_proprietario sia un numero intero.
        int(data.get("id_proprietario"))
    except (TypeError, ValueError):
        return jsonify({"error": "id_proprietario deve essere un numero intero"}), 400
    return None  # tutto ok


@squadra_controller.route("/")
def get_squadre():
    """GET /squadra/ - elenco di tutte le squadre."""
    squadre = squadra_service.get_squadre()
    return jsonify([squadra.to_dict() for squadra in squadre])


@squadra_controller.route("/<int:id>")
def get_squadra(id):
    """GET /squadra/<id> - dettaglio di una singola squadra."""
    squadra = squadra_service.get_squadra_by_id(id)
    if squadra is None:
        return jsonify({"error": "Squadra non trovata"}), 404
    return jsonify(squadra.to_dict())


@squadra_controller.route("/", methods=["POST"])
def new_squadra():
    """POST /squadra/ - crea una nuova squadra."""
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
    """PUT /squadra/<id> - aggiorna i dati di una squadra esistente."""
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
    """DELETE /squadra/<id> - elimina una squadra."""
    try:
        deleted = squadra_service.delete_squadra(id)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        if deleted:
            return jsonify({"message": "Squadra eliminata"}), 200
        return jsonify({"error": "Squadra non trovata"}), 404
