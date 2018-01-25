
function generateRandomString(length){
	const chars = 'abcdefghijklmnopqrstuvwxyz';
	let output = '';
	for(let i=0; i< length; i++){
		output += chars[(Math.random() * chars.length) >> 0];
	}
	return output;
}

function initializeGame(){
	
	window.game = new BoxWarsGame('#gameArea');
	game.playerConnect('Player_'+generateRandomString(10),null, true);
}

initializeGame();