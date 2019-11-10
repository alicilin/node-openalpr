'use strict';
const path = require('path');
const AdmZip = require('adm-zip');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fetch = require('node-fetch');
const fs = require('fs');
const supos = { linux: 'linux', win32: 'windows' };
//--------------------------------------------------------------
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

async function install(){
    let res = await fetch('https://github.com/alicilin/node-openalpr/releases/download/1.0.0/bin.zip');
    let rs = fs.createWriteStream(path.join( __dirname, 'bin.zip'));
    let total = 0;
    res.body.on('data', data => {
        total += data.length;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write('bin.zip downloading ' + bytesToSize(total) + ' / ' + bytesToSize(res.headers.get('content-length')));
    })
    
    res.body.pipe(rs);
    await new Promise(resolve => res.body.on('end', () => resolve(true)).on('error',  e => reject(e)));

    new AdmZip(path.join(__dirname, 'bin.zip')).extractAllTo(__dirname, true);
    if (supos[os.platform()] === 'linux') {
       let { stderr } = await exec('chmod 777 -R ./');
       if(stderr) throw new Error(stderr);
    }

    console.log('finish');
}

install();
