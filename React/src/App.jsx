import {useState} from 'react';
import Scheduler from 'devextreme-react/scheduler';
import {Popup, Position, ToolbarItem} from 'devextreme-react/popup';
import {defaultData} from './data.js';
import {rrulestr} from 'rrule';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import './App.css';

const App = () => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [data] = useState(defaultData);

    const hideInfo = () => {
        setPopupVisible(false);
    }

    const closeButtonOptions = {
        text: 'Close',
        onClick: hideInfo,
    };

    const getDayFromArray = (dateString) => {
        const weekDayNumbers = [6, 0, 1, 2, 3, 4, 5];
        const date = new Date(dateString);
        const day = date.getDay();

        return weekDayNumbers[day];
    }

    const handleAppointmentActions = (e, appointmentData) => {
        const recurringAppointment = data.find((appointment) => {
            if (appointment.recurrenceRule) {
                const recurrenceOptions = rrulestr(appointment.recurrenceRule);
                const weekDays = recurrenceOptions.options.byweekday;
                const dateInArray = getDayFromArray(appointmentData.startDate);

                if (weekDays.includes(dateInArray)) {
                    return appointment;
                }
            }
        });

        if (recurringAppointment) {
            const newAppointmentStartMinutes = appointmentData.startDate.getHours() * 60 + appointmentData.startDate.getMinutes();
            const newAppointmentEndMinutes = appointmentData.endDate.getHours() * 60 + appointmentData.endDate.getMinutes();
            const recurringAppointmentStartMinutes = recurringAppointment.startDate.getHours() * 60 + recurringAppointment.startDate.getMinutes();
            const recurringAppointmentEndMinutes = recurringAppointment.endDate.getHours() * 60 + recurringAppointment.endDate.getMinutes();

            if ((newAppointmentStartMinutes > recurringAppointmentStartMinutes && newAppointmentStartMinutes < recurringAppointmentEndMinutes) || (newAppointmentEndMinutes > recurringAppointmentStartMinutes && newAppointmentEndMinutes < recurringAppointmentEndMinutes)) {
                e.cancel = true;
                setPopupVisible(true);
            }
        }
    }

    return (
        <>
            <Popup
                visible={popupVisible}
                onHiding={hideInfo}
                dragEnabled={false}
                hideOnOutsideClick={true}
                showCloseButton={false}
                showTitle={true}
                title='Information'
                container='.dx-viewport'
                width={280}
                height={150}
            >
                <Position
                    at='center'
                    my='center'
                />
                <ToolbarItem
                    widget='dxButton'
                    toolbar='bottom'
                    location='after'
                    options={closeButtonOptions}
                />
                <p>There is a recurrent appointment in this cell.</p>
            </Popup>
            <Scheduler
                dataSource={data}
                views={[{
                    type: 'week'
                }]}
                firstDayOfWeek={1}
                defaultCurrentView='week'
                defaultCurrentDate={new Date(2020, 10, 25)}
                startDayHour={9}
                width='100%'
                height='100%'
                onAppointmentAdding={(e) => { handleAppointmentActions(e, e.appointmentData); }}
                onAppointmentUpdating={(e) => { handleAppointmentActions(e, e.newData); }}
            />
        </>
    );
}

export default App;
