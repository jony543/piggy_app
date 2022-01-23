// ****************************************************************
//                           FUNCTIONS:
// ---------------------------------------------------------------
function setCounterBalancedStuff(subID, settings) {
  // initiate relevant stimuli:
  let firstDevalDay = [];
  let lastDevalDay = [];
  let group;
  let dayToFinishExperiment;

  // Determine group:
  // *UPDATE: I THE CANCELLED COUNTER-BALANCING (original values are commeneted):
  if (subID % 300 > 100 && subID % 300 < 200) {
    group = 'short_training'; // subject numbers 101-199, 401-499, 701-799 etc

    firstDevalDay = settings.optionalDaysForFirstDeval[1];
    firstComparableValDay = settings.optionalDaysForFirstDeval[0];
    firstComparableValDay_PostDeval = settings.optionalDaysForFirstDeval[2];
    lastDevalDay = settings.optionalDaysForLastDeval[1];
    lastComparableValDay = settings.optionalDaysForLastDeval[0];
    lastComparableValDay_PostDeval = settings.optionalDaysForLastDeval[2];

    dayToFinishExperiment = settings.dayToFinishExperiment_ShortTraining
  } else if (subID % 300 > 200 && subID % 300 < 300) {
    group = 'long_training'; // subject numbers 201-299, 501-599, 801-899 etc

    firstDevalDay = null;
    firstComparableValDay = null;
    firstComparableValDay_PostDeval = null;
    lastDevalDay = settings.optionalDaysForLastDeval[1];
    lastComparableValDay = settings.optionalDaysForLastDeval[0];
    lastComparableValDay_PostDeval = settings.optionalDaysForLastDeval[2];

    dayToFinishExperiment = settings.dayToFinishExperiment_LongTraining
  } else if (subID % 300 < 100) {
    group = 'long_training_parallel_manipulations'; // subject numbers 301-399, 601-699, 901-999 etc.

    firstDevalDay = settings.optionalDaysForFirstDeval[1]; // in this group it will be translated into another still-valued manipulation
    firstComparableValDay = settings.optionalDaysForFirstDeval[0];
    firstComparableValDay_PostDeval = settings.optionalDaysForFirstDeval[2];
    lastDevalDay = settings.optionalDaysForLastDeval[1];
    lastComparableValDay = settings.optionalDaysForLastDeval[0];
    lastComparableValDay_PostDeval = settings.optionalDaysForLastDeval[2];

    dayToFinishExperiment = settings.dayToFinishExperiment_LongTraining
  }

  return [group, firstDevalDay, lastDevalDay, firstComparableValDay, lastComparableValDay, firstComparableValDay_PostDeval, lastComparableValDay_PostDeval, dayToFinishExperiment];
}

function getTimeFromLastEntryInSec(timePoint) {
  const currentTime = new Date();
  const diffTime = Math.abs(currentTime - timePoint);
  const diffSeconds = Math.floor(diffTime / (1000));
  // console.log(diffTime + " milliseconds");
  // console.log(diffSeconds + " days");
  return diffSeconds;
}

