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
 *   Abimanyu Raja <abimanyuraja@gmail.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Maria Emerson <memerson@mozilla.com>
 *   Blair McBride <unfocused@gmail.com>
 *   Satoshi Murakami <murky.satyr@gmail.com>
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

// Broken features to fix:
//  -- sort by whatever (needs more options)
//  -- margins, for readability

// New features to add:
// show/hide help at top of page
// show/hide help for individual command
// sort by enabledness
// Cool sliding animation

// Sort modes to implement:
// sort feeds-first or cmnds-first
// if feeds-first, feeds by name or by recently subscribed?
// if cmds-first, by name, author, homepage, licence, or enabledness?

Cu.import("resource://ubiquity/modules/setup.js");
Cu.import("resource://ubiquity/modules/utils.js");

const SORT_MODE_PREF = "extensions.ubiquity.commandList.sortMode";

var Cc = Components.classes;
var Ci = Components.interfaces;

var {escapeHtml} = Utils;

function A(url, text, className) {
  var a = document.createElement("a");
  a.href = url;
  a.textContent = text || url;
  a.className = className || "";
  return a;
}

function actionLink(text, action)(
  $("<span></span>")
  .text(text)
  .click(action)
  .addClass("action"));

function fillTableCellForFeed(cell, feed, sortMode) {
  cell.append(A(feed.uri.spec, feed.title),
              "<br/>");
  if (+feed.date)
    cell.append('<span class="feed-date">' +
                feed.date.toLocaleString() +
                '</span><br/>');
  // add unsubscribe link (but not for built-in feeds)
  if (!feed.isBuiltIn)
    cell.append(actionLink(
      L("ubiquity.cmdlist.unsubscribefeed"),
      function unsubscribe() {
        feed.remove();
        cell.slideUp(function onUnsubscribe() {
          $("a[name^='" + feed.uri.spec + "']").closest("tr").hide();
          updateSubscribedCount();
          buildUnsubscribedFeeds();
        });
      }));
  // Add link to source (auto-updated or not)
  cell.append(" ", viewSourceLink(feed));

  // if it's one of the builtin or standard feeds, add l10n template link
  if (/^file:.+\b(?:builtin|standard)-feeds\b/.test(feed.srcUri.spec))
    cell.append(" ", viewLocalizationTemplate(feed));

  // If not auto-updating, display link to any updates found
  feed.checkForManualUpdate(
    function(isAvailable, href) {
      if (isAvailable)
        cell.append("<br/>", A(href,
                               L("ubiquity.cmdlist.feedupdated"),
                               "feed-updated"));
    });
  // if sorting by feed, make feed name large and put a borderline
  if (/^feed/.test(sortMode)) {
    cell.addClass("topcell command-feed-name");
  }
}

function formatAuthors(authors) (
  [formatCommandAuthor(a)
   for each (a in [].concat(authors))].join(", "));

function formatCommandAuthor(authorData) {
  if (!authorData) return "";

  if (typeof authorData === "string") return authorData;

  var authorMarkup = "";
  if ("name" in authorData && !("email" in authorData)) {
    authorMarkup += escapeHtml(authorData.name) + " ";
  }
  else if ("email" in authorData) {
    var ee = escapeHtml(authorData.email);
    authorMarkup += (
      '<a href="mailto:' + ee + '">' +
      ("name" in authorData ? escapeHtml(authorData.name) : ee) +
      '</a> ');
  }

  if ("homepage" in authorData) {
    authorMarkup += ('[<a href="' + escapeHtml(authorData.homepage) +
                     '">' + L("ubiquity.cmdlist.homepage") + '</a>]');
  }

  return authorMarkup;
}

