/*!
* OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
sap.ui.define(["./library","sap/ui/core/Control","./ResponsiveSplitterUtilities","./ResponsiveSplitterPage","./PaneContainer","./SplitPane","sap/ui/core/delegate/ItemNavigation","sap/ui/core/ResizeHandler","./ResponsiveSplitterRenderer","sap/ui/thirdparty/jquery"],function(l,C,R,c,P,S,I,d,e,q){"use strict";var f=C.extend("sap.ui.layout.ResponsiveSplitter",{metadata:{library:"sap.ui.layout",properties:{width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:'100%'},height:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:'100%'}},defaultAggregation:"rootPaneContainer",aggregations:{rootPaneContainer:{type:"sap.ui.layout.PaneContainer",multiple:false},_pages:{type:"sap.ui.layout.ResponsiveSplitterPage",multiple:true,visibility:"hidden"}},associations:{defaultPane:{type:"sap.ui.layout.SplitPane",multiple:false}},events:{}}});var g={MAX_VISIBLE_BUTTONS:7};f.prototype.init=function(){this._aPaneContainers=[];this._aPanes=[];this._oResourceBundle=sap.ui.getCore().getLibraryResourceBundle("sap.ui.layout");this.addEventDelegate({onAfterRendering:function(){this._initItemNavigation();}},this);};f.prototype.onBeforeRendering=function(){var r=this.getRootPaneContainer();if(r){r._oSplitter.addEventDelegate({onAfterRendering:function(){this._setSplitterBarsTooltips(r._oSplitter);this._updatePaginatorButtonsTooltips();}},this);this._createWidthIntervals();this._createPages();this._detachResizeHandler();}};f.prototype.onAfterRendering=function(){this._parentResizeHandler=d.register(this,this._onParentResize.bind(this));var r=this.getRootPaneContainer();if(r){this._onParentResize();}};f.prototype.exit=function(){this._detachResizeHandler();};f.prototype._setSplitterBarsTooltips=function(o,p){var s=o.$().find(" > .sapUiLoSplitterBar"),a=o.$().find(" > .sapUiLoSplitterContent"),t="",b,n,A,h;for(var i=0;i<a.length;i++){h=a[i].childNodes[0].id;A=sap.ui.getCore().byId(h);b=i+1;n=i+2;if(p){t+=this._oResourceBundle.getText("RESPONSIVE_SPLITTER_RESIZE",[p+"."+b,p+"."+n]);}else{t+=this._oResourceBundle.getText("RESPONSIVE_SPLITTER_RESIZE",[b,n]);}if(s[i]){s[i].setAttribute("title",t);t="";}if(A instanceof sap.ui.layout.Splitter){this._setSplitterBarsTooltips(A,b);}}};f.prototype._updatePaginatorButtonsTooltips=function(){var v=Array.prototype.slice.call(this._getVisibleButtons()),h=this.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length,H=this._oResourceBundle.getText("RESPONSIVE_SPLITTER_HOME")+" ",a=this._oResourceBundle.getText("RESPONSIVE_SPLITTER_AND"),t="",b=this,o;if(v.length>0){o=v.shift();for(var i=1;i<=h;i++){H+=i;if(i<(h-1)){H+=", ";}else if(i===h-1){H+=" "+a+" ";}}o.setAttribute("title",H);[].forEach.call(v,function(B){t=b._oResourceBundle.getText("RESPONSIVE_SPLITTER_GOTO")+" "+(h+1);h+=1;B.setAttribute("title",t);});}};f.prototype.onsapright=function(E){this._handleArrowNavigation(6,"Forward",E);};f.prototype.onsapleft=function(E){this._handleArrowNavigation(0,"Back",E);};f.prototype._initItemNavigation=function(){if(this._oItemNavigation){this._bPrevItemNavigation=true;this._clearItemNavigation();}this._oItemNavigation=new I();this._oItemNavigation.setCycling(false);this.addDelegate(this._oItemNavigation);this._setItemNavigation();if(this._bPrevItemNavigation){this._oItemNavigation.focusItem(0);}};f.prototype._setItemNavigation=function(){var b=this._getVisibleButtons(),D=[];this._oItemNavigation.setRootDomRef(this.$().find(".sapUiResponsiveSplitterPaginator")[0]);for(var i=0;i<b.length;i++){if(b[i]){D.push(b[i]);}}this._oItemNavigation.setItemDomRefs(D);};f.prototype._clearItemNavigation=function(){this.removeDelegate(this._oItemNavigation);this._oItemNavigation.destroy();delete this._oItemNavigation;};f.prototype._handleArrowNavigation=function(b,D,E){if(E.target===this._getVisibleButtons()[b]){this["_handlePaginator"+D](E);this._setItemNavigation();}else{return;}};f.prototype._onParentResize=function(){var i=this._intervalHasChanged(),r=this.getRootPaneContainer();if(i&&r){this._arrangeContent();this._setPaginatorVisibility();}};f.prototype._detachResizeHandler=function(){if(this._parentResizeHandler){d.deregister(this._parentResizeHandler);this._parentResizeHandler=null;}};f.prototype._createWidthIntervals=function(){var B=[];this._aIntervals=[];R.visitPanes(this.getRootPaneContainer(),function(p){var r=p.getRequiredParentWidth();if(B.indexOf(r)==-1){B.push(r);}});B.push(Number.NEGATIVE_INFINITY);B.push(Number.POSITIVE_INFINITY);B.sort(function(a,b){return a-b;});for(var i=0;i<B.length-1;i++){var o=new R.splitterInterval(B[i],B[i+1],this.getRootPaneContainer());this._aIntervals.push(o);}};f.prototype._createPages=function(){var m=this._getMaxPageCount();this.destroyAggregation("_pages",true);for(var i=0;i<m;i++){var p=new c();this.addAggregation("_pages",p,true);}};f.prototype._intervalHasChanged=function(){var w=this.getDomRef().clientWidth,o=null,a=this._aIntervals;for(var i=0;i<a.length;i++){if(a[i].iFrom<w&&w<=a[i].iTo){o=a[i];break;}}if(this._currentInterval!==o){this._currentInterval=o;return true;}return false;};f.prototype._setPaginatorVisibility=function(){var b=this.$().find(".sapUiResponsiveSplitterPaginatorButton"),n=this.$().find(".sapUiResponsiveSplitterPaginatorNavButton"),p=this.$().find(".sapUiResponsiveSplitterPaginator"),i=(this._getHiddenPanes().length+1),s=i<g.MAX_VISIBLE_BUTTONS;b.addClass("sapUiResponsiveSplitterHiddenElement");if(i>1){this.getDomRef().classList.add("sapUiRSVisiblePaginator");b=b.slice(0,s?i:g.MAX_VISIBLE_BUTTONS);b.removeClass("sapUiResponsiveSplitterHiddenElement");b.removeClass("sapUiResponsiveSplitterHiddenPaginatorButton");n.toggleClass("sapUiResponsiveSplitterHiddenPaginatorButton",s);p.toggleClass("sapUiResponsiveSplitterWithNavButtons",!s);}else{this.getDomRef().classList.remove("sapUiRSVisiblePaginator");}};f.prototype._getMaxPageCount=function(){var t=0;this._aIntervals.forEach(function(i){if(i.iPagesCount>t){t=i.iPagesCount;}});return t;};f.prototype._arrangeContent=function(){var p=this.getAggregation("_pages")||[];this._clearContent();p.forEach(function(o){o.setVisible(false);});this._fillPageContent(this.getRootPaneContainer());this._activatePage(0);};f.prototype._activatePage=function(p){var $=this.$().find(".sapUiResponsiveSplitterPaginatorButton"),o=this.$().find(".sapUiResponsiveSplitterPaginatorSelectedButton"),O=$.index(o),a=this.getAggregation("_pages")||[];a[O]&&a[O].setVisible(false);a[p]&&a[p].setVisible(true);o.removeClass("sapUiResponsiveSplitterPaginatorSelectedButton");$.eq(p).addClass("sapUiResponsiveSplitterPaginatorSelectedButton");o.attr("aria-checked",false);$.eq(p).attr("aria-checked",true);};f.prototype._fillPageContent=function(s){var b=s instanceof P,a=s instanceof S,o=s.getParent(),h=o instanceof P,p=this.getAggregation("_pages"),H,j,k,D,m,M;if(b&&p){this._aPaneContainers.push(s);j=this._getAllPanesInInterval(s,this._currentInterval.iFrom).length>0;k=s._oSplitter;if(h&&j){o._oSplitter.addAssociatedContentArea(k);}else if(!h){p[0].setContent(k);}s.getPanes().forEach(function(n){this._fillPageContent(n);},this);}else if(a&&p){this._assignDefault(s);this._aPanes.push(s);D=s.getDemandPane();H=this._getHiddenPanes();m=H.length;M=this._getMaxPageCount();var i;if(s._isInInterval(this._currentInterval.iFrom)){o._oSplitter.addAssociatedContentArea(s.getContent());}else if(D&&(m<M)){for(i=0;i<m;i++){p[i+1].setContent(H[i].getContent());}}else if(D&&m===M){for(i=0;i<m;i++){p[i].setContent(H[i].getContent());}}else if(this._isDefault(s)){p[0].setContent(s.getContent());}}};f.prototype._isDefault=function(p){return this.getDefaultPane()===p.getId();};f.prototype._assignDefault=function(p){var D=this.getDefaultPane();this.setDefaultPane(D||p);};f.prototype._getAllPanesInInterval=function(p,F){var a=[];function v(p){p.getPanes().forEach(function(o){if(o instanceof P){v(o);}else if(o._isInInterval(F)){a.push(o);}});return a;}return v(p,F);};f.prototype._getHiddenPanes=function(){return this._aPanes.filter(function(p){return p.getDemandPane()&&!p._isInInterval(this._currentInterval.iFrom);},this);};f.prototype._clearContent=function(){this._aPaneContainers.forEach(function(p){p._oSplitter.removeAllAssociatedContentArea();});this._aPaneContainers=[];this._aPanes=[];};f.prototype._getVisibleButtons=function(){return this.$().find(".sapUiResponsiveSplitterPaginatorButton:not(.sapUiResponsiveSplitterHiddenElement, .sapUiResponsiveSplitterHiddenPaginatorButton)");};f.prototype._handlePaginatorButtonTap=function(E){var t=E.target,T=E.target.classList,p;if(T&&T.contains("sapUiResponsiveSplitterPaginatorButton")){p=t.getAttribute("page-index");this._activatePage(p);}else if(T&&T.contains("sapUiResponsiveSplitterPaginatorNavButton")){if(T.contains("sapUiResponsiveSplitterPaginatorButtonForward")){this._handlePaginatorForward(E);}else{this._handlePaginatorBack(E);}}};f.prototype._handlePaginatorForward=function(E){var v=this._getVisibleButtons(),h=this._getHiddenPanes().length,H=this.$().find(".sapUiResponsiveSplitterPaginatorButton.sapUiResponsiveSplitterHiddenElement"),$=H.filter(function(){return this.getAttribute("page-index")>=g.MAX_VISIBLE_BUTTONS&&this.getAttribute("page-index")<=h;});if($.length>0){v.first().addClass("sapUiResponsiveSplitterHiddenElement");$.last().removeClass("sapUiResponsiveSplitterHiddenElement");}};f.prototype._handlePaginatorBack=function(E){var v=this._getVisibleButtons(),m=this._getMaxPageCount()-g.MAX_VISIBLE_BUTTONS,h=this.$().find(".sapUiResponsiveSplitterPaginatorButton.sapUiResponsiveSplitterHiddenElement"),H=h.filter(function(){return this.getAttribute("page-index")<m;});if(H.length>0){v.last().addClass("sapUiResponsiveSplitterHiddenElement");H.last().removeClass("sapUiResponsiveSplitterHiddenElement");}};f.prototype.ontap=f.prototype._handlePaginatorButtonTap;f.prototype.onsapenter=f.prototype._handlePaginatorButtonTap;f.prototype.onsapspace=f.prototype._handlePaginatorButtonTap;return f;});
