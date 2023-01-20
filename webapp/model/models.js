sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/base/util/ObjectPath"
], function (JSONModel, Device, ObjectPath) {
	"use strict";

	return {
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createFLPModel: function () {
			var fnGetuser = ObjectPath.get("sap.ushell.Container.getUser"),
				bIsShareInJamActive = fnGetuser ? fnGetuser().isJamActive() : false,
				oModel = new JSONModel({
					isShareInJamActive: bIsShareInJamActive
				});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		/** 
		 * Create search master fragment model
		 * @returns Object filter data model
		 */
		createFilterModel: function () {
			var oFilter = {
				SalesOrder: "",
				CustomerNo: "",
				DMSNo: "",
				InvoiceNo: "",
				SalesOrg: "",
				DistChan: "",
				Division: "",
				SelStatus: undefined,
				StartDate: null,
				EndDate: null
			};
			return new JSONModel(oFilter);
		}
	};
});