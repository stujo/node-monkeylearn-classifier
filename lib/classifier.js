var ClassifierResponse = require('./classifier_response');
var merge_options = require('./merge_options');
var https = require('https');
var pjson = require('../package.json');
var querystring = require('querystring');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function processResult(calculator, result, callback) {
    calculator.emit('result', result);
    if (typeof callback !== 'undefined') {
        setTimeout(function() {
            callback(result);
        }, 1000, this);
    } else {
        return result;
    }
};

function Classifier(auth_token, options, https_options) {
    this.auth_token = auth_token;
    this.options = merge_options(options, {
        version: 'v2',
        sandbox: false,
        debug: false,
        namespace: "classifiers",
        action: "classify"
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

    EventEmitter.call(this);

    // https://api.monkeylearn.com/v2/classifiers/[classifier_id]/classify/
    this.https_options.path = "/" + this.options.version + "/" + this.options.namespace + "/" + this.options.classifierId + "/" + this.options.action + "/"
}

util.inherits(Classifier, EventEmitter);

Classifier.prototype.classify = function(strings, callback) {

    var internal_callback = function(response) {
        var classifier_response = new ClassifierResponse(this);

        response.on('data', function(chunk) {
            classifier_response.data(chunk);
        });

        response.on('end', function() {
            classifier_response.complete();
            callback(null, classifier_response);
        });
    }

    var req = https.request(this.https_options, internal_callback);
 
    if(typeof strings == "string"){
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

    req.write(JSON.stringify(payload));
    req.end();
}


Classifier.prototype.targetUrl = function() {
    return "https://" + this.https_options.hostname + this.https_options.path;
}


module.exports = Classifier;
