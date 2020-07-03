/**
 * Parses a particular craigslist 'li.result-row' HTMLString into
 * useful members: title, url, price, and date
 */
class ClResult {
    constructor(liResult) {
        let titleAnchor = liResult.getElementsByClassName("result-title")[0];

        this.title = titleAnchor.innerText;
        this.url = titleAnchor.getAttribute("href");

        /* some posts don't have price tags */
        if (priceElement = liResult.getElementsByClassName("result-price")) {
            this.price = priceElement[0].innerText;
        }

        this.date = Date.clParse(
            liResult.getElementsByTagName("time")[0].getAttribute("datetime")
        ).getTime();
    }

    toObject() {
        return {
            title: this.title,
            url: this.url,
            price: this.price || null,
            date: this.date
        };
    };
}

/**
 * Helps parse a craigslist search page.
 * Constructor expects an HTMLString from an XHR request response.
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
    getNewestResultTime() {
        let firstResult = this.resultsRows.firstElementChild,
            firstResultTime = firstResult ? firstResult.getElementsByTagName("time") : null;
        if (firstResult === null || firstResult.tagName !== "LI" || firstResultTime[0] === undefined) {
            return null;
        }
        return Date.clParse(firstResultTime[0].getAttribute("datetime"));
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



