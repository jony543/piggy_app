Promise.all([jatos.loaded(), wait(2000)]).then(function() {
	// get custom settings for component and batch
	var settings = Object.assign({ }, app_settings, jatos.componentJsonInput, jatos.batchJsonInput);

	// get subject data from batch session
	var subData = data_helper.get_subject_data(true);

	// calculate run parameters
	var runData = logic.initialize(subData, settings); 

	data_helper.append_subject_data(runData).then(function () {
		if (runData.isFirstTime) {
			jatos.goToComponent("instructions");
			return;
		}

		dom_helper.hide("welcome_msg");

	    dom_helper.show("upper_half");
	    dom_helper.show("lower_half");   

	    var lowerHalfClicked = false;    

	    var p1 = new Promise((resolve, reject) => {
		    document.getElementById('lower_half').onclick = function() {
		    	if (!lowerHalfClicked) {
		    		// TODO - add click animation			    	    	
		    		data_helper.append_subject_data({ press1Time: new Date() })
		    			.then(function () { 
	    					lowerHalfClicked = true;
		    				resolve(); 
		    			});
		    	}
		    };
		});  

		var p2 = new Promise((resolve, reject) => {
		    document.getElementById('upper_half').onclick = function () {
		    	if (lowerHalfClicked) {
		    		// TODO - add click animation
		    		data_helper.append_subject_data({ press2Time: new Date() })
		    			.then(function () { 
		    				resolve(); 
		    			});
		    	}
		    }
		});  

		Promise.all([p1, p2]).then(function () {
			document.getElementById('lower_half').onclick = undefined;
			document.getElementById('upper_half').onclick = undefined;

			if (runData.isWin) {
				dom_helper.set_text('welcome_msg_txt', "YESSSS");
			} else {
				dom_helper.set_text('welcome_msg_txt', "NOOOO");
			}
			
			dom_helper.hide("upper_half");
	    	dom_helper.hide("lower_half");  
			
			dom_helper.show("welcome_msg");

			// collect end time and save subject data as results
			data_helper.append_subject_data({ subID: jatos.workerId, endTime: new Date(), time: 'end' })
				.then(function () {
					var subData = data_helper.get_subject_data(false);
					var runData = subData[jatos.studyResultId];

					// TODO - consider turning it to csv at this point

					jatos.appendResultData(runData).then(function () {
						console.log('finished');
					});
				});
		});
	});
});