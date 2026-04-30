# =============================================================================
# ECCEZIONI PERSONALIZZATE
#
# Cos'è un'eccezione? È un "errore con un nome", una specie di cartellino
# rosso che il programma può alzare quando qualcosa va storto. Avere
# eccezioni "personalizzate" significa avere cartellini di colori diversi
# per problemi diversi: così, chi le riceve, capisce subito cosa è andato
# male e come reagire (es. "squadra non trovata" è diverso da "errore database").
# =============================================================================


class DBException(Exception):  # errore generico del database (es. la tabella non risponde)
    pass

class TeamAlreadyExistsException(Exception):  # il team che si vuole creare esiste già
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
