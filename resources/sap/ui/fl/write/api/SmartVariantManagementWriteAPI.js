/*
 * ! OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/DefaultVariant","sap/ui/fl/StandardVariant","sap/ui/fl/apply/api/SmartVariantManagementApplyAPI","sap/ui/fl/ChangePersistenceFactory","sap/ui/fl/transport/TransportSelection"],function(D,S,a,C,T){"use strict";var b={add:function(p){var s=a._getStableId(p.control);var c=C.getChangePersistenceForControl(p.control);return c.addChangeForVariant(a._PERSISTENCY_KEY,s,p.changeSpecificData);},save:function(p){var s=a._getStableId(p.control);var c=C.getChangePersistenceForControl(p.control);return c.saveAllChangesForVariant(s);},setDefaultVariantId:function(p){var P;var c;var s=a._getStableId(p.control);var m={};m[a._PERSISTENCY_KEY]=s;var o=C.getChangePersistenceForControl(p.control);P={defaultVariantId:p.defaultVariantId,reference:o.getComponentName(),selector:m,validAppVersions:{creation:o._mComponent.appVersion,from:o._mComponent.appVersion}};var d=a._getChangeMap(p.control);c=D.updateDefaultVariantId(d,p.defaultVariantId);if(c){return c;}c=D.createChangeObject(P);var e=c.getId();d[e]=c;return c;},setExecuteOnSelect:function(p){var P;var c;var s=a._getStableId(p.control);var m={};m[a._PERSISTENCY_KEY]=s;var o=C.getChangePersistenceForControl(p.control);P={executeOnSelect:p.executeOnSelect,reference:o.getComponentName(),selector:m};var d=a._getChangeMap(p.control);c=S.updateExecuteOnSelect(d,p.executeOnSelect);if(c){return c;}c=S.createChangeObject(P);var e=c.getId();d[e]=c;return c;},_getTransportSelection:function(){return new T();}};return b;},true);
