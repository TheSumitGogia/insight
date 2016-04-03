define([
  "underscore",
  "jquery",
  "backend/generic/Communicator",
  "backend/generic/EventsMixin"
], function(
  _,
  $,
  Communicator,
  EventsMixin
) {
  
  var searchEl = $("#searchInput");
  var searchButton = $("#searchButton");
  var searchPrompt = $("#searchInput .prompt");
  var prevButton = $("#prevButton");
  var nextButton = $("#nextButton");

  // LOGGING
  var newUserButton = $("#newUserButton");

  var autocomplete = function() {
    searchEl.search({
      apiSettings: {
        url: 'http://127.0.0.1:8080/?{%22message%22:%22tag%22,%22tagstring%22:%22{query}%22}'
      }
    });
  };

  var search = function(tagstring) {
    var found = Communicator.get("image", "search", {"tagstring": tagstring});
    return found;
  };

  var previous = function() {

  };

  var next = function() {

  };

  var images = null;
  var currentIndex = null;

  var Navigator = {
    autocomplete: function() {
      autocomplete();
    },

    search: function() {
      var bar = this;
      searchButton.click(function(event) {
        var tagstring = searchPrompt.val();
        images = search(tagstring);
        currentIndex = 0;
        searchPrompt.val("");
        bar.dispatch("load", images[0]);
      });
    },

    start: function() {
      this.autocomplete();
      this.search();
  
      var bar = this;
      prevButton.click(bar.previous.bind(bar));
      nextButton.click(bar.next.bind(bar));
      newUserButton.click(bar.addUser.bind(bar));
    },

    previous: function() {
      if (currentIndex == 0) { return; }
      currentIndex = currentIndex - 1;
      this.dispatch("load", images[currentIndex]);
    },

    next: function() {
      if (currentIndex == images.length-1) { return; }
      currentIndex = currentIndex + 1;
      this.dispatch("load", images[currentIndex]);
    },

    addUser: function() {
      Communicator.post("image", "user", {});
    }
  };

  Navigator = _.extend(Navigator, EventsMixin);

  return Navigator;
});