function checkWinning(subData, isRatioSchedule, winningChancePerUnit, winAnywayIfMultipleNonWins, enforceFirstEntryWinSecondEntryNoWin) {
  if (enforceFirstEntryWinSecondEntryNoWin &&
    ((subData.resetContainer[subData.resetContainer.length - 1] && !!subData.resetContainerConfirmationTime[subData.resetContainerConfirmationTime.length - 1]) ||
      (subData.isFirstTime[subData.isFirstTime.length - 1] && !!subData.endTime[subData.endTime.length - 1])) &&
    (!subData.isWin[subData.isWin.length - 1])) { // check first if it's the second entry today (where a reward must be given). [* the last line is just for the case of when a manipulation is initiated on the first entry that day and isWin is True.]
    return true
  }
  if (isRatioSchedule) { // VR schedule
    if (winAnywayIfMultipleNonWins && subData.endTime && subData.endTime.length >= app_settings.rewards.RelativeNonWinUnitsBeforeSureWinning()) { // If sure win following no wins is on and it's not the beginning check last wins
      const indicesWithEndTime = subData.endTime.map((x) => !!x).multiIndexOf(true)
      const relevantIndicesToCheck = indicesWithEndTime.slice(length - app_settings.rewards.RelativeNonWinUnitsBeforeSureWinning())
      if (!relevantIndicesToCheck.filter((x) => subData.isWin[x]).length) { // this checks if there was no win in the relevant times.
        return true
      }
    }
    return Math.random() < winningChancePerUnit;
  } else { // namely a VI schedule
    if (!!Object.keys(subData).length) { // if there is some data for this subject *********** THIS NEED TO BE RECHECKED [WAS NOT TESTED] *************
      if (winAnywayIfMultipleNonWins && subData.endTime && subData.endTime.length >= app_settings.rewards.RelativeNonWinUnitsBeforeSureWinning()) { // If sure win following no wins is on and it's not the beginning check last wins
        const ms_per_second = 1000;
        const timeToCheckBack = new Date(new Date() - ms_per_second * app_settings.rewards.RelativeNonWinUnitsBeforeSureWinning())
        const firstEntryAfterTimeToCheck = subData.outcomeTime.find((x) => new Date(x) > timeToCheckBack)
        const relevantentries = subData.isWin.slice(subData.outcomeTime.indexOf(firstEntryAfterTimeToCheck)) // CHECK THIS LINE IN PARTICULAR [WAS NOT TESTED AFTER A CHANGE]
        if (!firstEntryAfterTimeToCheck || !relevantentries.some((x) => !!x)) { // if there was no entry after the time to check or there was no win in every entry since the time to check
          return true
        }
      } else {
        const lastEntryTime = new Date([...subData.outcomeTime].reverse().find(element => !!element)); // [NOTE] Make sure later it always takes the final line. Consider if this should be the start time or the endtime or reward time
        var secsFromLastEntry = getTimeFromLastEntryInSec(lastEntryTime);
      }
    } else { // i.e., first entry
      var secsFromLastEntry = 1;
    }
    chanceOfWinning = 1 - Math.pow(1 - winningChancePerUnit, secsFromLastEntry); // I verified that it does the job correctly :) ; This is calculated as the chances of at least 1 win.
    return Math.random() < chanceOfWinning;
  }
}

function assignReward(rewardsData) {
  if (!rewardsData.isVariableReward) {
    return rewardsData.rewardConstantSum
  }
  else {
    let non_rounded_reward = Math.random() * (rewardsData.maxWinningSum - rewardsData.minWinningSum) + rewardsData.minWinningSum;
    return Math.round(non_rounded_reward * 100) / 100 // just making it rounded to two decimal points.
  }
}

function getBaselineAccumulatedReward(subData, settings) {
  try {
    if (!!subData.baselineAccumulatedReward) {
      let relevantTrials = subData.baselineAccumulatedReward.filter((x, i) => x !== undefined && x !== null && subData.isDemo[i] === false);
      if (!relevantTrials.length) { return 0 }; // return 0 in case there are no relevant trials.
      let li = subData.baselineAccumulatedReward.lastIndexOf(relevantTrials.slice().reverse()[0]) // get the last valid index (that had)
      // if it is the first time there is an endExperiment message just use the same value.
      if (!!subData['endExperiment'][li]) {
        return subData.baselineAccumulatedReward[li];
      }
      // calculate reward accounting for previous trial
      // --------------------------------------------------------
      let accumulator = subData.baselineAccumulatedReward[li]

      // handle COST [may need adaptation if cost is splited to entry and each press]:
      !!subData['cost'][li] ? accumulator -= subData['cost'][li].reduce((a, b) => a + b, 0) : null;

      // handle REWARD:
      if (!!subData['endTime'][li] && !(!!subData.isUnderManipulation[li] && subData.manipulationToday[li] === 'devaluation')) {
        accumulator += subData['reward'][li];
      }

      // handle CAVE:
      if (!!subData['endTime'][li] && !!subData.coin_task_finish_status[li]) {
        // reduce cave's cost
        accumulator -= subData.coin_task_finish_status[li].total_presses * settings.coinCollectionTask.costPerPress;
        console.log('with cave cost: ' + accumulator)
        // add cave's reward
        subData.manipulationToday[li] !== 'devaluation' ? accumulator += subData.coin_task_finish_status[li].total_gold_collected * settings.coinCollectionTask.rewardPerCoinStash() : null;
        console.log('with cave reward: ' + accumulator)
      }

      return !accumulator ? 0 : accumulator //prevent errors if accumulator does not get a value after all
    } else {
      return 0
    }

  } catch (error) {
    console.error(error);
    return 0
  }
}

