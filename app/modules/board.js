// Board module
define([
  // Application.
  "app",
  "modules/card",
  "modules/deck"
],

// Map dependencies from above array.
function(
  app,
  Card,
  Deck) {

  var Board = app.module();
  
  Board.MAIN_DECK_ID = 1;
  Board.OPEN_DECK_ID = 2;
  
  /**
   * Main deck of cards
   */
  Board.createMainDeck = function() {
    var deck = new Deck.Model({
        id: Board.MAIN_DECK_ID,
        stackVertical: false});

    // RULES:
    // 1) from open-deck
    deck.acceptMove = function(event) {
        return event.sourceDeckId == Board.OPEN_DECK_ID;
      };
    return deck;
  };

  /**
   * Currently opened cards from main deck
   */
  Board.createOpenDeck = function() {
    var deck = new Deck.Model({
        id: Board.OPEN_DECK_ID,
        stackHorizontal: true,
        expandCount: 3});

    // RULES:
    // 1) from main-deck
    deck.acceptMove = function(event) {
        return event.sourceDeckId == Board.MAIN_DECK_ID;
      };
    return deck;
  };

  /**
   * "suite" collection deck
   */
  Board.createTopDeck = function(deckId) {
    var deck = new Deck.Model({
        id: deckId});

    // RULES:
    // 1) same suite
    // 2) next growing number
    // 3) If empty, first card must be ACE
    deck.acceptMove = function(event) {
      var deckSuite = null;
      var highestValue = 0;
      
      if (this.cards.length > 0) {
        deckSuite = this.cards.at(0).get("suite");
        highestValue = this.cards.at(this.cards.length - 1).get("value");
      }

      var validCount = _.reduce(
          event.cards,
          function(count, card) {
            var valid = false;
            var suite = card.get("suite")
            var value = card.get("value")
            
            if (deckSuite) {
              valid = deckSuite == suite;
            } else {
              valid = true;
            }
            
            if (valid) {
              if (highestValue) {
                valid = value == highestValue + 1;
              } else {
                valid = value == Card.VALUE_ACE;
              }
            }
          
            if (!valid) {
              highestValue = Card.VALUE_KING;
            } else {
              deckSuite = suite;
              highestValue = value;
            }
            
            return valid ? count + 1 : count;
          },
          0);

      return validCount == event.cards.length;
    };

    return deck;
  };

  /**
   * Play deck: alternate suites colors
   */
  Board.createPlayDeck = function(deckId) {
    var deck = new Deck.Model({
        id: deckId,
        stackVertical: true,
        autoShow: true,
        expandCount: 52});

    // RULES:
    // 0) No-validation if "show == false"
    // 1) alternate color
    // 2) next decreasing number
    // 3) If empty, first card must be KING
    deck.acceptMove = function(event) {
      if (!event.show) {
        return true;
      }
      
      var lowestValue = 0;
      var topCard = null;
      
      if (this.cards.length > 0) {
        topCard = this.cards.at(this.cards.length - 1);
        lowestValue = topCard.get("value");
      }

      var validCount = _.reduce(
          event.cards,
          function(count, card) {
            var valid = false;
            var value = card.get("value")
            
            if (topCard) {
              valid = topCard.isAlternateColor(card);
            } else {
              valid = true;
            }
            
            if (valid) {
              if (lowestValue) {
                valid = value == lowestValue - 1;
              } else {
                valid = value == Card.VALUE_KING;
              }
            }
            
            if (!valid) {
              lowestValue = Card.VALUE_ACE;
            } else {
              topCard = card;
              lowestValue = value;
            }
            
            return valid ? count + 1 : count;
          }, 0);

      return validCount == event.cards.length;
    };
    
    return deck;
  };

  Board.createMainDeckView = function(deck) {
    var view = new Deck.Views.MainLayout({model: deck});
    view.$el.addClass("deck-top-row main-deck");
    return view;
  }

  Board.createOpenDeckView = function(deck) {
    var view = new Deck.Views.MainLayout({model: deck});
    view.$el.addClass("deck-top-row open-deck");
    return view;
  }

  Board.createTopDeckView = function(deck, index) {
    var view = new Deck.Views.MainLayout({model: deck});
    view.$el.addClass("deck-top-row top-deck top-deck-" + index);
    return view;
  }

  Board.createPlayDeckView = function(deck, index) {
    var view = new Deck.Views.MainLayout({model: deck});
    view.$el.addClass("deck-play-row play-deck play-deck-" + index);
    return view;
  }
  
  Board.Model = Backbone.Model.extend({
    mainDeck: null,
    openDeck: null,
    topDecks: null,
    playDecks: null,
    
    initialize: function() {
      var that = this;
      var i;
      var deckId = Board.OPEN_DECK_ID + 1;
      
      this.mainDeck = Board.createMainDeck();
      this.openDeck = Board.createOpenDeck();
      
      // 4 top decks
      this.topDecks = new Deck.Collection();
      for (i = 0; i < 4; i++) {
        this.topDecks.add(Board.createTopDeck(deckId++));
      }
      
      // 7 playing decks
      this.playDecks = new Deck.Collection();
      for (i = 0; i < 7; i++) {
        this.playDecks.add(Board.createPlayDeck(deckId++));
      }
      
      app.on("deck:ready", function() {
        that.deal();
      });
    },
    
    restart: function() {
      this.mainDeck.cards.reset([]);
      this.openDeck.cards.reset([]);
      this.topDecks.each( function(deck){ deck.cards.reset([]); } );
      this.playDecks.each( function(deck){ deck.cards.reset([]); } );
      
      this.mainDeck.shuffle();
    },

    /**
     * Deal cards to play decks
     */
    deal: function() {
      var i, j;
      
      for (i = 0; i < this.playDecks.length; i++) {
        for (j = i; j < this.playDecks.length; j++) {
          this.mainDeck.offerCards(1, this.playDecks.at(j).get("id"), false);
        }
        //code
      }
      
      this.playDecks.each(function(deck){ deck.showCards(1); });
      
      app.trigger("player:reset");
    }
  });

  Board.Collection = Backbone.Collection.extend({
    model: Board.Model
  });

  Board.Views.Layout = Backbone.Layout.extend({
    template: "board",
    
    events: {
      "dragstart .cardfront": "onDragStart",
      "drop .cardfront": "onDragDrop",
      "dragover .cardfront": "onDragOver",
      "dragenter .cardfront": "onDragEnter",
      "dragleave .cardfront": "onDragLeave",
      "dragend .cardfront": "onDragEnd",
      
      // for empty deck
      "drop .empty-deck": "onDragDrop",
      "dragover .empty-deck": "onDragOver",
      "dragenter .empty-deck": "onDragEnter",
      "dragleave .empty-deck": "onDragLeave",
      "dragend .empty-deck": "onDragEnd",

      // for
      // - main-deck offer
      // - open card from play deck
      "click .cardback": "onCardClick",
      "click .deck": "onDeckClick",
    },
    
    initialize: function() {
      app.on("game:restart", this.onRestart, this);
    },

    onDragEnter: function (event) {
      var object = $(event.target);
      object.addClass('card-hover');
    },
  
    onDragLeave: function (event) {
      var object = $(event.target);
      object.removeClass('card-hover');
    },
    
    onDragOver: function (event) {
      event.preventDefault();
    },
    
    onDragStart: function (event) {
      var $el = $(event.target);
      var cardView = $el.backboneView(Card.Views.CardFrontLayout);
      var deckView = $el.backboneView(Deck.Views.Layout);
      
      if (deckView != null) {
        var deck = deckView.model;
        
        var cardIds = _.map(
            deck.cardsFrom(cardView.model),
            function(card) {
                return card.get("id"); });
        
        var data = {
            deckId: deck.get("id"),
            cardIds: cardIds};
            
        event.originalEvent.dataTransfer.setData(
            "text/x-card",
            JSON.stringify(data));
        
        $(event.target).addClass("hidden");
      }
    },

    onDragEnd: function (event) {
      // TODO KI anything?
      $(event.target).removeClass("hidden");
    },
  
    onDragDrop: function(event){
      var data = JSON.parse(event.originalEvent.dataTransfer.getData("text/x-card"));

      var sourceDeckId = data.deckId;
      
      var targetView = $(event.target).backboneView(Deck.Views.Layout)
      if (targetView != null) {
        var targetDeckId = targetView.model.get("id");
  
        if (sourceDeckId !== targetDeckId) {
          app.trigger(
              "card:offer", {
                  sourceDeckId: sourceDeckId,
                  targetDeckId: targetDeckId,
                  cardIds: data.cardIds,
                  show: true});
        } else {
          console.log("REJECT:" + data);
        }
      }
    },

    onCardClick: function (event) {
      var $el = $(event.target);
      var deckView = $el.backboneView(Deck.Views.Layout);
      if (deckView != null) {
        var deck = deckView.model;
        
        if (deck == this.model.mainDeck) {
          deck.offerCards(3, this.model.openDeck.get("id"), true);
        } else {
          if (deck.cards.length > 0) {
            deck.showCards(1);
          }
        }
      }
    },

    onDeckClick: function (event) {
      var $el = $(event.target);
      var deckView = $el.backboneView(Deck.Views.Layout);
      if (deckView != null) {
        var deck = deckView.model;
        var openDeck = this.model.openDeck;
        
        if (deck == this.model.mainDeck) {
          if (deck.cards.length == 0) {
            openDeck.offerCards(openDeck.cards.length, deck.get("id"), false);
          }
        }
      }
    },
    
    onRestart: function() {
      console.log("restart");
      this.model.restart();
    },
    
    beforeRender: function() {
      this.setView( "#main-deck", Board.createMainDeckView(this.model.mainDeck));
      this.setView( "#open-deck", Board.createOpenDeckView(this.model.openDeck));
      
      for (i = 0; i < this.model.topDecks.length; i++) {
        this.setView( "#top-deck-" + i, Board.createTopDeckView(this.model.topDecks.at(i), i));
      }
      
      for (i = 0; i < this.model.playDecks.length; i++) {
        this.setView( "#play-deck-" + i, Board.createPlayDeckView(this.model.playDecks.at(i), i));
      }
    }
  });

  return Board;
});
