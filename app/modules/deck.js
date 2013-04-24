// Deck module
define([
  // Application.
  "app",
  "modules/card"
],
function(
  app,
  Card) {

  var Deck = app.module();

  Deck.Model = Backbone.Model.extend({
    stackHorizontal: false,
    stackVertical: false,
    // Is top-card automatically shown after card:accepted
    autoShow: false,
    expandCount: 0,
    id: 0,
    cards: null,

    initialize: function() {
      this.cards = new Card.Collection();
      this.cards.url = null;

      // cardIds offered
      app.on("card:offer", function(event) {
        if (event.targetDeckId === this.get("id")) {
          // request cards from source
          app.trigger("card:request", event);
        }
      }, this);

      // cards requested
      app.on("card:request", function(event) {
        if (event.sourceDeckId === this.get("id")) {
          var cards = this.cardsById(event.cardIds);

          // send cards
          app.trigger(
              "card:receive",
              _.extend({cards: cards}, event));
        }
      }, this);

      // cards received
      app.on("card:receive", function(event) {
        if (event.targetDeckId === this.get("id")) {
          if (this.acceptMove(event)) {
            // remove from source first
            app.trigger(
                "card:accepted",
                event);

              _.each(
                event.cards,
                function(card) { card.set("front", event.show); });

            this.cards.add(event.cards);

            app.trigger("game:move");
          }
        }
      }, this);

      // cards accepted; remove from source
      app.on("card:accepted", function(event) {
        if (event.sourceDeckId === this.get("id")) {
          this.cards.remove(event.cards);

          if (this.get("autoShow")) {
            this.showCards(1);
          }
        }
      }, this);
    },

    /**
     * @return true if all event.cards are accepted
     */
    acceptMove: function(event) {
      return false;
    },

    /**
     * start shuffle only if there ain't shuffle already in progress
     */
    shuffle: function() {
      var cards = this.cards;
      if (cards.url === null) {
        cards.url = app.apiRoot + "cards?order=shuffle";
        cards.fetch({
            reset: true,
            success: function(collection, response, options) {
              cards.url = null;
            },
            error: function(collection, response, options) {
              console.log("shuffle failed");
              cards.url = null;
            }
          });
      } else {
        console.log("ignore shuffle");
      }
    },

    /**
     * Get all cards starting from card
     */
    cardsFrom: function(card) {
      if (this.cards.length === 0) {
        return [];
      }

      var result = [];
      var idx = this.cards.indexOf(card);
      var i;

      for (i = idx; i < this.cards.length; i++) {
        result.push(this.cards.at(i));
      }

      return result;
    },

    /**
     * Get all cardIds starting from card
     */
    cardIdsFrom: function(fromCard) {
      return _.map(
          this.cardsFrom(fromCard),
          function(card) {
              return card.get("id"); });
    },

    /**
     * Get all cards matching cardIds
     */
    cardsById: function(cardIds) {
      var validIds = _.filter(
          cardIds,
          function(cardId) {
            return this.cards.get(cardId) !== null;
          }, this);

      return _.map(
          validIds,
          function(cardId) {
            return this.cards.get(cardId);
          }, this);
    },

    /**
     * Offer count top-most cards for targetDeckId
     */
    offerCards: function(count, targetDeckId, show) {
      if (this.cards.length === 0) {
        return;
      }

      var idx = this.cards.length - count;
      if (idx < 0) {
        idx = 0;
      }

      var cardIds = _.map(
          this.cardsFrom(this.cards.at(idx)),
          function(card) {
              return card.get("id"); });

      cardIds.reverse();

      app.trigger(
          "card:offer", {
              sourceDeckId: this.get("id"),
              targetDeckId: targetDeckId,
              cardIds: cardIds,
              show: show});
    },

    /**
     * Show count top-most cards in deck
     */
    showCards: function(count) {
      var idx = this.cards.length - count;
      if (idx < 0) {
        idx = 0;
      }

      for (var i = this.cards.length -1; i >= idx; i--) {
        this.cards.at(i).set("front", true);
      }
    }
  });

  Deck.Collection = Backbone.Collection.extend({
    model: Deck.Model
  });

  Deck.Views.Layout = Backbone.Layout.extend({
    template: "deck",
    tagName: "div",
    className: "deck empty-deck",

    initialize: function() {
      this.model.cards.on("change", this.render, this);
      this.model.cards.on("add", this.render, this);
      this.model.cards.on("remove", this.render, this);
      this.model.cards.on("reset", this.onReset, this);
    },

    onReset: function() {
      this.model.cards.url = null;
      if (this.model.length === 0) {
        app.trigger("deck:empty", {deck: this.model});
      } else {
        app.trigger("deck:ready", {deck: this.model});
      }
      this.render();
    },

    beforeRender: function() {
      var stackIndex = 0;
      var cardIndex = 0;
      var firstExpandedCardIndex = this.model.cards.length - this.model.get("expandCount");

      this.$el.removeClass("empty-deck");
      if (this.model.cards.length === 0) {
        this.$el.addClass("empty-deck");
      }

      this.model.cards.each(
        function(card) {
          var view;

          if (card.get("front")) {
            view = new Card.Views.FrontLayout({model: card});
          } else{
            view = new Card.Views.BackLayout({model: card});
          }

          if (cardIndex >= firstExpandedCardIndex) {
            view.stackIndex = stackIndex++;
            view.stackHorizontal = this.model.get("stackHorizontal");
            view.stackVertical = this.model.get("stackVertical");
          }

          this.insertView(view);

          cardIndex++;
        },
        this);
    }
  });

  Deck.Views.MainLayout = Deck.Views.Layout.extend({
    className: "deck top-row-deck main-deck"
  });

  return Deck;
});
