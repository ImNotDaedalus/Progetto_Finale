from __future__ import annotations


class Squadra:
    def __init__(self, id, nome, id_proprietario):
        self.id = id
        self.nome = nome
        self.id_proprietario = id_proprietario

    @staticmethod
    def from_dict(squadra_dict: dict) -> Squadra:
        return Squadra(
            id=squadra_dict.get("id"),
            nome=squadra_dict.get("nome"),
            id_proprietario=squadra_dict.get("id_proprietario"),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "id_proprietario": self.id_proprietario,
        }
