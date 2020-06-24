notifier.popup.saveSearchButton.addEventListener("click", function(e) {
    let newSearch = {
        url: notifier.popup.saveSearchButton.dataset.searchurl,
        title: notifier.popup.saveSearchButton.dataset.defaulttitle,
        posts: []
    };

    if (!newSearch.url) {
        return;
    }

    chrome.storage.sync.get(["savedSearches"], function(res) {
        res.savedSearches.push(newSearch);
        chrome.storage.sync.set({savedSearches: res.savedSearches});
        console.log(res.savedSearches);
    });
});

