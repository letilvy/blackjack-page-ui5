/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/Element','./library','sap/ui/unified/MenuItem',"sap/ui/table/TableUtils","sap/ui/core/IconPool"],function(E,l,M,T,I){"use strict";var R=l.RowActionType;var a=E.extend("sap.ui.table.RowActionItem",{metadata:{library:"sap.ui.table",properties:{icon:{type:"sap.ui.core.URI",group:"Data",defaultValue:null},visible:{type:"boolean",group:"Misc",defaultValue:true},text:{type:"string",group:"Misc",defaultValue:""},type:{type:"sap.ui.table.RowActionType",group:"Behavior",defaultValue:R.Custom}},events:{press:{item:{type:"sap.ui.table.RowActionItem"},row:{type:"sap.ui.table.Row"}}}}});a.prototype.exit=function(){if(this._menuItem){this._menuItem.destroy();this._menuItem=null;}};a.prototype.setIcon=function(i){this.setProperty("icon",i,true);this._updateRowAction();return this;};a.prototype.setText=function(t){this.setProperty("text",t,true);this._updateRowAction();return this;};a.prototype.setType=function(t){this.setProperty("type",t,true);this._updateRowAction();return this;};a.prototype.setVisible=function(v){this.setProperty("visible",v,true);this._updateRowAction(true);return this;};a.prototype.setTooltip=function(t){this.setAggregation("tooltip",t,true);this._updateRowAction();return this;};a.prototype._doFirePress=function(){var p=this.getParent();this.firePress({item:this,row:p&&p._getRow?p._getRow():null});};a.prototype._getMenuItem=function(){if(!this._menuItem){var t=this;this._menuItem=new M({select:function(e){t._doFirePress();}});}this._menuItem.setIcon(this._getIcon());this._menuItem.setVisible(this.getVisible());this._menuItem.setText(this._getText(false));return this._menuItem;};a.prototype._getIcon=function(){var i=this.getIcon();if(i){return i;}if(this.getType()==R.Navigation){return I.getIconURI(T.ThemeParameters.navigationIcon);}if(this.getType()==R.Delete){return I.getIconURI(T.ThemeParameters.deleteIcon);}return null;};a.prototype._getText=function(p){var t=p?(this.getTooltip_AsString()||this.getText()):(this.getText()||this.getTooltip_AsString());if(t){return t;}if(this.getType()==R.Navigation){return T.getResourceText("TBL_ROW_ACTION_NAVIGATE");}if(this.getType()==R.Delete){return T.getResourceText("TBL_ROW_ACTION_DELETE");}return null;};a.prototype._syncIcon=function(i){i.setSrc(this._getIcon());i.setTooltip(this._getText(true));};a.prototype._updateRowAction=function(f){var p=this.getParent();if(p&&p._updateIcons){p._updateIcons(f);}};return a;});
