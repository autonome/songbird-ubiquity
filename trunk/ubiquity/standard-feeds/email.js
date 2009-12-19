var gmailAppsDomain = "";
/*
CmdUtils.CreateCommand({
  name: "detect-gmail-apps-domain",
  execute: function() {
    if (gmailAppsDomain.length == 0) {
      getGmailAppsDomain();
    }
    if (gmailAppsDomain.secure) {
      displayMessage( "secure " + gmailAppsDomain );
    } else {
      displayMessage( "insecure " + gmailAppsDomain );
    }
  }
});
*/
function getGmailAppsDomain() {
  // looks for and returns the gmail-for-apps domain
  // as well as caches it for next time

  var gmailAppsURL = "://mail.google.com/a/";
  // return from cache
  if (gmailAppsDomain.length > 0) {
    return gmailAppsDomain;
  }

  // look in cookie
  var secure = false;
  var secCookie = Utils.getCookie("mail.google.com", "GXAS");
  if (secCookie == undefined) {
    secCookie = Utils.getCookie("mail.google.com", "GXAS_SEC");
    secure = true;
  }

  if (secCookie != undefined) {
    // cookie is of the form hosted-domain.com=DQAAAH4AA....
    var domain = secCookie.split("=")[0];
    if (domain != undefined && domain.length > 0) {
      gmailAppsDomain = domain;
      gmailAppsDomain.secure = secure;
      return gmailAppsDomain;
    }
  } else {
    // no cookie but look in open tabs
    var tab = findGmailTab();
    if (tab != undefined) {
      var location = String(tab.document.location);
      if (location.indexOf(gmailAppsURL) != -1) {
        gmailAppsDomain = extractGmailAppsDomain(location);
        gmailAppsDomain.secure = (location.indexOf("https://") == 0);
      }
    }
  }

  return gmailAppsDomain;
}

function extractGmailAppsDomain(URL) {
  // given a URL, will find the gmail apps domain part of it
  if (gmailAppsDomain.length > 0) {
    return gmailAppsDomain;
  }
  var gmailAppsURL = "://mail.google.com/a/";
  var index = URL.indexOf(gmailAppsURL);
  if (index != -1) {
    var domain = URL.slice(index+gmailAppsURL.length);
    domain = domain.slice(0,domain.indexOf("/"));
    if (domain != null && domain.length > 0) {
      return domain;
    }
  }
  return "none";
}

// TODO: Should also use the mailto application mapping.
// TODO: support Google Apps
function detectEmailProvider() {
  var domains = {
    "mail.google.com":0,
    "mail.yahoo.com":0,
    "mail.aol.com":0,
    "hotmail.com":0,
  };
  var max = {domain: "", hits: 0};
  var totalHits = 0;
  for (var domain in domains) {
    var hits = Utils.history.visitsToDomain(domain);
    domains[domain] = hits;
    totalHits += hits;
    if( max.hits <= hits ) {
      max.domain = domain;
      max.hits = hits;
    }
  }

  if (max.hits / totalHits > .75)
    return max.domain;
  return null;
}
/*
CmdUtils.CreateCommand({
  name: "detect-email-provider",
  execute: function (){
    displayMessage( detectEmailProvider() );
  }
});
*/

