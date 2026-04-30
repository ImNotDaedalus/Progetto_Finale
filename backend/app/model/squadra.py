# =============================================================================
# MODELLO "SQUADRA" - rappresenta una squadra.
#
# Una squadra ha solo tre informazioni: un id (numero), un nome, e l'id
# dell'utente che l'ha creata (proprietario/allenatore).
# =============================================================================

from __future__ import annotations


class Squadra:
    def __init__(self, id, nome, id_proprietario):
        self.id = id
        self.nome = nome
        self.id_proprietario = id_proprietario  # chi è il "capo" della squadra

    @staticmethod
    def from_dict(squadra_dict: dict) -> Squadra:
        """Crea una Squadra a partire da un dizionario (chiave-valore)."""
        return Squadra(
            id=squadra_dict.get("id"),
            nome=squadra_dict.get("nome"),
            id_proprietario=squadra_dict.get("id_proprietario"),
        )

    def to_dict(self) -> dict:
        """Restituisce la squadra come dizionario, pronto per essere inviato al frontend."""
        return {
            "id": self.id,
            "nome": self.nome,
            "id_proprietario": self.id_proprietario,
        }
