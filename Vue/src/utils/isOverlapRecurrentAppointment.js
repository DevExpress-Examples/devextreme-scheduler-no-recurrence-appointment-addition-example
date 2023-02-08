import { RRule, rrulestr } from 'rrule';

const MS_IN_HOUR = 60000;

function resetDateTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function resetAllDayStartDateTime(date) {
    return resetDateTime(new Date(date.getTime() + new Date().getTimezoneOffset() * MS_IN_HOUR));
}

function isOverlapAllDayRecurrentAppointment(
    recurrentStartDatesInView,
    recurrentBaseAppointment,
    newAppointment,
) {
    const newStartTime = resetDateTime(newAppointment.startDate).getTime();

    for(const recurrentStartDate of recurrentStartDatesInView) {
        const recurrentStartTime = resetAllDayStartDateTime(recurrentStartDate).getTime();

        if (newStartTime === recurrentStartTime) {
            return true;
        }
    }

    return false;
}

function isOverlapUsualRecurrentAppointment(
    recurrentStartDatesInView,
    recurrentBaseAppointment,
    newAppointment,
) {
    const recurrentBaseStartTime = recurrentBaseAppointment.startDate.getTime();
    const recurrentBaseEndTime = recurrentBaseAppointment.endDate.getTime();
    const recurrentDuration = recurrentBaseEndTime - recurrentBaseStartTime;
    const newStartTime = newAppointment.startDate.getTime();
    const newEndTime = newAppointment.endDate.getTime();

    for(const recurrentStartDate of recurrentStartDatesInView) {
        const recurrentStartTime = recurrentStartDate.getTime();
        const recurrentEndTime = recurrentStartTime + recurrentDuration;

        if (newStartTime > recurrentStartTime && newStartTime < recurrentEndTime
            || newEndTime > recurrentStartTime && newEndTime < recurrentEndTime
            || recurrentStartTime > newStartTime && recurrentStartTime < newEndTime) {
            return true;
        }
    }

    return false;
}

export function isOverlapRecurrentAppointment(
    event,
    recurrentAppointment,
    newAppointment,
) {
    const recurrenceOptions = rrulestr(recurrentAppointment.recurrenceRule);
    const rule = new RRule({
        freq: recurrenceOptions.options.freq,
        interval: recurrenceOptions.options.interval,
        byweekday: recurrenceOptions.options.byweekday,
        dtstart: recurrentAppointment?.startDate,
    });
    const recurrentStartDatesInView = rule.between(
        event.component.getStartViewDate(),
        event.component.getEndViewDate()
    );

    return recurrentAppointment.allDay
        ? isOverlapAllDayRecurrentAppointment(
            recurrentStartDatesInView,
            recurrentAppointment,
            newAppointment,
        )
        : isOverlapUsualRecurrentAppointment(
            recurrentStartDatesInView,
            recurrentAppointment,
            newAppointment
        );
}
