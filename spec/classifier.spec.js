//var Classifier = require('../lib/classifier');

var Classifier = require('../index').Classifier;

// To Stub the API requests
//
var sinon = require('sinon');
var https = require('https');
var PassThrough = require('stream').PassThrough;

describe("Classifier", function() {
    "use strict";

    var PRETEND_AUTH_TOKEN = "XXXPRETEND_AUTH_TOKENXXX";
    var TEST_CLASSIFIER_ID = 'xyz';
    var TEST_TIMEOUT = 3999;

    describe('#classify', function() {

        "use strict";

        var classifier, https_request_stub, fake_response, request_mock,
            request_setTimeout_spy, request_write_spy, request_on_spy;

        function stubHttpsRequest(classifierId) {
            classifier = new Classifier(PRETEND_AUTH_TOKEN, {
                classifierId: classifierId,
                timeout: TEST_TIMEOUT
            });

            https_request_stub = sinon.stub(https, 'request');

            request_mock = new PassThrough();
            request_mock.setTimeout = function() {}

            request_setTimeout_spy = sinon.spy(request_mock, 'setTimeout');
            request_write_spy = sinon.spy(request_mock, 'write');
            request_on_spy = sinon.spy(request_mock, 'on');
        }


        afterEach(function() {
            if (https.request.restore) {
                https.request.restore();
            }
        });

        var TEST_RESPONSE_ERROR_1 = {status_code: 409, detail: "SOME ERROR"};

        // Note there is no need to run these test in async mode
        // I'm leaving them as is for now because it's easier 
        // to find and fix bugs when then tests can be unstubbed
        // and it illustrates how to do async testing 
        //
        it('returns server error messages', function(done) {
            stubHttpsRequest(TEST_CLASSIFIER_ID);
            fake_response = new PassThrough();
            fake_response.write(JSON.stringify(TEST_RESPONSE_ERROR_1));
            fake_response.end();

            https_request_stub.callsArgWith(1, fake_response)
                .returns(request_mock);

            classifier.classify("", function(error, result) {
                expect(error.error).equal(TEST_RESPONSE_ERROR_1.status_code);
                done();
            });
        });

        describe("with valid data", function() {
            "use strict";

            beforeEach(function() {
                stubHttpsRequest(TEST_CLASSIFIER_ID);

                fake_response = new PassThrough();
                fake_response.write(JSON.stringify(TEST_RESPONSE_DATA_1));
                fake_response.end();

                https_request_stub.callsArgWith(1, fake_response)
                    .returns(request_mock);
            });

            var TEST_CLASSIFIER_ID = "cl_5icAVzKR";

            var TEST_DATA_1 = [
                "Reading newspapers and magazines for articles",
                "Sailing around in boats on the ocean"
            ];

            var EXPECTED_PAYLOAD_1 = JSON.stringify({
                text_list: TEST_DATA_1
            });

            var TEST_RESPONSE_DATA_1 = {
                "result": [
                    [{
                        "probability": 0.139,
                        "label": "Entertainment & Recreation"
                    }, {
                        "probability": 0.651,
                        "label": "Magazines"
                    }],
                    [{
                        "probability": 0.894,
                        "label": "Travel"
                    }, {
                        "probability": 0.961,
                        "label": "Transportation"
                    }, {
                        "probability": 0.995,
                        "label": "Watercraft"
                    }]
                ]
            };

            it('classifies the data via the API', function(done) {
                classifier.classify(TEST_DATA_1, function(error, result) {
                    assert.deepEqual(result.results(), TEST_RESPONSE_DATA_1.result);
                    done();
                });
            });

            it('sends the data in the payload to the API', function(done) {
                classifier.classify(TEST_DATA_1, function(error, result) {
                    assert(request_write_spy.withArgs(EXPECTED_PAYLOAD_1).calledOnce);
                    done();
                });
            });

            it('sets the https timeout', function(done) {
                classifier.classify(TEST_DATA_1, function(error, result) {
                    assert(request_setTimeout_spy.withArgs(TEST_TIMEOUT).calledOnce);
                    done();
                });
            });

            it('sends the auth token in the headers to the API', function(done) {
                classifier.classify(TEST_DATA_1, function(error, result) {
                    var request_call_args = https_request_stub.getCall(0).args;
                    expect(request_call_args[0].headers.Authorization).equal("Token " + PRETEND_AUTH_TOKEN);
                    done();
                });
            });

            it('uses the specified classifierId with the API', function(done) {
                classifier.classify(TEST_DATA_1, function(error, result) {
                    var request_call_args = https_request_stub.getCall(0).args;
                    expect(request_call_args[0].path).equal('/v2/classifiers/' + TEST_CLASSIFIER_ID + '/classify/');
                    done();
                });
            });
        });
    });
});