// resolving in what time of the day to devalue (or induce the alternative still-valued manipulation):
function getManipulationStartingTime(subData, daysToBaseUponManipulation, referenceDayPrecentile, experimentalDayStartingHour = 0) {
  const adjustingTime = 1000 * 60 * 60 * experimentalDayStartingHour;
  const twentyFourHours = 1000 * 60 * 60 * 24;

  const entryTimes2BaseManipulationIndices = [].concat.apply([], daysToBaseUponManipulation.map(x => subData.day.multiIndexOf(x))); // get relevant indices of the relevant times
  let entryTimes2BaseManipulation = subData.startTime.filter((x, i) => entryTimes2BaseManipulationIndices.includes(i)).map(x => new Date(x)).filter((x) => !isNaN(x)); // get the relevant times (startTime)
  let copyOfEntryTimes2BaseManipulation = subData.startTime.filter((x, i) => entryTimes2BaseManipulationIndices.includes(i)).map(x => new Date(x)).filter((x) => !isNaN(x)); // a copy of the previous var

  let timeZeroOfTheseDays = entryTimes2BaseManipulation.map((x, ind) => x - copyOfEntryTimes2BaseManipulation[ind].setHours(0, 0, 0, 0)); // using the copy to calculate the in each day (in ms I think) regardless of the data
  timeZeroOfTheseDays = timeZeroOfTheseDays.map((x) => x <= adjustingTime ? x + twentyFourHours : x); // handle the shift in day starting hour

  sortWithIndices(timeZeroOfTheseDays); // sort and add an object of sorted indices
  const sortedEntryTimes2BaseManipulationTime = timeZeroOfTheseDays.sortIndices.map(x => entryTimes2BaseManipulation[x]); // sort the entry times regardless of date...
  const timeToManipulate = sortedEntryTimes2BaseManipulationTime[Math.floor((sortedEntryTimes2BaseManipulationTime.length - 1) * referenceDayPrecentile)]; // get the time from which to devalue/still-valued manipulation (according to the median; if even taking the earlier); * if referenceDayPrecentile=0.5 it will take the median, 0.25 quarter of the presses in a day etc.

  // Cover all cases of time to manipulate and current time:
  const hourNow = new Date().getHours();
  if (timeToManipulate.getHours() < experimentalDayStartingHour) {// time to MANIPULATE is AFTER midnight (within the timeframe of the experimentalDayStartingHour)
    if (hourNow < experimentalDayStartingHour) { // The time NOW is AFTER midnight
      timeToManipulate.setFullYear(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()); // change the date to today (without changing the time).
    }
    else if (hourNow >= experimentalDayStartingHour) { // The time NOW is BEFORE midnight
      timeToManipulate.setFullYear(new Date().getFullYear(), new Date().getMonth(), new Date(new Date().getTime() + twentyFourHours).getDate()); // change the date of manipulation to tomorrow (so it won't operate the manipulation/cover).
    }
  }
  else if (timeToManipulate.getHours() >= experimentalDayStartingHour) {// time to MANIPULATE is BEFORE midnight (within the timeframe of the experimentalDayStartingHour)
    if (hourNow < experimentalDayStartingHour) { // The time NOW is AFTER midnight
      timeToManipulate.setFullYear(new Date().getFullYear(), new Date().getMonth(), new Date(new Date().getTime() - twentyFourHours).getDate()); // change the date of manipulation to yesturday (so it won't operate the manipulation/cover).
    }
    else if (hourNow >= experimentalDayStartingHour) { // The time NOW is BEFORE midnight
      timeToManipulate.setFullYear(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()); // change the date to today (without changing the time).
    }
  }

  return timeToManipulate
}

function InitializeCost(cost_settings) {
  if (cost_settings.isCost) { // the syntax is based on the assignReward function defined above.
    if (!cost_settings.isVariableCost) {
      return cost_settings.isCostPerPress ? new Array(app_settings.pressesRequired + 1).fill(cost_settings.costConstantSum) : [cost_settings.costConstantSum];
    } else {
      let cost = [];
      const n_costs = cost_settings.isCostPerPress ? app_settings.pressesRequired + 1 : 1;
      for (i = 0; i < n_costs; i++) {
        let non_rounded_cost = Math.random() * (cost_settings.maxCostSum - cost_settings.minCostSum) + cost_settings.minCostSum;
        cost.push(Math.round(non_rounded_cost * 100) / 100); // just making it rounded to two decimal points.
      }
      return cost
    }
  } else {
    return [0]
  }
}

