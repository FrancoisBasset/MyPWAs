const express = require('express');
const app = express();

app.listen(3000, function() {
	console.log('Start on 3000');
});

app.use(express.static('./public'));

app.get('/', function(req, res) {
	res.sendFile('./index.html');
});

const clone = require('./clone');

//installation
/*const repositories = require('./public/repositories.json');
for (const repository of repositories) {
	clone(repository).then(function(name) {
		app.use('/', require(`./apis/${name}/routes`));
	});
}*/

//recuperer apis

const fs = require('fs');
if (fs.existsSync('./apis')) {
	const apis = fs.readdirSync('./apis');
	
	for (const api of apis) {
		app.use('/', require(`./apis/${api}/routes`));
	}
	
	console.log(apis);
}