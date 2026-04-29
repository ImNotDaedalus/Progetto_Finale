from __future__ import annotations


class Torneo:
    def __init__(self, id, nome, data_inizio, data_fine, luogo, divisione, id_proprietario):
        self.id = id
        self.nome = nome
        self.data_inizio = data_inizio
        self.data_fine = data_fine
        self.luogo = luogo
        self.divisione = divisione
        self.id_proprietario = id_proprietario

    @staticmethod
    def from_dict(torneo_dict: dict) -> Torneo:
        return Torneo(
            id=torneo_dict.get("id"),
            nome=torneo_dict.get("nome"),
            data_inizio=torneo_dict.get("data_inizio"),
            data_fine=torneo_dict.get("data_fine"),
            luogo=torneo_dict.get("luogo"),
            divisione=torneo_dict.get("divisione"),
            id_proprietario=torneo_dict.get("id_proprietario"),
        )

    @staticmethod
    def _serialize_date(value):
        return value.isoformat() if hasattr(value, "isoformat") else value

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "data_inizio": self._serialize_date(self.data_inizio),
            "data_fine": self._serialize_date(self.data_fine),
            "luogo": self.luogo,
            "divisione": self.divisione,
            "id_proprietario": self.id_proprietario,
        }
