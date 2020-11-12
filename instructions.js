// ****************************************************************
//                           FUNCTIONS:
// ----------------------------------------------------------------
var check_consent = function (elem) {
	if (document.getElementById('consent_checkbox').checked) {
		return true;
	}
	else {
		alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
		return false;
	}
	return false;
};

function exitAppDemo(appDemoID) {
	console.log('Exit THE APP')
	dom_helper.remove_css_class(appDemoID, 'appOpen');
	dom_helper.add_css_class(appDemoID, 'appClose');
	wait(1000).then(() => dom_helper.hide(appDemoID));
	appClosed = true; // this to indicate that the app is closed
	firstAppClosedDetection = true;
}

function loadAppDemo() {
	// first set the stuff to check when embedded app finshed running:
	var subData = data_helper.get_subject_data(true);
	var target_n_data_points = !!Object.keys(subData).length ? subData.day.length + 1 : 1; // accounting for when there is no data yet

	checkReady(target_n_data_points)

	debugger
	var demoUrl = "/experiments/publix/" + jatos.studyId + "/start?" +
		"batchId=" + jatos.batchId +
		"&personalMultipleWorkerId=" + jatos.workerId;
	if (!!jatos.isLocahost) {
		var demoUrl = "index.html";
	}

	if (!document.getElementById("embedded_app")) { //i.e. it's the first time
		// embed the app for demo purposes:
		appDemoID = "embedded_app";
		embeddedElement = document.createElement('object');
		embeddedElement.setAttribute("id", appDemoID)
		embeddedElement.setAttribute("data", demoUrl)
		embeddedElement.className = "bigRectangle"
		document.body.appendChild(embeddedElement)
	} else {
		var appDemoID = dom_helper.duplicate('embedded_app');
		var duplicatedElement = document.getElementById(appDemoID);
		duplicatedElement.setAttribute("data", demoUrl)
	}

	dom_helper.remove_css_class(appDemoID, 'appClose');
	dom_helper.add_css_class(appDemoID, 'appOpen');
	dom_helper.show(appDemoID);
	dom_helper.hide('demoExitButton')

	appClosed = false; // this to indicate that the app is closed
	return appDemoID
}


function checkReady(target_n_data_points) {
	var subData = data_helper.get_subject_data(true);
	var current_n_data_points = !!Object.keys(subData).length ? subData.day.length : 0; // accounting for when there is no data yet

	if (current_n_data_points === target_n_data_points && !!subData.endTime[subData.endTime.length - 1]) { // check again while there is no new data point and while it has no value for endTime
		wait(2000).then(() => {
			dom_helper.show('demoExitButton')
			dom_helper.remove_css_class('demoExitButton', 'disabled');
		});
	} else {
		setTimeout('checkReady(' + target_n_data_points + ')', 300);
	}
}

function createSmartphoneApperance() {
	// create text above the "smartphone sketch":
	demoText = document.createElement('h1');
	demoText.setAttribute("id", "mainDemoText");
	demoText.setAttribute("class", "demoText");
	demoText.appendChild(document.createTextNode(app_settings.demoCycleSupportingText[0]));
	// making the text box
	demoTextBox = document.createElement('div');
	demoTextBox.setAttribute("id", "mainDemoTextBox");
	demoTextBox.setAttribute("class", "demoTextBox");

	demoTextBox.appendChild(demoText);
	document.body.appendChild(demoTextBox);

	// outer rectangle:
	outerRectangle = document.createElement('div');
	outerRectangle.setAttribute("id", "outerRectangle");
	outerRectangle.setAttribute("class", "bigRectangle");
	// inner rectangles:
	innerRectangle = document.createElement('div');
	innerRectangle.setAttribute("id", "innerRectangle");
	innerRectangle.setAttribute("class", "smallRectangle");
	// put the inner rectangle in the outer rectangle
	outerRectangle.appendChild(innerRectangle);
	document.body.appendChild(outerRectangle);
	// duplicate the small rectangles
	for (i = 0; i < 13; i++) {
		dom_helper.duplicate('innerRectangle');
	}
	// add the icon element:
	appIconElement = document.createElement('img');
	appIconElement.setAttribute("id", "appIcon");
	appIconElement.setAttribute("class", "appIconSpecifics");
	appIconElement.setAttribute("src", "icons/android-icon-72x72.png");
	outerRectangle.appendChild(appIconElement);
	// another app:
	dom_helper.duplicate('innerRectangle');
	// draw a line:
	lineElement = document.createElement('hr');
	outerRectangle.appendChild(lineElement);
	// add another 5 regular rectangles:
	for (i = 0; i < 4; i++) {
		dom_helper.duplicate('innerRectangle');
	}
}

