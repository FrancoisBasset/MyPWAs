const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const clone = require('./clone');

app.listen(3000, function() {
	console.log('Start on 3000');
});

app.use(express.static('./public'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.sendFile('./index.html');
});

app.post('/install', function(req, res) {
	clone(req.body.repository).then(function(name) {
		app.use('/', require(`./apis/${name}/routes`));

		res.json({
			success: true
		});
	});
});

const fs = require('fs');
if (fs.existsSync('./apis')) {
	const apis = fs.readdirSync('./apis');
	
	for (const api of apis) {
		app.use('/', require(`./apis/${api}/routes`));
	}
}