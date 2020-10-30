jatos.loaded().then(function () {
	var terminate_subject_data_worker = false;
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

	// assign animation times according to settings:
	document.getElementById('cost_indicator_1_').style.animationDuration = String(settings.durations.costAnim / 1000) + 's' // **	
	document.getElementById('outcome_win').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's' // **
	document.getElementById('outcome_no_win').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's' // **
	document.getElementById('outcome_text_1_').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's' // **

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

	////
	if (runData.hideOutcome) {
		dom_helper.show("cover");
	}
	////

	// show cost on top right corner if needed [At entrance]
	if (!!logic.getCost(runData, settings, logic.cost_on.entrance)) {
		var indicator_id = dom_helper.duplicate('cost_indicator_1_');
		dom_helper.set_text(indicator_id, "-" + logic.getCost(runData, settings, logic.cost_on.entrance));
		dom_helper.show(indicator_id);
	}

	wait(settings.durations.entranceMessage).then(() => { // **
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

				// show cost on top right corner if needed [After 1st click]
				if (!!logic.getCost(runData, settings, logic.cost_on.entrance)) {
					var indicator_id = dom_helper.duplicate('cost_indicator_1_');
					dom_helper.set_text(indicator_id, "-" + logic.getCost(runData, settings, logic.cost_on.click1));
					dom_helper.show(indicator_id);
				}

				document.getElementById('ice_lower').style.animationDuration = String(settings.durations.surface_disappearance / 1000) + 's' // **
				document.getElementById('ice_lower').style.animationName = "ice_breaking"; // **

				dom_helper.add_css_class('upper_half', 'blinkable');
				lowerHalfClicked = true;
				resolve();
			}
		}
	});

	var p2 = new Promise((resolve, reject) => {
		document.getElementById('upper_half').onclick = function () {
			if (lowerHalfClicked) {
				dom_helper.remove_css_class('upper_half', 'blinkable');

				subject_data_worker.postMessage({ press2Time: new Date() });

				// show cost on top right corner if needed [After 2nd click]
				if (!!logic.getCost(runData, settings, logic.cost_on.entrance)) {
					var indicator_id = dom_helper.duplicate('cost_indicator_1_');
					dom_helper.set_text(indicator_id, "-" + logic.getCost(runData, settings, logic.cost_on.click2));
					dom_helper.show(indicator_id);
				}

				document.getElementById('ice_upper').style.animationDuration = String(settings.durations.surface_disappearance / 1000) + 's' // **
				document.getElementById('ice_upper').style.animationName = "ice_breaking" // **

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
			'<img id="lottery" class="waiting_for_outcome_gif" src="images/lottery.gif"/>');

		wait(settings.durations.waitingForOutcomeAnim).then(function () { // wait until gif animation is finished
			dom_helper.hide("lottery");

			if (runData.isWin) {
				dom_helper.set_text('outcome_text_1_', "You won " + runData.reward.toFixed(2) + "$"); //**
				dom_helper.show('outcome_win', settings.durations.outcomeAnim); // **
				dom_helper.add_css_class('outcome_win', 'goUpOutcomeImage'); // **
			} else {
				dom_helper.set_text('outcome_text_1_', "You didn't win");
				dom_helper.show('outcome_no_win', settings.durations.outcomeAnim); // **
				dom_helper.add_css_class('outcome_no_win', 'goUpOutcomeImage'); // **
			}

			dom_helper.show("outcome_text_1_", settings.durations.outcomeAnim);
			dom_helper.add_css_class('outcome_text_1_', 'appearSlowlyOutcomeText'); // **

			// get time of outcome presentation: **
			subject_data_worker.postMessage({ outcomeTime: new Date() });

			// register outcome viewing after 250ms: **
			wait(settings.durations.minTimeToIndicateOutcomeViewing).then(() => {
				subject_data_worker.postMessage({ viewedOutcome: true });
			});


			wait(settings.durations.outcomeAnim).then(function () { // show winning/loosing message for 2 seconds
				var manipulationOption = logic.isManipulation(runData, settings);

				if (manipulationOption) {
					dom_helper.hide("welcome_msg");

					subject_data_worker.postMessage({ manipulationAlertTime: new Date() }) // **
					getConfirmation(settings.text.manipulationMessage(manipulationOption), 'alert'); //**
					subject_data_worker.postMessage({ manipulationConfirmationTime: new Date() }) // **

					if (manipulationOption == 'devaluation') {
						dom_helper.show("piggy_full");
						dom_helper.add_css_class('piggy_full', 'dance');
					}

					if (manipulationOption == 'still_valued') {
						dom_helper.show("piggy_half");
						dom_helper.add_css_class('piggy_half', 'dance');
					}
				}

				///
				//debugger
				dom_helper.add_css_class('welcome_msg', 'goodByeMessage'); // **
				dom_helper.set_text('welcome_msg_txt', "See you next time"); //**
				dom_helper.show('welcome_msg'); // **
				////
				///

				// collect end time and save subject data as results
				subject_data_worker.postMessage({ endTime: new Date() });
				terminate_subject_data_worker = true;
			});
		});
	});
});