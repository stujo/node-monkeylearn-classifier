function merge_options(obj1, defaults) {
    if (!obj1) {
        return defaults ? defaults : {};
    }
    if (!defaults) {
        return obj1;
    }
    var obj3 = {};
    for (var attrname in obj1) {
        if (obj1.hasOwnProperty(attrname)) {
            obj3[attrname] = obj1[attrname];
        }
    }
    for (var attrname in defaults) {
        if (defaults.hasOwnProperty(attrname)) {
          if (!obj3.hasOwnProperty(attrname)) {
              obj3[attrname] = defaults[attrname];
            }
        }
    }
    return obj3;
}

module.exports = merge_options;
