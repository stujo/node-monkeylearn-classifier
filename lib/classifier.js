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
        classify_action: "classify",
        timeout: 5000
    });

    this.https_options = merge_options(https_options, {
        hostname: 'api.monkeylearn.com',
        port: 443,
        headers: {
            accept: '*/*'
        }
    });

    this.https_options.headers["MonkeyLearn-Client-Version"] = pjson.version;
    this.https_options.headers["Authorization"] = "Token " + this.auth_token;
    this.https_options.headers["Content-Type"] = "application/json";

    this.root_path = "/" +
        this.options.version + "/" +
        this.options.namespace + "/" +
        this.options.classifierId + "/";

    this.classify_path = this.root_path + this.options.classify_action + "/";
}

Classifier.prototype.queryLimitRemaning = function() {
    if (this.queryLimitInfo || (this.queryLimitInfo || this.queryLimitInfo['x-query-limit-remaining'])) {
        return parseInt(this.queryLimitInfo['x-query-limit-remaining'], 10);
    }
    return NaN;
};

Classifier.prototype.updateQueryLimitInfo = function(headers) {
    if (headers && headers['x-query-limit-limit']) {
        try {
            this.queryLimitInfo = {
                date: Date.parse(headers.date),
                'x-query-limit-limit': headers['x-query-limit-limit'],
                'x-query-limit-remaining': headers['x-query-limit-remaining'],
                'x-query-limit-request-queries': headers['x-query-limit-request-queries']
            }
        } catch (err) {
            this.queryLimitInfo = {
                error: err
            };
        }
    }
}

Classifier.prototype.internal_callback = function(callback, classifier_response, https_response) {

    var classifier = this;

    https_response.on('data', function(chunk) {
        classifier_response.data(chunk);
    });

    https_response.on('end', function() {
        var error = classifier_response.complete();

        if (https_response.headers) {
            classifier.updateQueryLimitInfo(https_response.headers);
        }
        callback(error, classifier_response);
    });
}

Classifier.prototype.buildClassifyPayload = function(strings) {

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

Classifier.prototype.startRequest = function(method, path, payload, callback) {
    var timeout = this.options.timeout;

    var classifier_response = new ClassifierResponse(this);

    var request_options = merge_options({
        method: method,
        path: path
    }, this.https_options);

    var req = https.request(
        request_options,
        this.internal_callback.bind(this, callback, classifier_response)
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

    if (payload) {
        req.write(payload);
    } else {
        req.write("");
    }

    req.end();
}


Classifier.prototype.detail = function(callback) {
    return this.startRequest("GET", this.root_path, null, callback);
}

Classifier.prototype.classify = function(strings, callback) {
    return this.startRequest("POST", this.classify_path, this.buildClassifyPayload(strings), callback);
}

module.exports = Classifier;
