notifier.popup.saveSearchButton.addEventListener("click", function(e) {
    let newSearch = {
        url: notifier.popup.saveSearchButton.dataset.searchurl,
        title: notifier.popup.saveSearchButton.dataset.defaulttitle,
        posts: [],
        newestPostTime: (new Date()).getTime()
    };

    chrome.storage.sync.get(["savedSearches"], function(res) {
        res.savedSearches.push(newSearch);
        chrome.storage.sync.set({savedSearches: res.savedSearches});
        console.log(res.savedSearches);
    });
});

