'use strict';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const os = require('os');
const joi = require('@hapi/joi');
const supos = { linux: 'linux',  win32: 'windows' };
const osname = supos[os.platform()];

let scheme = joi.object({
    image: joi.string().required(),
    c: joi.string().min(2).max(4),
    p: joi.string().min(2).max(4),
    a: joi.array().items(joi.string())
});

let executor = { };

executor.linux = function (image, { c, p, a }) {
    let options = {
        cwd:  path.join(__dirname, 'bin', osname),
        env: {
            LD_LIBRARY_PATH: path.join(__dirname, 'bin', osname, 'lib')
        }
    }

    let args = []
    
    args.push(path.join(__dirname, 'bin', osname, 'bin', 'alpr'));
    args.push('-c', c || 'eu');
    args.push('--config', path.join(__dirname, 'bin', osname, 'share', 'openalpr', 'config', 'openalpr.defaults.conf'));
    args.push('-j');

    if(p) args.push('-p', p);
    if(Array.isArray(a)) args.push(...a);

    args.push(image);
    
    return exec(args.join(' '), options);
}

executor.windows = function (image, { c, p, a }) {
    let options = {
        cwd: path.join(__dirname, 'bin', osname)
    }

    let args = []

    args.push(path.join(__dirname, 'bin', osname, 'alpr.exe'));
    args.push('-c', c || 'eu');
    args.push('--config', path.join(__dirname, 'bin', osname, 'openalpr.conf'));
    args.push('-j');

    if (p) args.push('-p', p);
    if (Array.isArray(a)) args.push(...a);

    args.push(image);

    return exec(args.join(' '), options);
}

async function process(image, { c, p, a}){
    if (!(os.platform() in supos)) throw new Error('unsupported os');
    if (os.arch() !== 'x64') throw new Error('unsupported arch');
    try { 
        let valid = await scheme.validateAsync({ image, c, p, a });
        let { stdout, stderr } = await executor[osname](valid.image, { c: valid.c, p: valid.p, a: valid.a }); 
        if (stderr) throw new Error(stderr);
        return JSON.parse(stdout); 
    } catch(err) { 
        throw new Error(err.message)
    }
}

function OpenALPR(cmax = 2){
    if(!new.target) throw new Error('please use NEW');
    let queue = [];
    let processing = [];
    let sync = () => {
        if (processing.length < cmax) {
            let next = queue.shift();
            if (next) {
                let _then = x => { 
                    next.resolve(x); 
                    processing.splice(processing.findIndex(p => p === next), 1); 
                    sync(); 
                }

                let _catch = x => { 
                    next.reject(x); 
                    processing.splice(processing.findIndex(p => p === next), 1); 
                    sync(); 
                }

                processing.push(next);
                process(...next.params).then(_then).catch(_catch);
            }
        }
    }

    this.getQueueLength = () => queue.length;
    this.getProcessingLength = () => processing.length;
    this.recognize = (...params) => {
        return new Promise((resolve, reject) => {
            queue.push({ params, resolve, reject });
            sync();
        })
    }
}

module.exports = OpenALPR;
