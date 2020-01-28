function autocomplete(inp, vehicleInputButton, deviceJSON) {

    var resetButton = document.getElementById('vehicleResetSelect'),
        activeArr = [];

    function toggleDropdown() {
        currentFocus = -1;
        var state = document.getElementById("vehicleInputButton").value;
        if (state == 1) {
            document.getElementById("vehicleInputButtonClose").setAttribute("style", "display: inline-flex;");
            document.getElementById("vehicleInputButtonOpen").setAttribute("style", "display: none;");
            document.getElementById("vehicleInputButton").value = 0;
            document.getElementById("autocompleteDropDown").setAttribute("style", "display:block; width: 215px;height: 135px;");
            buildList("");
        } else {
            document.getElementById("vehicleInputButtonClose").setAttribute("style", "display: none;");
            document.getElementById("vehicleInputButtonOpen").setAttribute("style", "display: inline-flex;");
            document.getElementById("vehicleInputButton").value = 1;
            document.getElementById("autocompleteDropDown").setAttribute("style", "display:none;");
            closeAllLists();
        }
    }
    vehicleInputButton.addEventListener("click", function(e) {
        inp.click();
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
        var state = document.getElementById("vehicleInputButton").value;

        /*close any already open lists of autocompleted values*/
        closeAllLists();
        // Change Vehicle Input Button
        if (val.length > 0 && state == 1) {
            document.getElementById("vehicleInputButtonClose").setAttribute("style", "display: inline-flex;");
            document.getElementById("vehicleInputButtonOpen").setAttribute("style", "display: none;");
            state = 0;
        } else if (val.length == 0 && state == 0) {
            document.getElementById("vehicleInputButtonClose").setAttribute("style", "display: none;");
            document.getElementById("vehicleInputButtonOpen").setAttribute("style", "display: inline-flex;");
            state = 1;
        }


        if (!val) { return false; }
        currentFocus = -1;
        buildList(val);
    });

    inp.addEventListener("click", function(e) {
            toggleDropdown();
        })
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
}