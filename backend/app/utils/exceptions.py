
class DBException(Exception):  # errore generico del database
    pass

class TeamAlreadyExistsException(Exception):  # team già presente
    pass

class SquadraAlreadyExistsException(Exception):  # squadra già presente
    pass

class SquadraNotFoundException(Exception):  # squadra non trovata
    pass

class AtletaAlreadyExistsException(Exception):  # atleta già presente
    pass

class AtletaNotFoundException(Exception):  # atleta non trovato
    pass

class TorneoAlreadyExistsException(Exception):  # torneo già presente
    pass

class TorneoNotFoundException(Exception):  # torneo non trovato
    pass

class GaraNotFoundException(Exception):  # gara non trovata
    pass

class IscrizioneAlreadyExistsException(Exception):  # iscrizione già presente
    pass

class IscrizioneNotFoundException(Exception):  # iscrizione non trovata
    pass
