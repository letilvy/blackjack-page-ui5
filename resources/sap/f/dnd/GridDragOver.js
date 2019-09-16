/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/base/Object',"sap/ui/thirdparty/jquery"],function(B,q){"use strict";var G=B.extend("sap.f.dnd.GridDragOver",{_iTimeoutBeforeDrop:200,_$indicator:q("<div class='sapUiDnDGridIndicator'></div>"),constructor:function(){this._oDragEndDelegate={ondragend:this.scheduleEndDrag.bind(this)};},destroy:function(){this._oDragEndDelegate=null;}});G.prototype.setCurrentContext=function(d,D,t){if(this._oDragControl===d&&this._oDropContainer===D&&this._sTargetAggregation===t){return this;}if(this._oDragControl&&this._oDragControl!==d){this.endDrag();}this._oDragControl=d;this._oDropContainer=D;this._sTargetAggregation=t;this._mDragItemDimensions=this._getDimensions(d);this._bIsInSameContainer=d.getParent()===D;if(this._bIsInSameContainer){this._iDragFromIndex=D.indexOfAggregation(t,d);}else{this._iDragFromIndex=null;}D.getAggregation(t).forEach(function(c){c.addStyleClass("sapUiDnDGridControl");});this._attachDragEndDelegate();return this;};G.prototype.handleDragOver=function(d){if(this._shouldFreeze(d.pageX,d.pageY)){return;}var D=this._calculateDropPosition(d);if(!D){return;}if(this._timeoutOnSamePosition(D)){if(D.targetControl===this._oDragControl){return;}this._hideDraggedItem();this._showIndicator(D);this._freezeCurrentPosition(d.pageX,d.pageY);}};G.prototype.getSuggestedDropPosition=function(){return this._mLastDropPosition;};G.prototype.scheduleEndDrag=function(){if(!this._isDragActive()){return;}var b=this._oDropContainer.getBindingInfo(this._sTargetAggregation);if(b&&b.template){setTimeout(this.endDrag.bind(this),0);}else{this.endDrag();}};G.prototype.endDrag=function(){if(!this._isDragActive()){return;}this._$indicator.detach();this._showDraggedItem();this._removeDragEndDelegate();this._oDropContainer.fireEvent("_gridPolyfillAfterDragEnd",{indicator:this._$indicator});this._$indicator.attr("style","");this._oDragControl=null;this._oDropContainer=null;this._sTargetAggregation=null;this._iDragFromIndex=null;this._iDropPositionHoldStart=null;this._mLastDropPosition=null;this._mFreezePosition=null;};G.prototype._isDragActive=function(){return this._oDragControl&&this._oDropContainer;};G.prototype._showIndicator=function(d){var $=this._findContainingGridItem(d.targetControl),a=$||d.targetControl.$(),s;if(this._oDropContainer.isA("sap.f.GridContainer")){a=a.closest(".sapFGridContainerItemWrapper");}if($){s={"grid-column-start":this._mDragItemDimensions.columnsSpan,"grid-row-start":this._mDragItemDimensions.rowsSpan};}else{s={width:this._mDragItemDimensions.rect.width,height:this._mDragItemDimensions.rect.height};}this._$indicator.css(s);if(d.position=="Before"){this._$indicator.insertBefore(a);}else{this._$indicator.insertAfter(a);}this._$indicator.show();this._iDragFromIndex=this._$indicator.index();this._oDropContainer.fireEvent("_gridPolyfillAfterDragOver",{indicator:this._$indicator,width:this._mDragItemDimensions.rect.width,height:this._mDragItemDimensions.rect.height});};G.prototype._hideDraggedItem=function(){this._oDragControl.$().hide();var $=this._findContainingGridItem(this._oDragControl);if($){$.hide();}};G.prototype._showDraggedItem=function(){if(this._oDragControl.getDomRef()){this._oDragControl.$().show();}var $=this._findContainingGridItem(this._oDragControl);if($){$.show();}};G.prototype._timeoutOnSamePosition=function(d){if(!this._mLastDropPosition||d.targetControl!==this._mLastDropPosition.targetControl||d.position!=this._mLastDropPosition.position){this._iDropPositionHoldStart=Date.now();this._mLastDropPosition=d;return false;}return Date.now()-this._iDropPositionHoldStart>this._iTimeoutBeforeDrop;};G.prototype._shouldFreeze=function(p,P){var t=20;return this._mFreezePosition&&Math.abs(this._mFreezePosition.pageX-p)<t&&Math.abs(this._mFreezePosition.pageY-P)<t;};G.prototype._freezeCurrentPosition=function(p,P){this._mFreezePosition={pageX:p,pageY:P};};G.prototype._calculateDropPosition=function(d){var $=this._findItemFromPoint(d.pageX,d.pageY),c,t,b;if(!$){c=this._findClosestItem(d.pageX,d.pageY);}if(c){$=c.target;}if(c&&c.direction==="Left"){b="After";}if(!$){$=this._getLastItem();b="After";}if($.hasClass("sapUiDnDGridIndicator")){return null;}t=$.control(0,true);if(!b){b=this._calculateDropBeforeOrAfter(t,d);}return{targetControl:t,position:b};};G.prototype._calculateDropBeforeOrAfter=function(t,d){var D=this._getDimensions(t),c=D.rect;if(this._oDragControl===t){return"Before";}if((this._mDragItemDimensions.rect.width*1.5)<c.width){var p=window.pageXOffset,m={left:c.left+p,width:c.width},C=d.pageX-m.left;return C<m.width*0.5?"Before":"After";}if(this._iDragFromIndex===null){return"Before";}var T=this._oDropContainer.indexOfAggregation(this._sTargetAggregation,t);if(this._iDragFromIndex>T){return"Before";}return"After";};G.prototype._getDimensions=function(c){var $=this._findContainingGridItem(c);if($){return{rect:$[0].getBoundingClientRect(),columnsSpan:$.css("grid-column-start"),rowsSpan:$.css("grid-row-start")};}return{rect:c.getDomRef().getBoundingClientRect(),columnsSpan:"span 2",rowsSpan:"span 2"};};G.prototype._findContainingGridItem=function(c){var $=c.$(),d=$.parent().css("display");if(d==="grid"||d==="inline-grid"){return $;}d=$.parent().parent().css("display");if(d==="grid"||d==="inline-grid"){return $.parent();}return null;};G.prototype._getLastItem=function(){var I=this._oDropContainer.getAggregation(this._sTargetAggregation),$;if(I.length){$=I[I.length-1].$();}return $;};G.prototype._findItemFromPoint=function(p,P){var o=document.elementFromPoint(p,P),$=q(o).closest(".sapUiDnDGridControl, .sapUiDnDGridIndicator");if($.hasClass("sapUiDnDGridIndicator")){return $;}if($.hasClass("sapUiDnDGridControl")){return $;}return null;};G.prototype._findClosestItem=function(p,P){var I=sap.ui.getCore().getConfiguration().getRTL(),a=I?-1:1,s=80*a,S=20,$,d,t=0,x=p-s;while(!$&&x>0&&t<4){$=this._findItemFromPoint(x,P);x-=s;t++;}if($){d="Left";}if(!$&&P-S>0){$=this._findItemFromPoint(p,P-20);d="Top";}return{target:$,direction:d};};G.prototype._removeDragEndDelegate=function(){if(this._oDropContainer){this._oDropContainer.removeEventDelegate(this._oDragEndDelegate);}};G.prototype._attachDragEndDelegate=function(){this._removeDragEndDelegate();this._oDropContainer.addEventDelegate(this._oDragEndDelegate);};var i;G.getInstance=function(){if(!i){i=new G();}return i;};return G;});
