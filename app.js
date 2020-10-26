jatos.loaded().then(function () {
	// get custom settings for component and batch
	var settings = Object.assign({}, app_settings, jatos.componentJsonInput, jatos.batchJsonInput);

	// get subject data from batch session
	var subData = data_helper.get_subject_data(true);

	// calculate run parameters
	var runData = logic.initialize(subData, settings);

	data_helper.append_subject_data(runData).then(function () {
		if (runData.isFirstTime) {
			jatos.goToComponent("instructions");
			return;
		}

		if (runData.resetContainer) { // activating reseting container when relevant. **
			console.log('A')
			data_helper.append_subject_data({ resetContainer: false })
				.then(() => {
					console.log('B')
					getConfirmation(settings.text.rewardContainerClearingMessage + settings.text.confirmationCodeTextMessage, 'prompt');
				})
				.then(() => {
					data_helper.append_subject_data({ resetContainer: true })
					console.log('C')
				})
		}

		// show cost on top right corner if needed
		if (!!logic.getCost(runData, settings, logic.cost_on.entrance)) {
			dom_helper.set_text('cost_indicator', "-" + logic.getCost(runData, settings, lgic.cost_on.entrance));
			dom_helper.blink('cost_indicator', 1000);
		}

		wait(settings.durations.entranceMessage).then(() => { // **
			dom_helper.hide("welcome_msg");

			dom_helper.show("upper_half");
			dom_helper.show("lower_half");
		})

		var lowerHalfClicked = false;

		var p1 = new Promise((resolve, reject) => {
			document.getElementById('lower_half').onclick = function () {
				if (!lowerHalfClicked) {
					dom_helper.remove_css_class('lower_half', 'blinkable');

					data_helper.append_subject_data({ press1Time: new Date() })
						.then(function () {
							dom_helper.add_css_class('upper_half', 'blinkable');
							lowerHalfClicked = true;
							resolve();
						});
				}
			};
		});

		var p2 = new Promise((resolve, reject) => {
			document.getElementById('upper_half').onclick = function () {
				if (lowerHalfClicked) {
					dom_helper.remove_css_class('upper_half', 'blinkable');
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
				data_helper.append_subject_data({ outcomeTime: new Date() })
				// register outcome viewing after e.g., 250ms: **
				wait(settings.durations.minTimeToIndicateOutcomeViewing).then(() => data_helper.append_subject_data({ viewedOutcome: true }));

				wait(settings.durations.manipulationAnim).then(function () { // show winning message for 2 seconds 				
					if (runData.activateManipulation) {
						dom_helper.hide("welcome_msg");

						data_helper.append_subject_data({ manipulationAlertTime: new Date() }) // **
						getConfirmation(settings.text.manipulationMessage(runData.manipulationToday), 'alert'); //**
						data_helper.append_subject_data({ manipulationConfirmationTime: new Date() }) // **

						if (runData.manipulationToday == 'devaluation') {
							dom_helper.show("piggy_full");
							dom_helper.add_css_class('piggy_full', 'dance');
						}
						if (runData.manipulationToday == 'still_valued') {
							dom_helper.show("piggy_half");
							dom_helper.add_css_class('piggy_full', 'dance');
						}
				wait(2000).then(function () { // show winning/loosing message for 2 seconds
					var devaluationOption = logic.isDevaluation(runData, settings);

					if (devaluationOption == 'devaluation') {
						dom_helper.hide("welcome_msg");
						dom_helper.show("piggy_full");
						dom_helper.add_css_class('piggy_full', 'dance');
					}
					if (devaluationOption == 'still_valued') {
						dom_helper.hide("welcome_msg");
						dom_helper.show("piggy_half");
						dom_helper.add_css_class('piggy_full', 'dance');
					}

					// collect end time and save subject data as results
					data_helper.append_subject_data({ endTime: new Date() }).then(function () {
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
	});
});