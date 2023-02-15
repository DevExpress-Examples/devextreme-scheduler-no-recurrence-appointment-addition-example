import { Component } from '@angular/core';
import { isOverlapRecurrentAppointment } from '../utils/isOverlapRecurrentAppointment';
import { appointments } from '../data/appointments';
import { CloseButtonOptions, Appointment } from './interfaces';
import { AppointmentAddingEvent, AppointmentUpdatingEvent } from 'devextreme/ui/scheduler';

@Component({
  selector: 'demo-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
})

export class AppComponent {
  allDayPanelMode = 'hidden';
  dataSource = appointments;
  currentDate = new Date(2022, 9, 1);
  popupVisible = false;
  closeButtonOptions: CloseButtonOptions  = {
    text: 'Close',
    onClick: () => {
      this.popupVisible = false;
    }
  };

  handleAppointmentAdd(
    event: AppointmentAddingEvent
  ): void {
    this.handleAppointmentActions(
      event,
      this.getRecurrentAppointments(),
      event.appointmentData as Appointment,
    );
  }

  handleAppointmentUpdate(
    event: AppointmentUpdatingEvent,
  ): void {
    const recurrentAppointments = this.getRecurrentAppointments()
      .filter((appointment) => appointment !== event.oldData);
    this.handleAppointmentActions(
      event,
      recurrentAppointments,
      event.newData as Appointment,
    )
  }

  private handleAppointmentActions(
    event: AppointmentAddingEvent | AppointmentUpdatingEvent,
    recurrentAppointments: Appointment[],
    newAppointment: Appointment): void {
    for(const recurrentAppointment of recurrentAppointments) {
      const isOverlap = isOverlapRecurrentAppointment(
        event as AppointmentAddingEvent,
        recurrentAppointment,
        newAppointment);
      if (isOverlap) {
        event.cancel = true;
        this.popupVisible = true;
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
}
