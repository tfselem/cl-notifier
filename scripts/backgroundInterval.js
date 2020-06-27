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
            localResults.push(new ClResult(this.resultsRows.children[i]));
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

ClPage.setXhrListener = function(xhr, interval, isLastIndex) {
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                /* DO STUFF */
                let page = new ClPage(xhr.response);
                console.log(page.getResultsAfterDate(Date.clParse("2020-06-03 12:00")));
                /* /DO STUFF */
            } else {
                console.log(xhr);
            }

            if (isLastIndex) { 
                setTimeout(updateClSearch, interval);
            }
        }
    }
}

function getClXHR(xhr, interval, isLastIndex) {
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            /* DO STUFF */
            let page = new ClPage(xhr.response);
            console.log(page.getResultsAfterDate(Date.clParse("2020-06-03 12:00")));
            /* /DO STUFF */
        }
    }
}

function updateClSearch() {
    const interval = 10000;
    chrome.storage.sync.get("savedSearches", function(res) {
        if (res.savedSearches.length === 0) {
            setTimeout(updateClSearch, interval);
            console.log("No saved searches");
        }

        for (var i = 0; i < res.savedSearches.length; i++) {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", res.savedSearches[i].url, true);
            xhr.responseType = "document";
            ClPage.setXhrListener(xhr, interval, i === res.savedSearches.length-1);
            xhr.send();
        }

    });
}

chrome.runtime.onInstalled.addListener(updateClSearch);
chrome.runtime.onStartup.addListener(updateClSearch);

