// ****************************************************************
//                           PARAMETERS:
// ---------------------------------------------------------------

window.app_settings = {
	experimentalDayStartingHour: 5, // Possiblie assignments are 0-23. Assign 0 to simply seperate between days.  Relevant for example to determine the time at day to empty container according to a 24h watch. 
	pressesRequired: 2,
	forceDeval: null, // for debugging purposes
	// optional stuff for counterbalance:
	optionalDaysForFirstDeval: [3, 4], // The day not chosen for devaluation will be used as a comparable valued day
	optionalDaysForLastDeval: [8, 9], // The day not chosen for devaluation will be used as a comparable valued day
	// days to base upon first devluation time:
	daysToBaseUponFirstDeval: [2],
	daysToBaseUponLastDeval: [7], //[6, 7],
	referenceDayPrecentileForManipulation: 0.5, // if referenceDayPrecentile=0.5 it will take the median, 0.25 quarter of the presses in a day etc.
	manipulationImageID: function (manipulationType) {
		if (manipulationType == 'devaluation') {
			return 'warehouse_full';
		} else if (manipulationType == 'still_valued') { // i.e., 'still_valued'
			return 'warehouse_half';
		}
	},
	rewards: {
		isRatioSchedule: true,
		winningRate: 3, //per entries if isRatioSchedule is true; per seconds if isRatioSchedule is false, 
		winningChancePerUnit: function () {
			return 1 / this.winningRate;
		},

		isVariableReward: false,
		// for VariableReward (will be computed unifomly in the given range):
		minWinningSum: 20,
		maxWinningSum: 30,
		// for constant reward:
		rewardConstantSum: 15,

		// Sure win stuff:
		winAnywayIfMultipleNonWins: true, // this is to make sure that in case a participant did not win many times they will.
		RelativeNonWinUnitsBeforeSureWinning: function () {
			return this.winningRate * 2; // this means that if for example this is a variable ratio of 10, after 20 no wins the 21 attempt will be a sure win.
		},

		notifyRewardContainerReset: true,
	},
	cost: {
		isCost: true,
		isCostPerPress: false,
		isVariableCost: false,
		minCostSum: 1,
		maxCostSum: 5,
		// for constant cost:
		costConstantSum: 1,
		presentCost: true, // O'Doherty did not use visual feedback for the cost, Gillan did (in their MB-MF with devaluation study)
	},
	hideOutcome: {
		hide: true,
		// option 1:
		hideOnlyUnderManipulationPeriods: false, // if false will hide every day from what we set in daysToHideAt
		// option 2: relevant if hideOnlyUnderManipulationPeriods is false;
		daysToHideAt: [3, 4, 8, 9], // [2, 3, 4, 5, 8, 10, 12],
		daysToBaseUponHidingTime: [[2], [2], [7], [7]], // [[1], [1, 2], [2, 3], [3], [5, 6, 7], [9], [10, 11]], // This should specify an array for each value in daysToHideAt
		relativeTimeOfDayToStart: 0.25, // if referenceDayPrecentile=0.5 it will take the median, 0.25 quarter of the presses in a day etc.
	},
	durations: { //in ms
		// every trial:
		entranceMessage: 800,
		lotteryAnim: 3500,
		intervalBetweenLotteryAndOutcomeAnim: 2800,
		minTimeToIndicateOutcomeViewing: 250,
		// manipulation:
		outcomeAnim: 2000,
		intervalBetweenOutcomeAndNextThing: 1000,
		// animations:
		costAnim: 1500,
		surface_disappearance: 700,
	},
	text: {
		welcomeText: 'שלום',
		winningText: 'זכית ב- ',
		noWinningText: '...לא זכית הפעם',
		goodbyeText: 'נתראה בפעם הבאה',
		devaluationNotificationText: 'הקופה מלאה, לא ניתן לצבור בה עוד כסף עד מחר.\nלחצ/י על ok כדי לאשר.',
		verifyBeginningText: 'לחצ/י אשר כדי להתחיל.',
		// alerts, prompts etc:
		rewardContainerClearingMessage: 'חללית המטען רוקנה את המחסן וכעת הוא פנוי לצבירת זהב.',
		manipulationMessage: function (manipulationType) {
			if (manipulationType == 'devaluation') {
				return 'המחסן מלא!<br>לא ניתן לצבור בו עוד זהב עד שחללית המטען תרוקן אותו.';
			} else if (manipulationType == 'still_valued') { // i.e., 'still_valued'
				return 'המחסן מלא למחצה...';
			}
		},
		confirmationCodeTextMessage: '\nכדי לאשר שקראת יש לכתוב את האותיות: ',
		completeDemo: 'ההדגמה הסתיימה. אם ברצונך לסיים חלק זה ולהתחיל במשחק האמיתי יש לכתוב yes.\n כל דבר אחר. כדי לבצע סיבוב הדגמה נוסף יש ללחוץ על',
		realGameBegins: 'המשחק האמיתי מתחיל עכשיו.<br>הזהב שתצבור/תצברי מעכשיו שווה כסף אמיתי.<br><br>בהצלחה!',
		dialog_coinCollection: 'מצאת מערת זהב. במערה אבנים וזהב. כל נסיון לאסוף משהו (כלומר לחיצה) עולה 1 יחידות זהב. הזהב שייאסף יישמר במחסן במידה ויש בו מקום. מרגע שתיכנס/י אליה יש לך 5 שניות לשהות בה.'
	},
	coinCollectionTask: {
		includeRocks: true,
		duration: 5, // in seconds
		openningAnimTime: 1500, // in ms
		element_disappearing_time: 150, // in ms
		nStim: 30, // needs to be an even number here
		bg_img_path: 'images/cave.jpg',
		outcome_win_image_path: 'images/outcome_win.png',
		outcome_no_win_image_path: 'images/outcome_no_win.png',
		outcomeImageHeightWidthRatio: 325 / 349, // namely the height = 325 and width = 349	
		stimSizeProportionOfScreen: 0.15, // will determine the size (width and height of the stimuli)
		textSizeProportionOfScreenWidth: 0.15,
		ProportionOfScreenWidthToPlaceCounter: 0.9,
		ProportionOfScreenHeightToPlaceCounter: 0.05,
		counterTextColor: [0, 0, 255], // can be one value for gray, 3 for RGB, 4 to include alpha
		finishMessageTextColor: [0, 0, 255], // can be one value for gray, 3 for RGB, 4 to include alpha
		finishMessage: "להתראות",
	},
	allowInstructions: true, // for debugging purpose.
	allowDemo: true,
	demoCycle: {
		0: { isWin: true, whichManipulation: null, activateManipulation: false, isUnderManipulation: false, toHideOutcome: false, resetContainer: false, consumptionTest: false },
	},
	demoCycleSupportingText: {
		0: {
			a: 'הכנו לך הדגמה עם מסך וירטואלי שמדמה סמארטפון.<br>לחצ/י על האפליקציה כדי לשגר את החללית שלך למשימת חיפוש זהב. תחילה תראה/י את החללית נוחתת ומימין למעלה תופיע עלות שליחת החללית למשימה (1-).',
			b: 'כעת לחצ/י על חציו התחתון של המסך ואז על חלקו העליון כדי להסיר את הקרח ולאפשר את חיפוש הזהב. לאחר מספר שניות של חיפוש תופיע התוצאה.',
			c: 'בסיבוב הזה מצאת זהב!<br>מיד לאחר מכן הופיעה הודעת הסיום ("נתראה בפעם הבאה"). כשההודעה מופיעה זה אומר שתוצאת החיפוש נשמרה ואפשר לצאת מהאפליקציה. כדי לצאת מהאפליקציה בהדגמה לחצ/י על כפתור הבית הוירטואלי שמופיע על ציור הסמארטפון.',
		},
		1: 'עכשיו תבצע/י מספר כניסות ויציאות מהאפליקציה ונדגים אפשרויות שונות.<br>כעת ניתן להיכנס ולהסיר את הקרח.<br>הפעם לא תמצא זהב (רק אבנים חסרות ערך).',
		2: 'בכניסה הבאה נדגים קבלת דיווח שהמחסן מלא למחצה.',
		3: 'הפעם נדגים קבלת דיווח שהמחסן מלא.',
		4: 'בתחילת הסיבוב הבא תקבל/י דיווח שחללית המטען (זו שמרוקנת את המחסן על כוכב הזהב כל 24 שעות) רוקנה את המחסן.',
		5: 'בכניסה הבאה כוכב הזהב יהיה מכוסה בעננים ולא תוכל/י לראות את התוצאה של חיפוש הזהב<br>(גם כאן יש לחכות להודעת הסיום כדי שתוצאת החיפוש תישמר).',
		6: 'בסיבוב הבא תיתקל/י במערה עתירת זהב.<br>תקבל/י על כך הודעה ולאחריה יהיו לך 5 שניות בתוכה, בהן תוכל/י לאסוף ממה שבמערה.',
		7: 'לסיום: עד כה הדגמנו מקרים שונים לחוד אך במשחק עצמו הם יכולים להשתלב.<br>בלחיצה הבאה לדוגמא יהיה מעונן וגם תיתקל/י במערה עתירת זהב.',
	},
	instructionsFileName: 'instructions.html',
	n_instruction_pages: 3,
	instructions_test_questions: {
		toRandomizeQuestions: false,
		dont_know_answer: 'לא יודע/ת.',
		1: {
			question: 'האם יש עלות כלשהי לכניסה לאפליקציה (כלומר לנסיון מציאת זהב)?',
			correct_answer: 'כן, זה עולה 1 יחידות זהב.',
			distractor_1: 'אין עלות לכניסה, יש עלות רק לנסיון להוציא דברים ממערה.',
			distractor_2: 'כן, זה עולה 15 יחידות זהב.',
			distractor_3: 'כן, העלות משתנה בכל פעם.',
		},

	},
	// Meta stuff:
	instructions_HTML_title: 'Instructions',
	instructions_main_HTML_element: "jspsych-content",
	App_HTML_title: 'Space Gold',
	App_main_HTML_element: "main_container",
	dataVarList: ["serial", "subID", "day", "isWin", "reward", "cost", "resetContainer", "manipulationToday", "activateManipulation", "isUnderManipulation", "hideOutcome", "isFirstTime", "startTime", "press1Time", "press2Time", "outcomeTime", "endTime", "viewedOutcome", "manipulationAlertTime", "showInstructions", "instructionsStartedFlag", "completedInstructions", "isDemo", "demoTrialNum", "isDialogOn"],
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
