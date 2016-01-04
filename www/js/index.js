// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, resultDiv, messageInput, sendButton, disconnectButton */
/* global ble  */
/* jshint browser: true , devel: true*/
'use strict';

// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// this is Nordic's UART service
var bluefruit = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

var correctDevice = {
	id: '0',
	valid: false
};

var connectionTimer;
var disconnectDetection;
var buttonTimer;
var buttonTimerActive = false;
var media;

var clearBorder = function(el){
	document.getElementById(el).style.border = "1px solid black";
};

var setBorder = function(el){
	document.getElementById(el).style.border = "5px solid red";
};

var app = {
    initialize: function() {
		this.showConnectPage();
		//this.showMainPage(); //debug
        this.bindEvents();
		//alert(btnA.get('buttonState'));
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.verifyBluetooth, false);
        /*sendButton.addEventListener('click', this.sendData, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);*/
    },
    onDeviceReady: function() {
		cordova.plugins.email.isAvailable(function (isAvailable) {
			cordova.plugins.email.addAlias('gmail', 'com.google.android.gm');
		});
		app.verifyBluetooth();
    },
	verifyBluetooth: function()
	{
		ble.isEnabled(
			function()
			{
				app.showConnectPage();
				app.connectToSmartHelperDevice();
				//app.showMainPage(); //debug
			},
			function()
			{
				app.enableBluetooth();
			}
		);
	},
	enableBluetooth: function()
	{
		ble.enable(
			function()
			{
				app.showConnectPage();
				app.connectToSmartHelperDevice();
				//app.showMainPage(); //debug
			},
			function()
			{
				app.showBluetoothPage();
			}
		);
	},
	connectToSmartHelperDevice: function()
	{
		var onScanError = function(errMsg)
		{
			var objToString = Object.prototype.toString();
			alert("ERROR: " + objToString.call(errMsg));
		}
		if (cordova.platformId === 'android') { // Android filtering is broken
            ble.scan([], 5, app.onDiscoverDevice, onScanError);
        } else {
            ble.scan([bluefruit.serviceUUID], 5, app.onDiscoverDevice, onScanError);
        }
		if(correctDevice.valid)
		{
			connectionTimer = window.setInterval(app.connect,2000);
		}
		else
		{
			connectionTimer = setTimeout(app.connectToSmartHelperDevice, 3000);
		}
	},
	onDiscoverDevice: function(device) {
		if(device.name=='SMRTHLP')
		{
			correctDevice.id = device.id;
			correctDevice.valid = true;
		}
    },
	connect: function() {
		if(!correctDevice.valid) return;
		var onConnect = function(peripheral)
		{
            app.determineWriteType(peripheral);

            // subscribe for incoming data
            ble.startNotification(correctDevice.id, bluefruit.serviceUUID, bluefruit.rxCharacteristic, app.onData, app.onError);
            //sendButton.dataset.deviceId = correctDevice.id;
            //disconnectButton.dataset.deviceId = correctDevice.id;
			clearTimeout(connectionTimer);
			disconnectDetection = window.setInterval(app.checkConnection,3000);
            app.showMainPage();
        };
		var onConError = function(msg) {
			var objToString = Object.prototype.toString();
			
			alert("Could not connect to SMRTHLP due to "+objToString.call(msg));
		}
        ble.connect(correctDevice.id, onConnect, onConError);
	},
    determineWriteType: function(peripheral) {
        // Adafruit nRF8001 breakout uses WriteWithoutResponse for the TX characteristic
        // Newer Bluefruit devices use Write Request for the TX characteristic

        var characteristic = peripheral.characteristics.filter(function(element) {
            if (element.characteristic.toLowerCase() === bluefruit.txCharacteristic) {
                return element;
            }
        })[0];

        if (characteristic.properties.indexOf('WriteWithoutResponse') > -1) {
            app.writeWithoutResponse = true;
        } else {
            app.writeWithoutResponse = false;
        }

    },
	checkConnection: function()
	{
		var stateConnected = function()
		{
			return;
		}
		var stateDisconnected = function()
		{
			correctDevice.valid = false;
			clearTimeout(disconnectDetection);
			app.showConnectPage();
			app.connectToSmartHelperDevice();
		}
		ble.isConnected(correctDevice.id, stateConnected, stateDisconnected);
	},
    onData: function(data) { // data received from Arduino
        console.log(data);
		var receivedData = bytesToString(data);
		if(receivedData == 'A')
		{
			timerA();
			//location.href = "tel:9102294641";
		}
		else if(receivedData == 'B')
		{
			timerB();
			//location.href = "sms:9102294641?body=Please%20call%20me%20when%20you%20are%20available.";
		}
		else if(receivedData == 'C')
		{
			timerC();
			//location.href = "tel:9193333333";
		}
		else if(receivedData == 'D')
		{
			timerD();
			//location.href = "tel:9197825400";
		}
		else if(receivedData == 'E')
		{
			timerE();
			//location.href = "tel:9198335531";
		}
		else if(receivedData == 'F')
		{
			timerF();
			//location.href = "tel:9198322110";
		}
		else if(receivedData == 'X')
		{
			timerCancel();
		}
		else if(receivedData == 'W')
		{
			playMenuOptions();
		}
		else console.log(receivedData);
		//alert(bytesToString(data));
        /*resultDiv.innerHTML = resultDiv.innerHTML + "Received: " + bytesToString(data) + "<br/>";
        resultDiv.scrollTop = resultDiv.scrollHeight;*/
    },
    /*sendData: function(event) { // send data to Arduino

        var success = function() {
            console.log("success");
            /*resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + messageInput.value + "<br/>";
            resultDiv.scrollTop = resultDiv.scrollHeight;
        };

        var failure = function() {
            alert("Failed writing data to the bluefruit le");
        };

        var data = stringToBytes(messageInput.value);
        var deviceId = event.target.dataset.deviceId;

        if (app.writeWithoutResponse) {
            ble.writeWithoutResponse(
                deviceId,
                bluefruit.serviceUUID,
                bluefruit.txCharacteristic,
                data, success, failure
            );
        } else {
            ble.write(
                deviceId,
                bluefruit.serviceUUID,
                bluefruit.txCharacteristic,
                data, success, failure
            );
        }

    },
    disconnect: function(event) {
        var deviceId = event.target.dataset.deviceId;
        ble.disconnect(deviceId, app.showMainPage, app.onError);
    },*/
    showMainPage: function() {
        mainPage.hidden = false;
		bluetoothPage.hidden = true;
        connectPage.hidden = true;
    },
	showBluetoothPage: function() {
        mainPage.hidden = true;
		bluetoothPage.hidden = false;
        connectPage.hidden = true;
    },
    showConnectPage: function() {
        mainPage.hidden = true;
		bluetoothPage.hidden = true;
        connectPage.hidden = false;
    },
    onError: function(reason) {
		var objToString = Object.prototype.toString();
        alert("ERROR: " + objToString.call(reason)); // real apps should use notification.alert
    }
};

