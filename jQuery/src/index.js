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
        allDayPanelMode: 'hidden',
        onAppointmentAdding: (e) => {
            handleAppointmentAdd(e, popup);
        },
        onAppointmentUpdating: (e) => {
            handleAppointmentUpdate(e, popup);
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

const handleAppointmentAdd = (event, popup) => {
    handleAppointmentActions(
        event,
        getRecurrentAppointments(),
        event.appointmentData,
        popup
    );
}
const handleAppointmentUpdate = (event, popup) => {
    const recurrentAppointments = getRecurrentAppointments()
        .filter((appointment) => appointment !== event.oldData);
    handleAppointmentActions(
        event,
        recurrentAppointments,
        event.newData,
        popup
    )
}
const handleAppointmentActions = (
    event,
    recurrentAppointments,
    newAppointment,
    popup) => {
    for (const recurrentAppointment of recurrentAppointments) {
        const isOverlap = isOverlapRecurrentAppointment(
            event,
            recurrentAppointment,
            newAppointment);
        if (isOverlap) {
            cancelAppointmentAdding(event, popup);
        }
    }
}

const getRecurrentAppointments = () => {
    return defaultData
        .filter((appointment) => appointment?.recurrenceRule)
        .map((appointment) => ({
            ...appointment,
            startDate: new Date(appointment.startDate),
            endDate: new Date(appointment.endDate),
        }));
}

const cancelAppointmentAdding = (event, popup) => {
    event.cancel = true;
    popup.show();
}
