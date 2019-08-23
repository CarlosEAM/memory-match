let model = {
  timerActive: false,
  timerCounter: null,
  score: 3,
  gameboard: null,
  currentCardFlip: null,
  lastCardFlip: null,
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
    // Get the timer view
    this.minutes = document.getElementsByClassName('timer-minutes')[0];
    this.seconds = document.getElementsByClassName('timer-seconds')[0];

    // Set a listener on the gameboard so we know when the first card is flipped
    let gameboard = octopus.getGameboard();
    gameboard.addEventListener('click', octopus.startTimer, true);
    
    // Reset the timer before anything else
    this.minutes.innerText = "00";
    this.seconds.innerText = "00";
  },
  render: function() {
    let s = parseInt(timerView.seconds.innerText);
    let m = parseInt(timerView.minutes.innerText);

    // When 59secs gone by then minute ticks over
    if (s == 59) {
      m = octopus.checkTime(m);
    }else if (m == 10) {
      // This is a quick game so lets assume that 10 minutes indicates player left game
      octopus.stopTimer();
    }else{
      m = "00";
    }

    // Carry on with the seconds
    s = octopus.checkTime(s);
    
    // Update the timer view
    timerView.seconds.innerText = s;
    timerView.minutes.innerText = m;
  }
}


// Take care of rendering the score
let movesView = {
  init: function() {
    this.movesWrapper = document.getElementsByClassName('moves-counter')[0];
  },
  render: function() {
    this.movesWrapper.innerText++;
  }
}


let octopus = {
  init: function() {
    // Load up the game
    console.log("STARTING THE OCTOPUS");

    model.gameboard = document.getElementsByClassName('game-board')[0];

    // TODO: REMOVE LISTENER. ONLY MEANT FOR TESTING NOT FOR PRODUCTION
    document.getElementsByClassName('btn-reset')[0].addEventListener('click', octopus.stopTimer);
    
    cardDeckView.init();
    timerView.init();
    movesView.init();
    
  },
  activeCard: function(event) {
    console.log("ACTIVE CARD");

    event.stopPropagation();
    let card = event.srcElement.parentElement.parentElement;

    // Prevent glitch when player clicks quickly many times in a row
    if (event.srcElement.className == 'cards-wrapper') {return}

    // Store the calling object
    if (octopus.getLastCardFlip()) {
      octopus.setCurrentCardFlip(card);
    }else{
      octopus.setLastCardFlip(card);
    }

    // Lets flip it
    octopus.flipCard(card);

    // The movesView is taking care of the moves counter
    movesView.render();

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
  getGameboard: function() {
    return model.gameboard;
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
  },
  startTimer: function() {
    // Remove the listener to stop multiple calls
    let gameboard = octopus.getGameboard();
    gameboard.removeEventListener('click', octopus.startTimer, true);

    // Start the timer interval
    model.timerCounter = setInterval(timerView.render, 1000);
  },
  stopTimer: function() {
    // Remove the interval and stopping the timer
    clearInterval(model.timerCounter);
    model.timerCounter = null;
  },
  checkTime: function(t) {
    t++;
    if (t < 10) {
      t = "0" + t;
    }
    return t;
  }
}


// LAUNCH GAME
window.onload = function() {
  octopus.init();
}
