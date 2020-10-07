var dom_helper = {
	show: function (id) {
		this.remove_css_class(id, "hidden");
	},
	hide: function (id) {
		this.add_css_class(id, "hidden");
	},
	add_css_class: function(id, css_class) {
		document.getElementById(id).classList.add(css_class);
	},
	remove_css_class: function(id, css_class) {
		document.getElementById(id).classList.remove(css_class);
	},
	set_text: function(id, text) {
		document.getElementById(id).innerHTML = text;
	}
};

function dateDiff(date1, date2) {
	date1.setHours(0, 0, 0, 0);
	date2.setHours(0, 0, 0, 0);
	const diffTime = Math.abs(date2 - date1);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	// console.log(diffTime + " milliseconds");
	// console.log(diffDays + " days");
	return diffDays;
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

// for debug
if (!window.jatos) {
	window.mock_batchSession = {};

	window.jatos = {
		appendResultData: function(resultData) {
			console.log('This results would have been sent to jatos server:')
			console.log(resultData);
		},
		batchSession: { 
			get: function(v) { 
				var x = localStorage.getItem(v);
				if (!!x) 
					return JSON.parse(x);
				else 
					return undefined;
			}, // function () { return "NoDataYet"; },
			set: function(i, v) { return localStorage.setItem(i, JSON.stringify(v)) }, //function () { return Promise.resolve('mock'); }
		},
		workerId: 1,
		studyResultId: Date.now(),
	}
};

var data_helper = {
	get_subject_data: function(asArray) {
		var subjectData = jatos.batchSession.get(jatos.workerId + "_data");

		if (!!asArray) {
			arr = []; for (v in subjectData) { arr.push(v); }
			return arr;
		} else {
			return (!!subjectData)? subjectData : {};
		}
	},
	set_subject_data: function(data) { // returns promise
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