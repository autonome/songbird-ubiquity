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
 *   Jono DiCarlo <jdicarlo@mozilla.com>
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

var Cu = Components.utils;

Cu.import("resource://ubiquity/modules/setup.js");
Cu.import("resource://ubiquity/modules/localization_utils.js");

var L = LocalizationUtils.propertySelector(
  "chrome://ubiquity/locale/aboutubiquity.properties");

// This contains the common header for all the about:ubiquity child pages.

var navUrls = [
  {name: L("ubiquity.nav.main"), url: "about:ubiquity"},
  {name: L("ubiquity.nav.settings"), url: "chrome://ubiquity/content/settings.xhtml"},
  {name: L("ubiquity.nav.commands"), url: "chrome://ubiquity/content/cmdlist.xhtml"},
  {name: L("ubiquity.nav.getnewcommands"), url: "https://wiki.mozilla.org/Labs/Ubiquity/Commands_In_The_Wild"},
  {name: L("ubiquity.nav.support"), url: "chrome://ubiquity/content/support.xhtml"},
  {name: L("ubiquity.nav.hackubiquity"), url: "chrome://ubiquity/content/editor.xhtml"}
];

function setVersionString() {
  $(".version").text(UbiquitySetup.version);
}

function createNavLinks() {
  let containerElem = document.getElementById("nav-container");
  if (!containerElem)
    return;

  var U = document.createElement("span");
  U.textContent = "Ubiquity: ";
  U.className = "large";
  var [head] = document.getElementsByClassName("head");
  head.insertBefore(U, head.firstChild);

  let listElem = document.createElement("ul");
  listElem.id = "nav";
  containerElem.appendChild(listElem);

  for each (let {url, name} in navUrls) {
    let listItem = document.createElement("li");
    listElem.appendChild(listItem);
    let link = document.createElement("a");
    link.href = url;
    link.innerHTML = name;
    listItem.appendChild(link);
  }
}

function setupHelp(clickee, help) {
  var [toggler] = $(clickee).click(function toggleHelp() {
    $(help)[(this.off ^= 1) ? "slideUp" : "slideDown"]();
    [this.textContent, this.bin] = [this.bin, this.textContent];
  });
  toggler.textContent = L("ubiquity.showhidehelp.show");
  toggler.bin = L("ubiquity.showhidehelp.hide");
  toggler.off = true;
}

$(createNavLinks);
$(setVersionString);