var doTaskA = function(){
	clearBorder("mainMenuTopRowCellOne");
	buttonTimerActive = false;
	//location.href = "tel:9102294641";
	window.plugins.CallNumber.callNumber(function(){console.log("Success")}, function(){console.log("Failed")}, "9102294641");
};

var doTaskB = function(){
	clearBorder("mainMenuTopRowCellTwo");
	buttonTimerActive = false;
	location.href = "sms:9102294641?body=Please%20call%20me%20when%20you%20are%20available.";
};

var doTaskC = function(){
	clearBorder("mainMenuTopRowCellThree");
	buttonTimerActive = false;
	//location.href = "tel:9193333333";
	window.plugins.CallNumber.callNumber(function(){console.log("Success")}, function(){console.log("Failed")}, "9193333333");
};

var doTaskD = function(){
	clearBorder("mainMenuBottomRowCellOne");
	buttonTimerActive = false;
	//location.href = "tel:9197825400";
	window.plugins.CallNumber.callNumber(function(){console.log("Success")}, function(){console.log("Failed")}, "9197825400");
};

var doTaskE = function(){
	clearBorder("mainMenuBottomRowCellTwo");
	buttonTimerActive = false;
	//location.href = "tel:9198335531";
	//window.plugins.CallNumber.callNumber(function(){console.log("Success")}, function(){console.log("Failed")}, "9198335531");
	cordova.plugins.email.isAvailable(function (isAvailable) {
        cordova.plugins.email.open({
			app: 'gmail',
			to: 'jemanby@ncsu.edu',
			attachments: ['file:///sdcard/Prescriptions/Rx_CindyAllen_2013Aug13.png'],
			subject: 'Refill medication for Cindy Allen',
			body: 'Hello, I need to order a refill of my prescription for Metformin. My Rx is attached to this email. My credit card information is on file. If you have any questions, you may reach me at (919)123-4567. Sincerely, Cindy Allen.',
			isHtml: false
		});
    });
};

var doTaskF = function(){
	clearBorder("mainMenuBottomRowCellThree");
	buttonTimerActive = false;
	//location.href = "tel:9198322110";
	window.plugins.CallNumber.callNumber(function(){console.log("Success")}, function(){console.log("Failed")}, "9198322110");
};

