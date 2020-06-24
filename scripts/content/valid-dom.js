
/**
 * onMessage response for valid-url.js
 *
 * Checks the DOM for key elements in a valid CL search page
 */
function clResponse() {
    let response = {
        valid: false,
        href: null,
        defaultTitle: document.querySelector("title").innerText
    },
    searchSortAnchor = document.querySelector(
        "div.search-sort ul.dropdown-list li a[data-selection='date']"
    );

    if (!searchSortAnchor) { return response; }
    response.valid = true;
    response.href = window.origin + 
                    searchSortAnchor.getAttribute("href");
    if (searchSortAnchor.parentNode.classList.contains("sel")) {
        // get newest post's date and save it in response
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

