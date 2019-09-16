/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/changeHandler/ChangeHandlerMediator","sap/ui/fl/changeHandler/Base","sap/base/Log"],function(C,B,L){"use strict";var A={};var t="sap.ui.core.Title";var T="sap.m.Toolbar";var s="sap.m.Label";var a="sap.ui.comp.smartfield.SmartLabel";A.applyChange=function(c,S,p){var o=c.getDefinition();var b=c.getDependentControl("targetContainerHeader",p);var m=p.modifier;var d=p.appComponent;var g=function(e){return e&&e.content&&e.content.createFunction;};var f=function(o,e){return o.content&&o.content.newFieldSelector&&(o.content.newFieldIndex!==undefined)&&o.content.bindingPath&&o.content.oDataServiceVersion&&!!g(e);};return C.getChangeHandlerSettings({"scenario":"addODataFieldWithLabel","oDataServiceVersion":o.content&&o.content.oDataServiceVersion}).then(function(e){if(f(o,e)){var h=o.content;var F=h.newFieldSelector;var k=h.bindingPath;var l=h.newFieldIndex;var n=m.getAggregation(S,"content");var q=n.slice();var I=n.indexOf(b);var N=0;var r=0;var u,v;if(n.length===1||n.length===I+1){N=n.length;}else{var j=0;for(j=I+1;j<n.length;j++){var w=m.getControlType(n[j]);if(w===s||w===a){if(r==l){N=j;break;}r++;}if(w===t||w===T){N=j;break;}if(j===(n.length-1)){N=n.length;}}}var x={"appComponent":d,"view":p.view,"fieldSelector":F,"bindingPath":k};if(m.bySelector(F,d)){return B.markAsNotApplicable("Control to be created already exists:"+F);}v=g(e);u=v(m,x);var y={};if(u.label&&u.control){y.label=m.getSelector(u.label,d);}y.control=m.getSelector(u.control,d);c.setRevertData(y);q.splice(N,0,u.label,u.control);m.removeAllAggregation(S,"content");for(var i=0;i<q.length;++i){m.insertAggregation(S,"content",q[i],i,p.view);}return true;}else{L.error("Change does not contain sufficient information to be applied or ChangeHandlerMediator could not be retrieved: ["+o.layer+"]"+o.namespace+"/"+o.fileName+"."+o.fileType);}});};A.completeChangeContent=function(c,S,p){var o=p.appComponent;var v=p.view;var b=c.getDefinition();if(!b.content){b.content={};}if(S.parentId){var f=p.modifier.bySelector(S.parentId,o,v);var d=f.getTitle()||f.getToolbar();if(d){c.addDependentControl(d.getId(),"targetContainerHeader",p);}}else{throw new Error("oSpecificChangeInfo.parentId attribute required");}if(S.bindingPath){b.content.bindingPath=S.bindingPath;}else{throw new Error("oSpecificChangeInfo.bindingPath attribute required");}if(S.newControlId){b.content.newFieldSelector=p.modifier.getSelector(S.newControlId,o);}else{throw new Error("oSpecificChangeInfo.newControlId attribute required");}if(S.index===undefined){throw new Error("oSpecificChangeInfo.targetIndex attribute required");}else{b.content.newFieldIndex=S.index;}if(S.oDataServiceVersion===undefined){throw new Error("oSpecificChangeInfo.oDataServiceVersion attribute required");}else{b.content.oDataServiceVersion=S.oDataServiceVersion;}};A.revertChange=function(c,S,p){var o=p.appComponent;var v=p.view;var m=p.modifier;var b=c.getRevertData();var f=m.bySelector(b.control,o,v);if(b.label){var l=m.bySelector(b.label,o,v);m.removeAggregation(S,"content",l);m.destroy(l);}m.removeAggregation(S,"content",f);m.destroy(f);c.resetRevertData();return true;};return A;},true);
