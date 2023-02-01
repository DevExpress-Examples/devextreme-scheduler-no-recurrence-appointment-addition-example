import { useState } from 'react';
import Scheduler from 'devextreme-react/scheduler';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import { defaultData } from './data.js';
import { rrulestr, RRule } from 'rrule';
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

    function changeEndDate(currentEndDate, updatedEndDate) {
        const current = new Date(currentEndDate);
        const updated = new Date(updatedEndDate);
        current.setFullYear(updated.getFullYear());
        current.setMonth(updated.getMonth());
        current.setDate(updated.getDate());
        return current;
    }

    const handleAppointmentActions = (e, appointmentData) => {
        const recurringAppointment = data.filter((appointment) => appointment?.recurrenceRule)

        recurringAppointment.find((appointment) => {
            const recurrenceOptions = rrulestr(appointment.recurrenceRule);
            const rule = new RRule({
                freq: recurrenceOptions.options.freq,
                interval: recurrenceOptions.options.interval,
                byweekday: recurrenceOptions.options.byweekday,
                dtstart: appointment?.startDate,
            })
            const betweenDate = rule.between(e.component.getStartViewDate(), e.component.getEndViewDate())
            const recurrenceAppointmentEndDate = changeEndDate(appointment.endDate, appointmentData.endDate);

            if (betweenDate.length > 0) {
                betweenDate.find((date) => {
                    if (
                        (appointmentData.startDate.getDate() === date.getDate()) &&
                        (appointmentData.startDate.getMonth() === date.getMonth()) &&
                        (appointmentData.startDate.getTime() >= date.getTime() && recurrenceAppointmentEndDate.getTime() >= appointmentData.endDate.getTime()))
                    {
                        e.cancel = true;
                        setPopupVisible(true);
                    }
                })
            }
        })
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
                onAppointmentAdding={(e) => {
                    handleAppointmentActions(e, e.appointmentData);
                }}
                onAppointmentUpdating={(e) => {
                    handleAppointmentActions(e, e.newData);
                }}
            />
        </>
    );
}

export default App;
