sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/m/library",
	"sap/ui/core/format/DateFormat"
], function (BaseController, JSONModel, formatter, mobileLibrary, DateFormat) {
	"use strict";
	return BaseController.extend("dksh.connectclient.tracksaleorder.controller.Detail", {

		formatter: formatter,
		//on init
		onInit: function () {
			this.countBusyDialog = 0;
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
		},

		//handle route match
		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameter("name") === "object") {
				var masterModel = sap.ui.getCore().getModel("MasterModelSelData");
				if (masterModel === undefined) {
					var router = sap.ui.core.UIComponent.getRouterFor(this);
					router.navTo("master", true);
					return;
				}
				// var pageTitle = this.i18nModel.getProperty("trackingDetailsDetPageTitle");
				// this.getView().byId("detailPage").setTitle(pageTitle);
				var hdrModel = new sap.ui.model.json.JSONModel(masterModel);
				this.getView().byId("ID_OBJ_HDR").setModel(hdrModel);
				this.oModel = this.getView().getModel("TrackingODataModel");
				this.detailPageListData();
			}
		},

		//Read Details Page Data
		detailPageListData: function () {
			var masterModel = sap.ui.getCore().getModel("MasterModelSelData");
			var lang = "";
			if (sap.ushell.Container) {
				lang = sap.ui.getCore().getConfiguration().getLanguage();
			} else {
				lang = "EN";
			}
			var url = "$filter=Language eq '" + lang.toUpperCase() + "' and SalesNo eq '" + masterModel.SalesNo + "'";
			if (masterModel.MaterialGrp.trim() !== "*" && masterModel.MaterialGrp.trim() !== "") {
				url = url + " and MaterialGrp eq '" + masterModel.MaterialGrp + "'";
			}
			if (masterModel.MaterialGrp4.trim() !== "*" && masterModel.MaterialGrp4.trim() !== "") {
				url = url + " and MaterialGrp4 eq '" + masterModel.MaterialGrp4 + "'";
			}
			if (masterModel.MatCodeAttribute.trim() !== "*" && masterModel.MatCodeAttribute.trim() !== "") {
				url = url + " and MatCodeAttribute eq '" + masterModel.MatCodeAttribute + "'";
			}
			// selectedObj["MatCodeAttribute"] = this.ItemLevelAuthoCheck[2];
			url = url + "&$expand=NAV_MASTTOHEADER,NAV_MASTTOITEM";

			var that = this;
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			var url1 = encodeURI("/MasterDetailsSet");
			this.oModel.read(url1, {
				async: true,
				urlParameters: url,
				success: function (oData, oResponse) {
					busyDialog.close();
					//read tracking Details
					that.readTrackingDetailsTabData(oData.results[0]);

					//for Document
					var DocList = [];
					var dateTimeDilOrd = "";
					var dateTimeInvNo = "";
					var dateTimeShipNo = "";
					var dateTimePOdNo = "";
					var delNoTemp = "";
					var invNoTemp = "";
					var shipNoTemp = "";
					var podNoTemp = "";
					var pointingObj = "";
					var dateTimeRejPOdNo = "";
					for (var r = 0; r < oData.results[0].NAV_MASTTOITEM.results.length; r++) {
						pointingObj = oData.results[0].NAV_MASTTOITEM.results[r];
						if (pointingObj.Delivery === "" && pointingObj.BillingDoc === "" && pointingObj.ShipNo === "" && pointingObj.PodRejCode ===
							"") {

						} else {
							dateTimeDilOrd = formatter.stringDateTimeConvert(pointingObj.DoDate, pointingObj.DoTime);
							dateTimeInvNo = formatter.stringDateTimeConvert(pointingObj.InvCreDate, pointingObj.InvCreTime);
							dateTimeShipNo = formatter.stringDateTimeConvert(pointingObj.ShipCreDate, pointingObj.ShipCreTime);
							dateTimePOdNo = formatter.stringDateTimeConvert(pointingObj.PodDate, pointingObj.PodTime);
							dateTimeRejPOdNo = formatter.stringDateTimeConvert(pointingObj.PodRejDate, pointingObj.PodRejTime);
							delNoTemp = pointingObj.Delivery + (pointingObj.Delivery !== "" && dateTimeDilOrd !== "" ? ", " + dateTimeDilOrd :
								dateTimeDilOrd);
							invNoTemp = pointingObj.BillingDoc + (pointingObj.BillingDoc !== "" && dateTimeInvNo !== "" ? ", " + dateTimeInvNo :
								dateTimeInvNo);
							shipNoTemp = pointingObj.ShipNo + (pointingObj.ShipNo !== "" && dateTimeShipNo !== "" ? ", " + dateTimeShipNo :
								dateTimeShipNo);
							// podNoTemp = pointingObj.PodRejCode + (pointingObj.PodRejCode !== "" && dateTimePOdNo !== "" ? ", " + dateTimePOdNo :
							// 	dateTimePOdNo);
							if (pointingObj.PodRejDate === "" && dateTimePOdNo === "") {
								podNoTemp = "";
							} else if (pointingObj.PodRejDate !== "" && dateTimePOdNo === "") {
								// [+] Begin Modification - STRY0013561 POD Reject Reason
								if (pointingObj.PodrejRsn !== "") {
									podNoTemp = pointingObj.PodrejRsn + " " + dateTimeRejPOdNo;
								} else {
									podNoTemp = "Rejected on:" + " " + dateTimeRejPOdNo;
								}
								
								// [+] End Modification - STRY0013561 POD Reject Reason
							} else if (dateTimePOdNo !== "" && pointingObj.PodRejDate === "") {
								podNoTemp = "Accepted on:" + " " + dateTimePOdNo;
							}
							DocList.push({
								DeliveryNo: pointingObj.Delivery,
								BillingDocNo: pointingObj.BillingDoc,
								ShipNo: pointingObj.ShipNo,
								PodRejCode: pointingObj.PodRejDate,
								DeliveryBoth: delNoTemp,
								BillingDocBoth: invNoTemp,
								ShipNoBoth: shipNoTemp,
								PodRejCodeBoth: podNoTemp
							});
						}
					}

					//delete Deplicate
					var arrAfterRemoveDup = [];
					var countdup = 0;
					var countDupBillingNo = 0;
					var countDupShipNo = 0;
					var countDupPODNo = 0;
					for (var h = 0; h < DocList.length; h++) {
						countdup = 0;
						countDupBillingNo = 0;
						countDupShipNo = 0;
						countDupPODNo = 0;
						if (arrAfterRemoveDup.length > 0) {
							for (var b = 0; b < arrAfterRemoveDup.length; b++) {
								if (DocList[h].DeliveryNo !== "" && DocList[h].DeliveryNo === arrAfterRemoveDup[b].DeliveryNo) {
									countdup++;

									//for Billing No
									if (DocList[h].BillingDocNo !== "" && DocList[h].BillingDocNo === arrAfterRemoveDup[b].BillingDocNo) {
										countDupBillingNo++;
										//for shipment No
										if (DocList[h].ShipNo !== "" && DocList[h].ShipNo === arrAfterRemoveDup[b].ShipNo) {
											countDupShipNo++;

											//for POD No
											if (DocList[h].PodRejCode !== "" && DocList[h].PodRejCode === arrAfterRemoveDup[b].PodRejCode) {
												countDupPODNo++;
											}
										}
									}

								}

							}
							//if new delivery number
							if (countdup === 0) {
								DocList[h].DeliveryNoTemp = DocList[h].DeliveryNo;
								DocList[h].BillingDocNoTemp = DocList[h].BillingDocNo;
								DocList[h].ShipNoTemp = DocList[h].ShipNo;
								DocList[h].PodRejCodeTemp = DocList[h].PodRejCode;
								arrAfterRemoveDup.push(DocList[h]);
							} else {
								DocList[h].DeliveryNoTemp = "";
								//for Billing
								if (countDupBillingNo > 0) {
									DocList[h].BillingDocNoTemp = "";
								} else {
									DocList[h].BillingDocNoTemp = DocList[h].BillingDocNo;
								}

								//for Shipment
								if (countDupShipNo > 0) {
									DocList[h].ShipNoTemp = "";
								} else {
									DocList[h].ShipNoTemp = DocList[h].ShipNo;
								}

								//for POD
								if (countDupPODNo > 0) {
									DocList[h].PodRejCodeTemp = "";
								} else {
									DocList[h].PodRejCodeTemp = DocList[h].PodRejCode;
								}

								arrAfterRemoveDup.push(DocList[h]);
							}
						} else {
							//for first item

							DocList[h].DeliveryNoTemp = DocList[h].DeliveryNo;
							DocList[h].BillingDocNoTemp = DocList[h].BillingDocNo;
							DocList[h].ShipNoTemp = DocList[h].ShipNo;
							DocList[h].PodRejCodeTemp = DocList[h].PodRejCode;
							arrAfterRemoveDup.push(DocList[h]);
						}

					}

					var finalDocList = [];
					var countState = 0;
					var state = "None";
					for (var s = 0; s < DocList.length; s++) {
						if (DocList[s].DeliveryNoTemp === "" && DocList[s].BillingDocNoTemp === "" && DocList[s].ShipNoTemp === "" && DocList[s].PodRejCodeTemp ===
							"") {
							//finalDocList.push(DocList[s]);
						} else {
							if (DocList[s].DeliveryNoTemp !== "") {
								countState++;
							}

							if (countState % 4 === 1) {
								state = "Information";
							} else if (countState % 4 === 2) {
								state = "Warning";
							} else if (countState % 4 === 3) {
								state = "Error";
							} else if (countState % 4 === 0) {
								state = "None";
							}
							DocList[s].State = state;
							finalDocList.push(DocList[s]);
						}
					}
					///end delete Duplicate
					var docModel = new sap.ui.model.json.JSONModel({
						results: finalDocList
					});
					that.getView().byId("ID_TREE2").setModel(docModel, "DocumListSet");
					//	that.getView().byId("ID_TREE").setVisible(false);

					//order summary
					var ordQty = 0;
					var totalFOCQty = 0;
					var SOGross = 0;
					var SONv2 = 0;
					var TaxAmount = 0;
					var lengthOfTotalItems = 0;
					// [+] Start - STRY0012251: Blur Out Summary
					//var lastIdx = 0;
					var blurFlag = "";
					// [+] End   - STRY0012251: Blur Out Summary

					if (oData.results[0].NAV_MASTTOITEM.results !== undefined) {
						lengthOfTotalItems = oData.results[0].NAV_MASTTOITEM.results.length;
						//lastIdx = lengthOfTotalItems - 1;
						for (var i = 0; i < oData.results[0].NAV_MASTTOITEM.results.length; i++) {
							var currObj = oData.results[0].NAV_MASTTOITEM.results[i];
							if (currObj.ItemCategory === "ZFOC" || currObj.ItemCategory === "ZKRC" || currObj.ItemCategory === "ZKRF" || currObj.ItemCategory ===
								"ZPNT" || currObj.ItemCategory === "ZRCI" || currObj.ItemCategory === "ZRFU" || currObj.ItemCategory === "ZRTU" || currObj.ItemCategory ===
								"ZSAM" || currObj.ItemCategory === "ZTKC" || currObj.ItemCategory === "ZTKD" || currObj.ItemCategory === "ZTRD") {
								totalFOCQty = totalFOCQty + parseFloat(currObj.OrderQty ? currObj.OrderQty.replace(",", "") : "0");
							} else {
								ordQty = ordQty + parseFloat(currObj.OrderQty ? currObj.OrderQty.replace(",", "") : "0");
							}
							SOGross = SOGross + parseFloat(currObj.SOGross ? currObj.SOGross.replace(",", "") : "0");
							SONv2 = SONv2 + parseFloat(currObj.SONv2 ? currObj.SONv2.replace(",", "") : "0");
							TaxAmount = TaxAmount + parseFloat(currObj.TaxAmount ? currObj.TaxAmount.replace(",", "") : "0");
							// [+] Start - STRY0012251: Blur Out Summary
							if (currObj.Blur === "B") {
								blurFlag = "B";
							}
							// [+] End - STRY0012251: Blur Out Summary
						}
					}

					var SoNo = "";
					var PONo = "";
					var PayTerm = "";
					var PayTermDesc = "";
					var Currency = "";
					var DelAddress = "";
					if (oData.results[0].NAV_MASTTOHEADER.results !== undefined) {
						SoNo = oData.results[0].NAV_MASTTOHEADER.results[0].SalesNo;
						PONo = oData.results[0].NAV_MASTTOHEADER.results[0].PONo;
						PayTerm = oData.results[0].NAV_MASTTOHEADER.results[0].PayTerm;
						PayTermDesc = oData.results[0].NAV_MASTTOHEADER.results[0].PayTermDesc;
						Currency = oData.results[0].NAV_MASTTOHEADER.results[0].Currency;
						DelAddress = oData.results[0].NAV_MASTTOHEADER.results[0].DelAddress;
					}

					var objOrdSummary = {
						"SalesNo": SoNo,
						"PONo": PONo,
						"PayTerm": PayTerm,
						"PayTermDesc": PayTermDesc,
						"OrderQty": ordQty.toFixed(3),
						"TotalFOCQty": totalFOCQty.toFixed(3),
						"SOGross": SOGross.toFixed(2),
						"TotDiscount": (SOGross - SONv2).toFixed(2),
						"NetAmt": SONv2.toFixed(2),
						"TaxAmount": TaxAmount.toFixed(2),
						"OrderTotal": (SONv2 + TaxAmount).toFixed(2),
						"Currency": Currency,
						"Remarks": "",
						"DelAddress": DelAddress,
						// // [+] Start - STRY0012251: Blur Out Summary
						"Blur": blurFlag
							// // [+] End - STRY0012251: Blur Out Summary
					};

					var summModel = new sap.ui.model.json.JSONModel(objOrdSummary);
					that.getView().byId("ID_SIM_SUMM_ORD").setModel(summModel);

					///Order List
					var orderList = [];
					if (oData.results[0].NAV_MASTTOITEM.results !== undefined) {
						for (var i = 0; i < oData.results[0].NAV_MASTTOITEM.results.length; i++) {
							var currObj = oData.results[0].NAV_MASTTOITEM.results[i];
							orderList.push({
								"Blur": (currObj.Blur).toString(),
								"Expanded": false,
								"RejCode": currObj.RejDesc.trim() !== "" ? currObj.RejDesc : "",
								"RejDesc": currObj.ItemStatDesc,
								"ItemCategoryDesc": currObj.ItemCategoryDesc,
								"ItemDesc": currObj.Description,
								"Material": currObj.Material,
								"SalesUom": currObj.SalesUom,
								"ItemCategory": currObj.ItemCategory,
								"SOGross": (parseFloat(currObj.SOGross ? currObj.SOGross.replace(",", "") : "0")).toFixed(2),
								"Discount": (parseFloat(currObj.SOGross ? currObj.SOGross.replace(",", "") : "0") - parseFloat(currObj.SONv2 ? currObj.SONv2
									.replace(",", "") : "0")).toFixed(2),
								"TaxAmount": (parseFloat(currObj.TaxAmount ? currObj.TaxAmount.replace(",", "") : "0")).toFixed(2),
								"SONv2": (parseFloat(currObj.SONv2 ? currObj.SONv2.replace(",", "") : "0")).toFixed(2),
								"OrderQty": (parseFloat(currObj.OrderQty ? currObj.OrderQty.replace(",", "") : "0")).toFixed(3),
								"SubTotal": SONv2.toFixed(2),
								//header currency
								"Currency": Currency,
								"UnitPrice": (parseFloat(currObj.SOGross ? currObj.SOGross.replace(",", "") : "0") / parseFloat(currObj.OrderQty ?
									currObj
									.OrderQty.replace(",", "") : "1")).toFixed(2)
							});
						}
					}
					var orderModel = new sap.ui.model.json.JSONModel({
						"results": orderList
					});
					that.getView().byId("ID_VBOX_ORD_LIST").setModel(orderModel, "OrderListSet");

					//order List Header set
					var hdrOrdList = new sap.ui.model.json.JSONModel({
						"SubTotal": SONv2.toFixed(2),
						"Currency": Currency,
						"TotalItms": lengthOfTotalItems
					});
					that.getView().setModel(hdrOrdList, "hdrOrdListSet");

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
		},

		//on Click Toggle Button for full screen
		onFullscreen: function (oEvent) {
			var spltApp = this.getView().getParent().getParent();
			if (oEvent.getParameter("pressed")) {
				spltApp.setMode(sap.m.SplitAppMode.HideMode);
				var fullScreenOn = this.i18nModel.getProperty("fullscreenOnText");
				sap.m.MessageToast.show(fullScreenOn);

			} else {
				spltApp.setMode(sap.m.SplitAppMode.ShowHideMode);
				var fullScreenOff = this.i18nModel.getProperty("fullscreenOff");
				sap.m.MessageToast.show(fullScreenOff);
			}
		},

		//on press back to master page 
		onNavBackMaster: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("master", true);
		},

		//on After Rendering
		onAfterRendering: function () {
			this.i18nModel = this.getView().getModel("i18n");
			this.getView().byId("idTimeline").setVisible(false);
			this.getView().byId("idTimeline").setVisible(true);
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

		//icon tab selection change
		handleIconTabSelect: function (oEvent) {
			var key = oEvent.getParameters().selectedKey;
			if (key === "OrderListKey" && this.countBusyDialog === 0) {
				this.countBusyDialog++;
				var busyDialog = new sap.m.BusyDialog();
				busyDialog.open();
				jQuery.sap.delayedCall(1000, this, function () {
					busyDialog.close();
				});
			}
		},

		//read Tracking Details Tab Data
		readTrackingDetailsTabData: function (OData) {
			var that = this;

			//for ordering
			var OrderingPoDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOHEADER.results[0].PODate, "000000");
			var finalOrderingPoDate = "";
			var OrdPoDate = "";
			if (OrderingPoDate !== "" && OrderingPoDate !== undefined && OrderingPoDate !== null) {
				finalOrderingPoDate = OrderingPoDate;
				OrdPoDate = "PO Date: " + finalOrderingPoDate;
			}

			var OrderingSoDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOHEADER.results[0].SOCreDate, OData.NAV_MASTTOHEADER.results[0]
				.SOCreTime);
			var finalOrderingSoDate = "";
			if (OrderingSoDate !== "" && OrderingSoDate !== undefined && OrderingSoDate !== null) {
				finalOrderingSoDate = (OrdPoDate !== "" ? "\n" : "") + ("SO Date: " + OrderingSoDate);
			}

			//	for ordering
			var deliverySDBlockDate = "";
			var finalOrdering = "";
			var deliveryDoDateTemp = "";
			var finalValueArr = [{
				"SDBlockDate": "",
				"SDBlockTime": "",
				"SDReleaseDate": "",
				"SDReleaseTime": "",
				"DODate": "",
				"DOTime": "",
				"PGIDate": "",
				"PGITime": "",
				"InvoiceDate": "",
				"InvoiceTime": "",
				"DispatchDate": "",
				"DispatchTime": "",
				"ShipmentDate": "",
				"ShipmentTime": "",
				"CustomerReceiptDate": "",
				"CustomerReceiptTime": "",
				"CustomerRejectDate": "",
				"CustomerRejectTime": ""
			}];

			// [+] Start - STRY0012250: Add ETA Status
			this.oDataTMSService = [];
			this.initFinalOrderingDil = "";
			this.etaDate = "";
			// [+] End - STRY0012250: Add ETA Status
			if (OData.NAV_MASTTOITEM.results !== undefined) {

				for (var i = 0; i < OData.NAV_MASTTOITEM.results.length; i++) {
					deliveryDoDateTemp = OData.NAV_MASTTOITEM.results[i].Delivery;

					//for SD Block Date & Time
					// var deliverySDBlockDate = this.checkDateandTime(OData.NAV_MASTTOITEM.results[i].ShedLineDelBDate, OData.NAV_MASTTOITEM.results[
					// 	i].ShedLinedelReDate);
					if (OData.NAV_MASTTOITEM.results[i].ShedLineDelBDate !== "") {
						if (finalValueArr[0].SDBlockDate === "") {
							finalValueArr[0].SDBlockDate = parseInt(OData.NAV_MASTTOITEM.results[i].ShedLineDelBDate);
							finalValueArr[0].SDBlockTime = parseInt(OData.NAV_MASTTOITEM.results[i].ShedLinedelReDate);
						} else {
							var maxVal = Math.max(finalValueArr[0].SDBlockDate, parseInt(OData.NAV_MASTTOITEM.results[i].ShedLineDelBDate));
							if (maxVal !== finalValueArr[0].SDBlockDate) {
								finalValueArr[0].SDBlockDate = parseInt(OData.NAV_MASTTOITEM.results[i].ShedLineDelBDate);
								finalValueArr[0].SDBlockTime = parseInt(OData.NAV_MASTTOITEM.results[i].ShedLinedelReDate);
							} else if (maxVal === parseInt(OData.NAV_MASTTOITEM.results[i].ShedLineDelBDate)) {
								var maxTime = Math.max(finalValueArr[0].SDBlockTime, parseInt(OData.NAV_MASTTOITEM.results[i].ShedLinedelReDate));
								if (maxTime !== finalValueArr[0].SDBlockTime) {
									finalValueArr[0].SDBlockTime = parseInt(OData.NAV_MASTTOITEM.results[i].ShedLinedelReDate);
								}
							}
						}
					}

					// if (finalValueArr[0].SDBlockTime === "") {
					// 	;
					// } else {
					// 	finalValueArr[0].SDBlockTime = Math.max(finalValueArr[0].SDBlockTime, parseInt(OData.NAV_MASTTOITEM.results[i].ShedLinedelReDate));
					// }
					// }

					//for SD Release Date & Time
					// var deliverySDReleaseDate = this.checkDateandTime(OData.NAV_MASTTOITEM.results[i].ShedLinedelRelDate, OData.NAV_MASTTOITEM
					// 	.results[i].ShedLineRelTime);
					// if (deliverySDReleaseDate !== "" && deliverySDReleaseDate !== undefined && deliverySDReleaseDate !== null) {
					if (OData.NAV_MASTTOITEM.results[i].ShedLinedelRelDate !== "") {
						if (finalValueArr[0].SDReleaseDate === "") {
							finalValueArr[0].SDReleaseDate = parseInt(OData.NAV_MASTTOITEM.results[i].ShedLinedelRelDate);
							finalValueArr[0].SDReleaseTime = OData.NAV_MASTTOITEM.results[i].ShedLineRelTime;
							//parseInt(OData.NAV_MASTTOITEM.results[i].ShedLineRelTime);
						} else {
							var maxVal = Math.max(finalValueArr[0].SDReleaseDate, parseInt(OData.NAV_MASTTOITEM.results[i].ShedLinedelRelDate));
							if (maxVal !== finalValueArr[0].SDReleaseDate) {
								finalValueArr[0].SDReleaseDate = parseInt(OData.NAV_MASTTOITEM.results[i].ShedLinedelRelDate);
								finalValueArr[0].SDReleaseTime = OData.NAV_MASTTOITEM.results[i].ShedLineRelTime;
								//parseInt(OData.NAV_MASTTOITEM.results[i].ShedLineRelTime);
							} else if (maxVal === parseInt(OData.NAV_MASTTOITEM.results[i].ShedLinedelRelDate)) {
								var maxTime = Math.max(finalValueArr[0].SDReleaseTime, parseInt(OData.NAV_MASTTOITEM.results[i].ShedLineRelTime));
								if (maxTime !== finalValueArr[0].SDReleaseTime) {
									finalValueArr[0].SDReleaseTime = OData.NAV_MASTTOITEM.results[i].ShedLineRelTime;
									//parseInt(OData.NAV_MASTTOITEM.results[i].ShedLineRelTime);
								}
							}
						}
					}
					// if (OData.NAV_MASTTOITEM.results[i].ShedLineRelTime !== "") {
					// 	else {
					// 		finalValueArr[0].SDReleaseTime = Math.max(finalValueArr[0].SDReleaseTime, parseInt(OData.NAV_MASTTOITEM.results[i].ShedLineRelTime));
					// 	}
					// }
					// }

					//DO Date
					// var deliveryDoDate = this.checkDateandTime(OData.NAV_MASTTOITEM.results[i].DoDate, OData.NAV_MASTTOITEM.results[i].DoTime);
					// if (deliveryDoDate !== "" && deliveryDoDate !== undefined && deliveryDoDate !== null) {
					if (OData.NAV_MASTTOITEM.results[i].DoDate !== "") {
						if (finalValueArr[0].DODate === "") {
							finalValueArr[0].DODate = parseInt(OData.NAV_MASTTOITEM.results[i].DoDate);
							finalValueArr[0].DOTime = OData.NAV_MASTTOITEM.results[i].DoTime;
							//parseInt(OData.NAV_MASTTOITEM.results[i].DoTime);
						} else {
							var maxVal = Math.max(finalValueArr[0].DODate, parseInt(OData.NAV_MASTTOITEM.results[i].DoDate));
							if (maxVal !== finalValueArr[0].DODate) {
								finalValueArr[0].DODate = parseInt(OData.NAV_MASTTOITEM.results[i].DoDate);
								finalValueArr[0].DOTime = OData.NAV_MASTTOITEM.results[i].DoTime;
								//parseInt(OData.NAV_MASTTOITEM.results[i].DoTime);
							} else if (maxVal === parseInt(OData.NAV_MASTTOITEM.results[i].DoDate)) {
								var maxTime = Math.max(finalValueArr[0].DOTime, parseInt(OData.NAV_MASTTOITEM.results[i].DoTime));
								if (maxTime !== finalValueArr[0].DOTime) {
									finalValueArr[0].DOTime = OData.NAV_MASTTOITEM.results[i].DoTime;
									//parseInt(OData.NAV_MASTTOITEM.results[i].DoTime);
								}
							}
						}
					}
					// if (OData.NAV_MASTTOITEM.results[i].DoTime !== "") {
					// 	else {
					// 		finalValueArr[0].DOTime = Math.max(finalValueArr[0].DOTime, parseInt(OData.NAV_MASTTOITEM.results[i].DoTime));
					// 	}
					// }
					// }

					//PGI Date
					// var deliveryPGIDate = this.checkDateandTime(OData.NAV_MASTTOITEM.results[i].PgiDate, OData.NAV_MASTTOITEM.results[i].PgiTime);
					// if (deliveryPGIDate !== "" && deliveryPGIDate !== undefined && deliveryPGIDate !== null) {
					if (OData.NAV_MASTTOITEM.results[i].PgiDate !== "") {
						if (finalValueArr[0].PGIDate === "") {
							finalValueArr[0].PGIDate = parseInt(OData.NAV_MASTTOITEM.results[i].PgiDate);
							finalValueArr[0].PGITime = OData.NAV_MASTTOITEM.results[i].PgiTime;
							//parseInt(OData.NAV_MASTTOITEM.results[i].PgiTime);
						} else {
							var maxVal = Math.max(finalValueArr[0].PGIDate, parseInt(OData.NAV_MASTTOITEM.results[i].PgiDate));
							if (maxVal !== finalValueArr[0].PGIDate) {
								finalValueArr[0].PGIDate = parseInt(OData.NAV_MASTTOITEM.results[i].PgiDate);
								finalValueArr[0].PGITime = OData.NAV_MASTTOITEM.results[i].PgiTime;
								//parseInt(OData.NAV_MASTTOITEM.results[i].PgiTime);
							} else if (maxVal === parseInt(OData.NAV_MASTTOITEM.results[i].PgiDate)) {
								var maxTime = Math.max(finalValueArr[0].PGITime, parseInt(OData.NAV_MASTTOITEM.results[i].PgiTime));
								if (maxTime !== finalValueArr[0].PGITime) {
									finalValueArr[0].PGITime = OData.NAV_MASTTOITEM.results[i].PgiTime;
									//parseInt(OData.NAV_MASTTOITEM.results[i].PgiTime);
								}
							}
						}
					}
					// if (OData.NAV_MASTTOITEM.results[i].PgiTime !== "") {
					// 	if (finalValueArr[0].PGITime === "") {
					// 		finalValueArr[0].PGITime = parseInt(OData.NAV_MASTTOITEM.results[i].PgiTime);
					// 	} else {
					// 		finalValueArr[0].PGITime = Math.max(finalValueArr[0].PGITime, parseInt(OData.NAV_MASTTOITEM.results[i].PgiTime));
					// 	}
					// }
					// }

					//Invoice Date
					// var deliveryInvceDate = this.checkDateandTime(OData.NAV_MASTTOITEM.results[i].InvCreDate, OData.NAV_MASTTOITEM.results[
					// 		i]
					// 	.InvCreTime);
					// if (deliveryInvceDate !== "" && deliveryInvceDate !== undefined && deliveryInvceDate !== null) {
					if (OData.NAV_MASTTOITEM.results[i].InvCreDate !== "") {
						if (finalValueArr[0].InvoiceDate === "") {
							finalValueArr[0].InvoiceDate = parseInt(OData.NAV_MASTTOITEM.results[i].InvCreDate);
							finalValueArr[0].InvoiceTime = OData.NAV_MASTTOITEM.results[i].InvCreTime;
							//parseInt(OData.NAV_MASTTOITEM.results[i].InvCreTime);
						} else {
							var maxVal = Math.max(finalValueArr[0].InvoiceDate, parseInt(OData.NAV_MASTTOITEM.results[i].InvCreDate));
							if (maxVal !== finalValueArr[0].InvoiceDate) {
								finalValueArr[0].InvoiceDate = parseInt(OData.NAV_MASTTOITEM.results[i].InvCreDate);
								finalValueArr[0].InvoiceTime = OData.NAV_MASTTOITEM.results[i].InvCreTime;
								//parseInt(OData.NAV_MASTTOITEM.results[i].InvCreTime);
							} else if (maxVal === parseInt(OData.NAV_MASTTOITEM.results[i].InvCreDate)) {
								var maxTime = Math.max(finalValueArr[0].InvoiceTime, parseInt(OData.NAV_MASTTOITEM.results[i].InvCreTime));
								if (maxTime !== finalValueArr[0].InvoiceTime) {
									finalValueArr[0].InvoiceTime = OData.NAV_MASTTOITEM.results[i].InvCreTime;
									//parseInt(OData.NAV_MASTTOITEM.results[i].InvCreTime);
								}
							}
						}

					}
					// if (OData.NAV_MASTTOITEM.results[i].InvCreTime !== "") {
					// 	if (finalValueArr[0].InvoiceTime === "") {
					// 		finalValueArr[0].InvoiceTime = parseInt(OData.NAV_MASTTOITEM.results[i].InvCreTime);
					// 	} else {
					// 		finalValueArr[0].InvoiceTime = Math.max(finalValueArr[0].InvoiceTime, parseInt(OData.NAV_MASTTOITEM.results[i].InvCreTime));
					// 	}
					// }

					// }

					///////////////////////////////for Dilivery Tab///////////// 
					var finalOrderingDil = "";
					var shipmentNoTemp = OData.NAV_MASTTOITEM.results[i].ShipNo;
					//Despatch Date
					// var deliveryDispchDate = this.checkDateandTime(OData.NAV_MASTTOITEM.results[i].PackDate, OData.NAV_MASTTOITEM.results[i]
					// 	.PackTime);
					// if (deliveryDispchDate !== "" && deliveryDispchDate !== undefined && deliveryDispchDate !== null) {
					if (OData.NAV_MASTTOITEM.results[i].PackDate !== "") {
						if (finalValueArr[0].DispatchDate === "") {
							finalValueArr[0].DispatchDate = parseInt(OData.NAV_MASTTOITEM.results[i].PackDate);
							finalValueArr[0].DispatchTime = OData.NAV_MASTTOITEM.results[i].PackTime;
							//parseInt(OData.NAV_MASTTOITEM.results[i].PackTime);
						} else {
							var maxVal = Math.max(finalValueArr[0].DispatchDate, parseInt(OData.NAV_MASTTOITEM.results[i].PackDate));
							if (maxVal !== finalValueArr[0].DispatchDate) {
								finalValueArr[0].DispatchDate = parseInt(OData.NAV_MASTTOITEM.results[i].PackDate);
								finalValueArr[0].DispatchTime = OData.NAV_MASTTOITEM.results[i].PackTime;
								//parseInt(OData.NAV_MASTTOITEM.results[i].PackTime);
							} else if (maxVal === parseInt(OData.NAV_MASTTOITEM.results[i].PackDate)) {
								var maxTime = Math.max(finalValueArr[0].DispatchTime, parseInt(OData.NAV_MASTTOITEM.results[i].PackTime));
								if (maxTime !== finalValueArr[0].DispatchTime) {
									finalValueArr[0].DispatchTime = OData.NAV_MASTTOITEM.results[i].PackTime;
									//parseInt(OData.NAV_MASTTOITEM.results[i].PackTime);
								}
							}
						}
					}
					// if (OData.NAV_MASTTOITEM.results[i].PackTime !== "") {
					// 	if (finalValueArr[0].DispatchTime === "") {

					// 	} else {
					// 		finalValueArr[0].DispatchTime = Math.max(finalValueArr[0].DispatchTime, parseInt(OData.NAV_MASTTOITEM.results[i].PackTime));
					// 	}
					// }

					// }

					//Shipment Date
					// var deliveryShipDate = this.checkDateandTime(OData.NAV_MASTTOITEM.results[i].ShipCreDate, OData.NAV_MASTTOITEM.results[
					// 		i]
					// 	.ShipCreTime);
					// if (deliveryShipDate !== "" && deliveryShipDate !== undefined && deliveryShipDate !== null) {
					if (OData.NAV_MASTTOITEM.results[i].ShipCreDate !== "") {
						if (finalValueArr[0].ShipmentDate === "") {
							finalValueArr[0].ShipmentDate = parseInt(OData.NAV_MASTTOITEM.results[i].ShipCreDate);
							finalValueArr[0].ShipmentTime = OData.NAV_MASTTOITEM.results[i].ShipCreTime;
							// parseInt(OData.NAV_MASTTOITEM.results[i].ShipCreTime);
						} else {
							var maxVal = Math.max(finalValueArr[0].ShipmentDate, parseInt(OData.NAV_MASTTOITEM.results[i].ShipCreDate));
							if (maxVal !== finalValueArr[0].ShipmentDate) {
								finalValueArr[0].ShipmentDate = parseInt(OData.NAV_MASTTOITEM.results[i].ShipCreDate);
								finalValueArr[0].ShipmentTime = OData.NAV_MASTTOITEM.results[i].ShipCreTime;
								//parseInt(OData.NAV_MASTTOITEM.results[i].ShipCreTime);
							} else if (maxVal === parseInt(OData.NAV_MASTTOITEM.results[i].ShipCreDate)) {
								var maxTime = Math.max(finalValueArr[0].ShipmentTime, parseInt(OData.NAV_MASTTOITEM.results[i].ShipCreTime));
								if (maxTime !== finalValueArr[0].ShipmentTime) {
									finalValueArr[0].ShipmentTime = OData.NAV_MASTTOITEM.results[i].ShipCreTime;
									//parseInt(OData.NAV_MASTTOITEM.results[i].ShipCreTime);
								}
							}
						}
					}
					// if (OData.NAV_MASTTOITEM.results[i].ShipCreTime !== "") {
					// 	if (finalValueArr[0].ShipmentTime === "") {
					// 		finalValueArr[0].ShipmentTime = parseInt(OData.NAV_MASTTOITEM.results[i].ShipCreTime);
					// 	} else {
					// 		finalValueArr[0].ShipmentTime = Math.max(finalValueArr[0].ShipmentTime, parseInt(OData.NAV_MASTTOITEM.results[i].ShipCreTime));
					// 	}
					// }
					// }

					//////////////////////////// Customer confirmation///////////
					var finalCustConfrm = "";
					//Recept Date
					// var custConRecptDate = this.checkDateandTime(OData.NAV_MASTTOITEM.results[i].PodDate, OData.NAV_MASTTOITEM.results[i].PodTime);
					// if (custConRecptDate !== "" && custConRecptDate !== undefined && custConRecptDate !== null) {
					if (OData.NAV_MASTTOITEM.results[i].PodDate !== "") {
						if (finalValueArr[0].CustomerReceiptDate === "") {
							finalValueArr[0].CustomerReceiptDate = parseInt(OData.NAV_MASTTOITEM.results[i].PodDate);
							finalValueArr[0].CustomerReceiptTime = OData.NAV_MASTTOITEM.results[i].PodTime;
							//parseInt(OData.NAV_MASTTOITEM.results[i].PodTime);
						} else {
							var maxVal = Math.max(finalValueArr[0].CustomerReceiptDate, parseInt(OData.NAV_MASTTOITEM.results[i].PodDate));
							if (maxVal !== finalValueArr[0].CustomerReceiptDate) {
								finalValueArr[0].CustomerReceiptDate = parseInt(OData.NAV_MASTTOITEM.results[i].PodDate);
								finalValueArr[0].CustomerReceiptTime = OData.NAV_MASTTOITEM.results[i].PodTime;
								//parseInt(OData.NAV_MASTTOITEM.results[i].PodTime);
							} else if (maxVal === parseInt(OData.NAV_MASTTOITEM.results[i].PodDate)) {
								var maxTime = Math.max(finalValueArr[0].CustomerReceiptTime, parseInt(OData.NAV_MASTTOITEM.results[i].PodTime));
								if (maxTime !== finalValueArr[0].CustomerReceiptTime) {
									finalValueArr[0].CustomerReceiptTime = OData.NAV_MASTTOITEM.results[i].PodTime;
									//parseInt(OData.NAV_MASTTOITEM.results[i].PodTime);
								}
							}
						}
					}
					// if (OData.NAV_MASTTOITEM.results[i].PodTime !== "") {
					// 	if (finalValueArr[0].CustomerReceiptTime === "") {
					// 		finalValueArr[0].CustomerReceiptTime = parseInt(OData.NAV_MASTTOITEM.results[i].PodTime);
					// 	} else {
					// 		finalValueArr[0].CustomerReceiptTime = Math.max(finalValueArr[0].CustomerReceiptTime, parseInt(OData.NAV_MASTTOITEM.results[i].PodTime));
					// 	}
					// }
					// }

					//Reject Date
					// var custConRejectDate = this.checkDateandTime(OData.NAV_MASTTOITEM.results[i].PodRejDate, OData.NAV_MASTTOITEM.results[
					// 		i]
					// 	.PodRejTime);
					// if (custConRejectDate !== "" && custConRejectDate !== undefined && custConRejectDate !== null) {
					if (OData.NAV_MASTTOITEM.results[i].PodRejDate !== "") {
						if (finalValueArr[0].CustomerRejectDate === "") {
							finalValueArr[0].CustomerRejectDate = parseInt(OData.NAV_MASTTOITEM.results[i].PodRejDate);
							finalValueArr[0].CustomerRejectTime = OData.NAV_MASTTOITEM.results[i].PodRejTime;
						} else {
							var maxVal = Math.max(finalValueArr[0].CustomerRejectDate, parseInt(OData.NAV_MASTTOITEM.results[i].PodRejDate));
							if (maxVal !== finalValueArr[0].CustomerRejectDate) {
								finalValueArr[0].CustomerRejectDate = parseInt(OData.NAV_MASTTOITEM.results[i].PodRejDate);
								finalValueArr[0].CustomerRejectTime = OData.NAV_MASTTOITEM.results[i].PodRejTime;
							} else if (maxVal === parseInt(OData.NAV_MASTTOITEM.results[i].PodRejDate)) {
								var maxTime = Math.max(finalValueArr[0].CustomerRejectTime, parseInt(OData.NAV_MASTTOITEM.results[i].PodRejTime));
								if (maxTime !== finalValueArr[0].CustomerRejectTime) {
									finalValueArr[0].CustomerRejectTime = OData.NAV_MASTTOITEM.results[i].PodRejTime;
									//parseInt(OData.NAV_MASTTOITEM.results[i].PodRejTime);
								}
							}
						}
					}
					// if (OData.NAV_MASTTOITEM.results[i].PodRejTime !== "") {
					// 	if (finalValueArr[0].CustomerRejectTime === "") {
					// 		finalValueArr[0].CustomerRejectTime = parseInt(OData.NAV_MASTTOITEM.results[i].PodRejTime);
					// 	} else {
					// 		finalValueArr[0].CustomerRejectTime = Math.max(finalValueArr[0].CustomerRejectTime, parseInt(OData.NAV_MASTTOITEM.results[i].PodRejTime));
					// 	}
					// }
					// }
					// [+] Start - STRY0012250: Add ETA Status
					var oDataItem = OData.NAV_MASTTOITEM.results[i];

					// If no PO Date and POD Rej date, then call TMS webservice to get ETA
					if (!oDataItem.PodDate && !oDataItem.PodRejDate) {
						var sRegionID = OData.NAV_MASTTOHEADER.results[0].TMSRegionId;
						this.sCountry = OData.NAV_MASTTOHEADER.results[0].Country;
						var sOrderNum = (OData.NAV_MASTTOHEADER.results[0].Country === "TH") ? oDataItem.BillingDoc : oDataItem.Delivery;

						// Make sure DO or Billing Doc and RegionId not initial
						if (!sOrderNum || !sRegionID) {
							continue;
						}
						this.formatter.loadTMSService.call(this, "/TMSWebService/webservices", "POST", sRegionID, sOrderNum).then(function (
							data, textStatus,
							res) {
							var oData = this.formatter.xmlToJson.call(this, res.responseText).envelope.body.retrievestopsbycriteriaresponse.stops;

							// Compare eta date and get latest eta date
							this.oDataTMSService.push(oData);
							if (!oData.projectedarrival) {
								return;
							}
							if (!this.etaDate) {
								this.etaDate = oData.projectedarrival;
							}
							// Get latest ETA
							if (new Date(this.etaDate) < new Date(oData.projectedarrival)) {
								this.etaDate = oData.projectedarrival;
							}

							var sETADate = this.etaDate.substring(0, 10).replaceAll("-", ""),
								sETATime = this.etaDate.substring(11, 19).replaceAll(":", ""),
								sDateTime = this.formatter.stringDateTimeConvert(sETADate, sETATime),
								sHrTime = new Date(this.etaDate).toLocaleTimeString().slice(new Date(this.etaDate).toLocaleTimeString().length - 2);

							// Switch the date and time for TH for now, once they're ready remove the checking
							if (this.sCountry !== "TH") {
								var sOrderingDetailDate = (this.initFinalOrderingDil) ? this.initFinalOrderingDil + "\n Estimated arrival date: " +
									sDateTime +
									" " + sHrTime :
									"Estimated arrival date: " + sDateTime + " " + sHrTime;
							} else {
								sOrderingDetailDate = (this.initFinalOrderingDil) ? this.initFinalOrderingDil + "\n Estimated arrival date: " + sDateTime.substring(
										0, 10) +
									" " +
									sHrTime :
									"Estimated arrival date: " + sDateTime.substring(0, 10) + " " + sHrTime;
							}

							// redefine status model set to add eta date
							/*							this.initFinalOrderingDil*/
							var oStatusModel = this.byId("idTimeline").getModel("StatusModelSet");

							// Need to enhance
							oStatusModel.setProperty("/results/2/Dates", sOrderingDetailDate);
							busyDialog.close();
						}.bind(this)).fail(function (data, res) {
							busyDialog.close();
						}.bind(this));
					}
					// [+] End - STRY0012250: Add ETA Status
				}
				var oDateFormat = sap.ui.core.format.DateFormat
					.getDateInstance({
						pattern: "dd.MM.yyyy HH:mm:ss"
					});
				var SDBlock = formatter.stringDateTimeConvert(finalValueArr[0].SDBlockDate.toString(), finalValueArr[0].SDBlockTime.toString());
				if (SDBlock !== "" && SDBlock !== undefined && SDBlock !== null) {
					if (finalOrdering !== "") {
						finalOrdering = finalOrdering + "\n SD Block Date: " + SDBlock;
					} else {
						finalOrdering = "SD Block Date: " + SDBlock;
					}
				}
				var SDRelease = formatter.stringDateTimeConvert(finalValueArr[0].SDReleaseDate.toString(), finalValueArr[0].SDReleaseTime.toString());
				if (SDRelease !== "" && SDRelease !== undefined && SDRelease !== null) {
					if (finalOrdering !== "") {
						finalOrdering = finalOrdering + "\n SD Release Date: " + SDRelease;
					} else {
						finalOrdering = "SD Release Date: " + SDRelease;
					}
				}
				//for FI Block Date & Time
				var deliveryFIBlockDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOHEADER.results[0].CredBlkDate, OData.NAV_MASTTOHEADER.results[
					0].CredBlkTime);
				if (deliveryFIBlockDate !== "" && deliveryFIBlockDate !== undefined && deliveryFIBlockDate !== null) {
					if (finalOrdering !== "") {
						finalOrdering = finalOrdering + "\n FI Block Date: " + deliveryFIBlockDate;
					} else {
						finalOrdering = "FI Block Date: " + deliveryFIBlockDate;
					}
				}

				//For FI Release Date & Time
				var deliveryFIReleaseDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOHEADER.results[0].CredRelDate, OData.NAV_MASTTOHEADER
					.results[
						0].CredRelTime);
				if (deliveryFIReleaseDate !== "" && deliveryFIReleaseDate !== undefined && deliveryFIReleaseDate !== null) {
					if (finalOrdering !== "") {
						finalOrdering = finalOrdering + "\n FI Release Date: " + deliveryFIReleaseDate;
					} else {
						finalOrdering = "FI Release Date: " + deliveryFIReleaseDate;
					}
				}
				var DODate = formatter.stringDateTimeConvert(finalValueArr[0].DODate.toString(), finalValueArr[0].DOTime.toString());
				if (DODate !== "" && DODate !== undefined && DODate !== null) {
					if (finalOrdering !== "") {
						finalOrdering = finalOrdering + "\n DO Date: " + DODate;
					} else {
						finalOrdering = "DO Date: " + DODate;
					}
				}
				var PGI = formatter.stringDateTimeConvert(finalValueArr[0].PGIDate.toString(), finalValueArr[0].PGITime.toString());
				if (PGI !== "" && PGI !== undefined && PGI !== null) {
					if (finalOrdering !== "") {
						finalOrdering = finalOrdering + "\n PGI Date: " + PGI;
					} else {
						finalOrdering = "PGI Date: " + PGI;
					}
				}
				var Invoice = formatter.stringDateTimeConvert(finalValueArr[0].InvoiceDate.toString(), finalValueArr[0].InvoiceTime.toString());
				if (Invoice !== "" && Invoice !== undefined && Invoice !== null) {
					if (finalOrdering !== "") {
						finalOrdering = finalOrdering + "\n Invoice Date: " + Invoice;
					} else {
						finalOrdering = "Invoice Date: " + Invoice;
					}
				}
				/*				var Dispatch = formatter.stringDateTimeConvert(finalValueArr[0].DispatchDate.toString(), finalValueArr[0].DispatchTime.toString());
								if (Dispatch !== "" && Dispatch !== undefined && Dispatch !== null) {
									if (finalOrderingDil !== "") {
										finalOrderingDil = finalOrderingDil + "\n Dispatch Date: " + Dispatch;
									} else {
										finalOrderingDil = "Dispatch Date: " + Dispatch;
									}
								}*/
				var Shipment = formatter.stringDateTimeConvert(finalValueArr[0].ShipmentDate.toString(), finalValueArr[0].ShipmentTime.toString());
				if (Shipment !== "" && Shipment !== undefined && Shipment !== null) {
					if (finalOrderingDil !== "") {
						finalOrderingDil = finalOrderingDil + "\n Dispatch/Shipment Date: " + Shipment;
					} else {
						finalOrderingDil = "Dispatch/Shipment Date: " + Shipment;
					}
				}
				var CustomerReceipt = formatter.stringDateTimeConvert(finalValueArr[0].CustomerReceiptDate.toString(), finalValueArr[0].CustomerReceiptTime
					.toString());
				if (CustomerReceipt !== "" && CustomerReceipt !== undefined && CustomerReceipt !== null) {
					if (finalCustConfrm !== "") {
						finalCustConfrm = finalCustConfrm + "\n Customer Receipt Date: " + CustomerReceipt;
					} else {
						finalCustConfrm = "Customer Receipt Date: " + CustomerReceipt;
					}
				}
				var CustomerReject = formatter.stringDateTimeConvert(finalValueArr[0].CustomerRejectDate.toString(), finalValueArr[0].CustomerRejectTime
					.toString());
				if (CustomerReject !== "" && CustomerReject !== undefined && CustomerReject !== null) {
					if (finalCustConfrm !== "") {
						finalCustConfrm = finalCustConfrm + "\n Customer Reject Date: " + CustomerReject;
					} else {
						finalCustConfrm = "Customer Reject Date: " + CustomerReject;
					}
				}

			}

			// var reachedStatus = sap.ui.getCore().getModel("MasterModelSelData").Status;
			var reachedStatus = OData.NAV_MASTTOHEADER.results[0].HdrStatus;
			var levelForActiveStatus = formatter.forLevelCheckStataus(reachedStatus);

			this.initFinalOrderingDil = finalOrderingDil; // [+] Start - STRY0012250: Add ETA Status
			this.masterData = [{
					HeadingTitle: that.i18nModel.getProperty("orderingTrackDet"),
					ValueState: formatter.statusFieldTrackingValueStateDetails(1, levelForActiveStatus, reachedStatus),
					Status: formatter.OrderingStatusFieldTracking(reachedStatus, levelForActiveStatus),
					RequestId: "12345",
					Clickable: levelForActiveStatus >= 1 ? true : false,
					Icon: "sap-icon://customer-order-entry",
					Dates: OrdPoDate + finalOrderingSoDate,
					LevelCurrent: 1,
					VisibleField: formatter.visibleBasedOnStatusIfTopRejectDontShowBottomValue(1, levelForActiveStatus, reachedStatus)
				}, {
					HeadingTitle: that.i18nModel.getProperty("processingTrackDet"),
					ValueState: formatter.statusFieldTrackingValueStateDetails(2, levelForActiveStatus, reachedStatus),
					Status: formatter.processingStatusFieldTracking(reachedStatus, levelForActiveStatus),
					RequestId: "12346",
					Clickable: levelForActiveStatus >= 2 ? true : false,
					Icon: "sap-icon://add-product",
					Dates: finalOrdering,
					LevelCurrent: 2,
					VisibleField: formatter.visibleBasedOnStatusIfTopRejectDontShowBottomValue(2, levelForActiveStatus, reachedStatus)

				}, {
					HeadingTitle: that.i18nModel.getProperty("deliveryTrackDet"),
					ValueState: formatter.statusFieldTrackingValueStateDetails(3, levelForActiveStatus, reachedStatus),
					Status: formatter.deliveryStatusFieldTracking(reachedStatus, levelForActiveStatus),
					Clickable: levelForActiveStatus >= 3 ? true : false,
					RequestId: "12347",
					Icon: "sap-icon://shipping-status",
					Dates: finalOrderingDil,
					LevelCurrent: 3,
					VisibleField: formatter.visibleBasedOnStatusIfTopRejectDontShowBottomValue(3, levelForActiveStatus, reachedStatus)

				}, {
					HeadingTitle: that.i18nModel.getProperty("customerConfirmationTrackDet"),
					ValueState: formatter.statusFieldTrackingValueStateDetails(4, levelForActiveStatus, reachedStatus),
					Status: formatter.customerConfirmationStatusFieldTracking(reachedStatus, levelForActiveStatus),
					RequestId: "12347",
					Clickable: levelForActiveStatus >= 4 ? true : false,
					Icon: "sap-icon://accept",
					Dates: finalCustConfrm,
					LevelCurrent: 4,
					VisibleField: formatter.visibleBasedOnStatusIfTopRejectDontShowBottomValue(4, levelForActiveStatus, reachedStatus)
				}

			];

			var masterModel = new sap.ui.model.json.JSONModel({
				results: this.masterData
			});
			this.getView().byId("idTimeline").setModel(masterModel, "StatusModelSet");
		},

		checkDateandTime: function (date, time) {
			// var date = Date.UTC(date.trim().substr(0, 4), date.trim().substr(4, 2) - 1, date.trim().substr(6, 2), time.trim().substr(
			// 	0,
			// 	2), time.trim().substr(2, 2), time.trim().substr(4, 2));
			if (date === undefined || date === null || date.trim() === "") {
				return "";
			} else if (time === undefined || time === null || time.trim() === "") {
				if (date.trim().length === 8) {
					var oDate1 = Date.UTC(date.trim().substr(0, 4), date.trim().substr(4, 2) - 1, date.trim().substr(6, 2), 0, 0, 0);
					return oDate1;
				}
			} else if (date !== null && date.trim() !== "" && time.trim() !== null && time.trim() !== "") {
				if (date.trim().length === 8 && time.trim().length >= 4) {
					if (time === "000000") {
						var oDate1 = Date.UTC(date.trim().substr(0, 4), date.trim().substr(4, 2) - 1, date.trim().substr(6, 2), 0, 0, 0);
						return oDate1;
					} else {
						var oDate1 = Date.UTC(date.trim().substr(0, 4), date.trim().substr(4, 2) - 1, date.trim().substr(6, 2), time.trim().substr(
							0,
							2), time.trim().substr(2, 2), time.trim().substr(4, 2));
						return oDate1;
					}
				} else {
					return "";
				}

			}
		}

		// readTrackingDetailsTabData: function (OData) {
		// 	var that = this;

		// 	//for ordering
		// 	var OrderingPoDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOHEADER.results[0].PODate, "000000");
		// 	var finalOrderingPoDate = "";
		// 	var OrdPoDate = "";
		// 	if (OrderingPoDate !== "" && OrderingPoDate !== undefined && OrderingPoDate !== null) {
		// 		finalOrderingPoDate = OrderingPoDate;
		// 		OrdPoDate = "PO Date: " + finalOrderingPoDate;
		// 	}

		// 	var OrderingSoDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOHEADER.results[0].SOCreDate, OData.NAV_MASTTOHEADER.results[0]
		// 		.SOCreTime);
		// 	var finalOrderingSoDate = "";
		// 	if (OrderingSoDate !== "" && OrderingSoDate !== undefined && OrderingSoDate !== null) {
		// 		finalOrderingSoDate = (OrdPoDate !== "" ? "\n" : "") + ("SO Date: " + OrderingSoDate);
		// 	}

		// 	//	for ordering
		// 	var deliverySDBlockDate = "";
		// 	var finalOrdering = "";
		// 	var deliveryDoDateTemp = "";
		// 	if (OData.NAV_MASTTOITEM.results[0] !== undefined) {
		// 		deliveryDoDateTemp = OData.NAV_MASTTOITEM.results[0].Delivery;

		// 		//for SD Block Date & Time
		// 		var deliverySDBlockDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOITEM.results[0].ShedLineDelBDate, OData.NAV_MASTTOITEM.results[
		// 			0].ShedLinedelReDate);
		// 		if (deliverySDBlockDate !== "" && deliverySDBlockDate !== undefined && deliverySDBlockDate !== null) {
		// 			finalOrdering = "SD Block Date: " + deliverySDBlockDate;
		// 		}

		// 		//for SD Release Date & Time
		// 		var deliverySDReleaseDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOITEM.results[0].ShedLinedelRelDate, OData.NAV_MASTTOITEM
		// 			.results[0].ShedLineRelTime);
		// 		if (deliverySDReleaseDate !== "" && deliverySDReleaseDate !== undefined && deliverySDReleaseDate !== null) {
		// 			if (finalOrdering !== "") {
		// 				finalOrdering = finalOrdering + "\n SD Release Date: " + deliverySDReleaseDate;
		// 			} else {
		// 				finalOrdering = "SD Release Date: " + deliverySDReleaseDate;
		// 			}
		// 		}

		// 		//for FI Block Date & Time
		// 		var deliveryFIBlockDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOHEADER.results[0].CredBlkDate, OData.NAV_MASTTOHEADER.results[
		// 			0].CredBlkTime);
		// 		if (deliveryFIBlockDate !== "" && deliveryFIBlockDate !== undefined && deliveryFIBlockDate !== null) {
		// 			if (finalOrdering !== "") {
		// 				finalOrdering = finalOrdering + "\n FI Block Date: " + deliveryFIBlockDate;
		// 			} else {
		// 				finalOrdering = "FI Block Date: " + deliveryFIBlockDate;
		// 			}
		// 		}

		// 		//For FI Release Date & Time
		// 		var deliveryFIReleaseDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOHEADER.results[0].CredRelDate, OData.NAV_MASTTOHEADER.results[
		// 			0].CredRelTime);
		// 		if (deliveryFIReleaseDate !== "" && deliveryFIReleaseDate !== undefined && deliveryFIReleaseDate !== null) {
		// 			if (finalOrdering !== "") {
		// 				finalOrdering = finalOrdering + "\n FI Release Date: " + deliveryFIReleaseDate;
		// 			} else {
		// 				finalOrdering = "FI Release Date: " + deliveryFIReleaseDate;
		// 			}
		// 		}

		// 		//DO Date
		// 		var deliveryDoDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOITEM.results[0].DoDate, OData.NAV_MASTTOITEM.results[0].DoTime);
		// 		if (deliveryDoDate !== "" && deliveryDoDate !== undefined && deliveryDoDate !== null) {
		// 			if (finalOrdering !== "") {
		// 				finalOrdering = finalOrdering + "\n DO Date: " + deliveryDoDate;
		// 			} else {
		// 				finalOrdering = "DO Date: " + deliveryDoDate;
		// 			}
		// 		}

		// 		//PGI Date
		// 		var deliveryPGIDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOITEM.results[0].PgiDate, OData.NAV_MASTTOITEM.results[0].PgiTime);
		// 		if (deliveryPGIDate !== "" && deliveryPGIDate !== undefined && deliveryPGIDate !== null) {
		// 			if (finalOrdering !== "") {
		// 				finalOrdering = finalOrdering + "\n PGI Date: " + deliveryPGIDate;
		// 			} else {
		// 				finalOrdering = "PGI Date: " + deliveryPGIDate;
		// 			}
		// 		}

		// 		//Invoice Date
		// 		var deliveryInvceDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOITEM.results[0].InvCreDate, OData.NAV_MASTTOITEM.results[0]
		// 			.InvCreTime);
		// 		if (deliveryInvceDate !== "" && deliveryInvceDate !== undefined && deliveryInvceDate !== null) {
		// 			if (finalOrdering !== "") {
		// 				finalOrdering = finalOrdering + "\n Invoice Date: " + deliveryInvceDate;
		// 			} else {
		// 				finalOrdering = "Invoice Date: " + deliveryInvceDate;
		// 			}
		// 		}

		// 		///////////////////////////////for Dilivery Tab///////////// 
		// 		var finalOrderingDil = "";
		// 		var shipmentNoTemp = OData.NAV_MASTTOITEM.results[0].ShipNo;
		// 		//Despatch Date
		// 		var deliveryDispchDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOITEM.results[0].PackDate, OData.NAV_MASTTOITEM.results[0]
		// 			.PackTime);
		// 		if (deliveryDispchDate !== "" && deliveryDispchDate !== undefined && deliveryDispchDate !== null) {
		// 			if (finalOrderingDil !== "") {
		// 				finalOrderingDil = finalOrderingDil + "\n Dispatch Date: " + deliveryDispchDate;
		// 			} else {
		// 				finalOrderingDil = "Dispatch Date: " + deliveryDispchDate;
		// 			}
		// 		}

		// 		//Shipment Date
		// 		var deliveryShipDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOITEM.results[0].ShipCreDate, OData.NAV_MASTTOITEM.results[0]
		// 			.ShipCreTime);
		// 		if (deliveryShipDate !== "" && deliveryShipDate !== undefined && deliveryShipDate !== null) {
		// 			if (finalOrderingDil !== "") {
		// 				finalOrderingDil = finalOrderingDil + "\n Shipment Date: " + deliveryShipDate;
		// 			} else {
		// 				finalOrderingDil = "Shipment Date: " + deliveryShipDate;
		// 			}
		// 		}

		// 		//////////////////////////// Customer confirmation///////////
		// 		var finalCustConfrm = "";
		// 		//Recept Date
		// 		var custConRecptDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOITEM.results[0].PodDate, OData.NAV_MASTTOITEM.results[0].PodTime);
		// 		if (custConRecptDate !== "" && custConRecptDate !== undefined && custConRecptDate !== null) {
		// 			if (finalCustConfrm !== "") {
		// 				finalCustConfrm = finalCustConfrm + "\n Customer Receipt Date: " + custConRecptDate;
		// 			} else {
		// 				finalCustConfrm = "Customer Receipt Date: " + custConRecptDate;
		// 			}
		// 		}

		// 		//Reject Date
		// 		var custConRejectDate = formatter.stringDateTimeConvert(OData.NAV_MASTTOITEM.results[0].PodRejDate, OData.NAV_MASTTOITEM.results[0]
		// 			.PodRejTime);
		// 		if (custConRejectDate !== "" && custConRejectDate !== undefined && custConRejectDate !== null) {
		// 			if (finalCustConfrm !== "") {
		// 				finalCustConfrm = finalCustConfrm + "\n Customer Reject Date: " + custConRejectDate;
		// 			} else {
		// 				finalCustConfrm = "Customer Reject Date: " + custConRejectDate;
		// 			}
		// 		}

		// 	}

		// 	// var reachedStatus = sap.ui.getCore().getModel("MasterModelSelData").Status;
		// 	var reachedStatus = OData.NAV_MASTTOHEADER.results[0].HdrStatus;
		// 	var levelForActiveStatus = formatter.forLevelCheckStataus(reachedStatus);

		// 	this.masterData = [{
		// 			HeadingTitle: that.i18nModel.getProperty("orderingTrackDet"),
		// 			ValueState: formatter.statusFieldTrackingValueStateDetails(1, levelForActiveStatus, reachedStatus),
		// 			Status: formatter.OrderingStatusFieldTracking(reachedStatus, levelForActiveStatus),
		// 			RequestId: "12345",
		// 			Clickable: levelForActiveStatus >= 1 ? true : false,
		// 			Icon: "sap-icon://customer-order-entry",
		// 			Dates: OrdPoDate + finalOrderingSoDate,
		// 			LevelCurrent: 1,
		// 			VisibleField: formatter.visibleBasedOnStatusIfTopRejectDontShowBottomValue(1, levelForActiveStatus, reachedStatus)
		// 		}, {
		// 			HeadingTitle: that.i18nModel.getProperty("processingTrackDet"),
		// 			ValueState: formatter.statusFieldTrackingValueStateDetails(2, levelForActiveStatus, reachedStatus),
		// 			Status: formatter.processingStatusFieldTracking(reachedStatus, levelForActiveStatus),
		// 			RequestId: "12346",
		// 			Clickable: levelForActiveStatus >= 2 ? true : false,
		// 			Icon: "sap-icon://add-product",
		// 			Dates: finalOrdering,
		// 			LevelCurrent: 2,
		// 			VisibleField: formatter.visibleBasedOnStatusIfTopRejectDontShowBottomValue(2, levelForActiveStatus, reachedStatus)

		// 		}, {
		// 			HeadingTitle: that.i18nModel.getProperty("deliveryTrackDet"),
		// 			ValueState: formatter.statusFieldTrackingValueStateDetails(3, levelForActiveStatus, reachedStatus),
		// 			Status: formatter.deliveryStatusFieldTracking(reachedStatus, levelForActiveStatus),
		// 			Clickable: levelForActiveStatus >= 3 ? true : false,
		// 			RequestId: "12347",
		// 			Icon: "sap-icon://shipping-status",
		// 			Dates: finalOrderingDil,
		// 			LevelCurrent: 3,
		// 			VisibleField: formatter.visibleBasedOnStatusIfTopRejectDontShowBottomValue(3, levelForActiveStatus, reachedStatus)

		// 		}, {
		// 			HeadingTitle: that.i18nModel.getProperty("customerConfirmationTrackDet"),
		// 			ValueState: formatter.statusFieldTrackingValueStateDetails(4, levelForActiveStatus, reachedStatus),
		// 			Status: formatter.customerConfirmationStatusFieldTracking(reachedStatus, levelForActiveStatus),
		// 			RequestId: "12347",
		// 			Clickable: levelForActiveStatus >= 4 ? true : false,
		// 			Icon: "sap-icon://accept",
		// 			Dates: finalCustConfrm,
		// 			LevelCurrent: 4,
		// 			VisibleField: formatter.visibleBasedOnStatusIfTopRejectDontShowBottomValue(4, levelForActiveStatus, reachedStatus)
		// 		}

		// 	];

		// 	var masterModel = new sap.ui.model.json.JSONModel({
		// 		results: this.masterData
		// 	});
		// 	this.getView().byId("idTimeline").setModel(masterModel, "StatusModelSet");
		// }

	});

});