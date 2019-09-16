/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./Context","./ODataParentBinding","./lib/_AggregationCache","./lib/_AggregationHelper","./lib/_Cache","./lib/_GroupLock","./lib/_Helper","sap/base/Log","sap/base/util/uid","sap/ui/base/SyncPromise","sap/ui/model/Binding","sap/ui/model/ChangeReason","sap/ui/model/FilterOperator","sap/ui/model/FilterProcessor","sap/ui/model/FilterType","sap/ui/model/ListBinding","sap/ui/model/Sorter","sap/ui/model/odata/OperationMode","sap/ui/thirdparty/jquery"],function(C,a,_,b,c,d,e,L,u,S,B,f,F,g,h,j,k,O,q){"use strict";var s="sap.ui.model.odata.v4.ODataListBinding",m={AggregatedDataStateChange:true,change:true,createCompleted:true,createSent:true,dataReceived:true,dataRequested:true,DataStateChange:true,patchCompleted:true,patchSent:true,refresh:true};var l=j.extend("sap.ui.model.odata.v4.ODataListBinding",{constructor:function(M,p,o,v,i,P){j.call(this,M,p);a.call(this);if(p.slice(-1)==="/"){throw new Error("Invalid path: "+p);}this.oAggregation=null;this.aApplicationFilters=e.toArray(i);this.sChangeReason=M.bAutoExpandSelect?"AddVirtualContext":undefined;this.oDiff=undefined;this.aFilters=[];this.bHasAnalyticalInfo=false;this.mPreviousContextsByPath={};this.aPreviousData=[];this.aSorters=e.toArray(v);this.applyParameters(q.extend(true,{},P));this.oHeaderContext=this.bRelative?null:C.create(this.oModel,this,p);if(!this.bRelative||o&&!o.fetchValue){this.createReadGroupLock(this.getGroupId(),true);}this.setContext(o);M.bindingCreated(this);}});a(l.prototype);l.prototype.attachCreateCompleted=function(i,o){this.attachEvent("createCompleted",i,o);};l.prototype.detachCreateCompleted=function(i,o){this.detachEvent("createCompleted",i,o);};l.prototype.attachCreateSent=function(i,o){this.attachEvent("createSent",i,o);};l.prototype.detachCreateSent=function(i,o){this.detachEvent("createSent",i,o);};l.prototype._delete=function(G,E,o,n){var p=false,t=this;return this.deleteFromCache(G,E,String(o.iIndex),n,function(I,r){var v,i,P,R,w;if(o.created()){t.destroyCreated(o,true);}else{for(i=I;i<t.aContexts.length;i+=1){o=t.aContexts[i];if(o){t.mPreviousContextsByPath[o.getPath()]=o;}}R=t.oModel.resolve(t.sPath,t.oContext);t.aContexts.splice(I,1);for(i=I;i<t.aContexts.length;i+=1){if(t.aContexts[i]){w=i-t.iCreatedContexts;P=e.getPrivateAnnotation(r[i],"predicate");v=R+(P||"/"+w);o=t.mPreviousContextsByPath[v];if(o){delete t.mPreviousContextsByPath[v];if(o.iIndex===w){o.checkUpdate();}else{o.iIndex=w;}}else{o=C.create(t.oModel,t,v,w);}t.aContexts[i]=o;}}t.iMaxLength-=1;}p=true;}).then(function(){if(p){t._fireChange({reason:f.Remove});}});};l.prototype.adjustPredicate=function(t,p,o){var i=this;function n(r,N){var I=i.aPreviousData.indexOf(r);if(I>=0){i.aPreviousData[I]=N;}}if(o){o.adjustPredicate(t,p,n);}else{this.oHeaderContext.adjustPredicate(t,p);this.aContexts.forEach(function(o){o.adjustPredicate(t,p,n);});}};l.prototype.applyParameters=function(p,i){var A,o;this.checkBindingParameters(p,["$$aggregation","$$canonicalPath","$$groupId","$$operationMode","$$ownRequest","$$patchWithoutSideEffects","$$updateGroupId"]);o=p.$$operationMode||this.oModel.sOperationMode;if(!o&&(this.aSorters.length||this.aApplicationFilters.length)){throw new Error("Unsupported operation mode: "+o);}this.sOperationMode=o;this.sGroupId=p.$$groupId;this.sUpdateGroupId=p.$$updateGroupId;this.mQueryOptions=this.oModel.buildQueryOptions(p,true);this.mParameters=p;if("$$aggregation"in p){if("$apply"in this.mQueryOptions){throw new Error("Cannot combine $$aggregation and $apply");}A=e.clone(p.$$aggregation);this.mQueryOptions.$apply=b.buildApply(A).$apply;this.oAggregation=A;}if(this.isRootBindingSuspended()){this.setResumeChangeReason(i);return;}this.removeCachesAndMessages("");this.fetchCache(this.oContext);this.reset(i);};l.prototype.attachEvent=function(E){if(!(E in m)){throw new Error("Unsupported event '"+E+"': v4.ODataListBinding#attachEvent");}return j.prototype.attachEvent.apply(this,arguments);};l.prototype.create=function(i,n,A){var o,p=this.fetchResourcePath(),r,G,R=this.oModel.resolve(this.sPath,this.oContext),t="($uid="+u()+")",T=R+t,v=this;if(!R){throw new Error("Binding is not yet resolved: "+this);}A=!!A;if(A&&!this.mQueryOptions.$count){throw new Error("Must set $count to create at the end");}if(this.bCreatedAtEnd!==undefined&&this.bCreatedAtEnd!==A){throw new Error("Creating entities at the start and at the end is not supported.");}this.bCreatedAtEnd=A;this.checkSuspended();G=this.lockGroup(this.getUpdateGroupId(),true);r=this.createInCache(G,p,"",t,i,function(){v.destroyCreated(o,true);return Promise.resolve().then(function(){v._fireChange({reason:f.Remove});});},function(E){v.oModel.reportError("POST on '"+p+"' failed; will be repeated automatically",s,E);v.fireEvent("createCompleted",{context:o,success:false});},function(){v.fireEvent("createSent",{context:o});}).then(function(w){var x,P;if(!(i&&i["@$ui5.keepTransientPath"])){P=e.getPrivateAnnotation(w,"predicate");if(P){v.adjustPredicate(t,P,o);v.oModel.checkMessages();}}v.fireEvent("createCompleted",{context:o,success:true});if(!n){x=v.getGroupId();if(!v.oModel.isDirectGroup(x)&&!v.oModel.isAutoGroup(x)){x="$auto";}return v.refreshSingle(o,v.lockGroup(x));}},function(E){G.unlock(true);throw E;});this.iCreatedContexts+=1;o=C.create(this.oModel,this,T,-this.iCreatedContexts,r);this.aContexts.unshift(o);this._fireChange({reason:f.Add});return o;};l.prototype.createContexts=function(n,o,r){var p=false,t,v,i,w=r.$count,x,y=this.bLengthFinal,M=this.oModel,P=M.resolve(this.sPath,this.oContext),z,A=n>this.aContexts.length,D=this;function E(){var i,N=D.iMaxLength+D.iCreatedContexts;if(N>=D.aContexts.length){return;}for(i=N;i<D.aContexts.length;i+=1){if(D.aContexts[i]){D.aContexts[i].destroy();}}while(N>0&&!D.aContexts[N-1]){N-=1;}D.aContexts.length=N;p=true;}for(i=n;i<n+r.length;i+=1){if(this.aContexts[i]===undefined){p=true;x=i-this.iCreatedContexts;z=e.getPrivateAnnotation(r[i-n],"predicate")||e.getPrivateAnnotation(r[i-n],"transientPredicate");v=P+(z||"/"+x);t=this.mPreviousContextsByPath[v];if(t&&(!t.created()||t.isTransient())){delete this.mPreviousContextsByPath[v];t.iIndex=x;t.checkUpdate();}else{t=C.create(M,this,v,x);}this.aContexts[i]=t;}}if(Object.keys(this.mPreviousContextsByPath).length){sap.ui.getCore().addPrerenderingTask(this.destroyPreviousContexts.bind(this));}if(w!==undefined){this.bLengthFinal=true;this.iMaxLength=w-this.iCreatedContexts;E();}else{if(r.length<o){this.iMaxLength=n-this.iCreatedContexts+r.length;E();}else if(this.aContexts.length>this.iMaxLength+this.iCreatedContexts){this.iMaxLength=Infinity;}if(!(A&&r.length===0)){this.bLengthFinal=this.aContexts.length===this.iMaxLength+this.iCreatedContexts;}}if(this.bLengthFinal!==y){p=true;}return p;};l.prototype.destroy=function(){if(this.bHasAnalyticalInfo&&this.aContexts===undefined){return;}this.aContexts.forEach(function(o){o.destroy();});this.destroyPreviousContexts();if(this.oHeaderContext){this.oHeaderContext.destroy();}this.oModel.bindingDestroyed(this);this.oAggregation=undefined;this.aApplicationFilters=undefined;this.aContexts=undefined;this.oDiff=undefined;this.aFilters=undefined;this.oHeaderContext=undefined;this.mPreviousContextsByPath=undefined;this.aPreviousData=undefined;this.mQueryOptions=undefined;this.aSorters=undefined;a.prototype.destroy.apply(this);j.prototype.destroy.apply(this);};l.prototype.destroyCreated=function(o,D){var i,I=o.getModelIndex();this.iCreatedContexts-=1;for(i=0;i<I;i+=1){this.aContexts[i].iIndex+=1;}if(!this.iCreatedContexts){this.bCreatedAtEnd=undefined;}this.aContexts.splice(I,1);if(D&&this.iCurrentEnd){this.mPreviousContextsByPath[o.getPath()]=o;}else{o.destroy();}};l.prototype.destroyPreviousContexts=function(){var p=this.mPreviousContextsByPath;if(p){Object.keys(p).forEach(function(P){p[P].destroy();});this.mPreviousContextsByPath={};}};l.prototype.doCreateCache=function(r,Q,o,D){var A=this.oAggregation&&(this.oAggregation.groupLevels.length||b.hasMinOrMax(this.oAggregation.aggregate)||b.hasGrandTotal(this.oAggregation.aggregate));Q=this.inheritQueryOptions(Q,o);return A?_.create(this.oModel.oRequestor,r,this.oAggregation,Q):c.create(this.oModel.oRequestor,r,Q,this.oModel.bAutoExpandSelect,D);};l.prototype.doFetchQueryOptions=function(o){var i=this.getOrderby(this.mQueryOptions.$orderby),t=this;return this.fetchFilter(o,this.mQueryOptions.$filter).then(function(n){return e.mergeQueryOptions(t.mQueryOptions,i,n);});};l.prototype.enableExtendedChangeDetection=function(D,K){if(K!==undefined){throw new Error("Unsupported property 'key' with value '"+K+"' in binding info for "+this);}return j.prototype.enableExtendedChangeDetection.apply(this,arguments);};l.prototype.fetchContexts=function(i,n,M,G,A,D){var p,t=this;if(this.bCreatedAtEnd){i+=this.iCreatedContexts;}G=G||this.lockGroup();p=this.fetchData(i,n,M,G,D);if(A){p=Promise.resolve(p);}return p.then(function(r){return r&&t.createContexts(i,n,r.value);},function(E){G.unlock(true);throw E;});};l.prototype.fetchData=function(i,n,M,G,D){var o=this.oContext,t=this;return this.oCachePromise.then(function(p){if(t.bRelative&&o!==t.oContext){return undefined;}if(p){return p.read(i,n,M,G,D);}G.unlock();return o.fetchValue(t.sReducedPath).then(function(r){var v;r=r||[];v=r.$count;r=r.slice(i,i+n);r.$count=v;return{value:r};});});};l.prototype.fetchFilter=function(o,i){var n,M,p;function r(x,E,W){var y,z,T,V;function A(D){return T?"tolower("+D+")":D;}T=E==="Edm.String"&&x.bCaseSensitive===false;z=A(decodeURIComponent(x.sPath));V=A(e.formatLiteral(x.oValue1,E));switch(x.sOperator){case F.BT:y=z+" ge "+V+" and "+z+" le "+A(e.formatLiteral(x.oValue2,E));break;case F.NB:y=w(z+" lt "+V+" or "+z+" gt "+A(e.formatLiteral(x.oValue2,E)),W);break;case F.EQ:case F.GE:case F.GT:case F.LE:case F.LT:case F.NE:y=z+" "+x.sOperator.toLowerCase()+" "+V;break;case F.Contains:case F.EndsWith:case F.NotContains:case F.NotEndsWith:case F.NotStartsWith:case F.StartsWith:y=x.sOperator.toLowerCase().replace("not","not ")+"("+z+","+V+")";break;default:throw new Error("Unsupported operator: "+x.sOperator);}return y;}function t(x,y,W){if(x.aFilters){return S.all(x.aFilters.map(function(z){return t(z,y,x.bAnd);})).then(function(z){return w(z.join(x.bAnd?" and ":" or "),W&&!x.bAnd);});}return M.fetchObject(v(x.sPath,y),p).then(function(P){var z,A,D;if(!P){throw new Error("Type cannot be determined, no metadata for path: "+p.getPath());}D=x.sOperator;if(D===F.All||D===F.Any){z=x.oCondition;A=x.sVariable;if(D===F.Any&&!z){return x.sPath+"/any()";}y=Object.create(y);y[A]=v(x.sPath,y);return t(z,y).then(function(E){return x.sPath+"/"+x.sOperator.toLowerCase()+"("+A+":"+E+")";});}return r(x,P.$Type,W);});}function v(P,x){var y=P.split("/");y[0]=x[y[0]];return y[0]?y.join("/"):P;}function w(x,W){return W?"("+x+")":x;}n=g.combineFilters(this.aFilters,this.aApplicationFilters);if(!n){return S.resolve(i);}M=this.oModel.getMetaModel();p=M.getMetaContext(this.oModel.resolve(this.sPath,o));return t(n,{},i).then(function(x){if(i){x+=" and ("+i+")";}return x;});};l.prototype.fetchValue=function(p,o,i){var t=this;return this.oCachePromise.then(function(n){var r;if(n){r=t.getRelativePath(p);if(r!==undefined){return n.fetchValue(d.$cached,r,undefined,o);}}if(t.oContext){return t.oContext.fetchValue(p,o,i);}});};l.prototype.filter=function(v,i){var n=e.toArray(v);if(this.sOperationMode!==O.Server){throw new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server");}if(this.hasPendingChanges()){throw new Error("Cannot filter due to pending changes");}if(i===h.Control){this.aFilters=n;}else{this.aApplicationFilters=n;}if(this.isRootBindingSuspended()){this.setResumeChangeReason(f.Filter);return this;}this.createReadGroupLock(this.getGroupId(),true);this.removeCachesAndMessages("");this.fetchCache(this.oContext);this.reset(f.Filter);return this;};l.prototype.getContexts=function(i,n,M){var o,p,D=false,r=false,G,P,R=!!this.sChangeReason,v,t=this;L.debug(this+"#getContexts("+i+", "+n+", "+M+")",undefined,s);this.checkSuspended();if(i!==0&&this.bUseExtendedChangeDetection){throw new Error("Unsupported operation: v4.ODataListBinding#getContexts,"+" first parameter must be 0 if extended change detection is enabled, but is "+i);}if(M!==undefined&&this.bUseExtendedChangeDetection){throw new Error("Unsupported operation: v4.ODataListBinding#getContexts,"+" third parameter must not be set if extended change detection is enabled");}if(this.bRelative&&!this.oContext){this.aPreviousData=[];return[];}o=this.sChangeReason||f.Change;this.sChangeReason=undefined;if(o==="AddVirtualContext"){sap.ui.getCore().addPrerenderingTask(function(){t.sChangeReason="RemoveVirtualContext";t._fireChange({detailedReason:t.sChangeReason,reason:f.Change});t.reset(f.Refresh);v.destroy();},true);v=C.create(this.oModel,this,this.oModel.resolve(this.sPath,this.oContext)+"/"+C.VIRTUAL,C.VIRTUAL);return[v];}if(o==="RemoveVirtualContext"){return[];}i=i||0;n=n||this.oModel.iSizeLimit;if(!M||M<0){M=0;}G=this.oReadGroupLock;this.oReadGroupLock=undefined;if(!this.oDiff){P=this.fetchContexts(i,n,M,G,R,function(){D=true;t.fireDataRequested();});this.resolveRefreshPromise(P);P.then(function(w){if(t.bUseExtendedChangeDetection){t.oDiff={aDiff:t.getDiff(n),iLength:n};}if(r){if(w||(t.oDiff&&t.oDiff.aDiff.length)){t._fireChange({reason:o});}else{t.oDiff=undefined;}}if(D){t.fireDataReceived({data:{}});}},function(E){if(D){t.fireDataReceived(E.canceled?{data:{}}:{error:E});}throw E;}).catch(function(E){t.oModel.reportError("Failed to get contexts for "+t.oModel.sServiceUrl+t.oModel.resolve(t.sPath,t.oContext).slice(1)+" with start index "+i+" and length "+n,s,E);});r=true;}this.iCurrentBegin=i;this.iCurrentEnd=i+n;p=this.getContextsInViewOrder(i,n);if(this.bUseExtendedChangeDetection){if(this.oDiff&&n!==this.oDiff.iLength){throw new Error("Extended change detection protocol violation: Expected "+"getContexts(0,"+this.oDiff.iLength+"), but got getContexts(0,"+n+")");}p.dataRequested=!this.oDiff;p.diff=this.oDiff?this.oDiff.aDiff:[];}this.oDiff=undefined;return p;};l.prototype.getContextsInViewOrder=function(n,o){var p,i,r;if(this.bCreatedAtEnd){p=[];r=Math.min(o,this.getLength()-n);for(i=0;i<r;i+=1){p[i]=this.aContexts[this.getModelIndex(n+i)];}}else{p=this.aContexts.slice(n,n+o);}return p;};l.prototype.getCurrentContexts=function(){var i,n=Math.min(this.iCurrentEnd,this.iMaxLength+this.iCreatedContexts)-this.iCurrentBegin;i=this.getContextsInViewOrder(this.iCurrentBegin,n);while(i.length<n){i.push(undefined);}return i;};l.prototype.getDependentBindings=function(){var t=this;return this.oModel.getDependentBindings(this).filter(function(D){return!(D.oContext.getPath()in t.mPreviousContextsByPath);});};l.prototype.getDiff=function(i){var D,n,t=this;n=this.getContextsInViewOrder(0,i).map(function(o){return t.bDetectUpdates?JSON.stringify(o.getValue()):o.getPath();});D=this.diffData(this.aPreviousData,n);this.aPreviousData=n;return D;};l.prototype.getDistinctValues=function(){throw new Error("Unsupported operation: v4.ODataListBinding#getDistinctValues");};l.prototype.getFilterInfo=function(i){var o=g.combineFilters(this.aFilters,this.aApplicationFilters),r=null,n;if(o){r=o.getAST(i);}if(this.mQueryOptions.$filter){n={expression:this.mQueryOptions.$filter,syntax:"OData "+this.oModel.getODataVersion(),type:"Custom"};if(r){r={left:r,op:"&&",right:n,type:"Logical"};}else{r=n;}}return r;};l.prototype.getHeaderContext=function(){return(this.bRelative&&!this.oContext)?null:this.oHeaderContext;};l.prototype.getModelIndex=function(v){if(!this.bCreatedAtEnd){return v;}return v<this.getLength()-this.iCreatedContexts?v+this.iCreatedContexts:this.getLength()-v-1;};l.prototype.getLength=function(){if(this.bLengthFinal){return this.iMaxLength+this.iCreatedContexts;}return this.aContexts.length?this.aContexts.length+10:0;};l.prototype.getOrderby=function(o){var i=[],t=this;this.aSorters.forEach(function(n){if(n instanceof k){i.push(n.sPath+(n.bDescending?" desc":""));}else{throw new Error("Unsupported sorter: "+n+" - "+t);}});if(o){i.push(o);}return i.join(',');};l.prototype.getQueryOptions=function(w){var r={},t=this;if(w){throw new Error("Unsupported parameter value: bWithSystemQueryOptions: "+w);}Object.keys(this.mQueryOptions).forEach(function(K){if(K[0]!=="$"){r[K]=e.clone(t.mQueryOptions[K]);}});return r;};l.prototype.inheritQueryOptions=function(Q,o){var i;if(!Object.keys(this.mParameters).length){i=this.getQueryOptionsForPath("",o);if(Q.$orderby&&i.$orderby){Q.$orderby+=","+i.$orderby;}if(Q.$filter&&i.$filter){Q.$filter="("+Q.$filter+") and ("+i.$filter+")";}Q=q.extend({},i,Q);}return Q;};l.prototype.initialize=function(){if((!this.bRelative||this.oContext)&&!this.getRootBinding().isSuspended()){if(this.oModel.bAutoExpandSelect){this._fireChange({detailedReason:this.sChangeReason,reason:f.Change});}else{this._fireRefresh({reason:f.Refresh});}}};l.prototype.isLengthFinal=function(){return this.bLengthFinal;};l.prototype.refreshInternal=function(r,G,i,K){var t=this;function n(){return t.oModel.getDependentBindings(t).map(function(D){return D.refreshInternal(r,G,false,K);});}if(this.isRootBindingSuspended()){this.refreshSuspended(G);return S.all(n());}this.createReadGroupLock(G,this.isRoot());return this.oCachePromise.then(function(o){var p=t.oRefreshPromise;if(o&&!p){t.removeCachesAndMessages(r);t.fetchCache(t.oContext);p=t.createRefreshPromise();if(K){p.catch(function(E){t.oCachePromise=S.resolve(o);o.setActive(true);t._fireChange({reason:f.Change});});}}t.reset(f.Refresh);return S.all(n().concat(p));});};l.prototype.refreshSingle=function(o,G,A){var r=o.getPath().slice(1),t=this;if(o===this.oHeaderContext){throw new Error("Unsupported header context: "+o);}return this.withCache(function(n,p,v){var D=false,P=[],R=false;function w(i){if(D){t.fireDataReceived(i);}}function x(){D=true;t.fireDataRequested();}function y(){var i,I;if(o.created()){t.destroyCreated(o);}else{I=o.getModelIndex();t.aContexts.splice(I,1);for(i=I;i<t.aContexts.length;i+=1){if(t.aContexts[i]){t.aContexts[i].iIndex-=1;}}o.destroy();t.iMaxLength-=1;}R=true;t._fireChange({reason:f.Remove});}P.push((A?n.refreshSingleWithRemove(G,p,o.getModelIndex(),x,y):n.refreshSingle(G,p,o.getModelIndex(),x)).then(function(E){var U=[];w({data:{}});if(!R){U.push(o.checkUpdate());if(A){U.push(t.refreshDependentBindings(r,G.getGroupId()));}}return S.all(U).then(function(){return E;});},function(E){w({error:E});throw E;}).catch(function(E){G.unlock(true);t.oModel.reportError("Failed to refresh entity: "+o,s,E);}));if(!A){P.push(t.refreshDependentBindings(r,G.getGroupId()));}return S.all(P).then(function(i){return i[0];});});};l.prototype.requestContexts=function(i,n,G){var t=this;if(this.bRelative&&!this.oContext){throw new Error("Unresolved binding: "+this.sPath);}this.checkSuspended();this.oModel.checkGroupId(G);i=i||0;n=n||this.oModel.iSizeLimit;return Promise.resolve(this.fetchContexts(i,n,0,this.lockGroup(G,true)).then(function(o){if(o){t._fireChange({reason:f.Change});}return t.getContextsInViewOrder(i,n);},function(E){t.oModel.reportError("Failed to get contexts for "+t.oModel.sServiceUrl+t.oModel.resolve(t.sPath,t.oContext).slice(1)+" with start index "+i+" and length "+n,s,E);throw E;}));};l.prototype.requestSideEffects=function(G,p,o){var A,M=this.oModel,n={},P,i,t=this;function r(P){return P.catch(function(E){M.reportError("Failed to request side effects",s,E);throw E;});}return this.oCachePromise.then(function(v){var w=o&&o!==t.oHeaderContext,x=w?undefined:t.iCurrentEnd-t.iCurrentBegin,y;if(p.indexOf("")<0){y=w?o.getModelIndex():t.iCurrentBegin;P=v.requestSideEffects(M.lockGroup(G),p,n,y,x);if(P){i=[P];t.visitSideEffects(G,p,w?o:undefined,n,i);return S.all(i.map(r));}}if(w){return t.refreshSingle(o,M.lockGroup(G),false);}if(t.aContexts.length){A=t.aContexts.every(function(o){return o.isTransient();});if(A){return S.resolve();}}return t.refreshInternal("",G,false,true);});};l.prototype.reset=function(i){var E=this.iCurrentEnd===0,t=this;if(this.aContexts){this.aContexts.forEach(function(o){t.mPreviousContextsByPath[o.getPath()]=o;});}this.aContexts=[];this.iCreatedContexts=0;this.bCreatedAtEnd=undefined;this.iCurrentBegin=this.iCurrentEnd=0;this.iMaxLength=Infinity;this.bLengthFinal=false;if(i&&!(E&&i===f.Change)){this.sChangeReason=i;this._fireRefresh({reason:i});}if(this.getHeaderContext()){this.oModel.getDependentBindings(this.oHeaderContext).forEach(function(o){o.checkUpdate();});}};l.prototype.resumeInternal=function(){var i=this.getDependentBindings(),n=this.sResumeChangeReason;this.sResumeChangeReason=f.Change;this.removeCachesAndMessages("");this.reset();this.fetchCache(this.oContext);i.forEach(function(D){D.resumeInternal(false);});if(this.sChangeReason==="AddVirtualContext"){this._fireChange({detailedReason:this.sChangeReason,reason:n});}else{this._fireRefresh({reason:n});}this.oModel.getDependentBindings(this.oHeaderContext).forEach(function(o){o.checkUpdate();});};l.prototype.setAggregation=function(A){if(this.hasPendingChanges()){throw new Error("Cannot set $$aggregation due to pending changes");}if(!this.oAggregation&&"$apply"in this.mQueryOptions){throw new Error("Cannot override existing $apply : '"+this.mQueryOptions.$apply+"'");}A=e.clone(A);this.mQueryOptions.$apply=b.buildApply(A).$apply;this.oAggregation=A;if(this.isRootBindingSuspended()){this.setResumeChangeReason(f.Change);return;}this.removeCachesAndMessages("");this.fetchCache(this.oContext);this.reset(f.Change);};l.prototype.setContext=function(o){var i,r,t=this;if(this.oContext!==o){if(this.bRelative){for(i=0;i<t.iCreatedContexts;i+=1){if(t.aContexts[i].isTransient()){throw new Error("setContext on relative binding is forbidden if a "+"transient entity exists: "+t);}}this.reset();this.fetchCache(o);if(o){r=this.oModel.resolve(this.sPath,o);if(this.oHeaderContext&&this.oHeaderContext.getPath()!==r){this.oHeaderContext.destroy();this.oHeaderContext=null;}if(!this.oHeaderContext){this.oHeaderContext=C.create(this.oModel,this,r);}}B.prototype.setContext.call(this,o);}else{this.oContext=o;}}};l.prototype.sort=function(v){if(this.sOperationMode!==O.Server){throw new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server");}if(this.hasPendingChanges()){throw new Error("Cannot sort due to pending changes");}this.aSorters=e.toArray(v);if(this.isRootBindingSuspended()){this.setResumeChangeReason(f.Sort);return this;}this.removeCachesAndMessages("");this.createReadGroupLock(this.getGroupId(),true);this.fetchCache(this.oContext);this.reset(f.Sort);return this;};l.prototype.updateAnalyticalInfo=function(A){var o={aggregate:{},group:{}},H=false,t=this;A.forEach(function(i){var D={};if("total"in i){if("grouped"in i){throw new Error("Both dimension and measure: "+i.name);}if(i.as){D.name=i.name;o.aggregate[i.as]=D;}else{o.aggregate[i.name]=D;}if(i.min){D.min=true;H=true;}if(i.max){D.max=true;H=true;}if(i.with){D.with=i.with;}}else if(!("grouped"in i)||i.inResult||i.visible){o.group[i.name]=D;}});this.oAggregation=o;this.changeParameters(b.buildApply(o));this.bHasAnalyticalInfo=true;if(H){return{measureRangePromise:Promise.resolve(this.getRootBindingResumePromise().then(function(){return t.oCachePromise;}).then(function(i){return i.getMeasureRangePromise();}))};}};return l;});