function createExitAppButton(elementIdName) {
	// button of exit the app:
	exitAppElement = document.createElement('button');
	exitAppElement.setAttribute("id", elementIdName);
	exitAppElement.setAttribute("onclick", "exitAppDemo(appDemoID)");
	//exitAppElement.appendChild(document.createTextNode("Exit the app"));
	document.body.appendChild(exitAppElement);
	dom_helper.add_css_class(elementIdName, 'demoButton');
	dom_helper.add_css_class(elementIdName, 'disabled');
}

function createLoadAppButton(elementIdName) {
	// button of openning the app:
	loadTheAppElement = document.createElement('button');
	loadTheAppElement.setAttribute("id", elementIdName);
	loadTheAppElement.setAttribute("onclick", "appDemoID = loadAppDemo()");
	loadTheAppElement.setAttribute("class", "loadButton");
	//loadTheAppElement.appendChild(document.createTextNode("Enter the app"));
	document.body.appendChild(loadTheAppElement);

	var appIconPosition = document.getElementById('appIcon').getBoundingClientRect()
	document.getElementById(elementIdName).style.top = String(appIconPosition.top) + "px"
	document.getElementById(elementIdName).style.left = String(appIconPosition.left) + "px"
	document.getElementById(elementIdName).style.height = String(appIconPosition.height) + "px"
	document.getElementById(elementIdName).style.width = String(appIconPosition.width) + "px"
}

function removeSmartphoneApperance(appDemoID) {
	//document.getElementById(appDemoID).remove();
	document.getElementById("outerRectangle").remove();
	document.getElementById("demoExitButton").remove();
	document.getElementById("demoLoadButton").remove();
}

