// for debug
if (!window.jatos) {
	window.jatos = {
		appendResultData: function(resultData) {
			console.log('This results would have been sent to jatos server:')
			console.log(resultData);
			return Promise.resolve(resultData);
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
		workerId: '4',
		batchId: '100',
		isLocalhost: true, // if (!!jatos.isLocalhost)
		studyResultId: Date.now(),
		componentList: [{ title: "c1", id: 1 }, { title: "c2", id: 2 }],
		startComponent: function (x) { console.log("should go to component " + x) },
	}
};

Object.assign(jatos, {
	loaded: function () {
		return new Promise((resolve, reject) => {
			jatos.onLoad(function () {
				resolve('jatos is ready');
			});
		});
	},
	goToComponent: function(name) {
		console.log("going to component " + name);
		for (compId in jatos.componentList) {			
			if (jatos.componentList[compId].title == name) {
				jatos.startComponent(jatos.componentList[compId].id);
			}
		}		
	}
});
