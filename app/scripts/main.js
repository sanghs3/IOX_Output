/**
 * @returns {{initialize: Function, focus: Function, blur: Function}}
 */
geotab.addin.output = function() {
    'use strict';

    // the root container
    var elAddin;
    var api, state;
    var optionsButton = document.getElementById("optionsButton"),
        fullPopUp = document.getElementById("fullPopUp"),
        applyChanges = document.getElementById("applyChanges"),

        vehicleInputButton = document.getElementById("vehicleInputButton"),
        SortbyButton = document.getElementById("SortbyButton"),
        SortbyTypeDropDown = document.getElementById("SortbyTypeDropDown"),
        SortbyTypeDropDownButton = document.getElementById("SortbyTypeDropDownButton"),
        sortbyName = document.getElementById("sortby_Name"),
        sortbyVIN = document.getElementById("sortby_VIN"),
        sortbyCurrentStatus = document.getElementById("sortby_CurrentStatus"),
        sortbySerialNumber = document.getElementById("sortby_SerialNumber"),
        SortbyType = document.getElementById("SortbyType"),
        refreshList = document.getElementById("refreshList"),



        periodPicker_today = document.getElementById("periodPicker_today"),
        periodPicker_yesterday = document.getElementById("periodPicker_yesterday"),
        periodPicker_thisMonth = document.getElementById("periodPicker_thisMonth"),
        periodPicker_lastMonth = document.getElementById("periodPicker_lastMonth"),
        periodPicker_thisWeek = document.getElementById("periodPicker_thisWeek"),
        periodPicker_lastWeek = document.getElementById("periodPicker_lastWeek"),
        periodPicker_custom = document.getElementById("periodPicker_custom"),

        customStartDate = document.getElementById("customStartDate"),
        customEndDate = document.getElementById("customEndDate"),
        StartDate = document.getElementById("startDate"),
        EndDate = document.getElementById("EndDate"),

        resetButton = document.getElementById('vehicleResetSelect'),
        inp = document.getElementById("vehicleSearchInput");

    // Testing Group Filter
    // var changeGroup = document.getElementById("changeGroup");
    // var ChangeGroupALL = document.getElementById("ChangeGroupALL");


    // ChangeGroupALL.addEventListener("click", function() {
    //     groupList = [{ "id": "GroupCompanyId" }];
    //     console.log("Change Group to ALL");
    //     changeGroupState(api, state);
    // })

    // changeGroup.addEventListener("click", function() {
    //     groupList = [{ "id": "b2B66" }];
    //     console.log("Change Group to b2B66");
    //     changeGroupState(api, state);
    // })


    var groupJson = {},
        activeId = [],
        deviceJSON = [],
        timeZone,
        ApiCount = 0,
        currentResp = 0,
        activeArr = [],
        groupList = [];


    // Event Listeners

    optionsButton.addEventListener("click", function() {
        if (fullPopUp.style.display == "block") {
            document.getElementById("vehicleInputButtonClose").setAttribute("style", "display: none;");
            document.getElementById("vehicleInputButtonOpen").setAttribute("style", "display: inline-flex;");
            document.getElementById("vehicleInputButton").value = 1;
            closeAllLists();
            fullPopUp.setAttribute('style', 'display: none;');
        } else {
            fullPopUp.setAttribute('style', 'display: block;');
        }
        event.stopPropagation();
        //dropdownList();
    });

    SortbyButton.addEventListener("click", function() {
        var sortType = document.getElementById("SortbyType").innerHTML;
        sortType = sortType.toLowerCase();
        sortType = sortType.replace(/\s/g, '');
        if (document.getElementById("SortbyButtonDown").style.display == "inline") {
            document.getElementById("SortbyButtonDown").setAttribute("style", "display: none;");
            document.getElementById("SortbyButtonUP").setAttribute("style", "display: inline;");
            sortList(sortType, 0);
        } else {
            document.getElementById("SortbyButtonDown").setAttribute("style", "display: inline;");
            document.getElementById("SortbyButtonUP").setAttribute("style", "display: none;");
            sortList(sortType, 1);
        }
    });

    SortbyTypeDropDownButton.addEventListener("click", function() {
        if (SortbyTypeDropDown.style.display == "inline") {
            SortbyTypeDropDown.setAttribute("style", "display: none;");
        } else {
            SortbyTypeDropDown.setAttribute("style", "display: inline;");
        }
    });

    // Sort by Methods
    sortbyName.addEventListener("click", function() {
        sortbyChange("Name", sortbyName);
    });

    sortbyVIN.addEventListener("click", function() {
        sortbyChange("VIN", sortbyVIN);
    });

    sortbySerialNumber.addEventListener("click", function() {
        sortbyChange("Serial Number", sortbySerialNumber);
    });

    sortbyCurrentStatus.addEventListener("click", function() {
        sortbyChange("Current Status", sortbyCurrentStatus);
    });

    refreshList.addEventListener("click", function() {
        var OptionsstateLoop = document.getElementById("State").getElementsByClassName("horizontalButtonSet")[0].getElementsByTagName("input");
        var optionsState;

        for (var i = 0; i < OptionsstateLoop.length; i++) {
            if (OptionsstateLoop[i].checked) {
                optionsState = OptionsstateLoop[i].id;
            }
        }

        var OptionsMessageStatusLoop = document.getElementById("Message_Status").getElementsByClassName("horizontalButtonSet")[0].getElementsByTagName("input");
        var OptionsMessageStatus;

        for (var j = 0; j < OptionsMessageStatusLoop.length; j++) {
            if (OptionsMessageStatusLoop[j].checked) {
                OptionsMessageStatus = OptionsMessageStatusLoop[j].id;
            }
        }
        var startDateTime = startDate.getAttribute("value");
        var endDateTime = EndDate.getAttribute("value");
        if (document.getElementById("periodPicker_custom").checked) {
            startDateTime = customStartDate.value;
            startDateTime = new Date(startDateTime);
            startDateTime = startDateTime.toISOString();
            endDateTime = customEndDate.value;
            endDateTime = new Date(endDateTime);
            endDateTime = endDateTime.toISOString();
        }

        // Sort
        var sortType = document.getElementById("SortbyType").innerHTML;
        sortType = sortType.toLowerCase();
        sortType = sortType.replace(/\s/g, '');
        var sortdirection = 1;
        deviceJSON = sortArr(deviceJSON, sortType);
        var arrActive = document.getElementById("ResetDevices").getElementsByTagName("span")[0].innerHTML.split(",");
        activeId = [];
        if (arrActive[0] == "All") {
            activeId = Array.from(Array(deviceJSON.length).keys())
        } else if (arrActive[0] == "None") {
            activeId = [];
        } else {
            for (var i = 0; i < arrActive.length; i++) {
                for (var j = 0; j < deviceJSON.length; j++) {
                    if (arrActive[i] == deviceJSON[j].name) {
                        activeId.push(j);
                    }
                }
            }
        }
        sortNum(activeId);
        if (sortdirection == 0) { // Reverse
            activeId.reverse();
        }
        // Table Set-Up
        emptyTable();
        getFeedALLTextMessages(startDateTime, endDateTime, activeId, optionsState, OptionsMessageStatus);
        activeId = [];
    });



    function sortbyChange(strSortby, elm) {
        SortbyType.innerHTML = strSortby;
        sortbyName.checked = false;
        sortbyVIN.checked = false;
        sortbySerialNumber.checked = false;
        sortbyCurrentStatus.checked = false;
        elm.checked = true;
        SortbyTypeDropDownButton.click();
        SortbyButton.click();
    }

    function getActiveId() {
        var arrActive = document.getElementById("ResetDevices").getElementsByTagName("span")[0].innerHTML.split(",");
        activeId = [];
        if (arrActive[0] == "All") {
            activeId = Array.from(Array(deviceJSON.length).keys())
        } else if (arrActive[0] == "None") {
            activeId = [];
        } else {
            for (var i = 0; i < arrActive.length; i++) {
                for (var j = 0; j < deviceJSON.length; j++) {
                    if (arrActive[i] == deviceJSON[j].name) {
                        activeId.push(j);
                    }
                }
            }
        }
        return activeId;
    }

    function sortList(sortType, sortdirection) {
        // Sort
        deviceJSON = sortArr(deviceJSON, sortType);
        activeId = getActiveId();

        sortNum(activeId);
        if (sortdirection == 0) { // Reverse
            activeId.reverse();
        }
        //console.log(activeId);

        // Table Set-Up
        var currentDate = new Date();
        currentDate = currentDate.toISOString();
        var endDateTime = EndDate.getAttribute("value");
        if (document.getElementById("periodPicker_custom").checked) {
            endDateTime = customEndDate.value;
            endDateTime = new Date(endDateTime);
            endDateTime = endDateTime.toISOString();
        }
        var bool = EndDate.getAttribute("value") > currentDate;
        emptyTable();
        for (var i = 0; i < activeId.length; i++) {
            /// getLatestMessage();
            generateTableContentRow(activeId[i], bool);
        }

    }

    function closeAllLists() {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var list = document.getElementById("autocomplete-list");
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
    }

    // Date Functions:

    var getDaysInMonth = function(month, year) {
        return new Date(year, month, 0).getDate();
    };
    var DateFormat = function(DateString) {
        //console.log(typeof(DateString));
        if (DateString < 10) {
            DateString = "0" + DateString;
        }
        return DateString;
    };

    periodPicker_today.addEventListener("click", function() {
        document.getElementById("custom-date").setAttribute("style", "display: none;");
        var current_datetime = new Date();
        var formatted_StartTimeStamp = current_datetime.getFullYear() + "-" + DateFormat((current_datetime.getMonth() + 1)) + "-" + DateFormat(current_datetime.getDate()) + "T00:00";
        var formatted_EndTimeStamp = current_datetime.getFullYear() + "-" + DateFormat((current_datetime.getMonth() + 1)) + "-" + DateFormat(current_datetime.getDate()) + "T23:59";
        formatted_StartTimeStamp = new Date(formatted_StartTimeStamp);
        formatted_EndTimeStamp = new Date(formatted_EndTimeStamp);
        //console.log(formatted_StartTimeStamp.toISOString(), formatted_EndTimeStamp.toISOString());
        StartDate.setAttribute('value', formatted_StartTimeStamp.toISOString());
        EndDate.setAttribute('value', formatted_EndTimeStamp.toISOString());

    });

    periodPicker_yesterday.addEventListener("click", function() {
        document.getElementById("custom-date").setAttribute("style", "display: none;");
        var current_datetime = new Date();
        var formatted_StartTimeStamp = +current_datetime.getFullYear() + "-" + DateFormat(current_datetime.getMonth() + 1) + "-" + DateFormat(current_datetime.getDate() - 1) + "T00:00";
        var formatted_EndTimeStamp = +current_datetime.getFullYear() + "-" + DateFormat(current_datetime.getMonth() + 1) + "-" + DateFormat(current_datetime.getDate() - 1) + "T23:59";
        formatted_StartTimeStamp = new Date(formatted_StartTimeStamp);
        formatted_EndTimeStamp = new Date(formatted_EndTimeStamp);
        StartDate.setAttribute('value', formatted_StartTimeStamp.toISOString());
        EndDate.setAttribute('value', formatted_EndTimeStamp.toISOString());

    });

    periodPicker_thisWeek.addEventListener("click", function() {
        document.getElementById("custom-date").setAttribute("style", "display: none;");
        var startDate = new Date();
        var endDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay());
        endDate.setDate(endDate.getDate() + (6 - endDate.getUTCDay()));
        //console.log(startDate, endDate)
        var formatted_StartTimeStamp = +startDate.getFullYear() + "-" + DateFormat(startDate.getMonth() + 1) + "-" + DateFormat(startDate.getDate()) + "T00:00";
        var formatted_EndTimeStamp = +endDate.getFullYear() + "-" + DateFormat(endDate.getMonth() + 1) + "-" + DateFormat(endDate.getDate()) + "T23:59";
        formatted_StartTimeStamp = new Date(formatted_StartTimeStamp);
        formatted_EndTimeStamp = new Date(formatted_EndTimeStamp);
        //console.log(formatted_StartTimeStamp.toISOString(), formatted_EndTimeStamp.toISOString());
        StartDate.setAttribute('value', formatted_StartTimeStamp.toISOString());
        EndDate.setAttribute('value', formatted_EndTimeStamp.toISOString());
    });

    periodPicker_lastWeek.addEventListener("click", function() {
        document.getElementById("custom-date").setAttribute("style", "display: none;");
        var startDate = new Date();
        var endDate = new Date();
        startDate.setDate(startDate.getDate() - 7 - startDate.getDay());
        endDate.setDate(endDate.getDate() - 7 + (6 - endDate.getUTCDay()));
        //console.log(startDate, endDate)
        var formatted_StartTimeStamp = +startDate.getFullYear() + "-" + DateFormat(startDate.getMonth() + 1) + "-" + DateFormat(startDate.getDate()) + "T00:00";
        var formatted_EndTimeStamp = +endDate.getFullYear() + "-" + DateFormat(endDate.getMonth() + 1) + "-" + DateFormat(endDate.getDate()) + "T23:59";
        formatted_StartTimeStamp = new Date(formatted_StartTimeStamp);
        formatted_EndTimeStamp = new Date(formatted_EndTimeStamp);
        //console.log(formatted_StartTimeStamp.toISOString(), formatted_EndTimeStamp.toISOString());
        StartDate.setAttribute('value', formatted_StartTimeStamp.toISOString());
        EndDate.setAttribute('value', formatted_EndTimeStamp.toISOString());

    });

    periodPicker_thisMonth.addEventListener("click", function() {
        document.getElementById("custom-date").setAttribute("style", "display: none;");
        var current_datetime = new Date();
        var formatted_StartTimeStamp = +current_datetime.getFullYear() + "-" + DateFormat(current_datetime.getMonth() + 1) + "-01T00:00";
        var monthDays = getDaysInMonth(current_datetime.getMonth() + 1, current_datetime.getFullYear())
            //console.log(monthDays)
        var formatted_EndTimeStamp = +current_datetime.getFullYear() + "-" + DateFormat(current_datetime.getMonth() + 1) + "-" + monthDays + "T23:59"
        formatted_StartTimeStamp = new Date(formatted_StartTimeStamp);
        formatted_EndTimeStamp = new Date(formatted_EndTimeStamp);
        //console.log(formatted_StartTimeStamp.toISOString(), formatted_EndTimeStamp.toISOString());
        StartDate.setAttribute('value', formatted_StartTimeStamp.toISOString());
        EndDate.setAttribute('value', formatted_EndTimeStamp.toISOString());

    });

    periodPicker_lastMonth.addEventListener("click", function() {
        document.getElementById("custom-date").setAttribute("style", "display: none;");
        var current_datetime = new Date();
        current_datetime.setDate(current_datetime.getDate() - current_datetime.getDate());
        var formatted_StartTimeStamp = +current_datetime.getFullYear() + "-" + DateFormat(current_datetime.getMonth() + 1) + "-01T00:00";
        var monthDays = getDaysInMonth(current_datetime.getMonth() + 1, current_datetime.getFullYear())
        var formatted_EndTimeStamp = +current_datetime.getFullYear() + "-" + DateFormat(current_datetime.getMonth() + 1) + "-" + monthDays + "T23:59"
        formatted_StartTimeStamp = new Date(formatted_StartTimeStamp);
        formatted_EndTimeStamp = new Date(formatted_EndTimeStamp);
        StartDate.setAttribute('value', formatted_StartTimeStamp.toISOString());
        EndDate.setAttribute('value', formatted_EndTimeStamp.toISOString());

    });

    periodPicker_custom.addEventListener("click", function() {
        document.getElementById("custom-date").setAttribute("style", "display: block;");
    });

    // Close Options

    document.addEventListener("click", function(e) {
        if (document.getElementById("fullPopUp").contains(e.target)) {
            //console.log("hello");
        }
        if (document.getElementById("fullPopUp").style.display == "none" || document.getElementById("fullPopUp").contains(e.target)) {

        } else {
            document.getElementById("fullPopUp").setAttribute('style', 'display: none');
            document.getElementById("vehicleInputButtonClose").setAttribute("style", "display: none;");
            document.getElementById("vehicleInputButtonOpen").setAttribute("style", "display: inline-flex;");
            document.getElementById("vehicleInputButton").value = 1;
        }
    });

    function InatializeCustomDateSelector() {
        var current_datetime = new Date();
        var formatted_StartTimeStamp = current_datetime.getFullYear() + "-" + DateFormat((current_datetime.getMonth() + 1)) + "-" + DateFormat(current_datetime.getUTCDate()) + "T00:00";
        var formatted_EndTimeStamp = current_datetime.getFullYear() + "-" + DateFormat((current_datetime.getMonth() + 1)) + "-" + DateFormat(current_datetime.getUTCDate()) + "T23:59";
        formatted_StartTimeStamp = new Date(formatted_StartTimeStamp);
        formatted_EndTimeStamp = new Date(formatted_EndTimeStamp);

        var StartTime = new Date(formatted_StartTimeStamp.getTime() - (formatted_StartTimeStamp.getTimezoneOffset() * 60000)).toISOString();
        var EndTime = new Date(formatted_EndTimeStamp.getTime() - (formatted_EndTimeStamp.getTimezoneOffset() * 60000)).toISOString();
        //console.log(StartTime.toString())
        StartTime = StartTime.toString().substr(0, StartTime.toString().length - 1);
        EndTime = EndTime.toString().substr(0, EndTime.toString().length - 1);

        customStartDate.setAttribute('placeholder', StartTime.toString());
        customEndDate.setAttribute('placeholder', EndTime.toString());
        customStartDate.setAttribute('value', StartTime.toString());
        customEndDate.setAttribute('value', EndTime.toString());
    }


    function closeAllLists() {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementById("autocomplete-list").childNodes;
        for (var i = 0; i < x.length; i++) {
            x[i].parentNode.removeChild(x[i]);
        }
    }

    applyChanges.addEventListener("click", function() {
        fullPopUp.setAttribute('style', 'display: none');
        submitFourm();
        // State
        var states = document.getElementById("State").childNodes;
        for (var i = 0; i < states.length; i++) {
            //console.log(i);
        }
    });


    function submitFourm() {
        var OptionsstateLoop = document.getElementById("State").getElementsByClassName("horizontalButtonSet")[0].getElementsByTagName("input");
        var optionsState;

        for (var i = 0; i < OptionsstateLoop.length; i++) {
            if (OptionsstateLoop[i].checked) {
                optionsState = OptionsstateLoop[i].id;
            }
        }

        var OptionsMessageStatusLoop = document.getElementById("Message_Status").getElementsByClassName("horizontalButtonSet")[0].getElementsByTagName("input");
        var OptionsMessageStatus;

        for (var j = 0; j < OptionsMessageStatusLoop.length; j++) {
            if (OptionsMessageStatusLoop[j].checked) {
                OptionsMessageStatus = OptionsMessageStatusLoop[j].id;
            }
        }

        // Sort
        var sortType = document.getElementById("SortbyType").innerHTML;
        sortType = sortType.toLowerCase();
        sortType = sortType.replace(/\s/g, '');
        var sortdirection = 1;
        deviceJSON = sortArr(deviceJSON, sortType);
        var arrActive = document.getElementById("ResetDevices").getElementsByTagName("span")[0].innerHTML.split(",");
        activeId = [];
        if (arrActive[0] == "All") {
            activeId = Array.from(Array(deviceJSON.length).keys())
        } else if (arrActive[0] == "None") {
            activeId = [];
        } else {
            for (var i = 0; i < arrActive.length; i++) {
                for (var j = 0; j < deviceJSON.length; j++) {
                    if (arrActive[i] == deviceJSON[j].name) {
                        activeId.push(j);
                    }
                }
            }
        }
        var startDateTime = startDate.getAttribute("value");
        var endDateTime = EndDate.getAttribute("value");
        if (document.getElementById("periodPicker_custom").checked) {
            startDateTime = customStartDate.value;
            startDateTime = new Date(startDateTime);
            startDateTime = startDateTime.toISOString();
            endDateTime = customEndDate.value;
            endDateTime = new Date(endDateTime);
            endDateTime = endDateTime.toISOString();
        }
        //console.log(startDateTime, endDateTime)
        sortNum(activeId);
        if (sortdirection == 0) { // Reverse
            activeId.reverse();
        }
        // Table Set-Up
        emptyTable();
        getFeedALLTextMessages(startDateTime, endDateTime, activeId, optionsState, OptionsMessageStatus);
        activeId = [];
    }

    function stateSort(optionsState, activeId) {
        optionsState = optionsState.substring(12);
        if (optionsState == "ON") {
            optionsState = true;
        }
        if (optionsState == "OFF") {
            optionsState = false;
        }
        var newActiveid = [];
        if (optionsState != "All") {
            for (var i = 0; i < activeId.length; i++) {
                if (deviceJSON[activeId[i]].currentstatus == optionsState) {
                    newActiveid.push(activeId[i]);
                }
            }
        } else {
            newActiveid = activeId;
        }
        //console.log(newActiveid, activeId);
        return newActiveid;
    }

    function MessageStatusSort(messagestatus, activeId) {
        messagestatus = messagestatus.substring(13);
        //console.log(messagestatus);
        var newActiveid = [];
        // //console.log(state, state != "ALL");
        if (messagestatus != "All") {
            var len = 0;
            for (var i = 0; i < activeId.length; i++) {
                len = deviceJSON[activeId[i]].messagestatus.length;
                if (len > 0) {
                    //console.log(deviceJSON[activeId[i]].messagestatus[len - 1]);
                    if (messagestatus == "Sent") {
                        if (deviceJSON[activeId[i]].messagestatus[len - 1].hasOwnProperty("sent")) {
                            newActiveid.push(activeId[i]);
                        }
                    } else {
                        if (deviceJSON[activeId[i]].messagestatus[len - 1].hasOwnProperty("delivered")) {
                            newActiveid.push(activeId[i]);
                        }
                    }
                }
            }
        } else {
            newActiveid = activeId;
        }
        //console.log(newActiveid, activeId);
        return newActiveid;
    }



    function loopThruTable(activeId, searchTextId, updateId) {
        //console.log("Callback");
        currentResp = 0;
        if (searchTextId == "") {
            var currentDate = new Date();
            currentDate = currentDate.toISOString();
            var endDateTime = EndDate.getAttribute("value");
            if (document.getElementById("periodPicker_custom").checked) {
                endDateTime = customEndDate.value;
                endDateTime = new Date(endDateTime);
                endDateTime = endDateTime.toISOString();
            }
            var bool = endDateTime > currentDate;
            // console.log(bool, EndDate.getAttribute("value"), currentDate);
            for (var i = 0; i < activeId.length; i++) {
                generateTableContentRow(activeId[i], bool);
            }
        } else {
            var CurrentActiveIndex = getIndex(updateId);
            var get_Index = -1;
            updateCurrentStatus(CurrentActiveIndex, updateId, searchTextId);
            for (var counter = 0; counter < deviceJSON[CurrentActiveIndex].messagestatus.length; counter++) {
                if (deviceJSON[CurrentActiveIndex].messagestatus[counter].id == searchTextId) {
                    get_Index = counter;
                }
            }
            if (get_Index >= 0) {
                //console.log("RERUN:     ", !(deviceJSON[CurrentActiveIndex].messagestatus[get_Index].hasOwnProperty("delivered")), searchTextId, deviceJSON[CurrentActiveIndex].messagestatus)
                if (!(deviceJSON[CurrentActiveIndex].messagestatus[get_Index].hasOwnProperty("delivered"))) {
                    var Datenow = new Date();
                    var sent = new Date(deviceJSON[CurrentActiveIndex].messagestatus[get_Index].sent);
                    var ThresholdTime = new Date();
                    ThresholdTime.setTime(sent.getTime() + (5 * 60 * 1000));
                    // console.log(Datenow, sent, ThresholdTime);
                    if (Datenow < ThresholdTime) {
                        setTimeout(function() {
                            console.log('Pending...', searchTextId);
                            getTextMessageData(CurrentActiveIndex, searchTextId, activeId, "", "", updateId);
                        }, 20000);
                    }
                }
            } else {
                console.log("Missing Id");
            }

        }


    }

    function getFeedALLTextMessages(startDate, EndDate, activeId, optionsState, OptionsMessageStatus) {
        // console.log(startDate, EndDate, activeId, optionsState, OptionsMessageStatus)
        var version = "0000000000000000";
        var apiParameters = {
            "typeName": "TextMessage",
            "fromVersion": version,
            "search": {
                "fromDate": startDate,
                "toDate": EndDate
            }
        };
        for (var i = 0; i < deviceJSON.length; i++) {
            deviceJSON[i].messagestatus = [];
            deviceJSON[i].currentstatus = "";
        }
        api.call("GetFeed", apiParameters, function(result) {
            for (var counter = result.data.length - 1; counter > 0; counter--) {
                var CurrentActiveIndex = deviceJSON.map(function(x) { return x.id; }).indexOf(result.data[counter].device.id);
                //console.log(CurrentActiveIndex, result.data[counter].id)
                if (deviceJSON[CurrentActiveIndex].messagestatus.length < 15) {

                    if (result.data[counter].hasOwnProperty("messageContent")) {
                        // console.log(1);
                        if (result.data[counter].messageContent.hasOwnProperty("contentType")) {
                            //     console.log(2);
                            if (result.data[counter].messageContent.contentType == "IoxOutput") {
                                //     console.log(3);
                                deviceJSON[CurrentActiveIndex].messagestatus.push(result.data[counter]);

                            }
                        }
                    }

                }
            }
            for (var k = 0; k < deviceJSON.length; k++) {
                if (deviceJSON[k].messagestatus.length > 0) {
                    if (deviceJSON[k].messagestatus.length > 15) {
                        deviceJSON[k].hitMax = true;
                    }

                    if (deviceJSON[k].messagestatus[0].hasOwnProperty("messageContent")) {
                        // console.log(1);
                        if (deviceJSON[k].messagestatus[0].messageContent.hasOwnProperty("contentType")) {
                            //     console.log(2);
                            if (deviceJSON[k].messagestatus[0].messageContent.contentType == "IoxOutput") {
                                //     console.log(3);
                                if (deviceJSON[k].messagestatus[0].hasOwnProperty("delivered")) {
                                    //       console.log(4);
                                    deviceJSON[k].currentstatus = deviceJSON[k].messagestatus[0].messageContent.isRelayOn;
                                    //       console.log(deviceJSON[CurrentActiveIndex].messagestatus[0].messageContent.isRelayOn);
                                }

                            }
                        }
                    }

                }
            }

            activeId = stateSort(optionsState, activeId);
            //console.log(deviceJSON);
            activeId = MessageStatusSort(OptionsMessageStatus, activeId);
            loopThruTable(activeId, "", "");
        }, function(error) {
            console.error("Failed:", error);
        });
    }


    function getTextMessageData(CurrentActiveIndex, searchTextId, activeId, optionsState, OptionsMessageStatus, updateId) {
        var version = "0000000000000000";
        var TextMessage = deviceJSON[CurrentActiveIndex].messagestatus;
        var apiParameters = {
            "typeName": "TextMessage",
            "fromVersion": version,
            "search": {
                "id": searchTextId
            }
        };
        ApiCount++;


        if (ApiCount < 55) {
            api.call("GetFeed", apiParameters, function(result) {
                version = result.toVersion;
                var len = 15;
                //console.log(result);

                TextMessage = [];
                var counter = 0
                var get_Index = -1;
                for (counter = 0; counter < deviceJSON[CurrentActiveIndex].messagestatus.length; counter++) {
                    //console.log(deviceJSON[CurrentActiveIndex].messagestatus[counter].id);
                    if (deviceJSON[CurrentActiveIndex].messagestatus[counter].id == searchTextId) {
                        get_Index = counter;
                    }
                }
                if (get_Index >= 0) {
                    var len = 15;
                    if (deviceJSON[CurrentActiveIndex].messagestatus.length < 15) {
                        len = deviceJSON[CurrentActiveIndex].messagestatus.length;
                    }
                    for (counter = 0; counter < len; counter++) {
                        if (get_Index != counter) {
                            TextMessage.push(deviceJSON[CurrentActiveIndex].messagestatus[counter]);
                        } else {
                            TextMessage.push(result.data[0]);
                        }
                    }
                } else {
                    var len = 14;
                    if (deviceJSON[CurrentActiveIndex].messagestatus.length < 15) {
                        len = deviceJSON[CurrentActiveIndex].messagestatus.length - 1;
                    }
                    TextMessage.push(result.data[0]);
                    for (counter = 0; counter < len; counter++) {
                        //console.log("xxx          ---- ", deviceJSON[CurrentActiveIndex].messagestatus);
                        TextMessage.push(deviceJSON[CurrentActiveIndex].messagestatus[counter]);
                    }

                }
                //console.log(TextMessage);

                // Set Message Status
                deviceJSON[CurrentActiveIndex].messagestatus = TextMessage;

                //console.log(deviceJSON[CurrentActiveIndex], CurrentActiveIndex, activeId)
                // Set Current Status
                if (deviceJSON[CurrentActiveIndex].messagestatus.length > 0) {
                    // var len = deviceJSON[CurrentActiveIndex].messagestatus.length - 1;

                    if (deviceJSON[CurrentActiveIndex].messagestatus[0].hasOwnProperty("messageContent")) {
                        // console.log(1);
                        if (deviceJSON[CurrentActiveIndex].messagestatus[0].messageContent.hasOwnProperty("contentType")) {
                            //     console.log(2);
                            if (deviceJSON[CurrentActiveIndex].messagestatus[0].messageContent.contentType == "IoxOutput") {
                                //     console.log(3);
                                if (deviceJSON[CurrentActiveIndex].messagestatus[0].hasOwnProperty("delivered")) {
                                    //       console.log(4);
                                    deviceJSON[CurrentActiveIndex].currentstatus = deviceJSON[CurrentActiveIndex].messagestatus[0].messageContent.isRelayOn;
                                    //       console.log(deviceJSON[CurrentActiveIndex].messagestatus[0].messageContent.isRelayOn);
                                }

                            }
                        }
                    }

                }


                //console.log(deviceJSON[CurrentActiveIndex], CurrentActiveIndex);
                currentResp++;
                //console.log("Done: ", CurrentActiveIndex);
                //console.log("currentResp", currentResp, activeId.length);
                //console.log(optionsState, activeId)
                activeId = stateSort(optionsState, activeId);
                activeId = MessageStatusSort(OptionsMessageStatus, activeId);
                loopThruTable(activeId, searchTextId, updateId);

            }, function(e) {
                console.error("Failed:", e);
            });
        } else {
            ApiCount = 0;
            console.log('Hit API Limit: 60 Request/min');
            setTimeout(function() {
                getTextMessageData(CurrentActiveIndex, searchTextId, activeId, optionsState, OptionsMessageStatus, updateId);
            }, 60000);
        }

    }

    function emptyTable() {
        var deviceContentList = document.getElementById("deviceContentList");
        while (deviceContentList.firstChild) {
            deviceContentList.removeChild(deviceContentList.firstChild);
        }
    }

    function generateTableContentRow(CurrentActiveIndex, bool) {
        var colmnTitles = ["Name", "Serial Number", "VIN", "Current Status", "Message Status"]
        var deviceContentList = document.getElementById("deviceContentList");

        var tr = document.createElement("tr");
        tr.setAttribute("class", "grid__row");

        for (var i = 0; i < colmnTitles.length; i++) {
            var td = document.createElement("td");
            td.setAttribute("class", "grid__cell grey ellipsis grid__cell__border");
            if (colmnTitles[i] == "Name") {
                var div = document.createElement("div");
                div.setAttribute("class", "first-row");
                var a = document.createElement("a");
                a.setAttribute("class", "first-row__device-link first-row__device-link__hover");
                a.setAttribute("href", "#device,id:" + deviceJSON[CurrentActiveIndex].id);
                var mainText = document.createElement("div");
                mainText.setAttribute("class", "mainText");
                mainText.innerHTML = deviceJSON[CurrentActiveIndex].name;
                var secondaryText = document.createElement("div");
                secondaryText.setAttribute("class", "secondaryText");
                secondaryText.innerHTML = getGroups(CurrentActiveIndex);
                a.append(mainText);
                a.append(secondaryText);
                div.append(a);
                td.append(div);
                td.setAttribute("style", "max-width: 160px; min-width: 160px; display: table-cell;text-align: left;");
            } else {
                var spanUpper = document.createElement("span");
                spanUpper.setAttribute("class", "secondaryText");
                spanUpper.setAttribute("title", colmnTitles[i]);
                var spanInner = document.createElement("span");
            }
            if (colmnTitles[i] == "Serial Number") {
                spanInner.innerHTML = deviceJSON[CurrentActiveIndex].serialnumber;
                td.setAttribute("style", "max-width: 160px; min-width: 160px; display: table-cell;text-align: center;");
            }
            if (colmnTitles[i] == "VIN") {
                if (deviceJSON[CurrentActiveIndex].vin == "00000000") {
                    spanInner.innerHTML = "";
                } else {
                    spanInner.innerHTML = deviceJSON[CurrentActiveIndex].vin;
                }
                td.setAttribute("style", "max-width: 160px; min-width: 160px; display: table-cell;text-align: center;");
            }
            if (colmnTitles[i] == "Current Status") {
                //console.log(typeof deviceJSON[CurrentActiveIndex].currentstatus === "boolean")
                spanInner.setAttribute("id", "cs_" + deviceJSON[CurrentActiveIndex].id);
                if (typeof deviceJSON[CurrentActiveIndex].currentstatus === "boolean") {
                    var button = document.createElement("button");
                    //console.log(deviceJSON[CurrentActiveIndex].currentstatus)
                    if (deviceJSON[CurrentActiveIndex].currentstatus) {
                        button.setAttribute("class", "geotabButton positiveButton");
                        button.setAttribute("style", "width:50%;");
                        button.innerHTML = "ON";
                    } else {
                        button.setAttribute("class", "geotabButton negativeButton");
                        button.setAttribute("style", "width:50%;");
                        button.innerHTML = "OFF";
                    }
                    spanInner.append(button);
                }
                //console.log(currentstatusSTR);
                td.setAttribute("style", "max-width: 100px; min-width: 100px; display: table-cell;text-align: center;");
            }
            if (colmnTitles[i] == "Message Status") {
                spanInner.setAttribute("id", "ms_" + deviceJSON[CurrentActiveIndex].id);
                if (deviceJSON[CurrentActiveIndex].messagestatus.length > 0) {
                    var table1 = document.createElement("table");
                    var delivered = "";
                    for (var j = 0; j < deviceJSON[CurrentActiveIndex].messagestatus.length; j++) {
                        if (deviceJSON[CurrentActiveIndex].messagestatus[j].hasOwnProperty("messageContent")) {
                            if (deviceJSON[CurrentActiveIndex].messagestatus[j].messageContent.hasOwnProperty("contentType")) {
                                if (deviceJSON[CurrentActiveIndex].messagestatus[j].messageContent.contentType == "IoxOutput") {
                                    //console.log(deviceJSON[CurrentActiveIndex].messagestatus[j])
                                    var tr1 = document.createElement("tr");
                                    var th1 = document.createElement("th");
                                    th1.setAttribute("rowspan", 2);
                                    var td2 = document.createElement("td");

                                    var tr2 = document.createElement("tr");
                                    var td3 = document.createElement("td");
                                    if (j >= 5) {
                                        tr1.setAttribute("style", "display:none;");
                                        tr2.setAttribute("style", "display:none;");
                                    }
                                    if (deviceJSON[CurrentActiveIndex].messagestatus[j].hasOwnProperty("delivered")) {
                                        delivered = covertTimeZone(deviceJSON[CurrentActiveIndex].messagestatus[j].delivered, timeZone);
                                    } else {
                                        delivered = "Pending ..."
                                    }
                                    var button = document.createElement("button");
                                    if (deviceJSON[CurrentActiveIndex].messagestatus[j].messageContent.isRelayOn) {
                                        button.setAttribute("class", "geotabButton positiveButton")
                                        button.setAttribute("style", "width:100%;");
                                        button.innerHTML = "ON";
                                        th1.append(button);
                                    } else {
                                        button.setAttribute("class", "geotabButton negativeButton")
                                        button.setAttribute("style", "width:100%;");
                                        button.innerHTML = "OFF";
                                        th1.append(button);
                                    }
                                    td2.innerHTML = "<b>Sent: </b>" + covertTimeZone(deviceJSON[CurrentActiveIndex].messagestatus[j].sent, timeZone);
                                    td3.innerHTML = "<b>Delivered: </b>" + delivered;
                                    tr1.append(th1);
                                    tr1.append(td2);
                                    tr2.append(td3);
                                    tr1.setAttribute("value", deviceJSON[CurrentActiveIndex].messagestatus[j].id)
                                    table1.append(tr1);
                                    table1.append(tr2);
                                    //console.log(table1);
                                    //temp = "<b>Sent: </b>" + deviceJSON[CurrentActiveIndex].messagestatus[j].sent + "<br><b>Delivered: </b>" + delivered + "<br><br><br>";
                                }
                            }
                        }
                    }
                    //console.log(deviceJSON[CurrentActiveIndex]);

                    var PEnd = document.createElement("p");
                    PEnd.innerHTML = "Please decrease time window to see other results."
                    PEnd.setAttribute("style", "display:none;");
                    PEnd.setAttribute("id", "Pend" + deviceJSON[CurrentActiveIndex].id);
                    spanInner.append(PEnd);

                    spanInner.append(table1);
                    //console.log(table1.childNodes);
                    if (table1.childNodes.length > 10) {
                        var center = document.createElement("center");
                        var button = document.createElement("button");
                        button.setAttribute("class", "geotabButton");
                        button.setAttribute("id", "Expand_" + deviceJSON[CurrentActiveIndex].id);
                        button.addEventListener("click", function() {
                            expandMoreLess(this.getAttribute("id"));
                        });
                        button.innerHTML = "Expand display";
                        center.append(button);
                        spanInner.append(center);
                    }

                } else {
                    spanInner.innerHTML = ""
                }


            }
            if (colmnTitles[i] != "Name") {
                spanUpper.append(spanInner);
                td.append(spanUpper);
            }
            tr.append(td);
        }
        var td = document.createElement("td");
        td.setAttribute("class", "grid__cell grey ellipsis grid__cell__border");
        td.setAttribute("style", "max-width: 160px; min-width: 160px; display: table-cell;");
        var span = document.createElement("span");
        span.setAttribute("id", "toggle_" + deviceJSON[CurrentActiveIndex].id);
        span.setAttribute("class", "horizontalButtonSet")
        span.setAttribute("style", "display: flex;align-items: center;justify-content: center;");
        var inputON = document.createElement("input");
        inputON.setAttribute("type", "radio");
        inputON.setAttribute("id", "ON" + deviceJSON[CurrentActiveIndex].id);
        inputON.setAttribute("class", "geotabSwitchButton");
        inputON.setAttribute("name", "triger" + deviceJSON[CurrentActiveIndex].id);
        var labelON = document.createElement("label");
        //labelON.setAttribute("class", "geotabButton onLabelSwitcher noTranslate");
        if (bool) {
            labelON.setAttribute("class", "geotabButton");
        } else {
            labelON.setAttribute("class", "geotabButton disabled");
        }
        labelON.setAttribute("for", "true" + deviceJSON[CurrentActiveIndex].id);
        labelON.setAttribute("style", "width:20%;");
        labelON.innerHTML = "ON";

        var inputOFF = document.createElement("input");
        inputOFF.setAttribute("type", "radio");
        inputOFF.setAttribute("id", "OFF" + deviceJSON[CurrentActiveIndex].id);
        inputOFF.setAttribute("class", "geotabSwitchButton");
        inputOFF.setAttribute("name", "triger" + deviceJSON[CurrentActiveIndex].id);
        var labelOFF = document.createElement("label");
        //labelOFF.setAttribute("class", "geotabButton offLabelSwitcher noTranslate");
        if (bool) {
            labelOFF.setAttribute("class", "geotabButton");
        } else {
            labelOFF.setAttribute("class", "geotabButton disabled");
        }
        labelOFF.setAttribute("for", "false" + deviceJSON[CurrentActiveIndex].id);
        labelOFF.setAttribute("style", "width:20%;");

        labelOFF.innerHTML = "OFF";

        // Append Elements:
        labelON.addEventListener("click", function() {
            triggerIOX(this.getAttribute("for"));
        });
        labelOFF.addEventListener("click", function() {
            triggerIOX(this.getAttribute("for"));
        });
        span.append(inputON);
        span.append(labelON);
        span.append(inputOFF);
        span.append(labelOFF);
        td.append(span);
        tr.append(td);
        deviceContentList.append(tr);
    }

    function updateCurrentStatus(CurrentActiveIndex, updateId, searchTextId) {

        var row = document.getElementById("cs_" + updateId);
        //  console.log(deviceJSON[CurrentActiveIndex]);
        if (typeof deviceJSON[CurrentActiveIndex].currentstatus === "boolean") {
            //console.log(deviceJSON[CurrentActiveIndex]);
            if (row.childNodes.length > 0) {
                var button = row.getElementsByTagName("button")[0];
            } else {
                var button = document.createElement("button");
                row.append(button);
            }
            if (deviceJSON[CurrentActiveIndex].currentstatus) {
                button.setAttribute("class", "geotabButton positiveButton")
                button.setAttribute("style", "width:50%;");
                button.innerHTML = "ON";
            } else {
                button.setAttribute("class", "geotabButton negativeButton")
                button.setAttribute("style", "width:50%;");
                button.innerHTML = "OFF";
            }
        }
        updateMessageStatus(updateId, CurrentActiveIndex, searchTextId);
    }

    function updateMessageStatus(id, CurrentActiveIndex, searchTextId) {
        //console.log(searchTextId);
        var row = document.getElementById("ms_" + id);
        var delivered = "";
        var table1;
        //console.log(deviceJSON[CurrentActiveIndex], searchTextId);
        if (deviceJSON[CurrentActiveIndex].messagestatus.length > 0) {
            table1 = row.getElementsByTagName("table")[0];
            if (typeof table1 === 'undefined') {
                table1 = document.createElement('table');
                row.append(table1);
            }
            //console.log("Update", lastChild, deviceJSON[CurrentActiveIndex].messagestatus.length);
            if (table1.childNodes.length > 0) {
                var index = -1;
                for (var i = 0; i < table1.childNodes.length; i++) {
                    if (table1.childNodes[i].getAttribute("value") == searchTextId) {
                        index = i;
                    }
                }
                //console.log(searchTextId, index);
                if (index >= 0) {
                    //console.log(index, searchTextId);
                    var deviceIndex = -1;
                    for (var j = 0; j < deviceJSON[CurrentActiveIndex].messagestatus.length; j++) {
                        if (deviceJSON[CurrentActiveIndex].messagestatus[j].id == searchTextId) {
                            deviceIndex = j;
                        }
                    }
                    //console.log(index, searchTextId, deviceJSON[CurrentActiveIndex].messagestatus[deviceIndex].id);
                    // console.log(deviceJSON[CurrentActiveIndex].messagestatus[deviceIndex], deviceJSON[CurrentActiveIndex].messagestatus);
                    if (deviceIndex >= 0) {
                        if (deviceJSON[CurrentActiveIndex].messagestatus[deviceIndex].hasOwnProperty("delivered")) {
                            delivered = covertTimeZone(deviceJSON[CurrentActiveIndex].messagestatus[deviceIndex].delivered, timeZone);
                        } else {
                            delivered = "Pending ..."
                        }
                    } else {
                        delivered = "Pending ..."
                    }

                    //console.log("YES  ", searchTextId, delivered);
                    table1.childNodes[index + 1].childNodes[0].innerHTML = "<b>Delivered: </b>" + delivered;
                } else {
                    updateHTMLTable(table1, CurrentActiveIndex);
                }
            } else {
                updateHTMLTable(table1, CurrentActiveIndex);
            }

        } else {
            row.innerHTML = ""
        }

    }

    function updateHTMLTable(table1, CurrentActiveIndex) {
        var len = deviceJSON[CurrentActiveIndex].messagestatus.length - 1;
        var delivered = "";


        //  console.log(table1.childNodes.length);
        if (len > 8) {
            table1.removeChild(table1.lastChild);
            table1.removeChild(table1.lastChild);
        }
        //console.log(table1.childNodes.length);
        var tr1 = document.createElement("tr");
        var th1 = document.createElement("th");
        th1.setAttribute("rowspan", 2);
        var td2 = document.createElement("td");
        var tr2 = document.createElement("tr");
        var td3 = document.createElement("td");
        if (deviceJSON[CurrentActiveIndex].messagestatus[0].hasOwnProperty("delivered")) {
            delivered = covertTimeZone(deviceJSON[CurrentActiveIndex].messagestatus[0].delivered, timeZone);
        } else {
            delivered = "Pending ..."
        }
        var button = document.createElement("button");
        if (deviceJSON[CurrentActiveIndex].messagestatus[0].messageContent.isRelayOn) {
            button.setAttribute("class", "geotabButton positiveButton")
            button.innerHTML = "ON";
            th1.append(button);
        } else {
            button.setAttribute("class", "geotabButton negativeButton")
            button.innerHTML = "OFF";
            th1.append(button);
        }
        td2.innerHTML = "<b>Sent: </b>" + covertTimeZone(deviceJSON[CurrentActiveIndex].messagestatus[0].sent, timeZone);
        td3.innerHTML = "<b>Delivered: </b>" + delivered;
        tr1.append(th1);
        tr1.append(td2);
        tr2.append(td3);
        tr1.setAttribute("value", deviceJSON[CurrentActiveIndex].messagestatus[0].id)

        if (table1.childNodes.length > 0) {
            table1.insertBefore(tr2, table1.firstChild);
            table1.insertBefore(tr1, table1.firstChild);
        } else {
            table1.append(tr1);
            table1.append(tr2);
        }
        if (table1.childNodes.length > 10) {
            table1.childNodes[10].setAttribute("style", "display:none;");
            table1.childNodes[11].setAttribute("style", "display:none;");
        }

    }

    function getGroups(CurrentActiveIndex) {
        var stringGroups = [];
        for (var i = 0; i < deviceJSON[CurrentActiveIndex].groups.length; i++) {
            stringGroups.push(groupJson[deviceJSON[CurrentActiveIndex].groups[i].id]);
        }
        stringGroups = stringGroups.toString()
        return stringGroups;
    }

    function sortArr(Arr, sortType) {
        Arr.sort(function(a, b) {
            return a[sortType].toString().localeCompare(b[sortType].toString());

        })
        return Arr;
    }

    function sortNum(Arr) {
        Arr.sort(function(a, b) {
            return a > b ? 1 : b > a ? -1 : 0;
        })
        return Arr;
    }

    function covertTimeZone(timestamp, timeZone) {
        return new Date(timestamp).toLocaleString('en-US', { timeZone: timeZone });
    }

    function triggerIOX(id) {
        var arr = id.split('b');
        arr[1] = 'b' + arr[1];
        var ONbutton = document.getElementById("toggle_" + arr[1]).getElementsByTagName("label")[0];
        var OFFbutton = document.getElementById("toggle_" + arr[1]).getElementsByTagName("label")[1];

        if (!(ONbutton.getAttribute("class").includes("disabled")) || !(OFFbutton.getAttribute("class").includes("disabled"))) {
            //console.log(arr);

            activeId = getActiveId();
            sortNum(activeId);

            api.call("Add", {
                    "typeName": "TextMessage",
                    "entity": {
                        "device": { "id": arr[1] },
                        "messageContent": { "isRelayOn": arr[0], "contentType": "IoxOutput" },
                        "isDirectionToVehicle": true
                    }
                },
                function(data) {
                    var CurrentActiveIndex = getIndex(arr[1]);
                    getTextMessageData(CurrentActiveIndex, data, activeId, "", "", arr[1]);
                    //console.log(data)
                });

        } else {
            console.log("Disabled: Not Live");
        }
    }

    function getIndex(id) {
        for (var i = 0; i < deviceJSON.length; i++) {
            //console.log(deviceJSON[i].id == id)
            if (deviceJSON[i].id == id) {
                return i;
            }
        }
    }

    function expandMoreLess(buttonid) {
        var id = buttonid.substring(7);
        var button = document.getElementById(buttonid);
        //  console.log(button.innerHTML, button.innerHTML == "Reduce display")
        if (button.innerHTML == "Expand display") {
            button.innerHTML = "Reduce display";
            expandMore(id);
        } else if (button.innerHTML == "Reduce display") {
            button.innerHTML = "Expand display";
            expandLess(id);
        }

    }

    function expandMore(id) {
        var table = document.getElementById('ms_' + id).getElementsByTagName("table")[0].childNodes;
        var i;
        for (i = 10; i < table.length; i++) {
            table[i].removeAttribute("style");
            table[i].setAttribute("style", "width: 100%;");
        }
        if (table.length == 30) {
            document.getElementById("Pend" + id).removeAttribute("style");
        }
    }

    function expandLess(id) {
        var table = document.getElementById('ms_' + id).getElementsByTagName("table")[0].childNodes;
        var i;
        for (i = 10; i < table.length; i++) {
            table[i].setAttribute("style", "display:none;");
        }
        document.getElementById("Pend" + id).setAttribute("style", "display:none;");
    }

    function groupAPIcall(api) {
        //console.log("apiccount   :   ", ApiCount)
        if (ApiCount < 55) {
            ApiCount++;
            api.call("Get", { "typeName": "Group" },
                function(data) {
                    for (var i = 0; i < data.length; i++) {
                        groupJson[data[i].id] = data[i].name;
                    }
                    //console.log(groupJson);
                },
                function(e) {
                    console.error("Failed:", e);
                });
        } else {
            ApiCount = 0;
            console.log('Hit API Limit: 60 Request/min');
            setTimeout(function() {
                groupAPIcall(api);
            }, 60000);
        }

    }

    function changeGroupState(api, state) {
        groupList = state.getGroupFilter();
        //console.log(groupList)
        deviceJSON = [];
        api.call("Get", { "typeName": "Device", "search": { "fromDate": new Date().toISOString(), "groups": groupList } },
            function(result) {
                var currentDevice = {};
                for (var i = 0; i < result.length; i++) {
                    if (result[i].vehicleIdentificationNumber == "" || result[i].vehicleIdentificationNumber == undefined) {
                        currentDevice = {
                            "name": result[i].name,
                            "id": result[i].id,
                            "serialnumber": result[i].serialNumber,
                            "groups": result[i].groups,
                            "vin": "00000000",
                            "messagestatus": [],
                            "currentstatus": "",
                            "hitMax": false
                        };

                    } else {
                        currentDevice = {
                            "name": result[i].name,
                            "id": result[i].id,
                            "serialnumber": result[i].serialNumber,
                            "groups": result[i].groups,
                            "vin": result[i].vehicleIdentificationNumber,
                            "messagestatus": [],
                            "currentstatus": "",
                            "hitMax": false
                        };
                    }
                    deviceJSON.push(currentDevice);
                }
                SortbyButton.click();
                //  console.log(deviceJSON);
            },
            function(e) {
                console.error("Failed:", e);
            });

    }

    function toggleDropdown() {
        currentFocus = -1;
        var vehicleInputButtonstate = document.getElementById("vehicleInputButton").value;
        if (vehicleInputButtonstate == 1) {
            document.getElementById("vehicleInputButtonClose").setAttribute("style", "display: inline-flex;");
            document.getElementById("vehicleInputButtonOpen").setAttribute("style", "display: none;");
            document.getElementById("vehicleInputButton").value = 0;
            document.getElementById("autocompleteDropDown").setAttribute("style", "display:block; width: 90%;height: 135px;");
            buildList("");
            console.log("Open List");
        } else {
            document.getElementById("vehicleInputButtonClose").setAttribute("style", "display: none;");
            document.getElementById("vehicleInputButtonOpen").setAttribute("style", "display: inline-flex;");
            document.getElementById("vehicleInputButton").value = 1;
            document.getElementById("autocompleteDropDown").setAttribute("style", "display:none;");
            closeAllLists();
            console.log("Close List");
        }
    }
    vehicleInputButton.addEventListener("click", function(e) {
        toggleDropdown();
    });

    resetButton.addEventListener("click", function(e) {
        removeAll();
    });



    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var val = inp.value;
        var vehicleInputButtonstate = vehicleInputButton.value;

        /*close any already open lists of autocompleted values*/
        closeAllLists();
        // Change Vehicle Input Button
        if (val.length > 0 && vehicleInputButtonstate == 1) {
            document.getElementById("vehicleInputButtonClose").setAttribute("style", "display: inline-flex;");
            document.getElementById("vehicleInputButtonOpen").setAttribute("style", "display: none;");
            vehicleInputButtonstate = 0;
        } else if (val.length == 0 && vehicleInputButtonstate == 0) {
            document.getElementById("vehicleInputButtonClose").setAttribute("style", "display: none;");
            document.getElementById("vehicleInputButtonOpen").setAttribute("style", "display: inline-flex;");
            vehicleInputButtonstate = 1;
        }


        if (!val) { return false; }
        currentFocus = -1;
        buildList(val);
    });

    inp.addEventListener("click", function(e) {
        console.log("Click Input");
        toggleDropdown();
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        //console.log(currentFocus);
        var x = document.getElementById("autocomplete-list");
        if (x) x = x.getElementsByTagName("label");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        removeActive(x);
        /*start by removing the "active" class on all items:*/
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        //console.log(x, currentFocus);
        x[currentFocus].classList.add("autocomplete-active");

    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists() {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var list = document.getElementById("autocomplete-list");
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

    }

    function buildList(val) {
        var a, b, i;
        /*create a DIV element that will contain the items (values):*/
        a = document.getElementById("autocomplete-list");

        /*for each item in the array...*/
        var li = document.createElement("li");
        li.setAttribute("class", "selectButton");
        li.setAttribute("title", "selectButton");

        // Create Input
        var input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("class", "geotabSwitchButton");
        input.setAttribute("data-type", "4");
        input.setAttribute("title", "selectremoveall");

        b = document.createElement("label");
        b.setAttribute("class", "geotabButton ellipsis");
        b.setAttribute("style", "display: block;");
        b.addEventListener("click", function(e) {
            selectAll();
        });
        b.setAttribute("id", "selectAll");
        b.innerHTML = "<span class='icon geotabIcons_status'></span>";
        b.innerHTML += "Select all";
        li.append(input);
        li.append(b);
        a.append(li);

        //Separator
        li = document.createElement("li");
        li.setAttribute("class", "separator");
        a.append(li);

        if (activeArr.length == deviceJSON.length) {
            toggleSelectAll("all");
        }
        //console.log(deviceJSON);

        for (i = 0; i < deviceJSON.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (deviceJSON[i].name.toUpperCase().includes(val.toUpperCase())) {
                /*create a DIV element for each matching element:*/
                li = document.createElement("li");
                li.setAttribute("class", "selectButton");
                li.setAttribute("title", "selectButton");
                // Create Input
                input = document.createElement("input");
                input.setAttribute("type", "checkbox");
                input.setAttribute("title", deviceJSON[i].name);
                input.setAttribute("class", "geotabSwitchButton");
                input.setAttribute("data-type", "4");
                input.setAttribute("id", "input" + i);
                if (activeArr.includes(deviceJSON[i].name)) {
                    input.checked = true;
                } else {
                    input.checked = false;
                }

                // Create Label
                b = document.createElement("label");
                b.setAttribute("title", deviceJSON[i].name);
                /*make the matching letters bold:*/

                b.setAttribute("class", "geotabButton ellipsis");
                b.setAttribute("style", "display: block;");
                b.setAttribute("id", "a" + i);
                b.setAttribute("for", "input" + i);
                b.innerHTML += "<span class='icon geotabIcons_vehicle'></span>";
                b.innerHTML += deviceJSON[i].name;
                /*insert a input field that will hold the current array item's value:*/
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    //console.log(document.getElementById("input"+ this.id.slice(1)).value)
                    addToSelected(document.getElementById("input" + this.id.slice(1)).title, this.id);
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    //closeAllLists();
                });
                li.append(input);
                li.append(b);
                a.appendChild(li);
            }
        }

    }

    function selectAll() {
        var childNodes = document.getElementById("autocomplete-list").childNodes;
        for (var count = 0; count < childNodes.length; count++) {
            if (!(childNodes[count].classList == "separator")) {
                if (!activeArr.includes(childNodes[count].getElementsByTagName("input")[0].title) && childNodes[count].getElementsByTagName("input")[0].title != "selectremoveall") {
                    activeArr.push(childNodes[count].getElementsByTagName("input")[0].title);
                    childNodes[count].getElementsByTagName("input")[0].checked = true;
                }
            }
        }
        addToSelected("selectremoveall", "");
    }

    function removeAll() {
        document.getElementById("ResetDevices").getElementsByTagName("span")[0].innerHTML = "None";
        activeArr = [];
        var dropdownList = document.getElementById("autocomplete-list").childNodes;
        for (var i = 0; i < dropdownList.length; i++) {
            if (!(dropdownList[i].classList == "separator")) {
                dropdownList[i].getElementsByTagName("input")[0].checked = false;
            }
        }
    }

    function addToSelected(selectedStr, id) {
        if (selectedStr != "selectremoveall") {
            if (activeArr.includes(selectedStr)) {
                // Remove from activeArr;
                var index = activeArr.indexOf(selectedStr);
                activeArr.splice(index, 1);
                var b = document.getElementById("selectAll");
                if (activeArr.length < deviceJSON.length && document.getElementById("selectAll").getElementsByTagName("span")[0].classList.value == "icon geotabIcons_broom") {
                    toggleSelectAll("none");
                }
                if (activeArr.length == deviceJSON.length && document.getElementById("selectAll").getElementsByTagName("span")[0].classList.value == "icon geotabIcons_status") {
                    toggleSelectAll("none");
                }
                updateActiveArr(id);
            } else if (!activeArr.includes(selectedStr)) {
                // Add to activeArr
                activeArr.push(selectedStr);
                updateActiveArr(id);
            }
        } else {
            //console.log(selectedStr);
            updateActiveArr(id);
        }
    }

    function updateActiveArr(id) {
        if (activeArr.length == deviceJSON.length) {
            document.getElementById("ResetDevices").getElementsByTagName("span")[0].innerHTML = "All";
            toggleSelectAll("all");
        } else if (activeArr.length == 0) {
            document.getElementById("ResetDevices").getElementsByTagName("span")[0].innerHTML = "None";
        } else {
            document.getElementById("ResetDevices").getElementsByTagName("span")[0].innerHTML = activeArr.toString();
        }
    }

    function toggleSelectAll(removetype) {
        var b = document.getElementById("selectAll");
        if (b.getElementsByClassName("icon")[0].classList.contains("geotabIcons_status")) {
            b.innerHTML = "<span class='icon geotabIcons_broom'></span>";
            b.innerHTML += "Remove all";
            b.innerHTML += "<input type='hidden' value='selectremoveall'>";
        } else {
            b.innerHTML = "<span class='icon geotabIcons_status'></span>";
            b.innerHTML += "Select all";
            b.innerHTML += "<input type='hidden' value='selectremoveall'>";
            if (removetype == "all") {
                removeAll();
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function(e) {
        //console.log(e.target);
        //console.log(document.getElementById("autocomplete-list").contains(e.target),e.target);
        if (document.getElementById("autocomplete").contains(e.target) || document.getElementById("autocomplete-list").contains(e.target) || document.getElementById("closeAutocomplete").contains(e.target)) {
            //console.log("hello");
        } else {
            document.getElementById("vehicleInputButton").value = 0;
            toggleDropdown();
        }
    });



    return {
        /**
         * initialize() is called only once when the Add-In is first loaded. Use this function to initialize the
         * Add-In's state such as default values or make API requests (MyGeotab or external) to ensure interface
         * is ready for the user.
         * @param {object} freshApi - The GeotabApi object for making calls to MyGeotab.
         * @param {object} freshState - The page state object allows access to URL, page navigation and global group filter.
         * @param {function} initializeCallback - Call this when your initialize route is complete. Since your initialize routine
         *        might be doing asynchronous operations, you must call this method when the Add-In is ready
         *        for display to the user.
         */
        initialize: function(freshApi, freshState, initializeCallback) {
            elAddin = document.querySelector('#output');

            api = freshApi;
            state = freshState;
            groupAPIcall(api);
            periodPicker_today.click();
            InatializeCustomDateSelector();
            //changeGroupState(api, state);
            // Autocomplete Vehicle Search
            //console.log(deviceNameArr);

            //

            // MUST call initializeCallback when done any setup
            initializeCallback();
        },

        /**
         * focus() is called whenever the Add-In receives focus.
         *
         * The first time the user clicks on the Add-In menu, initialize() will be called and when completed, focus().
         * focus() will be called again when the Add-In is revisited. Note that focus() will also be called whenever
         * the global state of the MyGeotab application changes, for example, if the user changes the global group
         * filter in the UI.
         *
         * @param {object} freshApi - The GeotabApi object for making calls to MyGeotab.
         * @param {object} freshState - The page state object allows access to URL, page navigation and global group filter.
         */
        focus: function(freshApi, freshState) {

            api = freshApi;
            state = freshState;


            // example of setting url state
            // freshState.setState({
            //     groups: state.getGroupFilter().map(x => x.id)
            // });
            groupAPIcall(api);
            changeGroupState(api, state);


            // getting the current user info
            freshApi.getSession(session => {
                //elAddin.querySelector('#output-user').textContent = session.userName;
                //  console.log(session);
                // Get Timezone Info
                api.call("Get", { "typeName": "User", "search": { "name": session.userName } }, function(result) {
                    timeZone = result[0].timeZoneId;
                });

            });
            // show main content
            elAddin.className = '';
        },



        /**
         * blur() is called whenever the user navigates away from the Add-In.
         *
         * Use this function to save the page state or commit changes to a data store or release memory.
         *
         * @param {object} freshApi - The GeotabApi object for making calls to MyGeotab.
         * @param {object} freshState - The page state object allows access to URL, page navigation and global group filter.
         */
        blur: function() {
            // hide main content
            elAddin.className = 'hidden';
        }
    };
}