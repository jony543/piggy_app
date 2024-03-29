// -----------------------------------------------------------------------------------------
// THESE ARE FUNCTION THAT WERE MADE TO HANDLE WHAT HAPPEND WHEN THE URL IS OPENNED:
// Among others when needed:
// show intallation image
// say url is wrong
// say the device is incompatible
// populate the manifest according to the subject code
// prevent a subject with an existing data to install the app again (say on another device)
// signal to run the app
// -----------------------------------------------------------------------------------------

// get mobile func OS function:
function getMobileOperatingSystem() { // taken by Rani from https://stackoverflow.com/questions/21741841/detecting-ios-android-operating-system
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }
    if (/android/i.test(userAgent)) {
        return "Android";
    }
    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }
    return "unknown";
}

function getMobileBrowser() { // adapted by Rani from https://stackoverflow.com/questions/62409889/how-to-detect-browser-for-chrome
    const agent = window.navigator.userAgent.toLowerCase()
    // check which browser
    switch (true) {
        case agent.indexOf("edge") > -1: return "MS Edge (EdgeHtml)";
        case agent.indexOf("edg") > -1: return "MS Edge Chromium";
        case agent.indexOf("opr") > -1 && !!window.opr: return "opera";
        case agent.indexOf("samsung") > -1: return "samsungInternet";
        case agent.indexOf("chrome") > -1 && !!window.chrome: return "chrome";
        case agent.indexOf("trident") > -1: return "Internet Explorer";
        case agent.indexOf("firefox") > -1: return "firefox";
        case agent.indexOf("safari") > -1: return "safari";
        default: return "other";
    }
};

function checkIfTablet() { // taken by rani from https://stackoverflow.com/questions/50195475/detect-if-device-is-tablet/53518181
    const userAgent = navigator.userAgent.toLowerCase();
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
    return isTablet
}

// check if implemented as PWA and handle accordingly:
// ********************************************************
async function checkAndHandlePWA() {
    var isInWebAppiOS = window.navigator.standalone === true;
    var isInWebAppChrome =
        // window.matchMedia("(display-mode: fullscreen)").matches || //***** UNCOMMENT FOR DEBUGGING PURPOSES ON MAC/PC ******
        window.matchMedia("(display-mode: standalone)").matches;
    //window.matchMedia("(display-mode: minimal-ui)").matches;

    // if app PWA:
    if (isInWebAppiOS || isInWebAppChrome) {
        // if (true) { // for debugging purposes
        populate_manifest();
        dom_helper.hide('installation_guide');
        return true
    } else {
        // get device type:
        var mobileOS = getMobileOperatingSystem();
        // get device browser:
        var browser = getMobileBrowser()
        // check if tablet:
        var isTablet = checkIfTablet()
        // Check that the url is valid:
        try {
            var isSubID = data_helper.get_subject_id()
        } catch {
            var isSubID = "undefined";
        }
        if (isSubID !== "undefined" && !isTablet && ((mobileOS === 'iOS' && browser === 'safari') || (mobileOS === 'Android' && browser === 'chrome'))) {
            var subData = await data_helper.get_subject_data(true).catch(function (e) {
                console.log('error getting subject data');
                console.log(e);
            });
            //if (!!subData.uniqueEntryID.length && subData.subId[subData.subId.length-1]!==313) {
            //if (!!subData.uniqueEntryID.length && subData.subId[subData.subId.length-1]!==131 && subData.subId[subData.subId.length-1]!==239) {
            if (!!subData.uniqueEntryID.length) {
                location.replace('./used_link.html')
            } else {
                // first - delete any older local storage and caches in case of a former use in the application:
                // window.localStorage.clear() // *** cancelled the localStorage Deletion for now because it creates problems (require some more adaptations and not surely necessary)
                // console.log('>> local storage data deleted');
                caches.keys().then(function (keyList) {
                    return Promise.all(keyList.map(function (key) {
                        return caches.delete(key);
                    }));
                })
                console.log('>> cache storage deleted');

                //data_helper.init_session('app', false);
                populate_manifest();
                // Save a message so this user will be signaled as used.
                data_helper.init_session('gate', false);
                await subject_data_worker.postMessage({ opennedInstallaitonPage: true, commitSession: true });
                // show installation instructions (according to the device type):
                document.getElementById('installation_guide').setAttribute('src', 'images/instructions/installation_guide_' + mobileOS + '.jpg')
            }
        } else {
            // show url is wrong message
            if (isSubID === "undefined") {
                dom_helper.set_text('installationProblemMessage', 'הלינק אינו מלא או לא תקין. אנא וודא/י שאת/ה משתמש/ת בלינק המלא שקיבלת.')
                dom_helper.show('installationProblem');
            }
            // Not a compatible device message or browser:
            else {
                dom_helper.set_text('installationProblemMessage', 'יש להכנס לקישור זה<br>\
                מדפדפן ה-safari ב-אייפון<br>\
                או מדפדפן ה-chrome ב-אנדרואיד.')
                dom_helper.show('installationProblem');
            }
        }
        dom_helper.hide('app_will_load_soon');
        dom_helper.hide('loading_animation');
        return false;
    }
}

function populate_manifest() {
    // TO SWITCH BETWEEN USING LOCAL MANIFESTS FORMED BY create_subject_keycodes_and_manifests.py AND THE COMMON ONE IN THE SERVER - SWITCH COMMENTING BETWEEN THE TWO FOLLOWING LINES:
    document.getElementById('manifest-placeholder').setAttribute('href', location.href.substring(0, location.href.lastIndexOf("/") + 1) + 'manifests/manifest_' + /[&?]subId=([^&]+)/.exec(location.search)[1] + '.json');
    //document.getElementById('manifest-placeholder').setAttribute('href', "https://experiments.schonberglab.org/app/manifests/space_gold.json")
}
