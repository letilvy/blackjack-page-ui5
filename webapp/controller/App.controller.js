sap.ui.define([
	"ase/ui5/blackjack/controller/base/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel){
	"use strict";

	return BaseController.extend("ase.ui5.blackjack.controller.App", {
		onInit: function(){
			this.getView().setDisplayBlock(true);
		}
	});
});