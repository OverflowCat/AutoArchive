// ==UserScript==
// @name	AutoArchive
// @namespace      Flare0n (reposted from http://userscripts-mirror.org)
// @description    Automatically save the page you visited (or all links you can see) to "Wayback Machine".
// @version	1.0.3
// @match	http://*/*
// @match	https://*/*
// @match	http://wayback.archive.org/web/*
// @match	https://wayback.archive.org/web/*
// @match	http://web.archive.org/web/*
// @match	https://web.archive.org/web/*

// @exclude	http://archive.vn/*
// @exclude	http://archive.is/*
// @exclude	http://archive.fo/*

// @exclude https://api.twitter.com/*

// @exclude	https://github.com/OverflowCat/*
// @exclude https://pan.baidu.com/*
// @exclude https://www.baidu.com/*
// @exclude http://baidustatic.com/*
// @exclude https://baidustatic.com/*
// @exclude https://t.co/*
// @exclude https://diigo.com
// @exclude https://*.telegram.org/*

// @exclude https://liker.social/web/notifications
// @exclude https://*.google.*/*
// @exclude https://*.*.google.com/*
// @exclude http://*.google.*.*/*
// @exclude https://*.youtube.com/*
// @exclude https://*.cloudflare.com/*
// @exclude https://www.grammarly.com/*
// @exclude https://qiandao.today/*
// @exclude https://secure.nicovideo.jp/*
// @exclude http://*.speedtest.net/*
// @exclude https://qzone.qq.com/*
// @exclude https://*.startpage.com/*
// @exclude http://hkuri.cneas.tohoku.ac.jp/*
// @exclude https://stackoverflow.com/*
// @exclude https://b23.tv/*
// @exclude https://pv.vlogdownloader.com/*
// @exclude https://www.tumblr.com/register/*

// @grant	GM_setValue
// @grant	GM_getValue
// @grant	GM_xmlhttpRequest
// @run-at document-start
// ==/UserScript==

// THIS SCRIPT IS FORKED FROM https://greasyfork.org/en/scripts/368062-autosave-to-internet-archive-wayback-machine.
// HERE IS THE MESSAGE LEFT BY THE AUTHOR.

/*  PLEASE DONATE if you think this is useful.
(These are probably useless since he probably forgot about them.)
    BTC : 1EdSmaYxKuhFc4eT3vhKsRczwnrstXCxG6
    LTC : LWyNiRmW9aDJWxQVch27WxgL6uPdp6Bbmx
    DOGE : DFf6c3Le3RxpStdABhfqit5Aqa8xHg459S  */
function setv(_key, _value) {
  return GM_setValue(_key, _value);
}

function getv(_key, defaultValue) {
  return GM_getValue(_key, defaultValue);
}

function io(message) {
  var warningLV = 1

  if (warningLV == 2) {
    alert(message);
  } else if (warningLV == 1) {
    console.log(message)
  }
}

function newPage() {
  console.log('A "New" page has loaded.');
  archiving();
}
// HASH CHANGE //
var fireOnHashChangesToo = true;
var pageURLCheckTimer = setInterval(
  function () {
    if (this.lastPathStr !== location.pathname ||
      this.lastQueryStr !== location.search ||
      (fireOnHashChangesToo && this.lastHashStr !== location.hash)
    ) {
      this.lastPathStr = location.pathname;
      this.lastQueryStr = location.search;
      this.lastHashStr = location.hash;
      newPage();
    }
  }, 2333
);

