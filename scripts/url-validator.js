var saveSearch = document.querySelector("#save-search"),
    saveSearchWrapper = document.querySelector("#save-search-wrapper"),
    invalidUrlWrapper = document.querySelector("#invalid-url-wrapper");

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
            if (res && res.valid) {
                invalidUrlWrapper.setAttribute("hidden", "");
                saveSearch.removeAttribute("hidden");
                saveSearch.setAttribute("data-searchUrl", res.href);
            }
        });
    } else {
        saveSearch.setAttribute("hidden", "");
        invalidUrlWrapper.removeAttribute("hidden");
    }
});


