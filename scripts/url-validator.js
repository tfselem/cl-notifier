
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
    let tabID = tabs[0] ? tabs[0].id : null;
    console.log(tabID);
    return false;
});

