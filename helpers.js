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

		var clone_id = id + (new Date()).getTime();
		clone.id = clone_id;

		original.parentNode.appendChild(clone);

		return clone_id;
	},
	removeElement: function (id) {
		var element = document.getElementById(id);
		element.parentNode.removeChild(element);
	}
};

var data_helper = {
	get_subject_data: function (asArray) {
		var subjectData = jatos.batchSession.get(jatos.workerId + "_data");

		if (!!asArray) {
			//arr = []; for (v in subjectData) { arr.push(v); }
			//return arr;
			// ** COMMENTED (ABOVE) AND BY RANI AND CHANGED TO THE FOLLOWING: **
			//initialize data
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
			return data;

		} else {
			return (!!subjectData) ? subjectData : {};
		}
	},
	append_subject_data: function (data) { // returns promise
		var subjectData = this.get_subject_data(false);

		if (!!subjectData[jatos.studyResultId]) {
			var runData = subjectData[jatos.studyResultId];
			Object.assign(runData, data);
			subjectData[jatos.studyResultId] = runData;
		} else {
			subjectData[jatos.studyResultId] = data;
		}

		return jatos.batchSession.set(jatos.workerId + "_data", subjectData);
	}
};

// ***************************************************************
//                 Helper functions (by Rani):
// ---------------------------------------------------------------

function dateDiff(date1, date2) {
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

function syncWait(ms) {
	var start = Date.now(),
		now = start;
	while (now - start < ms) {
		now = Date.now();
	}
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

function getConfirmation(msg, type) {
	if (type === "prompt") {
		confirmationCode = makeid(3);
		confirmation = '';
		while (!confirmation || confirmation.toLowerCase() !== confirmationCode) {
			confirmation = prompt(msg + confirmationCode);
		}
	} else if (type === "alert") {
		alert(msg)
	}
}

var ajax_helper = {
	get: function (url) {
		return this.request("GET", url);
	},
	request: function (method, url) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.open(method, url);
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
			xhr.send();
		});
	}
};

// Used by app.js
function finishTrial() {
	//console.log(document.getElementById('coinTask').classList.contains('hidden'))
	if (!document.getElementById('coinTask') || document.getElementById('coinTask').classList.contains('hidden')) {
		dom_helper.add_css_class('welcome_msg', 'goodByeMessage'); // **
		dom_helper.add_css_class('welcome_msg_txt', 'goodByeMessageTextSize'); // **
		dom_helper.set_text('welcome_msg_txt', "נתראה בפעם הבאה"); //**
		dom_helper.show('welcome_msg'); // **

		// collect end time and save subject data as results
		subject_data_worker.postMessage({ endTime: new Date() });
		terminate_subject_data_worker = true;
	} else {
		setTimeout(checkIfToFinish, 300);
	}
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
	random_code_confirmation: function (msg, img_id, delayBeforeClosing = 0) { // returns promise
		return this.show(msg, img_id, this.makeid(3), delayBeforeClosing);
	},
	show: function (msg, img_id, confirmation, delayBeforeClosing = 0) { // returns promise
		return new Promise(function (resolve) {
			if (!!confirmation) {
				dom_helper.set_text("dialog_confirmation_msg", '.' + "'" + confirmation + "'" + ' כדי למשיך יש להקליד');
				dom_helper.show("dialog_confirmation_msg")
				dom_helper.show("dialog_response_text");
				dom_helper.disable("dialog_ok_button");
				document.getElementById('dialog_response_text').oninput = function () {
					if (document.getElementById('dialog_response_text').value.toLowerCase() == confirmation) {
						dom_helper.enable("dialog_ok_button");
					}
				}
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

			document.getElementById('dialog_ok_button').onclick = function () {
				document.getElementById('dialog_ok_button').onclick = undefined;
				document.getElementById('dialog_response_text').oninput = undefined;

				setTimeout(() => {
					if (!!img_id) {
						dom_helper.hide(img_id);
					}
					dom_helper.hide('dialog_box');
					dom_helper.hide("screen-disabled-mask");
				}, delayBeforeClosing)

				subject_data_worker.postMessage({ isDialogOn: false });

				resolve();
			}
		});
	}
}