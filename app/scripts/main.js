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
        EndDate = document.getElementById("EndDate");

    var groupJson = {},
        activeId = [],
        deviceJSON = [],
        currentResp = 0,
        timeZone,
        ApiCount = 0;


    // Event Listeners

    optionsButton.addEventListener("click", function() {
        if (fullPopUp.style.display == "block") {
            vehicleInputButton.getElementsByClassName("vehicleInputButtonClose").vehicleInputButtonClose.setAttribute("style", "display: none;");
            vehicleInputButton.getElementsByClassName("vehicleInputButtonOpen").vehicleInputButtonOpen.setAttribute("style", "display: inline-flex;");
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

    function stateSort(state, activeId) {
        state = state.substring(12);
        if (state == "ON") {
            state = true;
        }
        if (state == "OFF") {
            state = false;
        }
        var newActiveid = [];
        if (state != "All") {
            for (var i = 0; i < activeId.length; i++) {
                if (deviceJSON[activeId[i]].currentstatus == state) {
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
            var groupList = state.getGroupFilter()
            console.log(groupList);
            periodPicker_today.click();
            InatializeCustomDateSelector();

            // Get Groups
            groupAPIcall(api);

            api.call("Get", { "typeName": "Device", "search": { "fromDate": new Date().toISOString(), "groups": groupList } },
                function(result) {
                    var currentDevice = {};
                    var callsArray = [];
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
                    autocomplete(document.getElementById("myInput"), vehicleInputButton, deviceJSON);
                    SortbyButton.click();
                    //deviceJSON = sortArr(deviceJSON, "vin");
                    //console.log(deviceJSON);

                },
                function(e) {
                    console.error("Failed:", e);
                });

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
            //     hello: 'world'
            // });

            // getting the current user info
            freshApi.getSession(session => {
                //elAddin.querySelector('#output-user').textContent = session.userName;
                //  console.log(session);
                // Get Timezone Info
                api.call("Get", { "typeName": "User", "search": { "name": session.userName } }, function(result) {
                    timeZone = result[0].timeZoneId;
                });

            });

            var groupList = state.getGroupFilter()
            console.log(groupList);
            // Get Groups
            groupAPIcall(api);

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
                    autocomplete(document.getElementById("myInput"), vehicleInputButton, deviceJSON);
                    SortbyButton.click();
                    //deviceJSON = sortArr(deviceJSON, "vin");
                    //console.log(deviceJSON);

                },
                function(e) {
                    console.error("Failed:", e);
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