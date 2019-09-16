/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Core"],function(C){"use strict";var A=function(c){if(c){this._oControl=c;this._oControl.addDelegate(this._controlDelegate,false,this);}this.oRb=C.getLibraryResourceBundle("sap.f");};A.prototype._controlDelegate={onBeforeRendering:function(){this.attachDelegates();}};A.prototype.attachDelegates=function(){this._oDelegateSecondTitle={onAfterRendering:this.onAfterRenderingSecondTitle};this._oDelegateSearch={onAfterRendering:this.onAfterRenderingSearch};this._oDelegateNotifications={onAfterRendering:this.onAfterRenderingNotifications};this._oDelegateAvatar={onAfterRendering:this.onAfterRenderingAvatar};this._oDelegateProducts={onAfterRendering:this.onAfterRenderingProducts};this._oDelegateNavButton={onAfterRendering:this.onAfterRenderingNavButton};this._oDelegateMenuButton={onAfterRendering:this.onAfterRenderingMenuButton};if(this._oControl._oSecondTitle){this._oControl._oSecondTitle.addDelegate(this._oDelegateSecondTitle,false,this);}if(this._oControl._oSearch){this._oControl._oSearch.addDelegate(this._oDelegateSearch,false,this);}if(this._oControl._oNotifications){this._oControl._oNotifications.addDelegate(this._oDelegateNotifications,false,this);}if(this._oControl._oAvatarButton){this._oControl._oAvatarButton.addDelegate(this._oDelegateAvatar,false,this);}if(this._oControl._oProductSwitcher){this._oControl._oProductSwitcher.addDelegate(this._oDelegateProducts,false,this);}if(this._oControl._oNavButton){this._oControl._oNavButton.addDelegate(this._oDelegateNavButton,false,this);}if(this._oControl._oMenuButton){this._oControl._oMenuButton.addDelegate(this._oDelegateMenuButton,false,this);}};A.prototype.getRootAttributes=function(){return{role:"banner",label:this.oRb.getText("SHELLBAR_CONTAINER_LABEL")};};A.prototype.getCoPilotAttributes=function(){return{role:"button",label:this.oRb.getText("SHELLBAR_COPILOT_TOOLTIP")};};A.prototype.getEntityTooltip=function(e){return this.oRb.getText("SHELLBAR_"+e+"_TOOLTIP")||"";};A.prototype.updateNotificationsNumber=function(n){var t=this.getEntityTooltip("NOTIFICATIONS"),a=n?n+" "+t:t;this._oControl._oNotifications.setTooltip(a);this._oControl._oNotifications.$().attr("aria-label",a);};A.prototype.onAfterRenderingSecondTitle=function(){var $=this._oControl._oSecondTitle.$();$.attr("role","heading");$.attr("aria-level","2");};A.prototype.onAfterRenderingSearch=function(){this._oControl._oSearch.$().attr("aria-label",this.getEntityTooltip("SEARCH"));};A.prototype.onAfterRenderingNotifications=function(){var $=this._oControl._oNotifications.$(),t=this.getEntityTooltip("NOTIFICATIONS"),n=this._oControl._oNotifications.data("notifications"),a=n?n+" "+t:t;$.attr("aria-label",a);$.attr("aria-haspopup","dialog");};A.prototype.onAfterRenderingAvatar=function(){var $=this._oControl._oAvatarButton.$();$.attr("aria-label",this.getEntityTooltip("PROFILE"));$.attr("aria-haspopup","menu");};A.prototype.onAfterRenderingProducts=function(){var $=this._oControl._oProductSwitcher.$();$.attr("aria-label",this.getEntityTooltip("PRODUCTS"));$.attr("aria-haspopup","menu");};A.prototype.onAfterRenderingNavButton=function(){this._oControl._oNavButton.$().attr("aria-label",this.getEntityTooltip("BACK"));};A.prototype.onAfterRenderingMenuButton=function(){var $=this._oControl._oMenuButton.$();$.attr("aria-label",this.getEntityTooltip("MENU"));$.attr("aria-haspopup","menu");};A.prototype.exit=function(){if(this._oControl){this._oControl.removeDelegate(this._controlDelegate);}if(this._oControl._oSecondTitle){this._oControl._oSecondTitle.removeDelegate(this._oDelegateSecondTitle);}if(this._oControl._oSearch){this._oControl._oSearch.removeDelegate(this._oDelegateSearch);}if(this._oControl._oNotifications){this._oControl._oNotifications.removeDelegate(this._oDelegateNotifications);}if(this._oControl._oAvatarButton){this._oControl._oAvatarButton.removeDelegate(this._oDelegateAvatar);}if(this._oControl._oProductSwitcher){this._oControl._oProductSwitcher.removeDelegate(this._oDelegateProducts);}if(this._oControl._oNavButton){this._oControl._oNavButton.removeDelegate(this._oDelegateNavButton);}if(this._oControl._oMenuButton){this._oControl._oMenuButton.removeDelegate(this._oDelegateMenuButton);}};return A;});