function fillTableRowForCmd(row, cmd, className) {
  var checkBoxCell = $(
    '<td><input type="checkbox"/></td>');
  var isEnabled = cmd.disabled ? false : true;
  var checkBox = (checkBoxCell.find("input").val(cmd.id));
  if (isEnabled)
    (checkBox.attr("checked", "checked"));
  else
    (checkBox.removeAttr("checked"));
  (checkBox.bind("change", onDisableOrEnableCmd));

  var {name, names, nameArg, homepage} = cmd;
  var cmdDisplayName = (names[0] || name);
  if (nameArg)
    // TODO: we need some sort of flag to check whether the nameArg
    // was a prefix or a suffix.
    cmdDisplayName += " " + nameArg;

  var authors = cmd.authors || cmd.author;
  var contributors = cmd.contributors || cmd.contributor;

  var cmdElement = $(
    '<td class="command">' +
    ("icon" in cmd ?
     <img class="favicon" src={cmd.icon}/>.toXMLString() : "") +
    (<><a class="id" name={cmd.id}
     /><span class="name">{cmdDisplayName}</span></>) +
    ("description" in cmd ?
     '<span class="description">' + cmd.description + '</span>' : "") +
    (names.length < 2 ? "" :
     ('<div class="synonyms-container light">' +
      L("ubiquity.cmdlist.synonyms",
        ('<span class="synonyms">' +
         escapeHtml(names.slice(1).join(", ")) +
         '</span>')) +
      '</div>')) +
    (!authors ? "" :
     '<span class="author light">' +
     L("ubiquity.cmdlist.createdby", formatAuthors(authors)) +
     '</span> ') +
    (!("license" in cmd) ? "" :
     ('<br/><span class="license light">' +
      L("ubiquity.cmdlist.license", escapeHtml(cmd.license)) +
      '</span>')) +
    (!contributors ? "" :
     ('<div class="contributors light">' +
      L("ubiquity.cmdlist.contributions", formatAuthors(contributors)) +
      '</div>')) +
    (!homepage ? "" :
     ('<div class="homepage light">' +
      L("ubiquity.cmdlist.viewmoreinfo",
        let (hh = escapeHtml(homepage)) hh.link(hh)) +
      '</div>')) +
    ("help" in cmd ? '<div class="help">' + cmd.help + '</div>' : "") +
    '</td>');

  if (UbiquitySetup.parserVersion === 2) {
    if (!("arguments" in cmd)) {
      cmdElement.addClass("not-loaded").find(".name").attr(
        "title",
        L("ubiquity.cmdlist.oldparsertitle"));
    }
    if (cmd.oldAPI) {
      cmdElement.addClass("oldAPI").prepend(
        '<span class="badge">' +
        '<a href="https://wiki.mozilla.org/Labs/Ubiquity/' +
        'Parser_2_API_Conversion_Tutorial">' +
        '<img src="resource://ubiquity/chrome/skin/icons/oldapi.png"/>' +
        '</a></span>');
    }
  }

  if (className) {
    checkBoxCell.addClass(className);
    cmdElement.addClass(className);
  }

  return row.append(checkBoxCell, cmdElement);
}

function updateSubscribedCount() {
  var {feedManager, commandSource} = UbiquitySetup.createServices();
  $("#num-commands").html(commandSource.commandNames.length);
  $("#num-subscribed-feeds").html(feedManager.getSubscribedFeeds().length);
}

function updateUnsubscribedCount() {
  $("#num-unsubscribed-feeds").html(
    UbiquitySetup.createServices().feedManager
    .getUnsubscribedFeeds().length);
}

function buildTable() {
  let {feedManager, commandSource} = UbiquitySetup.createServices();
  let table = $("#commands-and-feeds-table").empty();
  let sortMode = getSortMode();
  let commands = commandSource.getAllCommands();

  function addFeedToTable(feed) {
    let cmdIds = [id for (id in feed.commands)];
    let feedCell = $("<td></td>");
    let {length} = cmdIds;
    if (length > 1) feedCell.attr("rowspan", length);
    fillTableCellForFeed(feedCell, feed, sortMode);

    let firstRow = $("<tr></tr>");
    firstRow.append(feedCell);
    if (length)
      fillTableRowForCmd(firstRow, commands[cmdIds[0]], "topcell");
    else
      firstRow.append($('<td class="topcell"></td><td class="topcell"></td>'));
    table.append(firstRow);

    for (let i = 1; i < length; ++i) { // starting from 1 is on purpose
      table.append(fillTableRowForCmd($("<tr></tr>"), commands[cmdIds[i]]));
    }
  }

  function addCmdToTable(cmd) {
    let aRow = $("<tr></tr>");
    let feedCell = $("<td></td>");
    let feed = getFeedForCommand(feedManager, cmd);
    if (feed) {
      fillTableCellForFeed(feedCell, feed);
    }
    aRow.append(feedCell);
    fillTableRowForCmd(aRow, cmd);
    table.append(aRow);
  }

  updateSubscribedCount();

  if (/^feed/.test(sortMode))
    (feedManager.getSubscribedFeeds()
     .sort(/date$/.test(sortMode) ? byDate : byTitle)
     .forEach(addFeedToTable));
  else
    (sortCmdListBy([cmd for each (cmd in commandSource.getAllCommands())],
                   sortMode === "cmd" ? "name" : "enabled")
     .forEach(addCmdToTable));
}

