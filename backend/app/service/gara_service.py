# =============================================================================
# SERVICE GARA - intermediario tra controller e repository per le gare.
# Per ora si limita a passare le richieste al repository, ma è il posto
# giusto dove aggiungere in futuro eventuali controlli o calcoli.
# =============================================================================

from app.model.gara import Gara                              # modello gara
from app.repository.gara_repository import GaraRepository    # accesso al database

class GaraService:

    def __init__(self):
        self.gara_repository = GaraRepository()  # crea il collegamento al repository

    def get_gare(self) -> list[Gara]:
        """Restituisce tutte le gare."""
        return self.gara_repository.get_gare()

    def get_gara_by_id(self, id: int) -> Gara:
        """Restituisce una gara dato il suo id, o None se non esiste."""
        return self.gara_repository.get_gara_by_id(id)

    def create_gara(self, gara: Gara) -> int:
        """Crea una nuova gara nel database e ritorna l'id assegnato."""
        return self.gara_repository.create_gara(gara)

    def update_gara(self, gara: Gara) -> bool:
        """Aggiorna una gara esistente; True se trovata e modificata."""
        return self.gara_repository.update_gara(gara)

    def delete_gara(self, id: int) -> bool:
        """Elimina una gara; True se trovata e cancellata."""
        return self.gara_repository.delete_gara(id)
