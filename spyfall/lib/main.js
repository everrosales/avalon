function beginNextRound() {

}

function rotateProposal(gameID) {

}

function submitProposal() {

}

function proposalApproved(gameID) {
  var game = Games.find({'accessCode': gameID}).fetch()[0];
  Games.update(game._id, {$set : {'proposalCount': 0}});
  beginMissionVoting(gameID);

}

function proposalRejected(gameID) {
  var game = Games.find({'accessCode': gameID}).fetch()[0];
  if (game.proposalCount == 4) {
    missionFail(game.accessCode);
  } else {
    game.proposalCount++;
    Games.update(game._id, {$set: {'proposalCount': game.proposalCount}});
    rotateProposal(gameID);
  }
}

function beginApprovalVoting() {

}

function beginMissionVoting(gameID) {
  // Assumes that a proposal was approved and was thus set
  var game = Games.find({'accessCode': gameID}).fetch()[0];
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
  Players.find({}).forEach(function (player) {
    player.update(player._id, {$set: {'isOnMission': false}});
  });
  if (round == 4) {
    endGame(gameID);
  } else {
    beginNextRound(gameID);
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
  Players.find({}).forEach(function (player) {
    player.update(player._id, {$set: {'isOnMission': false}});
  });
  if (round == 4) {
    endGame(gameID);
  } else {
    beginNextRound(gameID);
  }
}

function endGame(gameID) {
  alert("game over");
}
