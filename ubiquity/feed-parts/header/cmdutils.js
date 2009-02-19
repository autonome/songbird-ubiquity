/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Ubiquity.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Atul Varma <atul@mozilla.com>
 *   Aza Raskin <aza@mozilla.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Maria Emerson <memerson@mozilla.com>
 *   Blair McBride <unfocused@gmail.com>
 *   Abimanyu Raja <abimanyuraja@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

 // = CmdUtils =
 //
 // This is a small library of general utility functions
 // for use by command code.  Everything clients need is contained within
 // the {{{CmdUtils}}} namespace.

const Cc = Components.classes;
const Ci = Components.interfaces;

var CmdUtils = {};

CmdUtils.__globalObject = this;

// ** {{{ CmdUtils.log(a, b, c, ...) }}} **
//
// One of the most useful functions to know both for development
// and debugging. This logging function takes
// an arbitrary number of arguments and will log them to the most
// appropriate output. If you have Firebug, the output will go to its
// console. Otherwise, the output will be routed to the Javascript
// Console.
//
// {{{CmdUtils.log}}} implements smart pretty print, so you
// can use it for inspecting arrays and objects.
//
// {{{a, b, c, ...}}} is an arbitrary list of things to be logged.

CmdUtils.log = function log(what) {
  var args = Array.prototype.slice.call(arguments);
  if(args.length == 0)
    return;

  var logPrefix = "Ubiquity: ";
  var browserWindow = Utils.currentChromeWindow;

  if("Firebug" in browserWindow && "Console" in browserWindow.Firebug) {
    args.unshift(logPrefix);
    browserWindow.Firebug.Console.logFormatted(args);
  } else {
    var logMessage = "";
    if(typeof args[0] == "string") {
      var formatStr = args.shift();
      while(args.length > 0 && formatStr.indexOf("%s") > -1) {
        formatStr = formatStr.replace("%s", "" + args.shift());
      }
      args.unshift(formatStr);
    }
    args.forEach(function(arg) {
      if(typeof arg == "object") {
        logMessage += " " + Utils.encodeJson(arg) + " ";
      } else {
        logMessage += arg;
      }
    });
    Application.console.log(logPrefix + logMessage);
  }
};

// ** {{{ CmdUtils.getHtmlSelection( context ) }}} **
//
// Returns a string containing the the html representation of the
// user's current selection, i.e. text including tags.
//
// {{{context}}} is an optional argument that contains the execution
// context (which is automatically generated inside of command code).

CmdUtils.getHtmlSelection = function getHtmlSelection(context) {
  var ctu = {};
  Components.utils.import("resource://ubiquity/modules/contextutils.js",
                          ctu);

  if (typeof(context) == "undefined")
    context = CmdUtils.__globalObject.context;

  return ctu.ContextUtils.getHtmlSelection(context);
};

// ** {{{ CmdUtils.getSelection( context ) }}} **
//
// Returns a string containing the text and just the text of the user's
// current selection, i.e. with html tags stripped out.
//
// {{{context}}} is an optional argument that contains the execution
// context (which is automatically generated inside of command code).


CmdUtils.getSelection = function getSelection(context) {
  var ctu = {};
  Components.utils.import("resource://ubiquity/modules/contextutils.js",
                          ctu);

  if (typeof(context) == "undefined")
    context = CmdUtils.__globalObject.context;

  return ctu.ContextUtils.getSelection(context);
};

// ** {{{ CmdUtils.getTextFromHtml( html ) }}} **
//
// Strips out all HTML tags from a chunk of html and returns the text
// that's left.
//
// {{{html}}} is a string containing an html fragment.

CmdUtils.getTextFromHtml = function getTextFromHtml(html) {
  var newNode = context.focusedWindow.document.createElement("p");
  newNode.innerHTML = html;
  return newNode.textContent;
}


// ** {{{ CmdUtils.setSelection( content, options ) }}} **
//
// Replaces the current selection with new content.
// See {{{ ContextUtils.setSelection }}}
//
// {{{content}}} The text (or html) to set as the selection.
//
// {{{options}}} options is a dictionary; if it has a "text" property then
// that value will be used in place of the html if we're in
// a plain-text-only editable field.

CmdUtils.setSelection = function setSelection(content, options) {
  var ctu = {};
  Components.utils.import("resource://ubiquity/modules/contextutils.js",
                          ctu);

  var context = CmdUtils.__globalObject.context;

  ctu.ContextUtils.setSelection(context, content, options);
};


// ** {{{ CmdUtils.getDocument( ) }}} **
//
// This gets the document of the current tab in a secure way

CmdUtils.getDocument = function getDocument(){
  return CmdUtils.getWindow().document;
};


// ** {{{ CmdUtils.getWindow( ) }}} **
//
// This gets the window object of the current tab in a secure way.

CmdUtils.getWindow = function getWindow() {
  return Application.activeWindow
                    .activeTab
                    .document
                    .defaultView;
};


