jQuery.sap.require("sap.ca.ui.model.format.DateFormat");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ca.ui.model.format.NumberFormat");
sap.ui.define([], function () {
	"use strict";

	return {
		//converting date to dd.mm.yy hh:mm format
		concatHdrDateTime: function (val1, oDate) {
			if (oDate) {
				var oDateFormat = sap.ui.core.format.DateFormat
					.getDateInstance({
						pattern: "dd.MM.yyyy HH:mm:ss"
					});
				var oDate1 = (Date.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), oDate.getHours(), oDate.getMinutes(), oDate.getSeconds()))
					.toLocaleString();
				return val1 + " " + oDateFormat.format(oDate1);
			} else {
				return val1;
			}
		},

		//converting date to dd.mm.yy hh:mm format some other place
		dateTimeFormat: function (oDate) {
			if (oDate) {
				var oDateFormat = sap.ca.ui.model.format.DateFormat
					.getTimeInstance({
						pattern: "dd.MM.yyyy HH:mm:ss"
					});
				// oDate = new Date(oDate);
				if (oDate.getDate().toString().length === 1) {
					var date = "0" + oDate.getDate();
				} else {
					var date = oDate.getDate();
				}
				if (oDate.getMonth().toString().length === 1 && oDate.getMonth() < 9) {
					var month = "0" + (oDate.getMonth() + 1);
				} else {
					var month = oDate.getMonth() + 1;
				}
				if (oDate.getHours().toString().length === 1) {
					var hrs = "0" + oDate.getHours();
				} else {
					var hrs = oDate.getHours();
				}
				if (oDate.getMinutes().toString().length === 1) {
					var min = "0" + oDate.getMinutes();
				} else {
					var min = oDate.getMinutes();
				}
				if (oDate.getSeconds().toString().length === 1) {
					var seconds = "0" + oDate.getSeconds();
				} else {
					var seconds = oDate.getSeconds();
				}
				var date = oDate.getFullYear() + "-" + month + "-" + date + "T" + hrs + ":" + min + ":" + seconds + ".00+08:00";
				oDate = new Date(date);
				// oDate.setHours(oDate.getHours() + 8);
				return oDateFormat.format(oDate);
			} else {
				return "";
			}
		},

		// dateTimeFormat: function (oDate) {
		// 	if (oDate) {
		// 		var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
		// 			pattern: "dd.MM.yyyy HH:mm:ss"
		// 		});
		// 		var oDate1 = new Date(Date.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), oDate.getHours(), oDate.getMinutes(), oDate.getSeconds()));
		// 		return oDateFormat.format(oDate1);
		// 	} else {
		// 		return "";
		// 	}
		// },

		setBlur: function () {},

		//status handle Master List
		StatusHandleIcon: function (status, level) {
			if (status === "O") {
				return "sap-icon://create-form";
			} else if (status === "X") {
				return "sap-icon://decline";
			} else if (status === "K") {
				return "sap-icon://add-product";
			} else if (status === "W") {
				return "sap-icon://add-product";
			} else if (status === "B") {
				return "sap-icon://add-product";
			} else if (status === "Q") {
				return "sap-icon://error";
			} else if (status === "S") {
				return "sap-icon://shipping-status";
			} else if (status === "D") {
				return "sap-icon://accept";
			} else if (status === "R") {
				return "sap-icon://cancel";
			} else if (status === "M") {
				return "sap-icon://split";
			} else {
				//	return "sap-icon://None";
				if (level === 1) {
					return "sap-icon://create-form";
				} else if (level === 2) {
					return "sap-icon://add-product";
				} else if (level === 3) {
					return "sap-icon://shipping-status";
				} else if (level === 4) {
					return "sap-icon://accept";
				} else {
					return "sap-icon://None";
				}

			}

		},

		//icon Color in Details
		statusFieldTrackingValueStateDetails: function (currStatusLevel, activeStatusLevel, hdrStatus) {
			if (currStatusLevel === 1 && activeStatusLevel >= 1) {
				return "Error";
			} else if (currStatusLevel === 2 && activeStatusLevel >= 2) {
				if (hdrStatus === "W") {
					return "None";
				} else if (hdrStatus === "B") {
					return "Success";
				} else {
					return "Error";
				}
			} else if (currStatusLevel === 3 && activeStatusLevel >= 3) {
				return "Success";
			} else if (currStatusLevel === 4 && activeStatusLevel >= 4) {
				return "Error";
			}
		},

		//visible out of 4
		visibleBasedOnStatusIfTopRejectDontShowBottomValue: function (currStatusLevel, activeStatusLevel, hdrStatus) {
			if (hdrStatus === "X" && currStatusLevel > 1 && activeStatusLevel === 1) {
				return false;
			} else if (hdrStatus === "S" && currStatusLevel > 3 && activeStatusLevel === 3) {
				return false;
			}
		},
		// addCommas on Amount field
		addCommas: function (sValue1, sValue2) {
			if (sValue1 !== undefined && sValue1 !== null) {
				sValue1 = sValue1.toString();
			}

			if (sValue2 == null)
				sValue2 = "";
			if (sValue1 == "" || sValue1 == undefined) {
				return "";
			} else {
				var x = sValue1;
				x = x.toString();
				var afterPoint = '';
				if (x.indexOf('.') > 0)
					afterPoint = x.substring(x.indexOf('.'), x.length);
				x = Math.floor(x);
				x = x.toString();
				var lastThree = x.substring(x.length - 3);
				var otherNumbers = x.substring(0, x.length - 3);
				if (otherNumbers != '')
					lastThree = ',' + lastThree;
				var res = otherNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + lastThree + afterPoint;
				if (sValue2 != "")
					return res + " (" + sValue2 + ")";
				else if (sValue2 == "" || sValue2 == undefined)
					return res;
			}
		},

		//date & time for specific format
		stringDateTimeConvert: function (date, time) {
			if (date === undefined || date === null || date.trim() === "") {
				return "";
			} else if (time === undefined || time === null || time.trim() === "") {
				if (date.trim().length === 8) {
					var oDateFormat = sap.ui.core.format.DateFormat
						.getDateInstance({
							pattern: "dd.MM.yyyy"
						});
					// var date = date.trim().substr(0, 4) + "-" + month + "-" + date + "T" + hrs + ":" + min + ":" + seconds + ".00+08:00";
					// oDate = new Date(date);
					// oDate.setHours(oDate.getHours() + 8);
					// return oDateFormat.format(oDate)
					var oDate1 = new Date(date.trim().substr(0, 4), date.trim().substr(4, 2) - 1, date.trim().substr(6, 2));
					return oDateFormat.format(oDate1); + "00:00:00";
					// return date.trim().substr(6, 2) + "." + date.trim().substr(4, 2) + "." + date.trim().substr(0, 4) + " " + "00:00:00";
				}
			} else if (date !== null && date.trim() !== "" && time.trim() !== null && time.trim() !== "") {
				if (date.trim().length === 8 && time.trim().length >= 4) {
					if (time === "000000") {
						var oDateFormat = sap.ui.core.format.DateFormat
							.getDateInstance({
								pattern: "dd.MM.yyyy"
							});
						var oDate1 = new Date(date.trim().substr(0, 4), date.trim().substr(4, 2) - 1, date.trim().substr(6, 2));
						return oDateFormat.format(oDate1) + " " + "00:00:00";
					} else {
						var oDateFormat = sap.ui.core.format.DateFormat
							.getDateInstance({
								pattern: "dd.MM.yyyy  HH:mm:ss"
							});
						if ((date.trim().substr(4, 2) - 1).toString().length === 1 && date.trim().substr(4, 2) < 9) {
							var month = "0" + (date.trim().substr(4, 2)).toString();
						} else {
							var month = (date.trim().substr(4, 2)).toString();
						}
						var date = date.trim().substr(0, 4) + "-" + (date.trim().substr(4, 2)).toString() + "-" + date.trim().substr(6, 2) + "T" + time.trim()
							.substr(
								0,
								2) + ":" + time.trim().substr(2, 2) + ":" + time.trim().substr(4, 2) + ".00+08:00";
						var oDate1 = new Date(date);
						// oDate1.setHours(oDate1.getHours() + 8);
						return oDateFormat.format(oDate1);
					}
				} else {
					return "";
				}

			}

		},

		// stringDateTimeConvert: function (date, time) {
		// 	if (date === undefined || date === null || date.trim() === "") {
		// 		return "";
		// 	} else if (time === undefined || time === null || time.trim() === "") {
		// 		if (date.trim().length === 8)
		// 			return date.trim().substr(6, 2) + "." + date.trim().substr(4, 2) + "." +date.trim().substr(0, 4) + " " +"00:00:00";
		// 	} else if (date !== null && date.trim() !== "" && time.trim() !== null && time.trim() !== "") {
		// 		if(date.trim().length === 7){
		// 			date = 0+date;
		// 		}
		// 		if(time.trim().length === 5){
		// 			time = "0"+time;
		// 		}
		// 		if(time.trim().length === 4){
		// 			time = "00"+time;
		// 		}
		// 		if(time.trim().length === 3){
		// 			time = "000"+time;
		// 		}
		// 		if(time.trim().length === 2){
		// 			time = "0000"+time;
		// 		}
		// 		if(time.trim().length === 1){
		// 			time = "00000"+time;
		// 		}
		// 		if (date.trim().length === 8 && time.trim().length >= 4){
		// 			return date.trim().substr(6, 2) + "." + date.trim().substr(4, 2) + "." + date.trim().substr(0, 4) + " " + time.trim().substr(0, 2) +
		// 				":" + time.trim().substr(2, 2) + ":" + time.trim().substr(4, 2);
		// 		}
		// 	} else {
		// 		return "";
		// 	}

		// },

		//code & description concat
		descCodeConcat: function (val1, val2) {
			if (val1 === "" && val2 === "") {
				return "";
			} else if (val2 !== "") {
				return val1 + " " + val2;

			}
		},

		//status for detail page
		statusdforDetailPage: function (status) {
			var i18nModel = this.getView().getModel("i18n");
			if (i18nModel !== undefined) {
				if (status === "O") {
					return i18nModel.getProperty("salesOrderCreatedStatusSales");
				} else if (status === "X") {
					return i18nModel.getProperty("customerCancellationStatusSales");
				} else if (status === "K") {
					return i18nModel.getProperty("orderInProcessStatusSales");
				} else if (status === "W") {
					return i18nModel.getProperty("orderOnHoldStatusSales");
				} else if (status === "B") {
					return i18nModel.getProperty("partialOrderInProcessStatusSales");
				} else if (status === "Q") {
					return i18nModel.getProperty("sDConditionBlockStatusSales");
				} else if (status === "S") {
					return i18nModel.getProperty("deliveryInTransitStatusSales");
				} else if (status === "D") {
					return i18nModel.getProperty("customerConfirmedReceiptStatusSales");
				} else if (status === "R") {
					return i18nModel.getProperty("customerConfirmRejectionStatusSales");
				} else if (status === "M") {
					return i18nModel.getProperty("customerConfirmReceipRejectionStatusSales");
				} else {
					return i18nModel.getProperty("pendingStatusSales");
				}
			}
		},

		//ordering for Tracking Tab
		OrderingStatusFieldTracking: function (val1, level) {
			if (val1 === "O" || val1 === "X") {
				return val1;
			} else {
				//default
				if (level >= 1) {
					return "O";
				} else {
					return "";
				}
			}
		},

		//Processing for Tracking Tab
		processingStatusFieldTracking: function (val1, level) {
			if (val1 === "K" || val1 === "W" || val1 === "B" || val1 === "Q") {
				return val1;
			} else {

				//default
				if (level >= 2) {
					return "K";
				} else {
					return "";
				}
			}
		},

		//Delivery for Tracking Tab
		deliveryStatusFieldTracking: function (val1, level) {
			if (val1 === "S") {
				return val1;
			} else {
				//default
				if (level >= 3) {
					return "S";
				} else {
					return "";
				}
			}
		},

		//Customer Confirmation for Tracking Tab
		customerConfirmationStatusFieldTracking: function (val1, level) {
			if (val1 === "D" || val1 === "R" || val1 === "M") {
				return val1;
			} else {
				if (level >= 4) {
					return "D";
				} else {
					return "";
				}
			}
		},

		//for level check
		forLevelCheckStataus: function (val1) {
			if (val1 === "O" || val1 === "X") {
				return 1;
			} else if (val1 === "K" || val1 === "W" || val1 === "B" || val1 === "Q") {
				return 2;
			} else if (val1 === "S") {
				return 3;
			} else if (val1 === "D" || val1 === "R" || val1 === "M") {
				return 4;
			} else {
				return 0;
			}
		},

		//for f4 code and desc
		f4ValueBind: function (val1, val2) {
			if (val1 && val2) {
				return val1 + " (" + val2 + ")";
			} else if (val1 && !val2) {
				return val1;
			} else if (!val1 && val2) {
				return val2;
			} else {
				return "";
			}
		},

		//deleted duplicate entry value show and hide for document list
		deleteDuplicateRowVal: function (val1) {
			if (val1) {
				return true;
			} else {
				return false;
			}
		},

		//check device if phone hide
		basedDeviceToggeleShow: function (val1) {
			if (val1) {
				return false;
			} else {
				return true;
			}
		},

		//Value
		sameValueReturn: function (val1) {
			return val1;
		},

		//color handle for master list
		masterListIconColorHandle: function (val1) {
			if (val1 === "W") {
				return "#878787";
			} else if (val1 === "B" || val1 === "S") {
				return "green";
			} else {
				return "#AB1032";
			}
		},

		//date convert sent ECC
		DateConversion: function (oDate) {
			if (oDate) {
				var oDateFormat = sap.ui.core.format.DateFormat
					.getTimeInstance({
						pattern: "yyyy-MM-dd\'T\'HH:mm:ss"
					});
				return oDateFormat.format(oDate);
			} else {
				return null;
			}
		},
	};
});