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

        if (
            newStartTime > recurrentStartTime && newStartTime < recurrentEndTime
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
    const recurrenceOptions = rrule.rrulestr(recurrentAppointment.recurrenceRule);
    const rule = new rrule.RRule({
        freq: recurrenceOptions.options.freq,
        interval: recurrenceOptions.options.interval,
        byweekday: recurrenceOptions.options.byweekday,
        dtstart: recurrentAppointment?.startDate,
    });
    const recurrentStartDatesInView = rule.between(
        event.component.getStartViewDate(),
        event.component.getEndViewDate()
    );

    return isOverlapUsualRecurrentAppointment(
        recurrentStartDatesInView,
        recurrentAppointment,
        newAppointment);
}
