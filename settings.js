// ****************************************************************
//                           PARAMETERS:
// ---------------------------------------------------------------

window.app_settings = {
	pressesRequired: 2,
	isInstallation: false,
	forceDeval: null, // for debugging purposes
	// optional stuff for counterbalance:
	optionalDaysForFirstDeval: [3, 4], // The day not chosen for devaluation will be used as a comparable valued day
	optionalDaysForLastDeval: [8, 9], // The day not chosen for devaluation will be used as a comparable valued day
	// days to base upon first devluation time:
	daysToBaseUponFirstDeval: [2],
	daysToBaseUponLastDeval: [6, 7],
	referenceDayPrecentileForManipulation: 0.5, // if referenceDayPrecentile=0.5 it will take the median, 0.25 quarter of the presses in a day etc.
	rewards: {
		isRatioSchedule: true,
		winningRate: 2, //per entries if isRatioSchedule is true; per seconds if isRatioSchedule is false, 
		winningChancePerUnit: function () {
			return 1 / this.winningRate;
		},

		isVariableReward: false,
		// for VariableReward (will be computed unifomly in the given range):
		minWinningSum: 20,
		maxWinningSum: 30,
		// for constant reward:
		rewardConstantSum: 25,

		// Sure win stuff:
		winAnywayIfMultipleNonWins: true, // this is to make sure that in case a participant did not win many times they will.
		RelativeNonWinUnitsBeforeSureWinning: function () {
			return this.winningRate * 2; // this means that if for example this is a variable ratio of 10, after 20 no wins the 21 attempt will be a sure win.
		},

		notifyRewardContainerReset: true,
		hourAtDayToResetRewardContainer: 5, //time at day to empty container according to a 24h watch, thus possiblie assignments are 0-23. Assign 0 to simply seperate between days.
	},
	cost: {
		isCost: true,
		isCostPerPress: true,
		isVariableCost: false,
		minCostSum: 1,
		maxCostSum: 5,
		// for constant cost:
		costConstantSum: 1,
		presentCost: true, // O'Doherty did not use visual feedback for the cost, Gillan did (in their MB-MF with devaluation study)
	},
	hideOutcome: {
		hide: false,
		// option 1:
		hideOnlyUnderManipulationPeriods: true, // if false will hide every day from what set in daysToHideAt
		// option 2: relevant if hideOnlyUnderManipulationPeriods is false;
		daysToHideAt: [2, 3, 4, 5, 8, 10, 12],
		daysToBaseUponHidingTime: [[1], [1, 2], [2, 3], [3], [5, 6, 7], [9], [10, 11]], // This should specify an array for each value in daysToHideAt
		relativeTimeOfDayToStart: 0.25, // if referenceDayPrecentile=0.5 it will take the median, 0.25 quarter of the presses in a day etc.
	},
	durations: { //in ms
		// every trial:
		entranceMessage: 1500,
		waitingForOutcomeAnim: 4500,
		minTimeToIndicateOutcomeViewing: 250,
		// manipulation:
		outcomeAnim: 2000,
		// animations:
		costAnim: 1000,
		surface_disappearance: 700,
	},
	text: {
		welcomeText: 'ששלום',
		winningText: 'זכית ב- ',
		noWinningText: '...לא זכית הפעם',
		goodbyeText: 'נתראה בפעם הבאה',
		devaluationNotificationText: 'הקופה מלאה, לא ניתן לצבור בה עוד כסף עד מחר.\nלחצ/י על ok כדי לאשר.',
		verifyBeginningText: 'לחצ/י אשר כדי להתחיל.',
		// alerts, prompts etc:
		rewardContainerClearingMessage: 'תא המטען של החללית פנוי לאיסוף זהב !',
		confirmationCodeTextMessage: '\nכדי לאשר שקראת יש לכתוב את האותיות: ',
		manipulationMessage: function (manipulationType) {
			if (manipulationType == 'devaluation') {
				return '** הקופה מלאה **\nלא ניתן לצבור בה עוד כסף עד מחר.\nלחצ/י על ok כדי לאשר.';
			} else if (manipulationType == 'still_valued') { // i.e., 'still_valued'
				return '** הקופה חצי מלאה **\n\nלחצ/י על ok כדי לאשר.';
			}
		},
		completeDemo: 'ההדגמה הסתיימה. אם ברצונך לסיים חלק זה ולהתחיל במשחק האמיתי יש לכתוב yes.\n כל דבר אחר. כדי לבצע סיבוב הדגמה נוסף יש ללחוץ על',
		realGameBegins: 'המשחק האמיתי מתחיל עכשיו.\nהזהב שייאסף מעכשיו שווה כסף אמיתי.\nבהצלחה!',
	},
	allowInstructions: true, // for debugging purpose.
	allowDemo: false,
	demoCycle: {
		0: { isWin: false, whichManipulation: null, activateManipulation: false, isUnderManipulation: false, toHideOutcome: false, resetContainer: false },
		1: { isWin: true, whichManipulation: null, activateManipulation: false, isUnderManipulation: false, toHideOutcome: false, resetContainer: false },
		2: { isWin: true, whichManipulation: 'still_valued', activateManipulation: true, isUnderManipulation: false, toHideOutcome: false, resetContainer: false },
		3: { isWin: true, whichManipulation: 'devaluation', activateManipulation: true, isUnderManipulation: false, toHideOutcome: false, resetContainer: false },
		4: { isWin: true, whichManipulation: 'devaluation', activateManipulation: false, isUnderManipulation: true, toHideOutcome: false, resetContainer: false },
		5: { isWin: false, whichManipulation: null, activateManipulation: false, isUnderManipulation: false, toHideOutcome: true, resetContainer: false },
		6: { isWin: false, whichManipulation: null, activateManipulation: false, isUnderManipulation: false, toHideOutcome: false, resetContainer: true },
	},
	dataVarList: ["serial", "subID", "day", "isWin", "reward", "cost", "resetContainer", "manipulationToday", "activateManipulation", "isUnderManipulation", "hideOutcome", "isFirstTime", "startTime", "press1Time", "press2Time", "outcomeTime", "endTime", "viewedOutcome", "manipulationAlertTime", "manipulationConfirmationTime", "showInstructions", "completedInstructions", "isDemo", "isDemoCompleted", "demoTrialNum"],
	// maybe remove unecessary ones (affects the list that is formed to work with in logic, not what is saved).
	// NOTE: the completedInstructions is assigned during the instructions upon success.
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
