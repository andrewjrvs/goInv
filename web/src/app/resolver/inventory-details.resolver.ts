import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { InventoryBase } from '../models/InventoryBase';
import { OpenFoodFactProduct } from '../models/OpenFoodFactProduct';
import { ProductService } from '../product.service';
import { InventoryResolver } from './inventory.resolver';

@Injectable({ providedIn: 'root' })
export class InventoryDetailsResolver implements Resolve<{ item: InventoryBase, product: OpenFoodFactProduct }> {
  constructor(private readonly prdSrv: ProductService
            , private readonly invRsv: InventoryResolver) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<{ item: InventoryBase, product: OpenFoodFactProduct }> |
    Promise<{ item: InventoryBase, product: OpenFoodFactProduct }> |
    { item: InventoryBase, product: OpenFoodFactProduct } {
    return new Promise<{ item: InventoryBase, product: OpenFoodFactProduct }>(async (res, rej) => {
      const inv = this.invRsv.resolve(route, state);
      let item = null;
      let product = null;
      if (inv instanceof Promise) {
        item = await inv;
      } else if (inv instanceof Observable) {
        item = await inv.toPromise();
      } else {
        item = inv;
      }
      if (item.code) {
        product = await this.prdSrv.get(item.code);
      }
      res({item, product});
    });
  }
}
