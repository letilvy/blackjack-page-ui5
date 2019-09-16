/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/core/Renderer","sap/ui/Device","sap/m/library","sap/ui/core/library","sap/ui/core/Icon","sap/m/TextRenderer","sap/m/Text","sap/m/LinkRenderer","sap/m/Link","./ObjectMarkerRenderer"],function(C,R,D,l,c,I,T,a,L,b,O){"use strict";var d=c.TextAlign;var e=l.ObjectMarkerVisibility;var f=C.extend("sap.m.ObjectMarker",{metadata:{library:"sap.m",designtime:"sap/m/designtime/ObjectMarker.designtime",properties:{type:{type:"sap.m.ObjectMarkerType",group:"Misc"},visibility:{type:"sap.m.ObjectMarkerVisibility",group:"Misc"},additionalInfo:{type:"string",group:"Misc",defaultValue:""}},aggregations:{_innerControl:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{press:{type:{type:"sap.m.ObjectMarkerType"}}},dnd:{draggable:true,droppable:false}}});var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");f.M_PREDEFINED_TYPES={Flagged:{icon:{src:"sap-icon://flag",visibility:{small:true,large:true}},text:{value:r.getText("OM_FLAG"),visibility:{small:false,large:false}}},Favorite:{icon:{src:"sap-icon://favorite",visibility:{small:true,large:true}},text:{value:r.getText("OM_FAVORITE"),visibility:{small:false,large:false}}},Draft:{icon:{src:"sap-icon://request",visibility:{small:false,large:false}},text:{value:r.getText("OM_DRAFT"),visibility:{small:true,large:true}}},Locked:{icon:{src:"sap-icon://private",visibility:{small:true,large:true}},text:{value:r.getText("OM_LOCKED"),visibility:{small:false,large:true}}},Unsaved:{icon:{src:"sap-icon://user-edit",visibility:{small:true,large:true}},text:{value:r.getText("OM_UNSAVED"),visibility:{small:false,large:true}}},LockedBy:{icon:{src:"sap-icon://private",visibility:{small:true,large:true}},text:{value:r.getText("OM_LOCKED_BY"),visibility:{small:false,large:true}}},UnsavedBy:{icon:{src:"sap-icon://user-edit",visibility:{small:true,large:true}},text:{value:r.getText("OM_UNSAVED_BY"),visibility:{small:false,large:true}}}};f.prototype.init=function(){D.media.initRangeSet("DeviceSet",[600],"px",["small","large"]);};f.prototype.onAfterRendering=function(){this._attachMediaContainerWidthChange(this._handleMediaChange,this,"DeviceSet");};f.prototype.onBeforeRendering=function(){this._cleanup();this._adjustControl(true);};f.prototype.exit=function(){this._cleanup();};f.prototype.attachPress=function(){var o=this._getInnerControl();Array.prototype.unshift.apply(arguments,["press"]);C.prototype.attachEvent.apply(this,arguments);if(this.hasListeners("press")&&o&&o instanceof h){o.destroy();this.setAggregation("_innerControl",this._createCustomLink(),true);this._adjustControl();}return this;};f.prototype.detachPress=function(){var o=this._getInnerControl();Array.prototype.unshift.apply(arguments,["press"]);C.prototype.detachEvent.apply(this,arguments);if(!this.hasListeners("press")&&o&&o instanceof j){o.destroy();this.setAggregation("_innerControl",this._createCustomText(),true);this._adjustControl();}return this;};f.prototype._cleanup=function(){this._detachMediaContainerWidthChange(this._handleMediaChange,this,"DeviceSet");};f.prototype._handleMediaChange=function(){this._adjustControl();};f.prototype._adjustControl=function(s){var t=f.M_PREDEFINED_TYPES[this.getType()],o=this._getInnerControl(),A=this.getAdditionalInfo(),k=this.getType(),m;if(!o){return false;}if(t){m=this._getMarkerText(t,k,A);}if(this._isIconVisible()){o.setIcon(t.icon.src,s);this.addStyleClass("sapMObjectMarkerIcon");}else{o.setIcon(null,s);this.removeStyleClass("sapMObjectMarkerIcon");}if(this._isTextVisible()){o.setAggregation("tooltip",null,s);o.setText(m,s);this.addStyleClass("sapMObjectMarkerText");}else{if(o.getIcon()){o.setAggregation("tooltip",m,s);}o.setText(null,s);this.removeStyleClass("sapMObjectMarkerText");}return true;};f.prototype._getMarkerText=function(t,s,A){switch(s){case"LockedBy":return(A==="")?r.getText('OM_LOCKED_BY_ANOTHER_USER'):r.getText('OM_LOCKED_BY',[A]);case"UnsavedBy":return(A==="")?r.getText('OM_UNSAVED_BY_ANOTHER_USER'):r.getText('OM_UNSAVED_BY',[A]);default:return(A==="")?t.text.value:t.text.value+" "+A;}};f.prototype._isIconVisible=function(){var t=f.M_PREDEFINED_TYPES[this.getType()],v=this.getVisibility(),s=this._getDeviceType(),k=t&&t.icon.visibility[s]||false;return v===e.IconOnly||v===e.IconAndText||(v!==e.TextOnly&&k);};f.prototype._isTextVisible=function(){var t=f.M_PREDEFINED_TYPES[this.getType()],v=this.getVisibility(),s=this._getDeviceType(),k=t&&t.text.visibility[s]||false;return v===e.TextOnly||v===e.IconAndText||(v!==e.IconOnly&&k);};f.prototype._getDeviceType=function(){return this._getCurrentMediaContainerRange("DeviceSet").name.toLowerCase();};f.prototype._getInnerControl=function(){var o=this.getAggregation("_innerControl");if(!o&&this.getType()){o=this._createInnerControl();this.setAggregation("_innerControl",o,true);this._adjustControl(true);}return o;};f.prototype._createInnerControl=function(){if(this.hasListeners("press")){return this._createCustomLink();}else{return this._createCustomText();}};f.prototype._createCustomLink=function(){var o=new j(this.getId()+"-link",{wrapping:true});o.attachPress(function(E){this.firePress({type:this.getType()});},this);return o;};f.prototype._createCustomText=function(){return new h(this.getId()+"-text",{textAlign:d.Initial});};["getAriaLabelledBy","addAriaLabelledBy","removeAriaLabelledBy","removeAllAriaLabelledBy","getAriaDescribedBy","addAriaDescribedBy","removeAriaDescribedBy","removeAllAriaDescribedBy","getAccessibilityInfo"].map(function(F){var k=/^add/.test(F);f.prototype[F]=function(){var o=this._getInnerControl(),m;if(o&&o[F]){m=o[F].apply(o,arguments);}return k?this:m;};});var g=R.extend(T);g.renderText=function(o,k){o.renderControl(k._getIconAggregation());T.renderText(o,k);};var h=a.extend("sap.m.internal.ObjectMarkerCustomText",{metadata:{library:"sap.m",properties:{icon:{type:"sap.ui.core.URI",group:"Data",defaultValue:null}},aggregations:{_iconControl:{type:"sap.ui.core.Icon",multiple:false,visibility:"hidden"}}},renderer:g});h.prototype.setIcon=function(s,S){var o=this._getIconAggregation();this.setProperty("icon",s,S);o.setSrc(s);return this;};h.prototype._getIconAggregation=function(){var o=this.getAggregation("_iconControl");if(!o){o=new I();this.setAggregation("_iconControl",o,true);}return o;};h.prototype.setText=function(t,s){this.setProperty("text",t,s);return this;};var i=R.extend(L);i.renderText=function(o,k){o.renderControl(k._getIconAggregation());L.renderText(o,k);};var j=b.extend("sap.m.internal.ObjectMarkerCustomLink",{metadata:{library:"sap.m",properties:{icon:{type:"sap.ui.core.URI",group:"Data",defaultValue:null}},aggregations:{_iconControl:{type:"sap.ui.core.Icon",multiple:false,visibility:"hidden"}}},renderer:i});j.prototype.setIcon=function(s,S){var o=this._getIconAggregation();this.setProperty("icon",s,S);o.setSrc(s);return this;};j.prototype._getTabindex=function(){return"0";};j.prototype._getIconAggregation=function(){var o=this.getAggregation("_iconControl");if(!o){o=new I();this.setAggregation("_iconControl",o,true);}return o;};j.prototype.setText=function(t,s){this.setProperty("text",t,s);return this;};return f;});
