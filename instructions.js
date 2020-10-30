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
			var resultJson = jsPsych.data.get().json(); // optioinal - change .json() to .csv()
			jatos.appendResultData(resultJson).then(console.log('bye'));

			// embed the app for demo purposes:
			gg = document.createElement('object');
			gg.setAttribute("data", "index.html")
			gg.style.position = "absolute"
			gg.style.top = "50%"
			gg.style.left = "50%"
			gg.style.transform = "translate(-50%, -50%)"
			gg.style.width = "70vw"
			gg.style.height = "70vh"
			gg.style.border = "0.5vw solid rgb(100, 100, 100)"
			gg.style.borderRadius= "20px"		  
			document.body.appendChild(gg)
		}
	});
});
