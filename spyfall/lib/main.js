function rotateProposal() {

}

function submitProposal() {

}

function proposalApproved() {

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
  if (round == 4) {
    endGame(gameID);
  }
}

function endGame(gameID) {

}
