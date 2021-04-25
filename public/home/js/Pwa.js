class Pwa {
	/**
	 * @type {HTMLTableRowElement}
	 */
	#element
	/**
	 * @type {HTMLTableDataCellElement}
	 */
	#loaderCell
	/**
	 * @type {HTMLButtonElement}
	 */
	#button
	/**
	 * @type {HTMLImageElement}
	 */
	#img
	/**
	 * @type {HTMLDivElement}
	 */
	#loader

	constructor(name, title, repository, favicon, installed, installing) {
		this.name = name;
		this.title = title;
		this.repository = repository;
		this.favicon = favicon;
		this.installed = installed;
		this.installing = installing;

		this.#element = document.createElement('tr');

		this.#img = document.createElement('img');
		this.#img.src = favicon;
		this.#img.width = 200;
		this.#img.height = 200;
		this.#img.style.cursor = 'pointer';
		if (installed) {
			this.#img.onclick = () => {
				this.start();
			}
		}

		const label = document.createElement('label');
		label.textContent = title;
		label.style.cssText = 'font-size: 40px; font-family: sans-serif';

		this.#button = document.createElement('button');
		if (installed) {
			this.#button.textContent = 'Désinstaller';
			this.#button.onclick = () => {
				this.uninstall();
			}
		} else {
			this.#button.textContent = 'Installer';
			this.#button.onclick = () => {
				this.install();
			}
		}

		const iconCell = this.#element.insertCell();
		iconCell.append(this.#img);
		iconCell.append(document.createElement('br'));
		iconCell.append(label);
		iconCell.append(document.createElement('br'));
		iconCell.append(this.#button);

		this.#loaderCell = this.#element.insertCell();
		this.#loader = document.createElement('div');
		this.#loader.className = 'loader';
		if (this.installing) {
			this.#loaderCell.append(this.#loader);
			var intervalId = setInterval(() => {
				fetch('./pwas.json').then(response => {
					response.json().then(json => {
						pwas = json;
						if (pwas[this.name].installing == false) {
							clearInterval(intervalId);
							this.#whenInstalled();							
						}
					});
				}, 1000);
			})
		}
	}

	getElement() {
		return this.#element;
	}

	start() {
		window.location.href = '/' + this.name;
	}

	install() {
		this.#loaderCell.append(this.#loader);

		fetch('/install', {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({name: this.name})
		}).then(response => {
			this.#whenInstalled();
		});
	}

	uninstall() {
		this.#loaderCell.append(this.#loader);
		
		fetch('/uninstall', {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({name: this.name})
		}).then(response => {
			this.#whenUninstalled();
		});
	}

	#whenInstalled() {
		this.#loader.parentElement.remove();
		this.#button.textContent = 'Désinstaller';
		this.#img.onclick = () => {
			this.start();
		}
		this.#button.onclick = () => {
			this.uninstall();
		}
	}

	#whenUninstalled() {
		this.#loader.parentElement.remove();
		this.#button.textContent = 'Installer';
		this.#img.onclick = null;
		this.#button.onclick = () => {
			this.install();
		}
	}
}