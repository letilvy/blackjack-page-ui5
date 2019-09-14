sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/I18NText"
], function(Opa5, Press, Ancestor, Properties, I18NText){
	"use strict";

	var sViewName = "Lobby";

	Opa5.createPageObjects({
		onTheLobbyPage: {
			actions: {
				startTheGame: function(){
					return this.waitFor({
						viewName: sViewName,
						id: "btn_start_game",
						actions: new Press(),
						errorMessage: "Cannot start the game"
					});
				},
				dealOneCard: function(sSuit, sKind, sStatus){
					sap.ui.test.Opa.getContext().newDealCard = {
						newCard: {kind: sKind, suit: sSuit},
						status: sStatus
					};
					return this.waitFor({
						viewName: sViewName,
						id: "btn_deal",
						actions: new Press(),
						errorMessage: "Cannot deal a card"
					});
				}
			},
			assertions: {
				personShouldHaveCard: function(sPerson, sSuit, sKind){
					return this.waitFor({
						viewName: sViewName,
						id: "panel_" + sPerson.toLowerCase() + "_cards",
						success: function(oPanel){
							return this.waitFor({
								controlType: "ase.ui5.blackjack.control.Card",
								matchers: [
									new Ancestor(oPanel),
									new Properties({
										suit: sSuit,
										kind: sKind
									})
								],
								success: function(){
									Opa5.assert.ok(true, sPerson + " has card " + "(" + sSuit + "," + sKind + ")");
								},
								errorMessage: "Cannot find " + "(" + sSuit + "," + sKind + ")" + " for " + sPerson
							});
						},
						errorMessage: "Cannot find " + sPerson
					});
				},
				playerWinTheGame: function(){
					return this.waitFor({
						viewName: sViewName,
						id: "title_game_result",
						matchers: new I18NText({
							propertyName: "text",
							key: "textPlayerWin"
						}),
						success: function(){
							Opa5.assert.ok(true, "Player win the game");
						},
						errorMessage: "The result does not show player win"
					});
				}
			}
		}
	});
});