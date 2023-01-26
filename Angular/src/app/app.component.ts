import { Component } from '@angular/core';
import { rrulestr } from 'rrule';
import {CloseButtonOptions} from './interfaces';
import {appointments, Appointment} from './data/appointments'

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

  checkDateInArray(dateString: string): number {
    const weekDayNumbers = [6, 0, 1, 2, 3, 4, 5];
    let date = new Date(dateString);
    let day = date.getDay();

    return weekDayNumbers[day];
  }

  handleAppointmentAdding(e: any): void {
    const recurringAppointment = this.dataSource.find((appointment: Appointment) => {
      if (appointment.recurrenceRule) {
        const recurrenceOptions = rrulestr(appointment.recurrenceRule);
        const weekDays = recurrenceOptions.options.byweekday;
        const dateInArray = this.checkDateInArray(e.appointmentData.startDate);
        if (weekDays.includes(dateInArray)) {
          return appointment;
        }
      }
      return false
    });

    if (recurringAppointment) {
      const newAppointmentStartMinutes = e.appointmentData.startDate.getHours() * 60 + e.appointmentData.startDate.getMinutes();
      const newAppointmentEndMinutes = e.appointmentData.endDate.getHours() * 60 + e.appointmentData.endDate.getMinutes();
      const recurringAppointmentStartMinutes = recurringAppointment.startDate.getHours() * 60 + recurringAppointment.startDate.getMinutes();
      const recurringAppointmentEndMinutes = recurringAppointment.endDate.getHours() * 60 + recurringAppointment.endDate.getMinutes();

      if ((newAppointmentStartMinutes > recurringAppointmentStartMinutes && newAppointmentStartMinutes < recurringAppointmentEndMinutes) || (newAppointmentEndMinutes > recurringAppointmentStartMinutes && newAppointmentEndMinutes < recurringAppointmentEndMinutes)) {
        e.cancel = true;
        this.popupVisible = true;
      }
    }
  }
}
