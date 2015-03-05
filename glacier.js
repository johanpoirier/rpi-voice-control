var exec = require('child_process').execSync,
    fs = require('fs');

var dir = '/home/pi/hdd/Glacier/2013';
var doneDir = __dirname + '/done';

var dirFiles;

var upload = function (filename) {
    var cmdArgs = ['mtglacier', 'upload-file',
        '--config /home/pi/.glacier.cfg',
        '--vault Photos',
        '--journal /home/pi/glacier/journal.log',
        '--filename /home/pi/hdd/Glacier/2013/' + filename.replace(/ /g, '\\ '),
        '--set-rel-filename 2013/' + filename.replace(/ /g, '\\ ')];

    if (fs.existsSync(doneDir + '/' + filename)) {
        console.log(filename + " already uploaded");
        nextUpload();
        return;
    }

    console.log(cmdArgs.join(' '));
    var glacier = exec(cmdArgs.join(" "), { stdio: 'pipe' });

    glacier.stdout.setEncoding('utf8');
    glacier.stdout.on('data', function (data) {
        console.log(data);
    });


    glacier.stderr.setEncoding('utf8');
    glacier.stderr.on('data', function (data) {
        console.error(data)
    });

    glacier.on('close', function () {
        exec('touch "' + doneDir + '/' + filename + '"');
        nextUpload();
    });
};

var nextUpload = function () {
    if (dirFiles.length > 0) {
        upload(dirFiles.shift());
    }
};

// Read files
fs.readdir(dir, function (err, files) {
    dirFiles = files;
    upload(dirFiles.shift());
});