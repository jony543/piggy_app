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

function checkWinning(subData, isRatioSchedule, winningChancePerUnit) {
  if (isRatioSchedule) {
    return Math.random() < winningChancePerUnit;
  } else { // namely a VI schedule
    if (!!Object.keys(subData).length) { // if there is some data for this subject
      const lastEntryTime = new Date(subData.press2Time[subData.press2Time.length - 1]); // [NOTE] Make sure later it always takes the final line. Consider if this should be the start time or the endtime or reward time
      var secsFromLastEntry = getTimeFromLastEntryInSec(lastEntryTime);
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
function getManipulationStartingTime(subData, daysToBaseUponManipulation) {
  const entryTimes2BaseManipulationIndices = [].concat.apply([], daysToBaseUponManipulation.map(x => subData.day.multiIndexOf(x))); // get relevant indices of the relevant times
  const entryTimes2BaseManipulation = subData.startTime.slice(Math.min(...entryTimes2BaseManipulationIndices), Math.max(...entryTimes2BaseManipulationIndices) + 1).map(x => new Date(x)); // get the relevant times (startTime)
  const copyOfEntryTimes2BaseManipulation = subData.startTime.slice(Math.min(...entryTimes2BaseManipulationIndices), Math.max(...entryTimes2BaseManipulationIndices) + 1).map(x => new Date(x)); // a copy of the previos var
  const timeZeroOfTheseDays = entryTimes2BaseManipulation.map((x, ind) => x - copyOfEntryTimes2BaseManipulation[ind].setHours(0, 0, 0, 0)); // using the copy to calculate the in each day (in ms I think) regardless of the data
  sortWithIndices(timeZeroOfTheseDays); // sort and add an object of sorted indices
  const sortedEntryTimes2BaseManipulationTime = timeZeroOfTheseDays.sortIndices.map(x => entryTimes2BaseManipulation[x]); // sort the entry times regardless of date...
  const timeToManipulate = sortedEntryTimes2BaseManipulationTime[Math.floor((sortedEntryTimes2BaseManipulationTime.length - 1) / 2)]; // get the time from which to devalue/still-valued manipulation (according to the median; if even taking the earlier)
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

// ****************************************************************
//           LOGIC / Run Data (calculate run parameters):
// ----------------------------------------------------------------
var logic = {
  initialize: function (subData, settings) {
    // Get counter-balanced stuff and Initialize variables:
    [firstDevalDay, lastDevalDay, firstComparableValDay, lastComparableValDay] = setCounterBalancedStuff(jatos.workerId, app_settings);
    let isUnderManipulation = false;
    let whichManipulation = null;
    let activateManipulation = false;

    let isFirstTime = !Object.keys(subData).length;
    if (!isFirstTime) { // if there is some data for this subject (i.e., not the first entry)

      isWin = checkWinning(subData, settings.rewards.isRatioSchedule, settings.rewards.winningChancePerUnit());

      // DEVALUATION / STILL-VALUED tests(check and set)
      // -------------------------------------------------------
      const expStartingTime = new Date(subData["startTime"][0]);
      daysFromBeginning = dateDiff(expStartingTime, new Date()); // "new Date()" is getting the current time.
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
            daysToBaseUponDeval = settings.daysToBaseUponLastDeval;
            break;
        }

        // resolving in what time of the day to devalue (or induce the alternative still-valued manipulation):
        const timeToManipulate = getManipulationStartingTime(subData, daysToBaseUponManipulation) // according to the median time in specified days
debugger
        if (new Date() >= timeToManipulate) {
          // check if this is the first time the outcome should be devalued that day
          if (subData.day[subData.day.length - 1] !== dayOfExperiment || // activate anyway if last entry was yesterday
            (!subData.activateManipulation[subData.activateManipulation.length - 1] && !subData.isUnderManipulation[subData.isUnderManipulation.length - 1]) || // activate if in the last entry today it was not activated and we are not already under the manipulation (i.e., it was induced before the last entry)
            (subData.activateManipulation[subData.activateManipulation.length - 1] && !subData.endTime[subData.endTime.length - 1])) { // activate if in the last entry today it was activated but participants didn't confirm [namely there is an endTime to previous entry]
            activateManipulation = true;
            isWin = true; // On the devaluation indication time there is a certain win...
          } else {
            isUnderManipulation = true;
          };
        }
      }
    } else { // if it is the first entry
      isWin = checkWinning(subData, settings.rewards.isRatioSchedule, settings.rewards.winningChancePerUnit());
      dayOfExperiment = 1;
    }
    let cost = InitializeCost(settings.cost)
    let reward = isWin ? assignReward(settings.rewards) : 0; // set reward value if winning, or set to 0 if not  
    var dataToSave = { 
      subID: jatos.workerId, 
      manipulationToday: whichManipulation, 
      activateManipulation: activateManipulation, 
      isUnderManipulation: isUnderManipulation, 
      isWin: isWin, 
      reward: reward, 
      cost: cost, 
      day: dayOfExperiment, 
      startTime: startTime, 
      isFirstTime: isFirstTime 
    };
    return dataToSave;
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
