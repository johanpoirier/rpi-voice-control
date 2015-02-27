var EventEmitter = require('events').EventEmitter,

    util = require('util'),
    spawn = require('child_process').spawn,
    http = require('http'),
    fs = require('fs'),
    wit = require('node-wit'),
    streamBuffers = require("stream-buffers");

var Speakable = function Speakable(credentials, options) {
    EventEmitter.call(this);

    options = options || {}

    //this.recBuffer = [];
    this.recBuffer = [];
    this.recRunning = false;
    this.apiResult = {};
    this.apiLang = options.lang || "en-US";
    this.apiKey = credentials.key
    this.cmd = 'sox';
    this.cmdArgs = [
        '-q',
        '-b', '16',
        '-d', '-t', 'wav', '-',
        'rate', '16000', 'channels', '1',
        'silence', '1', '0.1', (options.threshold || '0.1'), '1', '1.0', (options.threshold || '0.1')
    ];

    console.log("[command] sox " + this.cmdArgs.join(" "));
};

util.inherits(Speakable, EventEmitter);
module.exports = Speakable;

Speakable.prototype.postVoiceData = function () {
    // write data to request body
    console.log('Posting voice data...');
    var streamBuffer = new streamBuffers.ReadableStreamBuffer();
    for (var i in this.recBuffer) {
        if (this.recBuffer.hasOwnProperty(i)) {
            streamBuffer.put(this.recBuffer[i], 'binary');
        }
    }

    wit.captureSpeechIntent(this.apiKey, streamBuffer, "audio/wav", function (err, res) {
        if (err) {
            this.emit('error', err);
        }
        this.apiResult = res;
        this.parseResult();
    }.bind(this));

    this.recBuffer = [];
};

Speakable.prototype.recordVoice = function () {
    var self = this;

    var rec = spawn(self.cmd, self.cmdArgs, 'pipe');

    // Process stdout

    rec.stdout.on('readable', function () {
        self.emit('speechReady');
    });

    rec.stdout.setEncoding('binary');
    rec.stdout.on('data', function (data) {
        if (!self.recRunning) {
            self.emit('speechStart');
            self.recRunning = true;
        }
        self.recBuffer.push(data);
    });

    // Process stdin

    rec.stderr.setEncoding('utf8');
    rec.stderr.on('data', function (data) {
        console.log(data)
    });

    rec.on('close', function (code) {
        self.recRunning = false;
        self.emit('speechStop');
        if (code) {
            self.emit('error', 'sox exited with code ' + code);
        } else {
            self.postVoiceData();
        }
    });
};

Speakable.prototype.resetVoice = function () {
    var self = this;
    self.recBuffer = [];
}

Speakable.prototype.parseResult = function () {
    console.log(this.apiResult);
    return;
    var recognizedWords = [], apiResult = this.apiResult.result;
    if (apiResult && apiResult.length > 0 && apiResult[0].alternative && apiResult[0].alternative[0]) {
        recognizedWords = apiResult[0].alternative[0].transcript.split(' ');
        this.emit('speechResult', recognizedWords);
    } else {
        this.emit('speechResult', []);
    }
}