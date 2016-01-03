/* 	View: ConnectionView
	- This view listens to the DeviceConnection model and informs user of connection status.
	- This view also serves as the controller for keeping the app connected via Bluetooth to the device and handling received data.
*/

var app = app || {};

(function ($)
{
	'use strict';
	
	app.ConnectionView = Backbone.View.extend(
	{
		el: '#connection_message',
		initialize: function()
		{
			this.$message = $('#connection_message'); // Header that is updated to inform a user of the connection status.
			this.$refreshbutton = $('#connectRefreshButton'); // Button that is only displayed when the device is not connected and scanning has stopped.
			this.listenTo(this.model, 'change:connected', this.scanForDevices); // Whenever device disconnects, start scanning again
			this.listenTo(this.model, 'change:scanning', this.render); // Whenever scanning starts/stops, update connection status for user.
			this.listenTo(this.model, 'change:found', this.connectToDevice); // Whenever device is found during a scan, try to connect to it.
			if(this.model.get('scanning')) this.model.save({scanning: false}); // If app was closed while scanning, this will allow the app to scan again.
			this.scanForDevices();
		},
		render: function() // Used to display connection status to user
		{
			if(this.model.get('scanning')) // App just started scanning for device
			{
				this.$message.html("Searching for device...");
				this.$refreshbutton.hide();
			}
			else if(this.model.get('found')) // Scan terminated and device was found.
			{
				this.$message.html("Found! Connecting...");
				this.$refreshbutton.hide();
			}
			else // Scan terminated and device was not found.
			{
				this.$message.html("No device found.");
				this.$refreshbutton.show();
			}
		},
		refresh: function() // Called when user presses refresh button after a scan has failed to find the device.
		{
			this.scanForDevices();
		},
		resume: function() // This is run whenever the device is resumed after being in the background.
		{
			if(this.model.get('connected') && this.model.get('found')) // If device was connected before app was paused
			{
				var stateConnected = function() // It's still connected, no need to do anything.
				{
					console.log("App resumed, and device still connected.");
				};
				var stateDisconnected = function() // It's now disconnected, so update connection model.
				{
					this.model.foundDevice(false);
					this.model.listAsDisconnected();
				};
				if(app.isCordovaApp) ble.isConnected(this.model.get('uuid'), stateConnected, stateDisconnected); // Check connection state
			}
			else if(!this.model.get('connected') && this.model.get('found')) // If device was found but hadn't connected yet before app was paused
			{
				this.connectToDevice();
			}
			else // If device was not connected and hadn't been found before app was paused
			{
				this.scanForDevices();
			}
			this.render();
		},
		scanForDevices: function()
		{
			// If Bluetooth is disabled, connection is not possible. If device is already scanning, or is connected, there is no need to start scanning again.
			if(!app.bluetooth.get('enabled') || this.model.get('scanning') || this.model.get('connected')) return;
			this.model.toggleScanning(); // Scanning is about to start, so update connection model
			var onScanError = function(errMsg)
			{
				var objToString = Object.prototype.toString();
				console.log("ERROR: " + objToString.call(errMsg));
			};
			var onDiscoverDevice = function(device)
			{
				if(device.name=='SMRTHLP') // This is only checked because of a filtering bug with the UUID with Android. It may be needed to give a unique uuid to each device for security reasons.
				{
					clearTimeout(this.scanTimer)
					this.model.saveUuid(device.id);
					this.model.foundDevice(true);
					this.model.toggleScanning();
				}
			};
			if(app.isCordovaApp)
			{
				if (cordova.platformId === 'android')
				{
					ble.startScan([], onDiscoverDevice, onScanError); // This scans for all Bluetooth capable devices and is needed due to a bug with Android filtering
				}
				else
				{
					ble.startScan([app.bluefruit.serviceUUID], onDiscoverDevice, onScanError); // This scans for only the device wanted
				}
				this.scanTimer = setTimeout(function() // Stop scanning after certain amount of milliseconds
				{
					ble.stopScan(
						function() // Scan successfully stopped
						{
							console.log("Stopping scan.");
							app.connection.toggleScanning();
						},
						function() // Scan stop failed
						{
							console.log("Unable to stop scanning.");
						}
					);
				}, SPH_SCAN_TIME);
			}
		},
		connectToDevice: function()
		{
			var onConnect = function(peripheral) // When app connects to device
			{
				if(app.isCordovaApp)
				{
					this.determineWriteType(peripheral);
					// Set onData() to be called whenever data is sent over Bluetooth by the device
					ble.startNotification(app.connection.get('uuid'), app.bluefruit.serviceUUID, app.bluefruit.rxCharacteristic, this.onData, this.onError);
				}
				this.model.listAsConnected();
			};
			var onDisconnect = function(msg) // When app disconnects from the device
			{
				app.connection.foundDevice(false);
				app.connection.listAsDisconnected();
			};
			if(app.isCordovaApp && this.model.get('found')) ble.connect(this.model.get('uuid'), onConnect, onDisconnect); // Create Bluetooth connection with device
		},
		determineWriteType: function(peripheral)
		{
			// Adafruit nRF8001 breakout uses WriteWithoutResponse for the TX characteristic
			// Newer Bluefruit devices use Write Request for the TX characteristic
			var characteristic = peripheral.characteristics.filter(function(element)
			{
				if (element.characteristic.toLowerCase() === app.bluefruit.txCharacteristic)
				{
					return element;
				}
			})[0];
			if (characteristic.properties.indexOf('WriteWithoutResponse') > -1)
			{
				this.writeWithoutResponse = true;
			}
			else
			{
				this.writeWithoutResponse = false;
			}
		},
		onData: function(data)
		{
			var receivedData = bytesToString(data);
			console.log("Received data:" + receivedData);
			app.buttons.each(function(button) // Loop through each button model
			{
				if(button.get('data') == receivedData) // If button data matches received data
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
})(jQuery);