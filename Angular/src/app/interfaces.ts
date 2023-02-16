export interface CloseButtonOptions {
  text: string;
  onClick: () => void;
}

export interface Appointment {
  recurrenceException?: string;
  text: string;
  startDate: Date;
  endDate: Date;
  recurrenceRule: string;
  allDay?: boolean;
}
