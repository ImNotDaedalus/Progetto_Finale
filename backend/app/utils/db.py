# =============================================================================
# CONNESSIONE AL DATABASE E CREAZIONE DELLE TABELLE
#
# Cos'è un database? È un grande archivio digitale. Immagina un grosso
# schedario con tanti cassetti: ogni cassetto è una "tabella" (es. "accounts",
# "squadre", "tornei") e dentro ogni cassetto ci sono schede con i dati
# (es. tutti i giocatori, una scheda per ogni giocatore).
#
# Questo file fa due cose:
# 1. Gestisce il "telefono" per parlare con il database (come prendere la
#    cornetta, evitare che cada la linea, riagganciare quando finisci).
# 2. Crea le tabelle (i cassetti) se non esistono già, la prima volta che
#    si avvia l'applicazione.
# =============================================================================

import os                              # per leggere le variabili di sistema
import threading                       # serve per gestire più "telefonate" contemporanee al database in modo separato
from pathlib import Path               # gestione percorsi cartelle

from dotenv import load_dotenv         # legge il file .env con le credenziali
from mysql.connector import Error, connect  # libreria per parlare con MySQL

# Carica le impostazioni dal file .env (un file segreto fuori dal codice
# dove si scrive: utente, password del database, ecc.). Così non scriviamo
# password sensibili dentro il codice condiviso.
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _db_config() -> dict[str, str | int]:
    """Raccoglie tutte le impostazioni necessarie per collegarsi al database.
    Se non sono indicate, usa dei valori di default (utili in fase di sviluppo)."""
    return {
        "host": os.getenv("DB_HOST", "localhost"),       # dove sta il database
        "port": int(os.getenv("DB_PORT", "3306")),       # la "porta" da cui entrare (3306 = standard di MySQL)
        "user": os.getenv("DB_USER", "root"),            # nome utente per accedere
        "password": os.getenv("DB_PASSWORD", "root"),    # password
        "database": os.getenv("DB_NAME", "appdb"),       # nome del database vero e proprio
    }


class DatabaseProxy:
    """Una specie di "centralino" che gestisce la connessione al database.
    Ogni "thread" (richiesta in arrivo) ha la sua linea telefonica privata,
    così due richieste contemporanee non si mischiano i dati."""

    def __init__(self):
        # threading.local() crea un cassetto privato per ogni thread.
        self._local = threading.local()

    def _set_connection(self, connection):
        # Salva la connessione nel cassetto privato del thread corrente.
        self._local.connection = connection

    def _current_connection(self):
        # Restituisce la connessione del thread corrente, o None se non c'è.
        return getattr(self._local, "connection", None)

    def _connect(self):
        # Apre una nuova connessione al database e la salva.
        connection = connect(**_db_config())
        self._set_connection(connection)
        return connection

    def get_connection(self):
        """Restituisce la connessione al database, aprendone una nuova se serve."""
        connection = self._current_connection()

        if connection is None:
            # Non c'è ancora nessuna connessione: ne creo una.
            return self._connect()

        try:
            # Se la connessione esiste, controlla che sia ancora "viva"
            # (come un "pronto?" al telefono per vedere se l'altro è ancora lì).
            connection.ping(reconnect=True, attempts=1, delay=0)
        except Error:
            # Se la linea è caduta, chiude e ne apre una nuova.
            self.close()
            return self._connect()

        return connection

    def cursor(self, *args, **kwargs):
        """Restituisce un "cursore", cioè uno strumento con cui scrivere
        comandi SQL e leggere i risultati. È come la matita per scrivere
        sull'agenda dell'archivio."""
        kwargs.setdefault("buffered", True)  # "buffered" = leggi tutto il risultato in una volta
        return self.get_connection().cursor(*args, **kwargs)

    def commit(self):
        """Conferma le modifiche fatte al database. Come premere "salva"
        dopo aver scritto sul documento."""
        connection = self._current_connection()
        if connection is not None:
            connection.commit()

    def rollback(self):
        """Annulla le modifiche fatte (se non sono ancora state salvate).
        Come premere "annulla" prima di salvare un documento."""
        connection = self._current_connection()
        if connection is not None and getattr(connection, "in_transaction", False):
            connection.rollback()

    def close(self):
        """Chiude la connessione al database e libera il cassetto del thread."""
        connection = self._current_connection()
        if connection is not None and connection.is_connected():
            connection.close()
        if hasattr(self._local, "connection"):
            del self._local.connection


