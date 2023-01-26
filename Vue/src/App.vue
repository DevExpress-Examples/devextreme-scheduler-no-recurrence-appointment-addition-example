<template>
  <DxPopup
      v-model:visible="popupVisible"
      :drag-enabled="false"
      :hide-on-outside-click="true"
      :show-close-button="false"
      :show-title="true"
      title='Information'
      container='.dx-viewport'
      width="280"
      height="150"
  >
    <DxPosition
        at='center'
        my='center'
    />
    <DxToolbarItem
        widget='dxButton'
        toolbar='bottom'
        location='after'
        :options="closeButtonOptions"
    />
    <p>There is a recurrent appointment in this cell.</p>
  </DxPopup>
  <DxScheduler
      :on-appointment-adding="handleAppointmentAdding"
      :data-source="data"
      :views="[{type: 'week'}]"
      current-view='week'
      :current-date="new Date(2020, 10, 25)"
      :start-day-hour="9"
      width='100%'
      height='100%'
  />
</template>

<script>
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import {DxScheduler} from 'devextreme-vue/scheduler';
import {DxPopup, DxPosition, DxToolbarItem} from 'devextreme-vue/popup';
import {rrulestr} from 'rrule';
import {defaultData} from "./data";

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
    checkDateInArray(dateString) {
      const weekDayNumbers = [6, 0, 1, 2, 3, 4, 5];
      let date = new Date(dateString);
      let day = date.getDay();

      return weekDayNumbers[day];
    },
    handleAppointmentAdding(e) {
      const recurringAppointment = this.data.find((appointment) => {
        if (appointment.recurrenceRule) {
          const recurrenceOptions = rrulestr(appointment.recurrenceRule);
          const weekDays = recurrenceOptions.options.byweekday;
          const dateInArray = this.checkDateInArray(e.appointmentData.startDate);
          if (weekDays.includes(dateInArray)) {
            return appointment;
          }
        }
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
}
</script>
