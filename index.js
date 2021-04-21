const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const PwaController = require('./classes/PwaController');

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

PwaController.writePwasJson();

app.post('/install', function(req, res) {
	PwaController.install(req.body.name).then(function(name) {
		app.use('/', require(`./pwas/${name}/routes`));

		res.json({
			success: true
		});
	});
});

app.post('/uninstall', function(req, res) {
	PwaController.uninstall(req.body.name, app);

	res.json({
		success: true
	});
});

if (fs.existsSync('./pwas')) {
	for (const pwa of PwaController.getInstalledPwas()) {
		app.use('/', require(`./pwas/${pwa}/routes`));
	}
}