// ** {{{ CmdUtis.getWindowInsecure( ) }}} **
//
// This gets the window object of the current tab, without the
// safe XPCNativeWrapper. While this allows access to scripts in the content,
// it is potentially **unsafe** and {{{ CmdUtils.getWindow( ) }}} should
// be used in place of this whenever possible.

CmdUtils.getWindowInsecure = function getWindowInsecure() {
  return Application.activeWindow
                    .activeTab
                    .document
                    .defaultView
                    .wrappedJSObject;
};


// ** {{{ CmdUtis.getDocumentInsecure( ) }}} **
//
// This gets the document of the current tab, without the
// safe XPCNativeWrapper. While this allows access to scripts in the content,
// it is potentially **unsafe** and {{{ CmdUtils.getDocument( ) }}} should
// be used in place of this whenever possible.

CmdUtils.getDocumentInsecure = function getDocumentInsecure() {
  return CmdUtils.getWindowInsecure().document;
};


// ** {{{ CmdUtils.geocodeAddress( address, callback ) }}} **
//
// This function uses the Yahoo geocoding service to take a text
// string of an address/location and turn it into a structured
// geo-location.
//
// {{{address}}} is a plaintext string of the address or location
// to be geocoded.
//
// {{{callback}}} is a function which gets passed the return of
// the geocoding.
//
// The function returns an array of possible matches, where each match is
// an object that includes {{{Latitude}}}, {{{Longitude}}},
// {{{Address}}}, {{{City}}}, {{{State}}}, {{{Zip}}}, and {{{Country}}}.

CmdUtils.geocodeAddress = function geocodeAddress( address, callback ) {
  var url = "http://local.yahooapis.com/MapsService/V1/geocode";
  var params = {
    appid: "YD-9G7bey8_JXxQP6rxl.fBFGgCdNjoDMACQA--",
    location: address
  };

  jQuery.get( url, params, function( doc ){
    var lats  = jQuery( "Latitude", doc );
    var longs = jQuery( "Longitude", doc );

    var addrs    = jQuery( "Address", doc );
    var citys    = jQuery( "City", doc );
    var states   = jQuery( "State", doc );
    var zips     = jQuery( "Zip", doc );
    var countrys = jQuery( "Country", doc );

    var points = [];
    for( var i=0; i<=lats.length; i++ ) {
      points.push({
        lat: jQuery(lats[i]).text(),
        "long": jQuery(longs[i]).text(),
        address: jQuery(addrs[i]).text(),
        city: jQuery(citys[i]).text(),
        state: jQuery(states[i]).text(),
        zips: jQuery(zips[i]).text(),
        country: jQuery(countrys[i]).text()
      });
    }

    callback( points );
  }, "xml");
}


// ** {{{ CmdUtils.injectCss( css ) }}} **
//
// Injects CSS source code into the current tab's document.
//
// {{{ css }}} The CSS source code to inject, in plain text.

CmdUtils.injectCss = function injectCss(css) {
  var doc = CmdUtils.getDocumentInsecure();
  var style = doc.createElement("style");
  style.innerHTML = css;
  doc.body.appendChild(style);
};


// ** {{{ CmdUtils.injectHTML( html ) }}} **
//
// Injects HTML source code into the current tab's document,
// at the end of the document.
//
// {{{ html }}} The HTML source code to inject, in plain text.

CmdUtils.injectHtml = function injectHtml( html ) {
  var doc = CmdUtils.getDocument();
  var div = doc.createElement("div");
  div.innerHTML = html;
  doc.body.appendChild(div.firstChild);
};


// ** {{{ CmdUtils.copyToClipboard( text ) }}} **
//
// This function places the passed-in text into the OS's clipboard.
//
// {{{text}}} is a plaintext string that will be put into the clipboard.
//
// Function based on:
// http://ntt.cc/2008/01/19/copy-paste-javascript-codes-ie-firefox-opera.html
CmdUtils.copyToClipboard = function copyToClipboard(text){
   var clipboard = Cc['@mozilla.org/widget/clipboard;1'].
                   createInstance(Ci.nsIClipboard);
   var transferArea = Cc['@mozilla.org/widget/transferable;1'].
                      createInstance(Ci.nsITransferable);
   var string = Cc["@mozilla.org/supports-string;1"].
                createInstance(Ci.nsISupportsString);
   transferArea.addDataFlavor('text/unicode');
   string.data = text;
   transferArea.setTransferData("text/unicode", string, text.length * 2);
   clipboard.setData(transferArea, null, Ci.nsIClipboard.kGlobalClipboard);
}


// ** {{{ CmdUtils.injectJavascript( src, callback ) }}} **
//
// Injects Javascript from a URL into the current tab's document,
// and calls an optional callback function once the script has loaded.
//
// Note that this is **not** intended to be used as a
// way of importing Javascript into the command's sandbox.
//
// {{{ src }}} Source URL of the Javascript to inject.
//
// {{{ callback }}} Optional callback function to call once the script
// has loaded in the document.

