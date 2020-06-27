/**
 *  Returns Date object from craigslist format
 *  post date
 */
Date.clParse = function(str) {
    if (str === null || str === undefined) {
        throw "null parameter";
    }

    const dateRegexp = /^(\d{4})-(\d{2})-(\d{2})\ (\d{2}):(\d{2})/;
    let date = new Date(),
        match = str.match(dateRegexp);

    if (match.length === 6) {
        date.setYear(parseInt(match[1]));
        date.setMonth(parseInt(match[2]) - 1);
        date.setDate(parseInt(match[3]));
        date.setHours(parseInt(match[4]));
        date.setMinutes(parseInt(match[5]));
        date.setSeconds(0);
    } else {
        throw "invalid parameter";
    }
    return date;
}

