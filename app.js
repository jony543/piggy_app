var dom_helper = {
	show: function (id) {
		this.remove_css_class(id, "hidden");
	},
	hide: function (id) {
		this.add_css_class(id, "hidden");
	},
	add_css_class: function(id, css_class) {
		document.getElementById(id).classList.add(css_class);
	},
	remove_css_class: function(id, css_class) {
		document.getElementById(id).classList.remove(css_class);
	},
	set_text: function(id, text) {
		document.getElementById(id).innerHTML = text;
	}
};

// for debug
if (!window.jatos) {
	window.jatos = {
		appendResultData: function(resultData) {
			console.log('This results would have been sent to jatos server:')
			console.log(resultData);
		},
		batchSession: { 
			get: function () { return "NoDataYet"; },
			set: function () { return Promise.resolve('mock'); }
		},
		workerId: 1
	}
};

var data_helper = {
	get_subject_data: function() {
		return jatos.batchSession.get(jatos.workerId + "_data");
	},
	set_subject_data: function(data) { // returns promise
		var subjectData = this.get_subject_data(jatos.workerId + "_data");
		Object.assign(subjectData, data);
		return jatos.batchSession.set(jatos.workerId + "_data", subjectData);
	}
};

var results = {
	press1Time: undefined,
	press2Time: undefined,
};

var logic = {
	initialize: function(subData) {
		if (subData === "NoDataYet") { // This is the first time the subject enters the app - there is no data file yet!
        // Check if is still installation:
        veriftBeginnig = confirm(verifyBeginningText); //[CHANGE THIS TO SOMETHING NICER LATER AND MAYBE ASK THE PARTICIPANT A QUESTION TO BE SURE THEY UNDERSTAND IT IS NOW DEVALUATIO]
        if (!veriftBeginnig) {
          isInstallation = true;
        };

        // SET FIRST ENTRY STUFF (isWin, day, devaluation)
        // --------------------------
        isWin = checkWinning(chancePerSec, 1);
        dayOfExperiment = 1;
        devalueToday = false;

      } else {
        // CHECK IF WINNING
        // --------------------------
        // check if reward is available in a VI fashion (calculated backward):
        specificContextSubData = subData.map(x => x['context']).multiIndexOf(backGroundStim).map(i => subData[i]); // take only the data of the relevant stimulus/context entered.

        if (specificContextSubData.length !== 0) { // Not the first time for this app:
          const lastEntryTime = new Date(specificContextSubData[specificContextSubData.length - 1]["startTime"]); // [NOTE] Make sure later it always takes the final line. Consider if this should be the start time or the endtime
          const secsFromLastEntry = getTimeFromLastEntryInSec(lastEntryTime);
          isWin = checkWinning(chancePerSec, secsFromLastEntry);
        } else { // First time for this app:
          isWin = checkWinning(chancePerSec, 1);
        }

        // DEVALUATION (check and set)
        // ---------------------------
        const expStartingTime = new Date(subData[0]["startTime"]);
        daysFromBeginning = dateDiff(expStartingTime, new Date()); // "new Date()" is getting the current time.
        dayOfExperiment = daysFromBeginning + 1;
        devalueToday = dayOfExperiment === firstDevalDay || dayOfExperiment === lastDevalDay ? true : false; // [NOTE] before I used daysFromBeginning instead of dayOfExperiment
      }

      // OPERATE DEVALUATION DAY
      // ---------------------------
      if (devalueToday) {
        // resolving which days to base devaluation time on:
        switch (dayOfExperiment) {
          case firstDevalDay:
            daysToBaseUponDeval = daysToBaseUponFirstDeval;
            break;
          case lastDevalDay:
            daysToBaseUponDeval = daysToBaseUponLastDeval;
            break;
        }
        // resolving in what time of the day to devalue:
        const entryTimesToBaseDevalTime = subData.filter(x => daysToBaseUponDeval.map(String).includes(x.day)).map(x => x.startTime).map(x => new Date(x)); // This will get to an array all the app entry times in the relevant days, in order to determine the devaluation time of the day
        const copyOfEntryTimesToBaseDevalTime = subData.filter(x => daysToBaseUponDeval.map(String).includes(x.day)).map(x => x.startTime).map(x => new Date(x)); // a copy of the previos var
        const timeZeroOfTheseDays = entryTimesToBaseDevalTime.map((x, ind) => x.getTime() - copyOfEntryTimesToBaseDevalTime[ind].setHours(0, 0, 0, 0)); // using the copy to calculate the in each day (inms I think) regardless of the data
        sortWithIndices(timeZeroOfTheseDays); // sort and add an object of sorted indices
        const sortedEntryTimesToBaseDevalTime = timeZeroOfTheseDays.sortIndices.map(x => entryTimesToBaseDevalTime[x]); // sort the entry times regardless of date...
        const timeToDevalue = sortedEntryTimesToBaseDevalTime[Math.floor((sortedEntryTimesToBaseDevalTime.length - 1) / 2)] // get the time from which to devalue (according to the median; if even taking the earlier)
        timeToDevalue.setFullYear(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()); // change the date to today (without changing the time.

        if (new Date() >= timeToDevalue) {
          isDevalued = 1;
          // check if this is the first time the outcome should be devalued that day
          if (specificContextSubData[specificContextSubData.length - 1].isDevalued === "0") { // this is the first time
            notifyDevaluation = true;
            isWin = true; // On the devaluation indication time there is a certain win...
          } else {
            document.body.style.backgroundImage = document.body.style.backgroundImage.replace('empty', 'full')
          }
        }
      }

      // REWARDS (set value [if winning])
      // --------------------------
      let non_rounded_reward = isWin ? Math.random() * (maxWinningSum - minWinningSum) + minWinningSum : 0;
      reward = Math.round(non_rounded_reward * 100) / 100; // just making it rounded to two decimal points.
	},
	finish: function () {
		return jatos.submitResultData(results);
	}
};

setTimeout(function(){
	var subData = data_helper.get_subject_data();
	//logic.initialize(subData);

	dom_helper.hide("welcome_msg");

    dom_helper.show("upper_half");
    dom_helper.show("lower_half");   

    var lowerHalfClicked = false;    

    var p1 = new Promise((resolve, reject) => {    	
	    document.getElementById('lower_half').onclick = function() {
	    	lowerHalfClicked = true;
    		results.press1Time = new Date();        			
    		resolve();
	    };
	});  

	var p2 = new Promise((resolve, reject) => {
	    document.getElementById('upper_half').onclick = function () {
	    	if (lowerHalfClicked) {
	    		results.press2Time = new Date();
	    		resolve();
	    	}
	    }
	});  

	Promise.all([p1, p2]).then(function () {
		if (!!window.isWin) {
			dom_helper.set_text('welcome_msg_txt', "YESSSS");
		} else {
			dom_helper.set_text('welcome_msg_txt', "NOOOO");
		}
		
		dom_helper.hide("upper_half");
    	dom_helper.hide("lower_half");  
		
		dom_helper.show("welcome_msg");
	});

}, 2000);