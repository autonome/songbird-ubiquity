CmdUtils.CreateCommand({
  name: "play",
  homepage: "http://geekshadow.com/",
  author: { name: "Antoine Turmel", email: "geekshadow@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://ubiquity/skin/icons/control_play.png",
  description: "Play the first song in the playlist",
  execute: function() {
    
if (typeof(Cc) == "undefined")
    var Cc = Components.classes;
if (typeof(Ci) == "undefined")
    var Ci = Components.interfaces;
var gMM = Cc["@songbirdnest.com/Songbird/Mediacore/Manager;1"]
                .getService(Ci.sbIMediacoreManager);

    gMM.playbackControl.play();
  }
})
  
CmdUtils.CreateCommand({
  name: "next",
  homepage: "http://geekshadow.com/",
  author: { name: "Antoine Turmel", email: "geekshadow@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://ubiquity/skin/icons/control_end.png",
  description: "Switch to the next song",
  execute: function() {
    
if (typeof(Cc) == "undefined")
    var Cc = Components.classes;
if (typeof(Ci) == "undefined")
    var Ci = Components.interfaces;
var gMM = Cc["@songbirdnest.com/Songbird/Mediacore/Manager;1"]
                .getService(Ci.sbIMediacoreManager);

    gMM.sequencer.next();  
  }
})  
    
CmdUtils.CreateCommand({
  name: "previous",
  homepage: "http://geekshadow.com/",
  author: { name: "Antoine Turmel", email: "geekshadow@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://ubiquity/skin/icons/control_start.png",
  description: "Switch to the previous song",  
  execute: function() {
    
if (typeof(Cc) == "undefined")
    var Cc = Components.classes;
if (typeof(Ci) == "undefined")
    var Ci = Components.interfaces;
var gMM = Cc["@songbirdnest.com/Songbird/Mediacore/Manager;1"]
                .getService(Ci.sbIMediacoreManager);

    gMM.sequencer.previous();    
  }
})      
    
CmdUtils.CreateCommand({
  name: "pause",
  homepage: "http://geekshadow.com/",
  author: { name: "Antoine Turmel", email: "geekshadow@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://ubiquity/skin/icons/control_pause.png", 
  description: "Pause the current song",    
  execute: function() {
    
if (typeof(Cc) == "undefined")
    var Cc = Components.classes;
if (typeof(Ci) == "undefined")
    var Ci = Components.interfaces;
var gMM = Cc["@songbirdnest.com/Songbird/Mediacore/Manager;1"]
                .getService(Ci.sbIMediacoreManager);

    gMM.playbackControl.pause();    
  }
})
    
CmdUtils.CreateCommand({
  name: "stop",
  homepage: "http://geekshadow.com/",
  author: { name: "Antoine Turmel", email: "geekshadow@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://ubiquity/skin/icons/control_stop.png",
  description: "Stop the current song",      
  execute: function() {
    
if (typeof(Cc) == "undefined")
    var Cc = Components.classes;
if (typeof(Ci) == "undefined")
    var Ci = Components.interfaces;
var gMM = Cc["@songbirdnest.com/Songbird/Mediacore/Manager;1"]
                .getService(Ci.sbIMediacoreManager);

    gMM.playbackControl.stop();    
  }
})

CmdUtils.CreateCommand({ 
  name: "hypemachine",
  description: "Search music blogs and upcoming concerts",
  homepage: "http://geekshadow.com/",
  author: { name: "Antoine Turmel", email: "geekshadow@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://service-icons/skin/hypemachine.ico",
  takes: {"song": noun_arb_text},
  execute: function( searchTerm ) {
    var url = "http://hypem.com/search/" + searchTerm.text + "/1/";
    Utils.openUrlInBrowser( url );
  }
}) 

CmdUtils.CreateCommand({ 
  name: "skreemr",
  description: "SkreemR audio search",
  homepage: "http://geekshadow.com/",
  author: { name: "Antoine Turmel", email: "geekshadow@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://service-icons/skin/skreemr.ico",
  takes: {"song": noun_arb_text},
  execute: function( searchTerm ) {
    var url = "http://www.skreemr.com/results.jsp?q=" + searchTerm.text;
    Utils.openUrlInBrowser( url );
  }
});

// XXX context is broken in sb-ubiquity
var context = {};
context.chromeWindow = Cc["@mozilla.org/appshell/window-mediator;1"].
                           getService(Ci.nsIWindowMediator).
                           getMostRecentWindow("Songbird:Main").window;

function makeSBPropertyNounType(aProperty) {
  var nounTypeName = "noun_type_" + aProperty;
  context.chromeWindow[nounTypeName] = {
    _name: nounTypeName,
    suggest: function( text, html ) {
      var suggestions = [];

      var Cu = Components.utils;
      Cu.import("resource://app/jsmodules/sbProperties.jsm");
      Cu.import("resource://app/jsmodules/sbLibraryUtils.jsm");

      var list = LibraryUtils.mainLibrary;
      var values = list.getDistinctValuesForProperty(SBProperties[aProperty]);
      while (values.hasMore() && suggestions.length < 5) {
        var value = values.getNext();
        if (value.toLowerCase().indexOf(text.toLowerCase()) > -1) {
          var sugg = CmdUtils.makeSugg(value, value, value);
          suggestions.push(sugg);
        }
      }

      return suggestions;
    }
  };
}

function makeSBSearchCommand(aProperty) {
  var nounTypeName = "noun_type_" + aProperty;
  var options = {
    name: aProperty,
    homepage: "http://autonome.wordpress.com/",
    author: { name: "Dietrich Ayala", email: "autonome@gmail.com"},
    license: "MPL/GPL/LGPL",
    icon: "chrome://ubiquity/skin/icons/music.png",
    description: "Search for " + aProperty,
    takes: {term: context.chromeWindow[nounTypeName]},
    preview: function(pblock, term) {
      if (term)
        pblock.innerHTML = "Search for " + aProperty + ": \"" + term.text + "\"";
      else
        pblock.innerHTML = "Search by " + aProperty;
    }
  };

  options.execute = function(directObject, modifiers) {
    var Cu = Components.utils;
    var Ci = Components.interfaces;
    var Cc = Components.classes;

    Cu.import("resource://app/jsmodules/sbLibraryUtils.jsm");
    Cu.import("resource://app/jsmodules/sbProperties.jsm");

    // create a new view from the main library
    var view = LibraryUtils.mainLibrary.createView();

    // setup our filters to expose. we only care about setting the artist name, so that's  
    // the only index i'll save for now  
    var propertyIndex = null;
    var baseCols = ["genre", "artistName", "albumName"];
    for (var i = 0; i < baseCols.length; i++) {
      var index = view.cascadeFilterSet.appendFilter(SBProperties[baseCols[i]]);  
      if (baseCols[i] == aProperty)
        propertyIndex = index;
    }
      
    if (!propertyIndex)
      propertyIndex = view.cascadeFilterSet.appendFilter(SBProperties[aProperty]);  

    // set it to something useful.
    view.cascadeFilterSet.set(propertyIndex, [directObject.text], 1);  
      
    // now go load the view in the tabbrowser  
    var window = Cc["@mozilla.org/appshell/window-mediator;1"].
                   getService(Ci.nsIWindowMediator).
                   getMostRecentWindow("Songbird:Main").window;
    var gBrowser = window.gBrowser;

    gBrowser.loadMediaList(view.mediaList, null, null, view,  
                           "chrome://songbird/content/mediapages/filtersPage.xul");  
  };

  CmdUtils.CreateCommand(options);
}

var includedProperties = [
  "trackName", "albumName", "artistName",
  "genre", "year", "lyrics", "recordLabelName"
];

for (var i = 0; i < includedProperties.length; i++) {
  var prop = includedProperties[i];
  makeSBPropertyNounType(prop);
  makeSBSearchCommand(prop);
}
