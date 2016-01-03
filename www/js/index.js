var app;

var DeviceButton = Backbone.Model.extend({
	defaults: {
		buttonState: false
	},
	clear: function(){
		this.save({buttonState: false});
	},
	activate: function(){
		this.save({buttonState: true});
	},
	silentClear: function(){
		this.save({buttonState: false},{silent: true});
	}
});

var DeviceButtons = Backbone.Collection.extend({
	model: DeviceButton,
	localStorage: new Backbone.LocalStorage("DeviceButtons"), 
	initialize: function() {
		window.buttonActive = false;
	}
});

var DeviceConnection = Backbone.Model.extend({
	defaults: {
		connected: false,
		found: false,
		scanning: false
	},
	localStorage: new Backbone.LocalStorage("DeviceConnection"),
	listAsConnected: function(){
		this.save({connected: true});
	},
	listAsDisconnected: function(){
		this.save({connected: false});
	},
	saveUuid: function(uid){
		this.save({uuid: uid});
	},
	foundDevice: function(foundD){
		if(foundD) this.save({found: true});
		else this.save({found: false});
	},
	toggleScanning: function() {
		if(this.get('scanning'))
		{
			this.save({scanning: false});
		}
		else
		{
			this.save({scanning: true});
		}
	}
});

var BluetoothEnabled = Backbone.Model.extend({
	defaults: {
		enabled: false
	},
	localStorage: new Backbone.LocalStorage("BluetoothEnabled"),
	setAsEnabled: function(){
		this.save({enabled: true});
	},
	setAsDisabled: function(){
		this.save({enabled: false});
	}
});

var AppView = Backbone.View.extend({
	el: $('body'),
	initialize: function() {
		this.$bluetoothPage = $('.bluetoothPage');
		this.$connectPage = $('.connectPage');
		this.$mainPage = $('.mainPage');
		
		this.listenTo(window.buttons, 'reset', this.setupMenu);
		this.listenTo(window.buttons, 'add', this.addButton);
		this.listenTo(window.connection, 'change:connected', this.render);
		this.listenTo(window.bluetooth, 'change:enabled', this.render);
		this.verifyBluetooth();
		this.connection_view = new ConnectionView({model: window.connection});
		this.setupMenu();
		
		this.render();
	},
	events: {
		'touchstart #btRefreshButton': 'verifyBluetooth',
		'touchstart #connectRefreshButton': 'refreshConnection',
		'click #connectRefreshButton': 'refreshConnection'
	},
	render: function() {
		if(!window.bluetooth.get('enabled')) //Bluetooth disabled
		{
			this.$bluetoothPage.show();
			this.$connectPage.hide();
			this.$mainPage.hide();
		}
		else if(!window.connection.get('connected'))
		{
			this.$bluetoothPage.hide();
			this.$connectPage.show();
			this.$mainPage.hide();
		}
		else
		{
			this.$bluetoothPage.hide();
			this.$connectPage.hide();
			this.$mainPage.show();
		}
		return this;
	},
	resume: function() {
		this.verifyBluetooth();
		this.connection_view.resume();
		this.render();
	},
	setupMenu: function() {
		window.buttons.add(new DeviceButton({
			id: 0,
			data: 'A',
			soundfile: 'file:///sdcard/Sounds/CallingJose.m4a',
			doTask: function(){
				console.log('Running task a');
				if(window.isCordovaApp) window.plugins.CallNumber.callNumber(function(){console.log("Success")}, function(){console.log("Failed")}, "9102294641");
			}
		}));
		window.buttons.add(new DeviceButton({
			id: 1,
			data: 'B',
			soundfile: 'file:///sdcard/Sounds/TextingJose.m4a',
			doTask: function(){
				console.log('Running task b');
				if(window.isCordovaApp) location.href = "sms:9102294641?body=Please%20call%20me%20when%20you%20are%20available.";
			}
		}));
		window.buttons.add(new DeviceButton({
			id: 2,
			data: 'C',
			soundfile: 'file:///sdcard/Sounds/CallingTaxi.m4a',
			doTask: function(){
				console.log('Running task c');
				if(window.isCordovaApp) window.plugins.CallNumber.callNumber(function(){console.log("Success")}, function(){console.log("Failed")}, "9193333333");
			}
		}));
		window.buttons.add(new DeviceButton({
			id: 3,
			data: 'D',
			soundfile: 'file:///sdcard/Sounds/CallingRalOp.m4a',
			doTask: function(){
				console.log('Running task d');
				if(window.isCordovaApp) window.plugins.CallNumber.callNumber(function(){console.log("Success")}, function(){console.log("Failed")}, "9197825400");
			}
		}));
		window.buttons.add(new DeviceButton({
			id: 4,
			data: 'E',
			soundfile: 'file:///sdcard/Sounds/OrderMeds.m4a',
			doTask: function(){
				console.log('Running task e');
				if(window.isCordovaApp){
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
				}
			}
		}));
		window.buttons.add(new DeviceButton({
			id: 5,
			data: 'F',
			soundfile: 'file:///sdcard/Sounds/CallingKroger.m4a',
			doTask: function(){
				console.log('Running task f');
				if(window.isCordovaApp) window.plugins.CallNumber.callNumber(function(){console.log("Success")}, function(){console.log("Failed")}, "9198322110");
			}
		}));
		window.buttons.add(new DeviceButton({
			id: 6,
			data: 'X',
			soundfile: '',
			doTask: function(){
				console.log('Canceling task');
			}
		}));
		window.buttons.add(new DeviceButton({
			id: 7,
			data: 'W',
			soundfile: 'file:///sdcard/Sounds/MenuChoices.m4a',
			doTask: function(){
				console.log('Reading menu');
			}
		}));
		for(var i=0;i<SPH_NUMBER_OF_BUTTONS;i++) {
			var button = window.buttons.get(i);
			if(isRegButton(i)) 
			{
				var element = "#cell_" + i;
			}
			else
			{
				var element = ".mainMenu";
			}
			var view = new MenuItemView({model: button, el: element});
		}
	},
	addButton: function(model){
		console.log(model.toJSON());
	},
	verifyBluetooth: function()
	{
		if(window.isCordovaApp)
		{
			ble.isEnabled(
				function(){window.bluetooth.setAsEnabled();},
				function(){ble.enable(
						function(){window.bluetooth.setAsEnabled();},
						function(){window.bluetooth.setAsDisabled();}
					);
				}
			);
		}
		else{window.bluetooth.setAsEnabled();}
	},
	refreshConnection: function() {
		this.connection_view.refresh();
	}
});

