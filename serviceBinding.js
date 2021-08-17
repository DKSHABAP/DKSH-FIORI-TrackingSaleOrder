function initModel() {
	var sUrl = "/DKSHODataService/sap/opu/odata/sap/ZDKSH_TRACK_SALES_ORDER_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}