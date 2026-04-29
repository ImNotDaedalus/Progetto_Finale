from app.model.gara import Gara  # modello gara
from app.repository.gara_repository import GaraRepository  # accesso al database

class GaraService:

    def __init__(self):
        self.gara_repository = GaraRepository()  # crea il collegamento al repository

    def get_gare(self) -> list[Gara]:  # restituisce tutte le gare
        return self.gara_repository.get_gare()

    def get_gara_by_id(self, id: int) -> Gara:  # restituisce una gara per id
        return self.gara_repository.get_gara_by_id(id)

    def create_gara(self, gara: Gara) -> int:  # crea una nuova gara, ritorna l'id
        return self.gara_repository.create_gara(gara)

    def update_gara(self, gara: Gara) -> bool:  # aggiorna una gara, ritorna true se trovata
        return self.gara_repository.update_gara(gara)

    def delete_gara(self, id: int) -> bool:  # elimina una gara, ritorna true se trovata
        return self.gara_repository.delete_gara(id)
