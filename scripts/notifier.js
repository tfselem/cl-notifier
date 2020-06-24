var notifier = {
    popup: {
        saveSearchButton: document.querySelector("#save-search"),
        invalidUrlWrapper: document.querySelector("#invalid-url-wrapper")
    },
    validUrl: { /* URL matches that notifier works on */
        craigslist: "*://*.craigslist.org/*",
        facebook: "",
        ebay: ""
    }
};

