let saveSearchButton = document.getElementById("save-search");
console.log(saveSearchButton);

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
        // inject code 
        chrome.tabs.sendMessage(tabs[0].id, {
            type: "validUrl",
            site: "craigslist"
        }, function(res) {
            if (res.isValidUrl === true) {
                // enable save search button
                console.log("valid url");
            }
        });
    }
});


