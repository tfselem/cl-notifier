/**
 * Default popup view displays saved searches
 * */
function PopupView() {
}

PopupView.updateView = function() {
    let savedSearchesContainer = document.querySelector("#saved-searches-container");
    savedSearchesContainer.innerHTML = "";
    chrome.storage.sync.get("savedSearches", function(res) {
        if (res.savedSearches.length === 0) {
            innerHTML = "BITCH";
            return;
        }

        for (let i = 0; i < res.savedSearches.length; i++) {
            let url = res.savedSearches[i];
            chrome.storage.sync.get(url, function(res1) {
                savedSearchesContainer.innerHTML += PopupView.createSavedSearchItem(res1[url].title, i, url, res1[url].newResults);
            });
        }
    });
}

PopupView.createSavedSearchItem = function(title, index, url, newResults) {
    title = title.slice(0, 30) + "...";
    let element = '<li class="list-group-item list-group-item-action">'
                + '<div>'
                    + '<a href="#index-' + index + '">' + title + '</a> <span class="badge badge-success">' + newResults.length + '</span>'
                    + '<button type="button" class="close" aria-label="Close">'
                        + '<span aria-hidden="true">&times;</span>'
                    + '</button>'
                + '</div>'
                + '<div>'
                    + '<span class="badge badge-pill badge-primary btn" data-href="'+url+'">Visit</span> '
                    + '<span class="badge badge-pill badge-secondary btn">Clear All</span>'
                + '</div>'
            + '</li>';
    return element;
}

PopupView.updateView();

