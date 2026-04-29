from app.model.account import Account  # modello account
from app.repository.account_repository import AccountRepository  # accesso al database


class AccountService:

    def __init__(self):
        self.account_repository = AccountRepository()  # crea il collegamento al repository

    def get_accounts(self) -> list[Account]:  # restituisce tutti gli account
        return self.account_repository.get_accounts()

    def get_account_by_id(self, id: int) -> Account:  # restituisce un account per id
        return self.account_repository.get_account_by_id(id)

    def get_account_by_email_and_password(self, email: str, password: str) -> Account:  # cerca l'account per login
        return self.account_repository.get_account_by_email_and_password(email, password)

    def create_account(self, account: Account) -> int:  # crea un nuovo account, ritorna l'id
        return self.account_repository.create_account(account)

    def update_account(self, account: Account) -> bool:  # aggiorna un account, ritorna true se trovato
        return self.account_repository.update_account(account)

    def delete_account(self, id: int) -> bool:  # elimina un account, ritorna true se trovato
        return self.account_repository.delete_account(id)
