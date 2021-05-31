// This script is aimed to record and handle touch and change in device orientation events and to listen and operate app refreshing
var container = document.getElementById("main_container");

if (!!container) {
    var content = container.innerHTML;
}

// Define variables used to prevent two instances of the app running in simultaniously when reloading (communicates with app.js)
identifiersToClean = [];
if (typeof recordIdentifier === 'undefined') {
    recordIdentifier = '';
};

// initiate a variable that tracks if an app is running:
appRunning = false; // used to determine whther a new session can start
// initiate variables for the mechanism that handle running a new app instance:
var firstAttemptToRunNewAppInstance = true;
var funcCallTimer = 0;

// First thing first:
// ---------------------
// get custom settings for component and batch
var settings = Object.assign({}, app_settings);
// check if triggered from within instructions:
// var isCalledFromInstructions = logic.isCalledFromInstructions(); // This was relevant when instructions were not in an iframe.

// ****************************************************************************************
//  Listen to touch events and record the data and to page leaving events to save the data:
// ----------------------------------------------------------------------------------------
// initialize variables:
var screenInfo = {};
var pressEvents = [];
var firstTouchDetected = false;

// detect touch events:
document.body.addEventListener("touchstart", recordPressData, false);
document.body.addEventListener("touchend", recordPressData, false);
document.body.addEventListener("touchmove", recordPressData, false);
document.body.addEventListener("touchcancel", recordPressData, false);

// recording press data and device meta data:
function recordPressData(event) {
    //console.log(event.target)
    //console.log(event)
    if (!firstTouchDetected) { 	// record device meta data (type + screen/viewport data) (only once at each entry... actually only when the app loads from scratch):
        screenInfo = {
            device_data: navigator.userAgent,
            event_view_window_visualViewport_height: event.view.window.visualViewport.height,
            event_view_window_visualViewport_width: event.view.window.visualViewport.width,
            window_innerHeight: window.innerHeight,
            window_innerWidth: window.innerWidth,
            window_outerHeight: window.outerHeight,
            window_outerWidth: window.outerWidth,
        }
        firstTouchDetected = true;
    }

    event.touches.pressTime = new Date();
    event.touches.timeStamp = event.timeStamp;
    event.touches.type = event.type;
    pressEvents.push(event.touches);
}

// ****************************************************************************************
//  Listen to Orientation changes and handle them accordingly
// ----------------------------------------------------------------------------------------
// initialize variables:
var screenOrientationEvents = [];
var screenInitialOrientation = checkInitialOrientation();

// check upon entry if it is on portrait mode:
function checkInitialOrientation() {
    if (screen.availHeight < screen.availWidth) {
        showOnlyPortraitMessage()
        return 'landscape'
    } else {
        return 'portrait'
    }
}

