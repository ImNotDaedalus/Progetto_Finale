from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app.model.account import Account
from app.service.account_service import AccountService
from app.utils.exceptions import DBException

account_controller = Blueprint('account', __name__)
account_service = AccountService()


_REQUIRED_REGISTER_FIELDS = (
    "nome", "cognome", "email", "password", "nazionalita",
    "data_nascita", "sesso", "indirizzo",
)
_ALLOWED_SESSO = {"Maschio", "Femmina"}


def _validate_account_payload(data: dict, *, for_create: bool):
    required = _REQUIRED_REGISTER_FIELDS if for_create else (
        "nome", "cognome", "email", "password", "nazionalita",
        "data_nascita", "sesso", "indirizzo",
    )
    missing = [field for field in required if not data.get(field)]
    if missing:
        return (
            jsonify({"error": f"Campi obbligatori mancanti: {', '.join(missing)}"}),
            400,
        )
    if data.get("sesso") not in _ALLOWED_SESSO:
        return (
            jsonify({"error": "Sesso non valido: usa 'Maschio' o 'Femmina'"}),
            400,
        )
    return None


def _build_account_from_payload(data: dict, account_id=None) -> Account:
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
@jwt_required()
def get_accounts():
    accounts = account_service.get_accounts()
    return jsonify([acc.to_dict() for acc in accounts])


@account_controller.route("/<int:id>")
@jwt_required()
def get_account(id):
    acc = account_service.get_account_by_id(id)
    if acc is None:
        return jsonify({"error": "Account non trovato"}), 404
    return jsonify(acc.to_dict())


@account_controller.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data:
        return jsonify({"error": "Dati mancanti"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email e password obbligatorie"}), 400

    acc = account_service.get_account_by_email_and_password(email, password)
    if acc is None:
        return jsonify({"error": "Credenziali non valide"}), 401

    access_token = create_access_token(identity=acc.email)
    return jsonify(access_token=access_token), 200


@account_controller.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@account_controller.route("/", methods=["POST"])
def new_account():
    data = request.json
    if not data:
        return jsonify({"error": "Dati mancanti"}), 400

    validation_error = _validate_account_payload(data, for_create=True)
    if validation_error is not None:
        return validation_error

    new_acc = _build_account_from_payload(data)
    try:
        acc_id = account_service.create_account(new_acc)
    except DBException as e:
        return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"id": acc_id}), 201


@account_controller.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_account(id):
    current_user = get_jwt_identity()
    target = account_service.get_account_by_id(id)

    if target is None:
        return jsonify({"error": "Account non trovato"}), 404

    if target.email != current_user:
        return jsonify({"error": "Non autorizzato"}), 403

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
    current_user = get_jwt_identity()
    target = account_service.get_account_by_id(id)

    if target is None:
        return jsonify({"error": "Account non trovato"}), 404

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
