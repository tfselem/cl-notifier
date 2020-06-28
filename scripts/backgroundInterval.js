/**
 * Parses a particular craigslist 'li.result-row' HTMLString into
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
        ).getTime();
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
    this.getNewestResultTime = function() {
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
    this.getResultsAfterTime = function(currentDate) {
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

/**
 * Recursive algorithm for updating search results
 * */
ClPage.updateResults = function() {
    const interval = 10000;
    const maxNumResults = 30;
    chrome.storage.sync.get("savedSearches", function(res) {
        let updatedSearches = [],
            index = 0,
            indexMax = res.savedSearches.length;
        /* Loop through function until there are saved searches */
        if (indexMax === 0) {
            setTimeout(ClPage.updateResults, interval);
            return;
        }

        /* Beginning of 'recursiveFunc', this will fetch individual
         * urls from savedSearches array and perform an XHR on the 
         * search page. The next value in savedSearches will be reached
         * if and only if the request for the current XHR is complete and 
         * all values have been updated in chrome.storage */
        (function() {
            if (index === indexMax) {
                setTimeout(ClPage.updateResults, interval);
                return;
            }
            let recursiveFunc = arguments.callee,
                url = res.savedSearches[index];
            chrome.storage.sync.get(url, function(res1) {
                let xhr = new XMLHttpRequest();
                xhr.responseType = "document";
                xhr.open("GET", url, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            let page = new ClPage(xhr.response),
                                newestResultTime = page.getNewestResultTime().getTime(),
                                currentResultTime = new Date();
                                currentResultTime.setTime(res1[url].newestResultTime);
                            if (currentResultTime < newestResultTime) {
                                res1[url].newestResultTime = newestResultTime;
                                res1[url].newResults = page.getResultsAfterTime(currentResultTime)
                                                           .concat(res1[url].newResults);
                                res1[url].newResults.splice(
                                    maxNumResults, 
                                    res1[url].newResults.length - maxNumResults
                                );
                            }
                        }
                        chrome.storage.sync.set(res1, function() {
                            console.log(res1);
                            index++;
                            recursiveFunc();
                        });
                    }
                }
                xhr.send();
            });
        })(); /* End of 'recursiveFunc' */
    });
}

/* Event listeners */
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.clear(function() {
        chrome.storage.sync.set({savedSearches: []}, function() {
            ClPage.updateResults();
        });
    });
});
chrome.runtime.onStartup.addListener(ClPage.updateResults);

