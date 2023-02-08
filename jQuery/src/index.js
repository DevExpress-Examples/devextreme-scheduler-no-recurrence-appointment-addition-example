import { defaultData } from './data.js';
import { isOverlapRecurrentAppointment } from './utils/isOverlapRecurrentAppointment.js';

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

const popup = $('#popup').dxPopup({
    contentTemplate: () => $('<div>').append(
        $(`<p>There is a recurrent appointment in this cell.</p>`),
    ),
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

const handleAppointmentActions = (event, newAppointment) => {
    const recurrentAppointments = defaultData.filter((appointment) => appointment?.recurrenceRule)
        .map((appointment) => ({
            ...appointment,
            startDate: new Date(appointment.startDate),
            endDate: new Date(appointment.endDate),
        }));
    for (const recurrentAppointment of recurrentAppointments) {
        const isOverlap = isOverlapRecurrentAppointment(event, recurrentAppointment, newAppointment);
        if (isOverlap) {
            event.cancel = true;
            popup.show();
        }
    }
};
