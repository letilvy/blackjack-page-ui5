/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/f/library","sap/ui/base/ManagedObject","sap/m/Table","sap/f/cards/BaseContent","sap/m/Column","sap/m/ColumnListItem","sap/m/Text","sap/m/Link","sap/m/ProgressIndicator","sap/m/ObjectIdentifier","sap/m/ObjectStatus","sap/f/Avatar","sap/f/cards/ActionEnablement","sap/ui/core/library","sap/m/library","sap/f/cards/BindingResolver"],function(l,M,R,B,C,a,T,L,P,O,b,A,c,d,m,e){"use strict";var f=l.AvatarSize;var V=d.VerticalAlign;var g=m.ListSeparators;var h=m.ListType;var i=B.extend("sap.f.cards.TableContent",{renderer:{}});i.prototype.exit=function(){B.prototype.exit.apply(this,arguments);if(this._oItemTemplate){this._oItemTemplate.destroy();this._oItemTemplate=null;}};i.prototype._getTable=function(){if(this._bIsBeingDestroyed){return null;}var t=this.getAggregation("_content");if(!t){t=new R({id:this.getId()+"-Table",showSeparators:g.None});this.setAggregation("_content",t);}return t;};i.prototype.setConfiguration=function(o){B.prototype.setConfiguration.apply(this,arguments);if(!o){return this;}if(o.rows&&o.columns){this._setStaticColumns(o.rows,o.columns);return this;}if(o.row&&o.row.columns){this._setColumns(o.row);}return this;};i.prototype._setColumns=function(r){var j=[],t=this._getTable(),k=r.columns;k.forEach(function(n){this._getTable().addColumn(new C({header:new T({text:n.title}),width:n.width}));j.push(this._createCell(n));}.bind(this));this._oItemTemplate=new a({cells:j,vAlign:V.Middle});this._attachActions(r,this._oItemTemplate);var o={template:this._oItemTemplate};this._bindAggregation("items",t,o);};i.prototype._setStaticColumns=function(r,k){var t=this._getTable();k.forEach(function(o){t.addColumn(new C({header:new T({text:o.title}),width:o.width}));});r.forEach(function(o){var I=new a({vAlign:V.Middle});if(o.cells&&Array.isArray(o.cells)){for(var j=0;j<o.cells.length;j++){I.addCell(this._createCell(o.cells[j]));}}if(o.actions&&Array.isArray(o.actions)){var n=o.actions[0];if(n.type===h.Navigation){I.setType(h.Navigation);}if(n.url){I.attachPress(function(){window.open(n.url,n.target||"_blank");});}}t.addItem(I);}.bind(this));this.fireEvent("_actionContentReady");};i.prototype._createCell=function(o){if(o.url){return new L({text:o.value,href:o.url,target:o.target||"_blank"});}if(o.identifier){var I=new O({title:o.value});if(o.identifier.url){var j=M.bindingParser(o.identifier.url);if(j){j.formatter=function(v){if(typeof v==="string"){return true;}return false;};I.bindProperty("titleActive",j);}else{I.setTitleActive(!!o.identifier.url);}I.attachTitlePress(function(E){var s=E.getSource(),k=s.getBindingContext(),n=s.getModel(),p,u,t;if(k){p=k.getPath();}u=e.resolveValue(o.identifier.url,n,p);t=e.resolveValue(o.identifier.target,n,p);if(u){window.open(u,t||"_blank");}});}return I;}if(o.state){return new b({text:o.value,state:o.state});}if(o.value){return new T({text:o.value});}if(o.icon){return new A({src:o.icon.src,displayShape:o.icon.shape,displaySize:f.XS});}if(o.progressIndicator){return new P({percentValue:o.progressIndicator.percent,displayValue:o.progressIndicator.text,state:o.progressIndicator.state});}};i.prototype.getInnerList=function(){return this._getTable();};c.enrich(i);return i;});