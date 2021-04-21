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

	constructor(name, title, repository, favicon, installed) {
		this.name = name;
		this.title = title;
		this.repository = repository;
		this.favicon = favicon;
		this.installed = installed;

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

		const iconCell = this.#element.insertCell();
		iconCell.append(this.#img);
		iconCell.append(document.createElement('br'));
		iconCell.append(label);

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

		const buttonCell = this.#element.insertCell();
		buttonCell.append(this.#button);

		this.#loaderCell = this.#element.insertCell();
	}

	getElement() {
		return this.#element;
	}

	start() {
		window.location.href = '/' + this.name;
	}

	install() {
		const loader = document.createElement('div');

		loader.className = 'loader'
		this.#loaderCell.append(loader);

		fetch('/install', {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({name: this.name})
		}).then(response => {
			loader.parentElement.remove();
			this.#button.textContent = 'Désinstaller';
			this.#button.onclick = () => {
				this.uninstall();
			}
			this.#img.onclick = () => {
				this.start();
			}
		});
	}

	uninstall() {
		const loader = document.createElement('div');

		loader.className = 'loader'
		this.#loaderCell.append(loader);
		
		fetch('/uninstall', {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({name: this.name})
		}).then(response => {
			loader.parentElement.remove();
			this.#button.textContent = 'Installer';
			this.#button.onclick = () => {
				this.install();
			}
			this.#img.onclick = null;
		});
	}
}