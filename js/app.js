let model = {
  currentCardFlip: null,
  lastCardFlip: null,
  timerStarted: false,
  score: 3,
  activeDeckTheme: 'poker',
  deckOfCards: [
    {
      theme: "poker",
      size: 8,
      coverDesign: {
        image: '../images/card-themes/poker/poker-card-logo.png',
        alt: 'card cover design'
      },
      cardPicture: [
        {
          image: '../images/card-themes/poker/yukisan.png',
          alt: 'yukisan card'
        },
        {
          image: '../images/card-themes/poker/secretary.png',
          alt: 'secretary'
        },
        {
          image: '../images/card-themes/poker/spiral-eyes.png',
          alt: 'spiral eyes'
        },
        {
          image: '../images/card-themes/poker/lady-ninja.png',
          alt: 'lady ninja'
        },
        {
          image: '../images/card-themes/poker/plant-me.png',
          alt: 'plant me'
        },
        {
          image: '../images/card-themes/poker/swirl-lady.png',
          alt: 'swirl lady'
        },
        {
          image: '../images/card-themes/poker/haku.png',
          alt: 'haku'
        },
        {
          image: '../images/card-themes/poker/dragon.png',
          alt: 'dragon'
        },
      ],
      author: {
        name: 'Amy the Hatter',
        site: 'htts://amythehatter.com'
      }
    },
  ]
}

// Takes care of the cards deck viewing experience
let cardDeckView = {
  init: function() {
    // Start the view
    console.log("STARTING THE VIEW");

    this.gameBoard = document.querySelector('.game-board');

    this.render();

    console.log("CARD LISTENERS READY");

  },
  render: function() {
    console.log("RENDERING THE CARDS VIEW");

    // Clear gameBoard
    this.gameBoard.html = "";

    let activeTheme = octopus.getActiveDeckTheme();
    let cardDeck = octopus.getDeckOfCards(activeTheme);
    let nOfCards = cardDeck.size;
    let cardOrder = [];
    for (let i=1; i<=nOfCards*2; i++) {
      cardOrder.push(i);
    }

    let granparent, parent, childA, childB;
    let shuffle, loop = 0;

    console.log();
    console.log(cardOrder);

    // Loop it twice because its a memory game and the cards must repeat
    while (loop < 2) {
      cardDeck.cardPicture.forEach((card, i) => {
        // Create granparent element
        granparent = document.createElement('div');
        granparent.setAttribute('data-card', i);
        granparent.setAttribute('class', 'cards');

        // give the granparent a random position on the deck, shuffles deck.
        shuffle = Math.round(Math.random() * cardOrder.length)
        granparent.style.order = cardOrder[shuffle];
        cardOrder.splice(shuffle, 1);

        // Create parents to hold the img children
        parent = document.createElement('div');
        parent.setAttribute('class', 'cards-wrapper');

        // Add the event listener to the parent
        parent.addEventListener('click', octopus.activeCard);

        // Create the img children
        childA = document.createElement('img');
        childB = document.createElement('img');
        childA.setAttribute('class', 'card-back');
        childA.setAttribute('src', cardDeck.coverDesign.image);
        childA.setAttribute('alt', cardDeck.coverDesign.alt);
        childB.setAttribute('class', 'card-face');
        childB.setAttribute('src', card.image);
        childB.setAttribute('alt', card.alt);

        // Get the family together
        parent.appendChild(childA);
        parent.appendChild(childB);
        granparent.appendChild(parent);
        this.gameBoard.appendChild(granparent);
      });
      loop++;
    }
  }
}


// Take care of the timer.
let timerView = {
  init: function() {
    console.log("STARTING THE TIMER");
  },
  render: function() {
    console.log("RENDERING THE TIMER VIEW");
  }
}


// Take care of rendering the score
let scoreView = {
  init: function() {
    console.log("STARTING THE SCORE");
  },
  render: function() {
    console.log("RENDERING THE SCORE VIEW");
  }
}


let octopus = {
  init: function() {
    // Load up the game
    console.log("STARTING THE OCTOPUS");

    cardDeckView.init();
    timerView.init();
    scoreView.init();
    
  },
  activeCard: function(event) {
    console.log("ACTIVE CARD");

    event.stopPropagation();
    let card = event.srcElement.parentElement.parentElement;

    // store the calling object
    if (octopus.getLastCardFlip()) {
      octopus.setCurrentCardFlip(card);
    }else{
      octopus.setLastCardFlip(card);
    }

    // lets flip it
    octopus.flipCard(card);

    // check if the same card was clicked on twice
    if (octopus.getLastCardFlip() === octopus.getCurrentCardFlip()) {
      octopus.resetDefaults();
      return;
    }

    // Check for a match
    if (octopus.getCurrentCardFlip()) {
      if (octopus.checkForMatch()) {
        // Found a match
        octopus.getLastCardFlip().children[0].removeEventListener('click', octopus.activeCard);
        this.removeEventListener('click', octopus.activeCard);
      }else{
        // Two cards dont match
        let cardA = octopus.getLastCardFlip();
        let cardB = octopus.getCurrentCardFlip();
        setTimeout(()=>{
          octopus.flipCard(cardA);
          octopus.flipCard(cardB);
        }, 800);
        
      }
      // reset card dafults
      octopus.resetDefaults();
    }

  },
  flipCard: function(card) {
    // to create the flip effect we must use the img parents parent as card
    if (card.getAttribute('class').includes('flip-card')) {
      card.setAttribute('class', 'cards');
    }else{
      card.setAttribute('class', 'cards flip-card');
    }
  },
  checkForMatch: function() {
    if (this.getLastCardFlip().dataset.card === this.getCurrentCardFlip().dataset.card) {
      return true;
    }else{
      return false;
    }
  },
  resetDefaults: function() {
    this.setLastCardFlip(null);
    this.setCurrentCardFlip(null);
  },
  setCurrentCardFlip: function(card) {
    model.currentCardFlip = card;
  },
  setLastCardFlip: function(card) {
    model.lastCardFlip = card;
  },
  getCurrentCardFlip: function() {
    return model.currentCardFlip;
  },
  getLastCardFlip: function() {
    return model.lastCardFlip;
  },
  getDeckOfCards: function(deckTheme) {
    let theDeck;
    model.deckOfCards.forEach((deck)=> {
      if (deck.theme == deckTheme) {
        theDeck = deck;
      }else{
        theDeck = `Deck of cards ${deckTheme} NOT FOUND`;
      }
    });
    return theDeck;
  },
  getActiveDeckTheme: function() {
    return model.activeDeckTheme;
  }
}


// LAUNCH GAME
window.onload = function() {
  octopus.init();
}
