export const defaultData = [
  {
    text: 'Book Flights to San Fran for Sales Trip',
    startDate: new Date(2020, 10, 26),
    endDate: new Date(2020, 10, 26),
    allDay: true,
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=TH',
  },
  {
    text: 'Watercolor Landscape',
    startDate: new Date(2020, 10, 1, 10, 30),
    endDate: new Date(2020, 10, 1, 12),
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR,SU',
  },
  {
    text: 'Marshmallow',
    startDate: new Date(2020, 10, 1, 15),
    endDate: new Date(2020, 10, 1, 17, 30),
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU,FR',
  }
];
