async function run_coin_collection(settings, runData) {

	// ========================================================
	// 						FUCNTIONS
	// ========================================================
	function elementClickedFunc() {
		caveElements.filter((el) => el.clone_id === this.id)[0].clickTime.push(new Date()); // record the pressing time

		subject_data_worker.postMessage({
			coins_task_caveElements_state: caveElements
		});

		dom_helper.add_css_class(this.id, 'disappearGradually'); // make stimulus desappear gradually
		setTimeout(() => dom_helper.add_css_class(this.id, 'hidden'), settings.element_disappearing_time); // remove stimulus
		if (!caveElements.filter((el) => !el.clickTime.length).length) { // check if all elements were collected
			endCoinCollectionTask(timeCounter, secsLeft)
		}
	}

	// when finish the task:
	function endCoinCollectionTask(timeCounter, secsLeft) {
		clearInterval(timeCounter) // stop the counter
		subject_data_worker.postMessage({
			coin_task_finish_status: {
				finish_time: new Date(),
			}
		});
		dom_helper.set_text('cave_goddbye_message', settings.finishMessage)
		if (!secsLeft) {// if time is up clear the reamined stimuli from the screen
			var caveElementsArray = document.getElementsByClassName('caveElement')
			for (var i = 0; i < caveElementsArray.length; i++) {
				caveElementsArray[i].classList.add('hidden')
			}
		}
		setTimeout(() => {
			dom_helper.add_css_class('inside_cave_img', 'closing')
			dom_helper.hide('time_left_counter')
			dom_helper.hide('cave_goddbye_message')
		}, 1000)
		setTimeout(() => {
			dom_helper.hide('inside_cave_img')
			finishTrial(runData)
		}, 2500);
	}

	// ========================================================
	// 			INITIALIZE STUFF AND APPLY APPEARANCE
	// ========================================================
	// defin main array:
	let caveElements = [];

	// remove outcome related stuff from the screen:
	dom_helper.hide('outcome_win')
	dom_helper.hide('outcome_no_win')
	dom_helper.hide('superimposed_outcome_sum')
	dom_helper.hide('outcome_text_1_')
	// reveal the cave from inside:
	dom_helper.show('inside_cave_img', 'openning')
	await delay(settings.openningAnimTime);

	// place time left counter text and then get font relevant secs counter sizes (in px):
	secsLeft = settings.duration
	dom_helper.set_text('time_left_counter', secsLeft)
	const text_size = parseFloat(window.getComputedStyle(document.getElementById('time_left_counter'), null).getPropertyValue('font-size'));
	const counterXposition = parseFloat(window.getComputedStyle(document.getElementById('time_left_counter'), null).getPropertyValue('left'));
	const counterYposition = parseFloat(window.getComputedStyle(document.getElementById('time_left_counter'), null).getPropertyValue('top'));

	// setting stimuli size and apply them:
	stimW = innerWidth * settings.stimSizeProportionOfScreen;
	stimH = stimW * settings.outcomeImageHeightWidthRatio;
	document.getElementById('cave_coin').style.width = stimW + 'px'
	document.getElementById('cave_coin').style.height = stimH + 'px'
	if (settings.includeRocks) {
		document.getElementById('cave_rock').style.width = stimW + 'px'
		document.getElementById('cave_rock').style.height = stimH + 'px'
	}

	// limit nStim to half the theoretical max amount:
	nStim = Math.min(settings.nStim, 0.5 * Math.floor((innerHeight * innerWidth) / (stimH * stimW)) - 1); // Rani: I added -1 to the theoretical max amount to cover for the lack of stimulus on the time counter.

	// ========================================================
	// 						RUN THE TASK
	// ========================================================
	// save initial data and meta-data:
	subject_data_worker.postMessage({
		coins_task_init_data: {
			innerWidth,
			innerHeight,
			nStim,
			stimW,
			stimH,
			start_time: new Date(),
		}
	});

	// Set the stimuli arrays (with position, type, and initialized clickTime) and place the stimuli:
	const n_stimuli = settings.includeRocks ? 2 : 1;
	for (var i = 0; i < nStim; i++) {
		var x = Math.random() * (innerWidth - stimW);
		var y = Math.random() * (innerHeight - stimH);
		if (caveElements.some(el => Math.abs(x - el.x) <= stimW && Math.abs(y - el.y) <= stimH) || // making sure they are not going over each other
			(x > (counterXposition - stimW - 0.75 * text_size) && y < (counterYposition + 0.75 * text_size))) { //making sure they do not cover the remaining time counter.
			i -= 1
		} else {
			if (i % n_stimuli) {
				caveElement = 'rock'
			} else {
				caveElement = 'coin'
			}
			var clone_id = dom_helper.duplicateSerially('cave_' + caveElement, i)
			caveElements.push({ x: x, y: y, type: caveElement, clickTime: [], clone_id: clone_id });
			document.getElementById(clone_id).style.left = x + 'px'
			document.getElementById(clone_id).style.top = y + 'px'
			document.getElementById(clone_id).onclick = elementClickedFunc;	// set onclick function:
			dom_helper.show(clone_id)
		}
	}

	// Time Left Counter:
	var timeCounter = setInterval(() => {
		secsLeft--
		dom_helper.set_text('time_left_counter', secsLeft)
		if (secsLeft == 0) {
			endCoinCollectionTask(timeCounter, secsLeft)
		};
	}, 1000);
}

//// maybe usefull for later analysis (will be needed to be modified a bit with the variable types and names
//// number_of_clicks_OFF_target:
//sumOfClickesOnTargets = caveElements.map((x)=>x.clickTime.length).reduce((a,b)=>a+b,0)
//// get the press events in the relevant time window:
//pressEvents.filter((x)=>x.pressTime>coins_task_init_data.start_time && x.pressTime<=coin_task_finish_status.finish_time)