function checkIfToHideOutcome(subData, hideOutcome, dayOfExperiment, isUnderManipulation, experimentalDayStartingHour = 0, group, completeEntriesToday) {
  if (hideOutcome.hide) { // If to hide outcomes
    if (isUnderManipulation && hideOutcome.hideOnlyUnderManipulationPeriods) { // If it's manipulation time and hiding is on only during manipulations.
      return true;
    } else if (!hideOutcome.hideOnlyUnderManipulationPeriods && hideOutcome.daysToHideAt[group].includes(dayOfExperiment)) {
      if (hideOutcome.toPersonalizedOutcomeHidingTime) { // checking in the context of personalized times
        const timeToHideOutcome = getManipulationStartingTime(subData, hideOutcome.daysToBaseUponHidingTime[group][hideOutcome.daysToHideAt[group].indexOf(dayOfExperiment)], hideOutcome.relativeTimeOfDayToStart, experimentalDayStartingHour) // according to the median time in specified days
        if (new Date() >= timeToHideOutcome) {
          return true;
        }
      } else { // checking according to pre-determined conditions (based on number of entries and/or time at day)
        // const currentHour = (new Date()).getHours()
        // if (completeEntriesToday >= hideOutcome.entry_to_hideOutcome_in - 1 || currentHour >= hideOutcome.hour_at_day_to_hideOutcome_anyway || currentHour < experimentalDayStartingHour) { return true }
        if (completeEntriesToday >= hideOutcome.entry_to_hideOutcome_in - 1) { return true }
      }
    }
  }
  return false;
}

function checkIfResetContainer(subData, dayOfExperiment) {
  if (!subData.resetContainerConfirmationTime.filter((x, i) => !!x && subData.day[i] === dayOfExperiment).length) { // if there were no completed entries today
    return true
  } else {
    return false
  }
}

function finishExperiment(subData, dayOfExperiment, dayToFinishExperiment, nTrialsBeforeNotifyGameOver) {

  var n_entriesToday = subData.day.filter((x, i) => x == dayOfExperiment && !!subData.endTime[i]).length
  // Check if the experiment is over
  // if (dayOfExperiment >= dayToFinishExperiment && n_entriesToday >= nTrialsBeforeNotifyGameOver) { // added the latter to show game over only after a few entries (to allow online fixes when necessary [and before game ver message is shown])
  if (dayOfExperiment >= dayToFinishExperiment) { return true }
  if (subData["endExperiment"].includes(true)) { return true } // If there was already a notification about the game ending.

  // Exclusions:
  // -------------------------------------------
  // // Check if the participant entered EVERY DAY:
  // const daysWithEntries = subData.day.filter((x, i, self) => !!x && x < dayOfExperiment && !!subData.endTime[i]).filter((v, i, a) => a.indexOf(v) === i).length;
  // const possibleDaysWithEntries = [...Array(dayOfExperiment - 1).keys()].length;
  // if ((daysWithEntries !== possibleDaysWithEntries || (typeof (subjects_exclude_online) !== "undefined" && String(subjects_exclude_online).includes(data_helper.get_subject_id()))) && n_entriesToday >= nTrialsBeforeNotifyGameOver) { // added the latter to show game over only after a few entries (to allow online fixes when necessary [and before game ver message is shown])
  //   return true
  // }

  // Check if there was a day where the MANIPULATION WAS NOT ACTIVATED:
  //const daysOfManipulation = [firstComparableValDay, firstDevalDay, firstComparableValDay_PostDeval, lastComparableValDay, lastDevalDay, lastComparableValDay_PostDeval]
  const daysOfManipulation = subData.group.includes('short_training') ? [firstComparableValDay, firstDevalDay, firstComparableValDay_PostDeval] : [lastComparableValDay, lastDevalDay, lastComparableValDay_PostDeval];
  const daysToCheckManipulationActivated = daysOfManipulation.filter(x => !!x && x < dayOfExperiment)
  const manipulationActivationdays = subData.day.filter((x, i) => daysToCheckManipulationActivated.includes(x) && subData.activateManipulation[i] == true && !!subData.endTime[i])
  const manipulationActivationdays2 = subData.day.filter((x, i) => daysToCheckManipulationActivated.includes(x) && subData.activateManipulation[i] == true && !!subData.manipulationConfirmationTime[i]).filter((x, i, s) => s.indexOf(x) === i) // the last part just takes the unique values
  if ((daysToCheckManipulationActivated.length !== manipulationActivationdays.length && daysToCheckManipulationActivated.length !== manipulationActivationdays2.length) && n_entriesToday >= nTrialsBeforeNotifyGameOver) { // added the latter to show game over only after a few entries (to allow online fixes when necessary [and before game ver message is shown])
    return true
  }

  return false
}

