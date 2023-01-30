<template>
  <DxPopup
      v-model:visible='popupVisible'
      :drag-enabled='false'
      :hide-on-outside-click='true'
      :show-close-button='false'
      :show-title='true'
      title='Information'
      container='.dx-viewport'
      width='280'
      height='150'
  >
    <DxPosition
        at='center'
        my='center'
    />
    <DxToolbarItem
        widget='dxButton'
        toolbar='bottom'
        location='after'
        :options='closeButtonOptions'
    />
    <p>There is a recurrent appointment in this cell.</p>
  </DxPopup>
  <DxScheduler
      :on-appointment-adding='(e) => handleAppointmentActions(e, e.appointmentData)'
      :on-appointment-updating='(e) => { handleAppointmentActions(e, e.newData); }'
      :data-source='data'
      :views='[{type: "week"}]'
      :first-day-of-week='0'
      current-view='week'
      :current-date='new Date(2020, 10, 25)'
      :start-day-hour='9'
      width='100%'
      height='100%'
  />
</template>

<script>
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import {DxScheduler} from 'devextreme-vue/scheduler';
import {DxPopup, DxPosition, DxToolbarItem} from 'devextreme-vue/popup';
import {rrulestr} from 'rrule';
import {defaultData} from './data';

export default {
  name: 'App',
  components: {
    DxScheduler,
    DxPopup,
    DxPosition,
    DxToolbarItem
  },
  data() {
    return {
      popupVisible: false,
      data: defaultData,
      closeButtonOptions: {
        text: 'Close',
        onClick: () => {
          this.popupVisible = false;
        },
      },
    }
  },
  methods: {
    getDayFromArray(dateString) {
      const weekDayNumbers = [6, 0, 1, 2, 3, 4, 5];
      const date = new Date(dateString);
      const day = date.getDay();

      return weekDayNumbers[day];
    },
    handleAppointmentActions(e, appointmentData) {
      const recurringAppointment = this.data.find((appointment) => {
        if (appointment.recurrenceRule) {
          const recurrenceOptions = rrulestr(appointment.recurrenceRule);
          const weekDays = recurrenceOptions.options.byweekday;
          const dateInArray = this.getDayFromArray(appointmentData.startDate);
          if (weekDays.includes(dateInArray)) {
            return appointment;
          }
        }
      });
      if (recurringAppointment) {
        const newAppointmentStartMinutes = appointmentData.startDate.getHours() * 60 + appointmentData.startDate.getMinutes();
        const newAppointmentEndMinutes = appointmentData.endDate.getHours() * 60 + appointmentData.endDate.getMinutes();
        const recurringAppointmentStartMinutes = recurringAppointment.startDate.getHours() * 60 + recurringAppointment.startDate.getMinutes();
        const recurringAppointmentEndMinutes = recurringAppointment.endDate.getHours() * 60 + recurringAppointment.endDate.getMinutes();
        if ((newAppointmentStartMinutes > recurringAppointmentStartMinutes && newAppointmentStartMinutes < recurringAppointmentEndMinutes) || (newAppointmentEndMinutes > recurringAppointmentStartMinutes && newAppointmentEndMinutes < recurringAppointmentEndMinutes)) {
          e.cancel = true;
          this.popupVisible = true;
        }
      }
    }
  }
}
</script>
