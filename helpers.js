var dom_helper = {
	show: function (id) {
		this.remove_css_class(id, "hidden");
	},
	hide: function (id) {
		this.add_css_class(id, "hidden");
	},
	add_css_class: function (id, css_class) {
		document.getElementById(id).classList.add(css_class);
	},
	remove_css_class: function (id, css_class) {
		document.getElementById(id).classList.remove(css_class);
	},
	set_text: function (id, text) {
		document.getElementById(id).innerHTML = text;
	},
	append_html: function (id, html) {
		document.getElementById(id).insertAdjacentHTML('beforeend', html);
	},
	enable: function (id) {
		document.getElementById(id).disabled = false;
	},
	disable: function (id) {
		document.getElementById(id).disabled = true;
	},
	blink: function (id, ms) {
		this.show(id);
		setTimeout((function () { this.hide(id); }).bind(this), ms);
	},
	duplicate: function (id) {
		var original = document.getElementById(id);
		var clone = original.cloneNode(true); // "deep" clone

		var clone_id = id + data_helper.get_timestamp();
		clone.id = clone_id;

		original.parentNode.appendChild(clone);

		return clone_id;
	},
	duplicateSerially: function (id, serialNumber) {
		var original = document.getElementById(id);
		var clone = original.cloneNode(true); // "deep" clone

		var clone_id = id + serialNumber;
		clone.id = clone_id;

		original.parentNode.appendChild(clone);

		return clone_id;
	},
	removeElement: function (id) {
		var element = document.getElementById(id);
		element.parentNode.removeChild(element);
	},
	goTo: function (relativeUrl) {
		location.href = relativeUrl + location.search;
	}
};

