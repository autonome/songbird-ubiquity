EXPORTED_SYMBOLS = ['start'];

let Cc = Components.classes;
let Ci = Components.interfaces;

let events = {};
Components.utils.import('resource://jsbridge/modules/events.js', events);

Components.utils.import('resource://ubiquity/modules/utils.js');
Components.utils.import("resource://ubiquity/tests/framework.js");

let INTERVAL_MS = 100;

function runTests() {
  let tests = {};

  Components.utils.import("resource://ubiquity/tests/test_all.js", tests);

  var suite = new TestSuite(DumpTestResponder, tests);
  var success = true;

  try {
    suite.start();
  } catch (e) {
    dump(e + '\n');
    success = false;
  }

  events.fireEvent('ubiquity:success', success);
}

function scheduleCheckForUbiquity() {
  function doCheck() {
    var xulAppInfo = Components.classes["@mozilla.org/xre/app-info;1"]
             .getService(Components.interfaces.nsIXULAppInfo);
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
             .getService(Ci.nsIWindowMediator);
    if(xulAppInfo.name == "Songbird"){         
    var win = wm.getMostRecentWindow('Songbird:Main');
    }
    else{
    var win = wm.getMostRecentWindow('navigator:browser');
    }
    if (win.gUbiquity) {
      dump('Ubiquity found.\n');
      runTests();
    } else {
      dump('Waiting ' + INTERVAL_MS + ' ms...\n');
      scheduleCheckForUbiquity();
    }
  }

  Utils.setTimeout(doCheck, INTERVAL_MS);
}

function start() {
  scheduleCheckForUbiquity();
}
