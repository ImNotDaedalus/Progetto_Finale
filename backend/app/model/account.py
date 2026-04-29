from __future__ import annotations


class Account:
    def __init__(self, id, nome, cognome, email, password, nazionalita,
                 data_nascita=None, sesso=None, indirizzo=None,
                 id_squadra=None):
        self.id = id
        self.nome = nome
        self.cognome = cognome
        self.email = email
        self.password = password
        self.nazionalita = nazionalita
        self.data_nascita = data_nascita
        self.sesso = sesso
        self.indirizzo = indirizzo
        self.id_squadra = id_squadra

    @staticmethod
    def from_dict(data: dict) -> Account:
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
        return {
            "id": self.id,
            "nome": self.nome,
            "cognome": self.cognome,
            "email": self.email,
            "nazionalita": self.nazionalita,
            "data_nascita": self.data_nascita.isoformat() if hasattr(self.data_nascita, "isoformat") else self.data_nascita,
            "sesso": self.sesso,
            "indirizzo": self.indirizzo,
            "id_squadra": self.id_squadra,
        }
