
function getClSearch() {
    const interval = 60000;
    chrome.storage.sync.get("savedSearches", function(res) {
        if (res && res.savedSearches) {
            console.log(res.savedSearches);
        }

        if (res.savedSearches.length === 0) {
            setTimeout(getClSearch, interval);
            console.log("No saved searches");
        }

        for (var i = 0; i < res.savedSearches.length; ++i) {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", res.savedSearches[i].url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    /* DO STUFF */
                    console.log(xhr);
                    if (i === res.savedSearches.length) {
                        setTimeout(getClSearch, interval);
                    }
                }
            }
            xhr.send();
        }
    });
}

chrome.runtime.onInstalled.addListener(getClSearch);
chrome.runtime.onStartup.addListener(getClSearch);

