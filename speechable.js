var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    wit = require('node-wit');

var Speakable = function Speakable(credentials) {
    EventEmitter.call(this);

    this.recRunning = false;
    this.apiResult = {};
    this.apiKey = credentials.key
    this.cmd = 'sox';
    this.fileName = __dirname + '/_current.wav';
    this.cmdArgs = [
        '-b', '16',
        '-d', '-t', 'wav', this.fileName,
        'rate', '16000', 'channels', '1',
        'silence', '-l', '1', '00:00:00.5', '-10d', '1', '00:00:02', '10%'
    ];

    console.log("[command] sox " + this.cmdArgs.join(" "));
};

util.inherits(Speakable, EventEmitter);
module.exports = Speakable;

Speakable.prototype.postVoiceData = function () {
    // write data to request body
    console.log('[speakable] posting voice data...');

    var stream = fs.createReadStream(__dirname + '/_current.wav');
    wit.captureSpeechIntent(this.apiKey, stream, "audio/wav", function (err, res) {
        if (err) {
            this.emit('error', err);
        }
        this.apiResult = res;
        this.parseResult();

        this.resetVoice();
    }.bind(this));
};

Speakable.prototype.recordVoice = function () {
    var self = this,
        rec = spawn(self.cmd, self.cmdArgs, 'pipe');

    self.emit('speechReady');

    // Process stderr
    rec.stderr.setEncoding('utf8');
    rec.stderr.on('data', function (data) {
        console.error(data)
    });

    rec.on('close', function (code) {
        self.recRunning = false;
        self.emit('speechEnd');
        if (code) {
            self.emit('error', 'sox exited with code ' + code);
        } else {
            self.postVoiceData();
        }
    });
};

Speakable.prototype.resetVoice = function () {
    // delete _current.wav file
    fs.unlink(this.fileName, function (err) {
        if (err) throw err;
        this.fileName = __dirname + '/_current' + Math.floor(Math.random() * 10000) + '.wav';
    });
}

Speakable.prototype.parseResult = function () {
    var apiResult = this.apiResult;
    if (apiResult._text.length > 0 && apiResult.outcomes.length > 0) {
        this.emit('speechResult', apiResult._text, apiResult.outcomes.join(','));
    } else {
        this.emit('speechResult', false);
    }
}
