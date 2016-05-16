var _ = require('underscore');
var path = require('path');
var models = require('../models');

var Lobby = models.Lobby;
var Account = models.Account;

var lobbyPage = function(req, res){
    Lobby.LobbyModel.findAllLobbies(function(lobbies){
               
        res.render('app', {csrfToken: req.csrfToken(), lobbies: lobbies});
    });    
};

 var createLobby = function(req, res){
	 //console.log(req.body.score);
     if(!req.body.name || !req.body.score){
         return res.status(400).json({error: "RAWR! Lobby Name and Score are required"});
     }   
     
     var lobbyData = {
         name: req.body.name,
         score: req.body.score,
         owner: req.session.account._id         
     };
     
     var newLobby = new Lobby.LobbyModel(lobbyData);
     
     newLobby.save(function(err){
        if(err){
            console.log(err);
            return res.status(400).json({error: 'An error occured'});
        }   
        // would like to figure out how to pass the lobby info to the game page      
        res.json({redirect: '/game'});
        //res.render('playgame', { csrfToken: req.csrfToken(), lobbyData: lobbyData });
     });

     //res.render('playgame', { csrfToken: req.csrfToken(), lobbyData: lobbyData });
     
 };

var playgame = function(req,res){
    
    var lobbyInfo = Lobby.LobbyModel.findByOwner(req.session.account._id, function(err, lobbyInfo){
        if (err){
           console.log(err);
           return res.status(400).json({error: 'An error occurred'});
        }    
        //console.log(lobbyInfo[0].name);
        if (lobbyInfo[0].score > 10) {lobbyInfo[0].score = 10;}
        if (lobbyInfo[0].score < 0) {lobbyInfo[0].score = 5;}

        var lobbyData = {
         playerName: req.session.account.username,
         lobbyName: lobbyInfo[0].name,
         score: lobbyInfo[0].score,
         owner: req.session.account._id
     };


        res.render('playgame', {csrfToken: req.csrfToken(), lobbyData: lobbyData});
    });
      

    var lobbyData = {
         name: req.session.account.username,
         //score: req.body.score,
         owner: req.session.account._id         
     };

     //res.sendFile(path.join(__dirname + '/../views/index.html'));

     //console.log(lobbyData.owner);

     // trying with jade
    //res.render('game', { csrfToken: req.csrfToken(), lobbyData: lobbyData });

    //res.render('playgame', { csrfToken: req.csrfToken(), lobbyData: lobbyData });  
};

var joingame = function(req,res){


    var lobbyData = {
             playerName: req.session.account.username,
             lobbyName: req.params.name,
             score: req.params.score,
             owner: req.session.account._id
        };

    res.render('playgame', {csrfToken: req.csrfToken(), lobbyData: lobbyData});

    /*
    var lobbyInfo = Lobby.LobbyModel.findByOwner(req.session.account._id, function(err, lobbyInfo){
        if (err){
           console.log(err);
           return res.status(400).json({error: 'An error occurred'});
        }    
        

        var lobbyData = {
             playerName: req.session.account.username,
             lobbyName: req.params.info.name,
             score: lobbyInfo[0].score,
             owner: req.session.account._id
        };


        res.render('playgame', {csrfToken: req.csrfToken(), lobbyData: lobbyData});
    });
    */
       
};

 
var deleteLobby = function(req, res){
    //console.log("delete");
    Lobby.LobbyModel.remove({name: req.params.name}, function(err){
        if(err){
            res.json(err);
        }
        else{
            res.redirect('/lobbies');
        }        
    });
};

var removeCurrentLobby = function(req, res){
    //console.log(req.session.account._id);

    Lobby.LobbyModel.remove({owner: req.session.account._id}, function(err){
        if(err){
            res.json(err);
        }
        else{
            Account.AccountModel.findByUsername(req.session.account.username, function(err, user){
               if (err){
                   console.log(err);
                   return res.status(400).json({error: 'An error occurred'});
               } 

               if (req.params.won == "true"){
                user.wins++;
                user.save(function(err) {
                    //if save error, just return an error for now
                    if(err) {
                        return res.json({err:err});
                    }
                    
                });
               }

               // change user wins here some how
                res.redirect('/lobbies');
                //res.render('profile', {csrfToken: req.csrfToken(), user: user});
            });
            
        }        
    });
};


module.exports.lobbyPage = lobbyPage;
module.exports.create = createLobby;
module.exports.play = playgame;
module.exports.join = joingame;
module.exports.deleteLobby = deleteLobby;
module.exports.removeLobby = removeCurrentLobby;