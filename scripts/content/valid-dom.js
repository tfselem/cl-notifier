
/**
 * onMessage response for valid-url.js
 *
 * Checks the DOM for key elements in a valid CL search page
 */
function clResponse() {
    let response = {
            valid: false,
            href: null
        },
        searchSortAnchors = document.querySelectorAll(
            "div.search-sort ul.dropdown-list li a"
        );
    if (searchSortAnchors) {
        for (var i = 0; i < searchSortAnchors.length; i++) {
            if (searchSortAnchors[i].dataset.selection === "date") {
                response.valid = true;
                response.href = window.origin + 
                                searchSortAnchors[i].getAttribute("href");
            }
        }
    }
    return response;
}

chrome.runtime.onMessage.addListener(function(request, sender, respond) {
    if (request.type !== "validDom") {
        return;
    }
    switch(request.site) {
        case("cl"):
            respond(clResponse());
            break;
    }
});

