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
    const interval = 5000;
    chrome.storage.sync.get(null, function(res) {
        let resLength = Object.keys(res).length,
            i = 1;

        if (resLength === 0) {
            setTimeout(updateClSearch, interval);
        }
        console.log(res);
        for (const url in res) {
            let xhr = new XMLHttpRequest(),
                savedSearch = res[url];

            xhr.open("GET", url, true);
            xhr.responseType = "document";
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        let page = new ClPage(xhr.response),
                            //currentResultTime = (new Date()).setTime(savedSearch.newestResultTime),
                            currentResultTime = (Date.clParse("2020-06-26 12:00")),
                            newestResultTime = page.getNewestResultDate(),
                            results = {};

                        if (currentResultTime < newestResultTime) {
                            savedSearch.newResults = savedSearch.newResults.concat(page.getResultsAfterDate(currentResultTime));
                            savedSearch.newestResultTime = newestResultTime;
                        }

                        results[url] = savedSearch;
                        chrome.storage.sync.set(results);
                    }

                    if (i === resLength) { 
                        setTimeout(updateClSearch, interval);
                    } else {
                        i++;
                    }
                }
            }

            xhr.send();
        }

    });
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.clear(function() {
        updateClSearch();
        //chrome.storage.sync.set({savedSearches: []}, updateClSearch);
    });
});

chrome.runtime.onStartup.addListener(updateClSearch);