CmdUtils.injectJavascript = function injectJavascript(src, callback) {
  var doc = CmdUtils.getDocument();

  var script = doc.createElement("script");
  script.src = src;
  doc.body.appendChild(script);

  script.addEventListener("load", function() {
    doc.body.removeChild( script );
    if (typeof(callback) == "function") {
      callback();
    }
  }, true);
};


// ** {{{ CmdUtils.loadJQuery( func ) }}} **
//
// Injects the jQuery javascript library into the current tab's document.
//
// {{{ func }}} Non-optional callback function to call once jQuery has loaded.

CmdUtils.loadJQuery = function loadJQuery(func) {
  CmdUtils.injectJavascript(
    "resource://ubiquity/scripts/jquery.js",
    Utils.safeWrapper( function() {
      var contentJQuery = CmdUtils.getWindowInsecure().jQuery;
      func(contentJQuery);
    })
  );
};

// ** {{{ CmdUtils.onPageLoad( callback ) }}} **
//
// Sets up a function to be run whenever a page is loaded in
// the window that this Ubiquity sandbox is associated with.
//
// {{{ callback }}} Non-optional callback function.  Each time a new
// page or tab is loaded in the window, the callback function will be
// called; it is passed a single argument, which is the window's document
// object.

CmdUtils.onPageLoad = function onPageLoad( callback ) {
  var safeCallback = Utils.safeWrapper(callback);

  pageLoadFuncs.push(safeCallback);
};


// ** {{{ CmdUtils.setLastResult( result ) }}} **
//
// **Deprecated.  Do not use.**
//
// Sets the last result of a command's execution, for use in command piping.

CmdUtils.setLastResult = function setLastResult( result ) {
  // TODO: This function was used for command piping, which has been
  // removed for the time being; we should probably consider removing this
  // function and anything that uses it.
  globals.lastCmdResult = result;
};

// ** {{{ CmdUtils.getGeoLocation( callback ) }}} **
//
// Uses Geo-IP lookup to get the user's physical location. Will cache the result.
// If a result is already in the cache, this function works both
// asyncronously and synchronously (for backwards compatability).
// Otherwise it works only asynchronously.
//
// {{{ callback }}} Optional callback function.  Will be called back
// with a geolocation object.
//
// The geolocation object has the following properties:
// {{{ city }}}, {{{ state }}}, {{{ country }}}, {{{ country_code }}},
// {{{ lat }}}, {{{ long }}}.
// (For a list of country codes, refer to http://www.maxmind.com/app/iso3166 )
//
// You can choose to use the function synchronously: do not pass in any
// callback, and the geolocation object will instead be returned
// directly.

CmdUtils.getGeoLocation = function getGeoLocation(callback) {
  if (globals.geoLocation) {
    if (callback)
      callback(globals.geoLocation);
    return globals.geoLocation;
    // TODO: Why does this function return globals.geolocation if the
    // value was already cached, but null if it was not?  If it returns
    // different things depending on what's in the cache, then client
    // code can't rely on its return value.  And shouldn't client code
    // always be using the callback anyway?
  }

  jQuery.ajax({
    type: "GET",
    url: "http://j.maxmind.com/app/geoip.js",
    dataType: "text",
    async: false,
    success: function( js ) {
      eval( js );
      var loc = geoip_city() + ", " + geoip_region();
      globals.geoLocation = {
        city: geoip_city(),
        state: geoip_region_name(),
        country: geoip_country_name(),
        country_code: geoip_country_code(),
        lat: geoip_latitude(),
        "long": geoip_longitude()
      };
      if (callback)
        callback(globals.geoLocation);
    }
  });

  return null;
};


// TODO: UserCode is only used by experimental-commands.js.  Does it still
// need to be included here?
CmdUtils.UserCode = {
  //Copied with additions from chrome://ubiquity/content/prefcommands.js
  COMMANDS_PREF : "extensions.ubiquity.commands",

  setCode : function(code) {
    Application.prefs.setValue(
      this.COMMANDS_PREF,
      code
    );
    //Refresh any code editor tabs that might be open
    Application.activeWindow.tabs.forEach(function (tab){
      if(tab.document.location == "chrome://ubiquity/content/editor.html"){
        tab.document.location.reload(true);
      }
    });
  },

  getCode : function() {
    return Application.prefs.getValue(
      this.COMMANDS_PREF,
      ""
    );
  },

  appendCode : function(code){
    this.setCode(this.getCode() + code);
  },

  prependCode : function(code){
    this.setCode(code + this.getCode());
  }
};

// -----------------------------------------------------------------
// SNAPSHOT RELATED
// -----------------------------------------------------------------

