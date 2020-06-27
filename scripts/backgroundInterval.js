/**
 * Parses a particular craigslist result HTMLString into
 * useful members: title, url, price, and date
 */
function ClResult(liResult) {
    try {
        let titleAnchor = liResult.getElementsByClassName("result-title")[0];
        this.id = parseInt(liResult.dataset.pid);
        this.title = titleAnchor.innerText;
        this.url = titleAnchor.getAttribute("href");
        this.price = liResult.getElementsByClassName("result-price")[0].innerText;
        this.date = Date.clParse(
            liResult.getElementsByTagName("time")[0].getAttribute("datetime")
        );
    } catch(e) {
        this.id = null;
        this.date = null;
        this.title = null;
        this.url = null;
        this.price = null;
    }

    this.toObject = function() {
        return {
            id: this.id,
            title: this.title,
            url: this.url,
            price: this.price,
            date: this.date
        };
    }
}

/**
 * A group of related and useful functions representing a craigslist search page.
 * Helps parse results.
 *
 * Constructor acceptes an HTMLString, could be a document from the current page 
 * or an XHR document type response
 * */
function ClPage(doc) {
    this.doc = doc;
    this.resultsRows = doc.querySelector("#sortable-results ul.rows");

    /**
     * Gets the newest post publish date on the provided
     * 'doc' craigslist page. Contingent on sort=date for 
     * the search page.
     */
    this.getNewestUnparsedResultDate = function() {
        let firstResult = this.resultsRows.firstElementChild,
            firstResultTime = firstResult ? firstResult.getElementsByTagName("time") : null;
        if (firstResult.tagName !== "LI" || !firstResultTime[0]) { /* No posts */
            return null;
        }
        return firstResultTime[0].getAttribute("datetime");
    }

    /**
     * Parses the newest post date in the craigslist page.
     */
    this.getNewestResultDate = function() {
        try {
            return Date.clParse(this.getNewestUnparsedResultDate());
        } catch(e) {
            return null;
        }
    }

    /**
     * Gets results prior to <h4>Few local results found...</h4>,
     * or if no local results are found, returns an empty array
     * 
     * Returns an array of HTMLString objects
     */
    this.getLocalResults = function() {
        let localResults = [];
        for (let i = 0; i < this.resultsRows.children.length; i++) {
            if (this.resultsRows.children[i].tagName === "H4") {
                break;
            }
            localResults.push((new ClResult(this.resultsRows.children[i])).toObject());
        }
        return localResults;
    }

    /**
     * Gets posts after specified date
     */
    this.getResultsAfterDate = function(currentDate) {
        let localResults = this.getLocalResults(),
            results = [];

        for (let i = 0; i < localResults.length; i++) {
            if (localResults[i].date > currentDate) {
                results.push(localResults[i]);
            }
        }

        return results;
    }
}

function updateClSearch() {
    const interval = 10000;
    chrome.storage.sync.get(null, function(res) {
        console.log(res);

        if (res.savedSearches.length === 0) {
            setTimeout(updateClSearch, interval);
        }

        for (let i = 0; i < res.savedSearches.length; i++) {
            let xhr = new XMLHttpRequest(),
                savedSearch = res.savedSearches[i];

            xhr.open("GET", savedSearch.url, true);
            xhr.responseType = "document";
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        let page = new ClPage(xhr.response),
                            results = {};
                        results[savedSearch.url] = page.getResultsAfterDate(
                            Date.clParse("2020-06-24 12:00")
                        );
                        chrome.storage.sync.set(results);
                    }

                    if (i === res.savedSearches.length-1) { 
                        setTimeout(updateClSearch, interval);
                    }
                }
            }

            xhr.send();
        }

    });
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.clear(function() {
        chrome.storage.sync.set({savedSearches: []}, updateClSearch);
    });
});

chrome.runtime.onStartup.addListener(updateClSearch);

