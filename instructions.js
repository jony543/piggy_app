// ****************************************************************
//                           FUNCTIONS:
// ----------------------------------------------------------------
var check_consent = function (elem) {
	if (document.getElementById('consent_checkbox').checked) {
		return true;
	}
	else {
		alert("אם ברצונך להשתתף יש לסמן את תיבת הסימון שבסמוך ל'אני מסכימ/ה להשתתף במחקר זה'.");
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
	// check when to present again the button that closes the demo app:
	var subData = data_helper.get_subject_data(true);
	target_n_data_points = !!Object.keys(subData).length ? subData.day.length + 1 : 1; // accounting for when there is no data yet

	var demoUrl = "/experiments/publix/" + jatos.studyId + "/start?" +
		"batchId=" + jatos.batchId +
		"&personalMultipleWorkerId=" + jatos.workerId;
	if (!!jatos.isLocalhost) {
		var demoUrl = "index.html?" +
			"batchId=" + jatos.batchId +
			"&userId=" + jatos.workerId;;
	}


	if (!document.getElementById("embedded_app")) { //i.e. it's the first time
		// embed the app for demo purposes:
		appDemoID = "embedded_app";
		embeddedElement = document.createElement('iframe');
		embeddedElement.setAttribute("id", appDemoID)
		embeddedElement.setAttribute("src", demoUrl)
		embeddedElement.className = "bigRectangle"
		document.body.appendChild(embeddedElement)
	} else {
		var appDemoID = dom_helper.duplicate('embedded_app');
	}

	dom_helper.remove_css_class(appDemoID, 'appClose');
	dom_helper.add_css_class(appDemoID, 'appOpen');
	dom_helper.show(appDemoID);
	dom_helper.hide('demoExitButton')

	appClosed = false; // this to indicate that the app is closed
	firstAppOpennedDetection = true; // this is to indicate when the button to open the was first pressed (for some relevant checks to rely on)
	revealExitButton = true;
	return appDemoID
}

function createSmartphoneApperance() {
	// create text above the "smartphone sketch":
	demoText = document.createElement('h1');
	demoText.setAttribute("id", "mainDemoText");
	demoText.setAttribute("class", "demoText");
	demoText.innerHTML = app_settings.demoCycleSupportingText[0]['a'];
	demoText.appendChild(document.createTextNode(''));
	is_firstDemoScreen_SuportingInstructions_changed_1 = false;
	is_firstDemoScreen_SuportingInstructions_changed_2 = false;
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

function monitorChangesInDemoAndReact(settings) {
	console.log('check...')
	var subData = data_helper.get_subject_data(true);

	// check when to present again the button that closes the demo app:
	// if (firstAppOpennedDetection) { // first set the stuff to check when embedded app finshed running:
	// 	target_n_data_points = !!Object.keys(subData).length ? subData.day.length + 1 : 1; // accounting for when there is no data yet
	// 	firstAppOpennedDetection = false;
	// }
	current_n_data_points = !!Object.keys(subData).length ? subData.day.length : 0; // accounting for when there is no data yet
	if (revealExitButton &&
		current_n_data_points === target_n_data_points
		&& !!subData.endTime[subData.endTime.length - 1]) { // check again while there is no new data point and while it has no value for endTime
		revealExitButton = false;
		wait(2000).then(() => {
			dom_helper.show('demoExitButton')
			dom_helper.remove_css_class('demoExitButton', 'disabled');
		});
	}

	if (!!current_n_data_points) { // if there is data

		// construct the SPECIAL CASE suporting instructions of the FIRST DEMO INTERACTION WITH THE APP which are long and are changed while the embedded app is running:
		if (subData.demoTrialNum[subData.demoTrialNum.length - 1] % Object.keys(settings.demoCycle).length === 0) {  // first demo trial
			if (!is_firstDemoScreen_SuportingInstructions_changed_1 &&
				document.getElementById(appDemoID).contentWindow.document.getElementById("lower_half") && //sometimes it does not exist yet and than an error is occuring on the next line (so this will prevent it)
				!document.getElementById(appDemoID).contentWindow.document.getElementById("lower_half").classList.contains('hidden') // check that the sequecne pressing (i.e., the line showing were to press) is presented				
			) {  // first detection after app was closed
				var oldMainDemoTextDuplicateID = mainDemoTextDuplicateID
				mainDemoTextDuplicateID = dom_helper.duplicate(oldMainDemoTextDuplicateID);
				dom_helper.removeElement(oldMainDemoTextDuplicateID)
				dom_helper.set_text('mainDemoText', app_settings.demoCycleSupportingText[0]['b'])
				dom_helper.show(mainDemoTextDuplicateID)
				is_firstDemoScreen_SuportingInstructions_changed_1 = true;
			}
			if (!is_firstDemoScreen_SuportingInstructions_changed_2 &&
				!!subData.endTime[subData.endTime.length - 1] // check that the trial was completed			
			) {  // first detection after app was closed
				var oldMainDemoTextDuplicateID = mainDemoTextDuplicateID
				mainDemoTextDuplicateID = dom_helper.duplicate(oldMainDemoTextDuplicateID);
				dom_helper.removeElement(oldMainDemoTextDuplicateID)
				dom_helper.set_text('mainDemoText', app_settings.demoCycleSupportingText[0]['c'])
				dom_helper.show(mainDemoTextDuplicateID)
				is_firstDemoScreen_SuportingInstructions_changed_2 = true;
			}
		}

		// construct here the demo instructions:
		if (!!subData.endTime[subData.endTime.length - 1] && // Also making sure this trial has ended
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
		if (subData.demoTrialNum[subData.demoTrialNum.length - 1] % Object.keys(settings.demoCycle).length === (Object.keys(settings.demoCycle).length - 1) && // checking that this is the last trial in the demo cycle;
			!!subData.endTime[subData.endTime.length - 1] && // Also making sure this trial has ended
			appClosed) {  // app was closed
			appClosed = false; // this is made just to prevent entering the loop withought going through demo again when desired by the participant				
			dom_helper.removeElement(mainDemoTextDuplicateID) // remove demo text
			mainDemoTextDuplicateID = "mainDemoTextBox" // initialize in case user choose another round
			wait(500).then(() => removeSmartphoneApperance());
			syncWait(750)
			jsPsych.resumeExperiment();
		} else {
			setTimeout(monitorChangesInDemoAndReact.bind(null, settings), 300)
		}

	}
}

// ****************************************************************
//                     INITIALIZE VARIABLES:
// ---------------------------------------------------------------
var appClosed = true; //indicator for when the embedded app is closed or open during the demo.
var firstAppClosedDetection = null; // indicator for when change the instruction above the embedded demo app.
var firstAppOpennedDetection = null;
var revealExitButton = null;
var current_n_data_points = null; // used to navigate between embedded demo up states
var target_n_data_points = null; // used to navigate between embedded demo up states
var instructions_page = 1;
var mainDemoTextDuplicateID = "mainDemoTextBox";
var is_firstDemoScreen_SuportingInstructions_changed_1;
var is_firstDemoScreen_SuportingInstructions_changed_2;
var testPassed;
var timeline = [];

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

	subject_data_worker.postMessage({ instructionsStartedFlag: true }); // this is used to restart the demo cycle.
	// intialize test questions stuff:
	//---------------------------------
	var question_index = 0;
	var questions = settings.instructions_test_questions;
	var arrayOfQuestionNumbers = Object.keys(questions).map((x) => Number(x)).filter((x) => !isNaN(x))
	var n_questions = arrayOfQuestionNumbers.length;
	if (questions.toRandomizeQuestions) {
		shuffle(arrayOfQuestionNumbers)
	}
	var question_number = arrayOfQuestionNumbers[question_index]

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
				document.body.style.backgroundColor = "white"
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
			jsPsych.pauseExperiment()
			monitorChangesInDemoAndReact(settings)
		},
	};
	var continue_or_repeat_demo_cycle = {
		data: {
			trialType: 'continue_or_repeat_demo_cycle',
		},
		type: 'html-button-response',
		trial_duration: undefined, // no time limit
		choices: ['להמשיך', 'סיבוב נוסף'],
		button_html: '<button id="repeatOrContinueButtons">%choice%</button>',
		timeline: [
			{
				stimulus: '<p id="repeatOrContinueText">ההדגמה הסתיימה.<br><br>האם ברצונך לבצע סיבוב נוסף או להמשיך?<br><br></p>',
			}
		]
	};
	var big_demo_loop = {
		timeline: [demo, continue_or_repeat_demo_cycle],
		loop_function: function (data) {
			console.log('YYYYY')
			const subPressedContinue = !Number(jsPsych.data.get().last().select('button_pressed').values[0]);
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
	var get_ready_for_the_test = {
		data: {
			trialType: 'get_ready_for_the_test',
		},
		type: 'html-button-response',
		trial_duration: undefined, // no time limit
		choices: ['התחל'],
		button_html: '<button id="repeatOrContinueButtons">%choice%</button>',
		timeline: [
			{
				stimulus: '<p id="repeatOrContinueText">כעת נשאל אותך מספר שאלות כדי לוודא שההוראות ברורות.<br><br> \
				תזכורת: כדי שתוכל/י להתחיל במשחק יש לענות נכונה על כל השאלות.<br>\
				אם לא עונים על כל נכון פשוט חוזרים על ההוראות וההדגמה.<br><br>\
				לחצ/י על התחל כדי לעבור לשאלות.<br><br>\
				</p>',
			}
		]
	};
	var test_question = {
		data: {
			trialType: 'test_question',
		},
		type: 'html-button-response',
		trial_duration: undefined, // no time limit
		timeline: [
			{
				stimulus: '',
				choices: '',
				on_start: function () {
					this.stimulus = '<p id="test_question_text">' + questions[arrayOfQuestionNumbers[question_index]].question + '</p>'
					this.choices = shuffle([questions[question_number].correct_answer, questions[question_number].distractor_1, questions[question_number].distractor_2, questions[question_number].distractor_3])
					this.choices.unshift(questions.dont_know_answer)
					this.button_html = '<button id="multipleChoiceQuestionsButtons">%choice%</button>'
				},
				on_finish: function (data) {
					data.correct = data.button_pressed == this.choices.indexOf(questions[question_number].correct_answer); // option B
				}
			},
		]
	};
	var testQuestionsSequenceManager = {
		timeline: [test_question],
		loop_function: function () {
			if (question_index === (n_questions - 1)) {
				// initialize stuff if more rounds of instructions will be run.
				question_index = 0;
				if (questions.toRandomizeQuestions) {
					shuffle(arrayOfQuestionNumbers)
				}
				question_number = arrayOfQuestionNumbers[question_index]
				return false;
			} else {
				question_index++
				question_number = arrayOfQuestionNumbers[question_index]
				return true;
			}
		}
	};

	var post_test_message = {
		data: {
			trialType: 'post_test_message',
		},
		type: 'instructions',
		trial_duration: undefined, // no time limit
		allow_keys: false,
		allow_backward: false,
		button_label_next: 'המשך',
		pages: [],
		on_start: function () {
			// check if there is a single mistake return to start
			const lastTrialIndex = jsPsych.data.get().last().select('trial_index').values[0];
			const relevantData = jsPsych.data.get().filterCustom(x => x.trial_index > lastTrialIndex - n_questions)
			testPassed = !(relevantData.filter({ trialType: 'test_question', correct: false }).count() > 0)
			if (testPassed) {
				msg = 'ענית נכון על כל השאלות.<br><br> \
				החל מרגע זה תוכל/י להיכנס לאפליקציה כדי לנסות להשיג זהב (ולהרוויח כסף).<br><br> \
				 לאחר שתצא/י כעת מהאפליקציה הכניסות הבאות יהיה כבר חלק מהמשחק.<br><br> \
				 בהצלחה!<br><br> \
				 <img id="post_instructions_test_image" src="images/game_title_image.jpg" />';
				jsPsych.endExperiment('The experiment was ended because the user passed the test.');
			} else {
				msg = 'לא כל השאלות נענו נכונה.<br><br> \
				יש לעבור שוב על ההוראות וההדגמה.';
				this.show_clickable_nav = true
			}
			this.pages = ['<h2 id="post_test_msg">' + msg + '</h2>']
		}
	};

	// SET THE MAIN LOOP OF THE TUTORIAL:
	//------------------------------------------------------
	var completeTutorialLoop = {
		timeline: [instructionsLoop, big_demo_loop, get_ready_for_the_test, testQuestionsSequenceManager, post_test_message],
		//timeline: [instructionsLoop, get_ready_for_the_test, testQuestionsSequenceManager, post_test_message],
		loop_function: function (data) {
			if (!testPassed) {
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
				// ---------------------
				var instructionDataObject = { Instructions_Data: { ...jsPsych.data.get().values() } }// get the data for the instructions after reducing all the check demo (every 400ms "trials") which can create thousand of trials and make problems when uploading the data.

				subject_data_worker.postMessage({ completedInstructions: true });
				subject_data_worker.postMessage(instructionDataObject) // save the instructions data

				terminate_subject_data_worker = true;
				console.log('Tutrial Completed')
			},
			on_close: function () { // in case the user gets out before it finishes.
				// saving the data
				// ---------------------
				var instructionDataObject = { Instructions_Data: { ...jsPsych.data.get().values() } }// get the data for the instructions after reducing all the check demo (every 400ms "trials") which can create thousand of trials and make problems when uploading the data.

				subject_data_worker.postMessage(instructionDataObject) // save the instructions data

				terminate_subject_data_worker = true;
				console.log('Tutrial Closed')
			}
		});
	});
});
