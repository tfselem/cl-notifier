
/**
 * onMessage response for valid-url.js
 *
 * Checks the DOM for key elements in a valid CL search page
 */
function clResponse() {
    let sortByDate = document.querySelector(
        "div.search-sort ul.dropdown-list a"
    );
    return {
        valid: sortByDate && 
               sortByDate.dataset.selection === "date"
    };
}

chrome.runtime.onMessage.addListener(function(request, sender, respond) {
    console.log('tes;;');
    if (request.type !== "validDom") {
        return;
    }
    switch(request.site) {
        case("cl"):
            respond(clResponse());
            break;
    }
});

