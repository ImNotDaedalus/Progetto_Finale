# =============================================================================
# REPOSITORY ACCOUNT - chi parla davvero col database per gli account.
#
# Cosa fa un "repository"? È il bibliotecario dell'archivio: tu gli chiedi
# "dammi l'account numero 5" e lui apre il cassetto giusto, prende la scheda,
# la traduce in un oggetto Python e te la restituisce. Allo stesso modo
# salva, aggiorna o cancella le schede.
# =============================================================================

from app.model.account import Account
from app.utils.db import db
from app.utils.exceptions import DBException


# Elenco delle "colonne" della tabella accounts. Le scriviamo una sola volta
# qui per non doverle ripetere in ogni query.
_COLUMNS = (
    "id, nome, cognome, email, password, nazionalita, "
    "data_nascita, sesso, indirizzo, id_squadra"
)


def _row_to_account(row) -> Account:
    """Trasforma una riga del database (una tupla, cioè una lista ordinata di
    valori) in un oggetto Account. È come tradurre una scheda di carta in un
    foglio elettronico."""
    return Account(
        id=row[0], nome=row[1], cognome=row[2],
        email=row[3], password=row[4], nazionalita=row[5],
        data_nascita=row[6], sesso=row[7],
        indirizzo=row[8], id_squadra=row[9],
    )


class AccountRepository:

    def get_accounts(self) -> list[Account]:
        """Restituisce TUTTI gli account presenti nel database."""
        sql = f"SELECT {_COLUMNS} FROM accounts"   # comando SQL: "prendi queste colonne dalla tabella accounts"
        with db.cursor() as cur:                    # apre il cursore (la "matita") e lo chiude in automatico alla fine
            cur.execute(sql)
            # fetchall() = "prendi tutte le righe del risultato"
            return [_row_to_account(row) for row in cur.fetchall()]

    def get_account_by_id(self, id: int) -> Account:
        """Restituisce l'account con l'id richiesto (o None se non esiste)."""
        # %s = "qui ci va un valore", che passiamo dopo nella tupla: serve a
        # evitare attacchi di tipo "SQL injection".
        sql = f"SELECT {_COLUMNS} FROM accounts WHERE id = %s"
        with db.cursor() as cur:
            cur.execute(sql, (id,))
            row = cur.fetchone()                    # fetchone = "prendi solo la prima riga"
            if row is None:
                return None                         # non c'è nessun account con quell'id
            return _row_to_account(row)

    def get_account_by_email_and_password(self, email: str, password: str) -> Account:
        """Cerca un account che abbia ESATTAMENTE quella email e quella password.
        Si usa per il login: se torna None, le credenziali sono sbagliate."""
        sql = f"SELECT {_COLUMNS} FROM accounts WHERE email = %s AND password = %s"
        with db.cursor() as cur:
            cur.execute(sql, (email, password))
            row = cur.fetchone()
            if row is None:
                return None
            return _row_to_account(row)

    def create_account(self, account: Account) -> int:
        """Aggiunge un nuovo account al database. Restituisce l'id assegnato in automatico."""
        # INSERT INTO ... VALUES ... = "aggiungi una nuova riga con questi valori".
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
                # Se va male qualcosa (es. email duplicata), annulla la modifica
                # e segnala l'errore lanciando una nostra eccezione.
                db.rollback()
                raise DBException(str(e)) from e
            else:
                db.commit()                         # conferma il salvataggio
                return cur.lastrowid                # l'id assegnato in automatico al nuovo account

    def update_account(self, account: Account) -> bool:
        """Aggiorna i dati di un account esistente. Ritorna True se trovato e modificato."""
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
                # rowcount = "quante righe sono state modificate?". Se è 0,
                # vuol dire che l'id non esisteva.
                return cur.rowcount > 0

    def delete_account(self, id: int) -> bool:
        """Elimina l'account con l'id richiesto. Ritorna True se è stato trovato e cancellato."""
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
