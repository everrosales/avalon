var numOnMission = { 5: [2,3,2,3,3],
                     6: [2,3,4,3,4],
                     7: [2,3,3,4,4],
                     8: [3,4,4,5,5],
                     9: [3,4,4,5,5],
                    10: [3,4,4,5,5]};

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

function rotateProposal() {

}

function submitProposal() {
 
}

function addToProposal(gameID, username) {
  var game = Games.find({'accessCode': gameID}).fetch()[0];
  var proposedPlayers = game.proposal;
  proposedPlayers.push(username);
  game.update(game._id, {$set: {'proposal': proposedPlayers}});
}

function removeFromProposal(gameID, username) {
  var game = Games.find({'accessCode': gameID}).fetch()[0];
  var proposedPlayers = game.proposal;
  var targetPlayer = proposedPlayers.indexOf(username);
  if (targetPlayer > -1) {
    delete proposedPlayers[targetPlayer];
  }
  game.update(game._id, {$set: {'proposal': proposedPlayers}});
}

function proposalApproved(gameID) {
  var game = Games.find({'accessCode': gameID}).fetch()[0];
  Games.update(game._id, {$set : {'proposalCount': 0}});
  beginMissionVoting(gameID);
}

function proposalRejected() {

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
  Games.update(game._id, {$set: {numOnMission: getNumMissionPlayers()}});
  if (round == 4) {
    endGame(gameID);
  }
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
  Games.update(game._id, {$set: {numOnMission: getNumMissionPlayers()}});
  if (round == 4) {
    endGame(gameID);
  }
}

function endGame(gameID) {

}
