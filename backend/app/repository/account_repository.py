from app.model.account import Account
from app.utils.db import db
from app.utils.exceptions import DBException


_COLUMNS = (
    "id, nome, cognome, email, password, nazionalita, "
    "data_nascita, sesso, indirizzo, id_squadra"
)


def _row_to_account(row) -> Account:
    return Account(
        id=row[0], nome=row[1], cognome=row[2],
        email=row[3], password=row[4], nazionalita=row[5],
        data_nascita=row[6], sesso=row[7],
        indirizzo=row[8], id_squadra=row[9],
    )


class AccountRepository:

    def get_accounts(self) -> list[Account]:
        sql = f"SELECT {_COLUMNS} FROM accounts"
        with db.cursor() as cur:
            cur.execute(sql)
            return [_row_to_account(row) for row in cur.fetchall()]

    def get_account_by_id(self, id: int) -> Account:
        sql = f"SELECT {_COLUMNS} FROM accounts WHERE id = %s"
        with db.cursor() as cur:
            cur.execute(sql, (id,))
            row = cur.fetchone()
            if row is None:
                return None
            return _row_to_account(row)

    def get_account_by_email_and_password(self, email: str, password: str) -> Account:
        sql = f"SELECT {_COLUMNS} FROM accounts WHERE email = %s AND password = %s"
        with db.cursor() as cur:
            cur.execute(sql, (email, password))
            row = cur.fetchone()
            if row is None:
                return None
            return _row_to_account(row)

    def create_account(self, account: Account) -> int:
        sql = """
            INSERT INTO accounts
                (nome, cognome, email, password, nazionalita,
                 data_nascita, sesso, indirizzo, id_squadra)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            account.nome, account.cognome, account.email,
            account.password, account.nazionalita,
            account.data_nascita, account.sesso,
            account.indirizzo, account.id_squadra,
        )
        with db.cursor() as cur:
            try:
                cur.execute(sql, params)
            except Exception as e:
                db.rollback()
                raise DBException(str(e)) from e
            else:
                db.commit()
                return cur.lastrowid

    def update_account(self, account: Account) -> bool:
        sql = """
            UPDATE accounts
            SET nome = %s, cognome = %s, email = %s,
                password = %s, nazionalita = %s,
                data_nascita = %s, sesso = %s,
                indirizzo = %s, id_squadra = %s
            WHERE id = %s
        """
        params = (
            account.nome, account.cognome, account.email,
            account.password, account.nazionalita,
            account.data_nascita, account.sesso,
            account.indirizzo, account.id_squadra, account.id,
        )
        with db.cursor() as cur:
            try:
                cur.execute(sql, params)
            except Exception as e:
                db.rollback()
                raise DBException from e
            else:
                db.commit()
                return cur.rowcount > 0

    def delete_account(self, id: int) -> bool:
        sql = "DELETE FROM accounts WHERE id = %s"
        with db.cursor() as cur:
            try:
                cur.execute(sql, (id,))
            except Exception as e:
                db.rollback()
                raise DBException from e
            else:
                db.commit()
                return cur.rowcount > 0
