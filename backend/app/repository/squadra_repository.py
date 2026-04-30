# =============================================================================
# REPOSITORY SQUADRA - parla col database per le squadre.
#
# Stessa idea degli altri repository: legge e scrive sulle "tabella squadre"
# del database. Tutto il resto dell'app non sa nulla di SQL, parla solo con
# questo bibliotecario.
# =============================================================================

from app.model.squadra import Squadra
from app.utils.db import db
from app.utils.exceptions import DBException


class SquadraRepository:
    def get_squadre(self) -> list[Squadra]:
        """Restituisce tutte le squadre, in ordine di id."""
        sql = "SELECT id, nome, id_proprietario FROM squadre ORDER BY id"
        with db.cursor() as cur:
            cur.execute(sql)
            return [
                Squadra(id=row[0], nome=row[1], id_proprietario=row[2])
                for row in cur.fetchall()
            ]

    def get_squadra_by_id(self, id: int) -> Squadra:
        """Restituisce la squadra con quell'id, o None se non esiste."""
        sql = "SELECT id, nome, id_proprietario FROM squadre WHERE id = %s"
        with db.cursor() as cur:
            cur.execute(sql, (id,))
            row = cur.fetchone()
            if row is None:
                return None
            return Squadra(id=row[0], nome=row[1], id_proprietario=row[2])

    def create_squadra(self, squadra: Squadra) -> int:
        """Crea una nuova squadra nel database. Restituisce il nuovo id."""
        sql = "INSERT INTO squadre (nome, id_proprietario) VALUES (%s, %s)"
        params = (squadra.nome, squadra.id_proprietario)
        with db.cursor() as cur:
            try:
                cur.execute(sql, params)
            except Exception as e:
                db.rollback()
                raise DBException from e
            else:
                db.commit()
                return cur.lastrowid

    def update_squadra(self, squadra: Squadra) -> bool:
        """Aggiorna una squadra esistente. Ritorna True se trovata e modificata."""
        sql = "UPDATE squadre SET nome = %s, id_proprietario = %s WHERE id = %s"
        params = (
            squadra.nome,
            squadra.id_proprietario,
            squadra.id,
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

    def delete_squadra(self, id: int) -> bool:
        """Elimina la squadra con quell'id. Ritorna True se trovata e cancellata."""
        sql = "DELETE FROM squadre WHERE id = %s"
        with db.cursor() as cur:
            try:
                cur.execute(sql, (id,))
            except Exception as e:
                db.rollback()
                raise DBException from e
            else:
                db.commit()
                return cur.rowcount > 0
