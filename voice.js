var Speakable = require('./Speakable');

var speakable = new Speakable({ key: 'AIzaSyA-idqbyUoaEA9pVdXAAGuYOZgZHfxp-NU' }, { lang: 'fr-FR' });

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