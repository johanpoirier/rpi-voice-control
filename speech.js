var wit = require('node-wit');
var fs = require('fs');
var ACCESS_TOKEN = process.env.WITKEY;

var start = Date.now();
var stream = fs.createReadStream('test.wav');
wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
    console.log("Response from Wit for audio stream: ");
    if (err) {
        console.log("Error: ", err);
    }
    console.log(JSON.stringify(res, null, " "));
    console.log("Time to response: ", Date.now() - start);
});