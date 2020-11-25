// Get time of entry
var startTime = new Date();

// ****************************************************************
//                           FUNCTIONS:
// ---------------------------------------------------------------
function setCounterBalancedStuff(subID, settings) {
  // initiate relevant stimuli:
  let firstDevalDay = [];
  let lastDevalDay = [];
  // define stimuli assignment and days of devaluation to counterbalance (there are 8 options):
  switch (subID % 4) {
    case 0:
      firstDevalDay = settings.optionalDaysForFirstDeval[0];
      lastDevalDay = settings.optionalDaysForLastDeval[0];
      break;
    case 1:
      firstDevalDay = settings.optionalDaysForFirstDeval[1];
      lastDevalDay = settings.optionalDaysForLastDeval[0];
      break;
    case 2:
      firstDevalDay = settings.optionalDaysForFirstDeval[0];
      lastDevalDay = settings.optionalDaysForLastDeval[1];
      break;
    case 3:
      firstDevalDay = settings.optionalDaysForFirstDeval[1];
      lastDevalDay = settings.optionalDaysForLastDeval[1];
      break;
  }
  firstComparableValDay = settings.optionalDaysForFirstDeval.find(element => element !== firstDevalDay)
  lastComparableValDay = settings.optionalDaysForLastDeval.find(element => element !== lastDevalDay)

  return [firstDevalDay, lastDevalDay, firstComparableValDay, lastComparableValDay];
}

function getTimeFromLastEntryInSec(timePoint) {
  const currentTime = new Date();
  const diffTime = Math.abs(currentTime - timePoint);
  const diffSeconds = Math.floor(diffTime / (1000));
  // console.log(diffTime + " milliseconds");
  // console.log(diffSeconds + " days");
  return diffSeconds;
}