var data_helper = {
	base_address: app_settings.server.base_address,
	ws_base_address: app_settings.server.ws_base_address,
	get_subject_id: function () {
		subId = /[&?]subId=([^&]+)/.exec(location.search)[1];
		return String(key2subId_mapping[subId]);
	},
	get_subject_data: function (asArray) { // returns promise
		return new Promise((function (resolve, reject) {
			var url = this.base_address + '/app/api/session/list?subId=' + this.get_subject_id();
			url += '&fields=' + app_settings.dataVarList.concat(['uniqueEntryID']).join(',');

			var localData = JSON.parse(localStorage.getItem(this.get_subject_id() + '_data')) ?? [];
			if (localData && localData.length > 0) {
				const lastSessionDate = new Date(Math.max(...localData.map(x => new Date(x.created_at))));
				url += '&from=' + lastSessionDate.toISOString();
			}

			return ajax_helper.get(url)
				.then((function (subjectData) {
					var allData = localData.concat(subjectData);
					subjectData = Object.values(allData.toDict('created_at')); // remove double entries
					localStorage.setItem(this.get_subject_id() + '_data', JSON.stringify(subjectData));

					if (!!asArray) {
						var data = {};
						if (!!subjectData) {
							// create one dictionnay for each line of data:
							arrayOfObj = Object.entries(subjectData).map((e) => Object.assign(({ 'serial': e[0] }), e[1]));
							// populate data variables:
							app_settings.dataVarList.forEach(key => data[key] = []);
							// fill dictionnary of arrays:
							arrayOfObj.forEach(function (lineObject) {
								for (const key of Object.keys(data)) {
									data[key].push(lineObject[key]);
								}
							});
						};
						resolve(data);
					} else {
						resolve((!!subjectData) ? subjectData : {});
					}
				}).bind(this));
		}).bind(this));
	},
	getWsUrl: function (sessionName) {
		var url = ''
		if (this.ws_base_address) {
			url = this.ws_base_address;
		} else {
			url += 'ws'

			if (location.protocol.includes('https'))
				url += 's';

			url += '://' + location.hostname;

			if (location.port)
				url += ":" + location.port;
		}

		url += '/app/session?subId=' + this.get_subject_id();
		url += '&sName=' + sessionName;

		if (!!this.sessionId) {
			url += '&sessionId=' + this.sessionId;
		}

		url += '&transport=websocket';

		return url;
	},
	ws: {},
	sessionName: '',
	sessionId: '',
	q: [],
	get_timestamp: function () {
		return (new Date()).getTime();
	},
	init_session: function (sessionName, tryRestore) { // use tryRestore = false to force new session
		this.sessionName = sessionName;

		if (!tryRestore) {
			this.sessionId = '';
			this.q = [];
		}

		this.ws = new WebSocket(this.getWsUrl(sessionName + this.get_timestamp()));

		this.ws.onopen = (function (event) {
			console.log('new session opened');
			this.try_flush();
		}).bind(this);

		this.ws.onclose = (function (event) {
			// https://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
			if (event.code != 1000) {
				// https://stackoverflow.com/questions/13797262/how-to-reconnect-to-websocket-after-close-connection
				console.log('WS is closed. re-opening');
				this.init_session(this.sessionName, true);
			}
		}).bind(this);

		this.ws.onerror = (function (event) {
			console.log('WS error!');
			console.log(event);

			if (this.ws.readyState == 3) { // status CLOSED
				this.ws = undefined;
				this.init_session(this.sessionName, true);
			}
		}).bind(this);

		this.ws.onmessage = (function (event) {
			var data = JSON.parse(event.data);

			// if it is the first message in session get the current sessionId
			if ('_id' in data) {
				this.sessionId = data._id;
				this.try_flush();	// added by Rani to save first uploaded data **
			}

			// if it is ack message remove the message from queue
			if ('messageId' in data) {
				this.q = this.q.filter(m => m.messageId != data.messageId);
			}

			if ('broadcast' in data) {
				if (this.on_broadcast)
					this.on_broadcast(data);
			}
		}).bind(this);
	},
	on_broadcast: undefined,
	append_subject_data: function (data) {
		this.q.push(data);

		// send all messages that sill in queue together
		return this.try_flush();
	},
	try_flush: function () {
		if (this.q.length) {
			if (this.ws.readyState == 1 && this.sessionId) {
				// generate new message id for all messages in q
				const messageId = 'm' + this.get_timestamp();
				this.q.forEach(m => m.messageId = messageId)

				const dataToSend = JSON.stringify(
					Object.assign({ _id: this.sessionId }, ...this.q, typeof uniqueEntryID === 'undefined' ? {} : { uniqueEntryID: uniqueEntryID }) // uniqueEntryID added by Rani **
				);
				this.ws.send(dataToSend);

				console.log('readySatate = 1; data was saved. The data:')
				console.log(dataToSend)

				return true;
			} else {
				console.log("waiting for connection...")
				return false;
			}
		} else {
			return true; // nothing to send - report success
		}
	},
	flush: function (nRetries) { // use -1 for infinite retries
		if (!nRetries) // if no value is set then use infinite retries
			nRetries = -1;

		var retries = 0;

		return new Promise((async function (resolve, reject) {
			while (!this.try_flush() && this.q.length > 0) {
				retries += 1;
				if (nRetries < 0 || retries < nRetries)
					await delay(300);
				else
					return reject();
			}
			return resolve();
		}).bind(this));
	},
	wait_for_server: function (max_ms) {
		return Promise.race([
			delay(max_ms),
			new Promise((async function (resolve, reject) {
				while (this.q.length > 0) {
					await delay(300);
				}
				return resolve('success');
			}).bind(this))
		]).then((function (result) {
			if (result != 'success') {
				this.try_flush();
			}
		}).bind(this));
	}
};

// Make the function wait until the connection is made...
function waitForSocketConnection(socket, callback) {
	setTimeout(
		function () {
			if (socket.readyState === 1) {
				console.log("Connection is made")
				if (callback != null) {
					callback();
				}
			} else {
				console.log("wait for connection...")
				waitForSocketConnection(socket, callback);
			}

		}, 5); // wait 5 milisecond for the connection...
}


// ***************************************************************
//                 Helper functions (by Rani):
// ---------------------------------------------------------------

