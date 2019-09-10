sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(UIComponent, Device, JSONModel, MessageBox){
	"use strict";

	return UIComponent.extend("ase.ui5.blackjack.Component", {
		metadata: {
			manifest: "json"
		},

		init: function(){
			//this.getModel().attachBatchRequestFailed(this.serviceErrorHandler, this);

			// set the device model
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");

			// call the base component's init function and create the App view
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		serviceErrorHandler: function(oError){
			MessageBox.error(oError.message || "Error when request service!", {
				details: oError.responseText || ""
			});
		}
	});
});