var Speakable = require('./speakable.js');
var apiKey = process.env.GKEY;

var speakable = new Speakable({ key: apiKey }, { lang: 'fr', threshold: '-10d' });

speakable.on('speechStart', function() {
    console.log('speachStart');
});
speakable.on('speechStop', function() {
    console.log('speachStop');
});

speakable.on('error', function(err) {
    console.log('onError:');
    console.log(err);
    speakable.recordVoice();
});

speakable.on('speechResult', function(recognizedWords) {
    console.log('onSpeechResult:')
    console.log(recognizedWords);
    speakable.recordVoice();
});

speakable.recordVoice();