import os
import threading
from pathlib import Path

from dotenv import load_dotenv
from mysql.connector import Error, connect

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _db_config() -> dict[str, str | int]:
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", "root"),
        "database": os.getenv("DB_NAME", "appdb"),
    }


class DatabaseProxy:
    def __init__(self):
        self._local = threading.local()

    def _set_connection(self, connection):
        self._local.connection = connection

    def _current_connection(self):
        return getattr(self._local, "connection", None)

    def _connect(self):
        connection = connect(**_db_config())
        self._set_connection(connection)
        return connection

    def get_connection(self):
        connection = self._current_connection()

        if connection is None:
            return self._connect()

        try:
            connection.ping(reconnect=True, attempts=1, delay=0)
        except Error:
            self.close()
            return self._connect()

        return connection

    def cursor(self, *args, **kwargs):
        kwargs.setdefault("buffered", True)
        return self.get_connection().cursor(*args, **kwargs)

    def commit(self):
        connection = self._current_connection()
        if connection is not None:
            connection.commit()

    def rollback(self):
        connection = self._current_connection()
        if connection is not None and getattr(connection, "in_transaction", False):
            connection.rollback()

    def close(self):
        connection = self._current_connection()
        if connection is not None and connection.is_connected():
            connection.close()
        if hasattr(self._local, "connection"):
            del self._local.connection


db = DatabaseProxy()


def create_tables() -> bool:
    try:
        connection = db.get_connection()
    except Error as exc:
        print(f"Database non raggiungibile, salto la creazione tabelle: {exc}")
        return False

    with connection.cursor() as cur:
        cur.execute("SHOW TABLES")
        tables = cur.fetchall()
        table_names = [t[0] for t in tables]

        cur.execute("SET FOREIGN_KEY_CHECKS = 0")

        if "accounts" not in table_names:
            print("Creating table accounts")
            cur.execute(
                """
                CREATE TABLE accounts (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    nome VARCHAR(45) NOT NULL,
                    cognome VARCHAR(45) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    nazionalita VARCHAR(45) NOT NULL,
                    data_nascita DATE NOT NULL,
                    sesso VARCHAR(45) NOT NULL,
                    indirizzo VARCHAR(45) NOT NULL,
                    id_squadra INT NULL,
                    CONSTRAINT fk_squadra_id
                        FOREIGN KEY (id_squadra)
                        REFERENCES squadre(id)
                )
                """
            )
            connection.commit()

        if "squadre" not in table_names:
            print("Creating table squadre")
            cur.execute(
                """
                CREATE TABLE squadre (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    nome VARCHAR(45) NOT NULL,
                    id_proprietario INT NOT NULL,
                    CONSTRAINT fk_account_id
                        FOREIGN KEY (id_proprietario)
                        REFERENCES accounts(id)
                )
                """
            )
            connection.commit()

        if "tornei" not in table_names:
            print("Creating table tornei")
            cur.execute(
                """
                CREATE TABLE tornei (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    nome VARCHAR(45) NOT NULL,
                    data_inizio DATE NOT NULL,
                    data_fine DATE NOT NULL,
                    luogo VARCHAR(45) NOT NULL,
                    divisione VARCHAR(50) NOT NULL,
                    id_proprietario INT NOT NULL,
                    CONSTRAINT CHK_Divisione CHECK (divisione IN (
                        'A1',
                        'A2',
                        'B',
                        'C'
                    )),
                    CONSTRAINT fk_torneo_proprietario
                        FOREIGN KEY (id_proprietario)
                        REFERENCES accounts(id)
                )
                """
            )
            connection.commit()

        if "torneoSquadre" not in table_names:
            print("Creating table torneoSquadre")
            cur.execute(
                """
                CREATE TABLE torneoSquadre (
                    id_torneo INT NOT NULL,
                    id_squadra INT NOT NULL,
                    PRIMARY KEY (id_torneo, id_squadra),
                    CONSTRAINT fk_tt_torneo
                        FOREIGN KEY (id_torneo)
                        REFERENCES tornei(id)
                        ON DELETE CASCADE,
                    CONSTRAINT fk_tt_squadra
                        FOREIGN KEY (id_squadra)
                        REFERENCES squadre(id)
                )
                """
            )
            connection.commit()

        if "gara" not in table_names:
            print("Creating table gara")
            cur.execute(
                """
                CREATE TABLE gara (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    data DATE NOT NULL,
                    ora TIME NOT NULL,
                    id_torneo INT,
                    id_gara_precedente INT,
                    CONSTRAINT fk_torneo_id
                        FOREIGN KEY (id_torneo)
                        REFERENCES tornei(id)
                        ON DELETE CASCADE,
                    CONSTRAINT fk_gara_id
                        FOREIGN KEY (id_gara_precedente)
                        REFERENCES gara(id)
                )
                """
            )
            connection.commit()

        cur.execute("SET FOREIGN_KEY_CHECKS = 1")

    return True
