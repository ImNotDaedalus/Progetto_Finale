# =============================================================================
# MODELLO "TORNEO" - rappresenta un torneo di pallanuoto.
#
# Un torneo ha: nome, date (inizio/fine), luogo dove si svolge, divisione
# (es. A1, B...) e il proprietario (chi l'ha organizzato).
# =============================================================================

from __future__ import annotations


class Torneo:
    def __init__(self, id, nome, data_inizio, data_fine, luogo, divisione, id_proprietario):
        # Tutti i dati del torneo vengono salvati nelle caselle dell'oggetto.
        self.id = id
        self.nome = nome
        self.data_inizio = data_inizio
        self.data_fine = data_fine
        self.luogo = luogo
        self.divisione = divisione                # es. "A1", "B", ecc.
        self.id_proprietario = id_proprietario    # chi ha creato il torneo

    @staticmethod
    def from_dict(torneo_dict: dict) -> Torneo:
        """Crea un Torneo a partire da un dizionario (es. ricevuto dal frontend)."""
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
        """Trasforma una data Python in testo (formato 'AAAA-MM-GG') se possibile,
        altrimenti la lascia com'è. Serve per spedire le date come testo nei JSON."""
        return value.isoformat() if hasattr(value, "isoformat") else value

    def to_dict(self) -> dict:
        """Restituisce il torneo come dizionario pronto da inviare al frontend."""
        return {
            "id": self.id,
            "nome": self.nome,
            "data_inizio": self._serialize_date(self.data_inizio),
            "data_fine": self._serialize_date(self.data_fine),
            "luogo": self.luogo,
            "divisione": self.divisione,
            "id_proprietario": self.id_proprietario,
        }
