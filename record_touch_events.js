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
// detect leaving the page events:
document.addEventListener("visibilitychange", () => { if (document.hidden) { onUserExit() } }, false);
window.onunload = onUserExit;

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
        firstTouchDetected = true;
    }
    event.touches.timeStamp = event.timeStamp
    event.touches.pressTime = new Date()
    pressEvents.push(event.touches)
}

// save when leaving the app:
function onUserExit() {
    console.log(document.hidden)
    touchData = {
        screenInfo: screenInfo,
        pressEvents: pressEvents,
    }
    subject_data_worker.postMessage({ touchData: touchData }) // **
    console.log('meta data was saved');
}

