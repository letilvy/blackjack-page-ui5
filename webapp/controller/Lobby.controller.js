sap.ui.define([
	"ase/ui5/blackjack/controller/base/BaseController",
	"ase/ui5/blackjack/model/Formatter",
	"sap/ui/model/json/JSONModel"
], function(BaseController, Formatter, JSONModel){
	"use strict";

	return BaseController.extend("ase.ui5.blackjack.controller.Lobby", {

		Formatter: Formatter,

		onInit: function(){
			this.getRouter().getRoute("lobby").attachPatternMatched(this.onLobbyMatched, this);

			// Sample for using the card
			this.setModel(new JSONModel({
				"bankerCards": [{kind: "king",suit: "clubs"}, {kind: "queen",suit: "hearts"}],
				"playerCards": [{kind: "ace",suit: "hearts"}, {kind: "7",suit: "diamonds"}, {kind: "jack",suit: "spades"}]
			}));
		},

		onLobbyMatched: function(oEvent){
			var oArgv = oEvent.getParameter("arguments");
		},

		onStartGame: function(){

		},

		onDeal: function(){

		}
	});
});