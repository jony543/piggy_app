// ****************************************************************
//                           PARAMETERS:
// ---------------------------------------------------------------

window.app_settings = {
	pressesRequired: 2,
	isInstallation: false,
	// optional stuff for counterbalance:
	optionalDaysForFirstDeval: [3, 4], // The day not chosen for devaluation will be used as a comparable valued day
	optionalDaysForLastDeval: [8, 9], // The day not chosen for devaluation will be used as a comparable valued day
	// days to base upon first devluation time:
	daysToBaseUponFirstDeval: [2],
	daysToBaseUponLastDeval: [6, 7],
	referenceDayPrecentileForManipulation: 0.5, // if referenceDayPrecentile=0.5 it will take the median, 0.25 quarter of the presses in a day etc.
	rewards: {
		isRatioSchedule: true,
		winningRate: 2, //per entries if isRatioSchedule is true; per seonds if isRatioSchedule is false, 
		winningChancePerUnit : function() {
			return 1/ this.winningRate;
		  },
		isVariableReward: false,
		// for VariableReward (will be computed unifomly in the given range):
		minWinningSum: 20,
		maxWinningSum: 30,
		// for constant reward:
		rewardConstantSum: 25,
	},
	cost: {
		isCost: false,
		isCostPerPress: false,
		isVariableCost: false,
		minCostSum: 1,
		maxCostSum: 5,
		// for constant cost:
		costConstantSum: 1,
		presentCost: false, // O'Doherty did not use visual feedback for the cost, Gillan did (in their MB-MF with devaluation study)
	},
	hideOutcome: {
		hide: false,
		// option 1:
		hideOnlyUnderManipulationPeriods: true, // if false will hide every day from what set in daysToHideAt
		// option 2: relevant if hideOnlyUnderManipulationPeriods is false;
		daysToHideAt: [2, 3, 4, 5, 8, 10, 12], 
		daysToBaseUponHidingTime: [[1], [1,2], [2,3], [3], [5,6,7], [9], [10,11]], // This should specify an array for each value in daysToHideAt
		relativeTimeOfDayToStart: 0.25, // if referenceDayPrecentile=0.5 it will take the median, 0.25 quarter of the presses in a day etc.
	},
	text: {
		welcomeText: 'ששלום',
		winningText: 'זכית ב- ',
		noWinningText: '...לא זכית הפעם',
		goodbyeText: 'נתראה בפעם הבאה',
		devaluationNotificationText: 'הקופה מלאה, לא ניתן לצבור בה עוד כסף עד מחר.\nלחצ/י על ok כדי לאשר.',
		verifyBeginningText: 'לחצ/י אשר כדי להתחיל.',
	},
	dataVarList: ["serial", "subID", "day", "isWin", "reward", "cost", "manipulationToday", "activateManipulation", "isUnderManipulation", "hideOutcome", "isFirstTime", "startTime", "press1Time", "press2Time", "outcomeTime", "endTime", "viewedOutcome"],
}

// contingency:
/////////////// !!!!!!!!!!  chancePerSec: 1 / winningRate,
	// winningSum: (will be computed unifomly in the given range)
// Notes
// ------------
// The short-circuit (&&) and spread operater assinmgnet (...) used for the assinments here were based on the technique described here: https://stackoverflow.com/questions/11704267/in-javascript-how-to-conditionally-add-a-member-to-an-object/40560953#40560953
// * enetually I did not use it but it looks like this.
//		...(!this.isVariableReward && {
//			// winningSum: (will be computed unifomly in the given range)
//			minWinningSum: 20,
//			maxWinningSum: 30
//		})
