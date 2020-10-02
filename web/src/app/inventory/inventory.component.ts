import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryService } from '../inventory.service';
import { InventoryBase } from '../models/InventoryBase';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {

  public inventory: Observable<InventoryBase[]>;

  constructor(private invSrv: InventoryService) {
    this.inventory = invSrv.list();
  }

  ngOnInit(): void {
  }

}
