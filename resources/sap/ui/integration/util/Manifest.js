/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/core/Manifest","sap/base/util/deepClone","sap/base/util/merge","sap/base/Log"],function(B,C,d,m,L){"use strict";var M="/{SECTION}/configuration/parameters",a="/{SECTION}";var b=B.extend("sap.ui.integration.util.Manifest",{constructor:function(s,o,i){B.call(this);this.PARAMETERS=M.replace("{SECTION}",s);this.CONFIGURATION=a.replace("{SECTION}",s);if(o){var O={};O.process=false;if(i){O.baseUrl=i;this._sBaseUrl=i;}else{L.warning("If no base URL is provided when the manifest is an object static resources cannot be loaded.");}this._oManifest=new C(o,O);this.oJson=this._oManifest.getRawJson();}}});b.prototype.getJson=function(){return this._unfreeze(this.oJson);};b.prototype.get=function(P){return this._unfreeze(h(this.oJson,P));};b.prototype.getUrl=function(){return this._oManifest.resolveUri("./","manifest");};b.prototype.getResourceBundle=function(){return this.oResourceBundle;};b.prototype._unfreeze=function(v){if(typeof v==="object"){return JSON.parse(JSON.stringify(v));}return v;};b.prototype.destroy=function(){this.oJson=null;this.oResourceBundle=null;if(this._oManifest){this._oManifest.destroy();}};b.prototype.load=function(s){if(!s||!s.manifestUrl){if(this._sBaseUrl&&this._oManifest){return this.loadI18n().then(function(){this.processManifest();}.bind(this));}else{return new Promise(function(r,i){i("Cannot load manifest.");});}}return C.load({manifestUrl:s.manifestUrl,async:true}).then(function(o){this._oManifest=o;this.oJson=this._oManifest.getRawJson();return this.loadI18n().then(function(){this.processManifest();}.bind(this));}.bind(this));};b.prototype.loadI18n=function(){return this._oManifest._loadI18n(true).then(function(o){this.oResourceBundle=o;}.bind(this));};b.prototype.processManifest=function(P){var i=0,j=15,u=jQuery.extend(true,{},this._oManifest.getRawJson());g(u,this.oResourceBundle,i,j,P);c(u);this.oJson=u;};function c(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.freeze(o);for(var k in o){if(o.hasOwnProperty(k)){c(o[k]);}}}}function e(v){return(typeof v==="string")&&v.indexOf("{{")===0&&v.indexOf("}}")===v.length-2;}function f(v){return(typeof v==="string")&&(v.indexOf("{{parameters.")>-1);}function p(P,o){var i=new Date().toISOString();var s=P.replace("{{parameters.NOW_ISO}}",i);s=s.replace("{{parameters.TODAY_ISO}}",i.slice(0,10));if(o){for(var j in o){s=s.replace("{{parameters."+j+"}}",o[j].value);}}return s;}function g(o,r,i,j,P){if(i===j){return;}if(Array.isArray(o)){o.forEach(function(I,k,A){if(typeof I==="object"){g(I,r,i+1,j,P);}else if(f(I,o,P)){A[k]=p(I,P);}else if(e(I)&&r){A[k]=r.getText(I.substring(2,I.length-2));}},this);}else{for(var s in o){if(typeof o[s]==="object"){g(o[s],r,i+1,j,P);}else if(f(o[s],o,P)){o[s]=p(o[s],P);}else if(e(o[s])&&r){o[s]=r.getText(o[s].substring(2,o[s].length-2));}}}}function h(o,P){if(o&&P&&typeof P==="string"&&P[0]==="/"){var j=P.substring(1).split("/"),s;for(var i=0,l=j.length;i<l;i++){s=j[i];o=o.hasOwnProperty(s)?o[s]:undefined;if(o===null||typeof o!=="object"){if(i+1<l&&o!==undefined){o=undefined;}break;}}return o;}return o&&o[P];}b.prototype.processParameters=function(P){if(!this._oManifest){return;}var o=this.get(this.PARAMETERS);if(P&&!o){L.error("If parameters property is set, parameters should be described in the manifest");return;}var i=this._syncParameters(P,o);this.processManifest(i);};b.prototype._mergeConfiguration=function(o){if(!this._oManifest){return;}if(!o){return;}var i=this.get(this.CONFIGURATION),j=d(this.oJson,30,30);j[this.CONFIGURATION.substring(1)]=m({},i,o);this._oManifest._oManifest=j;this.oJson=j;};b.prototype._syncParameters=function(P,o){if(!P){return o;}var k=d(o,20,20),l=Object.getOwnPropertyNames(P),n=Object.getOwnPropertyNames(k);for(var i=0;i<n.length;i++){for(var j=0;j<l.length;j++){if(n[i]===l[j]){k[n[i]].value=P[l[j]];}}}return k;};return b;},true);