# "db" è l'oggetto unico che il resto dell'applicazione usa per parlare
# col database. Si scrive db.cursor(), db.commit(), ecc.
db = DatabaseProxy()


def create_tables() -> bool:
    """All'avvio dell'app crea le tabelle nel database (se mancano).
    Pensa a questo come "stampare i moduli prima di aprire l'ufficio"."""
    try:
        connection = db.get_connection()
    except Error as exc:
        # Se il database non risponde non blocchiamo l'app: stampa l'errore
        # e va avanti (utile per testare il codice senza un database vero).
        print(f"Database non raggiungibile, salto la creazione tabelle: {exc}")
        return False

    with connection.cursor() as cur:
        # Chiede al database l'elenco delle tabelle che già esistono.
        cur.execute("SHOW TABLES")
        tables = cur.fetchall()
        table_names = [t[0] for t in tables]

        # Disabilita temporaneamente il controllo sui collegamenti tra tabelle
        # (le "chiavi esterne") per poter creare le tabelle in qualsiasi ordine.
        cur.execute("SET FOREIGN_KEY_CHECKS = 0")

        # ---- Tabella ACCOUNTS: contiene tutti gli utenti registrati. ----
        if "accounts" not in table_names:
            print("Creating table accounts")
            cur.execute(
                """
                CREATE TABLE accounts (
                    id INT PRIMARY KEY AUTO_INCREMENT,           -- numero univoco assegnato in automatico
                    nome VARCHAR(45) NOT NULL,
                    cognome VARCHAR(45) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,          -- l'email non si può ripetere
                    password VARCHAR(255) NOT NULL,
                    nazionalita VARCHAR(45) NOT NULL,
                    data_nascita DATE NOT NULL,
                    sesso VARCHAR(45) NOT NULL,
                    indirizzo VARCHAR(45) NOT NULL,
                    id_squadra INT NULL,                         -- a quale squadra appartiene (può anche essere a nessuna)
                    CONSTRAINT fk_squadra_id
                        FOREIGN KEY (id_squadra)
                        REFERENCES squadre(id)                   -- collegamento alla tabella squadre
                )
                """
            )
            connection.commit()

        # ---- Tabella SQUADRE: una squadra ha un nome e un proprietario. ----
        if "squadre" not in table_names:
            print("Creating table squadre")
            cur.execute(
                """
                CREATE TABLE squadre (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    nome VARCHAR(45) NOT NULL,
                    id_proprietario INT NOT NULL,                -- chi ha creato la squadra
                    CONSTRAINT fk_account_id
                        FOREIGN KEY (id_proprietario)
                        REFERENCES accounts(id)
                )
                """
            )
            connection.commit()

        # ---- Tabella TORNEI: i tornei creati dagli utenti. ----
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
                    -- la divisione può essere SOLO uno di questi 4 valori (controllo automatico)
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

        # ---- Tabella PONTE torneoSquadre: dice quali squadre partecipano a quale torneo. ----
        # Una squadra può essere in più tornei e un torneo ha più squadre, quindi
        # serve una tabella separata per memorizzare queste coppie.
        if "torneoSquadre" not in table_names:
            print("Creating table torneoSquadre")
            cur.execute(
                """
                CREATE TABLE torneoSquadre (
                    id_torneo INT NOT NULL,
                    id_squadra INT NOT NULL,
                    PRIMARY KEY (id_torneo, id_squadra),         -- ogni coppia può comparire una volta sola
                    CONSTRAINT fk_tt_torneo
                        FOREIGN KEY (id_torneo)
                        REFERENCES tornei(id)
                        ON DELETE CASCADE,                       -- se cancello un torneo, sparisce anche dall'elenco
                    CONSTRAINT fk_tt_squadra
                        FOREIGN KEY (id_squadra)
                        REFERENCES squadre(id)
                )
                """
            )
            connection.commit()

        # ---- Tabella GARA: le partite, ognuna legata a un torneo. ----
        if "gara" not in table_names:
            print("Creating table gara")
            cur.execute(
                """
                CREATE TABLE gara (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    data DATE NOT NULL,
                    ora TIME NOT NULL,
                    id_torneo INT,
                    id_gara_precedente INT,                      -- per costruire un albero (es. quarti -> semifinale)
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

        # Riabilita i controlli sulle chiavi esterne.
        cur.execute("SET FOREIGN_KEY_CHECKS = 1")

    return True
