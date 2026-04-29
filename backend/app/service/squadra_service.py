from app.model.squadra import Squadra  # modello squadra
from app.repository.squadra_repository import SquadraRepository  # accesso al database

class SquadraService:

    def __init__(self):
        self.squadra_repository = SquadraRepository()  # crea il collegamento al repository

    def get_squadre(self) -> list[Squadra]:  # restituisce tutte le squadre
        return self.squadra_repository.get_squadre()

    def get_squadra_by_id(self, id: int) -> Squadra:  # restituisce una squadra per id
        return self.squadra_repository.get_squadra_by_id(id)

    def create_squadra(self, squadra: Squadra) -> int:  # crea una nuova squadra, ritorna l'id
        return self.squadra_repository.create_squadra(squadra)

    def update_squadra(self, squadra: Squadra) -> bool:  # aggiorna una squadra, ritorna true se trovata
        return self.squadra_repository.update_squadra(squadra)

    def delete_squadra(self, id: int) -> bool:  # elimina una squadra, ritorna true se trovata
        return self.squadra_repository.delete_squadra(id)
