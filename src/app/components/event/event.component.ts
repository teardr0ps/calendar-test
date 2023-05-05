import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {
  @Input() event: any;
  @Output() update = new EventEmitter<any>();
  @Output() delete = new EventEmitter<void>();

  editMode: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  toggleEditMode(): void {
    console.log('edit')
    this.editMode = !this.editMode;
  }

  onSave(): void {
    this.update.emit(this.event);
    this.toggleEditMode();
  }

  onDelete(): void {
    this.delete.emit();
  }
}
