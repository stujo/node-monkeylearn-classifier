var ClassifierResponse = require('./classifier_response');
var merge_options = require('./merge_options');

// var https = require('http-debug').https; //require('https');
// https.debug = 2;

var https = require('https');
var pjson = require('../package.json');

function Classifier(auth_token, options, https_options) {
    this.auth_token = auth_token;

    this.options = merge_options(options, {
        version: 'v2',
        sandbox: false,
        debug: false,
        namespace: "classifiers",
        action: "classify",
        timeout: 5000
    });

    this.https_options = merge_options(https_options, {
        hostname: 'api.monkeylearn.com',
        port: 443,
        headers: {
            accept: '*/*'
        },
        method: 'POST'
    });

    this.https_options.headers["MonkeyLearn-Client-Version"] = pjson.version;
    this.https_options.headers["Authorization"] = "Token " + this.auth_token;
    this.https_options.headers["Content-Type"] = "application/json";

    // https://api.monkeylearn.com/v2/classifiers/[classifier_id]/classify/
    this.https_options.path = "/" + this.options.version + "/" + this.options.namespace + "/" + this.options.classifierId + "/" + this.options.action + "/"
}

Classifier.prototype.internal_classify_callback = function(callback, classifier_response, https_response) {

    https_response.on('data', function(chunk) {
        classifier_response.data(chunk);
    });

    https_response.on('end', function() {
        var error = classifier_response.complete();
        callback(error, classifier_response);
    });
}

Classifier.prototype.buildPayload = function(strings) {

    if (typeof strings == "string") {
        strings = [strings];
    }

    var payload = {
        text_list: strings
    };

    if (this.options.sandbox) {
        payload.sandbox = 1;
    }

    if (this.options.debug) {
        payload.debug = 1;
    }

    return JSON.stringify(payload);
}


Classifier.prototype.classify = function(strings, callback) {

    var timeout = this.options.timeout;

    var classifier_response = new ClassifierResponse(this);

    var req = https.request(
        this.https_options,
        this.internal_classify_callback.bind(this, callback, classifier_response)
    );

    req.on('error', function(err) {
        callback({
                message: "Exception in HTTP request",
                error: err
            },
            null
        );
    });

    req.on('timeout', function() {
        callback({
                message: "Request Timeout",
                error: "Timeout > " + timeout + "ms"
            },
            null
        );
    });

    req.setTimeout(timeout);

    req.write(this.buildPayload(strings));

    req.end();
}


module.exports = Classifier;
