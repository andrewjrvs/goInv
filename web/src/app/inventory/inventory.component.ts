import { Component, HostBinding, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMapTo } from 'rxjs/operators';
import { InventoryService } from '../inventory.service';
import { InventoryBase } from '../models/InventoryBase';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {

  constructor() {
  }
  ngOnInit(): void {
  }


}
