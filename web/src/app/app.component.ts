import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryService } from './inventory.service';
import { InventoryBase } from './models/InventoryBase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'inventory';

}
