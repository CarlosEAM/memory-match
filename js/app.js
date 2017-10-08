/* TODO:
    * ISSUE: if the player click on the reset button as soon as the second non matching pair
    is flipped then those two pairs are flipped again and are left facing forward after reset is done.
 */

let gameSettings = {};

/**
* @description initialise the game
*/
let initGame = function() {
  // init settings
  let cardsDeck = $('.cards');
  gameSettings.cardsToReset = $('.cards');
  gameSettings.cardsDeckSize = cardsDeck.length;
  gameSettings.previousCard = null;
  gameSettings.cardsFlipped = 0;
  gameSettings.MAX_CARDS_PAIRS = gameSettings.cardsDeckSize / 2;
  gameSettings.cardPairsFound = 0;
  // use to rate the player
  gameSettings.moves = 0;

  // check local storage is supported
  if (typeof(Storage) !== "undefined") {
    if (localStorage.cardGameSet == "undefined") {
      // set a dummy leader board
      let dummyBoard = dummyLeaderboard();
      setLeaderboard(dummyBoard);
    } else {
      // load the leaderboard from local storage
      displayLeaderboard();
    }
  } else {
    console.log("Unable to create leaderboard. Sorry you don't have local storage support");
  }

  // shuffle cards
  shuffleCards($('.cards'));

  // set event listeners
  cardsDeck.on('click', playerMove);

  // set event listener on reset buttons
  $('.reset').on('click', resetGame);

  // set listener for Leaderboard modal
  $('.continue').on('click', function() {
    setModalContent();
  })
};

/**
* @description Check players progress on card flips
* @param {Object} $(this) - the element caught on.click
*/
let playerMove = function() {
  // only flip cards or check for pairs if there are still available.
  if (gameSettings.cardPairsFound !== gameSettings.MAX_CARDS_PAIRS) {
    flipCard($(this));
    gameSettings.cardsFlipped++;
    if (gameSettings.cardsFlipped < 2) {
      gameSettings.previousCard = $(this);
      $(this).off();
    } else {
      // update the moves and then check the rating
      updateMovesCounter(true);
      ratePlayer();
      checkCardsMatch($(this));
      gameSettings.cardsFlipped = 0;
    }
  }
  // when all pairs found activate popup window
  if (gameSettings.cardPairsFound == gameSettings.MAX_CARDS_PAIRS) {
    theTimer.stop();
    ratePlayer();
    // wait ms for smooth transition
    setTimeout(function(){
      // wait for the last cards to confirm pairing before modal MESSAGE
      $('#inputModal').modal();
    }, 800);
  }

};

/**
* @description Flip over card to either hide or show it
* @param {Object} card - the div element the user clicked
*/
let flipCard = function(card) {
    // start timer on first card flip
    theTimer.start();
  	card.toggleClass('flip-card');
};

/**
* @description Shuffles the deck of cards regarless of size
* @param {Array} cards - a collection of <div> elements
*/
let shuffleCards = function(cards) {
  let shuffle = 0;
  for (let deckSize=cards.length; deckSize > 0; deckSize--) {
  	shuffle = Math.round(Math.random() * (deckSize - 1));
  	$(cards[shuffle]).css('order',deckSize);
  	cards.splice(shuffle,1);
  }
};

/**
* @description Check flipped cards for pairs keeping track of found pairs
* @param {Object} card - last card flipped
*/
let checkCardsMatch = function(card){
  // to keep previous card value in this context
  let previousCard = gameSettings.previousCard;
  if (card.data('card') == previousCard.data('card')){
    // if pair is found
    previousCard.off();
    card.off();
    // keep track of found pairs
    gameSettings.cardPairsFound++;
    setTimeout(function(){
      previousCard.toggleClass('rubberBand animated');
      card.toggleClass('rubberBand animated');
    }, 200, card, previousCard);
    setTimeout(function(){
      previousCard.toggleClass('rubberBand animated');
      card.toggleClass('rubberBand animated');
    }, 1000, card, previousCard);
  } else {
  	card.off();
  	setTimeout(function(){
      previousCard.toggleClass('wobble animated');
      card.toggleClass('wobble animated');
    }, 400, card, previousCard);
    setTimeout(function(){
  	  flipCard(previousCard);
  	  flipCard(card);
  	  previousCard.on('click', playerMove);
  	  card.on('click', playerMove);
      previousCard.toggleClass('wobble animated');
      card.toggleClass('wobble animated');
  	}, 1000, card, previousCard);
  }
}

