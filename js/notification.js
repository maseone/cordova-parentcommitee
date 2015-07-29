var pushNotification;
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady(){
    pushNotification = window.plugins.pushNotification;
    if ( device.platform == 'android' || device.platform == 'Android' )
    {
    pushNotification.register(
        successHandler,
        errorHandler, {
            "senderID":"139274623388",
            "ecb":"onNotificationGCM"
        });
    }
}
function successHandler(result) {
    console.log('Success: '+ result);
}
function errorHandler(error) {
    console.log('Error: '+ error);
}

// Android
function onNotificationGCM(e) {
    switch( e.event ){
        case 'registered':
            if ( e.regid.length > 0 ){
                document.mobileDeviceId = e.regid;
                $(document).trigger('mobileDeviceId:event');
            }
        break;

        case 'message':
            if ( e.foreground ){
                var my_media = new Media("/android_asset/www/"+e.soundname);
                my_media.play();
            }else{
                if ( e.coldstart ){
                    // $("#app-status-ul").append('</br><li>--COLDSTART NOTIFICATION--' + '</li>');
                }else{
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