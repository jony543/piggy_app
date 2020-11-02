// ****************************************************************
//                           FUNCTIONS:
// ---------------------------------------------------------------
function exitAppDemo () {
	debugger
	console.log('Exit THE APP')
	dom_helper.duplicate('embedded_app');
}

function loadAppDemo () {
	debugger
	console.log('FUNFUNFUN')
	//dom_helper.hide("embedded_app")
	dom_helper.duplicate('embedded_app');
	//dom_helper.show(embedded_app_id);
}


function checkReady(target_n_data_points) {

	var subData = data_helper.get_subject_data(true);
	current_n_data_points = subData.day.length

    if (current_n_data_points !== target_n_data_points && !subData.endTime[subData.endTime.length-1]) { // check again while there is no new data point and while it has no value for endTime
		console.log('SAD')
        setTimeout("checkReady()", 300);
    } else {
        console.log('WOWI')
    }
}



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
	var timeline = [];

	var instructions = {
		data: {
			trialType: 'instruction',
		},
		type: 'html-button-response',
		trial_duration: undefined, // no time limit
		choices: ['Previous', 'Next'],
		timeline: [
			{
				stimulus: '<h1>page 1</h1>' +
					'<h2>page 1</h2>' +
					'<h3>page 1</h3>' +
					"<div style='float: center;'><img src='images/coin_gold.png'></img>" +
					"<p><strong>Press the F key</strong></p></div>",
			},
			{
				stimulus: '<h1>page 2</h1>' +
					"<div style='float: center;'><img src='images/instructions/instructions_2.jpg'></img>" +
					"<p><strong>Press the F key</strong></p></div>",
			},
			{
				stimulus: '<h1>page 3</h1>',
			}
		]
	};

	/* Switch to this version for previous and backwards buttons
	var instructions = {
		data: {
			trialType: 'instruction',
		},
		type: 'instructions',
		pages: [
			'Welcome to the experiment. Click next to begin.',
			'This is the second page of instructions.',
			'This is the final page.',
			'<h2>page 1</h2>' +
			'<h3>page 1</h3>' +
			"<div style='float: center;'><img src='images/coin_gold.png'></img>" +
			"<p><strong>Press the F key</strong></p></div>",
	
		],
		button_label_previous: 'MyPrevious' ,
		button_label_next: 'MyNext',
		show_clickable_nav: true
	};
	//*/

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

	var instructionsLoop = {
		timeline: [instructions, test],
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

	timeline.push(instructionsLoop);

	jatos.onLoad(function () {
		jsPsych.init({
			timeline: timeline,
			//display_element: 'jspsych-display-element',
			on_finish: function () {
				var dataObj = {...jsPsych.data.get().values()}
				subject_data_worker.postMessage(dataObj)
				subject_data_worker.postMessage({ completedInstructions: true });


debugger
// creating the smarthpone appearance:
outerRectangle = document.createElement('div');
outerRectangle.setAttribute("id", "outerRectangle");
outerRectangle.setAttribute("class", "bigRectangle");

innerRectangle = document.createElement('div');
innerRectangle.setAttribute("id", "innerRectangle");
innerRectangle.setAttribute("class", "smallRectangle");

outerRectangle.appendChild(innerRectangle);

document.body.appendChild(outerRectangle);

for (i = 0; i < 19; i++) {
	dom_helper.duplicate('innerRectangle');
}







// button of exit the app
debugger
				exitAppElement = document.createElement('button');
				exitAppElement.setAttribute("id", "demoExitButton");
				exitAppElement.setAttribute("onclick", "exitAppDemo()");
				exitAppElement.appendChild(document.createTextNode("Exit the app"));
				document.body.appendChild(exitAppElement);
				dom_helper.add_css_class('demoExitButton', 'demoButton');


// button of openning the app

				loadTheAppElement = document.createElement('button');
				loadTheAppElement.setAttribute("id", "demoLoadButton");
				loadTheAppElement.setAttribute("onclick", "loadAppDemo()");
				loadTheAppElement.appendChild(document.createTextNode("Enter the app"));
				document.body.appendChild(loadTheAppElement);
				dom_helper.add_css_class('demoLoadButton', 'demoButton');
				dom_helper.add_css_class('demoLoadButton', 'loadButton');






				// embed the app for demo purposes:
				embeddedElement = document.createElement('object');
				embeddedElement.setAttribute("id", "embedded_app")
				embeddedElement.setAttribute("data", "index.html")
				embeddedElement.style.position = "absolute"
				embeddedElement.style.top = "50%"
				embeddedElement.style.left = "50%"
				embeddedElement.style.transform = "translate(-50%, -50%)"
				embeddedElement.style.width = "70vw"
				embeddedElement.style.height = "70vh"
				embeddedElement.style.border = "0.5vw solid rgb(100, 100, 100)"
				embeddedElement.style.borderRadius = "5vw"
				document.body.appendChild(embeddedElement)


// check when embedded app finshed running:
				var subData = data_helper.get_subject_data(true);
				n_data_points = subData.day.length // just to chekc the number of data points
				target_n_data_points = subData.day.length+1
				checkReady(target_n_data_points)

				terminate_subject_data_worker = true;
			}
		});
	});
});