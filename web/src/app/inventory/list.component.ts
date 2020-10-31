import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, map, switchMapTo } from 'rxjs/operators';
import { InventoryService } from '../inventory.service';
import { InventoryBase } from '../models/InventoryBase';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  @HostBinding('class.pendingDelete')
  private get classPendingDelete(): boolean {
    return (this.pendingDelete && this.pendingDelete.length > 0);
  }

  public filterControl = new FormControl();

  private pendingDeleteMS = 5 * 1000;

  public inventory: Observable<InventoryBase[]>;
  private invFlag = new BehaviorSubject<void>(undefined);

  private pendingDelete: InventoryBase[] = [];
  private filterText: string = null;

  private intPendingDeleteTimer: any = null;

  private subFilterUpdate: Subscription = null;
  private subFilterParam: Subscription = null;

  constructor(private invSrv: InventoryService, private router: Router, private route: ActivatedRoute, public location: Location) {

    this.inventory = this.invFlag.pipe(
      switchMapTo(invSrv.list$().pipe(
        map((items) => items.filter(inv => this.pendingDelete.findIndex((dItm) => dItm._id === inv._id) === -1))
        , map((items) => items.filter(inv => {
          if (!this.filterText) {
            return true;
          }
          if (inv.code && inv.code.startsWith(this.filterText)) {
            return true;
          }
          if (inv.brand_owner && inv.brand_owner.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1) {
            return true;
          }
          if (inv.product_name && inv.product_name.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1) {
            return true;
          }
          if (inv.brands && inv.brands.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }))
      )
      ));
  }
  ngOnDestroy(): void {
    this.subFilterUpdate.unsubscribe();
    this.subFilterParam.unsubscribe();
  }

  public onDelete(item: InventoryBase): void {
    if (this.intPendingDeleteTimer) {
      clearTimeout(this.intPendingDeleteTimer);
    }
    this.pendingDelete.push(item);
    this.invFlag.next();
    this.intPendingDeleteTimer = setTimeout(() => {
      this.pendingDelete.forEach((itm) => this.invSrv.delete(itm));
      this.pendingDelete.length = 0;
      this.intPendingDeleteTimer = null;
    }, this.pendingDeleteMS);
  }

  public onSelected(item: InventoryBase): void {
    if (item._id) {
      this.router.navigate([item._id], { relativeTo: this.route });
    }
  }

  public undoDeletes(): void {
    if (this.intPendingDeleteTimer) {
      clearTimeout(this.intPendingDeleteTimer);
      this.intPendingDeleteTimer = null;
    }
    this.pendingDelete.length = 0;
    this.invFlag.next();
  }

  ngOnInit(): void {
    this.subFilterUpdate = this.filterControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(newValue => {
      this.filterText = newValue;
      this.invFlag.next();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          filter: newValue
        },
        queryParamsHandling: 'merge',
        // preserve the existing query params in the route
        skipLocationChange: true
        // do not trigger navigation
      });
    });

    this.subFilterParam = this.route.queryParamMap.subscribe(params => {
      console.log('this.filterText', this.filterText);
      const filter = params.get('filter');
      if (!this.filterText && filter !== '') {
        console.log('queryParams', filter);
        this.filterControl.setValue(filter);
        // this.filterText = filter;
        this.invFlag.next();
      }
    });
  }


}
