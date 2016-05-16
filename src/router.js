var controllers = require('./controllers');
var mid = require('./middleware');
var path = require('path');

var router = function(app){
    app.get("/login", mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.post("/login", mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
    app.get("/signup", mid.requiresSecure, mid.requiresLogout, controllers.Account.signupPage);
    app.post("/signup", mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
    app.get("/logout", mid.requiresLogin, controllers.Account.logout);
	app.get("/leaderboard", mid.requiresLogin, controllers.Account.leaderboard);
    app.get("/profile", mid.requiresLogin, controllers.Account.profile);
	app.get("/game", mid.requiresLogin, controllers.Lobby.play);
	/*app.get("/game", mid.requiresLogin, function(req, res){
        
        res.sendFile(path.join(__dirname + '/views/index.html'));
    });*/
    app.get("/lobbies", mid.requiresLogin, controllers.Lobby.lobbyPage);
    app.post("/lobbies", mid.requiresLogin, controllers.Lobby.create);
    app.get("/killer/:name",  mid.requiresLogin, controllers.Lobby.deleteLobby);
    app.get("/join/:name/:score",  mid.requiresLogin, controllers.Lobby.join);
    app.get("/quit/:owner",  mid.requiresLogin, controllers.Lobby.removeLobby);
    app.get("/quit/:owner/:won",  mid.requiresLogin, controllers.Lobby.removeLobby);
    app.get("/", mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    
};


module.exports = router;