function checkWinning(subData, isRatioSchedule, winningChancePerUnit, winAnywayIfMultipleNonWins) {
  if (isRatioSchedule) { // RI schedule
    if (winAnywayIfMultipleNonWins && subData.viewedOutcome && subData.viewedOutcome.length >= app_settings.rewards.RelativeNonWinUnitsBeforeSureWinning()) { // If sure win following no wins is on and it's not the beginning check last wins
      const indicesWithViewingOutcome = subData.viewedOutcome.multiIndexOf(true)
      const relevantIndicesToCheck = indicesWithViewingOutcome.slice(length - app_settings.rewards.RelativeNonWinUnitsBeforeSureWinning())
      if (!relevantIndicesToCheck.filter((x) => subData.isWin[x]).length) { // this checks if there was no win in the relevant times.
        return true
      }
    }
    return Math.random() < winningChancePerUnit;
  } else { // namely a VI schedule
    if (!!Object.keys(subData).length) { // if there is some data for this subject
      if (winAnywayIfMultipleNonWins && subData.viewedOutcome && subData.viewedOutcome.length >= app_settings.rewards.RelativeNonWinUnitsBeforeSureWinning()) { // If sure win following no wins is on and it's not the beginning check last wins
        const ms_per_second = 1000;
        const timeToCheckBack = new Date(new Date() - ms_per_second * app_settings.rewards.RelativeNonWinUnitsBeforeSureWinning())
        const firstEntryAfterTimeToCheck = subData.outcomeTime.find((x) => new Date(x) > timeToCheckBack)
        const relevantentries = subData.viewedOutcome.slice(subData.outcomeTime.indexOf(firstEntryAfterTimeToCheck))
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
    return Math.round(non_rounded_reward * 100) / 100; // just making it rounded to two decimal points.  
  }
}

// resolving in what time of the day to devalue (or induce the alternative still-valued manipulation):
function getManipulationStartingTime(subData, daysToBaseUponManipulation, referenceDayPrecentile) {
  const entryTimes2BaseManipulationIndices = [].concat.apply([], daysToBaseUponManipulation.map(x => subData.day.multiIndexOf(x))); // get relevant indices of the relevant times
  const entryTimes2BaseManipulation = subData.startTime.slice(Math.min(...entryTimes2BaseManipulationIndices), Math.max(...entryTimes2BaseManipulationIndices) + 1).map(x => new Date(x)); // get the relevant times (startTime)
  const copyOfEntryTimes2BaseManipulation = subData.startTime.slice(Math.min(...entryTimes2BaseManipulationIndices), Math.max(...entryTimes2BaseManipulationIndices) + 1).map(x => new Date(x)); // a copy of the previous var
  const timeZeroOfTheseDays = entryTimes2BaseManipulation.map((x, ind) => x - copyOfEntryTimes2BaseManipulation[ind].setHours(0, 0, 0, 0)); // using the copy to calculate the in each day (in ms I think) regardless of the data
  sortWithIndices(timeZeroOfTheseDays); // sort and add an object of sorted indices
  const sortedEntryTimes2BaseManipulationTime = timeZeroOfTheseDays.sortIndices.map(x => entryTimes2BaseManipulation[x]); // sort the entry times regardless of date...
  const timeToManipulate = sortedEntryTimes2BaseManipulationTime[Math.floor((sortedEntryTimes2BaseManipulationTime.length - 1) * referenceDayPrecentile)]; // get the time from which to devalue/still-valued manipulation (according to the median; if even taking the earlier); * if referenceDayPrecentile=0.5 it will take the median, 0.25 quarter of the presses in a day etc.
  timeToManipulate.setFullYear(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()); // change the date to today (without changing the time.
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

function checkIfToHideOutcome(hideOutcome) {
  if (hideOutcome.hide) { // If to hide outcomes
    if (isUnderManipulation && hideOutcome.hideOnlyUnderManipulationPeriods) { // If it's manipulation time and hiding is on only during manipulations.
      return true;
    } else if (!hideOutcome.hideOnlyUnderManipulationPeriods && hideOutcome.daysToHideAt.includes(dayOfExperiment)) {
      const timeToHideOutcome = getManipulationStartingTime(subData, hideOutcome.daysToBaseUponHidingTime[hideOutcome.daysToHideAt.indexOf(dayOfExperiment)], hideOutcome.relativeTimeOfDayToStart) // according to the median time in specified days
      if (new Date() >= timeToHideOutcome) {
        return true;
      }
    }
  }
  return false;
}

function checkIfResetContainer(subData, dayOfExperiment) {
  if (!subData.day.filter((day) => day === dayOfExperiment).length || // if there were no entries today (i.e., it's the first one)
    subData.resetContainer[subData.resetContainer.length - 1] && !subData.endTime[subData.endTime.length - 1]) { // or there were entries but the trial was not finished
    return true
  } else {
    return false
  }
}

// ****************************************************************
//           LOGIC / Run Data (calculate run parameters):
// ----------------------------------------------------------------
var logic = {
  initialize: function (subData, settings) {
    const noDataYet = !Object.keys(subData).length; // check if this is the first entry

    // check if running localy or on the server and determine if called from within the instructions (for the the embedded demo):
    if (!!jatos.isLocalhost)
      var isCalledFromInstructions = document.referrer.replace(/^.*[\\\/]/, '') === settings.instructionsFileName;
    else {
      var isCalledFromInstructions = document.referrer.includes('srid') // this returns true only if called from the instructions as it is currently designed
    }

    // CHECK IF INSTRUCTIONS
    // -------------------------------------------------------
    if (settings.allowInstructions) {
      if (!noDataYet) {
        var instructionCompletion = subData.completedInstructions.filter((x) => x !== undefined);
        instructionCompletion = instructionCompletion[instructionCompletion.length - 1];
      }
      if (!isCalledFromInstructions && (noDataYet || !instructionCompletion)) {
        var dataToSave = {
          subID: jatos.workerId,
          startInstructionsTime: startTime,
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

      var dayOfExperiment = null
      let demoVars = settings.demoCycle[demoTrialNum % Object.keys(settings.demoCycle).length]
      // assign the variables for the demo:
      isWin = demoVars.isWin
      whichManipulation = demoVars.whichManipulation
      activateManipulation = demoVars.activateManipulation
      isUnderManipulation = demoVars.isUnderManipulation
      consumptionTest = demoVars.consumptionTest
      var toHideOutcome = demoVars.toHideOutcome
      var resetContainer = demoVars.resetContainer

    } else {

      // Get counter-balanced stuff and Initialize variables:
      [firstDevalDay, lastDevalDay, firstComparableValDay, lastComparableValDay] = setCounterBalancedStuff(jatos.workerId, app_settings);
      var isUnderManipulation = false;
      var whichManipulation = null;
      var activateManipulation = false;
      var consumptionTest = false;

      if (!isFirstTime) { // if there is some data for this subject (i.e., not the first entry)

        isWin = checkWinning(subData, settings.rewards.isRatioSchedule, settings.rewards.winningChancePerUnit(), settings.rewards.winAnywayIfMultipleNonWins);

        // DEVALUATION / STILL-VALUED tests(check and set)
        // -------------------------------------------------------
        const expStartingTime = new Date(subData["startTime"].find((x) => !!x)); // finds the first element with a valid IDBCursorWithValue.
        daysFromBeginning = dateDiff(expStartingTime, new Date(), settings.experimentalDayStartingHour); // "new Date()" is getting the current time.
        dayOfExperiment = daysFromBeginning + 1;
        devalueToday = dayOfExperiment === firstDevalDay || dayOfExperiment === lastDevalDay ? true : false; // [NOTE] beforehand I used daysFromBeginning instead of dayOfExperiment
        comparableValuedToday = dayOfExperiment === firstComparableValDay || dayOfExperiment === lastComparableValDay ? true : false; // [NOTE] beforehand I used daysFromBeginning instead of dayOfExperiment    
        if (devalueToday || comparableValuedToday) {
          whichManipulation = ['devaluation', 'still_valued'].filter((item, i) => [devalueToday, comparableValuedToday][i])[0];
        };

        // OPERATE DEVALUATION DAY
        // ---------------------------
        if (devalueToday || comparableValuedToday) {
          // resolving which days to base devaluation time on:
          switch (dayOfExperiment) {
            case firstDevalDay:
            case firstComparableValDay:
              daysToBaseUponManipulation = settings.daysToBaseUponFirstDeval;
              break;
            case lastDevalDay:
            case lastComparableValDay:
              daysToBaseUponManipulation = settings.daysToBaseUponLastDeval;
              break;
          }

          // resolving in what time of the day to devalue (or induce the alternative still-valued manipulation):
          const timeToManipulate = getManipulationStartingTime(subData, daysToBaseUponManipulation, settings.referenceDayPrecentileForManipulation) // according to the median time in specified days

          if (new Date() >= timeToManipulate) {
            // check if this is the first time the outcome should be devalued that day
            if (subData.day[subData.day.length - 1] !== dayOfExperiment || // activate anyway if last entry was yesterday
              (!subData.activateManipulation[subData.activateManipulation.length - 1] && !subData.isUnderManipulation[subData.isUnderManipulation.length - 1]) || // activate if in the last entry today it was not activated and we are not already under the manipulation (i.e., it was induced before the last entry)
              //(subData.activateManipulation[subData.activateManipulation.length - 1] && !subData.manipulationConfirmationTime[subData.manipulationConfirmationTime.length - 1])) { // activate if in the last entry today it was activated but participants didn't confirm [namely there is no manipulationConfirmationTime to previous entry]
              // I replaced in the condition above the manipulationConfirmationTime variable with simply checking the endTime instead (the new line here below). If I'd want to change it back I also need to put it back in the settings in the definition of the variables.
              (subData.activateManipulation[subData.activateManipulation.length - 1] && !subData.endTime[subData.endTime.length - 1])) { // activate if in the last entry today it was activated but participants didn't confirm [namely there is no manipulationConfirmationTime to previous entry]
              activateManipulation = true;
              consumptionTest = true;
              isWin = true; // On the devaluation indication time there is a certain win...
            } else {
              isUnderManipulation = true;
            };
          }
        }

        // Hide outcome
        // ---------------------------
        var toHideOutcome = checkIfToHideOutcome(settings.hideOutcome);

        // Reset container
        // ---------------------------
        var resetContainer = settings.rewards.notifyRewardContainerReset && dayOfExperiment > 1 ? checkIfResetContainer(subData, dayOfExperiment) : false; // check if reset container

      } else { // if it is the first entry
        isWin = checkWinning(subData, settings.rewards.isRatioSchedule, settings.rewards.winningChancePerUnit(), settings.rewards.winAnywayIfMultipleNonWins);
        dayOfExperiment = 1;
        var resetContainer = false;
      }
    }
    let cost = InitializeCost(settings.cost)
    let reward = isWin ? assignReward(settings.rewards) : 0; // set reward value if winning, or set to 0 if not  

    var dataToSave = {
      subID: jatos.workerId,
      day: dayOfExperiment,
      isWin: isWin,
      reward: reward,
      cost: cost,
      resetContainer: resetContainer,
      manipulationToday: whichManipulation,
      activateManipulation: activateManipulation,
      isUnderManipulation: isUnderManipulation,
      consumptionTest: consumptionTest,
      hideOutcome: toHideOutcome,
      isFirstTime: isFirstTime,
      startTime: startTime,
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
  getCost: function (runData, settings, cost_on) {
    return settings.cost.isCost
      && settings.cost.presentCost
      && (runData.cost.length > (cost_on - 1))
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

