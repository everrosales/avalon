/*var numOnMission = {
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
  return numOnMission[Players.find({gameID: game._id}).fetch().length][i];
}

function rotateProposal(gameID) {
  var game = Games.find({'accessCode':gameID}).fetch()[0];
  Games.update(game._id, {$set: {'proposal': []}});
  var players = Players.find({'gameID': game._id}, {'sort': {'name': 1}}).fetch();
  //var currentProposalPlayer;
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
  var game = Games.find({'accessCode': gameID}).fetch()[0];
  var round = 5 - game.rounds.reduce(function(preVal, curVal) {
    if (curVal) {
      return preVal;
    } else {
      return ++preVal;
    }
  }, 0);
  game.rounds[round] = "pass"
  Games.update(game._id, {$set: {rounds: game.rounds}});
  if (round == 4) {
    endGame(gameID);
  }
  Games.update(game._id, {$set : {'proposalCount': 0}});
  rotateProposal(gameID);
}

function missionFail(gameID) {
  var game = Games.find({'accessCode': gameID}).fetch()[0];
  var round = 5 - game.rounds.reduce(function(preVal, curVal) {
    if (curVal) {
      return preVal;
    } else {
      return ++preVal;
    }
  }, 0);
  game.rounds[round] = "fail"
  Games.update(game._id, {$set: {rounds: game.rounds}});
  if (round == 4) {
    endGame(gameID);
  }
  Games.update(game._id, {$set : {'proposalCount': 0}});
  rotateProposal(gameID);
}

function submitProposal() {
}
*/
/*
var addToProposal = function(gameID, username) {
  var player = Players.find({'name': username, 'gameID': gameID}).fetch()[0];
  Players.update(player._id, {$set: {'isOnProposedMission': true}});
  /*var game = Games.find({'accessCode': gameID}).fetch()[0];
  var proposedPlayers = game.proposal;
  proposedPlayers.push(username);
  game.update(game._id, {$set: {'proposal': proposedPlayers}});*/
/*
};

var removeFromProposal = function(gameID, username) {
  var player = Players.find({'name': username, 'gameID': gameID}).fetch()[0];
  Players.update(player._id, {$set: {'isOnProposedMission': false}});
  /*var game = Games.find({'accessCode': gameID}).fetch()[0];
  var proposedPlayers = game.proposal;
  var targetPlayer = proposedPlayers.indexOf(username);
  if (targetPlayer > -1) {
    delete proposedPlayers[targetPlayer];
  }
  game.update(game._id, {$set: {'proposal': proposedPlayers}});*/
/*
};

function toggleFromProposal(gameID, username) {
  var player = Players.find({'name': username, 'gameID': gameID}).fetch()[0];
  Players.update(player._id, {$set: {'isOnProposedMission': !player.isOnProposedMission}});
}

function proposalApproved(gameID) {
  var game = Games.find({'accessCode': gameID}).fetch()[0];
  Games.update(game._id, {$set : {'proposalCount': 0}});
  beginMissionVoting(gameID);
}

function proposalRejected(gameID) {
  var game = Games.find({'accessCode': gameID}).fetch()[0];
  if (game.proposalCount == 4) {
    missionFail(gameID);
    return;
  }
  Games.update(game._id, {$set: {'proposalCount': ++game.proposalCount}});
  rotateProposal(gameID);
}

function beginApprovalVoting() {

}

function beginMissionVoting(gameID) {
  // Assumes that a proposal was approved and was thus set
  var game = Games.find(gameID);
  var playersOnMission = games.propsal;
  Players.find({}).forEach(function (player) {
    if (playersOnMission.indexOf(player.name) > -1) {
      player.update(player._id, {$set: {'isOnMission': true}});
    } else {
      player.update(player._id, {$set: {'isOnMission': false}});
    }
  });
  Games.update(game._id, {$set : {'proposing': false, 'proposedMissionVoting': false, 'mission': true}});
}

function endGame(gameID) {

}
*/
