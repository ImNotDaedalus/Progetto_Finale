from app.model.gara import Gara
from app.utils.db import db
from app.utils.exceptions import DBException


class GaraRepository:

    def get_gare(self) -> list[Gara]:
        sql = "SELECT id, data, ora, id_torneo, id_gara_precedente FROM gara"
        with db.cursor() as cur:
            cur.execute(sql)
            return [
                Gara(
                    id=row[0], data=row[1], ora=row[2],
                    id_torneo=row[3], id_gara_precedente=row[4],
                )
                for row in cur.fetchall()
            ]

    def get_gara_by_id(self, id: int) -> Gara:
        sql = "SELECT id, data, ora, id_torneo, id_gara_precedente FROM gara WHERE id = %s"
        with db.cursor() as cur:
            cur.execute(sql, (id,))
            row = cur.fetchone()
            if row is None:
                return None
            return Gara(
                id=row[0], data=row[1], ora=row[2],
                id_torneo=row[3], id_gara_precedente=row[4],
            )

    def create_gara(self, gara: Gara) -> int:
        sql = """
            INSERT INTO gara (data, ora, id_torneo, id_gara_precedente)
            VALUES (%s, %s, %s, %s)
        """
        params = (gara.data, gara.ora, gara.id_torneo, gara.id_gara_precedente)
        with db.cursor() as cur:
            try:
                cur.execute(sql, params)
            except Exception as e:
                db.rollback()
                raise DBException from e
            else:
                db.commit()
                return cur.lastrowid

    def update_gara(self, gara: Gara) -> bool:
        sql = """
            UPDATE gara
            SET data = %s, ora = %s, id_torneo = %s, id_gara_precedente = %s
            WHERE id = %s
        """
        params = (
            gara.data, gara.ora, gara.id_torneo,
            gara.id_gara_precedente, gara.id,
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

    def delete_gara(self, id: int) -> bool:
        sql = "DELETE FROM gara WHERE id = %s"
        with db.cursor() as cur:
            try:
                cur.execute(sql, (id,))
            except Exception as e:
                db.rollback()
                raise DBException from e
            else:
                db.commit()
                return cur.rowcount > 0
