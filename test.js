var Commander = require(__dirname + "/modules/commander.js");

Commander.process({
   "_text": "Maison allume la télé s'il te plait",
    "intent": "TV_control",
    "entities": {
        "on_off": [ { "value": "on" }]
    },
    "confidence": 0.675
});