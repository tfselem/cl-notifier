
/* Craigslist URL and DOM validation:
 * Disables/enables #save-search button based on 
 * url and DOM properties of active tab */
chrome.tabs.query({
    active: true,
    currentWindow: true,
    url: "*://*.craigslist.org/*",
    status: "complete" 
}, function(tabs) {
    if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: "validDom",
            site: "cl"
        }, function(res) {
            if (res && res.valid) {
                notifier.popup.invalidUrlWrapper.setAttribute("hidden", "");
                notifier.popup.saveSearchButton.removeAttribute("hidden");
                notifier.popup.saveSearchButton.setAttribute(
                    "data-searchUrl", 
                    res.href
                );
            }
        });
    } else {
        notifier.popup.invalidUrlWrapper.removeAttribute("hidden");
    }
});