window.addEventListener("orientationchange", function (event) {
    // if ortation is changed from the main portrait mode
    if (window.orientation) { // originally I used this: event.target.screen.orientation.angle - but this does not work on iphones
        showOnlyPortraitMessage()
    } else { // device rotated back to the main portrait mode
        removeOnlyPortraitMessage()
    }
    // record data:
    screenOrientationEvents.push({
        orientationAngle: window.orientation,
        orientationTime: new Date(),
        OrientationTimeStamp: event.timeStamp,
    });
});
function showOnlyPortraitMessage() {
    // get current html to determine relevant id for orientation switches
    if (logic.isCalledFromInstructions()) {
        var element_ID_to_Hide = settings.instructions_main_HTML_element;
    } else if (document.location.href.includes(settings.instructionsFileName)) { // if it is called from inside the iframe don't run it (unecessary)
        return
    } else if (!logic.isCalledFromInstructions()) {
        var element_ID_to_Hide = settings.App_main_HTML_element; // The commented parts around were relevant when instructions where not in an iframe
    }
    // hide screen and show message:
    dom_helper.hide(element_ID_to_Hide)
    document.body.style.backgroundImage = 'none'
    if (!document.getElementById("support_only_portrait_msg")) { // if the message element has not been formed already
        // set the text message:
        supportOnlyPortraitMessageElement = document.createElement('h2');
        supportOnlyPortraitMessageElement.setAttribute("id", 'support_only_portrait_msg')
        supportOnlyPortraitMessageElement.classList.add('centered')
        supportOnlyPortraitMessageElement.classList.add('error_message')
        supportOnlyPortraitMessageElement.appendChild(document.createTextNode("האפליקציה עובדת רק במצב מאונך."))
        supportOnlyPortraitMessageElement.appendChild(document.createElement("br"))
        supportOnlyPortraitMessageElement.appendChild(document.createElement("br"))
        supportOnlyPortraitMessageElement.appendChild(document.createTextNode("סובב/י את המכשיר בבקשה."))
        // set the text box:
        supportOnlyPortraitBoxElement = document.createElement('div');
        supportOnlyPortraitBoxElement.setAttribute("id", "support_only_portrait_box");
        supportOnlyPortraitBoxElement.setAttribute("class", "error_message_screen");

        // append stuff:
        supportOnlyPortraitBoxElement.appendChild(supportOnlyPortraitMessageElement);
        document.body.appendChild(supportOnlyPortraitBoxElement)
    } else {
        dom_helper.show('support_only_portrait_box')
    }
}
function removeOnlyPortraitMessage() {
    // get current html to determine relevant id for orientation switches
    if (logic.isCalledFromInstructions()) {
        var element_ID_to_Hide = settings.instructions_main_HTML_element;
    } else if (document.location.href.includes(settings.instructionsFileName)) { // if it is called from inside the iframe don't run it (unecessary)
        return
    } else if (!logic.isCalledFromInstructions()) {
        var element_ID_to_Hide = settings.App_main_HTML_element; // The commented parts around were relevant when instructions where not in an iframe
    }
    // remove message and show screen:
    dom_helper.show(element_ID_to_Hide)
    document.body.style.backgroundImage = ''
    dom_helper.hide('support_only_portrait_box')
}

// ****************************************************************************************
//  Handle data saving and running a new instance
// ----------------------------------------------------------------------------------------

// detect leaving the page events:
document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === 'hidden') {
        console.log('screen closed')
        onUserExit('visibilitychange_screen_closed_event')
    } else if (document.visibilityState === 'visible') {
        console.log('screen openned')
        refreshScreen()
    }
}, false);

//window.onunload = onUserExit('unload_event');
window.onpagehide = onUserExit('pagehide_event');


// save data when leaving the app:
function onUserExit(initiatorInfo) {
    if (document.title === settings.App_HTML_title && !logic.isCalledFromInstructions()) { // if it's the main App (and not the instructions)
        // Add the current app instance to the cleaning list before openning a new instance:
        identifiersToClean.push(recordIdentifier)
    }

    // assign meta data to send:
    var dataToSend = {};
    touchData = {
        screenInfo: screenInfo,
        pressEvents: pressEvents,
    }
    screenOrientationData = {
        screenInitialOrientation: screenInitialOrientation,
        screenOrientationEvents: screenOrientationEvents,
    }
    Object.assign(dataToSend, { screenOrientationData: screenOrientationData }, { touchData: touchData })
    if (initiatorInfo.includes('unload') || initiatorInfo.includes('visibilitychange') || initiatorInfo.includes('pagehide')) { Object.assign(dataToSend, { exitInitiatorEvent: initiatorInfo, userExitOrUnloadTime: new Date(), visibilityStateOnUserExitOrUnloadTime: document.visibilityState }) }

    // send meta data:
    subject_data_worker.postMessage(dataToSend)
    data_helper.wait_for_server(1500).then(function (x) {
        console.log('All meta data received at server [initiated by *' + initiatorInfo + '*]');
    });
    console.log('meta data was saved');
}

