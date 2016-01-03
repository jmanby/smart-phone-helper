var app = app || {};
var appview;

var SPH_NUMBER_OF_BUTTONS = 8; // Total number of buttons on device including wake up and cancel buttons
var SPH_CANCEL_BUTTON = SPH_NUMBER_OF_BUTTONS - 2; // ID of cancel button
var SPH_WAKE_BUTTON = SPH_NUMBER_OF_BUTTONS - 1; // ID of wake up button
var SPH_SCAN_TIME = 5000; // Amount of time to scan for a device before stopping
var SPH_SELECTION_TIME = 4000; // Amount of delay in milliseconds for user to press cancel button; should be greater than the longest soundfile duration.
var SPH_SELECTION_BUFFER = 1000; // Amount of buffer in milliseconds for user to press cancel button after media file has finished

var isRegButton = function(i) // Determines whether button is a regular device button or the cancel or wake up buttons
{
	if(i<SPH_CANCEL_BUTTON) return true;
	else return false;
}

// this is Nordic's UART service; these UUID's should be changed to propietary UUID's before finalizing product.
app.bluefruit = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

// ArrayBuffer -> ASCII String
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII string -> ArrayBuffer
function stringToBytes(string)
{
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++)
	{
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// This is strictly for testing in an internet browser and is not needed in final product
function testDataReception(string)
{
	var array = stringToBytes(string);
	appview.connection_view.onData(array);
}
 
function onLoad() // Function to be loaded first to ensure device is ready; creates the collection and models used as well as the main view AppView.
{
	function onDeviceReady()
	{
		document.addEventListener("pause", onPause, false);
		document.addEventListener("resume", onResume, false);
		app.buttons = new app.DeviceButtons();
		app.connection = new app.DeviceConnection({id:'state'});
		app.bluetooth = new app.BluetoothEnabled({id:'state'});
		
		app.connection.fetch();
		appview = new app.AppView();
	};
	function onPause()
	{
		console.log("Application moving to background.");
	};
	function onResume()
	{
		setTimeout(
		function()
		{
			console.log("Application moved to foreground.");
			app.connection.fetch();
			app.bluetooth.fetch();
			app.resume();
		}, 0);
		
	};
	
	app.isCordovaApp = !!window.cordova; // Global variable that allows testing of app in an internet browser without needing to compile cordova specific plugins
	if(app.isCordovaApp)
	{
		console.log("Running on mobile device.");
		document.addEventListener("deviceready", onDeviceReady, false);
	}
	else
	{
		console.log("Running in browser.");
		onDeviceReady();
	}
 };