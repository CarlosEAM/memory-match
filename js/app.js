/*
 * TODO:
 * restart button
 * timer
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

let resetGame = function(){
  // flip all cards back.
  setTimeout(function(){
    $('.flip-card').on('click', playerMove);
    flipCard($('.flip-card'));
  }, 400);
  // reset all settings and shuffle cards after they are turned
  setTimeout(function(){
    gameSettings.previousCard = null;
    gameSettings.cardsFlipped = 0;
    gameSettings.cardPairsFound = 0;
    shuffleCards($('.cards'));
  }, 800);
}

// prepare game after page load
$(initGame);