// ** {{{ CmdUtils.getHiddenWindow() }}} **
//
// Returns the application's hidden window.  (Every Mozilla
// application has a global singleton hidden window.  This is used by
// {{{ CmdUtils.getWindowSnapshot() }}}, but probably doesn't need
// to be used directly by command feeds.

CmdUtils.getHiddenWindow = function getHiddenWindow() {
  return Cc["@mozilla.org/appshell/appShellService;1"]
                   .getService(Ci.nsIAppShellService)
                   .hiddenDOMWindow;
}

// ** {{{ CmdUtils.getTabSnapshot( tab, options ) }}} **
//
// Creates a thumbnail image of the contents of a given tab.
// {{{ tab }}} a tab object.
// {{{ options }}} see getWindowSnapshot().

CmdUtils.getTabSnapshot = function getTabSnapshot( tab, options ) {
  var win = tab.document.defaultView;
  return CmdUtils.getWindowSnapshot( win, options );
}

// ** {{{ CmdUtils.getWindowSnapshot( win, options ) }}} **
//
// Creates a thumbnail image of the contents of the given window.
// {{{ window }}} a window object.
// {{{ options }}} an optional dictionary which can contain any or all
// of the following properties:
// {{{ options.width }}} the desired width of the image.  Height will be
// determined automatically to maintain the aspect ratio.
// If not provided, the default width is 200 pixels.
// {{{ options.callback }}} A function which, if provided, will be
// called back with the image data.
//
// If a callback is not provided, this function will return a URL
// pointing to a JPEG of the image data.

CmdUtils.getWindowSnapshot = function getWindowSnapshot( win, options ) {
  if( !options ) options = {};

  var hiddenWindow = CmdUtils.getHiddenWindow();
  var thumbnail = hiddenWindow.document.createElementNS(
    "http://www.w3.org/1999/xhtml", "canvas" );

  var width = options.width || 200; // Default to 200px width

  var widthScale =  width / win.innerWidth;
  var aspectRatio = win.innerHeight / win.innerWidth;

  thumbnail.mozOpaque = true;
  thumbnail.width = width;
  thumbnail.height = thumbnail.width * aspectRatio;
  var ctx = thumbnail.getContext("2d");
  ctx.scale(widthScale, widthScale);
  ctx.drawWindow(win, win.scrollX, win.scrollY,
                 win.innerWidth, win.innerWidth, "rgb(255,255,255)");

  var data = thumbnail.toDataURL("image/jpeg", "quality=80");
  if (options.callback) {
    // TODO: imgData appears not to be defined anywhere.  Should this
    // say 'data' instead?
    options.callback( imgData );
  } else {
    return data;
  }
}


// ** {{{ CmdUtils.getImageSnapshot( url, callback ) }}} **
//
// Takes a snapshot of an image residing at the passed-in URL. This
// is useful for when you want to get the bits of an image when it
// is hosted elsewhere. The bits can then be manipulated at will
// without worry of same-domain restrictions.
//
// {{{url}}} The URL where the image is located.
//
// {{{callback}}} A function that get's passed back the bits of the
// image, in DataUrl form.
CmdUtils.getImageSnapshot = function getImageSnapshot( url, callback ) {
  var hiddenWindow = CmdUtils.getHiddenWindow();
  var body = hiddenWindow.document.body;

  var canvas = hiddenWindow.
               document.
               createElementNS("http://www.w3.org/1999/xhtml", "canvas" );

  var img = new hiddenWindow.Image();
  img.src = url;
  img.addEventListener("load", function(){
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext( "2d" );
    ctx.drawImage( img, 0, 0 );

    callback( canvas.toDataURL() );
	}, true);
}

// ---------------------------
// FUNCTIONS FOR STORING AND RETRIEVING PASSWORDS AND OTHER SENSITIVE INFORMATION
// ---------------------------

// ** {{{ CmdUtils.savePassword( opts ) }}} **
//
// Saves a pair of username/password (or username/api key) to the password
// manager.
//
// {{{opts}}} A dictionary object which must have the following properties:
// {{{opts.name}}} a unique string used to identify this username/password
// pair; for instance, you can use the name of your command.
// {{{opts.username}}} the username to store
// {{{opts.password}}} the password (or other private data, such as an API key)
// corresponding to the username

CmdUtils.savePassword = function savePassword( opts ){
  var passwordManager = Cc["@mozilla.org/login-manager;1"].
                        getService(Ci.nsILoginManager);
  var nsLoginInfo = new Components.
                        Constructor("@mozilla.org/login-manager/loginInfo;1",
                                    Ci.nsILoginInfo,
                                    "init");
  //var loginInfo = new nsLoginInfo(hostname,
  //                                formSubmitURL,
  //                                httprealm,
  //                                username,
  //                                password,
  //                                usernameField,
  //                                passwordField);
  var loginInfo = new nsLoginInfo('chrome://ubiquity/content',
                                  'UbiquityInformation' + opts.name,
                                  null,
                                  opts.username,
                                  opts.password,
                                  "",
                                  "");

  try {
     passwordManager.addLogin(loginInfo);
  } catch(e) {
     // "This login already exists."
     var logins = passwordManager.findLogins({},
                                             "chrome://ubiquity/content",
                                             'UbiquityInformation' + opts.name,
                                             null);
     for each(login in logins) {
        if (login.username == opts.username) {
           //modifyLogin(oldLoginInfo, newLoginInfo);
           passwordManager.modifyLogin(login, loginInfo);
           break;
        }
     }
  }
}

