from __future__ import annotations


class Gara:
    def __init__(self, id, data, ora, id_torneo, id_gara_precedente):
        self.id = id
        self.data = data
        self.ora = ora
        self.id_torneo = id_torneo
        self.id_gara_precedente = id_gara_precedente

    @staticmethod
    def from_dict(gara_dict: dict) -> Gara:
        return Gara(
            id=gara_dict.get("id"),
            data=gara_dict.get("data"),
            ora=gara_dict.get("ora"),
            id_torneo=gara_dict.get("id_torneo"),
            id_gara_precedente=gara_dict.get("id_gara_precedente"),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "data": self.data.isoformat() if hasattr(self.data, "isoformat") else self.data,
            "ora": str(self.ora) if self.ora is not None else None,
            "id_torneo": self.id_torneo,
            "id_gara_precedente": self.id_gara_precedente,
        }
