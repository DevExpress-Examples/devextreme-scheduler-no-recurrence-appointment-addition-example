import {defaultData} from './data.js';

$(() => {
    $('#scheduler').dxScheduler({
        dataSource: defaultData,
        views: ['week'],
        currentView: 'week',
        currentDate: new Date(2020, 10, 25),
        startDayHour: 9,
        height: '100%',
        width: '100%',
        onAppointmentAdding: function(e) {
            const recurringAppointment = findRecurringAppointment(e.appointmentData);

            if (recurringAppointment) {
                const newAppointmentStartMinutes = e.appointmentData.startDate.getHours() * 60 + e.appointmentData.startDate.getMinutes();
                const newAppointmentEndMinutes = e.appointmentData.endDate.getHours() * 60 + e.appointmentData.endDate.getMinutes();
                const recurringAppointmentStartMinutes = recurringAppointment.startDate.getHours() * 60 + recurringAppointment.startDate.getMinutes();
                const recurringAppointmentEndMinutes = recurringAppointment.endDate.getHours() * 60 + recurringAppointment.endDate.getMinutes();

                if ((newAppointmentStartMinutes > recurringAppointmentStartMinutes && newAppointmentStartMinutes < recurringAppointmentEndMinutes) || (newAppointmentEndMinutes > recurringAppointmentStartMinutes && newAppointmentEndMinutes < recurringAppointmentEndMinutes)) {
                    e.cancel = true;
                    popup.show();
                }
            }
        }
    }).dxScheduler('instance');

    const popup = $('#popup').dxPopup({
        contentTemplate: popupContentTemplate,
        width: 300,
        height: 150,
        container: '.dx-viewport',
        showTitle: true,
        title: 'Information',
        visible: false,
        dragEnabled: false,
        hideOnOutsideClick: true,
        showCloseButton: false,
        position: {
            at: 'center',
            my: 'center',
        },
        toolbarItems: [{
            widget: 'dxButton',
            toolbar: 'bottom',
            location: 'after',
            options: {
                text: 'Close',
                onClick() {
                    popup.hide();
                },
            },
        }],
    }).dxPopup('instance');
});

const findRecurringAppointment = (appointmentData) => {
    return defaultData.find((appointment) => {
        if (appointment.recurrenceRule) {
            const recurrenceOptions = rrule.rrulestr(appointment.recurrenceRule);
            const weekDays = recurrenceOptions.options.byweekday;
            const dateInArray = checkDateInArray(appointmentData.startDate);
            if (weekDays.includes(dateInArray)) {
                return appointment;
            }
        }
    });
}

const checkDateInArray = (dateString) => {
    const weekDayNumbers = [6, 0, 1, 2, 3, 4, 5];
    let date = new Date(dateString);
    let day = date.getDay();

    return weekDayNumbers[day];
}

const popupContentTemplate = function () {
    return $('<div>').append(
        $(`<p>There is a recurrent appointment in this cell.</p>`),
    );
};
