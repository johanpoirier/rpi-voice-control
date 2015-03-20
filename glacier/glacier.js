var exec = require('child_process').execSync,
    fs = require('fs'),
    crypto = require('crypto');

var year = '2014';
var dir = '/home/pi/hdd/Photos/' + year;
var doneDir = __dirname + '/done';

var replaceRegexp = /([&'() ])/g;
var filesToUploadTest = new RegExp("\\.(jpg|jpeg|png|bmp|mkv|mp4|avi|mov|cr2)$", 'i');

var dirFiles;

var getShasum = function (filename) {
    var shasum = crypto.createHash('sha1');
    shasum.update(filename);
    return shasum.digest('hex');
};

var upload = function (filename) {
    var relFilename = year + filename.substring(dir.length).replace(replaceRegexp, '\\$1');

    var cmdArgs = ['mtglacier', 'upload-file',
        '--config /home/pi/.glacier.cfg',
        '--vault Photos',
        '--journal /home/pi/glacier/journal.log',
        '--filename ' + filename.replace(replaceRegexp, '\\$1'),
        '--set-rel-filename ' + relFilename,
        '--partsize 8'];

    if (fs.existsSync(doneDir + '/' + getShasum(relFilename))) {
        console.log(filename + " already uploaded");
        nextUpload();
        return;
    }

    console.log(cmdArgs.join(' '));

    try {
        console.log(exec(cmdArgs.join(" "), { stdio: 'pipe' }).toString('ascii'));
        exec('touch "' + doneDir + '/' + getShasum(relFilename) + '"');
    } catch (e) {
        console.error("Error during upload of " + relFilename, e.stderr.toString());
    } finally {
        nextUpload();
    }
};

var mockUpload = function (filename) {
    var relFilename = year + filename.substring(dir.length).replace(replaceRegexp, '\\$1');

    var cmdArgs = ['mtglacier', 'upload-file',
        '--config /home/pi/.glacier.cfg',
        '--vault Photos',
        '--journal /home/pi/glacier/journal.log',
        '--filename ' + filename.replace(replaceRegexp, '\\$1'),
        '--set-rel-filename ' + relFilename,
        '--partsize 8'];

    if (fs.existsSync(doneDir + '/' + getShasum(relFilename))) {
        console.log(relFilename + " already uploaded");
        nextUpload();        return;
    }

    console.log(cmdArgs.join(' '));
    exec('touch "' + doneDir + '/' + getShasum(relFilename) + '"');
    nextUpload();
};

//upload = mockUpload;

var nextUpload = function () {
    if (dirFiles.length > 0) {
        upload(dirFiles.shift());
    }
};

var readFiles = function (dir) {
    var files = fs.readdirSync(dir),
        filesToUpload = [];

    files.forEach(function (filename) {
        var fullpath = dir + '/' + filename;
        var file = fs.statSync(fullpath);
        if (file.isDirectory()) {
            filesToUpload = filesToUpload.concat(readFiles(fullpath));
        } else if (filesToUploadTest.test(fullpath)) {
            filesToUpload.push(fullpath);
        }
    });
    return filesToUpload;
};

// Read files
dirFiles = readFiles(dir);
upload(dirFiles.shift());