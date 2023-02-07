import { defaultData } from './data.js';

$(() => {
    $('#scheduler').dxScheduler({
        dataSource: defaultData,
        views: ['week'],
        currentView: 'week',
        currentDate: new Date(2020, 10, 25),
        firstDayOfWeek: 0,
        startDayHour: 9,
        height: '100%',
        width: '100%',
        onAppointmentAdding: (e) => {
            handleAppointmentActions(e, e.appointmentData, popup);
        },
        onAppointmentUpdating: (e) => {
            handleAppointmentActions(e, e.newData, popup);
        }
    })
});

const popupContentTemplate = function () {
    return $('<div>').append(
        $(`<p>There is a recurrent appointment in this cell.</p>`),
    );
};

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

const handleAppointmentActions = (e, appointmentData, popup) => {
    const startTime = appointmentData.startDate.getTime();
    const endTime = appointmentData.endDate.getTime();
    const recurringAppointment = defaultData.filter((appointment) => appointment?.recurrenceRule)

    recurringAppointment.find((appointment) => {
        const recurrenceOptions = rrule.rrulestr(appointment.recurrenceRule);
        const rule = new rrule.RRule({
            freq: recurrenceOptions.options.freq,
            interval: recurrenceOptions.options.interval,
            byweekday: recurrenceOptions.options.byweekday,
            dtstart: appointment?.startDate,
        })
        const betweenDate = rule.between(e.component.getStartViewDate(), e.component.getEndViewDate())
        const appointmentDuration = appointment.endDate.getTime() - appointment.startDate.getTime();

        if (betweenDate.length > 0) {
            betweenDate.find((date) => {
                const recurrentStartTime = date.getTime();
                const recurrentEndTime = recurrentStartTime + appointmentDuration;

                if (
                    startTime > recurrentStartTime && startTime < recurrentEndTime
                    || endTime > recurrentStartTime && endTime < recurrentEndTime
                ) {
                    e.cancel = true;
                    popup.show();
                }
            })
        }
    })
}
