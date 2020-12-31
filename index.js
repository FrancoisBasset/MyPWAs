const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const utils = require('./utils');

const app = express();
app.listen(3000, function() {
	console.log('Start on 3000');
});
app.use(express.static('./public'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.sendFile('./index.html');
});

app.get('/allPwas', async function(req, res) {
	res.json({
		success: true,
		response: await utils.getAllPwas()
	});
});

app.post('/install', function(req, res) {
	utils.install(req.body.repository).then(function(name) {
		app.use('/', require(`./pwas/${name}/routes`));

		res.json({
			success: true
		});
	});
});

app.post('/uninstall', function(req, res) {
	utils.uninstall(app, req.body.pwa);
});

if (fs.existsSync('./pwas')) {
	for (const pwa of utils.getInstalledPwas()) {
		app.use('/', require(`./pwas/${pwa}/routes`));
	}
}