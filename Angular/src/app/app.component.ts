import { Component } from '@angular/core';
import { isOverlapRecurrentAppointment } from '../utils/isOverlapRecurrentAppointment';
import { appointments } from '../data/appointments';
import { CloseButtonOptions, Appointment } from './interfaces';
import { AppointmentAddingEvent } from 'devextreme/ui/scheduler';

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

  handleAppointmentActions(event: AppointmentAddingEvent, newAppointment: Appointment): void {
    const recurrentAppointments = this.getRecurrentAppointments();
    for(const recurrentAppointment of recurrentAppointments) {
      const isOverlap = isOverlapRecurrentAppointment(
        event,
        recurrentAppointment,
        newAppointment);
      if (isOverlap) {
        this.cancelAppointmentAdding(event);
      }
    }
  }

  private getRecurrentAppointments(): Appointment[] {
    return this.dataSource
      .filter((appointment) => appointment?.recurrenceRule)
      .map((appointment) => ({
        ...appointment,
        startDate: new Date(appointment.startDate),
        endDate: new Date(appointment.endDate),
      }));
  }

  private cancelAppointmentAdding(event: AppointmentAddingEvent): void {
    event.cancel = true;
    this.popupVisible = true;
  }
}
