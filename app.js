(async () => {

	await jatos.loaded();

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
	document.getElementById('superimposed_outcome_sum').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's' // **

	// go to instructinos (if relevant)
	if (runData.showInstructions) { // If there is no data yet (hold for both cases where demo is used or not)
		jatos.goToComponent("instructions");
		return;
	} else if (runData.isFirstTime) { // a message that the real game begins (after instruction [and demo if relevant])
		alert(settings.text.realGameBegins)
	}

	// RANI - please see if this is correct.
	// Also - why send 2 consecutive messages of resetContainer? the second will override the first.
	if (runData.resetContainer) { // activating reseting container when relevant. **
		console.log('A');
		subject_data_worker.postMessage({ resetContainer: false });
		console.log('B');
		await dialog_helper.show(settings.text.rewardContainerClearingMessage);
		subject_data_worker.postMessage({ resetContainer: true })
		console.log('C');
	}

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

	//show spacechip landing animation:
	dom_helper.add_css_class('spaceship', 'landing_spaceship'); // this includes the animation
	dom_helper.show('spaceship');

	// define top & bottom click operations
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


	// hide entrance graphics and start game
	await delay(settings.durations.entranceMessage);
	//dom_helper.hide("welcome_msg");
	dom_helper.hide("spaceship");
	dom_helper.show("upper_half");
	dom_helper.show("lower_half");


	// wait for 2 clicks to happen
	await Promise.all([p1, p2]);


	// hide game and show lottery animation
	document.getElementById('lower_half').onclick = undefined;
	document.getElementById('upper_half').onclick = undefined;

	dom_helper.hide("upper_half");
	dom_helper.hide("lower_half");

	dom_helper.append_html('main_container',
		'<img id="lottery" class="waiting_for_outcome_gif" src="images/lottery.gif"/>');
	document.getElementById('lottery').style.animationDuration = String(settings.durations.waitingForOutcomeAnim / 1000) + 's' // ** // add animation duration


	// wait until gif animation is finished
	await delay(settings.durations.waitingForOutcomeAnim)
	dom_helper.hide("lottery");

	if (!runData.hideOutcome) { // presenting the outcome:
		if (runData.isWin) {
			dom_helper.set_text('outcome_text_1_', "מצאת " + runData.reward + " יחידות זהב"); //**
			dom_helper.show('outcome_win', settings.durations.outcomeAnim); // **
			dom_helper.add_css_class('outcome_win', 'goUpOutcomeImage'); // **
		} else {
			dom_helper.set_text('outcome_text_1_', "לא מצאת זהב הפעם");
			dom_helper.show('outcome_no_win', settings.durations.outcomeAnim); // **
			dom_helper.add_css_class('outcome_no_win', 'goUpOutcomeImage'); // **
		}

		// add a superimposed text on the outcome
		dom_helper.set_text('superimposed_outcome_sum_txt', runData.reward);
		dom_helper.show('superimposed_outcome_sum', settings.durations.outcomeAnim); // **
		dom_helper.add_css_class('superimposed_outcome_sum', 'goUpOutcomeImage'); // **

		// add text about the outcome below
		dom_helper.show("outcome_text_1_", settings.durations.outcomeAnim);
		dom_helper.add_css_class('outcome_text_1_', 'appearSlowlyOutcomeText'); // **
	}

	// get time of outcome presentation: **
	subject_data_worker.postMessage({ outcomeTime: new Date() });

	// register outcome viewing after 250ms: **
	wait(settings.durations.minTimeToIndicateOutcomeViewing).then(() => {
		subject_data_worker.postMessage({ viewedOutcome: true });
	});


	// show winning/loosing message for 2 seconds
	await delay(settings.durations.outcomeAnim);
	var manipulationOption = logic.isManipulation(runData, settings);
	dom_helper.hide("welcome_msg");

	if (manipulationOption) {
		subject_data_worker.postMessage({ manipulationAlertTime: new Date() }) // **
		await dialog_helper.show(settings.text.manipulationMessage(manipulationOption));
		subject_data_worker.postMessage({ manipulationConfirmationTime: new Date() }) // **

		if (manipulationOption == 'devaluation') {
			dom_helper.show("warehouse_full");
			dom_helper.add_css_class('warehouse_full', 'dance');
		}

		if (manipulationOption == 'still_valued') {
			dom_helper.show("warehouse_half");
			dom_helper.add_css_class('warehouse_half', 'dance');
		}
	}

	//** I need to set this: */
	if (runData.consumptionTest) { // If there is no data yet (hold for both cases where demo is used or not)
		await dialog_helper.random_code_confirmation(msg = settings.text.dialog_coinCollection, img_id = 'cave', delayBeforeClosing = 2000); // ** The coins task will run through the helper ** show message about the going to the coin collection task 	
		
		// calling the coin collection task:
		// -----------------------------------
		coinTaskElement = document.createElement('iframe');
		coinTaskElement.setAttribute("id", 'coinTask');
		coinTaskElement.setAttribute("src", 'coin_collection.html');
		coinTaskElement.style.cssText = "position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;";
		document.body.appendChild(coinTaskElement)

		dom_helper.hide('outcome_win')
		dom_helper.hide('outcome_no_win')
		dom_helper.hide('superimposed_outcome_sum')
		dom_helper.hide('outcome_text_1_')

		//jatos.goToComponent("coin_collection");
		//return;
	}

	finishTrial()

})();