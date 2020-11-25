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
	manipulationImageID: function (manipulationType) {
		if (manipulationType == 'devaluation') {
			return 'warehouse_full';
		} else if (manipulationType == 'still_valued') { // i.e., 'still_valued'
			return 'warehouse_half';
		}
	},
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
		rewardConstantSum: 15,

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
		waitingForOutcomeAnim: 3500,
		minTimeToIndicateOutcomeViewing: 250,
		// manipulation:
		outcomeAnim: 2000,
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
		openningAnimTime: 1.5, // in seconds
		element_disappearing_time: 0.1, // in seconds
		nStim: 30, // needs to be an even number here
		bg_img_path: 'images/cave.jpg',
		outcome_win_image_path: 'images/outcome_win.png',
		outcome_no_win_image_path: 'images/outcome_no_win.png',
		outcomeImageHeightWidthRatio: 325 / 349, // namely the height = 325 and width = 349	
		stimSizeProportionOfScreen: 0.15, // will determine the size (width and height of the stimuli)
		textSizeProportionOfScreenWidth: 0.1,
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
		1: { isWin: false, whichManipulation: null, activateManipulation: false, isUnderManipulation: false, toHideOutcome: false, resetContainer: false, consumptionTest: false },
		2: { isWin: true, whichManipulation: 'still_valued', activateManipulation: true, isUnderManipulation: false, toHideOutcome: false, resetContainer: false, consumptionTest: false },
		3: { isWin: true, whichManipulation: 'devaluation', activateManipulation: true, isUnderManipulation: false, toHideOutcome: false, resetContainer: false, consumptionTest: false },
		4: { isWin: false, whichManipulation: null, activateManipulation: false, isUnderManipulation: false, toHideOutcome: false, resetContainer: true, consumptionTest: false },
		5: { isWin: false, whichManipulation: null, activateManipulation: false, isUnderManipulation: false, toHideOutcome: true, resetContainer: false, consumptionTest: false },
		6: { isWin: false, whichManipulation: null, activateManipulation: false, isUnderManipulation: false, toHideOutcome: false, resetContainer: false, consumptionTest: true },
		7: { isWin: false, whichManipulation: null, activateManipulation: false, isUnderManipulation: false, toHideOutcome: true, resetContainer: false, consumptionTest: true },
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
	n_instruction_pages: 1,
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
		2: {
			question: 'האם הסיכוי למצוא זהב משתנה בזמנים מסויימים?',
			correct_answer: 'לא, הסיכוי למצוא זהב זהה תמיד.',
			distractor_1: 'הסיכוי למצוא זהב משתנה כל הזמן.',
			distractor_2: 'הסיכוי למצוא זהב משתנה כשמעונן ואין אפשרות לראות אם מצאנו זהב.',
			distractor_3: 'אם לאחרונה מצאנו הרבה זהב הסיכוי למצוא עוד זהב קטן יותר ולהפך.',
		},
		3: {
			question: 'מה קורה אם המחסן מלא?',
			correct_answer: 'אין אפשרות לצבור עוד זהב שיילקח לכדור הארץ ויהפוך לכסף ממשי עבורי עד שירוקנו את המחסן עבורי בתום היממה (ב-5:00 לפנות בוקר).',
			distractor_1: 'אצטרך לשלוח באופן ישיר ומיידי את הזהב לכדור הארץ.',
			distractor_2: 'זה אומר שהמשחק נגמר.',
			distractor_3: 'המחסן לא יכול להתמלא אלא רק להתמלא באופן חלקי.',
		},
		4: {
			question: 'מה קורה אם המחסן מלא באופן חלקי?',
			correct_answer: 'שום דבר, זה רק עדכון. כל עוד המחסן אינו מלא לגמרי ניתן להמשיך לצבור בו זהב.',
			distractor_1: 'זה לא משהו שאדע עליו מפני שאין דיווחים על כך שהמחסן מלא רק באופן חלקי.',
			distractor_2: 'אין אפשרות לצבור עוד זהב שיילקח לכדור הארץ ויהפוך לכסף ממשי עבורי עד שירוקנו את המחסן עבורי בתום היממה (ב-5:00 לפנות בוקר).',
			distractor_3: 'אצטרך לשלוח באופן ישיר ומיידי את הזהב לכדור הארץ.',
		},
		5: {
			question: 'מה השווי של גושי הזהב שאני יכול/ה למצוא?',
			correct_answer: '15 יחידות זהב.',
			distractor_1: 'הסכום משתנה והוא יוצג בכל פעם בהתאם.',
			distractor_2: '1 יחידות זהב.',
			distractor_3: 'הסכום משתנה ואין לי אפשרות לדעת אותו.',
		},
		6: {
			question: 'לאחר שנכנסתי לאפליקציה, מתי אוכל לצאת ממנה כדי על מנת שתוצאת החיפוש תיחשב לי?',
			correct_answer: 'כאשר תופיעה הודעת הסיום (בה כתוב "נתראה בפעם הבאה").',
			distractor_1: 'מיד לאחר הכניסה.',
			distractor_2: 'מיד עם הופעתה של תוצאת החיפוש.',
			distractor_3: 'כשמופיעים עננים.',
		},
		7: {
			question: 'מה קורה כשמעונן על כוכב הלכת ואין לי אפשרות לראות את תוצאות החיפוש?',
			correct_answer: 'הכל ממשיך בדיוק אותו דבר. אין שינוי מלבד זה שאיני יכול/ה לראות את תוצאת החיפוש.',
			distractor_1: 'המשחק לא זמין בזמנים אלו ולכן עדיף לנסות מאוחר יותר.',
			distractor_2: 'אין עלות לכניסה.',
			distractor_3: 'אין לי אפשרות לצבור את הזהב במחסן.',
		},
		8: {
			question: 'כיצד אוכל להרוויח כסף אמיתי?',
			correct_answer: 'פשוט להיכנס לאפליקציה כדי לחפש זהב. במידה ומצאתי זהב ויש מקום במחסן, הזהב יילקח לכדור הארץ ויומר לכסף אמיתי. ככל שאצבור יותר זהב ארוויח יותר כסף.',
			distractor_1: 'אין אפשרות להרוויח כסף אמיתי במשחק.',
			distractor_2: 'פשוט להיכנס לאפליקציה כדי לחפש אבנים. במידה ומצאתי אבנים ויש מקום במחסן, האבנים יילקחו לכדור הארץ ויומרו לכסף אמיתי.',
			distractor_3: 'להיכנס לאפליקציה ולהמתין בה זמן רב ככל שניתן לפני שאסגור אותה. ככל שהיא פתוחה יותר זמן ברצף, ארוויח יותר. ',
		},
		9: {
			question: 'מה מהבאים לא נכון לגבי מערות עתירות זהב שאני עשוי/ה להיתקל בהם לפעמים?',
			correct_answer: 'כל התשובות נכונות.',
			distractor_1: 'יש לי 5 שניות בלבד לשהות במערה, בהן אוכל לאסוף מהדברים שבה.',
			distractor_2: 'כל נסיון איסוף (לחיצה) בתוך המערה עולה 1 יחידות זהב.',
			distractor_3: 'שווי גושי הזהב והאבנים זהה לזה לשווי גושי הזהב והאבנים בחיפושי הזהב הרגילים.',
		},
		10: {
			question: 'מהו משך המשחק?',
			correct_answer: 'משך המשחק אינו קבוע מראש. הוא אורך בין ימים אחדים לחודש.',
			distractor_1: 'יום אחד.',
			distractor_2: 'שבוע.',
			distractor_3: 'חודש.',
		},
		// [replace_here_ with_a_number]: {
		// 	question: '',
		// 	correct_answer: '',
		// 	distractor_1: '',
		// 	distractor_2: '',
		// 	distractor_3: '',
		// },
	},
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
