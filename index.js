const express = require('express');
const app = express();

app.listen(3000, function() {
	console.log('Start on 3000');
});

app.use(express.static('./public'));

app.get('/', function(req, res) {
	res.sendFile('./index.html');
});

const fs = require('fs');
if (fs.existsSync('./apis')) {
	const apis = fs.readdirSync('./apis');
	
	for (const api of apis) {
		app.use('/', require(`./apis/${api}/routes`));
	}
	
	console.log(apis);
}