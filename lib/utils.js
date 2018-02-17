var fs = require('fs');

var getBooleanFromString = function (val) {
    var res = false;

    if (typeof val === 'string' || val instanceof String) {
        res = (val == 'true');
    } else {
        res = val;
    }

    return res;
}

var trim = function(variable) {
    return String(variable).replace(/^\s+|\s+$/g, '');
}

var  isJson = function(item) {
    item = typeof item !== "string" ?
        JSON.stringify(item) :
        item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof item === "object" && item !== null) {
        return true;
    }

    return false;
}

var IsNullOrEmpty = function(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return true;
    } else {
        if (trim(variable).length == 0) {
            return true;
        }
        return false;
    }
}

var ipIsValid = function(ipaddr) {
    var ipformat =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipaddr.match(ipformat)

}

var writeStreamToFile = function(path, content) {
    var fileStream = fs.createWriteStream(path, { 'flags': 'w' });
    fileStream.end(content);
}

var copyFile = function(source, destination) {
    fs.createReadStream(source).pipe(fs.createWriteStream(destination));
}

var deleteFile = function(path, callback) {
    fs.stat(path, function(err, stats) {

        if (err) {
            return callback(err);
        }

        fs.unlink(path, function(err) {
            if (err) return callback(err);
            callback(null, "Done")
        });
    });
}
module.exports.getBooleanFromString = getBooleanFromString

module.exports.IsNullOrEmpty = IsNullOrEmpty
module.exports.writeStreamToFile = writeStreamToFile
module.exports.copyFile = copyFile
module.exports.isJson = isJson
module.exports.ipIsValid = ipIsValid
