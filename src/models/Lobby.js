var mongoose = require('mongoose');
var _ = require('underscore');

var LobbyModel;

var setName = function(name){
    return _.escape(name).trim();
};

var LobbySchema = new mongoose.Schema({
   name: {
       type: String,
       required: true,
       trim: true,
       set: setName    
   },
    
    score: {
        type: Number,
        min: 0,
        required: true
    },
    
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account'
    },
    
    createdData: {
        type: Date,
        default: Date.now
    }
});

LobbySchema.methods.toAPI = function(){
  return {
      name: this.name,
      score: this.score,
   };
};

LobbySchema.statics.findByUsername = function(name, callback) {

    console.log(name);
    var search = {
        name: name
    };

    return LobbyModel.findOne(search, callback);
};


LobbySchema.statics.findByOwner = function(ownerId, callback){
  var search = {
      //owner: mongoose.Types.ObjectId(ownerId)
      owner: ownerId
   };
    return LobbyModel.find(search).select("name score").exec(callback);
};


LobbySchema.statics.findAllLobbies = function(callback) {

    LobbyModel.find({}, function(err, lobbies){
		if (!err){ 
			var allLobbies = lobbies.map(function(lobby){
				
				return {name: lobby.name, score: lobby.score}; // {un, win, lose}
			});
			return callback(allLobbies);
		} else {throw err;}	
	});
};

LobbyModel = mongoose.model('Lobby', LobbySchema);

module.exports.LobbyModel = LobbyModel;
module.exports.LobbySchema = LobbySchema;