async function refreshScreen() {
    if (document.title === settings.App_HTML_title && !logic.isCalledFromInstructions()) { // reload on every entry if it's the main App (and not the instructions)

        identifiersToClean.push(recordIdentifier) // in case it didn't got pushed by onUserExit()

        if (typeof isPWA === 'undefined') { isPWA = await checkAndHandlePWA() };
        if (!isPWA) { // for the case of the installation page
            location.reload();
            return
        }

        // try resending all messages
        data_helper.wait_for_server(500)
            .then(function () {
                console.log('All data received at server [initiated by pseudo refresh]'); // **

                // reset meta variables:
                screenOrientationEvents = [];
                screenInitialOrientation = checkInitialOrientation();
                pressEvents = [];

                runNewAppInstance(); // Makes sure that the previous instance stopped or finished and run a new instance:
            });

    } else if (typeof tutorialCompleted !== 'undefined' && tutorialCompleted) { // For the last of tutorial when the tutorial is completed so the next entry will start the game.
        parent.closeInstructionsIFrame()
        // window.location.href = location.href.substring(0, location.href.lastIndexOf('/')) + "/" + 'index.html' + window.location.search; // call to main URL upon the next entry
    }
}

function runNewAppInstance() {
    // a mechanism to check that the new instance of the app starts running (and if not then reload):
    if (firstAttemptToRunNewAppInstance) {
        funcCallTimer = new Date();
        previousRunIdentifier = recordIdentifier
        var timeoutReload = setTimeout(() => {
            if (previousRunIdentifier === recordIdentifier) {
                console.log('new app instance is did not start running... RELOADING page')
                location.reload()
            }
        }, 3000);
        firstAttemptToRunNewAppInstance = false
    }
    if (typeof appRunning !== 'undefined' && appRunning && ((new Date() - funcCallTimer) <= 2950)) {
        console.log('WAITING for previous instance to stop/complete.')
        var timeoutCheckAgain = setTimeout(runNewAppInstance, 50);//wait 50 millisecnds then recheck
    } else {
        // removing related timeouts (may help for a rare bug);
        if (typeof (timeoutReload) !== 'undefined') { clearTimeout(timeoutReload) }
        if (typeof (timeoutCheckAgain) !== 'undefined') { clearTimeout(timeoutCheckAgain) }
        firstAttemptToRunNewAppInstance = true // making it ready for the next instance
        //location.reload();
        // an alternative to reloading step 1 that may be faster but needs more adaptations:
        container.innerHTML = content;
        //dom_helper.hide('main_container')
        dom_helper.hide('lottery');
        dom_helper.show('app_will_load_soon');
        dom_helper.show('loading_animation');
        // run the app
        document.body.onload = runApp();// an alternative to reloading step 2 that may be faster but needs more adaptations:
    }
}

async function closeInstructionsIFrame() {
    // verify everything from instructions is saved ao on the next entry the game will begin (before refreshing)
    try {
        do {
            await delay(100);
            var updatedData = await data_helper.get_subject_data(true).catch(function (e) {
                console.log('error getting subject data');
                console.log(e);
            });
            // check if it is updated in the data that the instructinos were completed.
            var instructionCompletion = updatedData.completedInstructions.filter((x) => x !== undefined);
            // support for offline:
            var nonIntegratedDataMSGs = Object.keys(localStorage).filter((x) => x.includes(data_helper.get_subject_id() + '_msg'));
            var isInstructionCompletionInLocalMessage = !!nonIntegratedDataMSGs.find((x) => JSON.parse(localStorage[x]).completedInstructions === true);
            // test if instructions completed
            instructionCompletion = instructionCompletion[instructionCompletion.length - 1] || isInstructionCompletionInLocalMessage;
        } while (!instructionCompletion)
    } catch (err) {
        console.log(err)
        await dialog_helper.show(settings.text.loadingDataError, img_id = '', confirmation = '', delayBeforeClosing = 0, resolveOnlyAfterDelayBeforeClosing = false, preventFeedBack = true);
    }
    // reload page in order to begin the game
    location.reload()
    //document.getElementById(settings.instructions_main_HTML_element).remove()
}
