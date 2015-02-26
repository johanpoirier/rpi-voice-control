var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    spawn = require('child_process').spawn,
    http = require('http'),
    fs = require('fs'),
    wit = require('node-wit');

var Speakable = function Speakable(credentials, options) {
    EventEmitter.call(this);

    options = options || {}

    //this.recBuffer = [];
    this.recBuffer = fs.createWriteStream('temp.wav');
    this.recRunning = false;
    this.apiResult = {};
    this.apiLang = options.lang || "en-US";
    this.apiKey = credentials.key
    this.cmd = 'sox';
    this.cmdArgs = [
        '-q',
        '-b', '16',
        '-d', '-t', 'flac', '-',
        'rate', '16000', 'channels', '1',
        'silence', '1', '0.1', (options.threshold || '0.1'), '1', '1.0', (options.threshold || '0.1')
    ];
};

util.inherits(Speakable, EventEmitter);
module.exports = Speakable;

Speakable.prototype.postVoiceData = function () {
    // write data to request body
    wit.captureSpeechIntent(this.apiKey, this.recBuffer, "audio/wav", function (err, res) {
        if (err) {
            this.emit('error', e);
        }
        this.apiResult = res;
        this.parseResult();
    }.bind(this));

    this.recBuffer = fs.createWriteStream('temp.wav');
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
        self.recBuffer.write(data);
    });

    // Process stdin

    rec.stderr.setEncoding('utf8');
    rec.stderr.on('data', function (data) {
        console.log(data)
        self.recBuffer.end();
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
    var recognizedWords = [], apiResult = this.apiResult.result;
    if (apiResult && apiResult.length > 0 && apiResult[0].alternative && apiResult[0].alternative[0]) {
        recognizedWords = apiResult[0].alternative[0].transcript.split(' ');
        this.emit('speechResult', recognizedWords);
    } else {
        this.emit('speechResult', []);
    }
}