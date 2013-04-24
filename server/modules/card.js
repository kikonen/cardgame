define([
  "backbone"
],
function(
  Backbone) {
  var Card = {};

  Card.Model = Backbone.Model.extend({
    defaults: {
      id: '',
      suite: '',
      value: 0,
      index: 0,
      front: true
    }
  });

  Card.Collection = Backbone.Collection.extend({
    model: Card.Model
  });

  return Card;
});
