/*
 * TODO:
 * Populate the modal window with all the game information
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

  // shuffle cards
  shuffleCards($('.cards'));

  // set event listeners
  cardsDeck.on('click', playerMove);

  // set event listener on reset buttons
  $('.reset').on('click', resetGame);
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
    // prep modal content before displaying
    setModalContent();
    setTimeout(function(){
      // wait for the last cards to confirm pairing before modal MESSAGE
      $('#myModal').modal();
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
  
  // flip all cards back.
  setTimeout(function(){
    theTimer.stop();
    // check if the has been started first to stop timer from starting
    if ($('.flip-card').length) {
      flipCard($('.flip-card'));
    }
    
  }, 400);

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
  }, 800);
}

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
    $('.star-rating')[5].style.opacity = 0;
  } else {
    // do nothing
  }
}

/**
* @description prep the modal content
*/
let setModalContent = function() {
  $('.modal-info-time').text($('.timer').text());
  $('.modal-info-moves').text(gameSettings.moves);
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
        theTimer.minutes = (theTimer.seconds == 0)?theTimer.minutes++:theTimer.minutes;
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

// prepare game after page load
$(initGame);