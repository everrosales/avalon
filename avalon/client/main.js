Handlebars.registerHelper('toCapitalCase', function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

var numOnMission = {
     5: [2,3,2,3,3],
     6: [2,3,4,3,4],
     7: [2,3,3,4,4],
     8: [3,4,4,5,5],
     9: [3,4,4,5,5],
    10: [3,4,4,5,5]
  };

function getNumMissionPlayers() {
  var game = getCurrentGame();
  var i;
  for(i = 0; i < game.rounds.length; ++i) {
    if (game.rounds[i] == null) {
      break;
    }
  }
  return numOnMission[Players.find({'gameID': game._id}).fetch().length][i];
}

function checkGameEndCondition() {
  var game = getCurrentGame();
  var passes = 0;
  var fails = 0;
  game.rounds.forEach(function(round) {
    if (round == 'pass') {
      passes++;
    } else if (round == 'fail') {
      fails++;
    }
  });
  if (passes > 2) {
    endGame('resistance');
  } else if (fails > 2) {
    endGame('spy');
  }
}

function rotateProposal(accessCode) {
  var game = Games.find({'accessCode':accessCode}).fetch()[0];
  var proposedPlayers = Players.find({'gameID': game._id, 'isOnProposedMission':true}).fetch();
  proposedPlayers.forEach(function(player) {
    Players.update(player._id, {$set : {'isOnProposedMission': false}});
  });
  var players = Players.find({'gameID': game._id}, {'sort': {'name': 1}}).fetch();
  var i;
  for (i = 0; i < players.length; i++) {
    if (players[i].isProposing) {
      break;
    }
  }
  Players.update(players[(i+1) % players.length]._id, {$set: {'isProposing': true}})
  Players.update(players[i]._id, {$set: {'isProposing': false}});
}

function missionPass(gameID) {
  var game = Games.find(gameID).fetch()[0];
  var round = 5 - game.rounds.reduce(function(preVal, curVal) {
    if (curVal) {
      return preVal;
    } else {
      return ++preVal;
    }
  }, 0);
  game.rounds[round] = "pass";
  Games.update(game._id, {$set: {rounds: game.rounds}});
  checkGameEndCondition();
  // if (round == 4) {
  //   endGame(accessCode);
  // }
  Games.update(game._id, {$set : {'proposalCount': 0}});
  rotateProposal(game.accessCode);
}

function missionFail(gameID) {
  var game = Games.find(gameID).fetch()[0];
  var round = 5 - game.rounds.reduce(function(preVal, curVal) {
    if (curVal) {
      return preVal;
    } else {
      return ++preVal;
    }
  }, 0);
  game.rounds[round] = "fail";
  Games.update(game._id, {$set: {rounds: game.rounds}});
  checkGameEndCondition();
  // if (round == 4) {
  //   endGame(game.accessCode);
  // }
  Players.find({'gameID': Session.get('gameID'), 'isOnProposedMission':true}).forEach(function(player) {
    Players.update(player._id, {$set: {'isOnProposedMission': false}});
  });
  Games.update(game._id, {$set : {'proposalCount': 0, 'proposing': true,
      'proposedMissionVoting': false, 'mission': false}});
  rotateProposal(game.accessCode);
}

function submitProposal() {
  var game = getCurrentGame();
  var proposedPlayers = Players.find({ 'gameID': Session.get("gameID"),
            'isOnProposedMission' : true}).fetch();
  if (proposedPlayers.length == getNumMissionPlayers()) {
    //Games.update(game._id, {$set : {'proposal': proposedPlayers}});
    Games.update(game._id, {$set :
        {'proposing': false, 'proposedMissionVoting': true}});
  }
}

var addToProposal = function(gameID, username) {
  var player = Players.find({'name': username, 'gameID': gameID}).fetch()[0];
  Players.update(player._id, {$set: {'isOnProposedMission': true}});
};

var removeFromProposal = function(gameID, username) {
  var player = Players.find({'name': username, 'gameID': gameID}).fetch()[0];
  Players.update(player._id, {$set: {'isOnProposedMission': false}});
};

function toggleFromProposal(gameID, username) {
  var player = Players.find({'name': username, 'gameID': gameID}).fetch()[0];
  Players.update(player._id, {$set: {'isOnProposedMission': !player.isOnProposedMission}});
}

function proposalApproved(gameID) {
  console.log('proposal approved');
  var game = Games.find(gameID).fetch()[0];
  Games.update(game._id, {$set : {'proposalCount': 0}});
  beginMissionVoting(gameID);
}

function proposalRejected(gameID) {
  console.log('proposal rejected');
  var game = Games.find(gameID).fetch()[0];
  if (game.proposalCount == 4) {
    missionFail(Session.get("gameID"));
    return;
  }
  Players.find({'gameID': Session.get('gameID'), 'isOnProposedMission':true}).fetch().forEach(function(player) {
    Players.update(player._id, {$set: {'isOnProposedMission': false}});
  });
  Games.update(game._id, {$set :
      {'proposing': true, 'proposedMissionVoting': false, 'proposalCount': ++game.proposalCount}});
  //Games.update(game._id, {$set: {'proposalCount': ++game.proposalCount}});
  rotateProposal(game.accessCode);
}

function beginMissionVoting(gameID) {
  // Assumes that a proposal was approved and was thus set
  var game = Games.find(gameID).fetch()[0];
  //var playersOnMission = games.propsal;
  Players.find({'gameID': game._id, 'isOnProposedMission': false}).fetch().forEach(function (player) {
    Players.update(player._id, {$set: {'isOnMission': false}});
  });
  Players.find({'gameID': game._id, 'isOnProposedMission': true}).fetch().forEach(function (player) {
    Players.update(player._id, {$set: {'isOnMission': true}});
  });
  Games.update(game._id, {$set : {'proposing': false, 'proposedMissionVoting': false, 'mission': true}});
}

function endGame(victor) {
  // Do victory/loss and reveal who is what role
  var game = getCurrentGame();
  Games.update(game._id, {$set: {'victor': victor}});
}

function initUserLanguage() {
  var language = amplify.store("language");

  if (language){
    Session.set("language", language);
  }

  setUserLanguage(getUserLanguage());
}

function getUserLanguage() {
  var language = Session.get("language");

  if (language){
    return language;
  } else {
    return "en";
  }
};

function setUserLanguage(language) {
  TAPi18n.setLanguage(language).done(function () {
    Session.set("language", language);
    amplify.store("language", language);
  });
}

function getLanguageDirection() {
  var language = getUserLanguage()
  var rtlLanguages = ['he', 'ar'];

  if ($.inArray(language, rtlLanguages) !== -1) {
    return 'rtl';
  } else {
    return 'ltr';
  }
}

function getLanguageList() {
  var languages = TAPi18n.getLanguages();
  var languageList = _.map(languages, function(value, key) {
    var selected = "";

    if (key == getUserLanguage()){
      selected = "selected";
    }

    // Gujarati isn't handled automatically by tap-i18n,
    // so we need to set the language name manually
    if (value.name == "gu"){
        value.name = "ગુજરાતી";
    }

    return {
      code: key,
      selected: selected,
      languageDetails: value
    };
  });

  if (languageList.length <= 1){
    return null;
  }

  return languageList;
}

function getCurrentGame(){
  var gameID = Session.get("gameID");

  if (gameID) {
    return Games.findOne(gameID);
  }
}

function getAccessLink(){
  var game = getCurrentGame();

  if (!game){
    return;
  }

  return Meteor.settings.public.url + game.accessCode + "/";
}


function getCurrentPlayer(){
  var playerID = Session.get("playerID");

  if (playerID) {
    return Players.findOne(playerID);
  }
}

function generateAccessCode(){
  var code = "";
  var possible = "abcdefghijklmnopqrstuvwxyz";

    for(var i=0; i < 6; i++){
      code += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return code;
}

function generateNewGame(){
  var game = {
    accessCode: generateAccessCode(),
    state: "waitingForPlayers",
    location: null,
    lengthInMinutes: 20,
    endTime: null,
    paused: false,
    pausedTime: null,

    rounds: [null, null, null, null, null],
    proposalCount: 0,
    proposing: true,
    proposedMissionVoting: false,
    mission: false,
    numOnMission: 0,
    victor: null,

    onMission: null
  };

  var gameID = Games.insert(game);
  game = Games.findOne(gameID);

  return game;
}

function generateNewPlayer(game, name){
  var player = {
    gameID: game._id,
    name: name,
    role: null,
    isSpy: false,
    isFirstPlayer: false,
    isProposing: false,
    isOnProposedMission: false,
    voted: false,
    approvalVote: null,
    isOnMission: false,
    missionVoted: false,
    missionVote: null,
  };

  var playerID = Players.insert(player);

  return Players.findOne(playerID);
}

function resetUserState(){
  var player = getCurrentPlayer();

  if (player){
    Players.remove(player._id);
  }

  Session.set("gameID", null);
  Session.set("playerID", null);
}

function trackGameState () {
  var gameID = Session.get("gameID");
  var playerID = Session.get("playerID");

  if (!gameID || !playerID){
    return;
  }

  var game = Games.findOne(gameID);
  var player = Players.findOne(playerID);

  if (!game || !player){
    Session.set("gameID", null);
    Session.set("playerID", null);
    Session.set("currentView", "startMenu");
    return;
  }

  if(game.state === "inProgress"){
    Session.set("currentView", "gameView");
  } else if (game.state === "waitingForPlayers") {
    Session.set("currentView", "lobby");
  }
}

function leaveGame () {
  var player = getCurrentPlayer();

  Session.set("currentView", "startMenu");
  Players.remove(player._id);

  Session.set("playerID", null);
}

function hasHistoryApi () {
  return !!(window.history && window.history.pushState);
}

initUserLanguage();

Meteor.setInterval(function () {
  Session.set('time', new Date());
}, 1000);

if (hasHistoryApi()){
  function trackUrlState () {
    var accessCode = null;
    var game = getCurrentGame();
    if (game){
      accessCode = game.accessCode;
    } else {
      accessCode = Session.get('urlAccessCode');
    }

    var currentURL = '/';
    if (accessCode){
      currentURL += accessCode+'/';
    }
    window.history.pushState(null, null, currentURL);
  }
  Tracker.autorun(trackUrlState);
}
Tracker.autorun(trackGameState);

window.onbeforeunload = resetUserState;
window.onpagehide = resetUserState;

FlashMessages.configure({
  autoHide: true,
  autoScroll: false
});

Template.main.helpers({
  whichView: function() {
    return Session.get('currentView');
  },
  language: function() {
    return getUserLanguage();
  },
  textDirection: function() {
    return getLanguageDirection();
  }
});

Template.footer.helpers({
  languages: getLanguageList
})

Template.footer.events({
  'click .btn-set-language': function (event) {
    var language = $(event.target).data('language');
    setUserLanguage(language);
  },
  'change .language-select': function (event) {
    var language = event.target.value;
    setUserLanguage(language);
  }
})

Template.startMenu.events({
  'click #btn-new-game': function () {
    Session.set("currentView", "createGame");
  },
  'click #btn-join-game': function () {
    Session.set("currentView", "joinGame");
  }
});

Template.startMenu.helpers({
  alternativeURL: function() {
    return "#";//Meteor.settings.public.alternative;
  }
});

Template.startMenu.rendered = function () {
  resetUserState();
};

Template.createGame.events({
  'submit #create-game': function (event) {
    var playerName = event.target.playerName.value;

    if (!playerName || Session.get('loading')) {
      return false;
    }

    var game = generateNewGame();
    var player = generateNewPlayer(game, playerName);

    Meteor.subscribe('games', game.accessCode);

    Session.set("loading", true);

    Meteor.subscribe('players', game._id, function onReady(){
      Session.set("loading", false);

      Session.set("gameID", game._id);
      Session.set("playerID", player._id);
      Session.set("currentView", "lobby");
    });

    return false;
  },
  'click .btn-back': function () {
    Session.set("currentView", "startMenu");
    return false;
  }
});

Template.createGame.helpers({
  isLoading: function() {
    return Session.get('loading');
  }
});

Template.createGame.rendered = function (event) {
  $("#player-name").focus();
};

Template.joinGame.events({
  'submit #join-game': function (event) {
    var accessCode = event.target.accessCode.value;
    var playerName = event.target.playerName.value;

    if (!playerName || Session.get('loading')) {
      return false;
    }

    accessCode = accessCode.trim();
    accessCode = accessCode.toLowerCase();

    Session.set("loading", true);

    Meteor.subscribe('games', accessCode, function onReady(){
      Session.set("loading", false);

      var game = Games.findOne({
        accessCode: accessCode
      });

      if (game) {
        Meteor.subscribe('players', game._id);
        player = generateNewPlayer(game, playerName);

        if (game.state === "inProgress") {
          var default_role = game.location.roles[game.location.roles.length - 1];
          Players.update(player._id, {$set: {role: default_role}});
        }

        Session.set('urlAccessCode', null);
        Session.set("gameID", game._id);
        Session.set("playerID", player._id);
        Session.set("currentView", "lobby");
      } else {
        FlashMessages.sendError(TAPi18n.__("ui.invalid access code"));
        //GAnalytics.event("game-actions", "invalidcode");
      }
    });

    return false;
  },
  'click .btn-back': function () {
    Session.set('urlAccessCode', null);
    Session.set("currentView", "startMenu");
    return false;
  }
});

Template.joinGame.helpers({
  isLoading: function() {
    return Session.get('loading');
  }
});


Template.joinGame.rendered = function (event) {
  resetUserState();

  var urlAccessCode = Session.get('urlAccessCode');

  if (urlAccessCode){
    $("#access-code").val(urlAccessCode);
    $("#access-code").hide();
    $("#player-name").focus();
  } else {
    $("#access-code").focus();
  }
};

Template.lobby.helpers({
  game: function () {
    return getCurrentGame();
  },
  accessLink: function () {
    return getAccessLink();
  },
  player: function () {
    return getCurrentPlayer();
  },
  players: function () {
    var game = getCurrentGame();
    var currentPlayer = getCurrentPlayer();

    if (!game) {
      return null;
    }

    var players = Players.find({'gameID': game._id}, {'sort': {'name': 1}}).fetch();

    players.forEach(function(player){
      if (player._id === currentPlayer._id){
        player.isCurrent = true;
      }
    });

    return players;
  },
  isLoading: function() {
    var game = getCurrentGame();
    return game.state === 'settingUp';
  },
  notEnoughPeople: function() {
    var game = getCurrentGame();
    return Players.find({gameID: game._id}).fetch().length < 5;
  }
});

Template.lobby.events({
  'click .btn-leave': leaveGame,
  'click .btn-start': function () {
    var game = getCurrentGame();
    if (Players.find({gameID: game._id}).fetch().length >= 5) {
      Games.update(game._id, {$set: {state: 'settingUp'}});
      Games.update(game._id, {$set: {numOnMission: getNumMissionPlayers()}});
    } else {
      console.log("Too few players");
    }
  },
  'click .btn-toggle-qrcode': function () {
    $(".qrcode-container").toggle();
  },
  'click .btn-remove-player': function (event) {
    var playerID = $(event.currentTarget).data('player-id');
    Players.remove(playerID);
  },
  'click .btn-edit-player': function (event) {
    var game = getCurrentGame();
    resetUserState();
    Session.set('urlAccessCode', game.accessCode);
    Session.set('currentView', 'joinGame');
  }
});

Template.lobby.rendered = function (event) {
  var url = getAccessLink();
  var qrcodesvg = new Qrcodesvg(url, "qrcode", 250);
  qrcodesvg.draw();
};

function getTimeRemaining(){
  var game = getCurrentGame();
  var localEndTime = game.endTime - TimeSync.serverOffset();

  if (game.paused){
    var localPausedTime = game.pausedTime - TimeSync.serverOffset();
    var timeRemaining = localEndTime - localPausedTime;
  } else {
    var timeRemaining = localEndTime - Session.get('time');
  }

  if (timeRemaining < 0) {
    timeRemaining = 0;
  }

  return timeRemaining;
}

Template.gameView.helpers({
  game: getCurrentGame,
  player: getCurrentPlayer,
  players: function () {
    var game = getCurrentGame();

    if (!game){
      return null;
    }

    var players = Players.find({
      'gameID': game._id
    }, {'sort': {'name' : 1}});

    return players;
  },
  locations: function () {
    return locations;
  },
  gameFinished: function () {
    var timeRemaining = getTimeRemaining();

    return timeRemaining === 0;
  },
  timeRemaining: function () {
    var timeRemaining = getTimeRemaining();

    return moment(timeRemaining).format('mm[<span>:</span>]ss');
  },
  proposedPlayers: function () {
    var proposedPlayers = Players.find({'gameID': Session.get("gameID"), 'isOnProposedMission': true}).fetch();
    return proposedPlayers;
  },
  numApprovalVotes: function() {
    return Players.find({'gameID': Session.get('gameID'), 'approvalVote': 'approve'}).count();
  },
  numRejectVotes: function() {
    return Players.find({'gameID': Session.get('gameID'), 'approvalVote': 'reject'}).count();
  },
  totalVotesNeeded: function() {
    return Players.find({'gameID': Session.get('gameID')}).count();
  },
  numPlayersNeededOnMission: function() {
    return getNumMissionPlayers();
  },
  gameEnd: function() {
    return getCurrentGame().victor != null;
  },
  spyVictory: function() {
    return getCurrentGame().victor == 'spy';
  }
});

Template.gameView.events({
  'click .btn-leave': leaveGame,
  'click .btn-end': function () {
    var game = getCurrentGame();
    Games.update(game._id, {$set: {state: 'waitingForPlayers'}});
  },
  'click .btn-toggle-status': function () {
    $(".status-container-content").toggle();
  },
  'click .game-countdown': function () {
    var game = getCurrentGame();
    var currentServerTime = TimeSync.serverTime(moment());

    if(game.paused){
      var newEndTime = game.endTime - game.pausedTime + currentServerTime;
      Games.update(game._id, {$set: {paused: false, pausedTime: null, endTime: newEndTime}});
    } else {
      Games.update(game._id, {$set: {paused: true, pausedTime: currentServerTime}});
    }
  },
  'click .player-name': function (event) {
    if (getCurrentGame().proposing && getCurrentPlayer().isProposing
        && Players.find({ 'gameID': Session.get("gameID"),
            'isOnProposedMission' : true}).count() < getNumMissionPlayers()) {
      //event.target.className = 'player-name-selected';
      addToProposal(Session.get("gameID"), event.target.dataset.name);
    }
  },
  'click .first-player-indicator': function (event) {
    event.cancelBubble = true;
    event.stopPropagation();
  },
  'click .player-name-selected': function(event) {
    removeFromProposal(Session.get("gameID"), event.target.dataset.name);
    event.target.className = 'player-name';
  },
  'click .location-name': function (event) {
    event.target.className = 'location-name-striked';
  },
  'click .location-name-striked': function(event) {
    event.target.className = 'location-name';
  },
  'click .btn-proposal-submit': function() {
    submitProposal();
  },
  'click .proposalVote': function(event) {
    Players.update(getCurrentPlayer()._id, {$set: {'voted': true,
        'approvalVote': event.target.dataset.value}});
    console.log(Players.find({ 'gameID': Session.get("gameID"),
        'voted' : false}).count());
    if (Players.find({ 'gameID': Session.get("gameID"),
        'voted' : false}).count() == 0) {
      var players = Players.find({ 'gameID': Session.get("gameID")}).fetch();
      var approves = 0;
      var rejects = 0;
      for (var i = 0; i < players.length; ++i) {
        if (players[i].approvalVote == 'approve') {
          approves++;
        } else {
          rejects++;
        }
      }
      Players.find({'gameID': Session.get('gameID')}).fetch().forEach(function(player) {
        Players.update(player._id, {$set: {'voted': false, 'approvalVote': null}});
      });
      if (approves > rejects) {
        proposalApproved(Session.get("gameID"));
      } else {
        proposalRejected(Session.get("gameID"));
      }
    }
  },
  'click .missionVote': function(event) {
    Players.update(getCurrentPlayer()._id, {$set: {'missionVoted': true,
        'missionVote': event.target.dataset.value}});
    if (Players.find({ 'gameID': Session.get("gameID"), 'isOnMission': true,
        'missionVoted' : false}).count() == 0) {
      var players = Players.find({ 'gameID': Session.get("gameID"), 'isOnMission': true}).fetch();
      var passes = 0;
      var fails = 0;
      for (var i = 0; i < players.length; ++i) {
        if (players[i].missionVote == 'pass') {
          passes++;
        } else {
          fails++;
        }
      }
      Players.find({'gameID': Session.get('gameID'), 'isOnMission': true}).fetch().forEach(function(player) {
        Players.update(player._id, {$set: {'missionVoted': false, 'missionVote': null, 'isOnMission': false}});
      });
      Games.update(Session.get("gameID"), {$set: {'mission': false, 'proposing': true, 'proposalCount': 0}});
      if (fails > 0) {
        missionFail(Session.get("gameID"));
      } else {
        missionPass(Session.get("gameID"));
      }
    }
  }
});
