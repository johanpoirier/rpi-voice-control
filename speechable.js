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
	'-q',
        '-b', '16',
        '-d', '-t', 'wav', this.fileName,
        'rate', '16000', 'channels', '1',
        'silence', '-l', '1', '00:00:00.1', '-35d', '1', '00:00:00.5', '5%'
    ];
};

util.inherits(Speakable, EventEmitter);
module.exports = Speakable;

Speakable.prototype.postVoiceData = function (fileName) {
    // write data to request body
    //console.log('[speakable] posting voice data...');

    var stats = fs.statSync(fileName);
    if (stats["size"] > 72000) {
        var stream = fs.createReadStream(fileName);
        wit.captureSpeechIntent(this.apiKey, stream, "audio/wav", function (err, res) {
            if (err) {
                this.emit('error', err);
            }
            this.apiResult = res;
            this.parseResult();
        }.bind(this));
    } else {
        //console.log("Record too short");
	this.resetVoice(fileName);
    }
};

Speakable.prototype.recordVoice = function () {
    this.fileName = __dirname + "/_current" + Math.floor(Math.random() * 10000) + ".wav";
    this.cmdArgs[6] = this.fileName;

    var self = this,
        rec = spawn(self.cmd, self.cmdArgs, 'pipe');

    //console.log("[command] sox " + this.cmdArgs.join(" "));

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
            self.postVoiceData(self.fileName);
            self.recordVoice();
        }
    });
};

Speakable.prototype.resetVoice = function (fileName) {
    // delete _current.wav file
    fs.unlink(fileName, function (err) {
        if (err) throw err;
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
