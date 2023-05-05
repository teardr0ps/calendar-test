import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

interface CalendarEvent {
  name: string;
  type: string;
  duration: string;
  date: any;
}

interface Day {
  date: moment.Moment;
  isCurrentMonth: boolean;
  events: CalendarEvent[]
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  currentDate: moment.Moment;
  daysInView: Day[] = [];
  events: CalendarEvent[] = [];
  viewMode: 'month' | 'week' = 'month';
  addEventForm!: FormGroup;
  isModalOpen = false;

  constructor() {
    this.currentDate = moment();
  }

  ngOnInit(): void {
    this.addEventForm = new FormGroup({
      eventName: new FormControl('', Validators.required),
      eventType: new FormControl('', Validators.required),
      eventDuration: new FormControl('', Validators.required),
      eventDate: new FormControl('', Validators.required),
      eventRecurrence: new FormControl('none')
    });

    this.loadEventsFromLocalStorage();
    this.generateDaysInView();
  }

  generateDaysInView(): void {
    this.daysInView = [];

    const startOfMonth = this.currentDate.clone().startOf('month').startOf('week');
    const endOfMonth = this.currentDate.clone().endOf('month').endOf('week');

    let currentDate = startOfMonth;

    if (this.viewMode === 'month') {
      while (currentDate.isBefore(endOfMonth)) {
        const day = {
          date: currentDate.clone(),
          isCurrentMonth: currentDate.isSame(this.currentDate, 'month'),
          events: this.getEventsForDay(currentDate) || []
        };
        this.daysInView.push(day);
        currentDate.add(1, 'days');
      }
    } else {
      currentDate = this.currentDate.clone().startOf('week');
        for (let i = 0; i < 7; i++) {
          this.daysInView.push({
            date: currentDate.clone(),
            isCurrentMonth: currentDate.isSame(this.currentDate, 'month'),
            events: this.getEventsForDay(currentDate) || []
          });
          currentDate.add(1, 'day');
        }
    }
  }

  changeViewMode(mode: 'month' | 'week'): void {
    this.viewMode = mode;
    this.generateDaysInView();
  }

  nextPeriod(): void {
    if (this.viewMode === 'month') {
      this.currentDate.add(1, 'month');
    } else {
      this.currentDate.add(1, 'week');
    }
    this.generateDaysInView();
  }

  previousPeriod(): void {
    if (this.viewMode === 'month') {
      this.currentDate.subtract(1, 'month');
    } else {
      this.currentDate.subtract(1, 'week');
    }
    this.generateDaysInView();
  }

  getEventsForDay(day: moment.Moment): any[] {
    return this.events.filter(event => day.isSame(event.date, 'day'));
  }

  onSubmit(): void {
    if (this.addEventForm.valid) {
      const eventDate = moment(this.addEventForm.value.eventDate);
      const recurrence = this.addEventForm.value.eventRecurrence;
      let eventDates = [eventDate];

      if (recurrence === 'weekly') {
        eventDates = [eventDate, ...this.generateRecurringDates(eventDate, 'weeks', 52)];
      } else if (recurrence === 'monthly') {
        eventDates = [eventDate, ...this.generateRecurringDates(eventDate, 'months', 52)];
      }

      for (const date of eventDates) {
        const event = {
          name: this.addEventForm.value.eventName,
          type: this.addEventForm.value.eventType,
          duration: this.addEventForm.value.eventDuration,
          date: date
        };
        this.events.push(event);
      }

      this.saveEventsToLocalStorage();
      this.addEventForm.reset();
      this.generateDaysInView();
      this.closeModal();
    }
  }

  generateRecurringDates(startDate: moment.Moment, unit: 'weeks' | 'months', count: number): moment.Moment[] {
    const dates = [];
    for (let i = 1; i <= count; i++) {
      const newDate = startDate.clone().add(i, unit);
      dates.push(newDate);
    }
    return dates;
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onDayClick(day: any): void {
    if (!day.events.length) {
      this.openModal();
      this.setSelectedDate(day.date);
    }
  }

  setSelectedDate(date: moment.Moment): void {
    this.addEventForm.patchValue({ eventDate: date.format('YYYY-MM-DD') });
  }

  saveEventsToLocalStorage(): void {
    console.log('trigger')
    localStorage.setItem('calendarEvents', JSON.stringify(this.events));
  }

  loadEventsFromLocalStorage(): void {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      this.events = JSON.parse(storedEvents);
      console.log(this.events)
    }
  }

  deleteEventFromLocalStorage(event: CalendarEvent): void {
    console.log(this.events)
    const index = this.events.findIndex(item => item.date === event.date);
    this.events.splice(index, 1);
    localStorage.setItem('calendarEvents', JSON.stringify(this.events));
    this.generateDaysInView();
  }
}
