const fetch = require('node-fetch');
const fs = require('fs');

const admZip = require('adm-zip');

const appName = 'pwa3';
const github = 'https://github.com/FrancoisBasset/pwa3/archive/master.zip';

if (!fs.existsSync('./apis')) {
	fs.mkdirSync('./apis');
}

if (!fs.existsSync(`./public/${appName}`)) {
	fs.mkdirSync(`./public/${appName}`);
}

if (!fs.existsSync(`./apis/${appName}`)) {
	fs.mkdirSync(`./apis/${appName}`);
	fs.mkdirSync(`./apis/${appName}/classes`);
	fs.mkdirSync(`./apis/${appName}/routes`);
}

fetch(github).then(function(r) {
	/**
	 * @type {fetch.Response}
	 */
	const response = r;

	response.arrayBuffer().then(function(arrayBuffer) {
		const buffer = Buffer.from(arrayBuffer);
		const zipfile = new admZip(buffer);

		zipfile.getEntries().forEach(function(entry) {
			if (entry.entryName.includes('master/classes/') && !entry.entryName.endsWith('/')) {
				fs.writeFileSync(`./apis/${appName}/classes/${entry.name}`, entry.getData());
			}

			if (entry.entryName.includes('master/routes/') && !entry.entryName.endsWith('/')) {
				fs.writeFileSync(`./apis/${appName}/routes/${entry.name}`, entry.getData());
			}

			if (entry.entryName.includes('master/public/') && !entry.entryName.endsWith('/')) {
				fs.writeFileSync(`./public/${appName}/${entry.name}`, entry.getData());
			}

			
			if (entry.entryName.includes('/package.json')) {
				const jsonString = entry.getData().toString();
				const json = JSON.parse(jsonString);

				for (const dep of Object.keys(json.dependencies)) {
					const exec = require('child_process').exec;

					exec('npm install ' + dep, function(err, res) {

					});
				}
			}
		});
	});
});