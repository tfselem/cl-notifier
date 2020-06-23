/**
 * Ensures acceptable URL of search for 
 * 'save search' functionality
 * */
chrome.tabs.query({
    active: true,
    currentWindow: true,
    url: notifier.validUrl.craigslist,
    status: "complete" 
}, function(tabs) {
    if (tabs[0]) {
        chrome.tabs.executeScript({
            file: "scripts/content/valid-dom.js"
        }, function() {
            console.log();
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "validUrl",
                site: "cl"
            }, function(res) {
                if (res && res.valid === true) {
                    // enable save search button
                    console.log("valid url");
                }
            });
        });
    }
});


