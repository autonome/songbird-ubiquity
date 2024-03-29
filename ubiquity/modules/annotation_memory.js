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
 *   Vladimir Markin <v.markin@utoronto.ca>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Atul Varma <atul@mozilla.com>
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

// = AnnotationService =
//
// The {{{AnnotationService}}} class presents an interface that is virtually
// identical to {{{nsIAnnotationService}}}.

var EXPORTED_SYMBOLS = ["AnnotationService"];

var Ci = Components.interfaces;
var Cc = Components.classes;

var SQLITE_SCHEMA =
  ("CREATE TABLE ubiquity_annotation_memory(" +
   "  uri VARCHAR(256)," +
   "  name VARCHAR(256)," +
   "  value MEDIUMTEXT," +
   " PRIMARY KEY (uri, name));");

// == The NiceConnection Class ==
//
// This is just a friendier wrapper for a
// {{{mozIStorageConnection}}}. It has the exact same interface as the
// object it wraps, with the exception that if a SQL statement fails,
// instead of an unhelpful XPCOM error with an {{{NS_ERROR_FAILURE}}}
// result being raised, a more descriptive one is raised.

function NiceConnection(connection) {
  if (connection.constructor == NiceConnection)
    return connection;

  this.createStatement = function nice_createStatement(sql) {
    try {
      return connection.createStatement(sql);
    } catch (e if e.result == Components.results.NS_ERROR_FAILURE) {
      throw new Error("AnnotationService SQL error: " +
                      connection.lastErrorString + " in " +
                      sql);
    }
  };

  this.executeSimpleSQL = function nice_executeSimpleSQL(sql) {
    try {
      connection.executeSimpleSQL(sql);
    } catch (e if e.result == Components.results.NS_ERROR_FAILURE) {
      throw new Error("AnnotationService SQL error: " +
                      connection.lastErrorString + " in " +
                      sql);
    }
  };

  this.constructor = NiceConnection;
  this.__proto__ = connection;
}

// == The AnnotationService Class ==
//
// A {{{nsIAnnotationService}}} replacement using a SQLite database
// for storage.

