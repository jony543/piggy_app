(async () => {
	// ****************************************************************
	//           SET & INITIALIZE STUFF:
	// ----------------------------------------------------------------
	var startTime = new Date(); // Get time of entry:

	var settings = Object.assign({}, app_settings); 	

	// get subject data from batch session *** Temp Bandage by Rani
	var timer = new Date();
	do {
		if (new Date() - timer < 5000) { // In case the data is taken before saving was completed from last session it will try for 5 seconds to get the data again and check that it's fine (measured by having a uniqueEntryID).
			var subData = await data_helper.get_subject_data(true).catch(function (e) { 
				console.log('error getting subject data');
				console.log(e);
			});
		} else {
			Object.keys(subData).forEach(function(key) { // After 5 seconds in case there still no good data from what supposedly was the last run, it is probabale that a problem occured or that no data had the chance to be normally saved and the last "trial/s" will be removed.
			subData[key] = subData[key].slice(0,subData[key].length-1);
			});
		}
	} while (subData.uniqueEntryID.length > 1 && !subData.uniqueEntryID[subData.uniqueEntryID.length-1])

	// calculate run parameters
	var runData = logic.initialize(subData, settings);

	// create new session with server only after logic is called! (important for demo to work)
	data_helper.init_session('app', false);

	// Giving a unique entry ID (should be assigned only once on each entry). Creating it as a global variable:
	if (!subData.uniqueEntryID[subData.uniqueEntryID.length-1]) {// should be assigned once every entry
		uniqueEntryID = 1;
	} else {
		uniqueEntryID = subData.uniqueEntryID[subData.uniqueEntryID.length-1]+1;
	}

	// Save the data and refer to instructions if relevant:
	if (runData.showInstructions) {
		subject_data_worker.postMessage({...runData, startInstructionsTime: startTime, commitSession: true});
		window.location.href = "instructions.html" + location.search; 	// go to instructinos (if relevant) ///dom_helper.goTo('instructions.html');
		return;
	} else {
		subject_data_worker.postMessage({...runData, startTime: startTime, commitSession: true});
	}

	// assign animation times according to settings:
	document.getElementById('cost_indicator_1_').style.animationDuration = String(settings.durations.costAnim / 1000) + 's' // **	
	document.getElementById('outcome_win').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's' // **
	document.getElementById('outcome_no_win').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's' // **
	document.getElementById('outcome_text_1_').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's' // **
	document.getElementById('superimposed_outcome_sum').style.animationDuration = String(settings.durations.outcomeAnim / 1000) + 's' // **

	// ****************************************************************
	//           RUN THE APP
	// ----------------------------------------------------------------

	if (runData.isFirstTime) { // a message that the real game begins (after instruction [and demo if relevant])
		subject_data_worker.postMessage({ realGameBeginsAlertTime: new Date() }) // **
		await dialog_helper.show(settings.text.realGameBegins, img_id = 'game_begins_image', delayBeforeClosing = 0, resolveOnlyAfterDelayBeforeClosing = false);
		subject_data_worker.postMessage({ realGameBeginsConfirmationTime: new Date() }) // **
	}

	// reset the container at the beginning of the day:
	if (runData.resetContainer) { // activating reseting container when relevant. **
		subject_data_worker.postMessage({ resetContainerAlertTime: new Date() }) // **
		await dialog_helper.show(settings.text.rewardContainerClearingMessage, img_id = 'warehouse_empty', delayBeforeClosing = 0, resolveOnlyAfterDelayBeforeClosing = false);
		subject_data_worker.postMessage({ resetContainerConfirmationTime: new Date() }) // **
	}

	// cover the outcome:
	if (runData.hideOutcome) {
		dom_helper.show("cover");
	}

	// show cost on top right corner if needed [At entrance]
	if (!!logic.getCost(runData, settings, logic.cost_on.entrance)) {
		var indicator_id = dom_helper.duplicate('cost_indicator_1_');
		dom_helper.set_text(indicator_id, "-" + logic.getCost(runData, settings, logic.cost_on.entrance));
		dom_helper.show(indicator_id);
		setTimeout(() => dom_helper.hide(indicator_id), settings.durations.costAnim)
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
				if (!!logic.getCost(runData, settings, logic.cost_on.click1)) {
					var indicator_id = dom_helper.duplicate('cost_indicator_1_');
					dom_helper.set_text(indicator_id, "-" + logic.getCost(runData, settings, logic.cost_on.click1));
					dom_helper.show(indicator_id);
					setTimeout(() => dom_helper.hide(indicator_id), settings.durations.costAnim)
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
				if (!!logic.getCost(runData, settings, logic.cost_on.click2)) {
					var indicator_id = dom_helper.duplicate('cost_indicator_1_');
					dom_helper.set_text(indicator_id, "-" + logic.getCost(runData, settings, logic.cost_on.click2));
					dom_helper.show(indicator_id);
					setTimeout(() => dom_helper.hide(indicator_id), settings.durations.costAnim)
				}

				document.getElementById('ice_upper').style.animationDuration = String(settings.durations.surface_disappearance / 1000) + 's' // **
				document.getElementById('ice_upper').style.animationName = "ice_breaking" // **

				resolve();
			}
		}
	});


	// hide entrance graphics and sequence pressing inteface
	await delay(settings.durations.entranceMessage);
	dom_helper.hide("spaceship");
	dom_helper.show("upper_half");
	dom_helper.show("lower_half");

	// For the flow of the demo:
	if (runData.isDemo) {
			subject_data_worker.postMessage({ broadcast: 'sequence entering stage presented' });
	}	

	// wait for 2 clicks to happen
	await Promise.all([p1, p2]);

	// hide sequence pressing inteface and show lottery animation
	document.getElementById('lower_half').onclick = undefined;
	document.getElementById('upper_half').onclick = undefined;

	dom_helper.hide("upper_half");
	dom_helper.hide("lower_half");

	dom_helper.append_html('main_container',
		'<img id="lottery" class="waiting_for_outcome_gif" src="images/lottery.gif"/>');
	document.getElementById('lottery').style.animationDuration = String(settings.durations.lotteryAnim / 1000) + 's' // ** // add animation duration

	// wait until gif animation is finished
	await delay(settings.durations.intervalBetweenLotteryAndOutcomeAnim);
	setTimeout(() => dom_helper.removeElement("lottery"), settings.durations.lotteryAnim - settings.durations.intervalBetweenLotteryAndOutcomeAnim);

	if (!runData.hideOutcome) { // presenting the outcome:
		if (runData.isWin) {
			var outcomeText = "מצאת " + runData.reward + " יחידות זהב"
			var outcomeElementID = 'outcome_win'
		} else {
			var outcomeText = "לא מצאת זהב הפעם"
			var outcomeElementID = 'outcome_no_win'
		}

		// show outcome:
		dom_helper.show(outcomeElementID, settings.durations.outcomeAnim); // **
		dom_helper.add_css_class(outcomeElementID, 'goUpOutcomeImage'); // **

		// add a superimposed text on the outcome:
		dom_helper.set_text('superimposed_outcome_sum_txt', runData.reward);
		dom_helper.show('superimposed_outcome_sum', settings.durations.outcomeAnim); // **
		dom_helper.add_css_class('superimposed_outcome_sum', 'goUpOutcomeImage'); // **

		// add text about the outcome below the outcome image:
		dom_helper.set_text('outcome_text_1_', outcomeText);
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
	await delay(settings.durations.intervalBetweenOutcomeAndNextThing);
	var manipulationOption = logic.isManipulation(runData, settings);

	// activate manipulation notification test:
	if (manipulationOption) {
		subject_data_worker.postMessage({ manipulationAlertTime: new Date() }) // **
		await dialog_helper.random_code_confirmation(msg = settings.text.manipulationMessage(manipulationOption), img_id = settings.manipulationImageID(manipulationOption), delayBeforeClosing = 0, resolveOnlyAfterDelayBeforeClosing = true);
		subject_data_worker.postMessage({ manipulationConfirmationTime: new Date() }) // **
	}

	// activate consumption test:
	if (runData.consumptionTest) { // If there is no data yet (hold for both cases where demo is used or not)
		if (manipulationOption) { await delay(300) } // create a small interval between dialog boxes if they appear one after the other.
		subject_data_worker.postMessage({ foundCaveAlertTime: new Date() }) // **
		await dialog_helper.random_code_confirmation(msg = settings.text.dialog_coinCollection, img_id = 'cave', delayBeforeClosing = 2000, resolveOnlyAfterDelayBeforeClosing = false); // ** The coins task will run through the helper ** show message about the going to the coin collection task 			
		subject_data_worker.postMessage({ foundCaveConfirmationTime: new Date() }) // **
		run_coin_collection(settings.coinCollectionTask, runData)
	} else {
		finishTrial(runData)
	}

})();