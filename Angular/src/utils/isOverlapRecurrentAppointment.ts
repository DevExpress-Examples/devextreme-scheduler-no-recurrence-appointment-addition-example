import {AppointmentAddingEvent} from 'devextreme/ui/scheduler';
import {RRule, rrulestr} from 'rrule';
import {Appointment} from '../app/interfaces';

const MS_IN_HOUR = 60000;

function resetDateTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function getAllDayStartTime(date: Date): number {
  return resetDateTime(new Date(date.getTime() + date.getTimezoneOffset() * MS_IN_HOUR)).getTime();
}
function getAllDayEndTime(endTime: number): number {
  let endDate = new Date(endTime);
  endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
  return endDate.getTime();
}

function convertRecurrenceExceptions(dateStrings: string): Date[] {
  return dateStrings.split(",").map(dateString => {
    return new Date(dateString.slice(0, 4) + "-" + dateString.slice(4, 6) + "-" + dateString.slice(6, 8) + "T" + dateString.slice(9, 11) + ":" + dateString.slice(11, 13) + ":" + dateString.slice(13, 15) + "Z");
  });
}

function checkRecurrenceException(recurrentAppointment: string, newAppointment: Appointment): boolean {
    return !convertRecurrenceExceptions(recurrentAppointment).filter((exceptionDate: Date): boolean => {
      return newAppointment.startDate.getTime() === exceptionDate.getTime()
        || newAppointment.endDate.getTime() === exceptionDate.getTime();
    });
}

function isOverlapAllDayRecurrentAppointment(
  recurrentStartDatesInView: Date[],
  recurrentBaseAppointment: Appointment,
  newAppointment: Appointment,
): boolean {
  const recurrentBaseStartTime = resetDateTime(recurrentBaseAppointment.startDate).getTime();
  const recurrentBaseEndTime = recurrentBaseAppointment.endDate.getTime();
  const recurrentDuration = recurrentBaseEndTime - recurrentBaseStartTime;
  const newStartTime = newAppointment.startDate.getTime();
  const newEndTime = newAppointment.endDate.getTime();

  for(const recurrentStartDate of recurrentStartDatesInView) {
    const recurrentStartTime = getAllDayStartTime(recurrentStartDate);
    const recurrentEndTime = getAllDayEndTime(recurrentStartTime + recurrentDuration);

    if (
      newStartTime > recurrentStartTime && newStartTime < recurrentEndTime
      || newEndTime > recurrentStartTime && newEndTime < recurrentEndTime
      || recurrentStartTime > newStartTime && recurrentStartTime < newEndTime
    ) {
      return true;
    }
  }
  return false;
}
function isOverlapUsualRecurrentAppointment(
  recurrentStartDatesInView: Date[],
  recurrentBaseAppointment: Appointment,
  newAppointment: Appointment,
): boolean {
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
  event: AppointmentAddingEvent,
  recurrentAppointment: Appointment,
  newAppointment: Appointment,
): boolean {
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

  if(recurrentAppointment.recurrenceException) {
    return checkRecurrenceException(
      recurrentAppointment.recurrenceException,
      newAppointment
    )
  }
  if (newAppointment.allDay && recurrentAppointment.allDay) {
    return isOverlapAllDayRecurrentAppointment(
      recurrentStartDatesInView,
      recurrentAppointment,
      newAppointment,
    )
  }
  if (!newAppointment.allDay && !recurrentAppointment.allDay) {
    return isOverlapUsualRecurrentAppointment(
      recurrentStartDatesInView,
      recurrentAppointment,
      newAppointment    );
  }
  return false;
}
