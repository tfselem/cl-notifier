function validCraigslistPage() {
}

chrome.runtime.onMessage.addListener(function(request, sender, respond) {
    console.log(sender);
    console.log(request);

    if (request.type != "validUrl") {
        return false;
    }

    switch(request.site) {
        case("cl"):
            console.log("message recieved");
            respond({valid: true, faggot: false});
            break;
    }
});
