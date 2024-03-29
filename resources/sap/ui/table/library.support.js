/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/**
 * Adds support rules of the sap.ui.table library to the support infrastructure.
 */
sap.ui.define([
	"sap/ui/support/library",
	"sap/ui/support/supportRules/RuleSet",
	"./rules/TableHelper.support",
	"sap/ui/Device",
	"sap/ui/table/library",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library"
], function(SupportLib, Ruleset, SupportHelper, Device, TableLib, Log, jQuery, coreLibrary) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity;	// Hint, Warning, Error
		//Audiences = SupportLib.Audiences; // Control, Internal, Application
	var MessageType = coreLibrary.MessageType;

	var oLib = {
		name: "sap.ui.table",
		niceName: "UI5 Table library"
	};

	var oRuleset = new Ruleset(oLib);

	function createRule(oRuleDef) {
		oRuleDef.id = "gridTable" + oRuleDef.id;
		SupportHelper.addRuleToRuleset(oRuleDef, oRuleset);
	}


	//**********************************************************
	// Helpers related to sap.ui.table Controls
	//**********************************************************

	/**
	 * Loops over all columns of all visible tables and calls the given callback with the following parameters:
	 * table instance, column instance, column template instance.
	 *
	 * If the column does not have a template or a type is given and the template is not of this type the callback is not called.
	 *
	 * @param {function} fnDoCheck Callback
	 * @param {object} oScope The scope as given in the rule check function.
	 * @param {string} [sType] If given an additional type check is performed.
	 */
	function checkColumnTemplate(fnDoCheck, oScope, sType) {
		var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");
		var aColumns, oTemplate;
		for (var i = 0; i < aTables.length; i++) {
			aColumns = aTables[i].getColumns();
			for (var k = 0; k < aColumns.length; k++) {
				oTemplate = aColumns[k].getTemplate();
				if (oTemplate && oTemplate.isA(sType)) {
					fnDoCheck(aTables[i], aColumns[k], oTemplate);
				}
			}
		}
	}


	//**********************************************************
	// Rule Definitions
	//**********************************************************


	/*
	 * Checks whether content densities are used correctly.
	 */
	createRule({
		id : "ContentDensity",
		categories: [Categories.Usage],
		title : "Content Density Usage",
		description : "Checks whether the content densities 'Cozy', 'Compact' and 'Condensed' are used correctly.",
		resolution : "Ensure that either only the 'Cozy' or 'Compact' content density is used or the 'Condensed' and 'Compact' content densities in combination are used.",
		resolutionurls : [SupportHelper.createDocuRef("Documentation: Content Densities", "#docs/guide/e54f729da8e3405fae5e4fe8ae7784c1.html")],
		check : function(oIssueManager, oCoreFacade, oScope) {
			var $Document = jQuery("html");
			var $Cozy = $Document.find(".sapUiSizeCozy");
			var $Compact = $Document.find(".sapUiSizeCompact");
			var $Condensed = $Document.find(".sapUiSizeCondensed");

			function checkDensity($Source, sTargetClass, sMessage) {
				var bFound = false;
				$Source.each(function(){
					if (jQuery(this).closest(sTargetClass).length) {
						bFound = true;
					}
				});
				if (bFound && sMessage) {
					SupportHelper.reportIssue(oIssueManager, sMessage, Severity.High);
				}
				return bFound;
			}

			checkDensity($Compact, ".sapUiSizeCozy", "'Compact' content density is used within 'Cozy' area.");
			checkDensity($Cozy, ".sapUiSizeCompact", "'Cozy' content density is used within 'Compact' area.");
			checkDensity($Condensed, ".sapUiSizeCozy", "'Condensed' content density is used within 'Cozy' area.");
			checkDensity($Cozy, ".sapUiSizeCondensed", "'Cozy' content density is used within 'Condensed' area.");

			if ($Condensed.length > 0) {
				var bFound = checkDensity($Condensed, ".sapUiSizeCompact");
				if (!bFound) {
					SupportHelper.reportIssue(oIssueManager, "'Condensed' content density must be used in combination with 'Compact'.",
											  Severity.High);
				}
			}

			if (sap.ui.getCore().getLoadedLibraries()["sap.m"] && $Cozy.length === 0 && $Compact.length === 0 && $Condensed.length === 0) {
				SupportHelper.reportIssue(oIssueManager,
										  "If the sap.ui.table and the sap.m libraries are used together, a content density must be specified.",
										  Severity.High
				);
			}
		}
	});


	/*
	 * Validates whether title or aria-labelledby is correctly set
	 */
	createRule({
		id : "AccessibleLabel",
		categories: [Categories.Accessibility],
		title : "Accessible Label",
		description : "Checks whether 'sap.ui.table.Table' controls have an accessible label.",
		resolution : "Use the 'title' aggregation or the 'ariaLabelledBy' association of the 'sap.ui.table.Table' control to define a proper accessible labeling.",
		check : function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");
			for (var i = 0; i < aTables.length; i++) {
				if (!aTables[i].getTitle() && aTables[i].getAriaLabelledBy().length == 0) {
					SupportHelper.reportIssue(oIssueManager, "Table '" + aTables[i].getId() + "' does not have an accessible label.", Severity.High, aTables[i].getId());
				}
			}
		}
	});

	/*
	 * Validates whether the highlightText property of the RowSettings is correctly set.
	 */
	createRule({
		id : "AccessibleRowHighlight",
		categories: [Categories.Accessibility],
		minversion: "1.62",
		title : "Accessible Row Highlight",
		description : "Checks whether the row highlights of the 'sap.ui.table.Table' controls are accessible.",
		resolution : "Use the 'highlightText' property of the 'sap.ui.table.RowSettings' to define the semantics of the row 'highlight'.",
		resolutionurls: [
			SupportHelper.createDocuRef("API Reference: sap.ui.table.RowSettings#getHighlight", "#/api/sap.ui.table.RowSettings/methods/getHighlight"),
			SupportHelper.createDocuRef("API Reference: sap.ui.table.RowSettings#getHighlightText", "#/api/sap.ui.table.RowSettings/methods/getHighlightText")
		],
		check : function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");

			function checkRowHighlight(oRow) {
				var oRowSettings = oRow.getAggregation("_settings");
				var sHighlight = oRowSettings ? oRowSettings.getHighlight() : null;
				var sHighlightText = oRowSettings ? oRowSettings.getHighlightText() : null;
				var sRowId = oRow.getId();

				if (oRowSettings && !(sHighlight in MessageType) && sHighlightText === "") {
					SupportHelper.reportIssue(oIssueManager,
						"Row '" + sRowId + "' of table '" + oRow.getParent().getId() + "' does not have a highlight text.", Severity.High, sRowId);
				}
			}

			for (var i = 0; i < aTables.length; i++) {
				aTables[i].getRows().forEach(checkRowHighlight);
			}
		}
	});


	/*
	 * Validates sap.ui.core.Icon column templates.
	 */
	createRule({
		id : "ColumnTemplateIcon",
		categories: [Categories.Accessibility],
		title : "Column template validation - 'sap.ui.core.Icon'",
		description : "The 'decorative' property of control 'sap.ui.core.Icon' is set to 'true' although the control is used as column template.",
		resolution : "Set the 'decorative' property of control 'sap.ui.core.Icon' to 'false' if the control is used as column template.",
		check : function(oIssueManager, oCoreFacade, oScope) {
			checkColumnTemplate(function(oTable, oColumn, oIconTemplate) {
				if (!oIconTemplate.isBound("decorative") && oIconTemplate.getDecorative()) {
					var sId = oColumn.getId();
					SupportHelper.reportIssue(oIssueManager, "Column '" + sId + "' of table '" + oTable.getId() + "' uses decorative 'sap.ui.core.Icon' control.", Severity.High, sId);
				}
			}, oScope, "sap.ui.core.Icon");
		}
	});


	/*
	 * Validates sap.m.Text column templates.
	 */
	createRule({
		id : "ColumnTemplateTextWrapping",
		categories: [Categories.Usage],
		title : "Column template validation - 'sap.m.Text'",
		description : "The 'wrapping' and/or 'renderWhitespace' property of the control 'sap.m.Text' is set to 'true' although the control is used as a column template.",
		resolution : "Set the 'wrapping' and 'renderWhitespace' property of the control 'sap.m.Text' to 'false' if the control is used as a column template.",
		check : function(oIssueManager, oCoreFacade, oScope) {
			checkColumnTemplate(function(oTable, oColumn, oMTextTemplate) {
				if (oMTextTemplate.isBound("wrapping") || (!oMTextTemplate.isBound("wrapping") && oMTextTemplate.getWrapping())) {
					var sColumnId = oColumn.getId();
					SupportHelper.reportIssue(oIssueManager, "Column '" + sColumnId + "' of table '" + oTable.getId() + "' uses an 'sap.m.Text' control with wrapping enabled.", Severity.High, sColumnId);
				}
				if (oMTextTemplate.isBound("renderWhitespace") || (!oMTextTemplate.isBound("renderWhitespace") && oMTextTemplate.getRenderWhitespace())) {
					var sColumnId = oColumn.getId();
					SupportHelper.reportIssue(oIssueManager, "Column '" + sColumnId + "' of table '" + oTable.getId() + "' uses an 'sap.m.Text' control with renderWhitespace enabled.", Severity.High, sColumnId);
				}
			}, oScope, "sap.m.Text");
		}
	});


	/*
	 * Validates sap.m.Link column templates.
	 */
	createRule({
		id : "ColumnTemplateLinkWrapping",
		categories: [Categories.Usage],
		title : "Column template validation - 'sap.m.Link'",
		description : "The 'wrapping' property of the control 'sap.m.Link' is set to 'true' although the control is used as a column template.",
		resolution : "Set the 'wrapping' property of the control 'sap.m.Link' to 'false' if the control is used as a column template.",
		check : function(oIssueManager, oCoreFacade, oScope) {
			checkColumnTemplate(function(oTable, oColumn, oMLinkTemplate) {
				if (oMLinkTemplate.isBound("wrapping") || (!oMLinkTemplate.isBound("wrapping") && oMLinkTemplate.getWrapping())) {
					var sColumnId = oColumn.getId();
					SupportHelper.reportIssue(oIssueManager, "Column '" + sColumnId + "' of table '" + oTable.getId() + "' uses an 'sap.m.Link' control with wrapping enabled.", Severity.High, sColumnId);
				}
			}, oScope, "sap.m.Link");
		}
	});


	/*
	 * Checks for No Deviating units issue in AnalyticalBinding
	 */
	createRule({
		id : "AnalyticsNoDeviatingUnits",
		categories: [Categories.Bindings],
		title : "Analytical Binding reports 'No deviating units found...'",
		description : "The analytical service returns duplicate IDs. This could also lead to many requests, but the analytical service expects to receive just one record",
		resolution : "Adjust the service implementation.",
		check : function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.AnalyticalTable");
			var sAnalyticalErrorId = "NO_DEVIATING_UNITS";
			var oIssues = {};

			SupportHelper.checkLogEntries(function(oLogEntry) {
				// Filter out totally irrelevant issues
				if (oLogEntry.level != Log.Level.ERROR && oLogEntry.level != Log.Level.FATAL) {
					return false;
				}
				var oInfo = oLogEntry.supportInfo;
				if (oInfo && oInfo.type === "sap.ui.model.analytics.AnalyticalBinding" && oInfo.analyticalError === sAnalyticalErrorId) {
					return true;
				}
				return false;
			}, function(oLogEntry){
				// Check the remaining Issues
				var sBindingId = oLogEntry.supportInfo.analyticalBindingId;
				if (sBindingId && !oIssues[sAnalyticalErrorId + "-" + sBindingId]) {
					var oBinding;
					for (var i = 0; i < aTables.length; i++) {
						oBinding = aTables[i].getBinding("rows");
						if (oBinding && oBinding.__supportUID === sBindingId) {
							oIssues[sAnalyticalErrorId + "-" + sBindingId] = true; // Ensure is only reported once
							SupportHelper.reportIssue(oIssueManager, "Analytical Binding reports 'No deviating units found...'", Severity.High, aTables[i].getId());
						}
					}
				}
			});
		}
	});

	/*
	 * Checks whether the currently visible rows have the expected height.
	 */
	createRule({
		id : "RowHeights",
		categories: [Categories.Usage],
		title : "Row heights",
		description : "Checks whether the currently visible rows have the expected height.",
		resolution : "Check whether content densities are correctly used, and only the supported controls are used as column templates, with their"
					 + " wrapping property set to \"false\"",
		resolutionurls: [
			SupportHelper.createDocuRef("Documentation: Content Densities", "#/topic/e54f729da8e3405fae5e4fe8ae7784c1"),
			SupportHelper.createDocuRef("Documentation: Supported controls", "#/topic/148892ff9aea4a18b912829791e38f3e"),
			SupportHelper.createDocuRef("API Reference: sap.ui.table.Column#getTemplate", "#/api/sap.ui.table.Column/methods/getTemplate"),
			{text: "SAP Fiori Design Guidelines: Grid Table", href: "https://experience.sap.com/fiori-design-web/grid-table/"}
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");
			var bIsZoomedInChrome = Device.browser.chrome && window.devicePixelRatio != 1;

			for (var i = 0; i < aTables.length; i++) {
				var aVisibleRows = aTables[i].getRows();
				var iExpectedRowHeight = aTables[i]._getBaseRowHeight();
				var bUnexpectedRowHeightDetected = false;

				for (var j = 0; j < aVisibleRows.length; j++) {
					var oRowElement = aVisibleRows[j].getDomRef();
					var oRowElementFixedPart = aVisibleRows[j].getDomRef("fixed");

					if (oRowElement) {
						var nActualRowHeight = oRowElement.getBoundingClientRect().height;
						var nActualRowHeightFixedPart = oRowElementFixedPart ? oRowElementFixedPart.getBoundingClientRect().height : null;
						var nHeightToReport = nActualRowHeight;

						if (bIsZoomedInChrome) {
							var nHeightDeviation = Math.abs(iExpectedRowHeight - nActualRowHeight);
							var nHeightDeviationFixedPart = Math.abs(nActualRowHeightFixedPart - nActualRowHeight);

							// If zoomed in Chrome, the actual height may deviate from the expected height by less than 1 pixel. Any higher
							// deviation shall be considered as defective.
							if (nHeightDeviation > 1) {
								bUnexpectedRowHeightDetected = true;
							} else if (nHeightDeviationFixedPart > 1) {
								bUnexpectedRowHeightDetected = true;
								nHeightToReport = nActualRowHeightFixedPart;
							}
						} else if (nActualRowHeight !== iExpectedRowHeight) {
							bUnexpectedRowHeightDetected = true;
						} else if (nActualRowHeightFixedPart !== iExpectedRowHeight) {
							bUnexpectedRowHeightDetected = true;
							nHeightToReport = nActualRowHeightFixedPart;
						}

						if (bUnexpectedRowHeightDetected) {
							SupportHelper.reportIssue(oIssueManager,
								"The row height was expected to be " + iExpectedRowHeight + "px, but was " + nHeightToReport + "px instead."
								+ " This causes issues with vertical scrolling.",
								Severity.High, aVisibleRows[j].getId());
							break;
						}
					}
				}
			}
		}
	});

	/*
	 * Checks the configuration of the sap.f.DynamicPage. If the DynamicPage contains a table with <code>visibleRowCountMode=Auto</code>, the
	 * <code>fitContent</code> property of the DynamicPage should be set to true, otherwise false.
	 */
	createRule({
		id: "DynamicPageConfiguration",
		categories: [Categories.Usage],
		title: "Table environment validation - 'sap.f.DynamicPage'",
		description: "Verifies that the DynamicPage is configured correctly from the table's perspective.",
		resolution: "If a table with visibleRowCountMode=Auto is placed inside a sap.f.DynamicPage, the fitContent property of the DynamicPage"
					+ " should be set to true, otherwise false.",
		resolutionurls: [
			SupportHelper.createDocuRef("API Reference: sap.f.DynamicPage#getFitContent", "#/api/sap.f.DynamicPage/methods/getFitContent")
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");

			function checkAllParentDynamicPages(oControl, fnCheck) {
				if (oControl) {
					if (oControl.isA("sap.f.DynamicPage")) {
						fnCheck(oControl);
					}
					checkAllParentDynamicPages(oControl.getParent(), fnCheck);
				}
			}

			function checkConfiguration(oTable, oDynamicPage) {
				if (oTable._getRowMode().isA("sap.ui.table.rowmodes.AutoRowMode") && !oDynamicPage.getFitContent()) {
					SupportHelper.reportIssue(oIssueManager,
						"A table with an auto row mode is placed inside a sap.f.DynamicPage with fitContent=\"false\"",
						Severity.High, oTable.getId());
				} else if ((oTable._getRowMode().isA("sap.ui.table.rowmodes.FixedRowMode")
							|| oTable._getRowMode().isA("sap.ui.table.rowmodes.InteractiveRowMode"))
						   && oDynamicPage.getFitContent()) {
					SupportHelper.reportIssue(oIssueManager,
						"A table with a fixed or interactive row mode is placed inside a sap.f.DynamicPage with fitContent=\"true\"",
						Severity.Low, oTable.getId());
				}
			}

			for (var i = 0; i < aTables.length; i++) {
				checkAllParentDynamicPages(aTables[i], checkConfiguration.bind(null, aTables[i]));
			}
		}
	});

	/*
	 * Checks the number and type of plugins which are applied to the table.
	 */
	createRule({
		id : "Plugins",
		categories: [Categories.Usage],
		title : "Plugins validation",
		description : "Checks the number and type of plugins which are applied to the table. Only one MultiSelectionPlugin can be applied. No other plugins are allowed.",
		resolution : "Check if multiple MultiSelectionPlugins are applied, or a plugin of another type is applied to the table.",
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");

			for (var i = 0; i < aTables.length; i++) {
				var oTable = aTables[i];
				var aPlugins = oTable.getPlugins();
				if (aPlugins.length > 1) {
					SupportHelper.reportIssue(oIssueManager,
						"Only one plugin can be applied to the table",
						Severity.High, oTable.getId());
				} else if (aPlugins.length == 1) {
					var oPlugin = aPlugins[0];
					if (!oPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin")) {
						SupportHelper.reportIssue(oIssueManager,
							"Only one MultiSelectionPlugin can be applied to the table",
							Severity.High, oTable.getId());
					}
				}
			}
		}
	});

	return {lib: oLib, ruleset: oRuleset};

}, true);