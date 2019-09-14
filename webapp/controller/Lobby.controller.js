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
			/*this.setModel(new JSONModel({
				"bankerCards": [{kind: "king",suit: "clubs"}, {kind: "queen",suit: "hearts"}],
				"playerCards": [{kind: "ace",suit: "hearts"}, {kind: "7",suit: "diamonds"}, {kind: "jack",suit: "spades"}]
			}));*/
			this.setModel(new JSONModel({
				"bankerCards": [],
				"playerCards": [],
				"status": "initial"
			}));
		},

		onLobbyMatched: function(oEvent){
			var oArgv = oEvent.getParameter("arguments");
		},

		onStartGame: function(){
			jQuery.ajax({
				type: "POST",
				url: "http://localhost:8080/startgame",
				success: (oData) => {
					this.setModel(new JSONModel(oData));
				}
			});
		},

		onDeal: function(){
			jQuery.ajax({
				type: "POST",
				url: "http://localhost:8080/deal",
				success: (oData) => {
					var oModel = this.getModel();
					var aPlayerCard = oModel.getProperty("/playerCards");
					aPlayerCard.push(oData.newCard);
					oModel.setProperty("/playerCards", aPlayerCard);
					oModel.setProperty("/status", oData.status);
				}
			});
		}
	});
});