// ** {{{ CmdUtils.retrieveLogins( name ) }}} **
//
// Retrieves one or more username/password saved with CmdUtils.savePassword.
//
// {{{name}}} The identifier of the username/password pair to retrieve.
// This must match the {{{opts.name}}} that was passed in to
// {{{ CmdUtils.savePassword() }}} when the password was stored.
// Returns: an array of objects, each of which takes the form
// { username: '', password: '' }

CmdUtils.retrieveLogins = function retrieveLogins( name ){
  var passwordManager = Cc["@mozilla.org/login-manager;1"].
                        getService(Ci.nsILoginManager);

  var logins = passwordManager.findLogins({},
                                          "chrome://ubiquity/content",
                                          "UbiquityInformation" + name,
                                          null);
  var returnedLogins = [];

  for each(login in logins){
    loginObj = {
      username: login.username,
      password: login.password
    };
    returnedLogins.push(loginObj);
  }
  return returnedLogins;
}

// -----------------------------------------------------------------
// COMMAND CREATION FUNCTIONS
// -----------------------------------------------------------------

// ** {{{ CmdUtils.CreateCommand( options ) }}} **
//
// Creates and registers a Ubiquity command.
//
// {{{ options }}} is a dictionary object which ** must have the following
// properties: **
//
// {{{ options.name }}} The name of your command, which the user will
// type into the command line, or choose from the context menu, to
// activate it.  Cannot contain spaces.
//
// {{{ options.execute }}} The function which gets run when the user
// executes your command.  If your command takes arguments (see below),
// your execute method will be passed the direct object as its first
// argument, and a modifiers dictionary as its second argument.
//
// ** The following properties are used if you want your command to
// accept arguments: **
//
// {{{ options.takes }}} Defines the primary argument of the command,
// a.k.a. the direct-object of the verb.  A dictionary object with a
// single property.  The name of the property will be the display name
// of the primary argument.  The value of the property must be a
// noun type (see
// https://wiki.mozilla.org/Labs/Ubiquity/Ubiquity_0.1_Nountypes_Reference
// ) which defines what type of values are valid for the argument.
//
// {{{ options.modifiers }}} Defines any number of secondary arguments
// of the command, a.k.a. indirect objects of the verb.  A dictionary
// object with any number of properties; the name of each property should
// be a preposition-word ('to', 'from', 'with', etc.), and the value is
// the noun type for the argument.  The name of the property is the word
// that the user will type on the command line to invoke the modifier,
// and the noun type determines the range of valid values.
//
// For more about the use of arguments in your command, see
// https://wiki.mozilla.org/Labs/Ubiquity/Ubiquity_0.1_Author_Tutorial#Commands_with_Arguments
//
// ** The following properties are optional but strongly recommended to
// make your command easier for users to learn: **
//
// {{{ options.description }}} A string containing a short description
// of your command, to be displayed on the command-list page.
//
// {{{ options.help }}} A string containing a longer description of
// your command, also displayed on the command-list page, which can go
// into more depth, include examples of usage, etc. Can include HTML
// tags.
//
// ** The following properties are optional: **
//
// {{{ options.icon }}} A string containing the URL of a small image (favicon-sized) to
// be displayed alongside the name of your command in the interface.
//
// {{{ options.author }}} A dictionary object describing the command's
// author.  Can have {{{options.author.name}}}, {{{options.author.email}}},
// and {{{options.author.homepage}}} properties, all strings.
//
// {{{ options.contributors }}} An array of strings naming other people
// who have contributed to your command.
//
// {{{ options.license }}} A string naming the license under which your
// command is distributed, for example "MPL".
//
// {{{ options.preview }}} A description of what your command will do,
// to be displayed to the user before the command is executed.  Can be
// either a string or a function.  If a string, it will simply be
// displayed as-is. If preview is a function, it will be called and
// passed a {{{pblock}}} argument, which is a reference to the
// preview display element.  Your function can generate and display
// arbitrary HTML by setting the value of {{{pblock.innerHTML}}}. If
// your command takes arguments (see above), your preview method will
// be passed the direct object as its second argument, and a modifiers
// dictionary as its third argument.
//
// {{{ options.previewDelay }}} Specifies the amount in time, in
// milliseconds, to wait before calling the preview function defined
// in {{{options.preview}}}. If the user presses a key before this
// amount of time has passed, then the preview function isn't
// called. This option is useful, for instance, if displaying the
// preview involves a round-trip to a server and you only want to
// display it once the user has stopped typing for a bit. If
// {{{options.preview}}} isn't a function, then this option is
// ignored.

