// Footer module
define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Footer = app.module();

  // Default Model.
  Footer.Model = Backbone.Model.extend({
  
  });

  // Default Collection.
  Footer.Collection = Backbone.Collection.extend({
    model: Footer.Model
  });

  // Default View.
  Footer.Views.Layout = Backbone.Layout.extend({
    template: "footer"
  });

  // Return the module for AMD compliance.
  return Footer;

});
