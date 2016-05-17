"use strict";

var models = require('../models');

var Account = models.Account;
var Lobby = models.Lobby;

var loginPage = function(req,res){
  res.render('login', { csrfToken: req.csrfToken() });  
};

var leaderboard = function(req, res){
	var users = Account.AccountModel.findAllUsers(function(users){
	   
     // sort by wins
      users.sort(function(a, b){
        console.log(a.wins);
        return b.wins-a.wins;
      });
      

		res.render('leaderboard', {csrfToken: req.csrfToken(), users: users});
	});
	    
};

var profile = function(req, res){
  Account.AccountModel.findByUsername(req.session.account.username, function(err, user){
       if (err){
           console.log(err);
           return res.status(400).json({error: 'An error occurred'});
       } 
       //console.log(user.wins);
        
      res.render('profile', {csrfToken: req.csrfToken(), user: user});
    });
      
};

var signupPage = function(req, res){
  res.render('signup', { csrfToken: req.csrfToken() }); 
  
};

var logout = function(req, res){
    //console.log(req.session.account._id);
    Lobby.LobbyModel.remove({owner: req.session.account._id}, function(err){
        if(err){
            res.json(err);
        }
        else{
            req.session.destroy();
            res.redirect('/'); 
        }        
    });
     
};

var login = function(req, res){
    if(!req.body.username || !req.body.pass){
        return res.status(400).json({error: "Rawr! All fields are required"});
    }
    
    Account.AccountModel.authenticate(req.body.username, req.body.pass, function(err, account){
       if(err || !account){
           return res.status(401).json({error: "Wrong username or password"});
       }
        req.session.account = account.toAPI();
        
        res.json({redirect: '/lobbies'});
    });
    
};

var signup = function(req, res){
    if(!req.body.username || !req.body.pass || !req.body.pass2){
        return res.status(400).json({error: "RAWR! All fields are required"});
    }
    
    if(req.body.pass !== req.body.pass2){
        return res.status(400).json({error: "RAWR! Passwords do not match"});
    }
    
    Account.AccountModel.generateHash(req.body.pass, function(salt, hash){
       
        var accountData = {
            username: req.body.username,
            salt: salt,
            password: hash
        };
        
        var newAccount = new Account.AccountModel(accountData);
        
        newAccount.save(function(err){
           if(err){
               console.log(err);
               return res.status(400).json({error:"An error occured"});
           }
            req.session.account = newAccount.toAPI();
            
            res.json({redirect: '/lobbies'});
        });
    });
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.leaderboard = leaderboard;
module.exports.profile = profile;
module.exports.logout = logout;
module.exports.signupPage = signupPage;
module.exports.signup = signup;