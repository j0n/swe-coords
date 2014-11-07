module.exports = function(refTime) {
    if (isNaN(refTime)) {
        return 15.00
    }
    else {
        var hour = 1 * refTime.toString().substr(0, 2);
        var min = refTime.toString().slice(-2);
        return hour + min/60;
    }
}


