# =============================================================================
# SERVICE ACCOUNT - "intermediario" tra controller e repository.
#
# Cosa fa un "service"? È il responsabile di reparto: il controller (chi
# riceve la richiesta dall'esterno) chiede al service "fai questa cosa", e
# il service la chiede al repository (che parla col database). Sembra un
# passaggio in più, ma è utile: se in futuro vorremo aggiungere logica
# di mezzo (controlli, calcoli...) la mettiamo qui senza toccare nient'altro.
# =============================================================================

from app.model.account import Account                              # modello account
from app.repository.account_repository import AccountRepository    # accesso al database


class AccountService:

    def __init__(self):
        # Crea il "bibliotecario" che parla col database.
        self.account_repository = AccountRepository()

    def get_accounts(self) -> list[Account]:
        """Restituisce tutti gli account."""
        return self.account_repository.get_accounts()

    def get_account_by_id(self, id: int) -> Account:
        """Restituisce un account dato il suo id (numero)."""
        return self.account_repository.get_account_by_id(id)

    def get_account_by_email_and_password(self, email: str, password: str) -> Account:
        """Cerca un account che abbia esattamente quella email e quella password.
        Si usa per il login."""
        return self.account_repository.get_account_by_email_and_password(email, password)

    def create_account(self, account: Account) -> int:
        """Crea un nuovo account e ritorna l'id assegnato."""
        return self.account_repository.create_account(account)

    def update_account(self, account: Account) -> bool:
        """Aggiorna un account; True se è stato trovato e modificato."""
        return self.account_repository.update_account(account)

    def delete_account(self, id: int) -> bool:
        """Elimina un account; True se è stato trovato e cancellato."""
        return self.account_repository.delete_account(id)
