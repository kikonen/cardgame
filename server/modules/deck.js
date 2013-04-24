define([
  'backbone',
  'server/modules/card'
],
function(
  Backbone,
  Card) {

  var Deck = {};

  Deck.Model = Backbone.Model.extend({
    cars: null,
    map: null,

    initialize: function() {
      this.cards = new Card.Collection();

      var iconBase = 0;
      var idx = 0;
      var i;

      iconBase = 1;
      for (i = 1; i < 14; i++) {
        this.cards.add( new Card.Model({
            id: iconBase + (13 - i) * 4,
            suite: "club",
            value: (i === 13 ? 1 : i + 1),
            index: idx++,
            front: false}) );
      }

      iconBase = 2;
      for (i = 1; i < 14; i++) {
        this.cards.add( new Card.Model({
            id: iconBase + (13 - i) * 4,
            suite: "spade",
            value: (i === 13 ? 1 : i + 1),
            index: idx++,
            front: false}) );
      }

      iconBase = 3;
      for (i = 1; i < 14; i++) {
        this.cards.add( new Card.Model({
            id: iconBase + (13 - i) * 4,
            suite: "heart",
            value: (i === 13 ? 1 : i + 1),
            index: idx++,
            front: false}) );
      }

      iconBase = 4;
      for (i = 1; i < 14; i++) {
        this.cards.add( new Card.Model({
            id: iconBase + (13 - i) * 4,
            suite: "diamond",
            value: (i === 13 ? 1 : i + 1),
            index: idx++,
            front: false}) );
      }
    },

    /**
    * Create map of cards
    *
    * @return map of (id, card)
    */
   createMap: function() {
     var result = {};
     this.cards.each(function() {
        result["" + card.id] = card;
       });
     return result;
   }

  });

  /**
   * Shuffle cards[]
   */
  Deck.shuffle = function(cards) {
    var i;
    for (i = 0; i < cards.length; i++) {
      Deck.swap(cards, i);
    }
  };

  /**
   * Swap card fromIdx with random j in cards[]
   */
  Deck.swap = function(cards, fromIdx) {
    var destIdx = Math.round(Math.random() * cards.length);
    if (destIdx === cards.length) {
      destIdx = cards.length - 1;
    }
    var old = cards[destIdx];
    cards[destIdx] = cards[fromIdx];
    cards[fromIdx] = old;
  };

  return Deck;
});