CmdUtils.CreateCommand = function CreateCommand( options ) {
  var globalObj = CmdUtils.__globalObject;
  var execute;

  // Returns the first key in a dictionary.
  function getKey( dict ) {
    for( var key in dict ) return key;
    // if no keys in dict:
    return null;
  }

  if (options.execute)
    execute = function() {
      options.execute.apply(options, arguments);
    };
  else
    execute = function() {
      displayMessage("No action defined.");
    };

  if( options.takes ) {
    execute.DOLabel = getKey( options.takes );
    execute.DOType = options.takes[execute.DOLabel];
  }

  // Reserved keywords that shouldn't be added to the cmd function.
  var RESERVED = ["takes", "execute", "name"];
  // Add all other attributes of options to the cmd function.
  for( var key in options ) {
    if( RESERVED.indexOf(key) == -1 )
      execute[key] = options[key];
  }

  // If preview is a string, wrap it in a function that does
  // what you'd expect it to.
  if( typeof execute["preview"] == "string" ) {
    var previewString = execute["preview"];
    execute["preview"] = function( pblock ){
      pblock.innerHTML = previewString;
    };
  }

  globalObj["cmd_" + options.name] = execute;
};

// -----------------------------------------------------------------
// TEMPLATING FUNCTIONS
// -----------------------------------------------------------------

// ** {{{ CmdUtils.renderTemplate( template, data ) }}} **
//
// Renders a template by substituting values from a dictionary into
// a template string or file. The templating language used is
// trimpath, which is defined here:
// http://code.google.com/p/trimpath/wiki/JavaScriptTemplates
//
// {{{template}}} can be either a string, in which case the string is used
// for the template, or else it can be {file: "filename"}, in which
// case the following happens:
//    * If the feed is on the user's local filesystem, the file's path
//      is assumed to be relative and the file's contents are read and
//      used as the template.
//
//      * Otherwise, the file's path is assumed to be a key into a global
//      object called Attachments, which is defined by the feed.  The
//      value of this key is used as the template.
//
// The reason this is done is so that a command feed can be developed
// locally and then easily deployed to a remote server as a single
// human-readable file without requiring any manual code
// modifications; with this system, it becomes straightforward to
// construct a post-processing tool for feed deployment that
// automatically generates the Attachments object and appends it to
// the command feed's code.
//
// {{{data}}} is a dictionary of values to be substituted.
//
// Returns a string containing the result of processing the template.

CmdUtils.renderTemplate = function renderTemplate( template, data ) {
  var templStr;
  if (typeof template == "string")
    templStr = template;
  else if (template.file) {
    if (Utils.url(feed.id).scheme == "file") {
      var url = Utils.url({uri: template.file, base: feed.id});
      templStr = Utils.getLocalUrl(url.spec);
    } else {
      templStr = Attachments[template.file];
    }
  }

  var templateObject = Template.parseTemplate( templStr );
  return templateObject.process( data );
};

// ** {{{ CmdUtils.previewAjax( pblock, options ) }}} **
//
// Does an asynchronous request to a remote web service.  It is used
// just like jQuery.ajax(), which is documented at
// http://docs.jquery.com/Ajax .
// The difference is that CmdUtils.previewAjax is designed to handle
// command previews, which can be canceled by the user between the
// time that it's requested and the time it displays.  If the preview
// is canceled, no callbacks in the options object will be called.

CmdUtils.previewAjax = function previewAjax(pblock, options) {
  var xhr;
  var newOptions = {};
  function abort() {
    if (xhr)
      xhr.abort();
  }
  for (key in options) {
    if (typeof(options[key]) == 'function')
      newOptions[key] = CmdUtils.previewCallback(pblock,
                                                 options[key],
                                                 abort);
    else
      newOptions[key] = options[key];
  }
  xhr = jQuery.ajax(newOptions);
  return xhr;
};

// ** {{{ CmdUtils.previewGet( pblock, url, data, callback, type ) }}} **
//
// Does an asynchronous request to a remote web service.  It is used
// just like jQuery.get(), which is documented at
// http://docs.jquery.com/Ajax/jQuery.get .
// The difference is that CmdUtils.previewAjax is designed to handle
// command previews, which can be canceled by the user between the
// time that it's requested and the time it displays.  If the preview
// is canceled, the given callback will not be called.

CmdUtils.previewGet = function previewGet(pblock,
                                          url,
                                          data,
                                          callback,
                                          type) {
  var xhr;
  function abort() {
    if (xhr)
      xhr.abort();
  }
  var cb = CmdUtils.previewCallback(pblock, callback, abort);
  xhr = jQuery.get(url, data, cb, type);
  return xhr;
};