/**
* @description resets the game so player caa start again
*/
let resetGame = function(){
  // disable the cards listener until reset is complete
  $('.cards').off('click', playerMove);
  // stop player from crashing game with multiple clicks
  $('.reset').off('click', resetGame);
  // check the timer needs stopping
  if (!theTimer.startTimer) {
    theTimer.stop();
  }
  // check a card has been flipped
  if ($('.flip-card').length > 0 || gameSettings.moves > 0) {
    flipCard($('.flip-card'));
    // reset all settings and shuffle cards after they are turned
    setTimeout(function(){
      gameSettings.previousCard = null;
      gameSettings.cardsFlipped = 0;
      gameSettings.cardPairsFound = 0;
      theTimer.reset();
      updateMovesCounter(false);
      $('.star-rating').css('opacity', '1');
      shuffleCards($('.cards'));
      $('.cards').on('click', playerMove);
      $('.reset').on('click', resetGame);
    }, 800);
  } else {
    shuffleCards($('.cards'));
    $('.cards').on('click', playerMove);
    $('.reset').on('click', resetGame);
  }
};

/**
* @description increase of decrease the moves counter
* @param {boolean} increase - true to increase the counter and false to reset it
*/
let updateMovesCounter = function(increase) {
  if (increase) {
    gameSettings.moves++;    
  } else {
    gameSettings.moves = 0;
  }
  $('.moves-counter').text(gameSettings.moves);
}

/**
* @description rates the player depending on number of moves
* @returns {number} players score rating
*/
let ratePlayer = function() {
  let moves = gameSettings.moves;
  if (moves == 12) {
    $('.star-rating')[2].style.opacity = 0;
    $('.star-rating')[5].style.opacity = 0;
  } else if (moves == 16) {
    $('.star-rating')[1].style.opacity = 0;
    $('.star-rating')[4].style.opacity = 0;
  } else {
    // do nothing
  }
}

/**
* @description prep the modal content
*/
let setModalContent = function() {
  // update the leaderboard if avaiable
    if (typeof(Storage) !== "undefined") {
      updateLeaderboard();
    }
  $('.modal-info-time').text($('.timer').text());
  $('.modal-info-moves').text(gameSettings.moves);
  if (typeof(Storage) !== "undefined") {
    displayLeaderboard();
  } else {
    $('.leaderboard').append("<tr><td>Leaderboard unavailable. Your browser does not support Web Storage</td></tr>");
  }
  $('#myModal').modal();
}

// timer object, starts, stops and restarts the timer
const theTimer = {
  minutes: 0,
  seconds: 0,
  startTimer: true,
  start: function() {
    if (this.startTimer) {
      this.startTimer = false;
      this.timer = setInterval(function() {
        theTimer.seconds++;
        theTimer.seconds = (theTimer.seconds == 60)?0:theTimer.seconds;
        if (theTimer.seconds == 0) {
          theTimer.minutes++;
        }
        let secs = (theTimer.seconds < 10)?"0" + theTimer.seconds:theTimer.seconds;
        let mins = (theTimer.minutes < 10)?"0" + theTimer.minutes:theTimer.minutes;
        $('.timer-minutes').text(mins);
        $('.timer-seconds').text(secs);
      }, 1000);
    }
  },
  stop: function() {
    clearInterval(theTimer.timer);
  },
  reset: function() {
    this.seconds = 0;
    this.minutes = 0;
    $('.timer-minutes').text("00");
    $('.timer-seconds').text("00");
    this.startTimer = true;
  }
};