var timerA = function(){
	if(buttonTimerActive) return;
	setBorder("mainMenuTopRowCellOne");
	if(media!=null)
	{
		media.stop();
		media.release();
		media = null;
		buttonTimer = setTimeout(timerA, 1000);
		return;
	}
	buttonTimer = setTimeout(doTaskA, 4000);
	media = new Media('file:///sdcard/Sounds/CallingJose.m4a',function(){console.log("Playing Media 'Calling Jose'");},function(err){console.log(err);},function(status){if(status == Media.MEDIA_STOPPED){media.release();media=null;}});
	media.play();
	buttonTimerActive = true;
};

var timerB = function(){
	if(buttonTimerActive) return;
	setBorder("mainMenuTopRowCellTwo");
	if(media!=null)
	{
		media.stop();
		media.release();
		media = null;
		buttonTimer = setTimeout(timerB, 1000);
		return;
	}
	buttonTimer = setTimeout(doTaskB, 4000);
	media = new Media('file:///sdcard/Sounds/TextingJose.m4a',function(){console.log("Playing Media 'Texting Jose'");},function(err){console.log(err);},function(status){if(status == Media.MEDIA_STOPPED){media.release();media=null;}});
	media.play();
	buttonTimerActive = true;
};

var timerC = function(){
	if(buttonTimerActive) return;
	setBorder("mainMenuTopRowCellThree");
	if(media!=null)
	{
		media.stop();
		media.release();
		media = null;
		buttonTimer = setTimeout(timerC, 1000);
		return;
	}
	buttonTimer = setTimeout(doTaskC, 4000);
	media = new Media('file:///sdcard/Sounds/CallingTaxi.m4a',function(){console.log("Playing Media 'Calling Taxi'");},function(err){console.log(err);},function(status){if(status == Media.MEDIA_STOPPED){media.release();media=null;}});
	media.play();
	buttonTimerActive = true;
};

var timerD = function(){
	if(buttonTimerActive) return;
	setBorder("mainMenuBottomRowCellOne");
	if(media!=null)
	{
		media.stop();
		media.release();
		media = null;
		buttonTimer = setTimeout(timerD, 1000);
		return;
	}
	buttonTimer = setTimeout(doTaskD, 4000);
	media = new Media('file:///sdcard/Sounds/CallingRalOp.m4a',function(){console.log("Playing Media 'Calling Raleigh Ophthalmology'");},function(err){console.log(err);},function(status){if(status == Media.MEDIA_STOPPED){media.release();media=null;}});
	media.play();
	buttonTimerActive = true;
};

var timerE = function(){
	if(buttonTimerActive) return;
	setBorder("mainMenuBottomRowCellTwo");
	if(media!=null)
	{
		media.stop();
		media.release();
		media = null;
		buttonTimer = setTimeout(timerE, 1000);
		return;
	}
	buttonTimer = setTimeout(doTaskE, 4000);
	media = new Media('file:///sdcard/Sounds/OrderMeds.m4a',function(){console.log("Playing Media 'Ordering Medicine'");},function(err){console.log(err);},function(status){if(status == Media.MEDIA_STOPPED){media.release();media=null;}});
	media.play();
	buttonTimerActive = true;
};

var timerF = function(){
	if(buttonTimerActive) return;
	setBorder("mainMenuBottomRowCellThree");
	if(media!=null)
	{
		media.stop();
		media.release();
		media = null;
		buttonTimer = setTimeout(timerF, 1000);
		return;
	}
	buttonTimer = setTimeout(doTaskF, 4000);
	media = new Media('file:///sdcard/Sounds/CallingKroger.m4a',function(){console.log("Playing Media 'Calling Jose'");},function(err){console.log(err);},function(status){if(status == Media.MEDIA_STOPPED){media.release();media=null;}});
	media.play();
	buttonTimerActive = true;
};

var timerCancel = function(){
	if(buttonTimerActive) clearTimeout(buttonTimer);
	clearBorder("mainMenuTopRowCellOne");
	clearBorder("mainMenuTopRowCellTwo");
	clearBorder("mainMenuTopRowCellThree");
	clearBorder("mainMenuBottomRowCellOne");
	clearBorder("mainMenuBottomRowCellTwo");
	clearBorder("mainMenuBottomRowCellThree");
	buttonTimer = null;
	buttonTimerActive = false;
	if(media!=null)
	{
		media.stop();
		media.release();
		media = null;
	}
};

var playMenuOptions = function(){
	if(buttonTimerActive || media!=null) return;
	media = new Media('file:///sdcard/Sounds/MenuChoices.m4a',function(){console.log("Playing Media 'Menu Choices'");},function(err){console.log(err);},function(status){if(status == Media.MEDIA_STOPPED){media.release();media=null;}});
	media.play();
};
	
