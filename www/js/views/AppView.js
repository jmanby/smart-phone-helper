/* 	View: AppView
	- This view listens to the DeviceButtons collection, DeviceConnection model, and BluetoothEnabled model.
	- This view also serves as the controller for which views are being shown, and setups most of the app.
	- In order to update the functionality that the app provides, modify the task in setupMenu() below for the particular button that needs to be changed.
*/

var app = app || {};

(function ($)
{
	'use strict';
	
	app.AppView = Backbone.View.extend(
	{
		el: $('body'), // Set to body since this is the main view
		initialize: function()
		{
			this.$bluetoothPage = $('.bluetoothPage'); // Page that is displayed when Bluetooth is not enabled
			this.$connectPage = $('.connectPage'); // Page that is displayed when the device is not connected.
			this.$mainPage = $('.mainPage'); // Page that is displayed when the device is connected.
			
			this.listenTo(app.buttons, 'reset', this.setupMenu); // Resets the DeviceButtons collection
			this.listenTo(app.buttons, 'add', this.addButton); // Called whenever a DeviceButton model is added to the collection
			this.listenTo(app.connection, 'change:connected', this.render);
			this.listenTo(app.bluetooth, 'change:enabled', this.render);
			this.verifyBluetooth(); // Make sure Bluetooth is enabled
			this.connection_view = new app.ConnectionView({model: app.connection}); // Initialize ConnectionView in order to connect app to the device
			this.setupMenu(); // Setup DeviceButtons collection
			
			this.render();
		},
		events:
		{
			'touchstart #btRefreshButton': 'verifyBluetooth',
			'touchstart #connectRefreshButton': 'refreshConnection',
			'click #connectRefreshButton': 'refreshConnection'
		},
		render: function()
		{
			if(!app.bluetooth.get('enabled')) //If Bluetooth disabled
			{
				this.$bluetoothPage.show();
				this.$connectPage.hide();
				this.$mainPage.hide();
			}
			else if(!app.connection.get('connected')) // If not connected
			{
				this.$bluetoothPage.hide();
				this.$connectPage.show();
				this.$mainPage.hide();
			}
			else // If connected
			{
				this.$bluetoothPage.hide();
				this.$connectPage.hide();
				this.$mainPage.show();
			}
			return this;
		},
		resume: function() // This is run whenever the device is resumed after being in the background.
		{
			this.verifyBluetooth();
			this.connection_view.resume();
			this.render();
		},
		setupMenu: function()
		{
			app.buttons.add(new app.DeviceButton(
			{
				id: 0,
				data: 'A',
				soundfile: 'sounds/CallingJose.m4a',
				doTask: function()
				{
					console.log('Running task a');
					if(app.isCordovaApp)
					{
						window.plugins.CallNumber.callNumber(
						function() // Success
						{
							console.log("Calling number")
						},
						function() // Failure
						{
							console.log("Failed to call number")
						},
						"9102294641"); // Number to call
					}
				}
			}));
			app.buttons.add(new app.DeviceButton(
			{
				id: 1,
				data: 'B',
				soundfile: 'sounds/TextingJose.m4a',
				doTask: function()
				{
					console.log('Running task b');
					if(app.isCordovaApp)
					{
						location.href = "sms:9102294641?body=Please%20call%20me%20when%20you%20are%20available.";
					}
				}
			}));
			app.buttons.add(new app.DeviceButton(
			{
				id: 2,
				data: 'C',
				soundfile: 'sounds/CallingTaxi.m4a',
				doTask: function()
				{
					console.log('Running task c');
					if(app.isCordovaApp)
					{
						window.plugins.CallNumber.callNumber(
						function() // Success
						{
							console.log("Calling number")
						},
						function() // Failure
						{
							console.log("Failed to call number")
						},
						"9193333333");
					}
				}
			}));
			app.buttons.add(new app.DeviceButton(
			{
				id: 3,
				data: 'D',
				soundfile: 'sounds/CallingRalOp.m4a',
				doTask: function()
				{
					console.log('Running task d');
					if(app.isCordovaApp)
					{
						window.plugins.CallNumber.callNumber(
						function() // Success
						{
							console.log("Calling number")
						},
						function() // Failure
						{
							console.log("Failed to call number")
						},
						"9197825400");
					}
				}
			}));
			app.buttons.add(new app.DeviceButton(
			{
				id: 4,
				data: 'E',
				soundfile: 'sounds/OrderMeds.m4a',
				doTask: function()
				{
					console.log('Running task e');
					if(app.isCordovaApp)
					{
						cordova.plugins.email.isAvailable(
						function(isAvailable)
						{
							cordova.plugins.email.open(
							{
								app: 'gmail',
								to: 'jemanby@ncsu.edu',
								attachments: ['file://images/Rx_CindyAllen_2013Aug13.png'],
								subject: 'Refill medication for Cindy Allen',
								body: 'Hello, I need to order a refill of my prescription for Metformin. My Rx is attached to this email. My credit card information is on file. If you have any questions, you may reach me at (919)123-4567. Sincerely, Cindy Allen.',
								isHtml: false
							});
						});
					}
				}
			}));
			app.buttons.add(new app.DeviceButton(
			{
				id: 5,
				data: 'F',
				soundfile: 'sounds/CallingKroger.m4a',
				doTask: function()
				{
					console.log('Running task f');
					if(app.isCordovaApp)
					{
						window.plugins.CallNumber.callNumber(
						function() // Success
						{
							console.log("Calling number")
						},
						function() // Failure
						{
							console.log("Failed to call number")
						},
						"9198322110");
					}
				}
			}));
			app.buttons.add(new app.DeviceButton(
			{
				id: 6,
				data: 'X',
				soundfile: '',
				doTask: function()
				{
					console.log('Canceling task');
				}
			}));
			app.buttons.add(new app.DeviceButton(
			{
				id: 7,
				data: 'W',
				soundfile: 'sounds/MenuChoices.m4a',
				doTask: function()
				{
					console.log('Reading menu');
				}
			}));
			for(var i=0;i<SPH_NUMBER_OF_BUTTONS;i++) // Create a MenuItemView for each DeviceButton
			{
				var button = app.buttons.get(i);
				if(isRegButton(i)) 
				{
					var element = "#cell_" + i;
				}
				else
				{
					var element = ".mainMenu";
				}
				var view = new app.MenuItemView({model: button, el: element});
			}
		},
		addButton: function(model)
		{
			console.log(model.toJSON());
		},
		verifyBluetooth: function()
		{
			if(app.isCordovaApp)
			{
				ble.isEnabled(
				function() // Confirmed as enabled
				{
					app.bluetooth.setAsEnabled();
				},
				function() // Confirmed as disabled
				{
					ble.enable( // Attempt to enable
					function() // Succeeded to enable
					{
						app.bluetooth.setAsEnabled();
					},
					function() // Failed to enable
					{
						app.bluetooth.setAsDisabled();
					});
				});
			}
			else
			{
				app.bluetooth.setAsEnabled();
			}
		},
		refreshConnection: function() // Handle refresh button (Only appears when device is not connected and wasn't found in last scan.)
		{
			this.connection_view.refresh();
		}
	});
})(jQuery);