

class BoxObject{
	constructor(name, location, handlers){
		this.timeSlice = 10;
		this.intervalsPerSecond = 1000 / this.timeSlice;
		this.timer = null;
		this.domElement = null;
		this.name = name;
		this.chargePerSecond = 100;
		this.chargePerMS = this.chargePerSecond / 1000;
		this.updateQueue = new QueueObject();
		this.lastClickPoint = {x: null, y: null};
		this.location = location;
		this.centerPoint = {x: null, y: null};
		this.destination = {x: null, y:null};
		this.distanceToDestination = null;
		this.movesToDestination = 0;
		this.size = {width: null, height: null};
		this.velocityPerInterval = null;
		this.deltaMove = {x: null, y: null};
		this.changeVector = this.initialChangeVector;
		this.handlers = {};
		if(handlers){
			this.attachHandlers(handlers);
		}
		this.start();
	}
	getDimensions(){
		return {
			left: this.location.x,
			top: this.location.y,
			right: this.location.x + this.size.width,
			bottom: this.location.y + this.size.height
		}
	}
	delete(){

	}
	render(){
		this.domElement = document.createElement('div');
		this.domElement.classList.add('box');
		this.updateLocation();
		return this.domElement;
	}
	attachHandlers(handlers){
		const acceptedHandlers = ['launch'];
		acceptedHandlers.forEach(
			handlerName => this.handlers[handlerName] = handlers[handlerName] ? handlers[handlerName] : ()=>{console.log('no op');}
		);

	}
	updateLocation(newLoc){
		if(newLoc){
			this.location = newLoc;
		}
		this.domElement.style.left = this.location.x + 'px';
		this.domElement.style.top = this.location.y + 'px';	
	}
	initialChangeVector(newLocation, velocity){
		//get center
		this.centerPoint.x = this.location.x + this.domElement.offsetWidth;
		this.centerPoint.y = this.location.y + this.domElement.offsetHeight;
		this.changeVector = this.subsequentChangeVector;
		this.subsequentChangeVector(newLocation, velocity);
	}
	subsequentChangeVector(newLocation, velocity){
		this.velocityPerInterval = velocity / this.intervalsPerSecond;
		this.destination.x = newLocation.x;
		this.destination.y = newLocation.y;
		const radians = Math.atan2( this.destination.y-this.location.y , this.destination.x -this.location.x );
		if(radians>Math.PI){
			var mult = -1;
		} else {
			mult = 1;
		}
		this.distanceToDestination = Math.sqrt( Math.pow(this.destination.x - this.location.x, 2) + Math.pow(this.destination.y - this.location.y, 2));
		this.movesToDestination = (this.distanceToDestination / this.velocityPerInterval) >> 0;
		this.deltaMove.x = Math.cos(radians) * this.velocityPerInterval * mult;
		this.deltaMove.y = Math.sin(radians) * this.velocityPerInterval * mult;
		this.updateQueue.add( this.move.bind(this) );
	}
	startCharge(clickPoint){
		this.lastClickPoint = clickPoint;
		this.startChargeTime = window.performance.now();
	}
	releaseCharge(){
		const totalTime = window.performance.now() - this.startChargeTime;
		const velocity = totalTime * this.chargePerMS;
		this.handlers.launch(this.lastClickPoint, velocity);
		this.changeVector(this.lastClickPoint, velocity);
	}
	move(){
		if(this.movesToDestination-- <= 0){
			this.updateQueue.remove(this.move);
			return;
		}
		this.updateLocation( { x: this.location.x+this.deltaMove.x, y: this.location.y+this.deltaMove.y})
	}
	update(){
		this.updateQueue.callSequence();
	}
	start(){
		this.stop();
		this.timer = setInterval(this.update.bind(this), this.timeSlice);
	}
	stop(){
		if(this.timer){
			clearInterval(this.timer);
			this.timer = null;			
		}
	}
}

class QueueObject{
	constructor(){
		this.queue = {};
		this.currentItem = 0;
	}
	add(callback){
		let name = this.simplifyName(callback)
		if(!this.queue.hasOwnProperty(name)){
			this.queue[name] = callback;
		}
	}
	remove(callback){
		let name = this.simplifyName(callback);
		if(this.queue.hasOwnProperty(name)){
			delete this.queue[name];
		}
	}
	simplifyName(callback){
		let name = callback.name;
		let spacePos = name.indexOf(' ');
		if(spacePos!==-1){
			name = name.slice(spacePos+1);
		}
		return name;
	}
	getNext(){
		const next = this.queue[this.currentItem++];
		if(this.currentItem >= this.queue.length){
			this.currentItem=0;
		}
		return next;
	}
	callSequence(){
		for(let key in this.queue){
			this.queue[key].call();
		}
	}

}

class RemoteBox extends BoxObject{
	constructor(name, location){

	}
}