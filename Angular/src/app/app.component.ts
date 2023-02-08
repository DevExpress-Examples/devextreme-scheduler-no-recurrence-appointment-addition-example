import { Component } from '@angular/core';
import { rrulestr, RRule } from 'rrule';
import { CloseButtonOptions } from './interfaces';
import { appointments, Appointment } from './data/appointments'
import { AppointmentAddingEvent } from "devextreme/ui/scheduler";

@Component({
  selector: 'demo-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
})

export class AppComponent {
  dataSource: Appointment[] = appointments;
  currentDate: Date = new Date(2022, 9, 1);
  popupVisible: boolean = false;
  closeButtonOptions: CloseButtonOptions  = {
    text: 'Close',
    onClick: () => {
      this.popupVisible = false;
    }
  };

  formattedDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  handleAppointmentActions = (e: AppointmentAddingEvent, appointmentData: Appointment): void => {
    let startTime = appointmentData.startDate.getTime();
    const endTime = appointmentData.endDate.getTime();
    const recurringAppointment = this.dataSource.filter((appointment) => appointment?.recurrenceRule).map((appointment) => {
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
            startTime = this.formattedDate(new Date(startTime)).getTime()
          }
          const recurrentEndTime = recurrentStartTime + appointmentDuration;

          if (
            startTime === recurrentStartTime
            || startTime > recurrentStartTime && startTime < recurrentEndTime
            || endTime > recurrentStartTime && endTime <= recurrentEndTime
          ) {
            e.cancel = true;
            this.popupVisible = true;
          }
        })
      }
    })
  }
}
