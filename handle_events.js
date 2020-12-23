// This script is aimed to record and handle touch and change in device orientation events
var container = document.getElementById("main_container");

if (!!container) {
    var content = container.innerHTML;
}

// Define variables used to prevent two instances of the app running in simultaniously when reloading (communicates with app.js)
identifiersToClean = [];
recordIdentifier = '';

// First thing first:
// ---------------------
// get custom settings for component and batch
var settings = Object.assign({}, app_settings);
// check if triggered from within instructions:
var isCalledFromInstructions = logic.isCalledFromInstructions();

// ****************************************************************************************
//  Listen to touch events and record the data and to page leaving events to save the data:
// ----------------------------------------------------------------------------------------
// initialize variables:
var screenInfo = {};
var pressEvents = [];
var firstTouchDetected = false;
// // initialize No SCreen Sleep controller
// var noSleep = new NoSleep();

// detect touch events:
document.body.addEventListener("touchstart", recordPressData, false);
document.body.addEventListener("touchend", recordPressData, false);
document.body.addEventListener("touchmove", recordPressData, false);
document.body.addEventListener("touchcancel", recordPressData, false);

// recording press data and device meta data:
function recordPressData(event) {
    if (!firstTouchDetected) { 	// record device meta data (type + screen/viewport data) (only once at each entry):
        screenInfo = {
            device_data: navigator.userAgent,
            event_view_window_visualViewport_height: event.view.window.visualViewport.height,
            event_view_window_visualViewport_width: event.view.window.visualViewport.width,
            window_innerHeight: window.innerHeight,
            window_innerWidth: window.innerWidth,
            window_outerHeight: window.outerHeight,
            window_outerWidth: window.outerWidth,
        }

        // // activate no Screen Sleep:
        // noSleep.enable(); // keep the screen on!

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
var screenInitialOrientation = '';

// get current html to determine relevant id for orientation switches
if (document.title === settings.instructions_HTML_title) {
    var element_ID_to_Hide = settings.instructions_main_HTML_element;
} else if (document.title === settings.App_HTML_title && !isCalledFromInstructions) {
    var element_ID_to_Hide = settings.App_main_HTML_element;
}

// check upon entry if it is on portrait mode:
if (screen.availHeight < screen.availWidth) {
    showOnlyPortraitMessage()
    screenInitialOrientation = 'landscape'
} else {
    screenInitialOrientation = 'portrait'
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
    dom_helper.show(element_ID_to_Hide)
    document.body.style.backgroundImage = ''
    dom_helper.hide('support_only_portrait_box')
}

// ****************************************************************************************
//  Handle data saving
// ----------------------------------------------------------------------------------------
// detect leaving the page events:
document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        console.log('screen closed')
        onUserExit()
    } else {
        console.log('screen openned')
        refreshScreen()
    }
}, false);

window.onunload = onUserExit;

// save data when leaving the app:
function onUserExit() {
    touchData = {
        screenInfo: screenInfo,
        pressEvents: pressEvents,
    }
    screenOrientationData = {
        screenInitialOrientation: screenInitialOrientation,
        screenOrientationEvents: screenOrientationEvents,
    }
    subject_data_worker.postMessage({ touchData: touchData, screenOrientationData: screenOrientationData, userExitOrUnloadTime: new Date() }) // ** 
    data_helper.flush().then(function () { console.log('All data received at server [initiated by user exit]'); }); // **
    console.log('meta data was saved');
}

function refreshScreen() {
    if (document.title === settings.App_HTML_title && !isCalledFromInstructions) { // reload on every entry if it's the main App (and not the instructions)

        if (!isPWA) { // for the case of the installation page
            location.reload();
            return
        }

        // Add the current app instance to the cleaning list before openning a new instance:
        identifiersToClean.push(recordIdentifier)

        //location.reload();
        // an alternative to reloading step 1 that may be faster but needs more adaptations:
        container.innerHTML = content;
        //dom_helper.hide('main_container')
        dom_helper.hide('lottery');
        dom_helper.show('app_will_load_soon');
        dom_helper.show('loading_animation');

        // try resending all messages
        data_helper.flush().then(function () {
            console.log('All data received at server [initiated by pseudo refresh]'); // **

            // an alternative to reloading step 2 that may be faster but needs more adaptations:
            document.body.onload = runApp();
        });

    } else if (typeof tutorialCompleted !== 'undefined' && tutorialCompleted) { // For the last of tutorial when the tutorial is completed so the next entry will start the game.
        window.location.href = location.href.substring(0, location.href.lastIndexOf('/')) + "/" + 'index.html' + window.location.search; // call to main URL upon the next entry
    }
}

// MAYBE USE THIS SOMEWHERE (WHEN EXITING) TO STOP THE SCRIPT FROM RUNNING: 
// throw new Error();