function AnnotationService(connection) {
  var ann = {};
  var urls = {};
  var observers = [];
  var self = this;

  if (!connection)
    throw new Error("AnnotationService's connection is " + connection);

  connection = new NiceConnection(connection);

  function initialize() {
    var ioSvc = Cc["@mozilla.org/network/io-service;1"]
                .getService(Ci.nsIIOService);
    let selectSql = ("SELECT uri, name, value " +
                     "FROM ubiquity_annotation_memory");
    var selStmt = connection.createStatement(selectSql);
    try {
      while (selStmt.executeStep()) {
        let uri_spec = selStmt.getUTF8String(0);
        let name = selStmt.getUTF8String(1);
        let value = selStmt.getUTF8String(2);
        if (!ann[uri_spec]) {
          ann[uri_spec] = new Object();
          urls[uri_spec] = ioSvc.newURI(uri_spec, null, null);
        }
        ann[uri_spec][name] = value;
      }
    } finally {
      selStmt.finalize();
    }
  }

  self.addObserver = function(anObserver) {
    observers.push(anObserver);
  };

  self.removeObserver = function(anObserver) {
    var index = observers.indexOf(anObserver);
    if (index == -1)
      throw new Error("Observer does not exist: " + anObserver);
    observers.splice(index, 1);
  };

  self.getPagesWithAnnotation = function(name) {
    var results = [];
    for (var uri in ann)
      if (typeof(ann[uri][name]) != 'undefined')
        results.push(urls[uri]);
    return results;
  };

  self.pageHasAnnotation = function(uri, name) {
    if (ann[uri.spec] &&
        typeof(ann[uri.spec][name]) != 'undefined')
      return true;
    return false;
  };

  // === {{{AnnotationService.toJSON()}}} ===
  //
  // This method returns the annotation service's data as a
  // JSON object.

  self.toJSON = function() {
    var json = Cc["@mozilla.org/dom/json;1"]
      .createInstance(Ci.nsIJSON);
    return json.encode(ann);
  };

  // === {{{AnnotationService#getPageAnnotation()}}} ===
  //
  // This method behaves just like its {{{nsIAnnotationService}}}
  // counterpart, with the exception that it can optionally take a
  // third parameter that specifies a default value to return if the
  // given annotation doesn't exist. If no default value is passed,
  // then this method behaves just like its {{{nsIAnnotationService}}}
  // counterpart.

  self.getPageAnnotation = function(uri, name, defaultValue) {
    if (!self.pageHasAnnotation(uri, name)) {
      if (typeof(defaultValue) == 'undefined')
        throw Error('No such annotation');
      else
        return defaultValue;
    }
    return ann[uri.spec][name];
  };

  self.setPageAnnotation = function(uri, name, value, dummy,
                                    expiration) {
    if (!ann[uri.spec]) {
      ann[uri.spec] = new Object();
      urls[uri.spec] = uri;
    }

    if (typeof(ann[uri.spec][name]) == "undefined" ||
        ann[uri.spec][name] != value) {
      // Only write out to the database if our actual contents have
      // changed.
      ann[uri.spec][name] = value;

      if (expiration != self.EXPIRE_SESSION) {
        let insertSql = ("INSERT OR REPLACE INTO ubiquity_annotation_memory " +
                         "VALUES (?1, ?2, ?3)");
        var insStmt = connection.createStatement(insertSql);
        try {
          insStmt.bindUTF8StringParameter(0, uri.spec);
          insStmt.bindUTF8StringParameter(1, name);
          insStmt.bindUTF8StringParameter(2, value);
          insStmt.execute();
        } finally {
          insStmt.finalize();
        }
      }
    }
    observers.forEach(
      function(observer) { observer.onPageAnnotationSet(uri, name); }
    );
  };

  self.removePageAnnotation = function(uri, name) {
    if (!self.pageHasAnnotation(uri, name))
      throw Error('No such annotation');
    delete ann[uri.spec][name];

    // Delete from DB
    let updateSql = ("DELETE FROM ubiquity_annotation_memory " +
                     "WHERE uri = ?1 AND name = ?2");
    var updStmt = connection.createStatement(updateSql);
    updStmt.bindUTF8StringParameter(0, uri.spec);
    updStmt.bindUTF8StringParameter(1, name);
    updStmt.execute();
    updStmt.finalize();
    observers.forEach(
        function(observer) { observer.onPageAnnotationRemoved(uri, name); }
    );
  };

  // These values don't actually mean anything, but are provided to
  // ensure compatibility with nsIAnnotationService.
  self.EXPIRE_WITH_HISTORY = 0;
  self.EXPIRE_NEVER = 1;
  self.EXPIRE_SESSION = 2;

  initialize();
}

// === {{{AnnotationService.getProfileFile()}}} ===
//
// This static convenience method returns an {{{nsIFile}}} object
// corresponding to a file in the current user's profile directory.

AnnotationService.getProfileFile = function getProfileFile(filename) {
  var dirSvc = Cc["@mozilla.org/file/directory_service;1"]
               .getService(Ci.nsIProperties);

  var file = dirSvc.get("ProfD", Ci.nsIFile);
  file.append(filename);
  return file;
};

// === {{{AnnotationService.openDatabase()}}} ===
//
// This static convenience method takes an {{{nsIFile}}} object
// corresponding to a SQLite database for the {{{AnnotationService}}}
// and returns a {{{NiceConnection}}} to the database. If the file
// doesn't exist, it's automatically created, and if the database
// doesn't already contain the table needed to store data for
// {{{AnnotationService}}}, it's created too.

AnnotationService.openDatabase = function openDatabase(file) {
  var storSvc = Cc["@mozilla.org/storage/service;1"]
                .getService(Ci.mozIStorageService);
  var connection = null;

  // openDatabase will create empty file if it's not there yet.
  connection = new NiceConnection(storSvc.openDatabase(file));

  if (!connection.tableExists("ubiquity_annotation_memory"))
    connection.executeSimpleSQL(SQLITE_SCHEMA);

  return connection;
};
