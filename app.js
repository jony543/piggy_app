jatos.loaded().then(function () {
	// get custom settings for component and batch
	var settings = Object.assign({}, app_settings, jatos.componentJsonInput, jatos.batchJsonInput);

	// get subject data from batch session
	var subData = data_helper.get_subject_data(true);

	// calculate run parameters
	var runData = logic.initialize(subData, settings);

	// assign animation times according to settings:
	document.getElementById('cost_indicator').style.animationDuration = String(settings.durations.costAnim/1000) + 's' // **	

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

		// show cost on top right corner if needed [At entrance]
		if (!!logic.getCost(runData, settings, logic.cost_on.entrance)) {
			dom_helper.set_text('cost_indicator', "-" + logic.getCost(runData, settings, logic.cost_on.entrance));
			dom_helper.blink('cost_indicator', settings.durations.costAnim);
			dom_helper.add_css_class('cost_indicator', 'goUpEntrance');
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

					// show cost on top right corner if needed [After 1st click]
					if (settings.cost.isCostPerPress && !!logic.getCost(runData, settings, logic.cost_on.click1)) {
						dom_helper.set_text('cost_indicator', "-" + logic.getCost(runData, settings, logic.cost_on.click1));
						dom_helper.blink('cost_indicator', settings.durations.costAnim);
						dom_helper.add_css_class('cost_indicator', 'goUpClick1');
					}

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

					// show cost on top right corner if needed [After 2nd click]
					if (settings.cost.isCostPerPress && !!logic.getCost(runData, settings, logic.cost_on.click2)) {
						dom_helper.set_text('cost_indicator', "-" + logic.getCost(runData, settings, logic.cost_on.click2));
						dom_helper.blink('cost_indicator', settings.durations.costAnim);
						dom_helper.add_css_class('cost_indicator', 'goUpClick2');
					}

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
					dom_helper.set_text('welcome_msg_txt', "You won " + runData.reward.toFixed(2) + "$"); //**
					dom_helper.blink('gold_coin', 2000); // **
					dom_helper.add_css_class('gold_coin', 'goUpOutcome'); // **
				} else {
					dom_helper.set_text('welcome_msg_txt', "You didn't win");
				}

				dom_helper.show("welcome_msg");

				// get time of outcome presentation: **
				data_helper.append_subject_data({ outcomeTime: new Date() })
				// register outcome viewing after e.g., 250ms: **
				wait(settings.durations.minTimeToIndicateOutcomeViewing).then(() => data_helper.append_subject_data({ viewedOutcome: true }));

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