function ClPage(doc) {
    this.doc = doc;
    this.resultsRows = doc.querySelector("#sortable-results ul.rows");

    /**
     * Gets the newest post publish date on the provided
     * 'doc' craigslist page.
     */
    this.getNewestUnparsedPostDate = function() {
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
    this.getNewestPostDate = function() {
        try {
            return Date.ClParse(this.getNewestUnparsedPostDate());
        } catch(e) {
            return null;
        }
    }

    /**
     * Gets results prior to <h4>Few local results found...</h4>,
     * or if no local results are found, returns an empty array
     */
    this.getLocalResults = function() {
        let localResults = [];
        for (let i = 0; i < this.resultsRows.children.length; i++) {
            if (this.resultsRows.children[i].tagName === "H4") {
                break;
            }
            localResults.push(this.resultsRows.children[i]);
        }
        return localResults;
    }

    /**
     * Gets posts after specified date
     */
    this.getPostsAfter = function() {
    }
}

function getClXHR(xhr, interval, isLastIndex) {
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            /* DO STUFF */
            let page = new ClPage(xhr.response);
            console.log(page.getNewestPostDate());
            console.log(page.getLocalResults());
            /* /DO STUFF */
            if (isLastIndex) { 
                setTimeout(updateClSearch, interval);
            }
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
            getClXHR(xhr, interval, i === res.savedSearches.length-1);
            xhr.send();
        }

    });
}

chrome.runtime.onInstalled.addListener(updateClSearch);
chrome.runtime.onStartup.addListener(updateClSearch);

