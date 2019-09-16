/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/model/ChangeReason','sap/ui/model/Filter','sap/ui/model/odata/Filter','sap/ui/model/FilterType','sap/ui/model/FilterProcessor','sap/ui/model/ListBinding','sap/ui/model/Sorter','./ODataUtils','./CountMode','sap/base/util/deepEqual','sap/base/util/merge','sap/base/Log','sap/base/assert','sap/ui/thirdparty/jquery'],function(C,F,O,a,b,L,S,c,d,e,m,f,g,q){"use strict";var h=L.extend("sap.ui.model.odata.ODataListBinding",{constructor:function(M,p,o,s,i,P){L.apply(this,arguments);this.sFilterParams=null;this.sSortParams=null;this.sRangeParams=null;this.sCustomParams=this.oModel.createCustomParams(this.mParameters);this.iStartIndex=0;this.bPendingChange=false;this.aKeys=[];this.bInitial=true;this.sCountMode=(P&&P.countMode)||this.oModel.sDefaultCountMode;this.bRefresh=false;this.bNeedsUpdate=false;this.bDataAvailable=false;this.bIgnoreSuspend=false;this.oCombinedFilter=null;this.oModel.checkFilterOperation(this.aApplicationFilters);if(!this.oModel.getServiceMetadata()){var t=this,j=function(E){t.bInitial=false;t._initSortersFilters();t.oModel.detachMetadataLoaded(j);};this.oModel.attachMetadataLoaded(this,j);}else{this.bInitial=false;this._initSortersFilters();}var r=this.oModel._getObject(this.sPath,this.oContext);this.aExpandRefs=r;if(Array.isArray(r)&&!s&&!i){this.aKeys=r;this.iLength=r.length;this.bLengthFinal=true;this.bDataAvailable=true;}else if(r===null&&this.oModel.resolve(this.sPath,this.oContext)){this.aKeys=[];this.iLength=0;this.bLengthFinal=true;this.bDataAvailable=true;}else{if(this.oModel.getServiceMetadata()){this.resetData();}}}});h.prototype.getContexts=function(s,l,t){if(this.bInitial){return[];}this.iLastLength=l;this.iLastStartIndex=s;this.iLastThreshold=t;if(!s){s=0;}if(!l){l=this.oModel.iSizeLimit;if(this.bLengthFinal&&this.iLength<l){l=this.iLength;}}if(!t){t=0;}var j=true,k=this._getContexts(s,l),o={},n;n=this.calculateSection(s,l,t,k);j=k.length!=l&&!(this.bLengthFinal&&k.length>=this.iLength-s);if(this.oModel.getServiceMetadata()){if(!this.bPendingRequest&&n.length>0&&(j||l<n.length)){this.loadData(n.startIndex,n.length);k.dataRequested=true;}}if(this.bRefresh){if(this.bLengthFinal&&this.iLength==0){this.loadData(n.startIndex,n.length,true);k.dataRequested=true;}this.bRefresh=false;}else{for(var i=0;i<k.length;i++){o[k[i].getPath()]=k[i].getObject();}if(this.bUseExtendedChangeDetection){if(this.aLastContexts&&s<this.iLastEndIndex){var p=this;var D=q.sap.arrayDiff(this.aLastContexts,k,function(r,N){return e(r&&p.oLastContextData&&p.oLastContextData[r.getPath()],N&&o&&o[N.getPath()]);},true);k.diff=D;}}this.iLastEndIndex=s+l;this.aLastContexts=k.slice(0);this.oLastContextData=m({},o);}return k;};h.prototype.getCurrentContexts=function(){return this.aLastContexts||[];};h.prototype._getContexts=function(s,l){var j=[],o,k;if(!s){s=0;}if(!l){l=this.oModel.iSizeLimit;if(this.bLengthFinal&&this.iLength<l){l=this.iLength;}}for(var i=s;i<s+l;i++){k=this.aKeys[i];if(!k){break;}o=this.oModel.getContext('/'+k);j.push(o);}return j;};h.prototype.calculateSection=function(s,l,t,k){var n,o,p,P,r,u={},K;o=s;n=0;for(var i=s;i>=Math.max(s-t,0);i--){K=this.aKeys[i];if(!K){P=i+1;break;}}for(var j=s+l;j<s+l+t;j++){K=this.aKeys[j];if(!K){p=j;break;}}r=s-P;if(P&&s>t&&r<t){if(k.length!=l){o=s-t;}else{o=P-t;}n=t;}o=Math.max(o,0);if(o==s){o+=k.length;}if(k.length!=l){n+=l-k.length;}r=p-s-l;if(r==0){n+=t;}if(p&&r<t&&r>0){if(o>s){o=p;n+=t;}}if(this.bLengthFinal&&this.iLength<(n+o)){n=this.iLength-o;}u.startIndex=o;u.length=n;return u;};h.prototype.setContext=function(o){if(this.oContext!=o){this.oContext=o;if(this.isRelative()){this._initSortersFilters();if(!this.bInitial){var r=this.oModel._getObject(this.sPath,this.oContext);this.aExpandRefs=r;if(Array.isArray(r)&&!this.aSorters.length>0&&!this.aFilters.length>0){this.aKeys=r;this.iLength=r.length;this.bLengthFinal=true;this._fireChange({reason:C.Context});}else if(!this.oModel.resolve(this.sPath,this.oContext)||r===null){this.aKeys=[];this.iLength=0;this.bLengthFinal=true;this._fireChange({reason:C.Context});}else{this.refresh();}}}}};h.prototype.getDownloadUrl=function(s){var p=[],P;if(s){p.push("$format="+encodeURIComponent(s));}if(this.sSortParams){p.push(this.sSortParams);}if(this.sFilterParams){p.push(this.sFilterParams);}if(this.sCustomParams){p.push(this.sCustomParams);}P=this.oModel.resolve(this.sPath,this.oContext);if(P){return this.oModel._createRequestUrl(P,null,p);}};h.prototype.loadData=function(s,l,p){var t=this,I=false;if(s||l){this.sRangeParams="$skip="+s+"&$top="+l;this.iStartIndex=s;}else{s=this.iStartIndex;}var P=[];if(this.sRangeParams){P.push(this.sRangeParams);}if(this.sSortParams){P.push(this.sSortParams);}if(this.sFilterParams){P.push(this.sFilterParams);}if(this.sCustomParams){P.push(this.sCustomParams);}if(!this.bLengthFinal&&(this.sCountMode==d.Inline||this.sCountMode==d.Both)){P.push("$inlinecount=allpages");I=true;}function j(D){q.each(D.results,function(i,r){t.aKeys[s+i]=t.oModel._getKey(r);});if(I&&D.__count){t.iLength=parseInt(D.__count);t.bLengthFinal=true;}if(t.iLength<s+D.results.length){t.iLength=s+D.results.length;t.bLengthFinal=false;}if(D.results.length<l||l===undefined){t.iLength=s+D.results.length;t.bLengthFinal=true;}if(s==0&&D.results.length==0){t.iLength=0;t.bLengthFinal=true;}t.oRequestHandle=null;t.bPendingRequest=false;t.bNeedsUpdate=true;t.bIgnoreSuspend=true;}function k(D){t.fireDataReceived({data:D});}function E(i,A){t.oRequestHandle=null;t.bPendingRequest=false;if(!A){t.aKeys=[];t.iLength=0;t.bLengthFinal=true;t.bDataAvailable=true;t._fireChange({reason:C.Change});}t.fireDataReceived();}function u(H){t.oRequestHandle=H;}var n=this.sPath,o=this.oContext;if(this.isRelative()){n=this.oModel.resolve(n,o);}if(n){if(p){var U=this.oModel._createRequestUrl(n,null,P);this.fireDataRequested();this.oModel.fireRequestSent({url:U,method:"GET",async:true});setTimeout(function(){t.bNeedsUpdate=true;t.checkUpdate();t.oModel.fireRequestCompleted({url:U,method:"GET",async:true,success:true});t.fireDataReceived({data:{}});},0);}else{this.bPendingRequest=true;this.fireDataRequested();this.oModel._loadData(n,P,j,E,false,u,k);}}};h.prototype.getLength=function(){if(this.bLengthFinal||this.iLength==0){return this.iLength;}else{var A=this.iLastThreshold||this.iLastLength||10;return this.iLength+A;}};h.prototype.isLengthFinal=function(){return this.bLengthFinal;};h.prototype._getLength=function(){var t=this;var p=[];if(this.sFilterParams){p.push(this.sFilterParams);}if(this.mParameters&&this.mParameters.custom){var o={custom:{}};q.each(this.mParameters.custom,function(s,v){o.custom[s]=v;});p.push(this.oModel.createCustomParams(o));}function _(D){t.iLength=parseInt(D);t.bLengthFinal=true;}function i(E){var s="Request for $count failed: "+E.message;if(E.response){s+=", "+E.response.statusCode+", "+E.response.statusText+", "+E.response.body;}f.warning(s);}var P=this.oModel.resolve(this.sPath,this.oContext);if(P){var u=this.oModel._createRequestUrl(P+"/$count",null,p);var r=this.oModel._createRequest(u,"GET",false);r.headers["Accept"]="text/plain, */*;q=0.5";this.oModel._request(r,_,i,undefined,undefined,this.oModel.getServiceMetadata());}};h.prototype.refresh=function(j,k,E){var l=false;if(!j){if(E){var r=this.oModel.resolve(this.sPath,this.oContext);var o=this.oModel.oMetadata._getEntityTypeByPath(r);if(o&&(o.entityType in E)){l=true;}}if(k&&!l){q.each(this.aKeys,function(i,K){if(K in k){l=true;return false;}});}if(!k&&!E){l=true;}}if(j||l){this.abortPendingRequest();this.resetData();this._fireRefresh({reason:C.Refresh});}};h.prototype._fireRefresh=function(p){if(this.oModel.resolve(this.sPath,this.oContext)){this.bRefresh=true;this.fireEvent("refresh",p);}};h.prototype.initialize=function(){if(this.oModel.oMetadata.isLoaded()){if(this.bDataAvailable){this._fireChange({reason:C.Change});}else{this._fireRefresh({reason:C.Refresh});}}};h.prototype.checkUpdate=function(j,k){var l=this.sChangeReason?this.sChangeReason:C.Change,n=false,o,p,t=this,r,R;if(this.bSuspended&&!this.bIgnoreSuspend){return;}if(!j&&!this.bNeedsUpdate){r=this.oModel._getObject(this.sPath,this.oContext);R=Array.isArray(r)&&!e(r,this.aExpandRefs);this.aExpandRefs=r;if(R){if(this.aSorters.length>0||this.aFilters.length>0){this.refresh();return;}else{this.aKeys=r;this.iLength=r.length;this.bLengthFinal=true;n=true;}}else if(k){q.each(this.aKeys,function(i,K){if(K in k){n=true;return false;}});}else{n=true;}if(n&&this.aLastContexts){n=false;var s=this._getContexts(this.iLastStartIndex,this.iLastLength,this.iLastThreshold);if(this.aLastContexts.length!=s.length){n=true;}else{q.each(this.aLastContexts,function(i,u){o=t.oLastContextData[u.getPath()];p=s[i].getObject();if(!e(o,p,true)){n=true;return false;}});}}}if(j||n||this.bNeedsUpdate){this.bNeedsUpdate=false;this._fireChange({reason:l});}this.sChangeReason=undefined;this.bIgnoreSuspend=false;};h.prototype.resetData=function(){this.aKeys=[];this.iLength=0;this.bLengthFinal=false;this.sChangeReason=undefined;this.bDataAvailable=false;if(this.oModel.isCountSupported()&&(this.sCountMode==d.Request||this.sCountMode==d.Both)){this._getLength();}};h.prototype.abortPendingRequest=function(){if(this.oRequestHandle){this.oRequestHandle.abort();this.oRequestHandle=null;this.bPendingRequest=false;}};h.prototype.sort=function(s,r){var i=false;if(!s){s=[];}if(s instanceof S){s=[s];}this.aSorters=s;this.createSortParams(s);if(!this.bInitial){this.aKeys=[];this.abortPendingRequest();this.sChangeReason=C.Sort;this._fireRefresh({reason:this.sChangeReason});this._fireSort({sorter:s});i=true;}if(r){return i;}else{return this;}};h.prototype.createSortParams=function(s){this.sSortParams=c.createSortParams(s);};h.prototype.filter=function(i,s,r){var j=false;if(!i){i=[];}if(i instanceof F){i=[i];}this.oModel.checkFilterOperation(i);if(s==a.Application){this.aApplicationFilters=i;}else{this.aFilters=i;}if(!i||!Array.isArray(i)||i.length==0){this.aFilters=[];}if(!this.aApplicationFilters||!Array.isArray(this.aApplicationFilters)||this.aApplicationFilters.length===0){this.aApplicationFilters=[];}this.convertFilters();this.oCombinedFilter=b.combineFilters(this.aFilters,this.aApplicationFilters);this.createFilterParams(this.oCombinedFilter);if(!this.bInitial){this.resetData();this.abortPendingRequest();this.sChangeReason=C.Filter;this._fireRefresh({reason:this.sChangeReason});if(s==a.Application){this._fireFilter({filters:this.aApplicationFilters});}else{this._fireFilter({filters:this.aFilters});}j=true;}if(r){return j;}else{return this;}};h.prototype.convertFilters=function(){this.aFilters=this.aFilters.map(function(o){return o instanceof O?o.convert():o;});this.aApplicationFilters=this.aApplicationFilters.map(function(o){return o instanceof O?o.convert():o;});};h.prototype.createFilterParams=function(o){this.sFilterParams=c.createFilterParams(o,this.oModel.oMetadata,this.oEntityType);};h.prototype._initSortersFilters=function(){var r=this.oModel.resolve(this.sPath,this.oContext);if(!r){return;}this.oEntityType=this._getEntityType();this.convertFilters();this.oCombinedFilter=b.combineFilters(this.aFilters,this.aApplicationFilters);this.createSortParams(this.aSorters);this.createFilterParams(this.oCombinedFilter);};h.prototype._getEntityType=function(){var r=this.oModel.resolve(this.sPath,this.oContext);if(r){var E=this.oModel.oMetadata._getEntityTypeByPath(r);g(E,"EntityType for path "+r+" could not be found!");return E;}return undefined;};h.prototype.resume=function(){this.bIgnoreSuspend=false;L.prototype.resume.apply(this,arguments);};return h;});
