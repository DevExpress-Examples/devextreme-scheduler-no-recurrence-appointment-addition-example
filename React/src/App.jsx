import { useCallback, useState, useRef } from 'react';
import Scheduler from 'devextreme-react/scheduler';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import { isOverlapRecurrentAppointment } from './utils/isOverlapRecurrentAppointment';
import { defaultData } from './data.js';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.css';
import './App.css';

const App = () => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [data] = useState(defaultData);

    const closeButtonOptions = useRef({
        text: 'Close',
        onClick: () => {
            setPopupVisible(false);
        },
    });

    const handleAppointmentActions = useCallback((
        event,
        recurrentAppointments,
        newAppointment) => {
        for (const recurrentAppointment of recurrentAppointments) {
            const isOverlap = isOverlapRecurrentAppointment(
                event,
                recurrentAppointment,
                newAppointment);
            if (isOverlap) {
                event.cancel = true;
                setPopupVisible(true)
            }
        }
    }, []);

    const getRecurrentAppointments = useCallback(() => {
        return data
            .filter((appointment) => appointment?.recurrenceRule)
            .map((appointment) => ({
                ...appointment,
                startDate: new Date(appointment.startDate),
                endDate: new Date(appointment.endDate),
            }));
    }, [data]);

    const handleAppointmentAdd = useCallback((event) => {
        handleAppointmentActions(
            event,
            getRecurrentAppointments(),
            event.appointmentData,
        );
    }, [handleAppointmentActions, getRecurrentAppointments]);

    const handleAppointmentUpdate = useCallback((event) => {
        const recurrentAppointments = getRecurrentAppointments()
            .filter((appointment) => appointment !== event.oldData);
        handleAppointmentActions(
            event,
            recurrentAppointments,
            event.newData,
        )
    }, [handleAppointmentActions, getRecurrentAppointments]);

    return (
        <>
            <Popup
                visible={popupVisible}
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
                allDayPanelMode='hidden'
                onAppointmentAdding={handleAppointmentAdd}
                onAppointmentUpdating={handleAppointmentUpdate}
            />
        </>
    );
}

export default App;
