sap.ui.define([
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/ui/test/Opa5"
], function(StepDefinitions, Opa5){
	"use strict";

	var Steps = StepDefinitions.extend("test.integration.Steps", {

		init: function(){
			var oOpa5 = new Opa5();

			this.register(/^I start my app$/i, function(){
				oOpa5.iStartMyUIComponent({componentConfig: {name: "ase.ui5.blackjack"}});
			});

			this.register(/^I start the game$/i, function(Given, When, Then){
				When.onTheLobbyPage.startTheGame();
			});

			this.register(/^(.+) should have card \((\w+) (\w+)\)$/i, function(sPerson, sSuit, sKind, Given, When, Then){
				Then.onTheLobbyPage.personShouldHaveCard(sPerson, sSuit, sKind);
			});

			this.register(/^player ask for deal$/i, function(){
				return this;
			});

			this.register(/^player get a new card \((\w+) (\w+)\) which makes points (.+) 21$/i, function(sSuit, sKind, sStatus, Given, When, Then){
				When.onTheLobbyPage.dealOneCard(sSuit, sKind, sStatus === "equal to" ? "win":"");
			});

			this.register(/^player win the game$/i, function(Given, When, Then){
				Then.onTheLobbyPage.playerWinTheGame();
			});
		}
	});

	return Steps;
});