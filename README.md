# OpenALPR node
## installing

    npm install @alicilin/openalpr

## Example

    const  OpenALPR  =  require('@alicilin/openalpr');
	const  path  =  require('path');
	const  alpr  =  new  OpenALPR(4);
	async function  main(){
		let promises = [];
		for(let i = 0; i < 10; i++){
			promises.push(alpr.recognize(path.join(__dirname, 'plate.jpeg'), { c:  'eu', p:  'tr' }));
		}
		
		setInterval(() => console.log(alpr.getQueueLength(), alpr.getProcessingLength()), 200);
		let res = await Promise.all(promises);
		console.log(res);
	}
	
	main().catch(x  =>  console.log(x.message));


## Api

    OpenALPR.constructor(concurrency: integer) <OpenALPR instance> 
    OpenALPR.recognize(imagePath: String, options: Object) <Promise> 
    OpenALPR.getQueueLength() <integer>
    OpenALPR.getProcessingLength() <integer>

 - concurrency = integer
 - imagePath = String
 - options = Object
	 - options.c = String (country),
	 - options.p = String (pattern),
	 - options.a = Array (extra 'node.js exec' arguments) 
