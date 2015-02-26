var wit = require('node-wit');
var fs = require('fs');
var ACCESS_TOKEN = process.env.WITKEY;

var arguments = process.argv.slice(2);

var start = Date.now();
wit.captureTextIntent(ACCESS_TOKEN, arguments[0], function (err, res) {
    console.log("Response from Wit for text input: ");
    if (err) {
        console.log("Error: ", err);
    }
    console.log(JSON.stringify(res, null, " "));
    console.log("Time to response: ", Date.now() - start);
});