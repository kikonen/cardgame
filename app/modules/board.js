define([
  "app",
  "modules/card",
  "modules/deck"
],
function(
  app,
  Card,
  Deck) {

  var Board = app.module();

  Board.MAIN_DECK_ID = 1;
  Board.OPEN_DECK_ID = 2;

  if (window.IE) {
    Board.TRANSFER_TYPE = "Text";
  } else {
    Board.TRANSFER_TYPE = "text/x-card";
  }

  Board.DESKTOP_EVENTS = {
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
      "click .deck": "onDeckClick"
    };

  Board.MOBILE_EVENTS = {
      "touchend .cardback": "onCardClick",
      "touchend .deck": "onTouchEnd",
      "touchend .cardfront": "onTouchEnd",
      "touchend #board": "onTouchBoard"
    };

  /**
   * Keep track of current touch-DnD state
   */
  Board.drag = {
    parent: null,
    orig: null,
    clone: null,
    $orig: null,
    $clone: null,
    offsetX: 0,
    offsetY: 0,
    deck: null,
    card : null,

    isEmpty: function() {
      return this.clone === null;
    },

    reset: function() {
      if (this.$orig !== null) {
        this.$orig.removeClass("card-dragged");
      }
      if (this.parent && this.clone) {
        this.parent.removeChild(this.clone);
      }

      this.parent = null;
      this.orig = null;
      this.clone = null;
      this.$orig = null;
      this.$clone = null;

      this.offsetX = 0;
      this.offsetY = 0;

      this.deck = null;
      this.card = null;
    },

    start: function(orig, x, y) {
      this.orig = orig;
      this.$orig = $(this.orig);

      // NOTE KI experimented "touchmove"
      // => check to utilize this instead of DnD in desktop
      if (false) {
      this.parent = window.document.documentElement;
      this.clone = orig.cloneNode(true);

      this.$clone = $(this.clone);

      this.$clone.css("z-index", 10000);

      var pos = this. $orig.offset();
      var origLeft = pos.left;
      var origTop = pos.top;
      this.offsetX = origLeft - x;
      this.offsetY = origTop - y;
      this.moveTo(x, y);

      this.parent.appendChild(this.clone);
      }

      this.$orig.addClass("card-dragged");

      this.card = Board.getCard(this.$orig);
      this.deck = Board.getDeck(this.$orig);
    },

    moveTo: function(x, y) {
      if (this.$clone) {
        this.$clone.css("left", (x + this.offsetX) + "px");
        this.$clone.css("top", (y + this.offsetY) + "px");
      }
    }
    };

  /**
   * @param deck can be null
   * @return true if deck is main deck
   */
  Board.isMain = function(deck) {
    return deck !== null && deck.get("id") === Board.MAIN_DECK_ID;
  };

  /**
   * @param deck can be null
   * @return true if deck is open deck
   */
  Board.isOpen = function(deck) {
    return deck !== null && deck.get("id") === Board.OPEN_DECK_ID;
  };

  /**
   * @return card, null if no card found
   */
  Board.getCard = function($el) {
      var view = $el.backboneView(Card.Views.CardFrontLayout);
      if (view === null) {
        view = $el.backboneView(Card.Views.CardBackLayout);
      }
      return view !== null ? view.model : null;
  };

  /**
   * @return deck, null if no deck found
   */
  Board.getDeck = function($el) {
      var view = $el.backboneView(Deck.Views.Layout);
      return view !== null ? view.model : null;
  };

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
        return event.sourceDeckId === Board.OPEN_DECK_ID;
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
        return event.sourceDeckId === Board.MAIN_DECK_ID;
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
            var suite = card.get("suite");
            var value = card.get("value");

            if (deckSuite) {
              valid = deckSuite === suite;
            } else {
              valid = true;
            }

            if (valid) {
              if (highestValue) {
                valid = value === highestValue + 1;
              } else {
                valid = value === Card.VALUE_ACE;
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

      return validCount === event.cards.length;
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
            var value = card.get("value");

            if (topCard) {
              valid = topCard.isAlternateColor(card);
            } else {
              valid = true;
            }

            if (valid) {
              if (lowestValue) {
                valid = value === lowestValue - 1;
              } else {
                valid = value === Card.VALUE_KING;
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

      return validCount === event.cards.length;
    };

    return deck;
  };

  Board.createMainDeckView = function(deck) {
    var view = new Deck.Views.MainLayout({model: deck});
    view.$el.addClass("deck-top-row main-deck");
    return view;
  };

  Board.createOpenDeckView = function(deck) {
    var view = new Deck.Views.MainLayout({model: deck});
    view.$el.addClass("deck-top-row open-deck");
    return view;
  };

  Board.createTopDeckView = function(deck, index) {
    var view = new Deck.Views.MainLayout({model: deck});
    view.$el.addClass("deck-top-row top-deck top-deck-" + index);
    return view;
  };

  Board.createPlayDeckView = function(deck, index) {
    var view = new Deck.Views.MainLayout({model: deck});
    view.$el.addClass("deck-play-row play-deck play-deck-" + index);
    return view;
  };

  Board.Model = Backbone.Model.extend({
    inDeck: null,
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
      Board.drag.reset();

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

    events: window.MOBILE ? Board.MOBILE_EVENTS : Board.DESKTOP_EVENTS,

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
      Board.drag.reset();

      var $el = $(event.target);
      var card = Board.getCard($el);
      var deck = Board.getDeck($el);

      if (deck !== null) {
        var cardIds = deck.cardIdsFrom(card);

        var data = {
            deckId: deck.get("id"),
            cardIds: cardIds};

        event.originalEvent.dataTransfer.setData(
            Board.TRANSFER_TYPE,
            JSON.stringify(data));

        // NOTE KI hidden caused DnD to not work with chrome
        $(event.target).addClass("card-dragged");
      }
    },

    onDragEnd: function (event) {
      // TODO KI anything?
        // NOTE KI hidden caused DnD to not work with chrome
      $(event.target).removeClass("card-dragged");
      Board.drag.reset();
    },

    onDragDrop: function(event){
      Board.drag.reset();

      var data = JSON.parse( event.originalEvent.dataTransfer.getData(Board.TRANSFER_TYPE) );

      var sourceDeckId = data.deckId;

      var $el = $(event.target);
      var targetDeck = Board.getDeck($el);

      if (targetDeck !== null) {
        var targetDeckId = targetDeck.get("id");

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
      Board.drag.reset();

      var $el = $(event.target);
      var deck = Board.getDeck($el);
      if (deck !== null) {
        if (deck === this.model.mainDeck) {
          deck.offerCards(3, this.model.openDeck.get("id"), true);
        } else {
          if (deck.cards.length > 0) {
            deck.showCards(1);
          }
        }
      }
    },

    onDeckClick: function (event) {
      Board.drag.reset();

      var $el = $(event.target);
      var deck = Board.getDeck($el);
      if (deck !== null) {
        var openDeck = this.model.openDeck;

        if (deck === this.model.mainDeck) {
          if (deck.cards.length === 0) {
            openDeck.offerCards(openDeck.cards.length, deck.get("id"), false);
          }
        }
      }

      Board.drag.reset();
    },

    onTouchBoard: function(event) {
      Board.drag.reset();
    },

    onTouchEnd: function(event) {
      if (event.currentTarget !== event.target) {
        return;
      }

      var sourceDeck = Board.drag.deck;
      var sourceCard = Board.drag.card;

      var $el = $(event.target);
      var card = Board.getCard($el);
      var deck = Board.getDeck($el);

      if (sourceCard === null) {
        if (Board.isMain(deck) && deck.cards.length === 0) {
          // only "main" is valid in this case
          this.onDeckClick(event);
        } else {
          if (card !== null && card.get("front") && !Board.isMain(deck)) {
            // start "drag"
            Board.drag.start(event.target, 0, 0);
          }
        }
      } else {
        if (deck === null || Board.isMain(deck)) {
          Board.drag.reset();
        } else {
          if (deck.get("id") !== sourceDeck.get("id") && !Board.isOpen(deck)) {
            Board.drag.reset();

            app.trigger(
                "card:offer", {
                    sourceDeckId: sourceDeck.get("id"),
                    targetDeckId: deck.get("id"),
                    cardIds: sourceDeck.cardIdsFrom(sourceCard),
                    show: true});
          } else if (deck.get("id") === sourceDeck.get("id")) {
            Board.drag.reset();
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
