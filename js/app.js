/*
 * TODO:
 * check if cards match
 * check if game is finished
 * congratulations popup
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
  gameSettings.GAME_BOARD = $('.game-board');
  gameSettings.cardsDeck = $('.cards');
  gameSettings.cardsDeckSize = gameSettings.cardsDeck.length;
  gameSettings.checkCardFlip = false;

  // shuffle cards
  shuffleCards(gameSettings.cardsDeck);

  // set event listener on game board, catch it blubbling and call playerMove();
  gameSettings.GAME_BOARD.on('click', 'div', playerMove);

};

/**
* @description Check players progress on card flips
* @param {$(this)} $(this) - the element caught on.click
*/
let playerMove = function() {
  // flip the card
  flipCard($(this));

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

// prepare game after page load
$(initGame);