// ****************************************************************
//           LOGIC / Run Data (calculate run parameters):
// ----------------------------------------------------------------
var logic = {
  isCalledFromInstructions: function () {
    //return document.referrer.includes(settings.instructionsFileName); // was relevant when in iframe from the install.js
    //return window.parent.location.href.includes(settings.instructionsFileName) // this was relevant when it instructions were not redirected to
    return !!document.getElementById('instructions_iframe') || document.referrer.includes(settings.instructionsFileName)
  },
  initialize: function (subData, settings) {
    const noDataYet = !Object.keys(subData).length; // check if this is the first entry

    // check if running localy or on the server and determine if called from within the instructions (for the the embedded demo):
    var isCalledFromInstructions = this.isCalledFromInstructions();

    // CHECK IF INSTRUCTIONS
    // -------------------------------------------------------
    if (settings.allowInstructions) {
      if (!noDataYet) {
        var instructionCompletion = subData.completedInstructions.filter((x) => x !== undefined);
        instructionCompletion = instructionCompletion[instructionCompletion.length - 1];
      }
      if (!isCalledFromInstructions && (noDataYet || !instructionCompletion)) {
        var dataToSave = {
          subId: data_helper.get_subject_id(),
          showInstructions: true,
        };
        return dataToSave;
      }
    }
    // CHECK AND SET DEMO
    // -------------------------------------------------------
    // demo vars defaults:
    let isDemo = null;
    let demoTrialNum = null

    if (settings.allowDemo) { // check if demo is available and set variables accordingly
      if (isCalledFromInstructions) {  //check if demo;//if it's the first time the app is loaded for that subject or if it was demo the last time but the demo is still not completed
        isDemo = true;

        if (subData.instructionsStartedFlag[subData.instructionsStartedFlag.length - 1] || // I think those below are redundant after I added this condition
          noDataYet || subData.demoTrialNum[subData.demoTrialNum.length - 1] === null || subData.demoTrialNum[subData.demoTrialNum.length - 1] === undefined) { // if this is the first demo trial after instructions
          demoTrialNum = 0
        } else {
          demoTrialNum = subData.demoTrialNum[subData.demoTrialNum.length - 1] + 1
        }
      } else {
        isDemo = false;
      }
    }
    // CHECK IF THIS IS THE FIRST REAL TRIAL
    // -------------------------------------------------------
    if (settings.allowDemo) { // if there is no demo (and instructions)
      var isFirstTime = !noDataYet && ((subData.isDemo[subData.isDemo.length - 1] && !isCalledFromInstructions) || (subData.isFirstTime[subData.isFirstTime.length - 1] && !subData.endTime[subData.endTime.length - 1])) ? true : false;
    } else {
      var isFirstTime = noDataYet || (subData.isFirstTime[subData.isFirstTime.length - 1] && !subData.endTime[subData.endTime.length - 1]);
    }
    // -------------------------------------------------------

    if (isDemo) {

      var dayOfExperiment = null;
      let demoVars = settings.demoCycle[demoTrialNum % Object.keys(settings.demoCycle).length];
      // assign the variables for the demo:
      isWin = demoVars.isWin;
      whichManipulation = demoVars.whichManipulation;
      activateManipulation = demoVars.activateManipulation;
      isUnderManipulation = demoVars.isUnderManipulation;
      consumptionTest = demoVars.consumptionTest;
      var toHideOutcome = demoVars.toHideOutcome;
      var resetContainer = demoVars.resetContainer;
      var group = 'irrelevant';
      var endExperiment = false;
    } else {

      // Get counter-balanced stuff and Initialize variables:
      [group, firstDevalDay, lastDevalDay, firstComparableValDay, lastComparableValDay, firstComparableValDay_PostDeval, lastComparableValDay_PostDeval, dayToFinishExperiment] = setCounterBalancedStuff(data_helper.get_subject_id(), app_settings);
      var isUnderManipulation = false;
      var whichManipulation = null;
      var activateManipulation = false;
      var consumptionTest = false;

      // Get the day of the experiment:
      const expStartingTime = new Date(subData["startTime"].find((x) => !!x)); // finds the first element with a valid IDBCursorWithValue.
      daysFromBeginning = !isNaN(expStartingTime.getTime()) ? dateDiff(expStartingTime, new Date(), settings.experimentalDayStartingHour) : 0; // "new Date()" is getting the current time.
      dayOfExperiment = daysFromBeginning + 1;
      console.log(`DAY OF EXPERIMENT: ${dayOfExperiment}`)

      if (!isFirstTime) { // if there is some data for this subject (i.e., not the first entry)

        // DEVALUATION / STILL-VALUED tests(check and set)
        // -------------------------------------------------------
        completeEntriesToday = subData.endTime.filter((x, i) => (!!x || !!subData.outcomeTime[i]) && subData.day[i] === dayOfExperiment).length; // number of entries TODAY that got to the END [* reffers to the experimental day 24h - could be form 5:00 to 5:00 for example]
        devalueToday = (dayOfExperiment === firstDevalDay && group !== "long_training_parallel_manipulations") || dayOfExperiment === lastDevalDay ? true : false; // [NOTE] beforehand I used daysFromBeginning instead of dayOfExperiment
        comparableValuedInsteadOfShortDeval = (dayOfExperiment === firstDevalDay && group === "long_training_parallel_manipulations") ? true : false; // [NOTE] beforehand I used daysFromBeginning instead of dayOfExperiment
        comparableValuedToday = dayOfExperiment === firstComparableValDay || dayOfExperiment === lastComparableValDay ? true : false; // [NOTE] beforehand I used daysFromBeginning instead of dayOfExperiment
        comparableValuedToday_PostDeval = dayOfExperiment === firstComparableValDay_PostDeval || dayOfExperiment === lastComparableValDay_PostDeval ? true : false;
        if (devalueToday || comparableValuedToday || comparableValuedToday_PostDeval || comparableValuedInsteadOfShortDeval) {
          whichManipulation = ['devaluation', 'still_valued', 'still_valued_post_deval', 'still_valued_replacing_devaluation'].filter((item, i) => [devalueToday, comparableValuedToday, comparableValuedToday_PostDeval, comparableValuedInsteadOfShortDeval][i])[0];
        };

        // End experiment & Exclusions
        // ---------------------------
        var endExperiment = finishExperiment(subData, dayOfExperiment, dayToFinishExperiment, settings.nTrialsBeforeNotifyGameOver);

        // Reset container
        // ---------------------------
        var resetContainer = settings.rewards.notifyRewardContainerReset && dayOfExperiment > 1 && !endExperiment ? checkIfResetContainer(subData, dayOfExperiment) : false; // check if reset container

        // Reset container
        // ---------------------------
        isWin = settings.rewards.enforceFirstEntryWinSecondEntryNoWin && resetContainer ? false : checkWinning(subData, settings.rewards.isRatioSchedule, settings.rewards.winningChancePerUnit(), settings.rewards.winAnywayIfMultipleNonWins, settings.rewards.enforceFirstEntryWinSecondEntryNoWin);

        // OPERATE MANIPULATION DAY (DEVALUATION)
        // ---------------------------------------
        if (!endExperiment && (devalueToday || comparableValuedToday || comparableValuedToday_PostDeval || comparableValuedInsteadOfShortDeval)) {
          var inManipulationPeriod = false;
          if (settings.toPersonalizedManpulationTime) { // resolving in what time of the day to devalue (or induce the alternative still-valued manipulation):
            // resolving which days to base devaluation time on:
            switch (dayOfExperiment) {
              case firstDevalDay:
              case firstComparableValDay:
              case firstComparableValDay_PostDeval:
                daysToBaseUponManipulation = settings.daysToBaseUponFirstDeval;
                break;
              case lastDevalDay:
              case lastComparableValDay:
              case lastComparableValDay_PostDeval:
                daysToBaseUponManipulation = settings.daysToBaseUponLastDeval;
                break;
            }
            const timeToManipulate = getManipulationStartingTime(subData, daysToBaseUponManipulation, settings.referenceDayPrecentileForManipulation, settings.experimentalDayStartingHour) // according to the median time in specified days
            if (new Date() >= timeToManipulate) { inManipulationPeriod = true }
          } else { // namely devaluation is determined globally for all participants according to conditions we pre-determined (e.g., number of entries and/or time of day)
            // const currentHour = (new Date()).getHours()
            // if (completeEntriesToday >= settings.entry_to_manipulate_in - 1 || currentHour >= settings.hour_at_day_to_manipulate_anyway || currentHour < settings.experimentalDayStartingHour) { inManipulationPeriod = true } // i.e., this is the [pettentialy complete] 5th entry, or if it's after the pre-determined hour of day
            if (completeEntriesToday >= settings.entry_to_manipulate_in - 1) { inManipulationPeriod = true } // i.e., this is the [pettentialy complete] 5th entry
          }
          if (inManipulationPeriod) {
            // check if this is the first time the outcome should be devalued that day
            // if (!subData.activateManipulation.filter((x, i) => x === true && subData.day[i] === dayOfExperiment && !!subData.endTime[i]).length) { // There was no trial with ACTIVATION on this DAY that ENDED (the user got to the end of the trial)
            if (!subData.activateManipulation.filter((x, i) => x === true && subData.day[i] === dayOfExperiment && !!subData.manipulationConfirmationTime[i]).length) { // There was no trial with ACTIVATION on this DAY that was confirmed by the user
              activateManipulation = true;
              consumptionTest = true;
              isWin = true; // On the devaluation indication time there is a certain win...
            } else if (!subData.foundCaveConfirmationTime.filter((x, i) => !!x && subData.day[i] === dayOfExperiment).length && // if there is no confirmation of found the cave today
              subData.foundCaveAlertTime.filter((x, i) => !!x && subData.day[i] === dayOfExperiment).length < settings.nTimesToShowCaveIfNotEntering) { // and there was a presentation of the cave that do not exceed a nTimesToShowCaveIfNotEntering.
              consumptionTest = true;
              isUnderManipulation = true;
            } else {
              isUnderManipulation = true;
            };
          }
        }

        // Hide outcome
        // ---------------------------
        var toHideOutcome = !endExperiment ? checkIfToHideOutcome(subData, settings.hideOutcome, dayOfExperiment, isUnderManipulation, settings.experimentalDayStartingHour, group, completeEntriesToday) : false;

      } else { // if it is the first entry
        isWin = settings.rewards.enforceFirstEntryWinSecondEntryNoWin ? false : checkWinning(subData, settings.rewards.isRatioSchedule, settings.rewards.winningChancePerUnit(), settings.rewards.winAnywayIfMultipleNonWins);
        // dayOfExperiment = 1;
        var resetContainer = false;
      }
    }
    let cost = InitializeCost(settings.cost)
    let reward = isWin ? assignReward(settings.rewards) : 0; // set reward value if winning, or set to 0 if not
    let baselineAccumulatedReward = getBaselineAccumulatedReward(subData, settings); // Get Accumulated Reward Baseline (i.e., before this trial)

    var dataToSave = {
      subId: data_helper.get_subject_id(),
      group: group,
      day: dayOfExperiment,
      isWin: isWin,
      reward: reward,
      cost: cost,
      baselineAccumulatedReward: baselineAccumulatedReward,
      resetContainer: resetContainer,
      manipulationToday: whichManipulation,
      activateManipulation: activateManipulation,
      isUnderManipulation: isUnderManipulation,
      consumptionTest: consumptionTest,
      hideOutcome: toHideOutcome,
      isFirstTime: isFirstTime,
      endExperiment: endExperiment,
      showInstructions: false,
      isDemo: isDemo,
      demoTrialNum: demoTrialNum,
    };
    return dataToSave;
  },
  isManipulation: function (runData, settings) {
    if (!!settings.forceDeval)
      return settings.forceDeval;

    if (runData.activateManipulation)
      return runData.manipulationToday;

    return null;
  },
  // calculateReward: function (subData, coinCollectionTask, dayToFinishExperiment) {
  //   // regular cost and reward:
  //   var accumulatedValidReward = subData.reward.filter((x, i) => !subData.isDemo[i] && !!subData.endTime[i] && !(!!subData.isUnderManipulation[i] && subData.manipulationToday[i] === 'devaluation') && x !== undefined).reduce((a, b) => a + b, 0);
  //   var totalCost = subData.cost.filter((x, i) => !subData.isDemo[i] && subData.startTime[i] && x !== undefined && subData.day[i] < dayToFinishExperiment && !subData.endExperiment[i]).map((x => x[0]))
  //     .concat(subData.cost.filter((x, i) => !subData.isDemo[i] && subData.press1Time[i] && x !== undefined && subData.day[i] < dayToFinishExperiment && !subData.endExperiment[i]).map((x => x[1])))
  //     .concat(subData.cost.filter((x, i) => !subData.isDemo[i] && subData.press2Time[i] && x !== undefined && subData.day[i] < dayToFinishExperiment && !subData.endExperiment[i]).map((x => x[2])))
  //     .filter((x) => !!x).reduce((a, b) => a + b, 0);
  //   // coins task:
  //   var coinsTaskStillValued = subData.coin_task_finish_status.filter((x, i) => x !== undefined && !subData.isDemo[i] && !!subData.activateManipulation[i] && !!subData.endTime[i] && subData.manipulationToday[i] === 'still_valued')
  //   var coinsTaskDevalued = subData.coin_task_finish_status.filter((x, i) => x !== undefined && !subData.isDemo[i] && !!subData.activateManipulation[i] && !!subData.endTime[i] && subData.manipulationToday[i] === 'devaluation')
  //   var coinsTaskStillValued_PostDeval = subData.coin_task_finish_status.filter((x, i) => x !== undefined && !subData.isDemo[i] && !!subData.activateManipulation[i] && !!subData.endTime[i] && subData.manipulationToday[i] === 'still_valued_post_deval')
  //   var coinsTaskStillValued_ReplacingDeval = subData.coin_task_finish_status.filter((x, i) => x !== undefined && !subData.isDemo[i] && !!subData.activateManipulation[i] && !!subData.endTime[i] && subData.manipulationToday[i] === 'still_valued_replacing_devaluation')
  //   const rewardFromCoinTasks = (coinsTaskStillValued.map((x) => x.total_gold_collected).reduce((total, num) => total + num, 0) +
  //     coinsTaskStillValued_PostDeval.map((x) => x.total_gold_collected).reduce((total, num) => total + num, 0) +
  //     coinsTaskStillValued_ReplacingDeval.map((x) => x.total_gold_collected).reduce((total, num) => total + num, 0)) *
  //     coinCollectionTask.rewardPerCoinStash(); // Only from the 'still-valued' counts;
  //   const costFromCoinsTasks = (coinsTaskStillValued.map((x) => x.total_presses).reduce((total, num) => total + num, 0) +
  //     coinsTaskDevalued.map((x) => x.total_presses).reduce((total, num) => total + num, 0) +
  //     coinsTaskStillValued_PostDeval.map((x) => x.total_presses).reduce((total, num) => total + num, 0) +
  //     coinsTaskStillValued_ReplacingDeval.map((x) => x.total_presses).reduce((total, num) => total + num, 0)) *
  //     coinCollectionTask.costPerPress; // From both the 'still-valued' and 'devaluation' counts;

  //   return accumulatedValidReward + rewardFromCoinTasks - totalCost - costFromCoinsTasks
  // },
  getCost: function (runData, settings, cost_on) {
    return settings.cost.isCost
      && settings.cost.presentCost
      && (runData.cost.length > cost_on)
      && runData.cost[cost_on];
  },
  cost_on: {
    entrance: 0,
    click1: 1,
    click2: 2
  }
};

