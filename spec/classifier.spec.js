var sinon = require('sinon');

var Classifier = require('../lib/classifier');

describe('Takes options including ', function() {
 
     it('classifierId', function() {
        var classifier = new Classifier({
          classifierId: 'xyz'
        });

        expect(classifier.targetUrl()).equal("https://api.monkeylearn.com/v2/classifiers/xyz/classify/");
    });

});

describe('#classify Calls the API', function() {
    var classifier;

    before(function() {
        classifier = new Classifier();
    });

    it('should result in minus two the callback approach', function(done) {
        classifier.makeAPICall(function(result) {
            assert.equal(result, -2);
            done();
        });
    });


});