function findGmailTab()(
  Utils.tabs.search(/^https?:\/\/mail\.google\.com\/mail\/(?:[?#]|$)/)[0]);

/* TODO: should take a plugin "instrument" argument so that it can take
 * "email using google", "email using yahoo", etc.
 */
CmdUtils.CreateCommand({
  names: ["email", "mail", "send email", "gmail.com"],
  arguments: [
    {role: "object", label: "message", nountype: noun_arb_text},
    {role: "goal", nountype: noun_type_contact}
  ],
  icon: "chrome://ubiquity/skin/icons/email.png",
  description: "Begins composing an email to a person from your contact list.",
  help: "" + (
    <>Currently only works with <a href="http://mail.google.com">Google Mail</a>,
    so you&#39;ll need a Gmail account to use it.<br/>
    Try selecting part of a web page (including links, images, etc)
    and then issuing "email this".<br/>
    You can also specify the recipient of the email using the word "to"
    and the name of someone from your contact list.
    For example, try issuing "email hello to jono"
    (assuming you have a friend named "jono").</>),
  preview: function(pblock, {object, goal}) {
    pblock.innerHTML = _("Creates an email message {if recipient} to ${recipient}{/if} with a link to the current page{if content} and these contents:<br/><br/>${content}{/if}.",
        {recipient: goal.text, content: object.html});
  },
  execute: function({object: {text, html}, goal: {text: toAddress}}) {
    var {title, URL} = context.focusedWindow.document;
    // #574: no one I tested liked the stock "You might be interested in"
    //       just offer a link and the selected text.
    text = [title, URL, "", text].join("\n");
    html = <p><a href={URL}>{title}</a></p> + "\n" + html;
    title = "'" + title + "'";

    var gmailTab = findGmailTab() || 0;
    // Note that this is technically insecure because we're
    // accessing wrappedJSObject, but we're only executing this
    // in a Gmail tab, and Gmail is trusted code.
    var {gmonkey} = gmailTab && gmailTab.document.defaultView.wrappedJSObject;
    if (!gmonkey) {
      // No Gmail  tab open?  Open a new one:
      Utils.openUrlInBrowser(
        "http://mail.google.com/mail/" +
        Utils.paramsToString({
          fs: 1, tf: 1, view: "cm",
          su: title, to: toAddress, body: text,
        }));
      return;
    }
    var me = this;
    gmonkey.load("1.0", function continuer(gmail) {
      // For some reason continuer.apply() won't work--we get
      // a security violation on Function.__parent__--so we'll
      // manually safety-wrap this.
      try {
        var sidebar = gmail.getNavPaneElement();
        var composeMail = sidebar.getElementsByTagName("span")[0];
        //var composeMail = sidebar.getElementById(":qw");
        var event = composeMail.ownerDocument.createEvent("Events");
        event.initEvent("click", true, false);
        composeMail.dispatchEvent(event);
        var active = gmail.getActiveViewElement();
        var toField = composeMail.ownerDocument.getElementsByName("to")[0];
        toField.value = toAddress;
        var subject = active.getElementsByTagName("input")[0];
        if (subject) subject.value = title;
        var iframe = active.getElementsByTagName("iframe")[0];
        if (iframe)
          iframe.contentDocument.execCommand("insertHTML", false, html);
        else {
          var body = composeMail.ownerDocument.getElementsByName("body")[0];
          body.value = text + body.value;
        }
        gmailTab.focus();
      } catch (e) {
        displayMessage({
          text: _("A gmonkey exception occurred."),
          exception: e}, me);
      }
    });
  }
});

function gmailChecker(callback, service) {
  var url = "https://mail.google.com/mail/feed/atom";
  if(service == "googleapps"){
    url = "https://mail.google.com/a/" + getGmailAppsDomain() + "/feed/atom";
  }
  jQuery.get(url, null, function(atom) {
    var emailDetails = {};
    var firstEntry = jQuery("entry:first", atom);
    if (firstEntry.length)
      emailDetails.lastEmail = {
        author: firstEntry.find("author > name").text(),
        subject: firstEntry.find("title").text(),
        summary: firstEntry.find("summary").text(),
        href: firstEntry.find("link").attr("href"),
      };
    callback(emailDetails);
  }, "xml");
}

CmdUtils.CreateCommand({
  names: ["get last email"],
  arguments: [{role: "source",
               nountype: noun_type_email_service,
               label: "email service provier"}],
  icon: "chrome://ubiquity/skin/icons/email_open.png",
  description: ("Displays your most recent incoming email. Requires a " +
                '<a href="http://mail.google.com">Gmail</a> account.'),
  preview: function(pBlock, arguments) {
    var provider = (arguments.source && arguments.source.text) ?
                     arguments.source.text : "";
    pBlock.innerHTML = _("Displays your most recent incoming email...");
    // Checks if user is authenticated first
    // if not, do not ajaxGet, as this triggers authentication prompt
    if (Utils.getCookie(".mail.google.com", "GX")) {
      gmailChecker(function(emailDetails) {
        if (emailDetails.lastEmail)
          pBlock.innerHTML = _("Last unread e-mail: <a href=\"${lastEmail.href}\"> <p><b>${lastEmail.author}</b> says: <b>${lastEmail.subject}</b></p> <p>${lastEmail.summary}</p></a>",emailDetails);
        else
          pBlock.innerHTML = _("<b>You have no new mail!</b>");
      }, provider);
    } else {
      pBlock.innerHTML = _("You are not logged in!<br />Press enter to log in.");
    }
  },
  execute: function(arguments) {
    var provider = (arguments.source && arguments.source.text) ?
                     arguments.source.text : "";
    var me = this;
    gmailChecker(function(emailDetails) {
      if (emailDetails.lastEmail)
        displayMessage(_("You have new email! ${lastEmail.author} says: ${lastEmail.subject}",emailDetails), me);
      else
        displayMessage(_("You have no new mail."), me);
    }, provider);
  }
});

CmdUtils.CreateCommand({
  names: ["get email address"],
  icon: "chrome://ubiquity/skin/icons/email.png",
  description: ("Looks up the email address of a person " +
                "from your contacts list given their name. "),
  help: "Execute the command to copy the address to your clipboard.",
  argument: noun_type_contact,
  execute: function({object: {text}}) {
    if (!text) return;
    Utils.clipboard.text = text;
    displayMessage(text, this);
  },
  preview: function(pbl, args) {
    pbl.innerHTML = args.object.html || this.previewDefault();
  },
});
