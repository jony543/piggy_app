// ****************************************************************
//                           FUNCTIONS:
// ---------------------------------------------------------------
function setCounterBalancedStuff(subID, backGroundStim) {
    // initiate relevant stimuli:
    let firstDevalDay = [];
    let coin = [];
    let lastDevalDay = [];
    // define stimuli assignment and days of devaluation to counterbalance (there are 8 options):
    switch (subID % 8) {
      case 0:
        firstDevalDay = optionalDaysForFirstDeval[0];
        coin = optionalCoins[0];
        lastDevalDay = optionalDaysForLastDeval[0];
        break;
      case 1:
        firstDevalDay = optionalDaysForFirstDeval[0];
        coin = optionalCoins[0];
        lastDevalDay = optionalDaysForLastDeval[1];
        break;
      case 2:
        firstDevalDay = optionalDaysForFirstDeval[0];
        coin = optionalCoins[1];
        lastDevalDay = optionalDaysForLastDeval[0];
        break;
      case 3:
        firstDevalDay = optionalDaysForFirstDeval[0];
        coin = optionalCoins[1];
        lastDevalDay = optionalDaysForLastDeval[1];
        break;
      case 4:
        firstDevalDay = optionalDaysForFirstDeval[1];
        coin = optionalCoins[0];
        lastDevalDay = optionalDaysForLastDeval[0];
        break;
      case 5:
        firstDevalDay = optionalDaysForFirstDeval[1];
        coin = optionalCoins[0];
        lastDevalDay = optionalDaysForLastDeval[1];
        break;
      case 6:
        firstDevalDay = optionalDaysForFirstDeval[1];
        coin = optionalCoins[1];
        lastDevalDay = optionalDaysForLastDeval[0];
        break;
      case 7:
        firstDevalDay = optionalDaysForFirstDeval[1];
        coin = optionalCoins[1];
        lastDevalDay = optionalDaysForLastDeval[1];
        break;
    }
    if (backGroundStim === 'A') { // this one is redundant and is here just to maintain similar loading time...
      firstDevalDay = optionalDaysForFirstDeval.find(element => element === firstDevalDay)
      coin = optionalCoins.find(element => element === coin)
      lastDevalDay = optionalDaysForLastDeval.find(element => element === lastDevalDay)
    } else if (backGroundStim === 'B') {
      firstDevalDay = optionalDaysForFirstDeval.find(element => element !== firstDevalDay)
      coin = optionalCoins.find(element => element !== coin)
      lastDevalDay = optionalDaysForLastDeval.find(element => element !== lastDevalDay)
    } else { //THAN IT'S A DEMO (when the stim is neither A or B):
      window.location.replace("invalidUrlEntry.html")
    }
    
    // set backgroun and container: - NOT NEEDED IN THE NEW VERSION
    //document.body.style.backgroundImage = 'url("embedded/container_' + coin + '_empty.png"), url("embedded/context_' + backGroundStim + '.png")'; 
    
    return { backGroundStim, coin, firstDevalDay, lastDevalDay };
}

function checkWinning(chancePerSec, secsFromLastEntry) {
  chanceOfAtleast1Winning = 1 - Math.pow(1 - chancePerSec, secsFromLastEntry); // I verified that it does the job correctly :)
  return Math.random() < chanceOfAtleast1Winning;
}

// ****************************************************************
//                           PARAMETERS:
// ---------------------------------------------------------------
isInstallation = false;
// define rewards:
// ----------------
// contingency:
let winningRate = 60; // on average in seconds
let chancePerSec = 1 / winningRate;
// winningSum: (will be computed unifomly in the given range)
let minWinningSum = 10;
let maxWinningSum = 20;
// optional stuff for counterbalance:
let optionalDaysForFirstDeval = [3, 4];
let optionalDaysForLastDeval = [8, 9];
let optionalCoins = ['gold', 'silver'];
// days to base upon first devluation time:
let daysToBaseUponFirstDeval = [2];
let daysToBaseUponLastDeval = [6, 7];

// text presented in the experiment: 
let welcomeText = 'שלום';
let winningText = 'זכית ב- ';
let noWinningText = '...לא זכית הפעם';
let goodbyeText = 'נתראה בפעם הבאה'
let devaluationNotificationText = 'הקופה מלאה, לא ניתן לצבור בה עוד כסף עד מחר.\nלחצ/י על ok כדי לאשר.';
let verifyBeginningText = 'לחצ/י אשר כדי להתחיל.';

// ****************************************************************
// Initialize variables:

let notifyDevaluation = false;
let isDevalued = 0;

// ****************************************************************
// get counter-balanced stuff:
let stimuliAssignment = setCounterBalancedStuff(jatos.workerId, 'A');
coin = stimuliAssignment.coin;
firstDevalDay = stimuliAssignment.firstDevalDay;
lastDevalDay = stimuliAssignment.lastDevalDay;

var logic = {
	initialize: function(subData, backGroundStim) {
    if (!!subData.length) { // if there is some data for this subject
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
            //document.body.style.backgroundImage = document.body.style.backgroundImage.replace('empty', 'full')
          }
        }
      }

      // REWARDS (set value [if winning])
      // --------------------------
      let non_rounded_reward = isWin ? Math.random() * (maxWinningSum - minWinningSum) + minWinningSum : 0;
      reward = Math.round(non_rounded_reward * 100) / 100; // just making it rounded to two decimal points.

      var dataToSave = { subID: jatos.workerId, context: backGroundStim, coin: coin, devalueToday: devalueToday, isDevalued: isDevalued, isWin: isWin, reward: reward, day: dayOfExperiment, startTime: new Date(), time: 'start', isFirstTime: false };
      return dataToSave;                
    } else {
      // SET FIRST ENTRY STUFF (isWin, day, devaluation)
      // --------------------------
      isWin = checkWinning(chancePerSec, 1);
      dayOfExperiment = 1;
      devalueToday = false;

      return { isFirstTime: true }
    }
  },
	finish: function () {
		return jatos.submitResultData(results);
	}
};