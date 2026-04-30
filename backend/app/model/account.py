# =============================================================================
# MODELLO "ACCOUNT" - rappresenta un utente registrato.
#
# Cos'è un "modello"? È lo "stampino" di un dato del nostro sito.
# Pensa a un foglio prestampato: ogni Account ha sempre gli stessi campi
# (nome, cognome, email...) anche se le persone sono diverse. Questa classe
# definisce com'è fatto questo foglio.
# =============================================================================

from __future__ import annotations  # piccola magia tecnica per usare il nome "Account" dentro Account stesso


class Account:
    def __init__(self, id, nome, cognome, email, password, nazionalita,
                 data_nascita=None, sesso=None, indirizzo=None,
                 id_squadra=None):
        # Il "costruttore" prende i dati e li mette nelle caselle dell'oggetto.
        # È come riempire un modulo prestampato.
        self.id = id                        # numero univoco (lo dà il database)
        self.nome = nome
        self.cognome = cognome
        self.email = email
        self.password = password
        self.nazionalita = nazionalita
        self.data_nascita = data_nascita
        self.sesso = sesso
        self.indirizzo = indirizzo
        self.id_squadra = id_squadra        # se l'utente fa parte di una squadra, qui c'è il numero della squadra

    @staticmethod
    def from_dict(data: dict) -> Account:
        """Crea un Account a partire da un dizionario (un sacchetto chiave-valore).
        Comodo perché i dati arrivano dal frontend così: {"nome": "Mario", ...}."""
        return Account(
            id=data.get("id"),
            nome=data.get("nome"),
            cognome=data.get("cognome"),
            email=data.get("email"),
            password=data.get("password"),
            nazionalita=data.get("nazionalita"),
            data_nascita=data.get("data_nascita"),
            sesso=data.get("sesso"),
            indirizzo=data.get("indirizzo"),
            id_squadra=data.get("id_squadra"),
        )

    def to_dict(self) -> dict:
        """Trasforma l'Account in un dizionario, pronto da spedire come risposta
        al frontend. NOTA: la password NON viene inclusa, per sicurezza."""
        return {
            "id": self.id,
            "nome": self.nome,
            "cognome": self.cognome,
            "email": self.email,
            "nazionalita": self.nazionalita,
            # Se data_nascita è una "data" vera (oggetto Python), la trasformiamo in testo
            # nel formato AAAA-MM-GG (es. "2000-05-12"), altrimenti la lasciamo com'è.
            "data_nascita": self.data_nascita.isoformat() if hasattr(self.data_nascita, "isoformat") else self.data_nascita,
            "sesso": self.sesso,
            "indirizzo": self.indirizzo,
            "id_squadra": self.id_squadra,
        }