function byTitle(a, b) !(a.title <= b.title);

function byDate(a, b) b.date - a.date;

function sortCmdListBy(cmdList, key) {
  function alphasort(a, b) {
    var aKey = a[key].toLowerCase();
    var bKey = b[key].toLowerCase();

    // ensure empty fields get given lower priority
    if(aKey.length > 0  && bKey.length == 0)
      return -1;
    if(aKey.length == 0  && bKey.length > 0)
      return 1;

    if(aKey < bKey)
      return -1;
    if(aKey > bKey)
      return 1;

    return 0;
  }
  function checksort(a, b) a.disabled - b.disabled;

  return cmdList.sort(key === "enabled" ? checksort : alphasort);
}

function getFeedForCommand(feedManager, cmd) {
  // This is a really hacky implementation -- it involves going through
  // all feeds looking for one containing a command with a matching name.
  for each (let feed in feedManager.getSubscribedFeeds())
    if (cmd.id in (feed.commands || {})) return feed;
  return null;
}

// Bind this to checkbox "change".
function onDisableOrEnableCmd() {
  // update the preferences, when the user toggles the active
  // status of a command.
  var {commandSource} = UbiquitySetup.createServices();
  commandSource.getCommand(this.value).disabled = !this.checked;
}

// this was to make both subscribed and unsubscribed list entries, but is
// now used only for unsubscribed ones.
function makeUnsubscribedFeedListElement(info) {
  var $li = $("<li></li>").append(
    A(info.uri.spec, info.title),
    ("<ul>" +
     ["<li>" + escapeHtml(cmd.name) + "</li>"
      for each (cmd in info.commands)].join("") +
     "</ul>"),
    actionLink(L("ubiquity.cmdlist.resubscribe"), function resubscribe() {
      info.unremove();
      $li.slideUp(function onResubscribe() {
        updateUnsubscribedCount();
        buildTable();
        location.hash = "graveyard";
      });
    }),
    " ",
    actionLink(L("ubiquity.cmdlist.purge"), function purge() {
      info.purge();
      $li.slideUp("slow");
    }),
    " ",
    viewSourceLink(info));
  return $li[0];
}

function buildUnsubscribedFeeds() {
  var unscrFeeds = (UbiquitySetup.createServices().feedManager
                    .getUnsubscribedFeeds());
  var isEmpty = !unscrFeeds.length;

  updateUnsubscribedCount();
  $("#command-feed-graveyard-div, #unsubscribed-feeds-help")
    [isEmpty ? "hide" : "show"]();
  if (isEmpty) return;

  // TODO: sortMode could also be used to order the unsubscribed feeds?
  // let sortMode = getSortMode();
  var $graveyard = $("#command-feed-graveyard").empty();
  for each (let feed in unscrFeeds)
    $graveyard.append(makeUnsubscribedFeedListElement(feed));
}

function setSortMode(newSortMode) {
  Application.prefs.setValue(SORT_MODE_PREF, newSortMode);
}

function getSortMode()(
  Application.prefs.getValue(SORT_MODE_PREF, "feed"));

function changeSortMode(newSortMode) {
  setSortMode(newSortMode);
  buildTable();
}

function viewSourceLink(feed) (
  A("view-source:" + feed.viewSourceUri.spec,
    L("ubiquity.cmdlist." +
      (feed.canAutoUpdate ? "viewfeedsource" : "viewsource")),
    "action"));

function viewLocalizationTemplate(feed) (
  A(("chrome://ubiquity/content/localization-template.xhtml#" +
     feed.srcUri.spec),
    L("ubiquity.cmdlist.localetemplate"),
    "action"));

// TODO: perform an inventory of similar effects found throughout and move
// them into a neatly packaged effects library later.
// Try and tag them for now. (slides/fades/etc).

$(function onReady() {
  setupHelp("#show-hide-cmdlist-help", "#cmdlist-help-div");
  buildTable();
  buildUnsubscribedFeeds();
  // jump to the right anchor
  if (location.hash) location.hash += "";
});
