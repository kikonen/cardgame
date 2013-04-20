// Header module
define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Header = app.module();

  // Default Model.
  Header.Model = Backbone.Model.extend({
  
  });

  // Default Collection.
  Header.Collection = Backbone.Collection.extend({
    model: Header.Model
  });

  // Default View.
  Header.Views.Layout = Backbone.Layout.extend({
    template: "header",
    
    events: {
      "click #restart": "onRestart",
      "click #tip": "onTip"
    },
    
    onRestart: function() {
      app.trigger("game:restart");
    },
    
    onTip: function() {
      app.trigger("game:tip");
    }
  });

  // Return the module for AMD compliance.
  return Header;

});