/*
// for Johnatan
* manipulationToday -
  null - do nothing special
  devaluation - at some point of the day (when activateManipulation returns true) show a image of a full piggybank (in the middle of the screen) along with a message that the subject needs to confirm (and in future start a the coin collection task). This will happen after the participants will receive the coin (always the case the activateManipulation is true). It is best if there will be a small animation with the piggybank, say blinking a few times.
  still_valued - The exact same as in ‘devaluation’ only the image will consist a half full piggy bank.
* activateManipulation - when true do as described in manipulationToday (will never be true when manipulationToday is null)
* isUnderManipulation - Currently nothin to do. in the future a curtain will probably cover the center of the screen to prevent from participants from seeing the results of their entry (the reason not to implement it yet is that we might put the curtain earlier on the days of manipulation.
* isWin - if true show a coin and some text saying ‘you won’ (and the amount of the ‘reward’ variable). If false show a text message of not winning.
* reward - use the amount for the text message in case of winning as pointed above.
* cost - in case that app_settings.cost.isCost app_settings.cost.presentCost are set to true, show the cost amount in red in the upper right corner. The cost is set to be an array either of length 1 which imply a one time cost implemented after entering the app )before they can press it). The other option is 3 (as for now where the sequence includes 2 presses) and then in addition to the first indication of cost upon entry following each button press and indication of loss will be presented.
* day - irrelevant for the flow. Maybe in future I’ll set an endDay variable and then if they are the same etc the participants will get noticed that the experiment is completed.
* startTime - the time recorded on entry. Maybe useful to set stuff with respect to the startTime if it is necessary or convenient.
* isFirstTime - boolean indicating the first time participants entered the app.
*/


//// I created but not in use for now...:
//// Check if the time to reset the container has arrived (i.e., it's a new day):
//lastEntry=new Date(subData.startTime[subData.startTime.length-1])
//lastEntryDateArray=[lastEntry.getDate(), lastEntry.getMonth(), lastEntry.getFullYear()]
//todayDate = [new Date().getDate(), new Date().getMonth(), new Date().getFullYear()]
//firstEntryToday = JSON.stringify(todayDate) !== JSON.stringify(lastEntryDateArray)




//var person = prompt(app_settings.text.rewardContainerClearingMessage, "Harry Potter");
