const fetch = require('node-fetch');
const fs = require('fs');
const admZip = require('adm-zip');
const execSync = require('child_process').execSync;

module.exports.getAllPwas = async function() {
	const repositories = require('./repositories.json');
	var pwas = [];

	for (const repository of repositories) {
		const rawUrl = repository.replace('https://github.com', 'https://raw.githubusercontent.com');

		const response = await fetch(rawUrl + '/master/package.json');
		const packageJson = await response.json();

		pwas.push({
			name: packageJson.name,
			title: packageJson.title,
			repository: repository,
			favicon: rawUrl + '/master/public/favicon.ico',
			installed: this.getInstalledPwas().includes(packageJson.name)
		});
	}

	return pwas;
}

module.exports.getInstalledPwas = function() {
	if (fs.existsSync('./pwas')) {
		const pwas = fs.readdirSync('./pwas');
		const public = fs.readdirSync('./public');
		public.splice(public.indexOf('index.html'), 1);

		for (const pwa of pwas) {
			if (!public.includes(pwa)) {
				pwas.splice(pwas.indexOf(pwa), 1);
			}
		}

		return pwas;
	} else {
		return [];
	}
}

/**
 * 
 * @param {string} appName 
 * @param {string} github
 * @returns {Promise}
 */
module.exports.install = function(github) {
	if (!fs.existsSync('./pwas')) {
		fs.mkdirSync('./pwas');
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
		
			if (!fs.existsSync(`./pwas/${name}`)) {
				fs.mkdirSync(`./pwas/${name}`);
				fs.mkdirSync(`./pwas/${name}/classes`);
				fs.mkdirSync(`./pwas/${name}/routes`);
			}

			zipfile.getEntries().forEach(function(entry) {
				if (entry.entryName.includes('master/classes/') && !entry.entryName.endsWith('/')) {
					fs.writeFileSync(`./pwas/${name}/classes/${entry.name}`, entry.getData());
				}

				if (entry.entryName.includes('master/routes/') && !entry.entryName.endsWith('/')) {
					fs.writeFileSync(`./pwas/${name}/routes/${entry.name}`, entry.getData());
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