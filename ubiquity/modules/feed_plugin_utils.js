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
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Blair McBride <unfocused@gmail.com>
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
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

var EXPORTED_SYMBOLS = ["finishCommand"];

// Default delay to wait before calling a preview function, in ms.
const DEFAULT_PREVIEW_DELAY = 150;

function finishCommand(cmd) {
  Components.utils.import("resource://ubiquity/modules/setup.js");

  if (UbiquitySetup.parserVersion === 2) {
    // Convert for Parser 2 if it takes no arguments.
    if (cmd.oldAPI && !cmd.DOType && !cmd.modifiers && isEmpty(cmd.arguments)) {
      dump("converting 1 > 2: " + cmd.name + "\n");
      let clone = {__proto__: cmd, arguments: []};
      if (!cmd.names) clone.names = [cmd.name];
      cmd = clone;
    }
    if (!cmd.oldAPI && !cmd.arguments)
      cmd.arguments = [];
    if (cmd.arguments) {
      Components.utils.import(
        "resource://ubiquity/modules/localization_utils.js");
      cmd = localizeCommand(cmd);
    }
  } else {
    cmd.name = hyphenize(cmd.name);
    for each (let key in ["names", "synonyms"]) {
      let names = cmd[key];
      for (let i in names) names[i] = hyphenize(names[i]);
    }
  }

  if (cmd.previewDelay == null)
    cmd.previewDelay = DEFAULT_PREVIEW_DELAY;

  return cmd;
}

function isEmpty(obj) !obj || !obj.__count__;

function hyphenize(name) name.replace(/ /g, "-");
