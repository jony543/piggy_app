// ****************************************************************
//                           PARAMETERS:
// ---------------------------------------------------------------

window.app_settings = {
	activateStep2: false, //just an example
	isInstallation: false,
	// optional stuff for counterbalance:
	optionalDaysForFirstDeval: [3, 4], // The day not chosen for devaluation will be used as a comparable valued day
	optionalDaysForLastDeval: [8, 9], // The day not chosen for devaluation will be used as a comparable valued day
	// days to base upon first devluation time:
	daysToBaseUponFirstDeval: [2],
	daysToBaseUponLastDeval: [6, 7],
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
	text: {
		welcomeText: 'ששלום',
		winningText: 'זכית ב- ',
		noWinningText: '...לא זכית הפעם',
		goodbyeText: 'נתראה בפעם הבאה',
		devaluationNotificationText: 'הקופה מלאה, לא ניתן לצבור בה עוד כסף עד מחר.\nלחצ/י על ok כדי לאשר.',
		verifyBeginningText: 'לחצ/י אשר כדי להתחיל.',
	},
	dataVarList: ["serial", "subID", "context", "coin", "manipulationToday", "wasManipulationActivated", "isUnderManipulation", "isWin", "reward", "day", "startTime", "time", "isFirstTime", "press1Time", "press2Time", "endTime"],
}

// contingency:
/////////////// !!!!!!!!!!  chancePerSec: 1 / winningRate,
	// winningSum: (will be computed unifomly in the given range)
// Notes
// ------------
// The short-circuit (&&) and spread operater assinmgnet (...) used for the assinments here were based on the technique described here: https://stackoverflow.com/questions/11704267/in-javascript-how-to-conditionally-add-a-member-to-an-object/40560953#40560953
// * enetually I did not use it bu tit looks like this.
//		...(!this.isVariableReward && {
//			// winningSum: (will be computed unifomly in the given range)
//			minWinningSum: 20,
//			maxWinningSum: 30
//		})
