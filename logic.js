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

// ****************************************************************
//           LOGIC / Run Data (calculate run parameters):
// ----------------------------------------------------------------
var logic = {
  initialize: function (subData, settings) {
    // Get counter-balanced stuff and Initialize variables:
    [firstDevalDay, lastDevalDay, firstComparableValDay, lastComparableValDay] = setCounterBalancedStuff(jatos.workerId, app_settings);
    let isUnderManipulation = false;
    let whichManipulation = null;
    let notifyManipulation = false;

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
        whichManipulation=['devaluation', 'still_valued'].filter((item, i) => [devalueToday, comparableValuedToday][i])[0];
      };

      // OPERATE DEVALUATION DAY
      devalueToday = true //************** TEMP TEMP TEMP */
      dayOfExperiment=4
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

        if (new Date() >= timeToManipulate) {
          // check if this is the first time the outcome should be devalued that day
          debugger
          if (subData.day[subData.day.length-1] !== dayOfExperiment || // activate anyway if last entry was yesterday
            (!subData.wasManipulationActivated[subData.wasManipulationActivated.length-1] && !subData.isUnderManipulation[subData.isUnderManipulation.length-1])|| // activate if in the last entry today it was not activated and we are not already under the manipulation (i.e., it was induced before the last entry)
            (subData.wasManipulationActivated[subData.wasManipulationActivated.length-1] && !!subData.endTime[subData.endTime.length-1])) { // activate if in the last entry today it was activated but participants didn't confirm [namely there is an endTime to previous entry]
            notifyManipulation = true;
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
    let reward = isWin ? assignReward(settings.rewards) : 0; // set reward value if winning, or set to 0 if not  
    var dataToSave = { subID: jatos.workerId, manipulationToday: whichManipulation, wasManipulationActivated: notifyManipulation, isUnderManipulation: isUnderManipulation, isWin: isWin, reward: reward, day: dayOfExperiment, startTime: startTime, isFirstTime: isFirstTime };
    return dataToSave;
  }
};
