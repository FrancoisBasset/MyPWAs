const fetch = require('node-fetch');
const fs = require('fs');
const admZip = require('adm-zip');
const execSync = require('child_process').execSync;

/**
 * 
 * @param {string} appName 
 * @param {string} github
 * @returns {Promise}
 */
module.exports = function(github) {
	if (!fs.existsSync('./apis')) {
		fs.mkdirSync('./apis');
	}

	return fetch(github + '/archive/master.zip').then(function(r) {
		/**
		 * @type {fetch.Response}
		 */
		const response = r;

		return response.arrayBuffer().then(function(arrayBuffer) {
			const buffer = Buffer.from(arrayBuffer);
			const zipfile = new admZip(buffer);

			const root = zipfile.getEntries()[0].entryName;
			const packageJsonEntry = zipfile.getEntry(root + 'package.json');
			const packageJson = JSON.parse(packageJsonEntry.getData().toString());
			const name = packageJson.name;
			const dependencies = Object.keys(packageJson.dependencies).join(' ');

			if (!fs.existsSync(`./public/${name}`)) {
				fs.mkdirSync(`./public/${name}`);
			}
		
			if (!fs.existsSync(`./apis/${name}`)) {
				fs.mkdirSync(`./apis/${name}`);
				fs.mkdirSync(`./apis/${name}/classes`);
				fs.mkdirSync(`./apis/${name}/routes`);
			}

			zipfile.getEntries().forEach(function(entry) {
				if (entry.entryName.includes('master/classes/') && !entry.entryName.endsWith('/')) {
					fs.writeFileSync(`./apis/${name}/classes/${entry.name}`, entry.getData());
				}

				if (entry.entryName.includes('master/routes/') && !entry.entryName.endsWith('/')) {
					fs.writeFileSync(`./apis/${name}/routes/${entry.name}`, entry.getData());
				}

				if (entry.entryName.includes('master/public/') && !entry.entryName.endsWith('/')) {
					fs.writeFileSync(`./public/${name}/${entry.name}`, entry.getData());
				}
			});
			
			execSync('npm install ' + dependencies);

			return name;
		});
	});
}