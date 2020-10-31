import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { InventoryService } from '../inventory.service';
import { InventoryBase } from '../models/InventoryBase';

@Injectable({ providedIn: 'root' })
export class InventoryResolver implements Resolve<InventoryBase> {
  constructor(private service: InventoryService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<InventoryBase>|Promise<InventoryBase>|InventoryBase {
    return this.service.get(route.paramMap.get('id'));
  }
}
