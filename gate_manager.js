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

// check if implemented as PWA and handle accordingly:
// ********************************************************
async function checkAndHandlePWA() {
    var isInWebAppiOS = window.navigator.standalone === true;
    var isInWebAppChrome =
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches;

    // if app PWA:
    if (isInWebAppiOS || isInWebAppChrome) {
        populate_manifest();
        dom_helper.hide('installation_guide');
        return true
    } else {
        // get device type:
        var mobileOS = getMobileOperatingSystem();
        // get device browser:
        var browser = getMobileBrowser()
        // Check that the url is valid:
        try {
            var isSubID = data_helper.get_subject_id()
        } catch {
            var isSubID = "undefined";
        }
        if (isSubID !== "undefined" && ((mobileOS === 'iOS' && browser === 'safari') || (mobileOS === 'Android' && browser === 'chrome'))) {
            var subData = await data_helper.get_subject_data(true).catch(function (e) {
                console.log('error getting subject data');
                console.log(e);
            });
            if (!!subData.uniqueEntryID.length) {
                location.replace('./used_link.html')
            } else {
                //data_helper.init_session('app', false);
                populate_manifest();
                // Save a message so this user will be signaled as used.
                data_helper.init_session('app', false);
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
    var myDynamicManifest = {
        "name": "Space Gold",
        "short_name": "Space Gold",
        "display": "standalone",
//        "orientation": "portrait",
        "background_color": "#666666ff",
        "theme_color": "#000000",
        "icons": [
            {
                "src": "android-icon-36x36.png",
                "sizes": "36x36",
                "type": "image\/png",
                "density": "0.75"
            },
            {
                "src": "android-icon-48x48.png",
                "sizes": "48x48",
                "type": "image\/png",
                "density": "1.0"
            },
            {
                "src": "android-icon-72x72.png",
                "sizes": "72x72",
                "type": "image\/png",
                "density": "1.5"
            },
            {
                "src": "android-icon-96x96.png",
                "sizes": "96x96",
                "type": "image\/png",
                "density": "2.0"
            },
            {
                "src": "android-icon-144x144.png",
                "sizes": "144x144",
                "type": "image\/png",
                "density": "3.0"
            },
            {
                "src": "android-icon-192x192.png",
                "sizes": "192x192",
                "type": "image\/png",
                "density": "4.0"
            },
            {
                "src": "android-icon-512x512.png",
                "sizes": "512x512",
                "type": "image\/png",
                "density": "1.0"
            }
        ]
    }
    // Add the start url
    myDynamicManifest["start_url"] = location.href;

    // Add the correct path for the icons
    const fullPath = location.href.substring(0, location.href.lastIndexOf("/") + 1) + 'icons/';
    myDynamicManifest.icons.forEach((x) => x.src = fullPath + x.src)

    // Prepare and attach the manifest to the html
    const stringManifest = JSON.stringify(myDynamicManifest);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    document.getElementById('manifest-placeholder').setAttribute('href', manifestURL);

    // The dynamic manifest implementation is based on https://medium.com/@alshakero/how-to-setup-your-web-app-manifest-dynamically-using-javascript-f7fbee899a61
}
