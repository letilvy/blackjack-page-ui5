/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./lib/_GroupLock","./lib/_Helper","sap/base/Log","sap/ui/base/SyncPromise","sap/ui/model/Context"],function(_,a,L,S,B){"use strict";var c="sap.ui.model.odata.v4.Context",m,r=0,v=-9007199254740991;function f(o,p,e,b){var E,P=[o.fetchValue(p,null,b)],R=o.getPath(p);if(e){P.push(o.oModel.getMetaModel().fetchUI5Type(R));}return S.all(P).then(function(d){var t=d[1],V=d[0];if(V&&typeof V==="object"){E=new Error("Accessed value is not primitive: "+R);E.isNotPrimitive=true;throw E;}return e?t.formatValue(V,"string"):V;});}var C=B.extend("sap.ui.model.odata.v4.Context",{constructor:function(M,b,p,i,o,R){if(p[0]!=="/"){throw new Error("Not an absolute path: "+p);}if(p.slice(-1)==="/"){throw new Error("Unsupported trailing slash: "+p);}B.call(this,M,p);this.oBinding=b;this.oCreatePromise=o&&Promise.resolve(o).then(function(){});this.oSyncCreatePromise=o&&S.resolve(o);this.iIndex=i;this.iReturnValueContextId=R;}});C.prototype._delete=function(g,e){var t=this;if(this.isTransient()){return this.oBinding._delete(g,"n/a",this);}return this.fetchCanonicalPath().then(function(s){return t.oBinding._delete(g,s.slice(1),t,e);});};C.prototype.adjustPredicate=function(t,p,P){var T=this.sPath;if(T.includes(t)){this.sPath=T.split("/").map(function(s){if(s.endsWith(t)){s=s.slice(0,-t.length)+p;}return s;}).join("/");if(P){P(T,this.sPath);}this.oModel.getDependentBindings(this).forEach(function(d){d.adjustPredicate(t,p);});}};C.prototype.checkUpdate=function(){return S.all(this.oModel.getDependentBindings(this).map(function(d){return d.checkUpdate();}));};C.prototype.created=function(){return this.oCreatePromise;};C.prototype.delete=function(g){var G,M=this.oModel,t=this;M.checkGroupId(g);this.oBinding.checkSuspended();if(!this.isTransient()&&this.hasPendingChanges()){throw new Error("Cannot delete due to pending changes");}G=this.oBinding.lockGroup(g,true);return this._delete(G).then(function(){var R=t.sPath.slice(1);M.getAllBindings().forEach(function(b){b.removeCachesAndMessages(R,true);});}).catch(function(e){G.unlock(true);M.reportError("Failed to delete "+t,c,e);throw e;});};C.prototype.destroy=function(){this.oModel.getDependentBindings(this).forEach(function(d){d.setContext(undefined);});this.oBinding=undefined;this.oModel=undefined;B.prototype.destroy.apply(this);};C.prototype.doSetProperty=function(p,V,g,s){var M=this.oModel.getMetaModel(),t=this;if(this.oModel.bAutoExpandSelect){p=this.oModel.getMetaModel().getReducedPath(a.buildPath(this.sPath,p),this.oBinding.getBaseForPathReduction());}return M.fetchUpdateData(p,this).then(function(R){return t.withCache(function(o,b,d){var F=false;function e(E){t.oModel.reportError("Failed to update path "+t.oModel.resolve(p,t),c,E);h(false);}function h(j){if(F){d.firePatchCompleted(j);F=false;}}function i(){F=true;d.firePatchSent();}return o.update(g,R.propertyPath,V,s?undefined:e,R.editUrl,b,M.getUnitOrCurrencyPath(t.oModel.resolve(p,t)),d.isPatchWithoutSideEffects(),i).then(function(){h(true);},function(E){h(false);throw E;});},R.entityPath);});};C.prototype.fetchCanonicalPath=function(){return this.oModel.getMetaModel().fetchCanonicalPath(this);};C.prototype.fetchValue=function(p,l,b){if(this.iIndex===v){return S.resolve();}if(!p||p[0]!=="/"){p=a.buildPath(this.sPath,p);if(this.oModel.bAutoExpandSelect){p=this.oModel.getMetaModel().getReducedPath(p,this.oBinding.getBaseForPathReduction());}}return this.oBinding.fetchValue(p,l,b);};C.prototype.getBinding=function(){return this.oBinding;};C.prototype.getCanonicalPath=a.createGetMethod("fetchCanonicalPath",true);C.prototype.getGroupId=function(){return this.oBinding.getGroupId();};C.prototype.getIndex=function(){if(this.oBinding.bCreatedAtEnd){return this.iIndex<0?this.oBinding.iMaxLength-this.iIndex-1:this.iIndex;}return this.getModelIndex();};C.prototype.getModelIndex=function(){if(this.oBinding.iCreatedContexts){return this.iIndex+this.oBinding.iCreatedContexts;}return this.iIndex;};C.prototype.getObject=function(p){return a.publicClone(this.getValue(p));};C.prototype.getProperty=function(p,e){var E,s;this.oBinding.checkSuspended();s=f(this,p,e,true);if(s.isRejected()){s.caught();E=s.getResult();if(E.isNotPrimitive){throw E;}else if(!E.$cached){L.warning(E.message,p,c);}}return s.isFulfilled()?s.getResult():undefined;};C.prototype.getReturnValueContextId=function(){if(this.iReturnValueContextId){return this.iReturnValueContextId;}if(this.oBinding.bRelative&&this.oBinding.oContext&&this.oBinding.oContext.getReturnValueContextId){return this.oBinding.oContext.getReturnValueContextId();}};C.prototype.getQueryOptionsForPath=function(p){return this.oBinding.getQueryOptionsForPath(p);};C.prototype.getUpdateGroupId=function(){return this.oBinding.getUpdateGroupId();};C.prototype.getValue=function(p){var s,t=this;this.oBinding.checkSuspended();s=this.fetchValue(p,null,true).catch(function(e){if(!e.$cached){t.oModel.reportError("Unexpected error",c,e);}});if(s.isFulfilled()){return s.getResult();}};C.prototype.hasPendingChanges=function(){return this.isTransient()||this.oModel.getDependentBindings(this).some(function(d){return d.hasPendingChanges();})||this.oModel.withUnresolvedBindings("hasPendingChangesInCaches",this.sPath.slice(1));};C.prototype.isTransient=function(){return this.oSyncCreatePromise&&this.oSyncCreatePromise.isPending();};C.prototype.patch=function(d){return this.withCache(function(o,p){o.patch(p,d);},"");};C.prototype.refresh=function(g,A){this.oModel.checkGroupId(g);this.oBinding.checkSuspended();if(this.hasPendingChanges()){throw new Error("Cannot refresh entity due to pending changes: "+this);}if(this.oBinding.refreshSingle){this.oBinding.refreshSingle(this,this.oBinding.lockGroup(g,true),A);}else{if(arguments.length>1){throw new Error("Unsupported parameter bAllowRemoval: "+A);}if(!this.oBinding.refreshReturnValueContext(this,g)){this.oBinding.refresh(g);}}this.oModel.withUnresolvedBindings("removeCachesAndMessages",this.sPath.slice(1));};C.prototype.requestCanonicalPath=a.createRequestMethod("fetchCanonicalPath");C.prototype.requestObject=function(p){this.oBinding.checkSuspended();return Promise.resolve(this.fetchValue(p)).then(a.publicClone);};C.prototype.requestProperty=function(p,e){this.oBinding.checkSuspended();return Promise.resolve(f(this,p,e));};C.prototype.requestSideEffects=function(p,g){var o=this.oBinding.oCachePromise.getResult(),P;this.oBinding.checkSuspended();this.oModel.checkGroupId(g);if(!o||this.isTransient()){throw new Error("Unsupported context: "+this);}if(!p||!p.length){throw new Error("Missing edm:(Navigation)PropertyPath expressions");}if(this.oBinding.bRelative&&!this.oBinding.oContext){throw new Error("Cannot request side effects of unresolved binding's context: "+this);}P=p.map(function(b){if(b&&typeof b==="object"){if(b.$PropertyPath){return b.$PropertyPath;}if("$NavigationPropertyPath"in b){return b.$NavigationPropertyPath;}}throw new Error("Not an edm:(Navigation)PropertyPath expression: "+JSON.stringify(b));});g=g||this.getUpdateGroupId();if(this.oModel.isAutoGroup(g)){this.oModel.oRequestor.relocateAll("$parked."+g,g);}return Promise.resolve(this.oBinding.requestSideEffects(g,P,this)).then(function(){});};C.prototype.setProperty=function(p,V,g){var G;this.oBinding.checkSuspended();this.oModel.checkGroupId(g);if(typeof V==="function"||(V&&typeof V==="object")){throw new Error("Not a primitive value");}G=this.oModel.lockGroup(g||this.getUpdateGroupId(),true);return this.doSetProperty(p,V,G,true).catch(function(e){G.unlock(true);throw e;});};C.prototype.toString=function(){var i="";if(this.iIndex!==undefined){i="["+this.iIndex+(this.isTransient()?"|transient":"")+"]";}return this.sPath+i;};C.prototype.withCache=function(p,P){if(this.iIndex===v){return S.resolve();}return this.oBinding.withCache(p,P[0]==="/"?P:a.buildPath(this.sPath,P));};m={create:function(M,b,p,i,o){return new C(M,b,p,i,o);},createReturnValueContext:function(M,b,p){r+=1;return new C(M,b,p,undefined,undefined,r);}};Object.defineProperty(m,"VIRTUAL",{value:v});return m;},false);
