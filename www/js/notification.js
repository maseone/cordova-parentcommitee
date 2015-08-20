var pushNotification;
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    try {
        pushNotification = window.plugins.pushNotification;
        if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos') {
            pushNotification.register(successHandler, errorHandler, {
                "senderID": "139274623388",
                "ecb": "onNotificationGCM"
            }); // required!
        } else {
            pushNotification.register(tokenHandler, errorHandler, {
                "badge": "true",
                "sound": "true",
                "alert": "true",
                "ecb": "onNotificationAPN"
            }); // required!
        }
    } catch (err) {
        txt = "There was an error on this page.\n\n";
        txt += "Error description: " + err.message + "\n\n";
        alert(txt);
    }
}

function successHandler(result) {
    console.log('Success: ' + result);
}

function errorHandler(error) {
    console.log('Error: ' + error);
}

function tokenHandler(result) {
    console.log('token: ' + result);
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
}

// Android
function onNotificationGCM(e) {
    switch (e.event) {
        case 'registered':
            if (e.regid.length > 0) {
                document.mobileDeviceId = e.regid;
                $(document).trigger('mobileDeviceId:event');
            }
            break;

        case 'message':
            if (e.foreground) {
                var my_media = new Media("/android_asset/www/" + e.soundname);
                my_media.play();
            } else {
                if (e.coldstart) {
                    // $("#app-status-ul").append('</br><li>--COLDSTART NOTIFICATION--' + '</li>');
                } else {
                    // $("#app-status-ul").append('</br><li>--BACKGROUND NOTIFICATION--' + '</li>');
                }
            }
            // $("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
            // $("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
            break;

        case 'error':
            // $("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
            break;

        default:
            // $("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
            break;
    }
}

// handle APNS notifications for iOS
function onNotificationAPN(e) {
    if (e.alert) {
        // showing an alert also requires the org.apache.cordova.dialogs plugin
        navigator.notification.alert(e.alert);
    }

    if (e.sound) {
        // playing a sound also requires the org.apache.cordova.media plugin
        var snd = new Media(e.sound);
        snd.play();
    }

    if (e.badge) {
        pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
    }
}
