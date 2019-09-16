/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
    'sap/ui/integration/designtime/controls/PropertyEditor',
    'sap/ui/base/BindingParser'
], function (
    PropertyEditor,
    BindingParser
) {
    "use strict";

    /**
     * @constructor
     * @private
     * @experimental
     */
    var StringEditor = PropertyEditor.extend("sap.ui.integration.designtime.controls.propertyEditors.StringEditor", {
        init: function() {
            this._oInput = new sap.m.Input({value: "{value}"});
            this._oInput.attachLiveChange(function(oEvent) {
                if (this._validate()) {
                    this.firePropertyChanged(this._oInput.getValue());
                }
            }.bind(this));
            this.addContent(this._oInput);
        },
        _validate: function(params) {
            var oValue = this._oInput.getValue();
            var bInvalidBindingString = false;
            try {
                BindingParser.complexParser(oValue);
            } catch (oError) {
                bInvalidBindingString = true;
            } finally {
                if (bInvalidBindingString) {
                    this._oInput.setValueState("Error");
                    this._oInput.setValueStateText(sap.ui.getCore().getLibraryResourceBundle("sap.ui.integration").getText("STRING_EDITOR.INVALID_BINDING"));
                    return false;
                } else {
                    this._oInput.setValueState("None");
                    return true;
                }
            }
        },
        renderer: PropertyEditor.getMetadata().getRenderer().render
    });

    return StringEditor;
});
