/* TODO:
    2. Give players some options:
      2.1 select another set of memory pictures.
      2.2 change game theme.
 */

let gameSettings = {};
let gameLeaderboard;

/**
* @description initialise the game
*/
let initGame = function() {
  console.log(gameLeaderboard)
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

  // create leaderboard if local storage support
  if (typeof(Storage) !== "undefined") {
    // leaderboard instance
    gameLeaderboard = new Leaderboard();
  } else {
    gameLeaderboard = "Unable to create leaderboard. Sorry you don't have local storage support";
    console.log(gameLeaderboard);
  }

  // shuffle cards
  shuffleCards($('.cards'));

  // set event listeners
  cardsDeck.on('click', playerMove);

  // set event listener on reset buttons
  $('.reset').on('click', resetGame);

  // set listener for Leaderboard modal
  $('.continue').on('click', function() {
    // setModalContent();
    gameLeaderboard.displayScores();
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
      // diactivate reset button until animation is done
      $('.reset').off('click', resetGame);
      // reactivate reset after 1 second, which should be enough time for animation to complete
      setTimeout(()=>{
        $('.reset').on('click', resetGame);
      }, 1000);
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
* @description resets the game so player can start again
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

/** TODO: YOU MAY DELETE THIS IN TIME!
* @description prep the modal content
*/
let setModalContent = function() {
  // update the leaderboard if avaiable
    if (typeof(Storage) !== "undefined") {
      updateLeaderboard();
    }
  // sets latest score on top of leaderboard
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
  },
  retrieveTime: function() {
    let secs = (theTimer.seconds < 10)?"0" + theTimer.seconds:theTimer.seconds;
    let mins = (theTimer.minutes < 10)?"0" + theTimer.minutes:theTimer.minutes;
    let theTime = String(mins + ":" + secs);
    return theTime;
  }
};

class Leaderboard {
  /**
  * @description Represents the game leaderboard
  * @construtor
  */
  constructor() {
    $('.leaderboard').html("");
    $('.leaderboard').append('<caption>LEADERBOARD</caption>');
    $('.leaderboard').append('<tr class="table-header"><th>&#35</th><th>Name</th><th>Moves</th><th>Time</th><th>Stars</th></tr>');
  }
  /**
  * @description getter to retrieve scoreboard from localStorage
  * @returns {array of objects} scores
  */
  get retrieveScores() {
    let scores = [];
    let length = localStorage.getItem("leaderboardSize");
    if (length > 0) {
      for (let i=0; i < length; i++) {
        scores[i] = {
          name: localStorage.getItem("name"+i),
          time: localStorage.getItem("time"+i),
          moves: localStorage.getItem("moves"+i),
          stars: localStorage.getItem("stars"+i)
        };
      };
    }else{
      scores = false;
    }
    return scores;
  }
  /**
  * @description Takes the values and compares them according to moves and time into new array, update.
  * @param {array of object} latest - Scores from the game just played
  * @param {array of objects} localScores - Scores from previous games saved in localStorage
  * @returns {array of objects} update
  */
  compareScores(latest, localScores) {
    let localSize = parseInt(localStorage.getItem("leaderboardSize"));
    let latestPush = true; // to stop interation if pushed to update array
    let moves = parseInt(latest[0].moves);
    let time = parseInt(latest[0].time);
    let update = [];
    // take the latest and local scores and compare them
    localScores.forEach( (local, index) => {
      if (latestPush) {
        if (moves < parseInt(local.moves)) {
          update.push(latest[0]);
          latestPush = false;
        }else if (moves > parseInt(local.moves)) {
          update.push(local);
        }else if (moves == parseInt(local.moves)) {
          if (time <= parseInt(local.time)) {
            update.push(latest[0]);
            latestPush = false;
          }else{
            update.push(local);
          }
        }
      }
      // Address issue of the leaderboard scores not moving up when the latest is inserted before the end
      if (!latestPush && index < (localSize - 1)) {
        update.push(local)
      }
      // Address issue of using the forEach loop when localsize is less than 5
      if ( (index + 1) == localSize && 5 > localSize) {
        if (latestPush) {
          update.push(latest[0]);
        }else{
          update.push(local);
        }
      } 
    });
    return update;
  }
  /**
  * @description gathers the last games score results and leaderboard stored in localStorage updating the modal and localstorage
  */
  prepareScores() {
    let update;
    // gather the latest score results
    let latest = [{
      name: $('.player-name').prop('value'),
      time: theTimer.retrieveTime(),
      moves: gameSettings.moves,
      stars: (gameSettings.moves < 13)?3:(gameSettings.moves > 18)?1:2
    }];
    // gather local scores, if any
    let localScores = this.retrieveScores;
    // make sure localstorage data exists before comparing
    if (localScores) {
      update = this.compareScores(latest, localScores);
    }else{
      update = latest;
    }
    this.updateModal(update);
    this.updateLocalStorage(update);
  }
  /**
  * @description Updates the modal window using HTML tags adding the new scoreboard information
  * @param {array of objects} update - Updated scoreboard
  */
  updateModal(update) {
    // set latest score information at top of modal
    $('.modal-info-time').text(theTimer.retrieveTime());
    $('.modal-info-moves').text(gameSettings.moves);
    // append each score to the modal, done once per game completion
    update.forEach( (item, index) => {
      $('.leaderboard').append('<tr class="board-row"></tr>');
      $('.board-row:last-child').append($('<td></td>').text(index + 1));
      $('.board-row:last-child').append($('<td></td>').text(item.name));
      $('.board-row:last-child').append($('<td></td>').text(item.moves));
      $('.board-row:last-child').append($('<td></td>').text(item.time));
      $('.board-row:last-child').append($('<td></td>').text(item.stars));
    });
  }
  /**
  * @description Updates the localStorage with the latest scoreboard
  * @param {array of objects} update - Updated scoreboard
  */
  updateLocalStorage(update) {
    localStorage.setItem("leaderboardSize", update.length);
    update.forEach( (item, i) => {
      localStorage.setItem("name" + i, item.name);
      localStorage.setItem("time" + i, item.time);
      localStorage.setItem("moves" + i, item.moves);
      localStorage.setItem("stars" + i, item.stars);
    })
  }
  /**
  * @description Brings the modal window to the front displaying the leaderboard and last game scores
  */
  displayScores() {
    this.prepareScores();
    $('#myModal').modal();
  }
}

// prepare game after page load
$(initGame);