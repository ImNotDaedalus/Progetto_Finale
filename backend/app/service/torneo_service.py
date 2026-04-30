# =============================================================================
# SERVICE TORNEO - intermediario tra controller e repository per i tornei.
# =============================================================================

from app.model.torneo import Torneo                              # modello torneo
from app.repository.torneo_repository import TorneoRepository    # accesso al database

class TorneoService:

    def __init__(self):
        self.torneo_repository = TorneoRepository()  # crea il collegamento al repository

    def get_tornei(self) -> list[Torneo]:
        """Restituisce tutti i tornei."""
        return self.torneo_repository.get_tornei()

    def get_torneo_by_id(self, id: int) -> Torneo:
        """Restituisce un torneo dato il suo id."""
        return self.torneo_repository.get_torneo_by_id(id)

    def create_torneo(self, torneo: Torneo) -> int:
        """Crea un nuovo torneo e ritorna l'id assegnato."""
        return self.torneo_repository.create_torneo(torneo)

    def update_torneo(self, torneo: Torneo) -> bool:
        """Aggiorna un torneo esistente; True se trovato e modificato."""
        return self.torneo_repository.update_torneo(torneo)

    def delete_torneo(self, id: int) -> bool:
        """Elimina un torneo; True se trovato e cancellato."""
        return self.torneo_repository.delete_torneo(id)
