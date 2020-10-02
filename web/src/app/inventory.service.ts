import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment.defaults';
import { InventoryBase } from './models/InventoryBase';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private http: HttpClient) { }

  public list(): Observable<InventoryBase[]> {
    return this.http.get<InventoryBase[]>(environment.urls.inventory.replace('{key}', '')).pipe(shareReplay(1));
  }
}
