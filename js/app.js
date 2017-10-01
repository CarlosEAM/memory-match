/*
 * TODO:
 * star rating
 * moves counter
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
      checkCardsMatch($(this));
      gameSettings.cardsFlipped = 0;
    }
  }

  // when all pairs found activate popup window
  if (gameSettings.cardPairsFound == gameSettings.MAX_CARDS_PAIRS) {
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
* @description resets the game so player cna start again
*/
let resetGame = function(){
  // flip all cards back.
  setTimeout(function(){
    $('.flip-card').on('click', playerMove);
    theTimer.stop();
    flipCard($('.flip-card'));
  }, 400);
  // reset all settings and shuffle cards after they are turned
  setTimeout(function(){
    gameSettings.previousCard = null;
    gameSettings.cardsFlipped = 0;
    gameSettings.cardPairsFound = 0;
    theTimer.reset();
    shuffleCards($('.cards'));
  }, 800);
}

// timer object, starts, stops and restarts the timer
const theTimer = {
  minutes: 0,
  seconds: 0,
  startTimer: true,
  stopTimer: false,
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