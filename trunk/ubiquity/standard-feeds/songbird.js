/**
 * Play Command
 *
 * TODO:
 * - currently does nothing if not already paused. should instead start
 *   playing mainLibrary or whatever the current view is, with default
 *   playback settings.
 */
CmdUtils.CreateCommand({
  name: "play",
  homepage: "http://geekshadow.com/",
  author: { name: "Antoine Turmel", email: "geekshadow@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://ubiquity/skin/icons/control_play.png",
  description: "Play the first song in the playlist",
  preview: function( pblock ) {pblock.innerHTML=this.description;},
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
  preview: function( pblock ) {pblock.innerHTML=this.description;},
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
  preview: function( pblock ) {pblock.innerHTML=this.description;},
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
  preview: function( pblock ) {pblock.innerHTML=this.description;},
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
  preview: function( pblock ) {pblock.innerHTML=this.description;},
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
  preview: function( pblock ) {pblock.innerHTML=this.description;},
  execute: function( searchTerm ) {
    var url = "http://hypem.com/search/" + searchTerm.text + "/1/";
    Utils.openUrlInBrowser( url );
  }
}) 

makeSearchCommand({
  name: "addons",
  description: "addons",
  url: "http://addons.songbirdnest.com/search?query={QUERY}",
  icon: "http://www.getsongbird.com/favicon.ico",
  takes: {"your shout": noun_arb_text},
  preview: function( pblock, theShout ) {
    pblock.innerHTML = "<iframe src='http://addons.songbirdnest.com/search?query=" + theShout.text + "' name='Wiki' id='Wiki' width='490' height='450' marginwidth='0' marginheight='0' frameborder='0' scrolling='yes'></iframe>";
  },
    execute: function( theShout ) {
    var msg = theShout.text + "... " + theShout.text + "......";
    displayMessage( msg );
  }
})

CmdUtils.CreateCommand({
  name: "mute",
  homepage: "http://geekshadow.com/",
  author: { name: "Antoine Turmel", email: "geekshadow@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://ubiquity/skin/icons/mute.png",
  description: "Mute sound",
  preview: function( pblock ) {pblock.innerHTML=this.description;},
  execute: function() {
    
    if (typeof(Cc) == "undefined")
        var Cc = Components.classes;
    if (typeof(Ci) == "undefined")
        var Ci = Components.interfaces;
    var gMM = Cc["@songbirdnest.com/Songbird/Mediacore/Manager;1"]
                    .getService(Ci.sbIMediacoreManager);

    if (gMM.volumeControl.mute == true) {
      gMM.volumeControl.mute = false;
    }
    
    else {
      gMM.volumeControl.mute = true;
    }
  }
}) 
  
CmdUtils.CreateCommand({
  name: "volume",
  homepage: "http://geekshadow.com/",
  author: { name: "Antoine Turmel", email: "geekshadow@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://ubiquity/skin/icons/volume.png",
  takes: {"0 to 100, up or down": noun_arb_text},
  description: "Change the volume",
  preview: function( pblock, theShout) {pblock.innerHTML=this.description;},
  execute: function( theShout ) {
    
    if (typeof(Cc) == "undefined")
        var Cc = Components.classes;
    if (typeof(Ci) == "undefined")
        var Ci = Components.interfaces;
    var gMM = Cc["@songbirdnest.com/Songbird/Mediacore/Manager;1"]
                    .getService(Ci.sbIMediacoreManager);

    if (theShout.text == "up") {
        gMM.volumeControl.volume = gMM.volumeControl.volume +0.1;
       }
    if (theShout.text == "down") {
         gMM.volumeControl.volume = gMM.volumeControl.volume -0.1;
       }
    if (theShout.text != "up" && theShout.text != "down") {
       var vol = theShout.text/100;
       gMM.volumeControl.volume = vol;
       }

  }
});

// XXX context is broken in sb-ubiquity
var context = {};
context.chromeWindow = Cc["@mozilla.org/appshell/window-mediator;1"].
                           getService(Ci.nsIWindowMediator).
                           getMostRecentWindow("Songbird:Main").window;

function makeSBPropertyNounType(aProperty) {
  var propertyName = aProperty.name;
  var nounTypeName = "noun_type_" + propertyName;
  context.chromeWindow[nounTypeName] = {
    _name: nounTypeName,
    suggest: function( text, html ) {
      var suggestions = [];

      var Cu = Components.utils;
      Cu.import("resource://app/jsmodules/sbProperties.jsm");
      Cu.import("resource://app/jsmodules/sbLibraryUtils.jsm");

      var list = LibraryUtils.mainLibrary;
      var values = list.getDistinctValuesForProperty(SBProperties[propertyName]);
      while (values.hasMore() && suggestions.length < 5) {
        var value = values.getNext();
        if ((aProperty.comparisonFunc && aProperty.comparisonFunc(text, value)) ||
            value.toLowerCase().indexOf(text.toLowerCase()) > -1) {
          var sugg = CmdUtils.makeSugg(value, value, value);
          suggestions.push(sugg);
        }
      }

      return suggestions;
    }
  };
}

function makeSBSearchCommand(aProperty) {
  var propertyName = aProperty.name;
  var nounTypeName = "noun_type_" + propertyName;
  var options = {
    name: propertyName,
    homepage: "http://autonome.wordpress.com/",
    author: { name: "Dietrich Ayala", email: "autonome@gmail.com"},
    license: "MPL/GPL/LGPL",
    icon: "chrome://gonzo/skin/service-pane/icon-library.png",
    description: "Search for " + propertyName
  };

  options.takes = {};
  if (aProperty.typeHint)
    options.takes[aProperty.typeHint] = context.chromeWindow[nounTypeName];
  else
    options.takes["term"] = context.chromeWindow[nounTypeName];

  options.preview = function(pblock, term) {
    if (term)
      pblock.innerHTML = "Search for " + propertyName + ": \"" + term.text + "\"";
    else
      pblock.innerHTML = "Search by " + propertyName;
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
      if (baseCols[i] == propertyName)
        propertyIndex = index;
    }
      
    if (!propertyIndex)
      propertyIndex = view.cascadeFilterSet.appendFilter(SBProperties[propertyName]);  

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

/**
 * Supported properties:
 * - name (string)
 * - enabled (bool)
 * - typeHint (string) the text displayed next to the
 *   command name in the list of suggested commands
 * - comparisonFunc (function) function that returns a
 *   bool indicating if a value should be suggested.
 * 
 * TODO:
 * - support for the date properties, such as created and
 *   lastPlaytime
 * - support for playcount
 *
 * External property command ideas:
 * - fileExists (for pruning missing tracks)
 */
var includedProperties = [
  //{name: "GUID", enabled: false},
  //{name: "albumArtistName", enabled: false},
  //{name: "albumDetailImage", enabled: false},
  //{name: "albumDetailUrl", enabled: false},
  {name: "albumName", enabled: true},
  //{name: "artistDetailImage", enabled: false},
  //{name: "artistDetailUrl", enabled: false},
  {name: "artistName", enabled: true},
  //{name: "availability", enabled: false},
  {name: "bitRate", enabled: true},
  //{name: "bpm", enabled: false},
  //{name: "columnSpec", enabled: false},
  {name: "comment", enabled: true},
  {name: "composerName", enabled: true},
  {name: "conductorName", enabled: true},
  //{name: "contentLength", enabled: false},
  //{name: "contentMimeType", enabled: false},
  //{name: "contentURL", enabled: false},
  //{name: "copyright", enabled: false},
  //{name: "copyrightURL", enabled: false},
  {name: "created", enabled: false},
  //{name: "customType", enabled: false},
  //{name: "defaultColumnSpec", enabled: false},
  //{name: "defaultMediaPageURL", enabled: false},
  //{name: "destination", enabled: false},
  //{name: "deviceId", enabled: false},
  //{name: "disableDownload", enabled: false},
  //{name: "discNumber", enabled: false},
  //{name: "downloadButton", enabled: false},
  //{name: "downloadDetails", enabled: false},
  //{name: "downloadStatusTarget", enabled: false},
  //{name: "duration", enabled: false},
  //{name: "enableAutoDownload", enabled: false},
  //{name: "excludeFromHistory", enabled: false},
  {name: "genre", enabled: true},
  //{name: "hash", enabled: false},
  //{name: "hidden", enabled: false},
  //{name: "isContentReadOnly", enabled: false},
  //{name: "isList", enabled: false},
  //{name: "isPartOfCompilation", enabled: false},
  //{name: "isReadOnly", enabled: false},
  //{name: "isSortable", enabled: false},
  //{name: "key", enabled: false},
  //{name: "language", enabled: false},
  //{name: "lastPlayTime", enabled: false},
  //{name: "lastSkipTime", enabled: false},
  //{name: "listType", enabled: false},
  //{name: "lyricistName", enabled: false},
  {name: "lyrics", enabled: true},
  //{name: "mediaListName", enabled: false},
  //{name: "metadataUUID", enabled: false},
  //{name: "onlyCustomMediaPages", enabled: false},
  //{name: "ordinal", enabled: false},
  //{name: "originItemGuid", enabled: false},
  //{name: "originLibraryGuid", enabled: false},
  //{name: "originPage", enabled: false},
  //{name: "originPageImage", enabled: false},
  //{name: "originPageTitle", enabled: false},
  //{name: "originURL", enabled: false},
  //{name: "outerGUID", enabled: false},
  //{name: "playCount", enabled: false},
  //{name: "playCount_AtLastSync", enabled: false},
  //{name: "primaryImageURL", enabled: false},
  //{name: "producerName", enabled: false},
  //{name: "rapiScopeURL", enabled: false},
  //{name: "rapiSiteID", enabled: false},
  {name: "rating", enabled: true, typeHint: "number 1 - 5",
    comparisonFunc: function(aSearchText, aSuggestionValue) {
      // This makes it so that a user can just type a rating value
      // and "rating {val}" will be suggested.
      if (aSearchText in [1, 2, 3, 4, 5] &&
          aSearchText == aSuggestionValue)
        return true;
    }
  },
  {name: "recordLabelName", enabled: true},
  //{name: "sampleRate", enabled: false},
  //{name: "skipCount", enabled: false},
  //{name: "skipCount_AtLastSync", enabled: false},
  //{name: "smartMediaListState", enabled: false},
  //{name: "softwareVendor", enabled: false},
  //{name: "storageGUID", enabled: false},
  //{name: "subtitle", enabled: false},
  //{name: "totalDiscs", enabled: false},
  //{name: "totalTracks", enabled: false},
  {name: "trackName", enabled: true},
  //{name: "trackNumber", enabled: false},
  //{name: "transferPolicy", enabled: false},
  //{name: "updated", enabled: false},
  {name: "year", enabled: true},
];

for (var i = 0; i < includedProperties.length; i++) {
  var prop = includedProperties[i];
  if (prop.enabled) {
    makeSBPropertyNounType(prop);
    makeSBSearchCommand(prop);
  }
}

/**
 * TODO: playlist commands
 * - DONE: search for playlist by name
 * - search tracks by name of playlist
 * - save current view as a playlist
 * - add currently-playing song to a playlist
 */
var noun_type_playlist = {
  _name: "playlist",
  suggest: function( text, html ) {
    var suggestions = [];
    this.getPlaylistNames().every(function(aPlaylistName) {
      if (aPlaylistName.toLowerCase().indexOf(text.toLowerCase()) > -1)
        suggestions.push(CmdUtils.makeSugg(aPlaylistName, aPlaylistName, aPlaylistName));
      return suggestions.length < 5;
    });
    return suggestions;
  },
  getPlaylistNames: function() {
    var Cu = Components.utils;
    Cu.import("resource://app/jsmodules/sbProperties.jsm");
    Cu.import("resource://app/jsmodules/sbLibraryUtils.jsm");

    var names = [];
    var listener = {
      onEnumerationBegin: function(aMediaList) {},
      onEnumeratedItem: function(aMediaList, aMediaItem) {
        var value = aMediaItem.getProperty(SBProperties.mediaListName);
        var isHidden = aMediaItem.getProperty(SBProperties.hidden) == 1;
        // TODO: wtf is listType? values are 1 and 2.
        //var listType = aMediaItem.getProperty(SBProperties.listType);

        // don't return lists with titles that are null
        // or are a special localizable built-in list
        if (!isHidden && value && !value.match(/^\&/))
          names.push(value);
      },
      onEnumerationEnd: function(aMediaList, aStatusCode) {}
    };

    var list = LibraryUtils.mainLibrary;
    var values = list.enumerateItemsByProperty(SBProperties.isList, "1", listener,
                                               Ci.sbIMediaList.ENUMERATIONTYPE_SNAPSHOT);
    return names;
  },
  getPlaylistByName: function(aName) {
    var Cu = Components.utils;
    Cu.import("resource://app/jsmodules/sbProperties.jsm");
    Cu.import("resource://app/jsmodules/sbLibraryUtils.jsm");

    var list;
    var listener = {
      onEnumerationBegin: function(aMediaList) {},
      onEnumeratedItem: function(aMediaList, aMediaItem) {
        var name = aMediaItem.getProperty(SBProperties.mediaListName);
        if (name && name.toLowerCase() == aName.toLowerCase()) {
          list = aMediaItem;
          return Ci.sbIMediaListEnumerationListener.CANCEL;
        }
      },
      onEnumerationEnd: function(aMediaList, aStatusCode) {}
    };

    var library = LibraryUtils.mainLibrary;
    var values = library.enumerateItemsByProperty(SBProperties.isList, "1", listener,
                                               Ci.sbIMediaList.ENUMERATIONTYPE_SNAPSHOT);
    list.QueryInterface(Ci.sbIMediaList);
    return list;
  }
};

CmdUtils.CreateCommand({
  name: "playlist",
  homepage: "http://autonome.wordpress.com/",
  author: { name: "Dietrich Ayala", email: "autonome@gmail.com"},
  license: "MPL/GPL/LGPL",
  icon: "chrome://gonzo/skin/service-pane/icon-playlist.png",
  description: "Search for playlist",
  takes: {"term": noun_type_playlist},
  preview: function(pblock, term) {
    if (term)
      pblock.innerHTML = "Search for playlist: " + term.text + "\"";
    else
      pblock.innerHTML = "Search by playlist";
  },
  execute: function(directObject, modifiers) {
    var list = noun_type_playlist.getPlaylistByName(directObject.text);
    if (!list)
      return;
      
    // create a new view from the main library
    var view = list.createView();

    // now go load the view in the tabbrowser  
    var window = Cc["@mozilla.org/appshell/window-mediator;1"].
                   getService(Ci.nsIWindowMediator).
                   getMostRecentWindow("Songbird:Main").window;
    var gBrowser = window.gBrowser;

    gBrowser.loadMediaList(list)
  }
});

function LOG(aMsg) {
    ConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    if(ConsoleService)
	    ConsoleService.logStringMessage("songbird-ubiquity: " + aMsg);
}
