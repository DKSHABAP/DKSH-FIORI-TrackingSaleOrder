sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"../model/formatter",
	"sap/ui/core/format/DateFormat"
], function (BaseController, JSONModel, History, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, MessageToast, Fragment,
	formatter,
	DateFormat) {
	"use strict";
	return BaseController.extend("dksh.connectclient.tracksaleorder.controller.Master", {
		formatter: formatter,
		onInit: function () {

			// Start Modification STRY0017413 - Additional Filter Fields for Invoice Search
			var uiStateModel = new JSONModel();
			var uiStateData = {
				visible: false
			};
			uiStateModel.setData(uiStateData);
			this.getView().setModel(uiStateModel, "uiState");
			// End  Modification STRY0017413 - Additional Filter Fields for Invoice Search

			// Start Modification STRY0017627 - Additional Filter Material Group
			var uiMatGrpModel = new JSONModel();
			var uiMatGrpData = {
				visible: false
			};
			uiMatGrpModel.setData(uiMatGrpData);
			this.getView().setModel(uiMatGrpModel, "MatGrpVisible");
			// End Modification STRY0017627 - Additional Filter Material Group
		},

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameter("name") === "master") {
				if (sap.ui.Device.system.phone) {
					var mastModel = this.getView().byId("ID_MASTER_LIST").getModel("MasterListSet");
					if (mastModel !== undefined) {
						var data = mastModel.getData().results;
						if (data.length === 1) {
							var idList = this.getView().byId("ID_MASTER_LIST");
							idList.getItems()[0].setSelected(false);
						}
					}
				}
			}
		},

		//master data read
		readMasterListData: function (filterData, ind) {
			//need to remove code
			if (filterData === "") {
				var today = new Date();
				var startDate = formatter.DateConversion(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
				var endDate = formatter.DateConversion(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
				filterData = "$filter=CreatedDate le datetime'" + startDate + "' and CreatedDate ge datetime'" + endDate + "'";
				// filterData = "$filter=CreatedDate le datetime'" + "2021-08-15T00:00:00" + "' and CreatedDate ge datetime'" + "2020-01-08T00:00:00" +
				// 	"'";
			}

			var that = this;
			this.getView().byId("ID_SERCH_FLD").setValue("");
			var busyDialog = new sap.m.BusyDialog();
			// busyDialog.open();
			//read user with details
			var oUserDetailModel = new sap.ui.model.json.JSONModel();
			oUserDetailModel.loadData("/userapi/attributes", null, true);
			oUserDetailModel.attachRequestCompleted(function (oEvent) {
				var logUser = oEvent.getSource().getData().userId;
				//	var logUser = "P000024";
				// var sUrl = "/IDPService/service/scim/Users/" + logUser;
				// var oModel = new sap.ui.model.json.JSONModel();
				// oModel.loadData(sUrl, true, "GET", false, false);
				// oModel.attachRequestCompleted(function (data) {

				var oModel = new sap.ui.model.json.JSONModel();
				that.getView().setModel(oModel, "oModel");
				var busyDialog = new sap.m.BusyDialog();
				busyDialog.open();
				oModel.loadData("/DKSHJavaService/userDetails/findAllRightsForUserInDomain/" + logUser + "&cc", null, true);
				oModel.attachRequestCompleted(function (data) {

					if (oEvent.getParameter("success")) {
						var custAttribute = data.getSource().getData();

						if (custAttribute) {
							if (custAttribute.message) {
								that.allAccess = false;

								if (custAttribute.ATR01 !== null) {
									var salesOrg = custAttribute.ATR01;
								}
								if (custAttribute.ATR02 !== null) {
									var distrChannel = custAttribute.ATR02;
								}
								if (custAttribute.ATR03 !== null) {
									var division = custAttribute.ATR03;
								}
								if (custAttribute.ATR04 !== null) {
									var matGrp = custAttribute.ATR04;
								}
								if (custAttribute.ATR05 !== null) {
									var matGrp4 = custAttribute.ATR05;
								}
								if (custAttribute.ATR06 !== null) {
									var custCode = custAttribute.ATR06;
								}
								if (custAttribute.ATR07 !== null) {
									var material = custAttribute.ATR07;
								}
								if (ind || that.allAccess === false) {
									MessageToast.show(that.i18nModel.getProperty("NoDataAccess"));

								}
								return;
							} else {
								if (custAttribute.ATR01 !== null) {
									var salesOrg = custAttribute.ATR01;
								}
								if (custAttribute.ATR02 !== null) {
									var distrChannel = custAttribute.ATR02;
								}
								if (custAttribute.ATR03 !== null) {
									var division = custAttribute.ATR03;
								}
								if (custAttribute.ATR04 !== null) {
									var matGrp = custAttribute.ATR04;
								}
								if (custAttribute.ATR05 !== null) {
									var matGrp4 = custAttribute.ATR05;
								}
								if (custAttribute.ATR06 !== null) {
									var custCode = custAttribute.ATR06;
								}
								if (custAttribute.ATR07 !== null) {
									var material = custAttribute.ATR07;
								}
							}
							// }
							// }
							// var matGrp4 = custAttribute.attributes[5].value;
							// var matGrp = custAttribute.attributes[4].value;
							// var salesOrg = custAttribute.attributes[0].value;
							// var distrChannel = custAttribute.attributes[2].value;
							// var division = custAttribute.attributes[3].value;
							// var custCode = custAttribute.attributes[6].value;

							//for item level 
							that.ItemLevelAuthoCheck = [];
							that.ItemLevelAuthoCheck.push(matGrp);
							that.ItemLevelAuthoCheck.push(matGrp4);
							that.ItemLevelAuthoCheck.push(material);

							//for Customer 
							if (custCode !== undefined && custCode.trim() !== "" && custCode.trim() !== "*") {
								if (filterData !== "") {
									filterData = filterData + " and CustCodeAttribute eq '" + custCode + "'";

								} else {
									filterData = "CustCodeAttribute eq '" + custCode + "'";
								}
							}

							//for Sales Organization
							if (salesOrg !== undefined && salesOrg.trim() !== "" && salesOrg.trim() !== "*") {
								if (filterData !== "") {
									filterData = filterData + " and SalesOrgAttribute eq '" + salesOrg + "'";

								} else {
									filterData = "SalesOrgAttribute eq '" + salesOrg + "'";
								}
							}

							//for Distribution Channel
							if (distrChannel !== undefined && distrChannel.trim() !== "" && distrChannel.trim() !== "*") {
								if (filterData !== "") {
									filterData = filterData + " and DistChanlAttribute eq '" + distrChannel + "'";

								} else {
									filterData = "DistChanlAttribute eq '" + distrChannel + "'";
								}
							}

							//for division
							if (division !== undefined && division.trim() !== "" && division.trim() !== "*") {
								if (filterData !== "") {
									filterData = filterData + " and DivisionAttribution eq '" + division + "'";

								} else {
									filterData = "DivisionAttribution eq '" + division + "'";
								}
							}

							//for materialGrp
							if (matGrp !== undefined && matGrp.trim() !== "" && matGrp.trim() !== "*") {
								if (filterData !== "") {
									filterData = filterData + " and MaterialGrp eq '" + matGrp + "'";

								} else {
									filterData = "MaterialGrp eq '" + matGrp + "'";
								}
							}

							//for material
							if (material !== undefined && material.trim() !== "" && material.trim() !== "*") {
								if (filterData !== "") {
									filterData = filterData + " and MatCodeAttribute eq '" + material + "'";

								} else {
									filterData = "MatCodeAttribute eq '" + material + "'";
								}
							}

							//for materialGrp4
							if (matGrp4 !== undefined && matGrp4.trim() !== "" && matGrp4.trim() !== "*") {
								if (filterData !== "") {
									filterData = filterData + " and MaterialGrp4 eq '" + matGrp4 + "'";

								} else {
									filterData = "MaterialGrp4 eq '" + matGrp4 + "'";
								}
							}
							var url = encodeURI("/MasterDetailsSet");
							that.oModel.read(url, {
								async: true,
								urlParameters: filterData,
								success: function (oData, oResponse) {
									busyDialog.close();
									if (ind === "F") {
										that.searchMasterFrag.close();
									}

									for (var i = 0; i < oData.results.length; i++) {
										oData.results[i].Amount = parseFloat((oData.results[i].Amount).trim() ? oData.results[i].Amount : 0).toFixed(2);
										// var dateFormat = DateFormat.getDateInstance({
										// 	pattern: "dd.mm.yyyy, hh:mm:ss"
										// });
										// oData.results[i].CreatedDateTime = dateFormat.format(new Date(oData.results[i].CreatedTime.ms));
										var creatDate = oData.results[i].CreatedDate;
										var creatTime = new Date(oData.results[i].CreatedTime.ms);
										if (creatDate !== null) {
											oData.results[i].CreatedDateTime = new Date(creatDate.getFullYear(), creatDate.getMonth(), creatDate.getDate(),
												creatTime.getUTCHours(),
												creatTime.getUTCMinutes(), creatTime.getUTCSeconds());
										} else {
											oData.results[i].CreatedDateTime = null;
										}
										oData.results[i].CreatedDateTime = formatter.dateTimeFormat(oData.results[i].CreatedDateTime);
									}
									var masterModel = new sap.ui.model.json.JSONModel({
										results: oData.results
									});
									that.getView().byId("ID_MASTER_LIST").setModel(masterModel, "MasterListSet");
									var pageTitle = that.i18nModel.getProperty("trackingDetailsMastPageTitle");
									that.getView().byId("ID_MAST_PAGE").setTitle(pageTitle + " (" + oData.results.length + ")");
									that.getView().byId("ID_MAST_PAGE").addStyleClass("title sapMIBar-CTX sapMTitle");
									//for no Record found
									if (oData.results.length === 0 && !sap.ui.Device.system.phone) {
										var router = sap.ui.core.UIComponent.getRouterFor(that);
										router.navTo("notFound", true);
										return;
									}

									//default first record selected
									if (!sap.ui.Device.system.phone)
										that.handleFirstItemSetSelected();
								},
								error: function (error) {
									busyDialog.close();
									var errorMsg = "";
									if (error.statusCode === 504) {
										errorMsg = that.i18nModel.getProperty("connectionFailToFetchTheData");
										that.errorMsg(errorMsg);
									} else {
										errorMsg = JSON.parse(error.responseText);
										errorMsg = errorMsg.error.message.value;
										that.errorMsg(errorMsg);
									}
								}
							});

						} else {
							busyDialog.close();
						}
					} else {
						MessageToast.show(that.i18nModel.getProperty("NoDataAccess"));
					}
				});
				oModel.attachRequestFailed(function (error) {
					busyDialog.close();
					// that.errorMsg(that.i18nModel.getProperty("errorInRetrievingAllUsersDetails"));
					// that.handleBack();
				});

			});
			oUserDetailModel.attachRequestFailed(function (oEvent) {
				// busyDialog.close();
				sap.m.MessageBox.error(oEvent.getSource().getData().message);
			});
		},

		//	General Error Message Box
		errorMsg: function (errorMsg) {
			sap.m.MessageBox.show(
				errorMsg, {
					styleClass: 'sapUiSizeCompact',
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function (oAction) {}
				}
			);
		},

		//default first item selected
		handleFirstItemSetSelected: function (oEvent) {
			var idList = this.getView().byId("ID_MASTER_LIST");
			var selectedObj = idList.getItems()[0].getBindingContext("MasterListSet").getObject();
			idList.getItems()[0].setSelected(true);
			var ReqNo = idList.getItems()[0].getBindingContext("MasterListSet").getPath().split("/").pop();
			ReqNo = parseInt(ReqNo);
			selectedObj["MaterialGrp"] = this.ItemLevelAuthoCheck[0];
			selectedObj["MaterialGrp4"] = this.ItemLevelAuthoCheck[1];
			selectedObj["MatCodeAttribute"] = this.ItemLevelAuthoCheck[2];
			sap.ui.getCore().setModel(selectedObj, "MasterModelSelData");
			ReqNo = ReqNo + "@" + selectedObj.SalesNo;
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("object", {
				contextPath: ReqNo
			}, true);

		},

		//Called to handle master page item is press
		handleItemPressed: function (oEvent) {
			var selectedObj = oEvent.getParameter("listItem").getBindingContext("MasterListSet").getObject();
			var ReqNo = oEvent.getParameter("listItem").getBindingContext("MasterListSet").getPath().split("/").pop();
			ReqNo = parseInt(ReqNo);
			selectedObj["MaterialGrp"] = this.ItemLevelAuthoCheck[0];
			selectedObj["MaterialGrp4"] = this.ItemLevelAuthoCheck[1];
			selectedObj["MatCodeAttribute"] = this.ItemLevelAuthoCheck[2];
			sap.ui.getCore().setModel(selectedObj, "MasterModelSelData");
			ReqNo = ReqNo + "@" + selectedObj.SalesNo;
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("object", {
				contextPath: ReqNo
			}, true);

		},

		//	searching Values for Master List
		onSearchMasterList: function (oEvent) {
			var that = this;
			if (oEvent.getParameters().refreshButtonPressed) {
				var objeFilter = {
					SalesOrder: "",
					CustomerNo: "",
					SelStatus: undefined,
					StartDate: null,
					EndDate: null
				};

				if (this.searchMasterFrag) {
					var frgModel = new sap.ui.model.json.JSONModel(objeFilter);
					this.searchMasterFrag.setModel(frgModel);
				}
				var tmp = JSON.stringify(objeFilter);
				this.tempDataFragment = JSON.parse(tmp);
				this.readMasterListData("", "");
			} else {
				var value = oEvent.getParameters().query;
				var filters = [];
				var oFilter = new sap.ui.model.Filter([new sap.ui.model.Filter("CustId", sap.ui.model.FilterOperator.Contains, value),
					new sap.ui.model.Filter("SalesNo", sap.ui.model.FilterOperator.Contains, value),
					new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.Contains, value),
					new sap.ui.model.Filter("CustName", sap.ui.model.FilterOperator.Contains, value),
					new sap.ui.model.Filter("Amount", sap.ui.model.FilterOperator.Contains, value),
					new sap.ui.model.Filter("Currency", sap.ui.model.FilterOperator.Contains, value),
					new sap.ui.model.Filter("PONo", sap.ui.model.FilterOperator.Contains, value),
					new sap.ui.model.Filter("CreatedDateTime", sap.ui.model.FilterOperator.Contains, value)
				]);
				this.oSearchFilters = oFilter;
				var orFilters = [];
				if (this.oFilters && this.oFilters.length > 0) {
					orFilters = this.oFilters;
				}
				var orFilter = new sap.ui.model.Filter(orFilters, false);
				if (orFilters.length > 0) {
					var allFilters = new sap.ui.model.Filter([oFilter, orFilter], true);
					filters.push(allFilters);
				} else {
					filters.push(oFilter);
				}

				var oBinding = that.getView().byId("ID_MASTER_LIST").getBinding("items");
				oBinding.filter(filters);
				var pageT = that.i18nModel.getProperty("trackingDetailsMastPageTitle");
				that.getView().byId("ID_MAST_PAGE").setTitle(pageT + " (" + oBinding.getLength() + ")");
				that.getView().byId("ID_MAST_PAGE").addStyleClass("title sapMIBar-CTX sapMTitle");

				if (oBinding.getLength() == 0 && !sap.ui.Device.system.phone) {
					//no Data page
					var router = sap.ui.core.UIComponent.getRouterFor(this);
					router.navTo("notFound", true);
					return;
				} else if (value.trim() == "" && !sap.ui.Device.system.phone) {
					this.handleFirstItemSetSelected();
				} else if (oBinding.getLength() > 0 && !sap.ui.Device.system.phone) {
					var idList = that.getView().byId("ID_MASTER_LIST");
					var selectedObj = this.getView().byId("ID_MASTER_LIST").getItems()[0].getBindingContext("MasterListSet").getObject();
					idList.getItems()[0].setSelected(true);
					var reqNo = "0";
					reqNo = parseInt(reqNo);
					selectedObj["MaterialGrp"] = this.ItemLevelAuthoCheck[0];
					selectedObj["MaterialGrp4"] = this.ItemLevelAuthoCheck[1];
					selectedObj["MatCodeAttribute"] = this.ItemLevelAuthoCheck[2];
					sap.ui.getCore().setModel(selectedObj, "MasterModelSelData");
					reqNo = reqNo + "@" + selectedObj.SalesNo;
					var router1 = sap.ui.core.UIComponent.getRouterFor(this);
					router1.navTo("object", {
						contextPath: reqNo
					}, true);
				}
			}
		},

		//filter for View Table
		handlefilter: function (oEvent) {
			var that = this;
			var dataTemp = "";
			if (!this.searchMasterFrag) {
				this.searchMasterFrag = sap.ui.xmlfragment("dksh.connectclient.tracksaleorder.Fragments.SearchMaster", that);
				this.getView().addDependent(this.searchMasterFrag);
				var objeFilter = {
					SalesOrder: "",
					CustomerNo: "",
					// [+] Start Modification- STRY0015013
					DMSNo: "",
					InvoiceNo: "",
					// [+] End Modification- STRY0015013
					// [+] Start Modification- 	STRY0017413
					SalesOrg: "",
					DistChan: "",
					Division: "",
					// [+] Start Modification- 	STRY0017413
					SelStatus: undefined,
					StartDate: null,
					EndDate: null
				};
				dataTemp = objeFilter;

			} else {
				dataTemp = this.searchMasterFrag.getModel().getData();
			}
			var frgModel = new sap.ui.model.json.JSONModel(dataTemp);
			this.searchMasterFrag.setModel(frgModel);
			var tmp = JSON.stringify(dataTemp);
			this.tempDataFragment = JSON.parse(tmp);

			if (sap.ui.Device.system.desktop) {
				this.searchMasterFrag.setContentWidth("50%");
			} else {
				this.searchMasterFrag.setContentWidth("100%");
			}
			this.searchMasterFrag.open();
		},

		//read all master data 
		handleReadAllSOIntial: function () {
			var objeFilter = {
				SalesOrder: "",
				CustomerNo: "",
				// [+] Start Modification- STRY0015013
				DMSNo: "",
				InvoiceNo: "",
				// [+] End Modification- STRY0015013
				// [+] Start Modification- 	STRY0017413
				SalesOrg: "",
				DistChan: "",
				Division: "",
				// [+] Start Modification- 	STRY0017413
				SelStatus: undefined,
				StartDate: null,
				EndDate: null
			};
			var frgModel = new sap.ui.model.json.JSONModel(objeFilter);
			this.searchMasterFrag.setModel(frgModel);
			var tmp = JSON.stringify(objeFilter);
			this.tempDataFragment = JSON.parse(tmp);
			this.readMasterListData("", "F");
		},

		// //[+] Start Modification- STRY0015013
		// _validateInput: function (oInput) {
		// 	var sValueState = "None";
		// 	var bValidationError = false;
		// 	var oBinding = oInput.getBinding("value");

		// 	try {
		// 		oBinding.getType().validateValue(oInput.getValue());
		// 	} catch (oException) {
		// 		sValueState = "Error";
		// 		bValidationError = true;
		// 	}

		// 	oInput.setValueState(sValueState);

		// 	return bValidationError;
		// },
		// //  [+] End Modification- STRY0015013

		//on apply filter on master list
		handleOkReadSoFilter: function () {

			// // // [+] Start Modification- STRY0015013
			// // collect input controls
			// var oView = this.getView(),
			// 	aInputs = [
			// 		oView.byId("idDivision"),
			// 		oView.byId("idSalesOrg")
			// 		oView.byId("idDistChan")
			// 	],
			// 	bValidationError = false;

			// // Check that inputs are not empty.
			// // Validation does not happen during data binding as this is only triggered by user actions.
			// aInputs.forEach(function (oInput) {
			// 	bValidationError = this._validateInput(oInput) || bValidationError;
			// }, this);

			// //  [+] End Modification- STRY0015013

			var filterString = "";
			var selectObj = this.searchMasterFrag.getModel().getData();
			if (selectObj.SalesOrder !== "" && selectObj.SalesOrder.trim() !== "") {
				filterString = "SalesNo eq '" + selectObj.SalesOrder + "'";
			}

			//for Customer Number
			if (selectObj.CustomerNo !== "" && selectObj.CustomerNo.trim() !== "") {
				if (filterString !== "") {
					filterString = filterString + " and CustId eq '" + selectObj.CustomerNo + "'";
				} else {
					filterString = "CustId eq '" + selectObj.CustomerNo + "'";
				}
			}

			// [+] Start Modification- STRY0015013
			if (selectObj.DMSNo !== "" && selectObj.DMSNo.trim() !== "") {
				if (filterString !== "") {
					filterString = filterString + " and Dmsno eq '" + selectObj.DMSNo + "'";
				} else {
					filterString = "Dmsno eq '" + selectObj.DMSNo + "'";
				}

				if (selectObj.StartDate === "" || selectObj.StartDate === null) {
					var today = new Date();
					var endDate = formatter.DateConversion(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
					var startDate = formatter.DateConversion(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
					if (filterString !== "") {
						filterString = filterString + " and (CreatedDate le datetime'" + endDate + "' and CreatedDate ge datetime'" + startDate + "')";
					} else {
						filterString = "(CreatedDate le datetime'" + endDate + "' and CreatedDate ge datetime'" + startDate + "')";
					}
				}

			}

			if (selectObj.InvoiceNo !== "" && selectObj.InvoiceNo.trim() !== "") {

				if (filterString !== "") {
					filterString = filterString + " and Invno eq '" + selectObj.InvoiceNo + "'";
				} else {
					filterString = "Invno eq '" + selectObj.InvoiceNo + "'";
				}

				//	to push in date value for filter purpose
				if (selectObj.StartDate === "" || selectObj.StartDate === null) {
					var today = new Date();
					var endDate = formatter.DateConversion(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
					var startDate = formatter.DateConversion(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
					if (filterString !== "") {
						filterString = filterString + " and (CreatedDate le datetime'" + endDate + "' and CreatedDate ge datetime'" + startDate + "')";
					} else {
						filterString = "(CreatedDate le datetime'" + endDate + "' and CreatedDate ge datetime'" + startDate  + "')";
					}
				}

				if (selectObj.SalesOrg !== "" || selectObj.SalesOrg !== null) {
					filterString = filterString + " and SalesOrg eq '" + selectObj.SalesOrg + "'";
				} else {
					filterString = "SalesOrg eq '" + selectObj.SalesOrg + "'";

				}

				if (selectObj.DistChan !== "" || selectObj.DistChan !== null) {
					filterString = filterString + " and DistChan eq '" + selectObj.DistChan + "'";
				} else {
					filterString = "DistChan eq '" + selectObj.DistChan + "'";

				}

				if (selectObj.Division !== "" || selectObj.Division !== null) {
					filterString = filterString + " and Division eq '" + selectObj.Division + "'";
				} else {
					filterString = "Division eq '" + selectObj.Division + "'";

				}

				if ((selectObj.InvoiceNo !== "") && (selectObj.SalesOrg === "" ||
						selectObj.DistChan === "" ||
						selectObj.Division === "")) {
					var msg = this.i18nModel.getProperty("enterFilterSearch");
					sap.m.MessageToast.show(msg);
					return false;
				}

			}
			// [+] End Modification- STRY0015013

			// [+] Start Modification- STRY0017627
			//			PO Number
			if (selectObj.PONo !== "" && selectObj.PONo.trim() !== "") {
				if (filterString !== "") {
					filterString = filterString + " and PONo eq '" + selectObj.PONo + "'";
				} else {
					filterString = "PONo eq '" + selectObj.PONo + "'";
				}
				// Material Group
				if (selectObj.MaterialGrp !== "" && selectObj.MaterialGrp.trim() !== "") {
					if (filterString !== "") {
						filterString = filterString + " and MaterialGrp eq '" + selectObj.MaterialGrp + "'";
					} else {
						filterString = "MaterialGrp eq '" + selectObj.MaterialGrp + "'";
					}
				}
				//				push in date for faster filter 
				if (selectObj.StartDate === "" || selectObj.StartDate === null) {
					var today = new Date();
					var endDate = formatter.DateConversion(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
					var startDate = formatter.DateConversion(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
					if (filterString !== "") {
						filterString = filterString + " and (CreatedDate le datetime'" + endDate + "' and CreatedDate ge datetime'" + startDate + "')";
					} else {
						filterString = "(CreatedDate le datetime'" + startDate + "' and CreatedDate ge datetime'" + endDate + "')";
					}
				}

			}
			// [+] End Modification- STRY0017627

			//for Date Range
			if (selectObj.StartDate !== "" && selectObj.StartDate !== null) {
				var startDate = formatter.DateConversion(selectObj.StartDate);
				var endDate = formatter.DateConversion(selectObj.EndDate);
				if (filterString !== "") {
					filterString = filterString + " and (CreatedDate le datetime'" + endDate + "' and CreatedDate ge datetime'" + startDate + "')";
				} else {
					filterString = "(CreatedDate le datetime'" + endDate + "' and CreatedDate ge datetime'" + startDate + "')";
				}
			}

			//for Status
			if (selectObj.SelStatus !== undefined && selectObj.SelStatus.length > 0) {
				var value = selectObj.SelStatus;
				var tempStrStatus = "";
				if (filterString !== "") {
					for (var j = 0; j < value.length; j++) {
						if (j === value.length - 1)
							tempStrStatus = tempStrStatus + " Status eq '" + value[j] + "'";
						else
							tempStrStatus = tempStrStatus + " Status eq '" + value[j] + "' or ";
					}

					filterString = filterString + " and (" + tempStrStatus + ")";
				} else {
					for (var j = 0; j < value.length; j++) {
						if (j === value.length - 1)
							tempStrStatus = tempStrStatus + " Status eq '" + value[j] + "'";
						else
							tempStrStatus = tempStrStatus + " Status eq '" + value[j] + "' or ";
					}
					filterString = tempStrStatus;
				}
			}

			if (filterString !== "") {
				filterString = "$filter=" + filterString;
			}
			this.readMasterListData(filterString, "F");
		},

		//on cancel filter
		handleCancelMasterSearch: function () {
			this.tempDataFragment.StartDate = this.tempDataFragment.StartDate ? new Date(this.tempDataFragment.StartDate) : null;
			this.tempDataFragment.EndDate = this.tempDataFragment.EndDate ? new Date(this.tempDataFragment.EndDate) : null;
			var frgModel = new sap.ui.model.json.JSONModel(this.tempDataFragment);
			this.searchMasterFrag.setModel(frgModel);
			this.searchMasterFrag.close();
		},

		//on After Rendering
		onAfterRendering: function () {
			this.i18nModel = this.getView().getModel("i18n");
			this.oModel = this.getView().getModel("TrackingODataModel");
			this.readMasterListData("", "");
		},

		//on live Change Sales Order Change in Filter
		onLiveChangeSalesOrderFilter: function (oEvent) {
			oEvent.getSource().setValue(oEvent.getParameters().value.trim());
			oEvent.getSource().setTooltip(oEvent.getParameters().value.trim());
		},

		//on live Customer no live change
		onLiveChangeCustIdFilter: function (oEvent) {
			//	this.getView().byId("idSalesOrg").setVisible(true); 
			oEvent.getSource().setValue(oEvent.getParameters().value.trim());
			oEvent.getSource().setTooltip(oEvent.getParameters().value.trim());
		},

		onLiveChangeSalesOrgFilter: function (oEvent) {
			oEvent.getSource().setValue(oEvent.getParameters().value.trim());
			oEvent.getSource().setTooltip(oEvent.getParameters().value.trim());
		},

		onLiveChangeDMSNoFilter: function (oEvent) {
			oEvent.getSource().setValue(oEvent.getParameters().value.trim());
			oEvent.getSource().setTooltip(oEvent.getParameters().value.trim());
		},

		onLiveChangeInvoiceNoFilter: function (oEvent) {
			var uiStateModel = this.getView().getModel("uiState");
			var uiStateData = uiStateModel.getData();
			uiStateData.visible = true;
			uiStateModel.setData(uiStateData);

			oEvent.getSource().setValue(oEvent.getParameters().value.trim());
			oEvent.getSource().setTooltip(oEvent.getParameters().value.trim());
		},

		onLiveChangePONoFilter: function (oEvent) {
			var uiMatGrpModel = this.getView().getModel("MatGrpVisible");
			var uiMatGrpData = uiMatGrpModel.getData();
			uiMatGrpData.visible = true;
			uiMatGrpModel.setData(uiMatGrpData);

			oEvent.getSource().setValue(oEvent.getParameters().value.trim());
			oEvent.getSource().setTooltip(oEvent.getParameters().value.trim());
		},

		//back to launchpad
		handleBack: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "",
					action: ""
				}
			});
		},

		//date range Master Filter
		onChangeDateRange: function (oEvent) {
			if (!oEvent.mParameters.valid) {
				var modelData = this.searchMasterFrag.getModel().getData();
				modelData.StartDate = null;
				modelData.EndDate = null;
				this.searchMasterFrag.getModel().refresh();
				oEvent.getSource().setValue("");
				var msg = this.i18nModel.getProperty("enterValidDateRange");
				sap.m.MessageToast.show(msg);
			}
		}

	});

});