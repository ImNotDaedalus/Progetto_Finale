# =============================================================================
# REPOSITORY TORNEO - parla col database per i tornei.
#
# Funziona come gli altri repository: chi vuole leggere/scrivere un torneo
# nel database lo chiede a questa classe.
# =============================================================================

from app.model.torneo import Torneo
from app.utils.db import db
from app.utils.exceptions import DBException


# Lista delle colonne, scritta una volta sola.
_COLUMNS = "id, nome, data_inizio, data_fine, luogo, divisione, id_proprietario"


def _row_to_torneo(row) -> Torneo:
    """Trasforma una riga del database in un oggetto Torneo."""
    return Torneo(
        id=row[0],
        nome=row[1],
        data_inizio=row[2],
        data_fine=row[3],
        luogo=row[4],
        divisione=row[5],
        id_proprietario=row[6],
    )


class TorneoRepository:
    def get_tornei(self) -> list[Torneo]:
        """Restituisce tutti i tornei, ordinati per data di inizio."""
        sql = f"""
            SELECT {_COLUMNS}
            FROM tornei
            ORDER BY data_inizio, id
        """
        with db.cursor() as cur:
            cur.execute(sql)
            return [_row_to_torneo(row) for row in cur.fetchall()]

    def get_torneo_by_id(self, id: int) -> Torneo:
        """Restituisce il torneo con quell'id, o None se non esiste."""
        sql = f"""
            SELECT {_COLUMNS}
            FROM tornei
            WHERE id = %s
        """
        with db.cursor() as cur:
            cur.execute(sql, (id,))
            row = cur.fetchone()
            if row is None:
                return None
            return _row_to_torneo(row)

    def create_torneo(self, torneo: Torneo) -> int:
        """Crea un nuovo torneo nel database. Restituisce l'id appena assegnato."""
        sql = """
            INSERT INTO tornei
                (nome, data_inizio, data_fine, luogo, divisione, id_proprietario)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (
            torneo.nome,
            torneo.data_inizio,
            torneo.data_fine,
            torneo.luogo,
            torneo.divisione,
            torneo.id_proprietario,
        )
        with db.cursor() as cur:
            try:
                cur.execute(sql, params)
            except Exception as e:
                db.rollback()
                raise DBException from e
            else:
                db.commit()
                return cur.lastrowid

    def update_torneo(self, torneo: Torneo) -> bool:
        """Aggiorna un torneo esistente. NOTA: non si può cambiare il proprietario."""
        sql = """
            UPDATE tornei
            SET nome = %s,
                data_inizio = %s,
                data_fine = %s,
                luogo = %s,
                divisione = %s
            WHERE id = %s
        """
        params = (
            torneo.nome,
            torneo.data_inizio,
            torneo.data_fine,
            torneo.luogo,
            torneo.divisione,
            torneo.id,
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

    def delete_torneo(self, id: int) -> bool:
        """Elimina il torneo con quell'id. Ritorna True se trovato e cancellato."""
        sql = "DELETE FROM tornei WHERE id = %s"
        with db.cursor() as cur:
            try:
                cur.execute(sql, (id,))
            except Exception as e:
                db.rollback()
                raise DBException from e
            else:
                db.commit()
                return cur.rowcount > 0
