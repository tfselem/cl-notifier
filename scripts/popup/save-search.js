notifier.popup.saveSearchButton.addEventListener("click", function(e) {
    let url = notifier.popup.saveSearchButton.dataset.searchurl;
    let newSearch = {};

    newSearch[url] = {
        title: notifier.popup.saveSearchButton.dataset.defaulttitle,
        newestResultTime: (new Date()).getTime(),
        newResults: [],
        type: "cl"
    };

    chrome.storage.sync.set(newSearch, function() {
        console.log("SAVED");
    });
});

