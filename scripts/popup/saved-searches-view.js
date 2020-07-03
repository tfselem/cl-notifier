/**
 * Default popup view displays saved searches
 * */
class PopupView {

    static updateView() {
        let savedSearchesContainer = document.querySelector("#saved-searches-container");
        savedSearchesContainer.innerHTML = "";
        chrome.storage.sync.get("savedSearches", function (res) {
            if (res.savedSearches.length === 0) {
                return;
            }

            for (let i = 0; i < res.savedSearches.length; i++) {
                let url = res.savedSearches[i];
                chrome.storage.sync.get(url, function (res1) {
                    savedSearchesContainer.innerHTML += PopupView.createSavedSearchItem(res1[url].title, i, url, res1[url].newResults);
                });
            }
        });
    }

    static createSavedSearchItem(title, index, url, newResults) {
        title = title.slice(0, 40) + "...";
        let element = '<a href="#search-id-' + index + '" class="list-group-item list-group-item-action show-results">'
            + title + ' <span class="float-right badge badge-primary num-results">' + newResults.length + '</span>'
            + '</a>'
            + '<div hidden class="list-group-item results-container" id="search-id-' + index + '">';
        if (newResults.length === 0) {
            element += '<div class="card-body">No posts</div>'
        }

        for (let i = 0; i < newResults.length; i++) {
            element += PopupView.createResultItem(newResults[i].url, newResults[i].date, newResults[i].price, newResults[i].title);
        }
        element += '</div>';
        return element;
    }

    static createResultItem(url, date, price, title) {
        title = title.slice(0, 25) + "...";
        let element = '<div>'
            + '<img src="#" class="img-thumbnail result-img" alt="title">'
            + '<h6 class="result-title"><a href="' + url + '">' + title + '</a></h6>'
            + '<a href="' + url + '" class="float-right result-remove">Clear</a>'
            + '</div>';
        return element;
    }

    static hideAllResults() {
        let results = document.querySelectorAll(".results-container"),
            showResultsButtons = document.querySelectorAll(".show-results");
        for (let i = 0; i < results.length; i++) {
            results[i].setAttribute("hidden", "");
            showResultsButtons[i].classList.remove("active");
        }
    }

    static showResults(selector) {
        PopupView.hideAllResults();
        let results = document.querySelector(selector);
        results.removeAttribute("hidden");
    }
}

PopupView.updateView();

window.addEventListener("click", function (e) {
    let activeClass = "active";
    e.preventDefault();
    if (e.target.nodeName === "A" && e.target.classList.contains("show-results")) {
        if (e.target.classList.contains(activeClass)) {
            PopupView.hideAllResults();
            e.target.classList.remove(activeClass);
        } else {
            PopupView.showResults(e.target.getAttribute("href"));
            e.target.classList.add(activeClass);
        }
    }
});

