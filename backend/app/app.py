# =============================================================================
# FILE PRINCIPALE DEL "BACKEND" (il programma che gira sul server).
#
# Cos'è il backend? Immagina il sito come un ristorante: il frontend (la pagina
# web) è la sala dove si siedono i clienti; il backend è la cucina dove si
# prepara tutto. Quando il cliente ordina (clicca un pulsante), il cameriere
# (la rete) porta l'ordine in cucina, la cucina prepara il piatto e lo
# rimanda in sala. Questo file è "l'apertura del ristorante": prepara la
# cucina, accende le luci e dice quali piatti si possono ordinare.
# =============================================================================

import os                              # serve a leggere le impostazioni di sistema (es. password salvate fuori dal codice)
import sys                             # gestisce informazioni di base sul programma in esecuzione
from pathlib import Path               # serve a lavorare con i percorsi delle cartelle in modo sicuro

from flask import Flask, jsonify       # Flask è il "motore" che fa funzionare il server web
from flask_jwt_extended import JWTManager  # JWT = "tessera digitale" che dimostra che sei loggato

# Se questo file viene avviato direttamente (e non importato da un altro),
# aggiunge la cartella superiore alla lista dei posti dove cercare i file:
# è un trucco per far funzionare gli import indipendentemente da dove parte il programma.
if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Importiamo i "controller", cioè le persone-impiegate che rispondono alle
# richieste su account, gare, squadre, tornei.
from app.controller.account_controller import account_controller
from app.controller.gara_controller import gara_controller
from app.controller.squadra_controller import squadra_controller
from app.controller.torneo_controller import torneo_controller
# E lo "strumento" che parla col database (l'archivio dove salviamo i dati).
from app.utils.db import create_tables, db


def create_app():
    """Costruisce e prepara l'applicazione web. È come allestire il negozio
    prima di aprirlo al pubblico."""
    app = Flask(__name__)  # crea l'applicazione vuota

    # La "chiave segreta" serve a firmare le tessere JWT degli utenti loggati,
    # così nessuno le può falsificare. La leggiamo dalle variabili d'ambiente
    # (un posto sicuro fuori dal codice); se non c'è, usa "root" di default.
    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY",
        "root",
    )
    JWTManager(app)  # attiva il sistema delle tessere JWT

    # Definiamo una pagina "home" semplice: chi visita / riceve un messaggio
    # che dice "il server è online". Utile per controllare se funziona.
    @app.route("/")
    def home():
        return jsonify({"message": "API Nuoto è online!", "status": "OK"}), 200

    # Quando finiamo di rispondere a una richiesta, chiudiamo la connessione
    # al database (è come chiudere il libro dopo aver letto la pagina, per
    # non lasciarlo aperto e occupare spazio).
    @app.teardown_appcontext
    def close_db_connection(_exception):
        db.close()

    # Colleghiamo i quattro gruppi di "indirizzi web" all'applicazione.
    # Esempio: tutto quello che inizia con /account è gestito da account_controller.
    app.register_blueprint(account_controller, url_prefix="/account")
    app.register_blueprint(squadra_controller, url_prefix="/squadra")
    app.register_blueprint(torneo_controller, url_prefix="/torneo")
    app.register_blueprint(gara_controller, url_prefix="/gara")

    create_tables()  # all'avvio creiamo le tabelle del database se non ci sono già
    return app


# Crea davvero l'app: questa è la variabile che il server userà.
app = create_app()


# Se questo file viene eseguito direttamente da terminale (non importato),
# avvia il server vero e proprio. Le impostazioni (porta, host, debug) si
# leggono dalle variabili d'ambiente con valori di default sensati.
if __name__ == "__main__":
    app.run(
        debug=os.getenv("FLASK_DEBUG", "true").lower() == "true",
        host=os.getenv("FLASK_HOST", "localhost"),
        port=int(os.getenv("FLASK_PORT", "5000")),
    )
