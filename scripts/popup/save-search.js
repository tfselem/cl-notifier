
notifier.popup.saveSearchButton.addEventListener("click", function(e) {
    let searchUrl = notifier.popup.saveSearchButton.dataset.searchurl,
        newSearch = {};
    if (!searchUrl) {
        return;
    }
    newSearch.url = searchUrl;
    newSearch.title = "Foo";
    newSearch.unreadPosts = [];
    newSearch.latestPostTime = new Date();

    chrome.storage.sync.get(["savedSearches"], function(res) {
        console.log(res.savedSearches);
        res.savedSearches.push(newSearch);
        chrome.storage.sync.set({savedSearches: res.savedSearches});
    });
});

