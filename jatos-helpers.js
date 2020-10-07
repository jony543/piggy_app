// for debug
if (!window.jatos) {
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
			},
			set: function(i, v) { 
				localStorage.setItem(i, JSON.stringify(v)) 
				return Promise.resolve('finished saving mock batch session');
			}, 
		},		
		onLoad: function(func) {
			func();
		},
		workerId: 1,
		studyResultId: Date.now(),
	}
};

window.jatos.loaded = function () {
	return new Promise((resolve, reject) => {
		jatos.onLoad(function () {
			resolve('jatos is ready');
		});
	});
};