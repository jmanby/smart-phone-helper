/* 	Model: DeviceConnection
	- This model is used to store the state of the Bluetooth connection between the Smartphone Helper device and the mobile app.
	- Views listening to 'connected' will be able to detect when the connection changes.
	- Views listening to 'found' will be able to detect when the device has been found during a scan by the app.
	- Views listening to 'scanning' will be able to detect when the mobile app starts or stops scanning for devices.
*/
var app = app || {};

(function ()
{
	'use strict';
	app.DeviceConnection = Backbone.Model.extend(
	{
		defaults:
		{
			connected: false,
			found: false,
			scanning: false
		},
		localStorage: new Backbone.LocalStorage("DeviceConnection"), // Data persistance is very important because the device and the app will remain connected even in the background.
		listAsConnected: function() // Called after successful connection
		{
			this.save({connected: true}); 
		},
		listAsDisconnected: function() // Called after disconnection
		{
			this.save({connected: false}); 
		},
		saveUuid: function(uid) // Stores the UUID of the device
		{
			this.save({uuid: uid});
		},
		foundDevice: function(foundD) // Takes input of true or false, used to record when the device uuid is valid
		{
			if(foundD) this.save({found: true}); 
			else this.save({found: false});
		},
		toggleScanning: function() // Records when the app is scanning
		{
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
})();

