export interface CloseButtonOptions {
  text: string;
  onClick: () => void;
}

export interface Appointment {
  text: string;
  startDate: Date;
  endDate: Date;
  recurrenceRule: string;
  allDay?: boolean;
}
