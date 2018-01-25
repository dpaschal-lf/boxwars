

class BoxWarsGame{
	constructor(gameArea){
		this.livePlayer = null;
		this.players = {};
		this.gameArea = document.querySelector(gameArea);
		this.attachHandlers();
	}

	playerConnect(name, location, live=false){
		location = location || this.getRandomGameLocation();
		const player = new BoxObject(name, location, {launch: this.handleLaunch.bind(this)});
		const playerDom = player.render();
		console.log('making new player: '+player.name,location);
		if(live){
			this.livePlayer = player;
			this.connectToServer();
			this.livePlayer.domElement.classList.add('livePlayer');
		}
		console.log('test: ',player);
		this.players[name] = player;
		this.gameArea.appendChild(playerDom);
	}
	playerDisconnect(name){
		if(this.players[name]){
			this.gameArea.removeChild(this.players[name].domElement);
			delete this.players[name];
		}
	}
	getRandomGameLocation(){
		const gameWidth = this.gameArea.offsetWidth;
		const gameHeight = this.gameArea.offsetHeight;
		return { x: gameWidth * Math.random(), y: gameHeight * Math.random() };
	}
	attachHandlers(){
		this.gameArea.addEventListener('mousedown',this.handleDown.bind(this));
		this.gameArea.addEventListener('mouseup',this.handleUp.bind(this));
	}
	handleLaunch(destination, velocity){
		console.log('got launch notification');
		debugger;
		this.server.send(JSON.stringify({type: 'launch', data: {destination, velocity}}));
	}
	handleDown(event){
		console.log('starting charge');
		this.livePlayer.startCharge({x: event.offsetX, y: event.offsetY});
	}
	handleUp(event){
		console.log('ending charge');
		this.livePlayer.releaseCharge();
		//this.livePlayer.changeVector({x: event.offsetX, y: event.offsetY}, 100);
	}
	communicateAction(message){
		this.server.send(message);
	}
	connectToServer(){
		const address = `ws://${window.location.hostname}:10000/boxwars`;
		console.log('connecting to '+address);
		this.server = new WebSocket(address);
		this.server.onopen = function(){
			console.log('connection opened');
			this.server.send(JSON.stringify({ type: 'connect', location: this.livePlayer.location, name: this.livePlayer.name}));
		}.bind(this);
		this.server.onmessage = function(evt){
			let message = evt.data;
			message = JSON.parse(message);
			console.log('message received',message);
			if(message.type === 'playerUpdate'){
				console.log('new player joining');
				if(this.players[message.data.name]===undefined){
					this.playerConnect(message.data.name, message.data.location, false);				
				}
			}
			else if(message.type === 'playerDisconnect'){
				console.log('disconnecting player '+ message.data.name);
				this.playerDisconnect(message.data.name);
			}
			else if(message.type === 'playerList'){
				console.log('got list of players from server', message.data);
				for(let key in message.data){
					if(!this.players[key]){
						this.playerConnect(message.data[key].name, message.data[key].location, false);
					}
				}
			} else if(message.type === 'launch'){
				if(this.livePlayer.name !== message.data.name){
					this.players[message.data.name].changeVector(message.data.additionalData.destination, message.data.additionalData.velocity);
				} else {
					console.log('live player message, ignoring');
				}
			}
		}.bind(this);
		this.server.onclose = function(){ 
          // websocket is closed.
	 		console.log('connection closed'); 
       };
	}
	checkCollissionAmongBoxes(){
		for(var key1 in this.players){
			for(var key2 in this.players){
				if(this.players[key1]!==this.players[key2] 
					&& this.checkCollission(
						this.players[key1].getDimensions(), 
						this.players[key2].getDimensions()
					   )
				){
					console.log('collision between '+this.players[key1].name + ' and '+this.players[key2].name);
				}
			}
		}
	}
	checkCollission(obj1, obj2){
		if(obj1.right < obj2.left
				||
		   obj1.left > obj2.right
		   		||
		   obj1.bottom < obj2.top
		   		||
		   obj1.top > obj2.bottom
		){
			return false
		}
		return true;
	}

}

