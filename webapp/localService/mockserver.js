sap.ui.define([
	"sap/ui/core/util/MockServer"
], function(MockServer){
	"use strict";

	var oMockServer;

	return {
		init: function(){
			var oUriParameters = jQuery.sap.getUriParameters(),
				sMockServerUrl = "http://localhost:8080/",
				sMetadataUrl = "../localService/metadata.xml",
				sJsonFilesUrl = "../localService/mockdata";

			oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});

			// configure mock server with a delay of 1s
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: (oUriParameters.get("serverDelay") || 1000)
			});

			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl: sJsonFilesUrl,
				bGenerateMissingMockData: true
			});

			// print network request 
			oMockServer.attachBefore(sap.ui.core.util.MockServer.HTTPMETHOD.GET, function (oEvent) {
				var sRequestUrl = decodeURI(oEvent.getParameter("oXhr").url);
				jQuery.sap.log.info("Network Request: " + sRequestUrl);
			});

			var aRequests = oMockServer.getRequests();

			//var sLobbyJsonUrl = sJsonFilesUrl + "/Set.json";
			aRequests.push({
				method: "POST",
				path: new RegExp("startgame(.*)"),
				response: function(oXhr) {
					//var aLobby = jQuery.sap.syncGetJSON(sLobbyJsonUrl).data.d.results;
					oXhr.respondJSON(200, {}, {
						"bankerCards": [{kind: "king",suit: "clubs"}],
						"playerCards": [{kind: "ace",suit: "hearts"}]
					});
					return true;
				}
			});

			aRequests.push({
				//key: "deal",
				method: "POST",
				path: new RegExp("deal(.*)"),
				response: function(oXhr) {
					oXhr.respondJSON(200, {}, {kind: "jack",suit: "spades"});
					return true;
				}
			});

			oMockServer.setRequests(aRequests);

			oMockServer.start();

			this.renewDealRequest({kind: "jack",suit: "hearts"}, "win");

			jQuery.sap.log.info("Running the app with mock data");
		},

		renewDealRequest: function(oNewCard, sResult){
			var aRequests = oMockServer.getRequests();
			aRequests = aRequests.filter(o => { return o.key !== "deal"; });
			aRequests.push({
				//key: "deal",
				method: "POST",
				path: new RegExp("deal(.*)"),
				response: function(oXhr) {
					oXhr.respondJSON(200, {}, {
						newCard: oNewCard,
						result: sResult
					});
					return true;
				}
			});
			oMockServer.setRequests(aRequests);
		}
	};

});

