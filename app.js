setTimeout(function(){
	var subData = data_helper.get_subject_data(true);
	var runData = logic.initialize(subData, 'A');

	dom_helper.hide("welcome_msg");

    dom_helper.show("upper_half");
    dom_helper.show("lower_half");   

    var lowerHalfClicked = false;    

    var p1 = new Promise((resolve, reject) => {    	
	    document.getElementById('lower_half').onclick = function() {
	    	if (!lowerHalfClicked) {
	    		// TODO - add click animation
		    	lowerHalfClicked = true;	    		
	    		data_helper.set_subject_data({ subID: jatos.workerId, press1Time: new Date(), time: 'press1' });
	    		resolve();
	    	}
	    };
	});  

	var p2 = new Promise((resolve, reject) => {
	    document.getElementById('upper_half').onclick = function () {
	    	if (lowerHalfClicked) {
	    		// TODO - add click animation
	    		data_helper.set_subject_data({ subID: jatos.workerId, press2Time: new Date(), time: 'press2' });
	    		resolve();
	    	}
	    }
	});  

	Promise.all([p1, p2]).then(function () {
		document.getElementById('lower_half').onclick = undefined;
		document.getElementById('upper_half').onclick = undefined;

		if (!!window.isWin) {
			dom_helper.set_text('welcome_msg_txt', "YESSSS");
		} else {
			dom_helper.set_text('welcome_msg_txt', "NOOOO");
		}
		
		dom_helper.hide("upper_half");
    	dom_helper.hide("lower_half");  
		
		dom_helper.show("welcome_msg");
		data_helper.set_subject_data({ subID: jatos.workerId, endTime: new Date(), time: 'end' });
	});

}, 2000);