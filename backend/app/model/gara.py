# =============================================================================
# MODELLO "GARA" - rappresenta una partita.
#
# Una gara ha una data, un'ora, è collegata a un torneo, e può essere collegata
# a una gara precedente (es. la finale "viene da" due semifinali in un tabellone).
# =============================================================================

from __future__ import annotations


class Gara:
    def __init__(self, id, data, ora, id_torneo, id_gara_precedente):
        # Riempie le caselle dell'oggetto con i dati della partita.
        self.id = id
        self.data = data
        self.ora = ora
        self.id_torneo = id_torneo                  # a quale torneo appartiene la gara
        self.id_gara_precedente = id_gara_precedente  # da quale partita "deriva" (utile per i tabelloni a eliminazione)

    @staticmethod
    def from_dict(gara_dict: dict) -> Gara:
        """Costruisce una Gara partendo da un dizionario (es. dati arrivati dal frontend)."""
        return Gara(
            id=gara_dict.get("id"),
            data=gara_dict.get("data"),
            ora=gara_dict.get("ora"),
            id_torneo=gara_dict.get("id_torneo"),
            id_gara_precedente=gara_dict.get("id_gara_precedente"),
        )

    def to_dict(self) -> dict:
        """Restituisce la gara in formato dizionario, pronto per essere inviato come risposta."""
        return {
            "id": self.id,
            # La data viene trasformata in testo se è un oggetto data; idem per l'ora.
            "data": self.data.isoformat() if hasattr(self.data, "isoformat") else self.data,
            "ora": str(self.ora) if self.ora is not None else None,
            "id_torneo": self.id_torneo,
            "id_gara_precedente": self.id_gara_precedente,
        }