var ConnectionView = Backbone.View.extend({
	el: '#connection_message',
	initialize: function() {
		this.$message = $('#connection_message');
		this.$refreshbutton = $('#connectRefreshButton');
		this.listenTo(this.model, 'change:connected', this.scanForDevices);
		this.listenTo(this.model, 'change:scanning', this.render);
		this.listenTo(this.model, 'change:found', this.connectToDevice);
		if(this.model.get('scanning')) this.model.save({scanning: false});
		this.scanForDevices();
	},
	render: function() {
		if(this.model.get('scanning')) {
			this.$message.html("Searching for device...");
			this.$refreshbutton.hide();
		}
		else if(this.model.get('found')) {
			this.$message.html("Found! Connecting...");
			this.$refreshbutton.hide();
		}
		else {
			this.$message.html("No device found.");
			this.$refreshbutton.show();
		}
	},
	refresh: function()
	{
		this.scanForDevices();
	},
	resume: function()
	{
		if(this.model.get('connected') && this.model.get('found'))
		{
			var stateConnected = function()
			{
				console.log("App resumed, and device still connected.");
			};
			var stateDisconnected = function()
			{
				this.model.foundDevice(false);
				this.model.listAsDisconnected();
			};
			if(window.isCordovaApp) ble.isConnected(this.model.get('uuid'), stateConnected, stateDisconnected);
		}
		else if(!this.model.get('connected') && this.model.get('found'))
		{
			this.connectToDevice();
		}
		else
		{
			this.scanForDevices();
		}
		this.render();
	},
	scanForDevices: function()
	{
		if(!window.bluetooth.get('enabled') || this.model.get('scanning') || this.model.get('connected')) return;
		this.model.toggleScanning();
		var onScanError = function(errMsg)
		{
			var objToString = Object.prototype.toString();
			console.log("ERROR: " + objToString.call(errMsg));
		};
		var onDiscoverDevice = function(device)
		{
			if(device.name=='SMRTHLP')
			{
				clearTimeout(this.scanTimer)
				this.model.saveUuid(device.id);
				this.model.foundDevice(true);
				this.model.toggleScanning();
			}
		};
		if(window.isCordovaApp)
		{
			if (cordova.platformId === 'android')
			{
				ble.startScan([], onDiscoverDevice, onScanError);
			}
			else
			{
				ble.startScan([window.bluefruit.serviceUUID], onDiscoverDevice, onScanError);
			}
			this.scanTimer = setTimeout(function() {
				ble.stopScan(
					function() {
						console.log("Stopping scan.");
						window.connection.toggleScanning();
					},
					function() { console.log("Unable to stop scanning."); }
				);
			}, 5000);
		}
	},
	connectToDevice: function(){
		var onConnect = function(peripheral)
		{
			if(window.isCordovaApp)
			{
				this.determineWriteType(peripheral);

				ble.startNotification(window.connection.get('uuid'), window.bluefruit.serviceUUID, window.bluefruit.rxCharacteristic, this.onData, this.onError);
			}
			this.model.listAsConnected();
		};
		var onDisconnect = function(msg) {
			window.connection.foundDevice(false);
			window.connection.listAsDisconnected();
		};
        if(window.isCordovaApp && this.model.get('found')) ble.connect(this.model.get('uuid'), onConnect, onDisconnect);
	},
	determineWriteType: function(peripheral) {
		// Adafruit nRF8001 breakout uses WriteWithoutResponse for the TX characteristic
		// Newer Bluefruit devices use Write Request for the TX characteristic
		var characteristic = peripheral.characteristics.filter(function(element) {
			if (element.characteristic.toLowerCase() === window.bluefruit.txCharacteristic) {
				return element;
			}
		})[0];
		if (characteristic.properties.indexOf('WriteWithoutResponse') > -1) {
			this.writeWithoutResponse = true;
		} else {
			this.writeWithoutResponse = false;
		}
	},
    onData: function(data)
	{
		var receivedData = bytesToString(data);
		console.log("Received data:" + receivedData);
		window.buttons.each(function(button){
			if(button.get('data') == receivedData)
			{
				button.activate();
			}
		});
	},
	onError: function(reason) {
		var objToString = Object.prototype.toString();
        console.log("ERROR: " + objToString.call(reason)); 
    }
});

