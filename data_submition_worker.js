window.subject_data_worker = {
	q: [],
	send_data: function () {
		data_helper.append_subject_data(this.q[0])
			.then((function () { 
				this.q.shift();
				
				if (this.q.length > 0) {
					this.send_data();
				} else {
					!!this.done & this.done();
				}
			}).bind(this))
			.catch((function () { 
				this.send_data();
			}).bind(this));
	},
	postMessage: function (data) {
		this.q.push(data);

		if (this.q.length == 1) {
			this.send_data();
		}			
	},
	done: null
}