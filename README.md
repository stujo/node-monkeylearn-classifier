# MonkeyLearn Client for Classifiers

## Usage

This package requires an auth token from MonkeyLearn, available [here](https://app.monkeylearn.com/accounts/user/settings/tab/api-tab)

### NPM Package

Install the package into your project
```
$ npm install monkeylearn-classifier --save
```

```
var Classifier = require('monkeylearn-classifier').Classifier;

var classifier = new Classifier(process.env['MONKEYLEARN_AUTH_TOKEN'], 
                                {
                                  classifierId: 'cl_5icAVzKR' // Generic Topic Classifier
                                });

classifier.classify([
    "Hello World",
    "Foxes, Horses, Bunnies and Ducklings"
  ], 
  function(error, response) {
    if(error){
      console.error("HTTPS ERROR", error);
    } else {
      if(response.resolved()){
        console.log(JSON.stringify(response.results()));
      } else {
        // API Error Message
        console.log("API ERROR", response.error());
      }
    }
  });                                
```

### Command Line Demo Example
```
$ export MONKEYLEARN_AUTH_TOKEN=YOUR_AUTH_TOKEN
$ ./bin/classify "Hello World"
```

## Development

* Run tests with ``$ gulp mocha``
* Run tests on change with ``$ gulp watch-mocha``
* Debug tests with ``$ node-debug _mocha spec --require spec/helpers/chai.js``