/**
* @description create a dummy array of objects to setup the initial leaderboard
* @returns {array} an array of objects
*/
let dummyLeaderboard = function() {
  let dummyInfo = [{
    name: "Derelick",
    time: "01:01",
    moves: 12,
    stars: 3
  },{
    name: "Dave",
    time: "01:16",
    moves: 17,
    stars: 2
  },{
    name: "Millicent",
    time: "01:40",
    moves: 22,
    stars: 1
  }];
  localStorage.cardGameSet = true;
  return dummyInfo;
}

/**
* @description Updates the localStorage with new leaderboard results
* @param {array} boardUpdate - takes an array of assorted objects with latest results
*/
let setLeaderboard = function(boardUpdate) {
  let length = boardUpdate.length;
  localStorage.setItem("leaderboardSize", length);
  for (let i=0; i<length; i++) {
    localStorage.setItem("name" + i, boardUpdate[i].name);
    localStorage.setItem("time" + i, boardUpdate[i].time);
    localStorage.setItem("moves" + i, boardUpdate[i].moves);
    localStorage.setItem("stars" + i, boardUpdate[i].stars);
  };
}

/**
* @description Get the leaderboard from localStorage
* @return {array} of objects.
*/
let getLeaderboard = function() {
  let leaderboard = [];
  let length = localStorage.getItem("leaderboardSize");
  for (let i=0; i < length; i++) {
    leaderboard[i] = {
      name: localStorage.getItem("name"+i),
      time: localStorage.getItem("time"+i),
      moves: localStorage.getItem("moves"+i),
      stars: localStorage.getItem("stars"+i)
    };
  };
  return leaderboard;
}

/**
* @description Update leaderboard with current score information
*/
let updateLeaderboard = function() {
  // prep latest score content
  let secs = (theTimer.seconds < 10)?"0" + theTimer.seconds:theTimer.seconds;
  let mins = (theTimer.minutes < 10)?"0" + theTimer.minutes:theTimer.minutes;
  let theTime = String(mins + ":" + secs);
  let lastScore = {
    name: $('.player-name').prop('value'),
    time: theTime,
    moves: gameSettings.moves,
    stars: (gameSettings.moves < 13)?3:(gameSettings.moves > 18)?1:2
  }
  let currentBoard = getLeaderboard();
  let index = 0;
  let found = false;
  let count = 0;
  currentBoard.forEach(function(item, indice) {
    // check current score against scores in leaderboard
    if (lastScore.moves !== 0 && item.moves >= lastScore.moves) {
      if (item.moves == lastScore.moves) {
        // when both scores have the same number of moves check the time taken to complete
        if (item.time >= lastScore.time) {
          if (item.time == lastScore.time) {
            found = true;
            index = count;
          } else {
            if (!found) {
              found = true;
              index = count;
            }
          }
        }
      } else {
        if (!found) {
          found = true;
          index = count;
        }
      }
    }
    count++
  });
  // clear text from input box
  $('.player-name').prop('value', "");
  // add new score to the leaderboard array
  currentBoard.splice(index, 0, lastScore);
  // make sure leaderboard has no more than 5 entries
  if (currentBoard.length > 5) {
    currentBoard.splice(5, 1);
  };
  setLeaderboard(currentBoard);
}

/**
* @description Format leaderboard contents and display
*/
let displayLeaderboard = function() {
  let leaderboard = getLeaderboard();
  let index = 1;
  // empty the table prep headers for content
  $('.leaderboard').html("");
  $('.leaderboard').append('<caption>LEADERBOARD</caption>');
  $('.leaderboard').append('<tr class="table-header"><th>&#35</th><th>Name</th><th>Moves</th><th>Time</th><th>Stars</th></tr>');
  // get leaderboard format its content and output
  leaderboard.forEach(function(item) {
    $('.leaderboard').append('<tr class="board-row"></tr>');
    $('.board-row:last-child').append($('<td></td>').text(index));
    $('.board-row:last-child').append($('<td></td>').text(item.name));
    $('.board-row:last-child').append($('<td></td>').text(item.moves));
    $('.board-row:last-child').append($('<td></td>').text(item.time));
    $('.board-row:last-child').append($('<td></td>').text(item.stars));
    index++;
  });
}

// prepare game after page load
$(initGame);