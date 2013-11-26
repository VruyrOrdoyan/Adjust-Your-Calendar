/*
* Date prototipe for AdjustYourCalendar 1.0
* (c) 2013-2013 AdjustYourCalendar <AdjustYourCalendar.com>
* MIT license
*
* prototype functions: 
* createShortDate - returns new date object without time segment
* getMothDaysCount - returns days count of the month
* lastMonth - returns the prev month date
* lastYear - returns the prev year date
* nextMonth - returns the next month date
* nextYear - returns the next year date
* startMonthDay - returns the first date of the month
* endMonthDay - returns the last date of the month
* dateFormat - converts the date to string with given format (mask)
*/
Date.prototype.createShortDate = function () {
    return new Date(this.setHours(0, 0, 0, 0));
};
Date.prototype.getMothDaysCount = function () {
    var d = this;
    var monthDaysCountArray = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    var month = d.getMonth();
    var year = d.getFullYear();
    if (month == 1) {
        return (((year % 4 == 0) && ((!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28);
    }
    else {
        return monthDaysCountArray[month];
    }
};

Date.prototype.lastMonth = function () {
    var startDate = this;
    var tmpDate = new Date(startDate.startMonthDay().getTime());
    return new Date(tmpDate.setMonth(tmpDate.getMonth() - 1));
};
Date.prototype.lastYear = function () {
    var startDate = this;
    var tmpDate = new Date(startDate.startMonthDay().getTime());
    return new Date(tmpDate.setFullYear(tmpDate.getFullYear() - 1));
};
Date.prototype.nextMonth = function () {
    var startDate = this;
    var tmpDate = new Date(startDate.startMonthDay().getTime());
    return new Date(tmpDate.setMonth(tmpDate.getMonth() + 1));
};
Date.prototype.nextYear = function () {
    var startDate = this;
    var tmpDate = new Date(startDate.startMonthDay().getTime());
    return new Date(tmpDate.setFullYear(tmpDate.getFullYear() + 1));
};
Date.prototype.startMonthDay = function () {
    var date = this;
    return new Date(date.getFullYear(), date.getMonth(), 1);
};
Date.prototype.endMonthDay = function () {
    var date = this;
    return new Date(date.getFullYear(), date.getMonth(), 0);
};
Date.prototype.toText = function (mask, utc, dayNames, monthNames) {
    return dateFormat(this, mask, utc, dayNames, monthNames);
};

/*
* Default settings for AdjustYourCalendar 1.0
* (c) 2013-2013 AdjustYourCalendar <AdjustYourCalendar.com>
* MIT license
*/
var Defaults = {
    DefaultFormat: "mm/dd/yyyy",
    DefaultStartEndDateDelimitor: " - ",
    DefaultMonthTitleFormat: "mmm yyyy",
    IsElementBlurAssigned: false,
    RenderArrow: {
        Both: "both",
        Left: "left",
        Right: "right", 
        No: "no" 
    },
    StartWeekDay: { Sunday: 0, Monday: 1 },
    DayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    MonthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};

/*
* AdjustYourCalendar 1.0
* (c) 2013-2013 AdjustYourCalendar <AdjustYourCalendar.com>
* MIT license
*
* Create and connect the ElasticCalendar object.
* Processing the events for the HTML element.
*/
jQuery.fn.AdjustYourCalendar = function () {
    if (!Defaults.IsElementBlurAssigned) {
        $("*").focus(function () {
            if ($(this).data("calendar") == null) {
                $(document).click();
            }
        });
        Defaults.IsElementBlurAssigned = true;
    }
    if (this.length == 0) {
        return;
    }
    var o = this;
    var params = {};
    var instance = null;

    if (arguments.length > 1 && arguments[0] == "option") {
        var calendar = o.data("calendar");
        if (calendar == null) {
            return;
        }
        if (arguments.length == 2) {
            return eval("calendar.params." + arguments[1]);
        }
        else {
            eval("calendar.params." + arguments[1] + " = " + arguments[2]);
        }
    }
    else {
        $.extend(params, jQuery.fn.AdjustYourCalendar.defaults, arguments[0] || {});
    }
    if (this.prop("tagName").toLowerCase() == "select") {
        alert("'select' tag can't be calendar container.");
        return;
    }
    var calendar = o.data("calendar");
    if (calendar != null) {
        $.extend(params, calendar.params, arguments[0] || {});
    }
    if (this.prop("tagName").toLowerCase() == "input") {
        var $o = $(this);
        tryToSetSelValues();
        var calId = this.attr("id") + "_calendar";
        var calConId = this.attr("id") + "_calendarCon";
        var calSelector = "#" + calId;
        var calConSelector = "#" + calConId;
        if (params.buttonId != undefined && params.buttonId != "") {
            params.$button = $("#" + params.buttonId);
        }
        else {
            params.$button = null;
        }
        if (params.$button != null) {
            params.$button.unbind("click");
            params.$button.click(function () {
                var calendar = o.data("calendar");
                if (calendar.selStartDate != null) {
                    calendar.startDate = calendar.selStartDate;
                }
                calendar.initCalendar();
                
                $(calSelector).show(calendar.params.showEffect);
            });
        }

        if (calendar != null) {
            var $calendar = $(calSelector);
            instance = $calendar.AdjustYourCalendar(params);
            o.data("calendar", instance);
        }
        else {
            $o.before('<div style="position:relative;display:inline-block;" id="' + calConId + '"></div>');
            $(calConSelector).prepend($o);
            $o.after('<div style="position:absolute;z-index:1000;background-color:#fff;" id="' + calId + '"></div>');
            var $calendar = $(calSelector);
            var _onSelectDay = params.onSelectDay;

            params.onSelectDay = function (co, isStartDate, $cell) {
                if (_onSelectDay != undefined) {
                    _onSelectDay(co, isStartDate, $cell);
                }
                setTextBoxValue(co, isStartDate, $(calSelector));
            };
            params.inputText = $o;
            instance = $calendar.AdjustYourCalendar(params);
            o.data("calendar", instance);
            $calendar.hide();

            $("body").click(function (e) {
                o.hideCalendar(e);
            });
            $(document).click(function (e) {
                o.hideCalendar(e);
            });
            $o.click(function () {
                var calendar = o.data("calendar");
                if (calendar.selStartDate != null) {
                    calendar.startDate = calendar.selStartDate;
                }
                calendar.initCalendar();
                $(calSelector).show(calendar.params.showEffect);
            });
            $o.focus(function () {
                var calendar = o.data("calendar");
                $(document).click();
                if (calendar.selStartDate != null) {
                    calendar.startDate = calendar.selStartDate;
                }
                calendar.initCalendar();
                $(calSelector).show(calendar.params.showEffect);
            });

            if ($o.attr("type") == undefined || $o.attr("type").toLowerCase() == "text" || $o.attr("type").toLowerCase() == "") {
                $o.keyup(function () {
                    tryToSetSelValues();
                    if (params.selStartDate != null) {
                        var calendar = o.data("calendar");
                        if (calendar != undefined) {
                            calendar.selStartDate = params.selStartDate;
                            calendar.startDate = calendar.selStartDate;
                            if (params.selEndDate != null) {
                                calendar.selEndDate = params.selEndDate;
                            }
                            calendar.initCalendar();
                        }
                    }
                });
            }
        }
    }
    else {
        params.container = this;
        instance = new ElasticCalendar(params);
        o.data("calendar", instance);
    }

    this.hideCalendar = function (e) {
        e = e || event;
        if (e) {
            var calendar = o.data("calendar");
            if (e.target.id == $o.attr("id")) {
                return;
            }
            else {
                var oElement = document.elementFromPoint(e.clientX, e.clientY);
                if (calendar.params.$button != null && oElement != undefined && $(oElement).attr("id") == calendar.params.$button.attr("id")) {
                    return;
                }
                if (oElement == undefined || !o.isPointerInCalendar(oElement, calConId)) {
                    if (calendar != undefined) {
                        calendar.action();
                    }
                    $(calSelector).hide(calendar.params.hideEffect);
                }
            }
        }
    };

    this.isPointerInCalendar = function (element, calendarId) {
        while (element.id != calendarId && element && element.tagName && element.tagName.toLowerCase() != "body") {
            element = $(element).parent().get(0);
        }
        return element != undefined && element.id == calendarId;
    };

    function setTextBoxValue(co, isStartDate, $calSelector) {
        if (co.selStartDate != null) {
            if (co.params.allowRange) {
                if (isStartDate) {
                    co.inputText.val(co.toText(co.selStartDate));
                }
                else {
                    if (co.selEndDate != null) {
                        co.inputText.val(co.toText(co.selStartDate) + co.params.startEndDateDelimitor + co.toText(co.selEndDate));
                        $calSelector.hide(co.params.hideEffect);
                    }
                }
            }
            else {
                co.inputText.val(co.toText(co.selStartDate));
                $calSelector.hide(co.params.hideEffect);
            }
        }
    }

    function tryToSetSelValues() {
        var inputVal = $o.val();
        if (inputVal != "") {
            var selStartDateTxt = "";
            var selEndDateTxt = "";
            var selStartDate = null;
            var selEndDate = null;
            if (params.allowRange) {
                var selDates = inputVal.split(params.startEndDateDelimitor);
                if (selDates.length == 1) {
                    selStartDateTxt = selDates[0];
                }
                else {
                    selStartDateTxt = selDates[0];
                    selEndDateTxt = selDates[1];
                }
            }
            else {
                selStartDateTxt = inputVal;
            }
            if (selStartDateTxt != "") {
                try {
                    selStartDate = new Date(selStartDateTxt).createShortDate();
                }
                catch (e) {
                    selStartDate = null;
                }
            }
            if (selEndDateTxt != "") {
                try {
                    selEndDate = new Date(selEndDateTxt).createShortDate();
                }
                catch (e) {
                    selEndDate = null;
                }
            }
            if (selStartDate == "Invalid Date" || selStartDate == "NaN") {
                params.selStartDate = null;
                params.selEndDate = null;
            }
            else {
                params.selStartDate = selStartDate;
                if (selEndDate == "Invalid Date" || selStartDate == "NaN") {
                    params.selEndDate = null;
                }
                else {
                    params.selEndDate = selEndDate;
                }
            }
        }
    };
    return instance;
};

/*
* AdjustYourCalendar.defaults 1.0
* (c) 2013-2013 AdjustYourCalendar <AdjustYourCalendar.com>
* MIT license
*
* This is defaults settings for the AdjustYourCalendar.
* SETTINGS DESCRIPTIONS
* startDate - this option for the determination of the first calendar month
* selStartDate – this option for the determination of the selected start date. If "allowRange" equal to false (user can choose only one date), then selStartDate shows the selected date.
* selEndDate – this option for the determination of the selected end date. If "allowRange" equal to false (user can choose only one date), then selEndDate not use. 
* weekDays – This option represents the name of the days of the week.
* weekDayLength - This parameter is the kind of cuts that can be applied to the names of the days of the week.
* months – This option represents the months names.
* startWeekDay - This variable represents the day of the week starts on a Sunday it is equal to 0, 1 if it is Monday.
* monthsNumber - This option represents the number of months if it is equal to 1, then we will have 1 month if 2, then 2 months, and so on.
* allowRange - This variable represents the type of work calendar. If it is equal to "true" then the user can select a date range. If equal to "false", then only one date.
* datePickerFormat - This variable is used only to "date picker" mode. This variable represents the date format in the text box.
* monthTitleFormat - This variable is the format for the month.
* buttonId - This variable is used only "date picker" mode. User can open calendar clicking on created button. 
* datePickerFormat - This variable represents the text that should be between the selected start and end dates.

* enableDaySelector - the jQuery selector which made the day selectable (inner use)
* prevYearSelector - the element which has this jQuery selector (inner use) 
* container - the HTML element on which generated the calendar (inner use)
*
* Below functions that is necessary override
* These callback functions are called when the corresponding section formated.
* renderContainer_OpenTag - with this method you can build a head start tag of the calendar. This method need to initialize, otherwise we will have warnings
* renderContainer_CloseTag - with this method you can build a main container close tag of the calendar. This method need to initialize, otherwise we will have warnings.
* renderMonth_OpenTag - with this method you can build a open tag of the month element. This method need to initialize, otherwise we will have warnings. 


*   renderMonth_CloseTag - this function should create and return the end tag of the HTML element, which covers every calendar
*   renderWeekTitle_OpenTag - this function should create and return the start tag of the HTML element, which covers the names of the week days and days
*   renderWeekTitle_CloseTag - this function should create and return the end tag of the HTML element, which covers the names of the week days and days
*   renderDayTitle - this function shold create and return the name of the week day
*   renderPastDay - this function should create and return the days that prev to selected month
*   renderSelStartDay - this function should create and return the start selected day (checkin)
*   renderSelEndDay - this function should create and return the end selected day (checkout)
*   renderSelDay - this function should create and return the days that in the middle the selected start and end dates
*   renderDay - this function should create and return the selected month days
*   renderCurrentDay - this function should create and return the selected month day that equals the current date
*   renderFutureDay - this function should create and return the days that next to selected month
*   renderMonthTitle - this function should create and return the month name
*   renderWeek_OpenTag - this function should create and return the start tag of the HTML element, which covers the names of the week days
*   renderWeek_CloseTag - this function should create and return the end tag of the HTML element, which covers the names of the week days
*   renderMonth_Divider - this function should create and return the divider of the months
*/
jQuery.fn.AdjustYourCalendar.defaults = {
    startDate: new Date().createShortDate(),    
    selStartDate: null,
    selEndDate: null,
    weekDays: Defaults.DayNames,
    weekDayLength: 2,
    months: Defaults.MonthNames,
    startWeekDay: Defaults.StartWeekDay.Sunday,
    monthsNumber: 1,
    allowRange: true,
    datePickerFormat: Defaults.DefaultFormat,
    monthTitleFormat: Defaults.DefaultMonthTitleFormat,
    buttonId: undefined,
    startEndDateDelimitor: Defaults.DefaultStartEndDateDelimitor,

    container: null,
    enableDaySelector: ".fn_enableday",
    prevYearSelector: ".fn_prevyear",
    prevMonthSelector: ".fn_prevmonth",
    nextYearSelector: ".fn_nextyear",
    nextMonthSelector: ".fn_nextmonth",
    inputText: undefined,
    showEffect: undefined,
    hideEffect: undefined,
    $button: null,

    renderContainer_OpenTag: function (o) {
        alert("Please init 'renderContainer_OpenTag' method");
        return "";
    },
    renderContainer_CloseTag: function (o) {
        alert("Please init 'renderContainer_CloseTag' method");
        return "";
    },
    renderMonth_OpenTag: function (o, renderArrow) {
        alert("Please init 'renderMonth_OpenTag' method");
        return "";
    },
    renderMonthTitle: function (o, date, renderArrow) {
        alert("Please init 'renderMonthTitle' method");
        return "";
    },
    renderMonth_CloseTag: function (o) {
        alert("Please init 'renderMonth_CloseTag' method");
        return "";
    },
    renderMonthBody_OpenTag: function (o) {
        alert("Please init 'renderMonthBody_OpenTag' method");
        return "";
    },
    renderMonthBody_CloseTag: function (o) {
        alert("Please init 'renderMonthBody_CloseTag' method");
        return "";
    },
    renderWeekTitle_OpenTag: function (o) {
        alert("Please init 'renderWeekTitle_OpenTag' method");
        return "";
    },
    renderWeekTitle_CloseTag: function (o) {
        alert("Please init 'renderWeekTitle_CloseTag' method");
        return "";
    },
    renderDayTitle: function (o, shortWT, longWT) {
        alert("Please init 'renderDayTitle' method");
        return "";
    },
    renderWeek_OpenTag: function (o) {
        alert("Please init 'renderWeek_OpenTag' method");
        return "";
    },
    renderWeek_CloseTag: function (o) {
        alert("Please init 'renderWeek_CloseTag' method");
        return "";
    },
    renderPastDay: function (o, date, cellIndex) {
        alert("Please init 'renderPastDay' method");
        return "";
    },
    renderSelStartDay: function (o, date, cellIndex) {
        alert("Please init 'renderSelStartDay' method");
        return "";
    },
    renderSelEndDay: function (o, date, cellIndex) {
        alert("Please init 'renderSelEndDay' method");
        return "";
    },
    renderSelDay: function (o, date, cellIndex) {
        alert("Please init 'renderSelDay' method");
        return "";
    },
    renderDay: function (o, date, cellIndex) {
        alert("Please init 'renderDay' method");
        return "";
    },
    renderCurrentDay: function (o, date, cellIndex) {
        alert("Please init 'renderCurrentDay' method");
        return "";
    },
    renderFutureDay: function (o, date, cellIndex) {
        alert("Please init 'renderFutureDay' method");
        return "";
    },
    renderMonth_Divider: function (o) {
        return "";
    },

    afterCalendarLoad: undefined,
    onSelectDay: undefined,
    onSelectPrevYear: undefined,
    onSelectPrevMonth: undefined,
    onSelectNextYear: undefined,
    onSelectNextMonth: undefined,
    onBeforeSelectPrevYear: undefined,
    onBeforeSelectPrevMonth: undefined,
    onBeforeSelectNextYear: undefined,
    onBeforeSelectNextMonth: undefined
};

function ElasticCalendar(params) {
    var o = this;
    this.params = params;
    //defaults
    this.today = new Date().createShortDate();
    this.dayCellCount = 42;

    //settings
    this.startDate = o.params.startDate;
    this.container = o.params.container;
    this.content = "";
    this.selStartDate = o.params.selStartDate;
    this.selEndDate = o.params.selEndDate;
    this.inputText = o.params.inputText;

    this.cellIndex = 0;
    if (o.selStartDate != null && o.startDate == null) {
        o.startDate = o.selStartDate.createShortDate();
    }

    if (o.startDate == null) {
        o.startDate = this.today;
    }

    if (!o.params.allowRange) {
        this.selEndDate = null;
    }

    this.buildContent = function (str) {
        this.content = this.content + str;
    };

    this.cellCounter = function (cellCount) {
        var weekDayCount = 7;
        if (cellCount % weekDayCount == 0) {
            if (cellCount != 0) {
                o.buildContent(o.params.renderWeek_CloseTag(o));
            }
            o.buildContent(o.params.renderWeek_OpenTag(o));
        }
        cellCount++;
        return cellCount;
    };

    this.initCalendar = function () {
        o.cellIndex = 0;
        o.content = "";
        o.container.html("");
        o.buildContent(o.params.renderContainer_OpenTag(o));
        o.renderCalendarSection(o.startDate, (o.params.monthsNumber == 1 ? Defaults.RenderArrow.Both : Defaults.RenderArrow.Left));
        var stDate = o.startDate;
        for (var cc = 1; cc < o.params.monthsNumber; cc++) {
            stDate = stDate.nextMonth();
            o.renderMonth_Divider();
            o.renderCalendarSection(stDate, cc == o.params.monthsNumber - 1 ? Defaults.RenderArrow.Right : Defaults.RenderArrow.No);
        }
        o.buildContent(o.params.renderContainer_CloseTag(o));
        o.container.html(o.content);
        o.initEvents();
        if (o.params.afterCalendarLoad != undefined) {
            o.params.afterCalendarLoad(o);
        }
    };

    this.initEvents = function () {
        o.initEvent(o.params.enableDaySelector, "click", o.onSelectDay);
        o.initEvent(o.params.prevYearSelector, "click", o.onSelectPrevYear);
        o.initEvent(o.params.prevMonthSelector, "click", o.onSelectPrevMonth);
        o.initEvent(o.params.nextYearSelector, "click", o.onSelectNextYear);
        o.initEvent(o.params.nextMonthSelector, "click", o.onSelectNextMonth);
    };

    this.initEvent = function (selector, eventName, method) {
        $(o.container).find(selector).unbind(eventName, method);
        $(o.container).find(selector).bind(eventName, method);
    };

    this.resetSelDates = function () {
        o.selStartDate = null;
        o.selEndDate = null;
    };

    this.onSelectDay = function () {
        var isStartDate = true;
        if (o.params.allowRange) {
            if (o.selStartDate == null) {
                o.selStartDate = new Date(parseInt($(this).attr("time"))).createShortDate();
            }
            else if (o.selEndDate == null) {
                isStartDate = false;
                var tmpEndDate = new Date(parseInt($(this).attr("time"))).createShortDate();
                if (o.selStartDate.getTime() == tmpEndDate.getTime()) {
                    return;
                }
                o.selEndDate = tmpEndDate;
            }
            else {
                o.resetSelDates();
                o.selStartDate = new Date(parseInt($(this).attr("time"))).createShortDate();
            }
        }
        else {
            o.resetSelDates();
            o.selStartDate = new Date(parseInt($(this).attr("time"))).createShortDate();
        }
        o.params.selStartDate = o.selStartDate;
        o.params.selEndDate = o.selEndDate;
        if (o.params.onSelectDay != undefined) {
            o.params.onSelectDay(o, isStartDate, $(this));
        }
        o.initCalendar();
    };

    this.action = function () {
        o.params.onSelectDay(o, !o.params.allowRange, $(this));
    };

    this.onSelectPrevYear = function () {
        if (o.params.onBeforeSelectPrevYear != null && !o.params.onBeforeSelectPrevYear(o)) {
            return;
        }
        o.startDate = o.startDate.lastYear();
        o.params.startDate = o.startDate;
        if (o.params.onSelectPrevYear != undefined) {
            o.params.onSelectPrevYear(o);
        }
        o.initCalendar();
    };

    this.onSelectPrevMonth = function () {
        if (o.params.onBeforeSelectPrevMonth != null && !o.params.onBeforeSelectPrevMonth(o)) {
            return;
        }
        o.startDate = o.startDate.lastMonth();
        o.params.startDate = o.startDate;
        if (o.params.onSelectPrevMonth != undefined) {
            o.params.onSelectPrevMonth(o);
        }
        o.initCalendar();
    };

    this.onSelectNextYear = function () {
        if (o.params.onBeforeSelectNextYear != null && !o.params.onBeforeSelectNextYear(o)) {
            return;
        }
        o.startDate = o.startDate.nextYear();
        o.params.startDate = o.startDate;
        if (o.params.onSelectNextYear != undefined) {
            o.params.onSelectNextYear(o);
        }
        o.initCalendar();
    };

    this.onSelectNextMonth = function () {
        if (o.params.onBeforeSelectNextMonth != null && !o.params.onBeforeSelectNextMonth(o)) {
            return;
        }
        o.startDate = o.startDate.nextMonth();
        o.params.startDate = o.startDate;
        if (o.params.onSelectNextMonth != undefined) {
            o.params.onSelectNextMonth(o);
        }
        o.initCalendar();
    };

    this.renderMonth_Divider = function () {
        o.buildContent(o.params.renderMonth_Divider(o));
    };

    this.renderCalendarSection = function (calendarStartDate, renderArrow) {
        var startMonthDay = calendarStartDate.startMonthDay();
        o.buildContent(o.params.renderMonth_OpenTag(o, renderArrow));
        o.buildContent(o.params.renderMonthTitle(o, calendarStartDate, renderArrow));

        o.buildContent(o.params.renderMonthBody_OpenTag(o));

        o.renderCalendarWeekDaysTitleSection();
        var cellCount = 0;
        var deltaDays = startMonthDay.getDay();
        if (deltaDays == 0) {
            deltaDays = 7;
        }
        var endMonthDay = startMonthDay.endMonthDay();
        for (var iPd = (deltaDays - (1 + o.params.startWeekDay)); iPd >= 0; iPd--) {
            var d = endMonthDay.getDate() - iPd;
            var day = new Date(endMonthDay.getFullYear(), endMonthDay.getMonth(), d);
            cellCount = o.cellCounter(cellCount);
            o.buildContent(o.params.renderPastDay(o, day, o.cellIndex));
            o.cellIndex++;
        }
        for (var iDay = 1; iDay <= startMonthDay.getMothDaysCount(); iDay++) {
            var day = new Date(calendarStartDate.getFullYear(), calendarStartDate.getMonth(), iDay);
            if (o.selStartDate != null && o.selStartDate != "" && day.getTime() == o.selStartDate.getTime()) {
                cellCount = o.cellCounter(cellCount);
                o.buildContent(o.params.renderSelStartDay(o, day, o.cellIndex));
            }
            else if (o.selStartDate != null && o.selStartDate != "" && o.selEndDate != null && o.selEndDate != "" && day.getTime() == o.selEndDate.getTime()) {
                cellCount = o.cellCounter(cellCount);
                o.buildContent(o.params.renderSelEndDay(o, day, o.cellIndex));
            }
            else if (o.selStartDate != null && o.selStartDate != "" && o.selEndDate != null && o.selEndDate != "" && day.getTime() > o.selStartDate.getTime() && day.getTime() < o.selEndDate.getTime()) {
                cellCount = o.cellCounter(cellCount);
                o.buildContent(o.params.renderSelDay(o, day, o.cellIndex));
            }
            else {
                if (iDay == o.today.getDate() && calendarStartDate.getMonth() == o.today.getMonth() && calendarStartDate.getFullYear() == o.today.getFullYear()) {
                    cellCount = o.cellCounter(cellCount);
                    o.buildContent(o.params.renderCurrentDay(o, day, o.cellIndex));
                }
                else {
                    cellCount = o.cellCounter(cellCount);
                    o.buildContent(o.params.renderDay(o, day, o.cellIndex));
                }
            }
            o.cellIndex++;
        }
        var nextMonthDay = startMonthDay.nextMonth();
        var lastCels = o.dayCellCount - cellCount;
        for (var iFd = 1; iFd <= lastCels; iFd++) {
            cellCount = o.cellCounter(cellCount);
            var day = new Date(nextMonthDay.getFullYear(), nextMonthDay.getMonth(), iFd);
            o.buildContent(o.params.renderFutureDay(o, day, o.cellIndex));
            o.cellIndex++;
        }
        o.buildContent(o.params.renderWeek_CloseTag(o, cellCount));

        o.buildContent(o.params.renderMonthBody_CloseTag(o));
        o.buildContent(o.params.renderMonth_CloseTag(o));
    };

    this.renderCalendarWeekDaysTitleSection = function () {
        o.buildContent(o.params.renderWeekTitle_OpenTag(o));
        for (var iWd = o.params.startWeekDay; iWd < (o.params.weekDays.length + o.params.startWeekDay); iWd++) {
            var wd = iWd;
            if (wd == 7) {
                wd = 0;
            }
            var wT = o.params.weekDays[wd].substr(0, o.params.weekDayLength);
            o.renderCalendarWeekDay(wT, o.params.weekDays[wd]);
        }
        o.buildContent(o.params.renderWeekTitle_CloseTag(o));
    };

    this.renderCalendarWeekDay = function (shortWT, longWT) {
        o.buildContent(o.params.renderDayTitle(o, shortWT, longWT));
    };

    this.toCalendarTitle = function (date) {
        return date.toText(o.params.monthTitleFormat, undefined, o.params.weekDays, o.params.months);
    };

    this.toText = function (date) {
        return date.toText(o.params.datePickerFormat, undefined, o.params.weekDays, o.params.months);
    };

    o.initCalendar();
}

function ElasticCalendarHelper() {
}
/*
* Date Format 1.2.3
* (c) 2007-2009 Steven Levithan <stevenlevithan.com>
* MIT license
*
* Includes enhancements by Scott Trenda <scott.trenda.net>
* and Kris Kowal <cixar.com/~kris.kowal/>
*
* Accepts a date, a mask, or a date and a mask.
* Returns a formatted version of the given date.
* The date defaults to the current date/time.
* The mask defaults to dateFormat.masks.default.
*/
var dateFormat = function () {
    var token = /dw2|d{1,5}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
		    val = String(val);
		    len = len || 2;
		    while (val.length < len) val = "0" + val;
		    return val;
		};
    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc, dayNames, monthNames) {
        var dF = dateFormat;
        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }
        var dn = (dayNames == undefined) ? Defaults.DayNames : dayNames;
        var mn = (monthNames == undefined) ? Defaults.MonthNames : monthNames;
        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");
        mask = String(dF.masks[mask] || mask || dF.masks["default"]);
        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }
        var _ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
			    dw2: (dn[D]).substr(0, 2),
			    d: d,
			    dd: pad(d),
			    ddd: dn[D].substr(0, 3),
			    dddd: dn[D],
			    ddddd: (dn[D]).substr(0, 1),
			    m: m + 1,
			    mm: pad(m + 1),
			    mmm: mn[m].substr(0, 3),
			    mmmm: mn[m],
			    yy: String(y).slice(2),
			    yyyy: y,
			    h: H % 12 || 12,
			    hh: pad(H % 12 || 12),
			    H: H,
			    HH: pad(H),
			    M: M,
			    MM: pad(M),
			    s: s,
			    ss: pad(s),
			    l: pad(L, 3),
			    L: pad(L > 99 ? Math.round(L / 10) : L),
			    t: H < 12 ? "a" : "p",
			    tt: H < 12 ? "am" : "pm",
			    T: H < 12 ? "A" : "P",
			    TT: H < 12 ? "AM" : "PM",
			    Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
			    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
			    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};
        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
} ();
// Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// For convenience...
