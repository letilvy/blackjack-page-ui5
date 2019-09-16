sap.ui.define([
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/ui/test/gherkin/dataTableUtils",
	"sap/ui/test/Opa5"
], function(StepDefinitions, DataTableUtils, Opa5){
	"use strict";

	var Steps = StepDefinitions.extend("test.integration.Steps", {

		init: function(){
			var oOpa5 = new Opa5();

			this.register(/^I have started the app$/i, function(){
				oOpa5.iStartMyUIComponent({componentConfig: {name: "ase.ui5.blackjack"}});
			});

			this.register(/server return following data in game start:$/i, function(aCard){
				var oCard = DataTableUtils.toObject(aCard);
				sap.ui.test.Opa.getContext().gameStatus = {
					"bankerCards": JSON.parse(oCard.bankerCards),
					"playerCards": JSON.parse(oCard.playerCards),
					"status": oCard.status
				};
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

			this.register(/^player win the game$/i, function(Given, When, Then){
				Then.onTheLobbyPage.playerWinTheGame();
			});
		}
	});

	return Steps;
});