// ****************************************************************
//                     INITIALIZE VARIABLES:
// ---------------------------------------------------------------
var appClosed = null; //indicator for when the embedded app is closed or open during the demo.
var firstAppClosedDetection = null; // indicator for when change the instruction above the embedded demo app.
var instructions_page = 1;
var mainDemoTextDuplicateID = "mainDemoTextBox";
// ****************************************************************
//                           PIPELINE:
// ---------------------------------------------------------------
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

	////// up to this point I copied it from the app.js ///////// **
	subject_data_worker.postMessage({ instructionsStartedFlag: true }); // this is used to restart the demo cycle.
	///

	var timeline = [];

	// SET INFORMED CONSENT:
	//------------------------------------------------------
	var consentForm = {
		type: 'external-html',
		url: "informed_consent.html",
		cont_btn: "start",
		check_fn: check_consent
	};

	// SET WRITTEN INSTRUCTIONS:
	//------------------------------------------------------
	var instructions = {
		data: {
			trialType: 'instruction',
		},
		type: 'html-button-response',
		trial_duration: undefined, // no time limit
		choices: ['המשך', 'חזור'],
		timeline: [
			{
				stimulus: '',
				on_load: function () {
					document.body.style.backgroundImage = "url('images/instructions/instructions_" + String(instructions_page) + ".jpg')";
					document.getElementById("instructionsButtons").disabled = true;
					document.getElementById("instructionsButtons").style.opacity = "0.5";
					setTimeout(function () {
						document.getElementById("instructionsButtons").disabled = false
						document.getElementById("instructionsButtons").style.opacity = "1";
					}, 1500);
				}
			}
		],
		button_html: '<button id="instructionsButtons">%choice%</button>',
	};
	var instructionsLoop = {
		timeline: [instructions],
		loop_function: function (data) {
			var goBack = !!Number(jsPsych.data.get().last().select('button_pressed').values[0]); // check if participant pressed to go back (or 'next')
			if (!(instructions_page % settings.n_instruction_pages) && !goBack) { // check if there went through the entire pages of the instructions (and they didn't want to go a page back)
				document.body.style.backgroundImage = "none"
				document.body.style.backgroundColor = "transparent"
				instructions_page = 1; // initialize it to the original value in case instructions will be carried out again,
				return false;
			} else {
				if (goBack && instructions_page > 1) {
					instructions_page--
				} else if (!goBack) {
					instructions_page++
				}
				return true;
			}
		}
	};

	// SET DEMO STUFF:
	//------------------------------------------------------
	var demo = {
		type: 'call-function',
		func: function () {
			// Operate the embedded demo:
			createSmartphoneApperance()
			createExitAppButton(elementIdName = 'demoExitButton')
			createLoadAppButton(elementIdName = 'demoLoadButton')
		},
	};
	var checkIfDemoCompleted = {
		data: {
			trialType: 'checkIfDemoCompleted',
		},
		type: 'html-keyboard-response',
		trial_duration: 400, // check every 0.4s
		choices: jsPsych.NO_KEYS,
		stimulus: '',
	};
	var demo_cycle_loop = {
		timeline: [checkIfDemoCompleted],
		loop_function: function (data) {
			var subData = data_helper.get_subject_data(true);
			// construct here the demo instructions:
			if (!!Object.keys(subData).length &&
				!!subData.endTime[subData.endTime.length - 1] && // Also making sure this trial has ended
				appClosed && // app was closed
				firstAppClosedDetection) {  // first detection after app was closed
				var oldMainDemoTextDuplicateID = mainDemoTextDuplicateID
				mainDemoTextDuplicateID = dom_helper.duplicate(oldMainDemoTextDuplicateID);
				dom_helper.removeElement(oldMainDemoTextDuplicateID)
				dom_helper.set_text('mainDemoText', settings.demoCycleSupportingText[(subData.demoTrialNum[subData.demoTrialNum.length - 1] % Object.keys(settings.demoCycle).length) + 1])
				dom_helper.show(mainDemoTextDuplicateID)
				console.log(settings.demoCycleSupportingText[(subData.demoTrialNum[subData.demoTrialNum.length - 1] % Object.keys(settings.demoCycle).length) + 1])
				firstAppClosedDetection = false;
			}
			// check if demo cycle is finished:
			if (!!Object.keys(subData).length &&
				subData.demoTrialNum[subData.demoTrialNum.length - 1] % Object.keys(settings.demoCycle).length === (Object.keys(settings.demoCycle).length - 1) && // checking that this is the last trial in the demo cycle;
				!!subData.endTime[subData.endTime.length - 1] && // Also making sure this trial has ended
				appClosed) {  // app was closed
				appClosed = false; // this is made just to prevent entering the loop withought going through demo again when desired by the participant				
				dom_helper.removeElement(mainDemoTextDuplicateID) // remove demo text
				mainDemoTextDuplicateID = "mainDemoTextBox" // initialize in case user choose another round
				wait(300).then(() => removeSmartphoneApperance());
				syncWait(750)
				return false;
			} else {
				return true;
			}
		}
	};

	var continue_or_repeat_demo_cycle = {
		data: {
			trialType: 'continue_or_repeat_demo_cycle',
		},
		type: 'html-button-response',
		trial_duration: undefined, // no time limit
		choices: ['Repeat', 'Continue'],
		button_html: '<button id="repeatOrContinueButtons">%choice%</button>',
		timeline: [
			{
				stimulus: '<p id="repeatOrContinueText">Do you want to continue?</p>',
			}
		]
	};
	var big_demo_loop = {
		timeline: [demo, demo_cycle_loop, continue_or_repeat_demo_cycle],
		loop_function: function (data) {
			console.log('YYYYY')
			const subPressedContinue = !!Number(jsPsych.data.get().last().select('button_pressed').values[0]);
			if (subPressedContinue) { // checking that this is the last trial in the demo cycle; Also making sure this trial has ended	
				return false;
			} else {
				// Operate the embedded demo:
				return true;
			}
		}
	}

	// SET TEST:
	//------------------------------------------------------
	var test = {
		data: {
			trialType: 'test',
		},
		type: 'html-button-response',
		trial_duration: undefined, // no time limit
		timeline: [
			{
				stimulus: '<h1>Q 1</h1>',
				choices: () => shuffle(['A', 'B', 'C', 'D']),
				on_finish: function (data) {
					data.correct = data.button_pressed == this.choices.indexOf('B'); // option B
				}
			},
			{
				stimulus: '<h1>Q 2</h1>',
				choices: () => shuffle(['A', 'B', 'C', 'D']),
				on_finish: function (data) {
					data.correct = data.button_pressed == this.choices.indexOf('D'); // option D
				}
			},
			{
				stimulus: '<h1>Q 3</h1>',
				choices: () => shuffle(['A', 'B', 'C', 'D']),
				on_finish: function (data) {
					data.correct = data.button_pressed == this.choices.indexOf('A'); // option A
				}
			}
		]
	};

	// SET THE MAIN LOOP OF THE TUTORIAL:
	//------------------------------------------------------
	var completeTutorialLoop = {
		timeline: [instructionsLoop, big_demo_loop, test],
		loop_function: function (data) {
			// check if there is a single mistake return to start
			const lastTrialIndex = jsPsych.data.get().last().select('trial_index').values[0];
			const relevantData = jsPsych.data.get().filterCustom(x => x.trial_index > lastTrialIndex - test.timeline.length) // test.timeline.length gets the number of questions in the quiz.
			if (relevantData.filter({ trialType: 'test', correct: false }).count() > 0) {
				return true;
			} else {
				return false;
			}
		}
	};

	timeline.push(consentForm);
	timeline.push(completeTutorialLoop);

	jatos.onLoad(function () {
		jsPsych.init({
			timeline: timeline,
			//display_element: 'jspsych-display-element',
			on_finish: function () {

				// saving the data
				subject_data_worker.postMessage({ Instructions_Data: { ...jsPsych.data.get().values() } }) // save the instructions data
				subject_data_worker.postMessage({ completedInstructions: true });

					terminate_subject_data_worker = true;
				}
			});
	});
});