// ** {{{ CmdUtils.previewCallback( pblock, callback, abortCallback ) }}} **
//
// Creates a 'preview callback': a wrapper for a function which
// first checks to see if the current preview has been canceled,
// and if not, calls the real callback.
//
// {{{pblock}}}: the preview display element (the same one which is
// passed in as the first argument to the {{{preview()}}} method of every
// command.
//
// {{{callback}}}: the function to be called if the preview is not
// cancelled.
//
// {{{abortCallback}}}: (optional) a function that will be called instead
// if the preview is cancelled.

CmdUtils.previewCallback = function previewCallback(pblock,
                                                    callback,
                                                    abortCallback) {
  var previewChanged = false;

  function onPreviewChange() {
    pblock.removeEventListener("preview-change",
                               onPreviewChange,
                               false);
    previewChanged = true;
    if (abortCallback)
      abortCallback();
  }

  pblock.addEventListener("preview-change", onPreviewChange, false);

  function wrappedCallback() {
    if (!previewChanged) {
      pblock.removeEventListener("preview-change",
                                 onPreviewChange,
                                 false);
      return callback.apply(this, arguments);
    }
    return null;
  }

  return wrappedCallback;
};

// ** {{{ CmdUtils.makeContentPreview( filePathOrOptions ) }}} **
//
// Creates an interactive command preview from a given html template
// file or a dictionary object providing the same information.
//
// Currently this contains a lot of code that is specific to the preview
// of the Map command, and so can't be used for other commands.  In the
// future we plan to make it into a general-purpose utility function.

CmdUtils.makeContentPreview = function makeContentPreview(filePathOrOptions) {
  // TODO: Figure out when to kill this temp file.
  if( typeof(filePathOrOptions) == "object" ) {
    if( filePathOrOptions.file != null ) var filePath = filePathOrOptions.file;
    if( filePathOrOptions.html != null) {
      var data = filePathOrOptions.html;
      var file = Components.classes["@mozilla.org/file/directory_service;1"]
                           .getService(Components.interfaces.nsIProperties)
                           .get("TmpD", Components.interfaces.nsIFile);
      file.append("preview.tmp");
      file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);

      // file is nsIFile, data is a string
      var foStream = Components.
                     classes["@mozilla.org/network/file-output-stream;1"].
                     createInstance(Components.interfaces.nsIFileOutputStream);

      // use 0x02 | 0x10 to open file for appending.
      foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
      // write, create, truncate
      // In a c file operation, we have no need to set file mode with or
      // operation, directly using "r" or "w" usually.
      foStream.write(data, data.length);
      foStream.close();
      var filePath = file.path;
    }
  } else {
    filePath = filePathOrOptions;
  }

  var previewWindow = null;
  var xulIframe = null;
  var query = "";

  function showPreview() {
    previewWindow.Ubiquity.onPreview(query);
  }

  function contentPreview(pblock, directObj) {
    // TODO: This is a hack. Not sure that we should even
    // be doing something with getting a query in here. It's
    // command specifc. This function shouldn't be? -- Aza
    if( !directObj ) directObj = {text:"", html:""};

    // This is meant to be a global, so that it can affect showPreview().
    query = directObj;

    if (previewWindow) {
      showPreview();
    } else if (xulIframe) {
      // TODO
    } else {
      var browser;

      function onXulLoaded(event) {
        var uri = Utils.url({uri: filePath, base: feed.id}).spec;
        browser = xulIframe.contentDocument.createElement("browser");
        browser.setAttribute("src", uri);
        browser.setAttribute("disablesecurity", true);
        browser.setAttribute("width", 500);
        browser.setAttribute("height", 300);
        browser.addEventListener("load",
                                 Utils.safeWrapper(onPreviewLoaded),
                                 true);
        browser.addEventListener("unload",
                                 Utils.safeWrapper(onPreviewUnloaded),
                                 true);
        xulIframe.contentDocument.documentElement.appendChild(browser);
      }

      function onXulUnloaded(event) {
        if (event.target == pblock || event.target == xulIframe)
          xulIframe = null;
      }

      function onPreviewLoaded() {
        // TODO: Security risk -- this is very insecure!
        previewWindow = browser.contentWindow;

        previewWindow.Ubiquity.context = context;

        previewWindow.Ubiquity.resizePreview = function(height) {
          xulIframe.setAttribute("height", height);
          browser.setAttribute("height", height);
        };

        previewWindow.Ubiquity.insertHtml = function(html) {
          var doc = context.focusedWindow.document;
          var focused = context.focusedElement;

          // This would be nice to store the map in the buffer...  But
	        // for now, it causes a problem with a large image showing
	        // up as the default.
          //CmdUtils.setLastResult( html );

          if (doc.designMode == "on") {
            // TODO: Remove use of query here?
            // The "query" here is useful so that you don't have to retype what
            // you put in the map command. That said, this is map-command
            // specific and should be factored out. -- Aza
            doc.execCommand("insertHTML", false, query.html + "<br/>" + html);
          }
          else if (CmdUtils.getSelection()) {
	          CmdUtils.setSelection(html);
      	  }
      	  else {
      	    displayMessage("Cannot insert in a non-editable space. Use " +
                           "'edit page' for an editable page.");
      	  }
        };

        showPreview();
      }

      function onPreviewUnloaded() {
        previewWindow = null;
      }

      xulIframe = pblock.ownerDocument.createElement("iframe");
      xulIframe.setAttribute("src",
                             "chrome://ubiquity/content/content-preview.xul");
      xulIframe.style.border = "none";
      xulIframe.setAttribute("width", 500);

      xulIframe.addEventListener("load",
                                 Utils.safeWrapper(onXulLoaded),
                                 true);
      pblock.innerHTML = "";
      pblock.addEventListener("DOMNodeRemoved", onXulUnloaded, false);
      pblock.appendChild(xulIframe);
    }
  }

  return contentPreview;
};

