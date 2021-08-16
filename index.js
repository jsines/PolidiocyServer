// EXTERNAL
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
	perMessageDeflate: false
});

// INTERNAL
var LobbyManager = require('./LobbyManager.js');
const debug = require('./debuggr.js')

// ROUTING
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/admin', (req, res) => {
	res.sendFile(__dirname + '/admin.html');
});

// DATA
var lobbies = [] // LOBBIES[HOST.ID] = ARRAY CONTAINING [PLAYER.NAME, PLAYER.ID] PAIRS
var lobbyCodes = {} // LOBBYCODES[HOST.ID] = CODE ASSIGNED TO THAT HOST
var lobbyCodePool = [] // HOLDS ALL LOBBY CODES CURRENTLY IN USE

// SOCKETS
io.on('connection', (socket) => {

	var currentClient = {
		id: socket.id,
		type: socket.handshake.query.type,
		lastHeartbeat: new Date().getTime()
	}
	debug.log(`${socket.id} has connected as a ${currentClient.type}`);

	socket.on('disconnect', () => {
		if(currentClient.type == 'player' && currentClient.host != undefined){
			LobbyManager.disconnectPlayer(currentClient.id, currentClient.host, lobbies)
			debug.log(`${currentClient.id} has disconnected from ${currentClient.host}`);
		} else if(currentClient.type == 'host'){
			LobbyManager.disconnectHost(currentClient.id, lobbies, lobbyCodes, lobbyCodePool)
			debug.log(`${currentClient.id} has disconnected and was a host`);
		} else {
			debug.log(`Disconnected a socket that was not in a lobby. (${currentClient.id})`)
		}
	});

	// HOST -> SERVER
	socket.on('HS_LobbyCreate', (msg) => {
		let newLobbyCode = LobbyManager.createLobby(currentClient, lobbies, lobbyCodes, lobbyCodePool);
		let response = {
			lobbyCode: newLobbyCode
		}
		debug.log(lobbyCodes[currentClient.id])
		io.to(currentClient.id).emit('SH_LobbyCreateRes', response)
	})

	// PLAYER -> SERVER
	// msg containing lobbyCode and name of player
	socket.on('PS_LobbyJoin', (msg) => {
		let hostId = LobbyManager.hostIdFromCode(msg.lobbyCode, lobbyCodes)
		debug.log(hostId)
		currentClient.name = msg.name
		currentClient.lobby = msg.lobbyCode
		currentClient.host = hostId

		let result = LobbyManager.addPlayerToLobby(currentClient.name, currentClient.id, currentClient.host, lobbies);

		let playerJoinReq = {
			name: currentClient.name
		}
		io.to(hostId).emit('SH_PlayerJoinReq', playerJoinReq)
		socket.join(currentClient.lobby)
	});

	// HOST -> SERVER
	// msg contains success ("true" or "false") and player name (string) 
	socket.on('HS_PlayerJoinRes', (msg) => {
		let playerId = LobbyManager.playerIdFromHostAndName(currentClient.id, msg.name, lobbies) // IMPLEMENT
		if(msg.success == "true"){ 
			io.to(playerId).emit('SP_LobbyJoinSuccess')
		} else if(msg.success == "false"){
			io.to(playerId).emit('SP_LobbyJoinFailure')
			LobbyManager.disconnectPlayer(playerId, currentClient.id, lobbies)
		}
	})
});

http.listen(3000, () => {
	console.log('listening on port 3000');
});