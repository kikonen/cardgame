// Debug module
define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Debug = app.module();

  // Default Model.
  Debug.Model = Backbone.Model.extend({
    data : {},

    initialize: function() {
      app.on("debug:data", function(data) {
        this.set("data", data);
      }, this);
    }

  });

  // Default Collection.
  Debug.Collection = Backbone.Collection.extend({
    model: Debug.Model
  });

  // Default View.
  Debug.Views.Layout = Backbone.Layout.extend({
    template: "debug",

    initialize: function() {
      this.model.on("change", this.render, this);
    },

    serialize: function() {
      try {
        return { debug: {data: JSON.stringify(this.model.toJSON())} };
      } catch(e) {
        return { debug: {data: "invalid-data"} };
      }
    }
  });

  // Return the module for AMD compliance.
  return Debug;

});