// ** {{{ CmdUtils.makeSearchCommand( options ) }}} **
//
// A specialized version of CmdUtils.CreateCommand, this lets you make
// commands that interface with search engines, without having to write
// so much boilerplate code.
//
// {{{options}}} as the argument of CmdUtils.CreateCommand, except that
// instead of {{{options.takes}}}, {{{options.execute}}}, and
// {{{options.preview}}} you only need a single property:
//
// {{{options.url}}} The url of a search results page from the search
// engine of your choice.  Must contain the literal string {QUERY}, which
// will be replaced with the user's search term to generate a URL that
// should point to the correct page of search results.
// (We're assuming that the user's search term appears in the URL of the
// search results page, which is true for most search engines.)
// For example: http://www.google.com/search?q={QUERY}
//
// The {{{options.execute}}}, {{{options.preview}}}, and
// {{{options.takes}}} properties are all automatically generated for you
// from {{{options.url}}}, so all you need to provide is {{{options.url}}}
// and {{{options.name}}}.  You can choose to provide other optional
// properties, which work the same way as they do for
// {{{CmdUtils.CreateCommand}}}.  You can also override the auto-generated
// {{{preview()}}} function by providing your own as {{{options.preview}}}.

CmdUtils.makeSearchCommand = function makeSearchCommand( options ) {
  options.execute = function(directObject, modifiers) {
    var query = encodeURIComponent(directObject.text);
    var urlString = options.url.replace(/%s|{QUERY}/g, query);
    Utils.openUrlInBrowser(urlString);
    CmdUtils.setLastResult( urlString );
  };

  options.takes = {"search term": noun_arb_text};

  if (! options.preview ) {
    options.preview = function(pblock, directObject, modifiers) {
      var query = directObject.text;
      var content = "Performs a " + options.name + " search";
	  if(query.length > 0)
		content += " for <b>" + query + "</b>";
      pblock.innerHTML = content;
    };
    options.previewDelay = 10;
  }

  options.name = options.name.toLowerCase();

  CmdUtils.CreateCommand(options);
};

// ** {{{ CmdUtils.makeBookmarkletCommand }}} **
//
// Creates and registers a Ubiquity command based on a bookmarklet.
// When the command is run, it will invoke the bookmarklet.
//
// {{{options}}} as the argument of CmdUtils.CreateCommand, except that
// you must provide a property called:
//
// {{{options.url}}} the url of the bookmarklet code.
// Must start with "javascript:".
//
// {{{options.execute}}} and {{{options.preview}}} are generated for you
// from the url, so all you need to provide is {{{options.url}}} and
// {{{options.name}}}.
//
// You can choose to provide other optional properties, which work the
// same way as they do for {{{CmdUtils.CreateCommand}}}, except that
// since bookmarklets can't take arguments, there's no reason to provide
// {{{options.takes}}} or {{{options.modifiers}}}.

CmdUtils.makeBookmarkletCommand = function makeBookmarkletCommand(
                                                             options ) {
  options.name = options.name.toLowerCase().replace(/ /g,'-');

  options.execute = function(directObject, modifiers) {
    var code = options.url;
    CmdUtils.getDocument().location = code;
  };

  if (! options.preview ){
    options.preview = function(pblock) {
      var content = "Executes the <b>" + options.name + "</b> bookmarklet";
      pblock.innerHTML = content;
    };
  }

  CmdUtils.CreateCommand(options);
};

/* The following odd-looking syntax means that the anonymous function
 * will be defined and immediately called.  This allows us to import
 * NounType and makeSugg into CmdUtils without polluting the global
 * namespace */
(
  function() {
    var nu = {};
    Components.utils.import("resource://ubiquity/modules/nounutils.js",
                            nu);
    CmdUtils.NounType = nu.NounUtils.NounType;
    CmdUtils.makeSugg = nu.NounUtils.makeSugg;
  }
)();
