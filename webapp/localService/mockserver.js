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
			oMockServer.attachBefore(sap.ui.core.util.MockServer.HTTPMETHOD.GET, function(oEvent){
				var sRequestUrl = decodeURI(oEvent.getParameter("oXhr").url);
				jQuery.sap.log.info("Network Request: " + sRequestUrl);
			});

			oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");
		}
	};

});

