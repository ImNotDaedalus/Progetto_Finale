# =============================================================================
# SERVICE SQUADRA - intermediario tra controller e repository per le squadre.
# =============================================================================

from app.model.squadra import Squadra                              # modello squadra
from app.repository.squadra_repository import SquadraRepository    # accesso al database

class SquadraService:

    def __init__(self):
        self.squadra_repository = SquadraRepository()  # crea il collegamento al repository

    def get_squadre(self) -> list[Squadra]:
        """Restituisce tutte le squadre."""
        return self.squadra_repository.get_squadre()

    def get_squadra_by_id(self, id: int) -> Squadra:
        """Restituisce una squadra dato il suo id."""
        return self.squadra_repository.get_squadra_by_id(id)

    def create_squadra(self, squadra: Squadra) -> int:
        """Crea una nuova squadra e ritorna l'id assegnato."""
        return self.squadra_repository.create_squadra(squadra)

    def update_squadra(self, squadra: Squadra) -> bool:
        """Aggiorna una squadra esistente; True se trovata e modificata."""
        return self.squadra_repository.update_squadra(squadra)

    def delete_squadra(self, id: int) -> bool:
        """Elimina una squadra; True se trovata e cancellata."""
        return self.squadra_repository.delete_squadra(id)
