var timeline = [];

var instructions = {
	data: {
		trialType: 'instruction',
	},
	type: 'html-button-response',
	trial_duration: undefined, // no time limit
	choices: ['Next'],
	timeline: [ 
		{
			stimulus: '<h1>page 1</h1>',
		},
		{
			stimulus: '<h1>page 2</h1>',
		},
		{
			stimulus: '<h1>page 3</h1>',
		}
	]
};

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
    loop_function: function(data) {
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

jatos.onLoad(function() {
	jsPsych.init( {
        timeline: timeline,
        //display_element: 'jspsych-display-element',
        on_finish: function() {
            var resultJson = jsPsych.data.get().json(); // optioinal - change .json() to .csv()
            jatos.appendResultData(resultJson).then(console.log('bye'));
        }
    }); 
});