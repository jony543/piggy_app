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
			choices: ['A', 'B', 'C', 'D'],
			on_finish: function (data) {
				data.correct = data.button_pressed == 1; // option B
			}
		},
		{
			stimulus: '<h1>Q 2</h1>',
			choices: ['A', 'B', 'C', 'D'],
			on_finish: function (data) {
				data.correct = data.button_pressed == 3; // option D
			}
		},
		{
			stimulus: '<h1>Q 3</h1>',
			choices: ['A', 'B', 'C', 'D'],
			on_finish: function (data) {
				data.correct = data.button_pressed == 0; // option A
			}
		}
	]
};

var instructionsLoop = {
    timeline: [instructions, test],
    loop_function: function(data) {
    	// check if there is a single mistake return to start
        if(jsPsych.data.get().filter({ trialType: 'test', correct: false }).count() > 0) { 
            return true;
        } else {
            return false;
        }
    }
}

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