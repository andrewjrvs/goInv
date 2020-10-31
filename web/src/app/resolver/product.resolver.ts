import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { OpenFoodFactProduct } from '../models/OpenFoodFactProduct';
import { ProductService } from '../product.service';

@Injectable({ providedIn: 'root' })
export class InventoryResolver implements Resolve<OpenFoodFactProduct> {
  constructor(private service: ProductService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.service.get(route.paramMap.get('code'));
  }
}
