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

  changeEndDate(currentEndDate: Date, updatedEndDate: Date) {
    const current = new Date(currentEndDate);
    const updated = new Date(updatedEndDate);
    current.setFullYear(updated.getFullYear());
    current.setMonth(updated.getMonth());
    current.setDate(updated.getDate());
    return current;
  }

  handleAppointmentActions(e: AppointmentAddingEvent, appointmentData: Appointment): void {
    const recurringAppointment = this.dataSource.filter((appointment) => appointment?.recurrenceRule)

    recurringAppointment.find((appointment) => {
      const recurrenceOptions = rrulestr(appointment.recurrenceRule);
      const rule = new RRule({
        freq: recurrenceOptions.options.freq,
        interval: recurrenceOptions.options.interval,
        byweekday: recurrenceOptions.options.byweekday,
        dtstart: appointment?.startDate,
      })
      const betweenDate = rule.between(e.component.getStartViewDate(), e.component.getEndViewDate())
      const recurrenceAppointmentEndDate = this.changeEndDate(appointment.endDate, appointmentData.endDate);

      if (betweenDate.length > 0) {
        betweenDate.find((date) => {
          if (
            (appointmentData.startDate.getDate() === date.getDate()) &&
            (appointmentData.startDate.getMonth() === date.getMonth()) &&
            (appointmentData.startDate.getTime() >= date.getTime() && recurrenceAppointmentEndDate.getTime() >= appointmentData.endDate.getTime()))
          {
            e.cancel = true;
            this.popupVisible = true;
          }
        })
      }
    })
  }
}