function archiving() {
  //alert("acfaewf")
  /* ==== Options ==== */
  //  Will only be applied in non-https pages, so feel free to enable. (If you are on "https://" page, links will never sent.)
  var save_visited = true; // Save the page you have just visited.
  var save_all_links = false;
  var save_all_links_no_host_restriction = false; // Only applied if [save_all_links = true;]
  //  Save all links on a page.
  //  When you set "save_all_links_no_host_restriction" as false, links to other hosts will never sent.
  //  For your security, I don't recommend you to set "save_all_links_no_host_restriction" as true.

  //---Site Specific Options---//
  var twitter_clean = true; // Trim the link for easier reference in the future.
  var twitter_redirect = true; // Trim ?s=??. and "/photo/1"
  //[SUB] It works only when both twitter_ options are true.
  /* ==== End of Options ==== */

  var _counter = getv("_counter", 0) + 1;
  setv("_counter", _counter);
  var _counter_archived = getv("_counter_archived", 0);

  document.addEventListener("DOMContentLoaded", function () {
    // Check if matches "<h2 class="blue">This page is available on the web!</h2>".
    if (document.getElementsByTagName('body')[0].innerHTML.indexOf("<h2 class=\"blue\">This page is available on the web!</h2>") !== -1) {
      var a = location.href;
      a.match(/^https?:\/\/(wayback|web).archive.org\/web/) ? location.href = decodeURI(a).replace(/^https?:\/\/(wayback|web).archive.org\/(web\/(\d|\*)+|save)\/(https?:\/\/)?/, "https://wayback.archive.org/save/") : location.href = "https://wayback.archive.org/save/" + a;
    }
  }, false);
  var u = location.href;
  /* ==== TWITTER ====*/
  if (u.indexOf("twitter.com") >= 0) {
    var twitter_urls = ["https://twitter.com/home", "https://twitter.com/notifications", "https://twitter.com/explore", "https://twitter.com/messages", "https://twitter.com/"];
    if (twitter_urls.indexOf(u) != -1) return false;
    var reg_t = new RegExp("^https?://twitter.com/i/");
    if (reg_t.test(u)) return false;
    reg_t = new RegExp("^https?://twitter.com/.+/photo/.");
    if (reg_t.test(u)) return false;
    reg_t = null;
    if (u != location.href) {
      var quemark = u.indexOf("?")
      if (quemark >= 19 && twitter_clean) {
        u = u.substring(0, quemark);
        if (twitter_redirect) {
          window.location.replace(u);
          return false;
        }
      }
    }
    /* ==== Twitter force HTTP ==== */
    // Twitter displays reactive UI when using HTTPS, which is bad for archiving.
    u = u.replace("https://twitter.com", "http://twitter.com");
    u = u.replace("https://mobile.twitter.com", "http://mobile.twitter.com");

  };
  // Do not save Google search results, logins
  if (u.indexOf("https://www.google.com/search?q=") == 0 || u.indexOf("https://accounts.google.") == 0) return false; //save_visited = false;

  // @exclude https://mastodon.social/web/notifications
  if (u == "https://mastodon.social/web/notifications") return false;
  // Save the page you have just visited.
  if (save_visited) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'http://web.archive.org/save/' + encodeURI(decodeURI(u)),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    console.log(u + " saved");
    _counter_archived += 1;
  };
  io(u + " saved!!");

  // Save all links you can see on a page.
  if (save_all_links) {
    window.addEventListener("load", function () {
      var sent_array = [];
      for (var elements1 = document.getElementsByTagName("a"), i = elements1.length - 1; i >= 0; i--) {
        var URL1 = decodeURI(elements1[i].href);
        if (URL1.match(/^https?:\/\/(wayback|web).archive.org\/.*http/)) {
          URL1.replace(/^https?:\/\/(wayback|web).archive.org\/web\/[0-9]+\/http/, "http");
        }
        if ((save_all_links_no_host_restriction || URL1.match(location.hostname)) && -1 === sent_array.indexOf(URL1)) {
          sent_array[sent_array.length] = URL1;
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://web.archive.org/save/' + encodeURI(URL1),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            }
          });
          console.log('http://web.archive.org/save/' + encodeURI(URL1));
          _counter_archived += 1;
          // Print URI lists you have sent the request to save. (on console, for debug)
        };
      }
    }, false);
  };
  setv("_counter_archived", _counter_archived);
  console.log(_counter_archived);
};
//archiving();