function dateDiff(date1, date2, experimentalDayStartingHour = 0) {
	const adjustingTime = 1000 * 60 * 60 * experimentalDayStartingHour;

	date1 = new Date(date1 - adjustingTime)
	date2 = new Date(date2 - adjustingTime)

	date1.setHours(0, 0, 0, 0);
	date2.setHours(0, 0, 0, 0);
	const diffTime = Math.abs(date2 - date1);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	// console.log(diffTime + " milliseconds");
	// console.log(diffDays + " days");
	return diffDays;
}

function wait(delay) {
	return new Promise(function (resolve) {
		setTimeout(resolve, delay);
	});
}

function delay(delay) {
	return wait(delay);
}

Array.prototype.multiIndexOf = function (el) {
	var idxs = [];
	for (var i = this.length - 1; i >= 0; i--) {
		if (this[i] === el) {
			idxs.unshift(i);
		}
	}
	return idxs;
};

Array.prototype.toDict = function (field) {
	return this.reduce((d, el) => {
		d[el[field]] = el;
		return d;
	}, {})
};

function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

// A function to sort with indices I got from: https://stackoverflow.com/questions/3730510/javascript-sort-array-and-return-an-array-of-indicies-that-indicates-the-positi
function sortWithIndices(toSort) {
	for (var i = 0; i < toSort.length; i++) {
		toSort[i] = [toSort[i], i];
	}
	toSort.sort(function (left, right) {
		return left[0] < right[0] ? -1 : 1;
	});
	toSort.sortIndices = [];
	for (var j = 0; j < toSort.length; j++) {
		toSort.sortIndices.push(toSort[j][1]);
		toSort[j] = toSort[j][0];
	}
	return toSort;
}

// load the frames in case they are not already there:
function loadLotteryFrames(totalFrames) {
	if (!document.getElementById('lottery-1')) {
		for (var i = 1; i < totalFrames + 1; i++) {
			var elem = document.createElement('img');
			elem.setAttribute('id', 'lottery-' + i)
			elem.setAttribute('class', 'waiting_for_outcome_gif')
			elem.setAttribute('src', "images/lottery/image" + i + ".png")
			document.getElementById('lottery').appendChild(elem);
		}
	}
}

function runLottery(timePerFrame, totalFrames, identifier) {
	x = new Date()
	dom_helper.show('lottery')
	document.getElementById('lottery-1').style.opacity = 1
	let frameNumber = 1;
	var runAnimation = setInterval(() => {
		frameNumber++;
		if (frameNumber > totalFrames || identifiersToClean.includes(identifier)) { // The second one is for case of pseudo refresh.
			document.getElementById('lottery-' + (frameNumber - 1)).style.opacity = 0;
			clearInterval(runAnimation)
			if (identifiersToClean.includes(identifier)) { appRunning = false };
			return
		} else {
			document.getElementById('lottery-' + (frameNumber - 1)).style.opacity = 0;
			document.getElementById('lottery-' + frameNumber).style.opacity = 1;
		}
	}, timePerFrame)
}

var ajax_helper = {
	get: function (url) {
		return this.request("GET", url);
	},
	request: function (method, url) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();

			xhr.open(method, url);
			xhr.responseType = "json";

			xhr.onload = function () {
				if (this.status >= 200 && this.status < 300) {
					resolve(xhr.response);
				} else {
					reject({
						status: this.status,
						statusText: xhr.statusText
					});
				}
			};

			xhr.onerror = function () {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			};
			xhr.ontimeout = function (e) { reject(e); };
			xhr.onabort = function (e) { reject(e); };

			xhr.send();
		});
	}
};

// Used by app.js and coin_collection.js:
function finishTrial(runData) {
	// show goodbye message:
	dom_helper.add_css_class('welcome_msg', 'goodByeMessage'); // **
	dom_helper.add_css_class('welcome_msg_txt', 'goodByeMessageTextSize'); // **
	dom_helper.set_text('welcome_msg_txt', "נתראה בפעם הבאה"); //**
	dom_helper.show('welcome_msg'); // **

	// collect end time and save subject data as results:
	var dataToSend = { endTime: new Date(), commitSession: true };
	if (runData.isDemo) {
		dataToSend.broadcast = 'demo_trial_ended';
	}

	subject_data_worker.postMessage(dataToSend);

	data_helper.wait_for_server(2000).then(function () { console.log('All data received at server [initiated by the finishTrial function]'); appRunning = false });

	console.log('Trial Completed')
	onUserExit('trial_completed')
}

