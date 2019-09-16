/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./Bar','./Button','./InstanceManager','./library','./Title','sap/ui/core/Control','sap/ui/core/Popup','sap/ui/core/delegate/ScrollEnablement','sap/ui/core/theming/Parameters','sap/ui/Device','sap/ui/base/ManagedObject','sap/ui/core/library','sap/ui/core/Element','sap/ui/core/ResizeHandler','./PopoverRenderer',"sap/ui/dom/containsOrEquals","sap/ui/thirdparty/jquery","sap/ui/dom/getScrollbarSize","sap/ui/events/KeyCodes","sap/base/Log","sap/ui/dom/jquery/Focusable","sap/ui/dom/jquery/rect","sap/ui/dom/jquery/control"],function(B,a,I,l,T,C,P,S,b,D,M,c,E,R,d,f,q,g,K,L){"use strict";var h=l.PopupHelper;var O=c.OpenState;var i=l.PlacementType;var s=20;var j=C.extend("sap.m.Popover",{metadata:{interfaces:["sap.ui.core.PopupInterface"],library:"sap.m",properties:{placement:{type:"sap.m.PlacementType",group:"Behavior",defaultValue:i.Right},showHeader:{type:"boolean",group:"Appearance",defaultValue:true},title:{type:"string",group:"Appearance",defaultValue:null},modal:{type:"boolean",group:"Behavior",defaultValue:false},offsetX:{type:"int",group:"Appearance",defaultValue:0},offsetY:{type:"int",group:"Appearance",defaultValue:0},showArrow:{type:"boolean",group:"Appearance",defaultValue:true},contentWidth:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},contentMinWidth:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:""},contentHeight:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},enableScrolling:{type:"boolean",group:"Misc",defaultValue:true,deprecated:true},verticalScrolling:{type:"boolean",group:"Misc",defaultValue:true},horizontalScrolling:{type:"boolean",group:"Misc",defaultValue:true},bounce:{type:"boolean",group:"Behavior",defaultValue:null},resizable:{type:"boolean",group:"Dimension",defaultValue:false},ariaModal:{type:"boolean",group:"Misc",defaultValue:true,visibility:"hidden"}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"},customHeader:{type:"sap.ui.core.Control",multiple:false},subHeader:{type:"sap.ui.core.Control",multiple:false},footer:{type:"sap.ui.core.Control",multiple:false},_internalHeader:{type:"sap.m.Bar",multiple:false,visibility:"hidden"},beginButton:{type:"sap.ui.core.Control",multiple:false},endButton:{type:"sap.ui.core.Control",multiple:false}},associations:{leftButton:{type:"sap.m.Button",multiple:false,deprecated:true},rightButton:{type:"sap.m.Button",multiple:false,deprecated:true},initialFocus:{type:"sap.ui.core.Control",multiple:false},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"},ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"}},events:{afterOpen:{parameters:{openBy:{type:"sap.ui.core.Control"}}},afterClose:{parameters:{openBy:{type:"sap.ui.core.Control"}}},beforeOpen:{parameters:{openBy:{type:"sap.ui.core.Control"}}},beforeClose:{parameters:{openBy:{type:"sap.ui.core.Control"}}}},designtime:"sap/m/designtime/Popover.designtime"}});j._bIOS7=D.os.ios&&D.os.version>=7&&D.os.version<8&&D.browser.name==="sf";j.prototype.init=function(){this._arrowOffsetThreshold=4;this._marginTopInit=false;this._marginTop=48;this._marginLeft=10;this._marginRight=10;this._marginBottom=10;this._minDimensions={width:100,height:32};this._$window=q(window);this._initialWindowDimensions={};this.oPopup=new P();this.oPopup.setShadow(true);this.oPopup.setAutoClose(true);this.oPopup.setAnimations(q.proxy(this._openAnimation,this),q.proxy(this._closeAnimation,this));this._placements=[i.Top,i.Right,i.Bottom,i.Left,i.Vertical,i.Horizontal,i.Auto,i.VerticalPreferedTop,i.VerticalPreferedBottom,i.HorizontalPreferedLeft,i.HorizontalPreferedRight,i.VerticalPreferredTop,i.VerticalPreferredBottom,i.HorizontalPreferredLeft,i.HorizontalPreferredRight,i.PreferredRightOrFlip,i.PreferredLeftOrFlip,i.PreferredTopOrFlip,i.PreferredBottomOrFlip];this._myPositions=["center bottom","begin center","center top","end center"];this._atPositions=["center top","end center","center bottom","begin center"];this._offsets=["0 -18","18 0","0 18","-18 0"];this._arrowOffset=18;this._followOfTolerance=32;this._scrollContentList=["sap.m.NavContainer","sap.m.Page","sap.m.ScrollContainer","sap.m.SimpleFixFlex"];this._fnAdjustPositionAndArrow=q.proxy(this._adjustPositionAndArrow,this);this._fnOrientationChange=q.proxy(this._onOrientationChange,this);this._fnFollowOf=q.proxy(function(m){var o=m.lastOfRect,r=m.currentOfRect;if(!D.system.desktop||(Math.abs(o.top-r.top)<=this._followOfTolerance&&Math.abs(o.left-r.left)<=this._followOfTolerance)||(Math.abs(o.top+o.height-r.top-r.height)<=this._followOfTolerance&&Math.abs(o.left+o.width-r.left-r.width)<=this._followOfTolerance)){this.oPopup._applyPosition(this.oPopup._oLastPosition,true);}else{this.close();}},this);this.setFollowOf(true);this._oRestoreFocusDelegate={onBeforeRendering:function(){var A=q(document.activeElement),o=A.control(0);this._sFocusControlId=o&&o.getId();},onAfterRendering:function(){if(this._sFocusControlId&&!f(this.getDomRef(),document.activeElement)){sap.ui.getCore().byId(this._sFocusControlId).focus();}}};var t=this;this.oPopup._applyPosition=function(p,F){var e=this.getOpenState(),o;if(e===O.CLOSING||e===O.CLOSED){return;}if(F){t._storeScrollPosition();}t._clearCSSStyles();var k=t._placements.indexOf(t.getPlacement());if(k>3&&!t._bPosCalced){t._calcPlacement();return;}t._bPosCalced=false;if(t._oOpenBy instanceof E){p.of=t._getOpenByDomRef();}if(!p.of){L.warning("sap.m.Popover: in function applyPosition, the openBy element doesn't have any DOM output. "+t);return;}if(!f(document.documentElement,p.of)&&p.of.id){o=q(document.getElementById(p.of.id));if(o){p.of=o;}else{L.warning("sap.m.Popover: in function applyPosition, the openBy element's DOM is already detached from DOM tree and can't be found again by the same id. "+t);return;}}var r=q(p.of).rect();if(F&&t._$window.height()==t._initialWindowDimensions.height&&(r.top+r.height<=0||r.top>=t._$window.height()||r.left+r.width<=0||r.left>=t._$window.width())){t.close();return;}var m=t.getDomRef("scroll");if(!D.system.desktop){q(window).scrollLeft(0);}t._deregisterContentResizeHandler();P.prototype._applyPosition.call(this,p);t._fnAdjustPositionAndArrow();t._restoreScrollPosition();t._registerContentResizeHandler(m);};this.oPopup.close=function(e){var k=typeof e==="boolean";var m=t.oPopup.getOpenState();if(e!==true&&(this.touchEnabled||!this._isFocusInsidePopup())&&this.isOpen()&&!(m===O.CLOSED||m===O.CLOSING)){t.fireBeforeClose({openBy:t._oOpenBy});}t._deregisterContentResizeHandler();P.prototype.close.apply(this,k?[]:arguments);t.removeDelegate(t._oRestoreFocusDelegate);};};j.prototype.onBeforeRendering=function(){var n,p;if(!this._initialWindowDimensions.width||!this._initialWindowDimensions.height){this._initialWindowDimensions={width:this._$window.width(),height:this._$window.height()};}if(!this.getHorizontalScrolling()&&!this.getVerticalScrolling()){this._forceDisableScrolling=true;}else if(!this._bVScrollingEnabled&&!this._bHScrollingEnabled&&this._hasSingleScrollableContent()){this._forceDisableScrolling=true;L.info("VerticalScrolling and horizontalScrolling in sap.m.Popover with ID "+this.getId()+" has been disabled because there's scrollable content inside");}else{this._forceDisableScrolling=false;}if(!this._forceDisableScrolling){if(!this._oScroller){this._oScroller=new S(this,this.getId()+"-scroll",{horizontal:this.getHorizontalScrolling(),vertical:this.getVerticalScrolling()});}}if(this._bContentChanged){this._bContentChanged=false;n=this._getSingleNavContent();p=this._getSinglePageContent();if(n&&!this.getModal()&&!D.support.touch&&!q.sap.simulateMobileOnDesktop){n.attachEvent("afterNavigate",function(e){var o=this.getDomRef();if(o){var F=this.$().firstFocusableDomRef()||o;F.focus();}},this);}if(n||p){p=p||n.getCurrentPage();if(p&&p._getAnyHeader){this.addStyleClass("sapMPopoverWithHeaderCont");}if(n){n.attachEvent("navigate",function(e){var o=e.getParameter("to");if(o instanceof C&&o.isA("sap.m.Page")){this.$().toggleClass("sapMPopoverWithHeaderCont",!!o._getAnyHeader());}},this);}}}};j.prototype.onAfterRendering=function(){var $,e,k;if(!this._marginTopInit&&this.getShowArrow()){this._marginTop=2;if(this._oOpenBy){$=q(this._getOpenByDomRef());if(!($.closest("header.sapMIBar").length>0)){e=$.closest(".sapMPage");if(e.length>0){k=e.children("header.sapMIBar");if(k.length>0){this._marginTop+=k.outerHeight();}}}this._marginTopInit=true;}}};j.prototype.exit=function(){this._deregisterContentResizeHandler();D.resize.detachHandler(this._fnOrientationChange);I.removePopoverInstance(this);this.removeDelegate(this._oRestoreFocusDelegate);this._oRestoreFocusDelegate=null;if(this.oPopup){this.oPopup.detachClosed(this._handleClosed,this);this.oPopup.destroy();this.oPopup=null;}if(this._oScroller){this._oScroller.destroy();this._oScroller=null;}if(this._internalHeader){this._internalHeader.destroy();this._internalHeader=null;}if(this._headerTitle){this._headerTitle.destroy();this._headerTitle=null;}};j.prototype.openBy=function(o,e){var p=this.oPopup,k=this.oPopup.getOpenState(),F=this._getInitialFocusId(),m,n,r,t;m=(o.getDomRef&&o.getDomRef())||o;t=q(m).closest(".sapUiSizeCompact");r=b.get("_sap_m_Popover_ForceCompactArrowOffset")==="true";this._bSizeCompact=l._bSizeCompact||!!t.length||this.hasStyleClass("sapUiSizeCompact");this._bUseCompactArrow=this._bSizeCompact||r;this._adaptPositionParams();if(k===O.OPEN||k===O.OPENING){if(this._oOpenBy===o){return this;}else{var u=function(){p.detachClosed(u,this);this.openBy(o);};p.attachClosed(u,this);this.close();return this;}}if(!o){return this;}if(D.support.touch){D.resize.attachHandler(this._fnOrientationChange);}if(!this._oOpenBy||o!==this._oOpenBy){this._oOpenBy=o;}this.fireBeforeOpen({openBy:this._oOpenBy});p.attachOpened(this._handleOpened,this);p.attachClosed(this._handleClosed,this);p.setInitialFocusId(F);n=this._placements.indexOf(this.getPlacement());if(n>-1){m=this._getOpenByDomRef();if(!m){L.error("sap.m.Popover id = "+this.getId()+": is opened by a control which isn't rendered yet.");return this;}p.setAutoCloseAreas([o]);p.setContent(this);if(n<=3){p.setPosition(this._myPositions[n],this._atPositions[n],m,this._calcOffset(this._offsets[n]),"fit");}else{p._oPosition.of=m;}var v=this;var w=function(){if(p.bIsDestroyed){return;}if(p.getOpenState()===O.CLOSING){if(v._sOpenTimeout){clearTimeout(v._sOpenTimeout);v._sOpenTimeout=null;}v._sOpenTimeout=setTimeout(w,150);}else{v._oPreviousFocus=P.getCurrentFocusInfo();p.open();v.addDelegate(v._oRestoreFocusDelegate,v);if(!e){I.addPopoverInstance(v);}}};w();}else{L.error(this.getPlacement()+"is not a valid value! It can only be top, right, bottom or left");}return this;};j.prototype.close=function(){var e=this.oPopup.getOpenState(),k,A;if(e===O.CLOSED||e===O.CLOSING){return this;}this.fireBeforeClose({openBy:this._oOpenBy});this.oPopup.close(true);if(this._oPreviousFocus){A=document.activeElement||{};k=(this._oPreviousFocus.sFocusId===sap.ui.getCore().getCurrentFocusedControlId())||(this._oPreviousFocus.sFocusId===A.id);if(!k){P.applyFocusInfo(this._oPreviousFocus);this._oPreviousFocus=null;}}return this;};j.prototype.isOpen=function(){return this.oPopup&&this.oPopup.isOpen();};j.prototype.setFollowOf=function(v){if(v){this.oPopup.setFollowOf(this._fnFollowOf);}else{this.oPopup.setFollowOf(false);}return this;};j.prototype._clearCSSStyles=function(){var o=this.getDomRef().style,$=this.$("cont"),e=$.children(".sapMPopoverScroll"),k=$[0].style,m=e[0].style,n=this.getContentWidth(),p=this.getContentHeight(),r=this.$("arrow"),w,W;if(n.indexOf("%")>0){w=this._$window.width();n=h.calcPercentageSize(n,w);}if(p.indexOf("%")>0){W=this._$window.height();p=h.calcPercentageSize(p,W);}k.width=n||"";k.height=p||"";k.maxWidth="";k.maxHeight="";o.left="";o.right="";o.top="";o.bottom="";o.width="";o.height="";o.overflow="";m.width="";m.display="";r.removeClass("sapMPopoverArrRight sapMPopoverArrLeft sapMPopoverArrDown sapMPopoverArrUp sapMPopoverCrossArr sapMPopoverFooterAlignArr sapMPopoverHeaderAlignArr sapContrast sapContrastPlus");r.css({left:"",top:""});};j.prototype._onOrientationChange=function(){var e=this.oPopup.getOpenState();if(!(e===O.OPEN||e===O.OPENING)){return;}this.oPopup._applyPosition(this.oPopup._oLastPosition,true);this._includeScrollWidth();};j.prototype._includeScrollWidth=function(){var e=this.getContentWidth(),$=this.$(),m=Math.floor(window.innerWidth*0.9),k=this.$('cont');if(!k[0]){return;}if(D.system.desktop&&!D.browser.chrome){var H=k[0].clientHeight<k[0].scrollHeight,n=k.width()+"x"+k.height();if(n!==this._iLastWidthAndHeightWithScroll){if(H&&(!e||e=='auto')&&k.width()<m){$.addClass("sapMPopoverVerticalScrollIncluded");k.css({"padding-right":s});this._iLastWidthAndHeightWithScroll=n;}else{$.removeClass("sapMPopoverVerticalScrollIncluded");k.css({"padding-right":""});this._iLastWidthAndHeightWithScroll=null;}}}};j.prototype._handleOpened=function(){var t=this;this.oPopup.detachOpened(this._handleOpened,this);if(!D.support.touch){setTimeout(function(){!t.bIsDestroyed&&D.resize.attachHandler(t._fnOrientationChange);},0);}var F=this._getInitialFocusId(),o=sap.ui.getCore().byId(F),e=(F?window.document.getElementById(F):null);if(o&&o.getFocusDomRef()){o.getFocusDomRef().focus();}else if(!o&&e){e.focus();}this.fireAfterOpen({openBy:this._oOpenBy});};j.prototype._handleClosed=function(){this.oPopup.detachClosed(this._handleClosed,this);D.resize.detachHandler(this._fnOrientationChange);I.removePopoverInstance(this);if(!this.oPopup._bModal&&!D.system.desktop&&document.activeElement&&!q(document.activeElement).is(":visible")){document.activeElement.blur();}this.fireAfterClose({openBy:this._oOpenBy});};j.prototype.onfocusin=function(e){var o=e.target,$=this.$();if(o.id===this.getId()+"-firstfe"){var k=$.lastFocusableDomRef();if(k){k.focus();}}else if(o.id===this.getId()+"-lastfe"){var F=$.firstFocusableDomRef();if(F){F.focus();}}};j.prototype.onkeydown=function(e){var k=K,m=e.which||e.keyCode,A=e.altKey;if(m===k.ESCAPE||(A&&m===k.F4)){if(e.originalEvent&&e.originalEvent._sapui_handledByControl){return;}this.close();e.stopPropagation();e.preventDefault();}};j.prototype.onmousedown=function(o){var r=sap.ui.getCore().getConfiguration().getRTL();if(!o.target.classList.contains("sapMPopoverResizeHandle")){return;}var $=q(document);var k=this.$();var t=this;k.addClass('sapMPopoverResizing');o.preventDefault();o.stopPropagation();var m={x:o.pageX,y:o.pageY,width:k.width(),height:k.height()};$.on("mousemove.sapMPopover",function(e){var w,n;if(r){w=m.width+m.x-e.pageX;n=m.height+(m.y-e.pageY);}else{w=m.width+e.pageX-m.x;n=m.height+(m.y-e.pageY);}t.setContentWidth(Math.max(w,t._minDimensions.width)+'px');t.setContentHeight(Math.max(n,t._minDimensions.height)+'px');});$.on("mouseup.sapMPopover",function(){k.removeClass("sapMPopoverResizing");$.off("mouseup.sapMPopover, mousemove.sapMPopover");});};j.prototype._hasSingleNavContent=function(){return!!this._getSingleNavContent();};j.prototype._getSingleNavContent=function(){var e=this._getAllContent();while(e.length===1&&e[0]instanceof C&&e[0].isA("sap.ui.core.mvc.View")){e=e[0].getContent();}if(e.length===1&&e[0]instanceof C&&e[0].isA("sap.m.NavContainer")){return e[0];}else{return null;}};j.prototype._getSinglePageContent=function(){var e=this._getAllContent();while(e.length===1&&e[0]instanceof C&&e[0].isA("sap.ui.core.mvc.View")){e=e[0].getContent();}if(e.length===1&&e[0]instanceof C&&e[0].isA("sap.m.Page")){return e[0];}else{return null;}};j.prototype._hasSinglePageContent=function(){var e=this._getAllContent();while(e.length===1&&e[0]instanceof C&&e[0].isA("sap.ui.core.mvc.View")){e=e[0].getContent();}if(e.length===1&&e[0]instanceof C&&e[0].isA("sap.m.Page")){return true;}else{return false;}};j.prototype._hasSingleScrollableContent=function(){var e=this._getAllContent();while(e.length===1&&e[0]instanceof C&&e[0].isA("sap.ui.core.mvc.View")){e=e[0].getContent();}if(e.length===1&&e[0]instanceof C&&e[0].isA(this._scrollContentList)){return true;}return false;};j.prototype._getOffsetX=function(){var F=this.getPlacement(),e=0;if(this._bHorizontalFlip){var p=this._getOpenByDomRef();var H=p!==undefined;var k=H?p.getBoundingClientRect().width:0;e=F===i.PreferredRightOrFlip?Math.abs(k):-Math.abs(k);}var r=sap.ui.getCore().getConfiguration().getRTL();var o=e*(r?-1:1)+this.getOffsetX()*(r?-1:1);return o;};j.prototype._getOffsetY=function(){var F=this.getPlacement(),e=0;if(this._bVerticalFlip){var p=this._getOpenByDomRef();var H=p!==undefined;var k=H?p.getBoundingClientRect().height:0;e=F==="PreferredTopOrFlip"?-Math.abs(k):Math.abs(k);}return e+this.getOffsetY();};j.prototype._calcOffset=function(o){var e=this._getOffsetX(),k=this._getOffsetY();var p=o.split(" ");var o=(parseInt(p[0])+e)+" "+(parseInt(p[1])+k);return o;};j.prototype._calcPlacement=function(){var p=this.getPlacement();var o=this._getOpenByDomRef();switch(p){case i.Auto:this._calcAuto();break;case i.Vertical:case i.VerticalPreferedTop:case i.VerticalPreferredTop:case i.VerticalPreferedBottom:case i.VerticalPreferredBottom:case i.PreferredTopOrFlip:case i.PreferredBottomOrFlip:this._calcVertical();break;case i.Horizontal:case i.HorizontalPreferedLeft:case i.HorizontalPreferredLeft:case i.HorizontalPreferedRight:case i.HorizontalPreferredRight:case i.PreferredRightOrFlip:case i.PreferredLeftOrFlip:this._calcHorizontal();break;}this._bPosCalced=true;var e=this._placements.indexOf(this._oCalcedPos);this.oPopup.setPosition(this._myPositions[e],this._atPositions[e],o,this._calcOffset(this._offsets[e]),"fit");};j.prototype._getDocHeight=function(){var e=document.body,k=document.documentElement;return Math.max(e.scrollHeight,e.offsetHeight,k.clientHeight,k.offsetHeight);};j.prototype._calcVertical=function(){var $=q(this._getOpenByDomRef());var H=$[0]!==undefined;var p=this.getPlacement()===i.VerticalPreferedTop||this.getPlacement()===i.VerticalPreferredTop;var e=this.getPlacement()===i.VerticalPreferedBottom||this.getPlacement()===i.VerticalPreferredBottom;var k=this.getPlacement()===i.PreferredTopOrFlip;var m=this.getPlacement()===i.PreferredBottomOrFlip;var n=H?$[0].getBoundingClientRect().top:0;var o=H?$[0].getBoundingClientRect().height:0;var r=this._getOffsetY();var t=n-this._marginTop+r;var u=this.$().outerHeight();var v=this._getDocHeight()-($.offset().top+o+this._marginBottom+r);if(p&&t>u+this._arrowOffset){this._bVerticalFlip=false;this._oCalcedPos=i.Top;}else if(k){if(t>u+this._arrowOffset){this._bVerticalFlip=false;this._oCalcedPos=i.Top;}else{this._bVerticalFlip=true;this._oCalcedPos=i.Bottom;}}else if(e&&v>u+this._arrowOffset){this._oCalcedPos=i.Bottom;this._bVerticalFlip=false;}else if(m){if(v>u+this._arrowOffset){this._bVerticalFlip=false;this._oCalcedPos=i.Bottom;}else{this._bVerticalFlip=true;this._oCalcedPos=i.Top;}}else if(t>v){this._oCalcedPos=i.Top;}else{this._oCalcedPos=i.Bottom;}};j.prototype._calcHorizontal=function(){var $=q(this._getOpenByDomRef());var H=$[0]!==undefined;var p=this.getPlacement()===i.HorizontalPreferedLeft||this.getPlacement()===i.HorizontalPreferredLeft;var e=this.getPlacement()===i.HorizontalPreferedRight||this.getPlacement()===i.HorizontalPreferredRight;var k=H?$[0].getBoundingClientRect().left:0;var m=H?$[0].getBoundingClientRect().width:0;var o=this._getOffsetX();var n=k-this._marginLeft+o;var r=k+m;var t=this._$window.width()-r-this._marginRight-o;var u=this.$().outerWidth();var v=this.getPlacement()===i.PreferredLeftOrFlip;var w=this.getPlacement()===i.PreferredRightOrFlip;var x=sap.ui.getCore().getConfiguration().getRTL();if(p&&n>u+this._arrowOffset){this._bHorizontalFlip=false;this._oCalcedPos=x?i.Right:i.Left;}else if(v){if(n>u+this._arrowOffset){this._bHorizontalFlip=false;this._oCalcedPos=x?i.Right:i.Left;}else{this._bHorizontalFlip=true;this._oCalcedPos=x?i.Left:i.Right;}}else if(e&&t>u+this._arrowOffset){this._bHorizontalFlip=false;this._oCalcedPos=x?i.Left:i.Right;}else if(w){if(t>u+this._arrowOffset){this._bHorizontalFlip=false;this._oCalcedPos=x?i.Left:i.Right;}else{this._bHorizontalFlip=true;this._oCalcedPos=x?i.Right:i.Left;}}else if(n>t){this._oCalcedPos=x?i.Right:i.Left;}else{this._oCalcedPos=x?i.Left:i.Right;}};j.prototype._calcAuto=function(){if(this._$window.width()>this._$window.height()){if(this._checkHorizontal()){this._calcHorizontal();}else if(this._checkVertical()){this._calcVertical();}else{this._calcBestPos();}}else{if(this._checkVertical()){this._calcVertical();}else if(this._checkHorizontal()){this._calcHorizontal();}else{this._calcBestPos();}}};j.prototype._checkHorizontal=function(){var $=q(this._getOpenByDomRef());var H=$[0]!==undefined;var p=H?$[0].getBoundingClientRect().left:0;var e=H?$[0].getBoundingClientRect().width:0;var o=this._getOffsetX();var k=p-this._marginLeft+o;var m=p+e;var r=this._$window.width()-m-this._marginRight-o;var n=this.$();var w=n.outerWidth()+this._arrowOffset;if((w<=k)||(w<=r)){return true;}};j.prototype._checkVertical=function(){var $=q(this._getOpenByDomRef());var H=$[0]!==undefined;var p=H?$[0].getBoundingClientRect().top:0;var e=H?$[0].getBoundingClientRect().height:0;var o=this._getOffsetY();var t=p-this._marginTop+o;var k=this._getDocHeight()-$.offset().top-e-this._marginBottom-o;var m=this.$();var n=m.outerHeight()+this._arrowOffset;if((n<=t)||(n<=k)){return true;}};j.prototype._calcBestPos=function(){var $=this.$();var H=$.outerHeight();var w=$.outerWidth();var r=sap.ui.getCore().getConfiguration().getRTL();var e=q(this._getOpenByDomRef());var k=e[0]!==undefined;var p=k?e[0].getBoundingClientRect().left:0;var m=k?e[0].getBoundingClientRect().top:0;var n=k?e[0].getBoundingClientRect().width:0;var o=k?e[0].getBoundingClientRect().height:0;var t=this._getOffsetX();var u=this._getOffsetY();var v=m-this._marginTop+u;var x=this._getDocHeight()-e.offset().top-o-this._marginBottom-u;var y=p-this._marginLeft+t;var z=p+n;var A=this._$window.width()-z-this._marginRight-t;var F=H*w;var G;var J;if((this._$window.height()-this._marginTop-this._marginBottom)>=H){G=H;}else{G=this._$window.height()-this._marginTop-this._marginBottom;}if((this._$window.width()-this._marginLeft-this._marginRight)>=w){J=w;}else{J=this._$window.width()-this._marginLeft-this._marginRight;}var N=(G*(y))/F;var Q=(G*(A))/F;var U=(J*(v))/F;var V=(J*(x))/F;var W=Math.max(N,Q);var X=Math.max(U,V);if(W>X){if(W===N){this._oCalcedPos=r?i.Right:i.Left;}else if(W===Q){this._oCalcedPos=r?i.Left:i.Right;}}else if(X>W){if(X===U){this._oCalcedPos=i.Top;}else if(X===V){this._oCalcedPos=i.Bottom;}}else if(X===W){if(this._$window.height()>this._$window.width()){if(X===U){this._oCalcedPos=i.Top;}else if(X===V){this._oCalcedPos=i.Bottom;}}else{if(W===N){this._oCalcedPos=r?i.Right:i.Left;}else if(W===Q){this._oCalcedPos=r?i.Left:i.Right;}}}};j.outerWidth=function(e,k){if(typeof window.SVGElement!=="undefined"&&e instanceof window.SVGElement){return e.getBoundingClientRect().width;}return q(e).outerWidth(!!k);};j.outerHeight=function(e,k){if(typeof window.SVGElement!=="undefined"&&e instanceof window.SVGElement){return e.getBoundingClientRect().height;}return q(e).outerHeight(!!k);};j.prototype._getPositionParams=function($,e,k,m){var o=window.getComputedStyle($[0]),n=window.getComputedStyle(k[0]),p=this.getDomRef().clientHeight!=this.getDomRef().scrollHeight?g().width:0,r={};r._$popover=$;r._$parent=q(this._getOpenByDomRef());r._$arrow=e;r._$content=k;r._$scrollArea=m;r._$header=$.children(".sapMPopoverHeader");r._$subHeader=$.children(".sapMPopoverSubHeader");r._$footer=$.children(".sapMPopoverFooter");r._fWindowTop=this._$window.scrollTop();r._fWindowRight=this._$window.width();r._fWindowBottom=(j._bIOS7&&D.orientation.landscape&&window.innerHeight)?window.innerHeight:this._$window.height();r._fWindowLeft=this._$window.scrollLeft();r._fDocumentWidth=r._fWindowLeft+r._fWindowRight;r._fDocumentHeight=r._fWindowTop+r._fWindowBottom;r._fArrowHeight=e.outerHeight(true);r._fWidth=j.outerWidth($[0]);r._fWidthInner=r._$scrollArea?(r._$scrollArea.width()+p):0;r._fHeight=j.outerHeight($[0]);r._fHeaderHeight=r._$header.length>0?r._$header.outerHeight(true):0;r._fSubHeaderHeight=r._$subHeader.length>0?r._$subHeader.outerHeight(true):0;r._fFooterHeight=r._$footer.length>0?r._$footer.outerHeight(true):0;r._fOffset=$.offset();r._fOffsetX=this._getOffsetX();r._fOffsetY=this._getOffsetY();r._fMarginTop=r._fWindowTop+this._marginTop;r._fMarginRight=this._marginRight;r._fMarginBottom=this._marginBottom;r._fMarginLeft=r._fWindowLeft+this._marginLeft;r._fPopoverBorderTop=parseFloat(o.borderTopWidth);r._fPopoverBorderRight=parseFloat(o.borderRightWidth);r._fPopoverBorderBottom=parseFloat(o.borderBottomWidth);r._fPopoverBorderLeft=parseFloat(o.borderLeftWidth);r._fContentMarginTop=parseFloat(n.marginTop);r._fContentMarginBottom=parseFloat(n.marginBottom);return r;};j.prototype._recalculateMargins=function(e,p){var r=sap.ui.getCore().getConfiguration().getRTL();switch(e){case i.Left:if(r){p._fMarginLeft=p._$parent.offset().left+j.outerWidth(p._$parent[0],false)+this._arrowOffset-p._fOffsetX;}else{p._fMarginRight=p._fDocumentWidth-p._$parent.offset().left+this._arrowOffset-p._fOffsetX;}break;case i.Right:if(r){p._fMarginRight=p._fDocumentWidth-j.outerWidth(p._$parent[0],false)-p._$parent.offset().left+this._arrowOffset;}else{p._fMarginLeft=p._$parent.offset().left+j.outerWidth(p._$parent[0],false)+this._arrowOffset+p._fOffsetX;}break;case i.Top:p._fMarginBottom=p._fDocumentHeight-p._$parent.offset().top+this._arrowOffset-p._fOffsetY;break;case i.Bottom:p._fMarginTop=p._$parent.offset().top+j.outerHeight(p._$parent[0],false)+this._arrowOffset+p._fOffsetY;break;}};j.prototype._getPopoverPositionCss=function(p){var e,r,t,k,m=p._fDocumentWidth-p._fOffset.left-p._fWidth,n=p._fDocumentHeight-p._fOffset.top-p._fHeight,o=(p._fDocumentWidth-p._fMarginRight-p._fMarginLeft)<p._fWidth,u=(p._fDocumentHeight-p._fMarginTop-p._fMarginBottom)<p._fHeight,v=p._fOffset.left<p._fMarginLeft,w=this.getVerticalScrolling()&&(p._fWidth!==p._fWidthInner)?g().width:0,x=m<(p._fMarginRight+w),y=p._fOffset.top<p._fMarginTop,z=n<p._fMarginBottom,A=sap.ui.getCore().getConfiguration().getRTL();if(o){e=p._fMarginLeft;r=p._fMarginRight;}else{if(v){e=p._fMarginLeft;if(A){r="";}}else if(x){r=p._fMarginRight;e="";}}if(u){t=p._fMarginTop;k=p._fMarginBottom;}else{if(y){t=p._fMarginTop;}else if(z){k=p._fMarginBottom;t="";}}var F={top:t,bottom:k-p._fWindowTop,left:e,right:typeof r==="number"?r-p._fWindowLeft:r};return F;};j.prototype._getContentDimensionsCss=function(p){var o={},A=p._$content.height(),m=this._getMaxContentWidth(p),e=this._getMaxContentHeight(p);e=Math.max(e,0);o["max-width"]=m+"px";if(this.getContentHeight()||(A>e)){o["height"]=Math.min(e,A)+"px";}else{o["height"]="";o["max-height"]=e+"px";}return o;};j.prototype._getMaxContentWidth=function(p){return p._fDocumentWidth-p._fMarginLeft-p._fMarginRight-p._fPopoverBorderLeft-p._fPopoverBorderRight;};j.prototype._getMaxContentHeight=function(p){return p._fDocumentHeight-p._fMarginTop-p._fMarginBottom-p._fHeaderHeight-p._fSubHeaderHeight-p._fFooterHeight-p._fContentMarginTop-p._fContentMarginBottom-p._fPopoverBorderTop-p._fPopoverBorderBottom;};j.prototype._isHorizontalScrollbarNeeded=function(p){return this.getHorizontalScrolling()&&(p._$scrollArea.outerWidth(true)<=p._$content.width());};j.prototype._getArrowOffsetCss=function(e,p){var k,r=sap.ui.getCore().getConfiguration().getRTL();p._fWidth=p._$popover.outerWidth();p._fHeight=p._$popover.outerHeight();if(e===i.Left||e===i.Right){k=p._$parent.offset().top-p._$popover.offset().top-p._fPopoverBorderTop+p._fOffsetY+0.5*(j.outerHeight(p._$parent[0],false)-p._$arrow.outerHeight(false));k=Math.max(k,this._arrowOffsetThreshold);k=Math.min(k,p._fHeight-this._arrowOffsetThreshold-p._$arrow.outerHeight());return{"top":k};}else if(e===i.Top||e===i.Bottom){if(r){k=p._$popover.offset().left+j.outerWidth(p._$popover[0],false)-(p._$parent.offset().left+j.outerWidth(p._$parent[0],false))+p._fPopoverBorderRight+p._fOffsetX+0.5*(j.outerWidth(p._$parent[0],false)-p._$arrow.outerWidth(false));k=Math.max(k,this._arrowOffsetThreshold);k=Math.min(k,p._fWidth-this._arrowOffsetThreshold-p._$arrow.outerWidth(false));return{"right":k};}else{k=p._$parent.offset().left-p._$popover.offset().left-p._fPopoverBorderLeft+p._fOffsetX+0.5*(j.outerWidth(p._$parent[0],false)-p._$arrow.outerWidth(false));k=Math.max(k,this._arrowOffsetThreshold);k=Math.min(k,p._fWidth-this._arrowOffsetThreshold-p._$arrow.outerWidth(false));return{"left":k};}}};j.prototype._getArrowPositionCssClass=function(e){switch(e){case i.Left:return"sapMPopoverArrRight";case i.Right:return"sapMPopoverArrLeft";case i.Top:return"sapMPopoverArrDown";case i.Bottom:return"sapMPopoverArrUp";}};j.prototype._getArrowStyleCssClass=function(p){var A=p._$arrow.position(),F=p._$footer.position(),n=this._getSingleNavContent(),o=this._getSinglePageContent(),e=0;if(n||o){o=o||n.getCurrentPage();if(o){e=o._getAnyHeader().$().outerHeight();}}if((A.top+p._fArrowHeight)<(p._fHeaderHeight+p._fSubHeaderHeight)||((A.top+p._fArrowHeight)<e)){return"sapMPopoverHeaderAlignArr";}else if((A.top<(p._fHeaderHeight+p._fSubHeaderHeight))||(A.top<e)||(p._$footer.length&&((A.top+p._fArrowHeight)>F.top)&&(A.top<F.top))){return"sapMPopoverCrossArr";}else if(p._$footer.length&&(A.top>F.top)){return"sapMPopoverFooterAlignArr";}};j.prototype._getCalculatedPlacement=function(){return this._oCalcedPos||this.getPlacement();};j.prototype._adjustPositionAndArrow=function(){var e=this.oPopup.getOpenState();if(!(e===O.OPEN||e===O.OPENING)){return;}var $=this.$(),k=this.$("arrow"),m=this.$("cont"),n=this.$("scroll"),o=this._getCalculatedPlacement(),p=this._getPositionParams($,k,m,n);this._recalculateMargins(o,p);var r=this._getPopoverPositionCss(p),t=this._getContentDimensionsCss(p),H=this._isHorizontalScrollbarNeeded(p);$.css(r);m.css(t);if(H){n.css("display","block");}if(this.getShowArrow()){var A=this._getArrowOffsetCss(o,p),u=this._getArrowPositionCssClass(o),v,U;k.removeAttr("style");k.css(A);k.addClass(u);if(o===i.Top&&p._$footer&&p._$footer.size()){U=true;}if(o===i.Left||o===i.Right){v=this._getArrowStyleCssClass(p);if(v){k.addClass(v);if(v==="sapMPopoverFooterAlignArr"){U=true;}}}if(U){k.addClass("sapContrast sapContrastPlus");}$.css("overflow","visible");}this._afterAdjustPositionAndArrowHook();};j.prototype._adaptPositionParams=function(){if(this.getShowArrow()){this._marginLeft=10;this._marginRight=10;this._marginBottom=10;this._arrowOffset=18;this._offsets=["0 -18","18 0","0 18","-18 0"];if(this._bUseCompactArrow){this._arrowOffset=9;this._offsets=["0 -9","9 0","0 9","-9 0"];}this._myPositions=["center bottom","begin center","center top","end center"];this._atPositions=["center top","end center","center bottom","begin center"];}else{this._marginTop=0;this._marginLeft=0;this._marginRight=0;this._marginBottom=0;this._arrowOffset=0;this._offsets=["0 0","0 0","0 0","0 0"];this._myPositions=["begin bottom","begin center","begin top","end center"];this._atPositions=["begin top","end center","begin bottom","begin center"];}};j.prototype._afterAdjustPositionAndArrowHook=function(){};j.prototype._isPopupElement=function(o){var p=this._getOpenByDomRef();return!!(q(o).closest(sap.ui.getCore().getStaticAreaRef()).length)||!!(q(o).closest(p).length);};j.prototype._getAnyHeader=function(){if(this.getCustomHeader()){return this.getCustomHeader();}else{if(this.getShowHeader()){this._createInternalHeader();return this._internalHeader;}}};j.prototype._createInternalHeader=function(){if(!this._internalHeader){var t=this;this._internalHeader=new B(this.getId()+"-intHeader");this.setAggregation("_internalHeader",this._internalHeader);this._internalHeader.addEventDelegate({onAfterRendering:function(){t._restoreFocus();}});return true;}else{return false;}};j.prototype._animation=function(A,r){var t=null;var e=function(){r.off("webkitTransitionEnd transitionend");clearTimeout(t);setTimeout(function(){A();});};r.on("webkitTransitionEnd transitionend",e);t=setTimeout(e,this._getAnimationDuration());};j.prototype._getAnimationDuration=function(){return 300;};j.prototype._openAnimation=function(r,e,o){var t=this;setTimeout(function(){r.css("display","block");t._includeScrollWidth();t._animation(function(){if(!t.oPopup||t.oPopup.getOpenState()!==O.OPENING){return;}o();},r);},D.browser.firefox?50:0);};j.prototype._closeAnimation=function(r,e,k){r.addClass("sapMPopoverTransparent");this._animation(function(){k();r.removeClass("sapMPopoverTransparent");},r);};j.prototype._getInitialFocusId=function(){return this.getInitialFocus()||this._getFirstVisibleButtonId()||this._getFirstFocusableContentElementId()||this.getId();};j.prototype._getFirstVisibleButtonId=function(){var o=this.getBeginButton(),e=this.getEndButton(),k="";if(o&&o.getVisible()){k=o.getId();}else if(e&&e.getVisible()){k=e.getId();}return k;};j.prototype._getFirstFocusableContentElementId=function(){var r="";var $=this.$("cont");var F=$.firstFocusableDomRef();if(F){r=F.id;}return r;};j.prototype._restoreFocus=function(){if(this.isOpen()){var F=this._getInitialFocusId(),o=sap.ui.getCore().byId(F),e=(F?window.document.getElementById(F):null);if(o&&o.getFocusDomRef()){o.getFocusDomRef().focus();}else if(!o&&e){e.focus();}}};j.prototype._registerContentResizeHandler=function(o){if(!this._sResizeListenerId){this._sResizeListenerId=R.register(o||this.getDomRef("scroll"),this._fnOrientationChange);}};j.prototype._deregisterContentResizeHandler=function(){if(this._sResizeListenerId){R.deregister(this._sResizeListenerId);this._sResizeListenerId=null;}};j.prototype._storeScrollPosition=function(){var $=this.$("cont");if($.length>0){this._oScrollPosDesktop={x:$.scrollLeft(),y:$.scrollTop()};}};j.prototype._restoreScrollPosition=function(){if(!this._oScrollPosDesktop){return;}var $=this.$("cont");if($.length>0){$.scrollLeft(this._oScrollPosDesktop.x).scrollTop(this._oScrollPosDesktop.y);this._oScrollPosDesktop=null;}};j.prototype._repositionOffset=function(){var e=this.oPopup.getOpenState(),o,p;if(!(e===O.OPEN)){return this;}o=this.oPopup._oLastPosition;p=this._placements.indexOf(this.getPlacement());if(p===-1){return this;}if(p<4){o.offset=this._calcOffset(this._offsets[p]);this.oPopup._applyPosition(o);}else{this._calcPlacement();}return this;};j.prototype._getOpenByDomRef=function(){if(!this._oOpenBy){return null;}if(this._oOpenBy instanceof E){return(this._oOpenBy.getPopupAnchorDomRef&&this._oOpenBy.getPopupAnchorDomRef())||this._oOpenBy.getFocusDomRef();}else{return this._oOpenBy;}};j.prototype._getAccessibilityOptions=function(){var A,m={};m.role="dialog";m.modal=this.getProperty("ariaModal");if(this.getShowHeader()&&this._getAnyHeader()){A=Array.prototype.concat(this._getAnyHeader().getId(),this.getAssociation("ariaLabelledBy",[]));m.labelledby=A.join(' ');}return m;};j.prototype.setPlacement=function(p){this.setProperty("placement",p,true);this._bVerticalFlip=false;this._bHorizontalFlip=false;var e=this._placements.indexOf(p);if(e<=3){this._oCalcedPos=p;}return this;};j.prototype.setTitle=function(t){this.setProperty("title",t,true);if(this._headerTitle){this._headerTitle.setText(t);}else{this._headerTitle=new T(this.getId()+"-title",{text:this.getTitle(),level:"H2"});this._createInternalHeader();this._internalHeader.addContentMiddle(this._headerTitle);}return this;};j.prototype.setBeginButton=function(o){var e=this.getBeginButton();if(e===o){return this;}this._createInternalHeader();this._beginButton=o;if(o){if(e){this._internalHeader.removeAggregation("contentLeft",e,true);}this._internalHeader.addAggregation("contentLeft",o);}else{this._internalHeader.removeContentLeft(e);}return this;};j.prototype.setEndButton=function(o){var e=this.getEndButton();if(e===o){return this;}this._createInternalHeader();this._endButton=o;if(o){if(e){this._internalHeader.removeAggregation("contentRight",e,true);}this._internalHeader.insertAggregation("contentRight",o,1,true);this._internalHeader.invalidate();}else{this._internalHeader.removeContentRight(e);}return this;};j.prototype.setLeftButton=function(v){if(!(v instanceof a)){v=sap.ui.getCore().byId(v);}this.setBeginButton(v);return this.setAssociation("leftButton",v);};j.prototype.setRightButton=function(v){if(!(v instanceof a)){v=sap.ui.getCore().byId(v);}this.setEndButton(v);return this.setAssociation("rightButton",v);};j.prototype.setShowHeader=function(v){if(v===this.getShowHeader()||this.getCustomHeader()){return this;}if(v){if(this._internalHeader){this._internalHeader.$().show();}}else{if(this._internalHeader){this._internalHeader.$().hide();}}this.setProperty("showHeader",v,true);return this;};j.prototype.setModal=function(m,e){if(m===this.getModal()){return this;}this.oPopup.setModal(m,("sapMPopoverBLayer "+(e||"")).trim());this.setProperty("modal",m,true);return this;};j.prototype.setOffsetX=function(v){this.setProperty("offsetX",v,true);return this._repositionOffset();};j.prototype.setOffsetY=function(v){this.setProperty("offsetY",v,true);return this._repositionOffset();};j.prototype.setEnableScrolling=function(v){this.setHorizontalScrolling(v);this.setVerticalScrolling(v);var o=this.getEnableScrolling();if(o===v){return this;}this.setProperty("enableScrolling",v,true);return this;};j.prototype.setVerticalScrolling=function(v){this._bVScrollingEnabled=v;var o=this.getVerticalScrolling();if(o===v){return this;}this.$().toggleClass("sapMPopoverVerScrollDisabled",!v);this.setProperty("verticalScrolling",v,true);if(this._oScroller){this._oScroller.setVertical(v);}return this;};j.prototype.setHorizontalScrolling=function(v){this._bHScrollingEnabled=v;var o=this.getHorizontalScrolling();if(o===v){return this;}this.$().toggleClass("sapMPopoverHorScrollDisabled",!v);this.setProperty("horizontalScrolling",v,true);if(this._oScroller){this._oScroller.setHorizontal(v);}return this;};j.prototype.setResizable=function(v){if(!D.system.desktop){v=false;}return this.setProperty("resizable",v,true);};j.prototype._setAriaModal=function(v){return this.setProperty("ariaModal",v);};j.prototype.getScrollDelegate=function(){return this._oScroller;};j.prototype.setAggregation=function(A,o,e){if(A==="beginButton"||A==="endButton"){var F="set"+A.charAt(0).toUpperCase()+A.slice(1);return this[F](o);}else{return C.prototype.setAggregation.apply(this,arguments);}};j.prototype.getAggregation=function(A,o){if(A==="beginButton"||A==="endButton"){var e=this["_"+A];return e||o||null;}else{return C.prototype.getAggregation.apply(this,arguments);}};j.prototype.destroyAggregation=function(A,e){var o=q(document.activeElement).control(0);if(A==="beginButton"||A==="endButton"){var k=this["_"+A];if(k){k.destroy();this["_"+A]=null;}}else{C.prototype.destroyAggregation.apply(this,arguments);}o&&o.getDomRef()?o.focus():this.focus();return this;};j.prototype.invalidate=function(o){if(this.isOpen()){C.prototype.invalidate.apply(this,arguments);}return this;};j.prototype.addAggregation=function(A,o,e){if(A==="content"){this._bContentChanged=true;}C.prototype.addAggregation.apply(this,arguments);};j.prototype._getAllContent=function(){return this.getContent();};j.prototype._applyContextualSettings=function(){M.prototype._applyContextualSettings.call(this,M._defaultContextualSettings);};return j;});