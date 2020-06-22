
/**
 * Ensures acceptable URL of search for 
 * 'save search' functionality
 * */
chrome.tabs.query({
    active: true,
    currentWindow: true,
    url: notifier.url,
    status: "complete" 
}, function(tabs) {
    if (tabs[0]) {
        console.log(tabs[0].url);
        let url = tabs[0].url,
            xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "document";
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                console.log(xhr.response.getElementById("sortable-results").childNodes);
            }
        }
        xhr.send();
    }
});


