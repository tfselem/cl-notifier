notifier.popup.saveSearchButton.addEventListener("click", function(e) {
    let url = notifier.popup.saveSearchButton.dataset.searchurl;
    let newSearch = {};

    newSearch[url] = {
        title: notifier.popup.saveSearchButton.dataset.defaulttitle,
        //newestResultTime: (new Date()).getTime(),
        newestResultTime: Date.clParse("2020-06-26 12:00").getTime(),
        newResults: [],
        type: "cl"
    };


    chrome.storage.sync.get("savedSearches", function(res) {
        if (res.savedSearches.indexOf(url) === -1) {
            res.savedSearches.push(url);
            newSearch.savedSearches = res.savedSearches;
            chrome.storage.sync.set(newSearch, function() {
                console.log("SAVED");
            });
        }
    })
});

