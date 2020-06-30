chrome.runtime.onInstalled.addListener(function() {
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

    chrome.storage.sync.clear(function() {
        chrome.storage.sync.set({savedSearches: []}, function() {
            const interval = 1.0;
            chrome.alarms.create({periodInMinutes: interval});
        });
    });
});

chrome.runtime.onStartup.addListener(function() {
    chrome.alarms.create({periodInMinutes: interval});
});

// This one does the heavy lifting
chrome.alarms.onAlarm.addListener(ClPage.updateAllSearchPages);

