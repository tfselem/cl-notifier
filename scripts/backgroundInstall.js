
/* execute scripts/content/valid-dom.js on currently
 * open tabs during install */
chrome.runtime.onInstalled.addListener(function() {
    console.log("CL Installed");
    chrome.tabs.query({
        url: [
            "*://*.craigslist.org/*"
        ],
        status: "complete" 
    }, function(tabs) {
        for (let i = 0; i < tabs.length; i++) {
            console.log(tabs[i]);
            chrome.tabs.executeScript(tabs[i].id, {
                file: "scripts/content/valid-dom.js"
            });
        }
    });
});

