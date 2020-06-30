
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
                /* Hide invalid url notification */
                notifier.popup.invalidUrlWrapper.setAttribute("hidden", "");
                /* Allow user to click save search button */
                notifier.popup.saveSearchButton.removeAttribute("disabled");

                /* Store url, and title data in button dataset attributes */
                notifier.popup.saveSearchButton.setAttribute(
                    "data-searchurl", 
                    res.href
                );
                notifier.popup.saveSearchButton.setAttribute(
                    "data-defaulttitle", 
                    res.defaultTitle
                );
            }
        });
    } else {
        notifier.popup.invalidUrlWrapper.removeAttribute("hidden");
    }
});


