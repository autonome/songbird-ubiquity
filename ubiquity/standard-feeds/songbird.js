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
});

