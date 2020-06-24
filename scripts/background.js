chrome.runtime.onInstalled.addListener(function() {
    /* execute scripts/content/valid-dom.js on currently
     * open tabs on install */
    chrome.tabs.query({
        url: [
            "*://*.craigslist.org/*"
        ],
        status: "complete" 
    }, function(tabs) {
        for (let i = 0; i < tabs.length; i++) {
            chrome.tabs.executeScript(tabs[i].id, {
                file: "scripts/content/valid-dom.js"
            });
        }
    });

    chrome.storage.sync.set({savedSearches: []}, function() {
        console.log("savedSearches");
    });
});

