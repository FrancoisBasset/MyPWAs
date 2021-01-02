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
	res.redirect('/home');
})

app.get('/home', function(req, res) {
	res.sendFile('./home/index.html');
});

app.get('/allPwas', async function(req, res) {
	res.json({
		success: true,
		response: await utils.getAllPwas()
	});
});

app.post('/install', async function(req, res) {
	utils.install(req.body.repository).then(async function(name) {
		app.use('/', require(`./pwas/${name}/routes`));

		res.json({
			success: true,
			response: await utils.getAllPwas()
		});
	});
});

app.post('/uninstall', async function(req, res) {
	utils.uninstall(app, req.body.pwa);

	res.json({
		success: true,
		response: await utils.getAllPwas()
	});
});

if (fs.existsSync('./pwas')) {
	for (const pwa of utils.getInstalledPwas()) {
		app.use('/', require(`./pwas/${pwa}/routes`));
	}
}