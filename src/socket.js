var io;

//var shell = require('game-shell')();


var players = [];

var square = {
    x: 0,
    y: 0,
    height: 100,
    width: 100,
	color: "red"
};

var player = {
		number: 0,
		score: 0
};

var numUsers = 0;

var rooms = {};
var users = {};


var configureSockets = function (socketio) {
    io = socketio;

    io.on('connection', function (socket) {
	
		onJoined(socket);
		onDisconnect(socket);
	    onMovementUpdate(socket);

	});

};


var onScoreUpdate = function(socket) {
	socket.on('updateScore', function(data) {
		socket.name = data.name;
		users[socket.name] = {name: data.name, score: data.score};	
		io.sockets.in(roomName).emit('updateScore', users);
		io.sockets.in(roomName).emit('updateChat', {name: data.name, score: data.score});
	});
};

var onMovementUpdate = function(socket) {
	socket.on('updatePlayer', function(data) {
			rooms[data.roomName].users[data.user.name] = data.user;
			io.sockets.in(data.roomName).emit('updatePlayerPos', data.user);		
	});
};

var onBallMovementUpdate = function(socket) {
	socket.on('updateBall', function(data) {
			io.sockets.in(roomName).emit('updateBall', data);		
	});
};

var onJoined = function(socket) {
	socket.on("join", function(data) {

		var roomName = data.room;

		if(!rooms[roomName]){
			rooms[roomName] = {users: {}, ball: {}};
		} else {
			//rooms[roomName].users[data.name] = {};
		}
		
		var numPlayers = Object.keys(rooms[roomName].users).length;
		//console.log(numPlayers);
		var servBall;
		if(numPlayers < 2){
			//socket.name = data.name;
			var playerInfo;
			// set these variable global/constant
			if(numPlayers === 0){
				playerInfo = {x: 10, y: 225, width: 50, height: 50, color: "red"};
			} else if(numPlayers == 1){
				playerInfo = {x: 440, y: 225, width: 50, height: 50, color: "blue"};
				servBall = data.ball;
			}

			rooms[roomName].users[data.name] = {name: data.name, score: data.score, info: playerInfo};	
			var allUsers = users;
			rooms[roomName].scoreToWin = data.scoreToWin;
			rooms[roomName].ball = servBall;

		
			console.log(rooms[roomName]);
			socket.join(roomName);
			io.sockets.in(roomName).emit('updatePlayers', {users: rooms[roomName].users, ball: rooms[roomName].ball});
		}
		
		if(rooms[roomName].ball !== null){
			
			setInterval(function (){

				// do collision detection here
				if(Object.keys(rooms[roomName].users).length == 2){

					checkCollisions(roomName);

					rooms[roomName].ball.x += rooms[roomName].ball.xSpeed;
					rooms[roomName].ball.y += rooms[roomName].ball.ySpeed;

					io.sockets.in(roomName).emit('updateBall', rooms[roomName].ball);
				}
				
			}, 100);
		}		

	});
  };
  
var onDisconnect = function(socket) {
	socket.on('disconnect', function(data) {
		//console.log(socket);
		//console.log(socket);
		var user = socket.name;
		//io.sockets.in(roomName).emit('removeUser', user);
		//socket.leave(roomName);
		//delete users[socket.name];
	});
};

function resetBall(direction, roomName){
	rooms[roomName].ball.x = 250;
	rooms[roomName].ball.y = 250;
	rooms[roomName].ball.ySpeed = 0;

	if(direction > 0){
		rooms[roomName].ball.xSpeed = 6;
	} else{
		rooms[roomName].ball.xSpeed = -6;
	}
}

function checkCollisions(roomToCheck){
	var keys = Object.keys(rooms[roomToCheck].users);
	var serverBall = rooms[roomToCheck].ball;
	var ballRight = serverBall.x + serverBall.radius;
	var ballLeft = serverBall.x - serverBall.radius;
	var ballTop = serverBall.y + serverBall.radius;
	var ballBottom = serverBall.y - serverBall.radius;

	// turn this into point scoring
	
	if(ballTop >= 500 || ballBottom <= 0){
		serverBall.ySpeed = -serverBall.ySpeed;
	}


	for(var i = 0; i < keys.length; i++){
		if(i === 0){

			var playerOne = rooms[roomToCheck].users[keys[i]].info;

			if(ballLeft <= playerOne.x + playerOne.width && 
				(serverBall.y >= playerOne.y && serverBall.y <= playerOne.y + playerOne.height)){
				serverBall.xSpeed++;
				serverBall.xSpeed = -serverBall.xSpeed;
				if(serverBall.ySpeed === 0){
					serverBall.ySpeed = Math.random() * (3 + 3) - 3;
				}
			}

			 rooms[roomToCheck].ball = serverBall;

			if(ballRight >= 500){
				resetBall(i, roomToCheck);
				rooms[roomToCheck].users[keys[i]].score++;	
				io.sockets.in(roomToCheck).emit('updateScore', rooms[roomToCheck].users);
				if(rooms[roomToCheck].users[keys[i]].score == rooms[roomToCheck].scoreToWin){
					io.sockets.in(roomToCheck).emit('gameover', rooms[roomToCheck].users[keys[i]]);
					break;
				}
				break;
				//io.sockets.in(roomName).emit('updateChat', {name: data.name, score: data.score});	
			}

	
			
		} else if(i == 1) {

			var playerTwo = rooms[roomToCheck].users[keys[i]].info;

			if(ballRight >= playerTwo.x && 
				(serverBall.y >= playerTwo.y && serverBall.y <= playerTwo.y + playerTwo.height)){
				serverBall.xSpeed++;
				serverBall.xSpeed = -serverBall.xSpeed;
				if(serverBall.ySpeed === 0){
					serverBall.ySpeed = Math.random() * (3 + 3) - 3;
				}
			}

			rooms[roomToCheck].ball = serverBall;

			if (ballLeft <= 0){
				resetBall(i, roomToCheck);
				rooms[roomToCheck].users[keys[i]].score++;	
				io.sockets.in(roomToCheck).emit('updateScore', rooms[roomToCheck].users);
				if(rooms[roomToCheck].users[keys[i]].score == rooms[roomToCheck].scoreToWin){
					io.sockets.in(roomToCheck).emit('gameover', rooms[roomToCheck].users[keys[i]]);
					break;
				}
				break;
			}
		}



	}
}

module.exports.configureSockets = configureSockets;
  

