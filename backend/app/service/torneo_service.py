from app.model.torneo import Torneo  # modello torneo
from app.repository.torneo_repository import TorneoRepository  # accesso al database

class TorneoService:

    def __init__(self):
        self.torneo_repository = TorneoRepository()  # crea il collegamento al repository

    def get_tornei(self) -> list[Torneo]:  # restituisce tutti i tornei
        return self.torneo_repository.get_tornei()

    def get_torneo_by_id(self, id: int) -> Torneo:  # restituisce un torneo per id
        return self.torneo_repository.get_torneo_by_id(id)

    def create_torneo(self, torneo: Torneo) -> int:  # crea un nuovo torneo, ritorna l'id
        return self.torneo_repository.create_torneo(torneo)

    def update_torneo(self, torneo: Torneo) -> bool:  # aggiorna un torneo, ritorna true se trovato
        return self.torneo_repository.update_torneo(torneo)

    def delete_torneo(self, id: int) -> bool:  # elimina un torneo, ritorna true se trovato
        return self.torneo_repository.delete_torneo(id)