var MenuItemView = Backbone.View.extend({
	el: '.mainMenu',
	initialize: function() {
		this.listenTo(this.model, 'change:buttonState', this.buttonResponder);
		//console.log(this.model.toJSON());
	},
	buttonResponder: function() {
		var pressed = this.model.get('buttonState');
		var active = window.buttonActive;
		var id = this.model.get('id');
		
		// If a button is pressed before current one has been processed, and it's not the cancel button, ignore it.
		if(window.buttons.where({buttonState: true}).length > 1 && id!=SPH_CANCEL_BUTTON) {
			this.model.silentClear();
			console.log('Suppressing button ' + id + ' because another button is already active.');
			return;
		}
		// If the cancel button is pressed and no other button is active, ignore it.
		if(window.buttons.where({buttonState: true}).length == 1 && id==SPH_CANCEL_BUTTON) {
			this.model.silentClear();
			console.log('Suppressing button ' + id + ' because there is not an active button to be cancelled.');
			return;
		}
		if(!active && !pressed) // This occurs when a task is cancelled.
		{
			if(isRegButton(id)) this.$el.toggleClass('selected', false); // Remove selection border from menu item.
		}
		else if(!active && pressed) // Button was pressed, and there isn't an active button yet.
		{
			if(isRegButton(id))
			{
				this.$el.toggleClass('selected', true);
			}
			if(id != SPH_CANCEL_BUTTON)
			{
				window.buttonActive = true;
				console.log('Button '+id+' activated');
				window.deviceMedia = this.loadMediaFile();
				var duration;
				if(window.isCordovaApp)
				{
					duration = window.deviceMedia.getDuration();
					if(duration < 0) duration = 4000;
					else duration+=1000;
				}
				else duration = 4000;
				window.buttonTimer = setTimeout(this.taskTimer,duration,this.model);
				if(window.isCordovaApp) window.deviceMedia.play();	
			}
		}
		else if(active && pressed) //Button was pressed, but there is already an active one.
		{
			if(id == SPH_CANCEL_BUTTON) //Cancel button
			{
				window.buttonActive = false;
				console.log('Button was cancelled');
				clearTimeout(window.buttonTimer);
				if(window.deviceMedia!=null)
				{
					window.deviceMedia.stop();
					window.deviceMedia.release();
					window.deviceMedia = null;
				}
				this.model.silentClear();
				var activatedButton = window.buttons.findWhere({buttonState: true});
				activatedButton.clear();
			}		
		}
		else { //This occurs when a task is about to be triggered.
			if(isRegButton(id)) this.$el.toggleClass('selected', false);
			window.buttonActive = false;
		}
	},
	loadMediaFile: function()
	{
		var sound = this.model.get('soundfile');
		console.log("Loaded soundfile:" + sound);
		if(isCordovaApp)
		{
			return new Media(sound,
				function(){console.log("Playing media:"+sound);},
				function(err){console.log(err);},
				function(status){
					if(status == Media.MEDIA_STOPPED){
						window.deviceMedia.release();
						window.deviceMedia=null;
					}});
		}
	},
	taskTimer: function(model){
		model.clear();
		task = model.get('doTask');
		task();
	}
});

var SPH_CANCEL_BUTTON = 6;
var SPH_WAKE_BUTTON = 7;
var SPH_NUMBER_OF_BUTTONS = 8;

var isRegButton = function(i)
{
	if(i<6) return true;
	else return false;
}

// this is Nordic's UART service
window.bluefruit = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

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

function testDataReception(string)
{
	var array = stringToBytes(string);
	app.connection_view.onData(array);
}
 
 function onLoad() {
	function onDeviceReady()
	{
		document.addEventListener("pause", onPause, false);
		document.addEventListener("resume", onResume, false);
		window.buttons = new DeviceButtons();
		window.connection = new DeviceConnection({id:'state'});
		window.bluetooth = new BluetoothEnabled({id:'state'});
		
		window.connection.fetch();
		app = new AppView();
	};
	function onPause()
	{
		console.log("Application moving to background.");
	};
	function onResume()
	{
		setTimeout(function() {
			console.log("Application moved to foreground.");
			window.connection.fetch();
			window.bluetooth.fetch();
			app.resume();
			
		}, 0);
		
	};
	window.isCordovaApp = !!window.cordova;
	if(window.isCordovaApp)
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
 

