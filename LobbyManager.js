const debug = require('./debuggr.js')

// DATA
codesInUse = []
var lobbies = []
//	lobbies take the form of a javascript object
//	{
//  	hostId: socket.id	
//		lobbyCode: String
//		joinable: Boolean
//		maxPlayers: int
//		players: [] of player objects with {name: string, id: socket.id, active: Boolean}
//	}


// FUNCTIONS
exports.generateLobbyCode = (lobbyCodePool) => {
	const lobbyCodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	const lobbyCodeLength = 4

	// Generates 4 letter lobby codes until one is found that isn't in use
	// TODO: word filter to exclude lewd or bigoted words from being chosen
	let lobbyCode
	do {
		lobbyCode = ''
		for(let i = 0; i < lobbyCodeLength; i++) {
			lobbyCode += lobbyCodeChars.charAt(Math.floor(Math.random() * lobbyCodeChars.length))
		}
	} while (lobbyCodePool.includes(lobbyCode)) 

	lobbyCodePool.push(lobbyCode)
	debug.log(`Assigned lobby code "${lobbyCode}", ${lobbyCodePool.length} codes now in use.`)
	return lobbyCode
}

// mutates lobbyCodePool
// returns false if the code was not in the pool
exports.freeLobbyCode = (codeToFree, lobbyCodePool) => {
	let index = lobbyCodePool.findIndex((element) => element == codeToFree)
	if(index == -1)
		return false
	lobbyCodePool = lobbyCodePool.splice(index, 1)
}

exports.createLobby = (client, lobbiesArray, lobbyCodesArray, lobbyCodePool) => {
	let newLobbyCode = this.generateLobbyCode(lobbyCodePool)

	lobbyCodesArray[client.id] = newLobbyCode
	lobbiesArray[client.id] = []

	debug.log(`Created lobby "${newLobbyCode}"`)
	return newLobbyCode
}

exports.addPlayerToLobby = (playerName, playerId, hostId, lobbiesArray) => {
	let targetPlayersArray = lobbiesArray[hostId]
	let playerAlreadyExistsIndex = targetPlayersArray.findIndex((element) => element[0] == playerName)
	if(playerAlreadyExistsIndex == -1){
		targetPlayersArray.push([playerName, playerId])
		return true
	} else {
		return false
	}	
}

exports.disconnectPlayer = (playerId, hostId, lobbiesArray) => {
	let playerArray = lobbiesArray[hostId]
	let playerIndex = playerArray.findIndex((element) => element[1] == playerId)
	if(playerIndex != -1){
		playerArray.splice(playerIndex, 1)
	} 
}

exports.disconnectHost = (hostId, lobbiesArray, lobbyCodesArray, lobbyCodePool) => {
	let lobbyCode = lobbyCodesArray[hostId]
	delete lobbiesArray.hostId
	delete lobbyCodesArray.hostId
	this.freeLobbyCode(lobbyCode, lobbyCodePool)
}

// returns false if the lobby does not exist
exports.hostIdFromCode = (lobbyCode, lobbyCodesArray) => {
	let hostId = Object.keys(lobbyCodesArray).find(key => lobbyCodesArray[key] == lobbyCode)
	if(hostId == -1){
		debug.log(`Could not find lobby ${lobbyCode}`)
		return false
	}
	return hostId
}