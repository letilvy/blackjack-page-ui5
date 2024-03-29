//@ui5-bundle sap/ui/table/library-preload.support.js
/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/**
 * Adds support rules of the sap.ui.table library to the support infrastructure.
 */
sap.ui.predefine('sap/ui/table/library.support',[
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
/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/**
 * Helper functionality for table, list and tree controls for the Support Tool infrastructure.
 */
sap.ui.predefine('sap/ui/table/rules/TableHelper.support',["sap/ui/support/library", "sap/base/Log"],
	function(SupportLib, Log) {
	"use strict";

	// shortcuts
	var Audiences = SupportLib.Audiences, // Control, Internal, Application
		Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity;	// Hint, Warning, Error


	var TableSupportHelper = {

		DOCU_REF : "https://ui5.sap.com/",

		DEFAULT_RULE_DEF : {
			audiences: [Audiences.Application],
			categories: [Categories.Other],
			enabled: true,
			minversion: "1.38",
			maxversion: "-",
			title: "",
			description: "",
			resolution: "",
			resolutionurls: [],
			check: function(oIssueManager, oCoreFacade, oScope) {}
		},

		/**
		 * Normalizes the given rule definition.
		 * The rule definition object can/must have the following parameters:
		 *
		 * 		id:				ID of the rule, MANDATORY
		 * 		audiences:		[Audiences.Application, ...] - Choose one or several, Default "Application"
		 * 		categories:		[Categories.Accessibility, ...] - choose one or several, Default "Other" (TBD)
		 * 		enabled:		true/false - Default true
		 * 		minversion:		the minimum version required to run the rule - Default "1.38"
		 * 		maxversion:		the maximum version required to run the rule - Default "-"
		 * 		title:			user friendly title, MANDATORY
		 * 		description:	detailed description, MANDATORY
		 * 		resolution:		proposed resolution steps, MANDATORY
		 * 		resolutionurls: [{text: "Text to be displayed", href: "URL to public(!) docu"}] - list of useful URLs, Default []
		 * 		check:			function(oIssueManager, oCoreFacade, oScope) { ... } - Check function code, MANDATORY
		 *
		 * @param {object} oRuleDef The rule definition
		 * @returns {object} The normalized rule definition
		 */
		normalizeRule : function(oRuleDef) {
			return jQuery.extend({}, TableSupportHelper.DEFAULT_RULE_DEF, oRuleDef);
		},

		/**
		 * Normalizes the given rule definition and adds it to the given Ruleset.
		 *
		 * @see #normalizeRule
		 *
		 * @param {object} oRuleDef The rule definition
		 * @param {sap.ui.support.supportRules.RuleSet} oRuleset The ruleset
		 */
		addRuleToRuleset : function(oRuleDef, oRuleset) {
			oRuleDef = TableSupportHelper.normalizeRule(oRuleDef);
			var sResult = oRuleset.addRule(oRuleDef);
			if (sResult != "success") {
				Log.warning("Support Rule '" + oRuleDef.id + "' for library sap.ui.table not applied: " + sResult);
			}
		},

		/**
		 * Creates a documentation link description in the format as requested by the parameter resolutionurls of a rule.
		 * @param {string} sText 		The text of the docu link.
		 * @param {string} sRefSuffix 	The url suffix. It gets automatically prefixed by TableSupportHelper.DOCU_REF.
		 * @returns {object} Documentation link description
		 */
		createDocuRef : function(sText, sRefSuffix) {
			return {
				text: sText,
				href: TableSupportHelper.DOCU_REF + sRefSuffix
			};
		},

		/**
		 * Adds an issue with the given text, severity and context to the given issue manager.
		 * @param {sap.ui.support.IssueManager} oIssueManager The issue manager
		 * @param {string} sText 						The text of the issue.
		 * @param {sap.ui.support.Severity} [sSeverity] The severity of the issue, if nothing is given Warning is used.
		 * @param {string} [sControlId] 				The id of the control the issue is related to. If nothing is given the "global" context is used.
		 */
		reportIssue : function(oIssueManager, sText, sSeverity, sControlId) {
			oIssueManager.addIssue({
				severity: sSeverity || Severity.Medium,
				details: sText,
				context: {id: sControlId || "WEBPAGE"}
			});
		},

		/**
		 * Return all existing control instances of the given type.
		 * @param {object} oScope The scope as given in the rule check function.
		 * @param {boolean} bVisibleOnly Whether all existing controls or only the ones which currently have a DOM reference should be returned.
		 * @param {string} sType The type
		 * @returns {sap.ui.core.Element[]} All existing control instances
		 */
		find: function(oScope, bVisibleOnly, sType) {
			var mElements = oScope.getElements();
			var aResult = [];
			for (var n in mElements) {
				var oElement = mElements[n];
				if (oElement.isA(sType)) {
					if (bVisibleOnly && oElement.getDomRef() || !bVisibleOnly) {
						aResult.push(oElement);
					}
				}
			}
			return aResult;
		},

		/**
		 * Iterates over the available log entries.
		 *
		 * Both parameter functions gets a log entry object passed in with the following properties:
		 * <ul>
		 *    <li>{jQuery.sap.log.Level} oLogEntry.level One of the log levels FATAL, ERROR, WARNING, INFO, DEBUG, TRACE</li>
		 *    <li>{string} oLogEntry.message     The logged message</li>
		 *    <li>{string} oLogEntry.details     The optional details for the message</li>
		 *    <li>{string} oLogEntry.component   The optional log component under which the message was logged</li>
		 *    <li>{float}  oLogEntry.timestamp   The timestamp when the log entry was written</li>
		 *    <li>{object} oLogEntry.supportInfo The optional support info object</li>
		 * </ul>
		 *
		 * @param {function} fnFilter Filter function to filter out irrelevant log entries.
		 *                            If the function returns <code>true</code> the log entry is kept, otherwise it's filtered out.
		 * @param {string} fnCheck Check function to check the remaining log entries.
		 *                         If the function returns <code>true</code> the checking procedure is stopped,
		 *                         otherwise the next entry is passed for checking.
		 */
		checkLogEntries : function(fnFilter, fnCheck) {
			var aLog = Log.getLogEntries(); //oScope.getLoggedObjects(); /*getLoggedObjects returns only log entries with supportinfo*/
			var oLogEntry;
			for (var i = 0; i < aLog.length; i++) {
				oLogEntry = aLog[i];
				if (fnFilter(oLogEntry)) {
					if (fnCheck(oLogEntry)) {
						return;
					}
				}
			}
		}

	};



	return TableSupportHelper;

}, true);
//# sourceMappingURL=library-preload.support.js.map