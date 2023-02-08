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
import { DxScheduler } from 'devextreme-vue/scheduler';
import { DxPopup, DxPosition, DxToolbarItem } from 'devextreme-vue/popup';
import { rrulestr, RRule } from 'rrule';
import { defaultData } from './data';

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
    formattedDate(date) {
      return  new Date(date.getFullYear(), date.getMonth(), date.getDate())
    },
    handleAppointmentActions(e, appointmentData) {
      let startTime = appointmentData.startDate.getTime();
      const endTime = appointmentData.endDate.getTime();
      const recurringAppointment = defaultData.filter((appointment) => appointment?.recurrenceRule).map((appointment) => {
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
}
</script>
