import { useState } from 'react';
import Scheduler from 'devextreme-react/scheduler';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import { defaultData } from './data.js';
import { rrulestr, RRule } from 'rrule';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.css';
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

    const formattedDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const handleAppointmentActions = (e, appointmentData) => {
        let startTime = appointmentData.startDate.getTime();
        const endTime = appointmentData.endDate.getTime();
        const recurringAppointment = defaultData.filter((appointment) => appointment?.recurrenceRule).map((appointment) => {
            return {
                ...appointment,
                startDate: new Date(appointment.startDate),
                endDate: new Date(appointment.endDate),
            };
        });

        recurringAppointment.find((appointment) => {
            const recurrenceOptions = rrulestr(appointment.recurrenceRule);
            const rule = new RRule({
                freq: recurrenceOptions.options.freq,
                interval: recurrenceOptions.options.interval,
                byweekday: recurrenceOptions.options.byweekday,
                dtstart: appointment?.startDate,
            })
            const betweenDate = rule.between(e.component.getStartViewDate(), e.component.getEndViewDate())
            const appointmentDuration = appointment.endDate.getTime() - appointment.startDate.getTime();

            if (betweenDate.length > 0) {
                betweenDate.find((date) => {
                    let recurrentStartTime = date.getTime();

                    if(appointment.allDay) {
                        recurrentStartTime = recurrentStartTime - 86400000
                        startTime = formattedDate(new Date(startTime)).getTime()
                    }
                    const recurrentEndTime = recurrentStartTime + appointmentDuration;

                    if (
                        startTime === recurrentStartTime
                        || startTime > recurrentStartTime && startTime < recurrentEndTime
                        || endTime > recurrentStartTime && endTime <= recurrentEndTime
                    ) {
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
                firstDayOfWeek={0}
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
