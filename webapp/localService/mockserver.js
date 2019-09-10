sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	var oMockServer,
		_sAppModulePath = "ase/ui5/blackjack/",
		_sJsonFilesModulePath = _sAppModulePath + "localService/mockdata";

	return {
		init: function () {
			var oUriParameters = jQuery.sap.getUriParameters(),
				sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath),
				sManifestUrl = jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json"),
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oMainDataSource = oManifest["sap.app"].dataSources.mainService,
				sMetadataUrl = jQuery.sap.getModulePath(_sAppModulePath + oMainDataSource.settings.localUri.replace(".xml", ""), ".xml"),
				// ensure there is a trailing slash
				sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/";

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

			var sLobbyJsonUrl = sJsonFilesUrl + "/Set.json";
			aRequests.push({
				method: "GET",
				path: new RegExp("LobbySet(.*)"),
				response: function(oXhr, sWave) {
					var aLobby = jQuery.sap.syncGetJSON(sLobbyJsonUrl).data.d.results;
					oXhr.respondJSON(200, {}, { d: {results: aLobby} });
					return true;
				}
			});

			oMockServer.setRequests(aRequests);

			oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");
		}
	};

});

