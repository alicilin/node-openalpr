'use strict';
const path = require('path');
const AdmZip = require('adm-zip');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const supos = { freebsd: 'linux', linux: 'linux', openbsd: 'linux', win32: 'windows' };
//--------------------------------------------------------------

new AdmZip(path.join(__dirname, 'bin.zip')).extractAllTo(__dirname, true);
if(supos[os.platform()] === 'linux'){
    exec('chmod 777 -R ./').then(x => x.stderr ? console.log(stderr) && process.exit(111) : null).catch(e => console.log(e) && process.exit(111));
}

