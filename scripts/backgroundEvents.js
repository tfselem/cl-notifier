const interval = 1.0;
const updateAlarmName = "update-search-pages";

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
            chrome.alarms.clearAll(function() {
                chrome.alarms.create(updateAlarmName, {
                    periodInMinutes: interval
                });
            })
        });
    });
});

chrome.runtime.onStartup.addListener(function() {
    chrome.alarms.create(updateAlarmName, {
        periodInMinutes: interval
    });
});

// This one does the heavy lifting
chrome.alarms.onAlarm.addListener(ClPage.updateAllSearchPagesFromXHR);

