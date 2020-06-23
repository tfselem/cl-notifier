
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
        chrome.tabs.sendMessage(tabs[0].id, {
            type: "validDom",
            site: "cl"
        }, function(res) {
            if (res && res.valid === true) {
                console.log("valid url");
            } else {
                console.log("invalid url");
            }
        });
    }
});


