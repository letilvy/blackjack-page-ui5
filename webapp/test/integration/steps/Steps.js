sap.ui.define([
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/ui/test/Opa5"
], function(StepDefinitions, Opa5){
	"use strict";

	var Steps = StepDefinitions.extend("test.integration.Steps", {

		init: function(){
			var oOpa5 = new Opa5();

			this.register(/^I start my app$/i, function(Given, When, Then){
				oOpa5.iStartMyUIComponent({componentConfig: {name: "ase.ui5.blackjack"}});
			});

		}
	});

	return Steps;

});