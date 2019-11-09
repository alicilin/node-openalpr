'use strict';

const OpenALPR = require('./index');
const path = require('path');
const alpr = new OpenALPR(4);

async function main(){
    let promises = [];
    for(let i = 0; i < 10; i++){
        promises.push(alpr.recognize(path.join(__dirname, 'plaka2.jpeg'), { c: 'eu', p: 'tr' }));
    }

    let res = await Promise.all(promises);
    console.log(res);

    setInterval(() => console.log(alpr.getQueueLength(), alpr.getProcessingLength()), 200);
}

main().catch(x => console.log(x.message));