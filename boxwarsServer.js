var WebSocketServer = require('websocket').server;
var http = require('http');
const websocketPort = 10000;
const players = {};
 
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(websocketPort, function() {
    console.log((new Date()) + ' Server is listening on port '+websocketPort);
});

wsServer = new WebSocketServer({
    httpServer: server
});

function updatePlayers(newPlayer, type="playerUpdate", additionalData=null){
	for(var key in players){
		console.log(`${key} versus ${newPlayer}`);
		if(key!==newPlayer){
			console.log('sending message to '+players[key].name);
			const data = {
							name: players[newPlayer].name, 
							location: players[newPlayer].location 
			}
			data.additionalData = additionalData;
			players[key].connection.sendUTF( 
				JSON.stringify(
					{
						type:type, 
						data: data
					}
				)
			)
		}
	}
}
function sendPlayersToNewPlayer(name){
	console.log('sending all players to new player '+name);
	let playerList = {};
	for(var key in players){
		playerList[key] = {name: players[key].name, location: players[key].location };
	}
	players[name].connection.sendUTF( JSON.stringify({type: 'playerList', data: playerList}));
}

wsServer.on('request', function(request) {
	const connection = request.accept(null, request.origin); 
	console.log('got a request');
	let name = null;
	connection.on('message', message => {
		const data = JSON.parse(message.utf8Data);
		console.log('got a message',data);
		if(data.type==='connect'){
			name = data.name;
			if(players[name]===undefined){
				console.log('player does not exist, adding');
				if(players.length===0){
					//generate new game id
				}
				players[name] = {
					location: data.location,
					name: name,
					connection: connection
				}
				updatePlayers(name);
				sendPlayersToNewPlayer(name);
			}		
		} else if(data.type==='launch'){
			updatePlayers(name, 'launch', data.data);
		}
		
	});
	connection.on('close', function(connection) {
		console.log('deleting '+name)
		updatePlayers(name, 'playerDisconnect');
		delete players[name];
    });
});
