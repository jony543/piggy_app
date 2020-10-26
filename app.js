jatos.loaded().then(function () {
	var terminate_subject_data_worker  = false;
	subject_data_worker.done = function (x) { 
		// when all messages are processed save the information as a JATOS result
		if (terminate_subject_data_worker) {
			var subData = data_helper.get_subject_data(false);
			var currentRunData = subData[jatos.studyResultId];
			
			jatos.appendResultData(currentRunData).then(function () {
				console.log('finished');
			});
		}			
	};

	// get custom settings for component and batch
	var settings = Object.assign({}, app_settings, jatos.componentJsonInput, jatos.batchJsonInput);

	// get subject data from batch session
	var subData = data_helper.get_subject_data(true);

	// calculate run parameters
	var runData = logic.initialize(subData, settings);
	subject_data_worker.postMessage(runData);

	if (runData.isFirstTime) {
		jatos.goToComponent("instructions");
		return;
	}
	
	// TO RANI - not sure what the purpose of this code. 
	// Commented for now and will redo when I create new confirmation implementation
	// if (runData.resetContainer) { // activating reseting container when relevant. **
	// 	console.log('A')
	// 	data_helper.append_subject_data({ resetContainer: false })
	// 		.then(() => {
	// 			console.log('B')
	// 			getConfirmation(settings.text.rewardContainerClearingMessage);	
	// 		})
	// 		.then(() => {
	// 			data_helper.append_subject_data({ resetContainer: true })
	// 			console.log('C')
	// 		})
	// }

	// show cost on top right corner if needed
	if (!!logic.getCost(runData, settings, logic.cost_on.entrance)) {
		var indicator_id = dom_helper.duplicate('cost_indicator_1_');
		dom_helper.set_text(indicator_id, "-" + logic.getCost(runData, settings, logic.cost_on.entrance));
		dom_helper.show(indicator_id);
	}

	wait(settings.durations.entranceMessage).then(() => { 
			dom_helper.hide("welcome_msg");

			dom_helper.show("upper_half");
			dom_helper.show("lower_half");
	});

	var lowerHalfClicked = false;

	var p1 = new Promise((resolve, reject) => {
		document.getElementById('lower_half').onclick = function () {
			if (!lowerHalfClicked) {
				dom_helper.remove_css_class('lower_half', 'blinkable');

				subject_data_worker.postMessage({ press1Time: new Date() });

				if (!!logic.getCost(runData, settings, logic.cost_on.click1)) {
					var indicator_id = dom_helper.duplicate('cost_indicator_1_');
					dom_helper.set_text(indicator_id, "-" + logic.getCost(runData, settings, logic.cost_on.click1));
					dom_helper.show(indicator_id);
				}
				
				dom_helper.add_css_class('upper_half', 'blinkable');
				lowerHalfClicked = true;
				resolve();
			}
		};
	});

	var p2 = new Promise((resolve, reject) => {
		document.getElementById('upper_half').onclick = function () {
			if (lowerHalfClicked) {
				dom_helper.remove_css_class('upper_half', 'blinkable');
				
				subject_data_worker.postMessage({ press2Time: new Date() });

				if (!!logic.getCost(runData, settings, logic.cost_on.click2)) {
					var indicator_id = dom_helper.duplicate('cost_indicator_1_');
					dom_helper.set_text(indicator_id, "-" + logic.getCost(runData, settings, logic.cost_on.click2));
					dom_helper.show(indicator_id);
				}

				resolve();
			}
		}
	});

	Promise.all([p1, p2]).then(function () {
		document.getElementById('lower_half').onclick = undefined;
		document.getElementById('upper_half').onclick = undefined;

		dom_helper.hide("upper_half");
		dom_helper.hide("lower_half");

		dom_helper.append_html('main_container',
			'<img id="lottery" class="centered" src="images/lottery.gif"/>');

		wait(settings.durations.waitingForOutcomeAnim).then(function () { // wait until gif animation is finished
			dom_helper.hide("lottery");

			if (runData.isWin) {
				dom_helper.set_text('welcome_msg_txt', "You won " + runData.reward.toFixed(2) + "$");
			} else {
				dom_helper.set_text('welcome_msg_txt', "You didn't win");
			}

			dom_helper.show("welcome_msg");

			// get time of outcome presentation: **
			subject_data_worker.postMessage({ outcomeTime: new Date() });

			// register outcome viewing after 250ms: **
			wait(settings.durations.minTimeToIndicateOutcomeViewing).then(() => { 
				subject_data_worker.postMessage({ viewedOutcome: true });
			});

			wait(settings.durations.manipulationAnim).then(function () { // show winning/loosing message for 2 seconds
				var manipulationOption = logic.isManipulation(runData, settings);

				if (manipulationOption) {
					dom_helper.hide("welcome_msg");

					data_helper.append_subject_data({ manipulationAlertTime: new Date() }) // **
					getConfirmation(settings.text.manipulationMessage(manipulationOption), 'alert'); //**
					data_helper.append_subject_data({ manipulationConfirmationTime: new Date() }) // **
					
					if (manipulationOption == 'devaluation') {
						dom_helper.show("piggy_full");
						dom_helper.add_css_class('piggy_full', 'dance');
					}

					if (manipulationOption == 'still_valued') {
						dom_helper.show("piggy_half");
						dom_helper.add_css_class('piggy_half', 'dance');
					}
				}
				
				// collect end time and save subject data as results
				subject_data_worker.postMessage({ endTime: new Date() });				
				terminate_subject_data_worker = true;
			});
		});
	});
});