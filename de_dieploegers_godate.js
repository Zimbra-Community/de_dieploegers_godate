/*
    Document   : de_dieploegers_godate.js
    Created on : 20120403
    Author     : Dennis Ploeger <develop@dieploegers.de>
    Description: Zimlet, that registers a hotkey to go to specific date
*/

function de_dieploegers_godateHandlerObject() {
}

de_dieploegers_godateHandlerObject.prototype = new ZmZimletBase();
de_dieploegers_godateHandlerObject.prototype.constructor =
    de_dieploegers_godateHandlerObject;

/**
 * Initialize app and register key listener
 */

de_dieploegers_godateHandlerObject.prototype.init =
    function () {

        appCtxt.getKeyboardMgr()._evtMgr.addListener(
            DwtEvent.ONKEYPRESS,
            new AjxListener(
                this,
                this.handleKeyAction
            )
        );

    };

/**
 * Handle the keypress of Shift-G
 *
 * @param ev A DwtEvent for the keypress
 */

de_dieploegers_godateHandlerObject.prototype.handleKeyAction =
    function (
        ev
    ) {

        if ((ev.shiftKey) &&
            (ev.ctrlKey) &&
            (!ev.altKey) &&
            (!ev.metaKey) &&
            (ev.charCode == 71)) {

            this.showGotoDateDialog();
            return false;

        }

        return true;

    };

/**
 * Handle a date click in the date picker dialog
 *
 * @param ev the DwtEvent of the mouse click
 */

de_dieploegers_godateHandlerObject.prototype.handleSelectDate =
    function (ev) {

        var dateFormats,
            dateParsed,
            i;

        if (!this.calendarChooserDateInput.isValid()) {

            appCtxt.setStatusMsg({
                msg: this.getMessage("ERROR_INVALIDDATE"),
                level: ZmStatusView.LEVEL_CRITICAL
            });

            return false;

        }

        this.goDate = this.calendarChooserDateInput.getValue();

        // Try some date formats

        dateFormats = [
            I18nMsg.formatDateShort,
            I18nMsg.formatDateMedium,
            I18nMsg.formatDateLong,
            I18nMsg.formatDateFull
        ];

        dateParsed = null;

        for (i = 0; i < dateFormats.length; i = i + 1) {

            if (dateParsed) {

                continue;

            }

            dateParsed = AjxDateFormat.parse(dateFormats[i], this.goDate);

        }

        if (!dateParsed) {

            appCtxt.setStatusMsg({
                msg: this.getMessage("ERROR_INVALIDDATE"),
                level: ZmStatusView.LEVEL_CRITICAL
            });

            return false;

        }

        this.goDate = dateParsed;

        this.calendarChooserDialog.popdown();

        appCtxt.getAppController().activateApp(ZmId.APP_CALENDAR);

        AjxTimedAction.scheduleAction(
            new AjxListener(
                this,
                this.updateCalendar
            ),
            1000
        );

    };

/**
 * Show the date picker dialog
 */

de_dieploegers_godateHandlerObject.prototype.showGotoDateDialog =
    function () {

        if (!this.calendarChooserDialog) {

            // Build up chooser dialog

            this.calendarChooserDialog = new DwtDialog({
                parent: this.getShell(),
                title: this.getMessage("DIALOG_CALENDARCHOOSER_TITLE")
            });

            chooserComposite = new DwtComposite({
                parent: this.getShell()
            });

            chooserLabel = new DwtLabel({

                parent: chooserComposite

            });

            chooserLabel.setText(this.getMessage("LABEL_SELECTDATE"));

            firstDayOfWeek = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;

            serverId = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
            useISO8601WeekNo = (
                serverId &&
                serverId.indexOf("Europe") === 0 &&
                serverId != "Europe/London"
            );

            // Date chooser

            this.calendarChooserCalendar = new DwtCalendar({

                parent: chooserComposite,
                firstDayOfWeek: firstDayOfWeek,
                useISO8601WeekNo : useISO8601WeekNo,
                showWeekNumber: true

            });

            this.calendarChooserCalendar.addSelectionListener(
                new AjxListener(
                    this,
                    function (ev) {

                        dateFormat = new AjxDateFormat(
                            I18nMsg.formatDateShort
                        );

                        this.calendarChooserDateInput.setValue(
                            dateFormat.format(
                                this.calendarChooserCalendar.getDate()
                            )
                        );
                    }
                )
            );

            // Date input

            this.calendarChooserDateInput = new DwtInputField({

                parent: chooserComposite,
                type: DwtInputField.DATE

            });

            this.calendarChooserDialog.setView(chooserComposite);

            this.calendarChooserDialog.setButtonListener(
                DwtDialog.CANCEL_BUTTON,
                new AjxListener(
                    this,
                    function (ev) {

                        this.calendarChooserDialog.popdown();

                    }
                )
            );

            this.calendarChooserDialog.setButtonListener(

                DwtDialog.OK_BUTTON,
                new AjxListener(
                    this,
                    this.handleSelectDate
                )

            );

            this.calendarChooserDialog.setEnterListener(
                new AjxListener(
                    this,
                    this.handleSelectDate
                )
            );

        }

        this.calendarChooserDialog.popup();
        this.calendarChooserDateInput.focus();

        return true;

    };


/**
 * Update the calendar to reflect the selected date
 */

de_dieploegers_godateHandlerObject.prototype.updateCalendar =
    function () {

        if (!appCtxt.getCurrentController()) {

            AjxTimedAction.scheduleAction(
                new AjxListener(
                    this,
                    this.updateCalendar
                ),
                500
            );

        }

        appCtxt.getCurrentController().setDate(this.goDate);


    };