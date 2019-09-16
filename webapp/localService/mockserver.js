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
				sJsonFilesUrl = jQuery.sap.getModulePath("ase/ui5/blackjack/localService/mockdata");

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
			oMockServer.attachBefore(sap.ui.core.util.MockServer.HTTPMETHOD.GET, function(oEvent){
				var sRequestUrl = decodeURI(oEvent.getParameter("oXhr").url);
				jQuery.sap.log.info("Network Request: " + sRequestUrl);
			});

			var aRequests = oMockServer.getRequests(),
				sTableCardJsonUrl = sJsonFilesUrl + "/TableCardSet.json",
				aTableCard = jQuery.sap.syncGetJSON(sTableCardJsonUrl).data;

			aRequests.push({
				method: "POST",
				path: new RegExp("startgame(.*)"),
				response: function(oXhr){
					if(sap.ui.test && sap.ui.test.Opa.getContext().gameStatus){
						oXhr.respondJSON(200, {}, sap.ui.test.Opa.getContext().gameStatus);
					}else{
						oXhr.respondJSON(200, {}, {
							"bankerCards": [aTableCard[0]],
							"playerCards": [aTableCard[1]],
							"status": "ongoing"
						});
					}

					return true;
				}
			});

			aRequests.push({
				method: "POST",
				path: new RegExp("deal(.*)"),
				response: function(oXhr){
					if(sap.ui.test && sap.ui.test.Opa.getContext().gameStatus){
						oXhr.respondJSON(200, {}, sap.ui.test.Opa.getContext().gameStatus);
					}else{
						oXhr.respondJSON(200, {}, {
							"bankerCards": [aTableCard[0]],
							"playerCards": [aTableCard[1],aTableCard[2]],
							"status": "ongoing"
						});
					}
					
					return true;
				}
			});

			oMockServer.setRequests(aRequests);

			oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");
		}
	};

});

