/**
 * Parses a particular craigslist 'li.result-row' HTMLString into
 * useful members: title, url, price, and date
 */
class ClResult {
    constructor(liResult) {
        let titleAnchor = liResult.getElementsByClassName("result-title")[0];

        this.id = parseInt(liResult.dataset.pid);
        this.title = titleAnchor.innerText;
        this.url = titleAnchor.getAttribute("href");
        this.price = liResult.getElementsByClassName("result-price")[0]
            ? liResult.getElementsByClassName("result-price")[0].innerText
            : null;
        this.date = Date.clParse(
            liResult.getElementsByTagName("time")[0].getAttribute("datetime")
        ).getTime();
    }

    toObject() {
        return {
            id: this.id,
            title: this.title,
            url: this.url,
            price: this.price,
            date: this.date
        };
    };
}

/**
 * Helps parse a craigslist search page.
 * 
 * Constructor acceptes an HTMLString, could be a document from the current page
 * or an XHR document type response
 * */
class ClPage {
    constructor(doc) {
        this.doc = doc;
        this.resultsRows = doc.querySelector("#sortable-results ul.rows");
    }

    /**
     * Gets the newest post publish date on the provided
     * 'doc' craigslist page. Contingent on sort=date for
     * the search page.
     */
    getNewestUnparsedResultDate() {
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
    getNewestResultTime() {
        try {
            return Date.clParse(this.getNewestUnparsedResultDate());
        }
        catch (e) {
            return null;
        }
    }

    /**
     * Gets results prior to <h4>Few local results found...</h4>,
     * or if no local results are found, returns an empty array
     *
     * Returns an array of HTMLString objects
     */
    getLocalResults() {
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
    getResultsAfterTime(currentDate) {
        let localResults = this.getLocalResults(),
            results = [];

        for (let i = 0; i < localResults.length; i++) {
            if (localResults[i].date > currentDate) {
                results.push(localResults[i]);
            }
        }

        return results;
    }

    /**
     * Updates a single saved search page given its key (url)
     * */
    static updateSearchPage(url, onUpdate = function () { }) {
        const maxNumResults = 30;
        let xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    chrome.storage.sync.get(url, function (res) {
                        let page = new ClPage(xhr.response),
                            newestResultTime = page.getNewestResultTime() ? page.getNewestResultTime().getTime() : 0,
                            currentResultTime = new Date();
                        currentResultTime.setTime(res[url].newestResultTime);

                        if (currentResultTime < newestResultTime) {
                            res[url].newestResultTime = newestResultTime;
                            res[url].newResults = page.getResultsAfterTime(currentResultTime)
                                .concat(res[url].newResults);
                            res[url].newResults.splice(
                                maxNumResults,
                                res[url].newResults.length - maxNumResults
                            );
                        }

                        chrome.storage.sync.set(res, function () {
                            onUpdate();
                            console.log(res);
                        });

                    });
                }
                else {
                    console.log("Status: " + xhr.status);
                }
            }
        };
        xhr.send();
    }
    /**
     * Loops through savedSearches array in chrome.storage
     * and checks for updates on all search pages
     * */
    static updateAllSearchPages(alarm) {
        console.log(alarm);
        chrome.storage.sync.get("savedSearches", function (res) {
            if (res.savedSearches.length === 0) {
                console.log("No saved searches");
                return;
            }
            for (let i = 0; i < res.savedSearches.length; i++) {
                let url = res.savedSearches[i];
                ClPage.updateSearchPage(url);
            }
        });
    }
}



