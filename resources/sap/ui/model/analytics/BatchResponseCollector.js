/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(function(){"use strict";function B(p){if(p){this.setup(p);}}B.TYPE_SUCCESS="success";B.TYPE_ERROR="error";B.prototype.setup=function(p){this.iRequestCollectionCount=0;this.aCollectedSuccesses=[];this.aCollectedErrors=[];this.aExecutedRequestDetails=p.executedRequests;this.oAnalyticalBinding=p.binding;this.fnSuccessHandler=p.success;this.fnErrorHandler=p.error;};B.prototype.success=function(r){this.collect(r,B.TYPE_SUCCESS);};B.prototype.error=function(r){this.collect(r,B.TYPE_ERROR);};B.prototype.collect=function(r,R){this.iRequestCollectionCount++;if(R===B.TYPE_SUCCESS){this.aCollectedSuccesses.push(r);}else{this.aCollectedErrors.push(r);}var o=(this.aCollectedSuccesses.length+this.aCollectedErrors.length);if(o===this.aExecutedRequestDetails.length){if((this.aCollectedSuccesses.length===o)&&this.aCollectedErrors.length===0){this.fnSuccessHandler.call(window,{__batchResponses:this.aCollectedSuccesses},{requestUri:this.oAnalyticalBinding.oModel.sServiceUrl+"/$batch"});}else{this.fnErrorHandler.call(window,this.aCollectedErrors[0]||{});}}};return B;},true);
