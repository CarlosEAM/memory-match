/*
 * TODO:
 * flip card on click
 * check if cards match
 * check if game is finished
 * congratulations popup
 * restart button
 * timer
 * star rating
 * moves counter
 */

/**
* @description initialise the game
*/
let initGame = function(){
  let cardDeck = $('.cards');

  // shuffle cards
  shuffleCards(cardDeck);

};


/**
* @description Shuffles the deck of cards regarless of size
* @param {Object} cards - a collection of <div> elements
*/
let shuffleCards = function(cards){
  let shuffle = 0;
  for (let deckSize=cards.length; deckSize > 0; deckSize--){
  	shuffle = Math.round(Math.random() * (deckSize - 1));
  	$(cards[shuffle]).css('order',deckSize);
  	cards.splice(shuffle,1);
  }
};

// prepare game after page load
$(initGame);