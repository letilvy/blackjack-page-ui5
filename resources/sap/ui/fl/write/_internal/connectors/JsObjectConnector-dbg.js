/*
 * ! OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/write/_internal/connectors/BrowserStorageConnector"
], function(
	merge,
	LocalObjectConnectorApply,
	BrowserStorageConnector
) {
	"use strict";


	/**
	 * Connector that saves the data in an internal object.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.JsObjectConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	var JsObjectConnector = merge({}, BrowserStorageConnector, /** @lends sap.ui.fl.write._internal.connectors.JsObjectConnector */ {
		oStorage: {
			setItem: function(sKey, vValue) {
				LocalObjectConnectorApply.oStorage.setItem(sKey, vValue);
			},
			clear: function() {
				LocalObjectConnectorApply.oStorage.clear();
			},
			getItem: function(sKey) {
				return LocalObjectConnectorApply.oStorage.getItem(sKey);
			},
			_items: LocalObjectConnectorApply.oStorage._items
		}
	});

	return JsObjectConnector;
}, true);
