/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/Renderer'],function(R){"use strict";var N={};N.render=function(r,c){var a,v,g=c.getItems(),e=c.getExpanded(),b=[],h=false;g.forEach(function(d){if(d.getVisible()){b.push(d);if(d.getIcon()){h=true;}}});r.write("<ul");r.writeControlData(c);var w=c.getWidth();if(w&&e){r.addStyle("width",w);}r.writeStyles();r.addClass("sapTntNavLI");if(!e){r.addClass("sapTntNavLICollapsed");}if(!h){r.addClass("sapTntNavLINoIcons");}r.writeClasses();a=!e||c.hasStyleClass("sapTntNavLIPopup")?'menubar':'tree';r.writeAttribute("role",a);r.write(">");b.forEach(function(d,i){d.render(r,c,i,v);});r.write("</ul>");};return N;},true);
