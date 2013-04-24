// Card module
define([
  // Application.
  "app"
],
function(app) {
  var Card = app.module();
  
  Card.VALUE_ACE = 1;
  Card.VALUE_KING = 13;
  
  Card.LEFT = 5;
  Card.TOP = 5;
  Card.WIDTH = 72 + 1 * 2;
  Card.HEIGHT = 96 + 1 * 2;
  Card.OVERLAP_H = Math.round(Card.WIDTH / 5);
  Card.OVERLAP_V = Math.round(Card.HEIGHT / 5);

  Card.Model = Backbone.Model.extend({
    urlRoot: null,
    id: '',
    suite: '',
    value: 0,
    index: 0,
    front: true,
    
    isAlternateColor: function(card) {
      var a = this.get("suite");
      var b = card.get("suite");
      
      if (a == 'spade' || a == 'club') {
        return b == 'heart' || b == 'diamond';
      } else {
        return b == 'spade' || b == 'club';
      }
    }
  });

  Card.Collection = Backbone.Collection.extend({
    model: Card.Model
  });

  Card.Views.FrontLayout = Backbone.Layout.extend({
    template: "cardfront",
    tagName: "div",
    className: "card cardfront",
    attributes: {
      draggable: true
    },
    
    beforeRender: function() {
      var id = this.model.get('id');
      var idx = this.model.get('index');
      this.$el.attr("data-card-id", id);
      this.$el.addClass("card-" + id);
      
      if (this.stackHorizontal) {
        this.$el.css("left", Card.LEFT + (this.stackIndex * Card.OVERLAP_H) + "px");
      }
      
      if (this.stackVertical) {
        this.$el.css("top", Card.TOP + (this.stackIndex * Card.OVERLAP_V) + "px");
      }
    }
  });

  Card.Views.BackLayout = Backbone.Layout.extend({
    template: "cardback",
    tagName: "div",
    className: "card cardback bluedeck",
    
    beforeRender: function() {
      if (this.stackHorizontal) {
        this.$el.css("left", Card.LEFT + (this.stackIndex * Card.OVERLAP_H) + "px");
      }
      
      if (this.stackVertical) {
        this.$el.css("top", Card.TOP + (this.stackIndex * Card.OVERLAP_V ) + "px");
      }
    }
  });

  return Card;
});