var dialog_helper = {
	makeid: function (length) { // adapted to generate random strings from : https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
		var result = '';
		var characters = 'bcdfghjklmnpqrstvwxyz'; // I left only small letters and removed AEIOU letters to prevent word formation.
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},
	random_code_confirmation: function (msg, img_id = '', delayBeforeClosing = 0, resolveOnlyAfterDelayBeforeClosing = false, preventFeedBack = false) { // returns promise
		return this.show(msg, img_id, this.makeid(3), delayBeforeClosing, resolveOnlyAfterDelayBeforeClosing, preventFeedBack);
	},
	show: function (msg, img_id = '', confirmation = '', delayBeforeClosing = 0, resolveOnlyAfterDelayBeforeClosing = false, preventFeedBack = false) { // returns promise
		appRunning = false;
		return new Promise(function (resolve) {
			if (!!confirmation) {
				dom_helper.set_text("dialog_confirmation_msg", 'כדי להמשיך יש להקליד ' + "'" + confirmation + "'" + '.');
				dom_helper.show("dialog_confirmation_msg")
				dom_helper.show("dialog_response_text");
				dom_helper.disable("dialog_ok_button");
				document.getElementById('dialog_response_text').oninput = function () {
					if (document.getElementById('dialog_response_text').value.toLowerCase() == confirmation) {
						dom_helper.enable("dialog_ok_button");
					}
				}
			} else if (preventFeedBack) {
				dom_helper.hide("dialog_response_text");
				dom_helper.hide("dialog_ok_button")
			} else {
				dom_helper.hide("dialog_response_text");
				dom_helper.enable("dialog_ok_button")
			}

			if (!!img_id) {
				dom_helper.show(img_id);
			}

			dom_helper.set_text("dialog_msg", msg);
			dom_helper.show("screen-disabled-mask");
			dom_helper.show('dialog_box');

			subject_data_worker.postMessage({ isDialogOn: true });

			if (preventFeedBack) { resolve() }

			document.getElementById('dialog_ok_button').onclick = function () {
				document.getElementById('dialog_ok_button').onclick = undefined;
				document.getElementById('dialog_response_text').oninput = undefined;

				setTimeout(() => {
					if (!!img_id) {
						dom_helper.hide(img_id);
					}
					dom_helper.hide('dialog_box');
					dom_helper.hide("screen-disabled-mask");

					document.getElementById("dialog_response_text").value = ''; // clean the text box (good for if a new text box is following)

					subject_data_worker.postMessage({ isDialogOn: false });

					if (resolveOnlyAfterDelayBeforeClosing) { // needed to make consecutive dialog boxes work sometimes
						resolve();
						appRunning = true;
					}
				}, delayBeforeClosing)
				if (!resolveOnlyAfterDelayBeforeClosing) { // needed to make consecutive dialog boxes work sometimes
					resolve();
					appRunning = true;
				}
			}
		});
	}
}

// SERVICE WORKER CALLING
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('sw.js')
			.then(reg => {
				console.log('Service Worker: Registered')
				reg.addEventListener('updatefound', () => {
					console.log('UPDATE FOUND')
					subject_data_worker.postMessage({newServiceWorkerDetected: new Date, commitSession: true });
					//reg.update()
					// A wild service worker has appeared in reg.installing!
					const newWorker = reg.installing;

					newWorker.state;
					// "installing" - the install event has fired, but not yet complete
					// "installed"  - install complete
					// "activating" - the activate event has fired, but not yet complete
					// "activated"  - fully active
					// "redundant"  - discarded. Either failed install, or it's been
					//                replaced by a newer version

					newWorker.addEventListener('statechange', () => {
						console.log('STATE CHANGED')
						console.log(newWorker.state)
						// newWorker.state has changed
					});
				});
			})
			.catch(err => console.log(`Service Worker: Error: ${err}`))
	})
}