
/**
 * Rule for triggering the page action when the user in on
 * a craigslist search
 *
var onSearchPageRule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {urlContains: "craigslist.org"},
            css: ["ul.rows"]
        })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
};

chrome.runtime.onInstalled.addListener(function() {
    console.log("Mothefucka!");
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([onSearchPageRule]);
    });
});*/

/*chrome.browserAction.onClicked.addListener(function() {

    console.log("Test");

    chrome.browserAction.setPopup({
        popup: "../layout/popup.html"
    }, function(tab) {
        console.log(tab);
    });

    chrome.browserAction.enable();
});*/
