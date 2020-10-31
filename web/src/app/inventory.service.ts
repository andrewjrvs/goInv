import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { first, shareReplay, switchMapTo, tap, map, filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment.defaults';
import { InventoryBase } from './models/InventoryBase';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {


  private refreshNeeded$ = new BehaviorSubject<void>(undefined);
  private shared$: Observable<InventoryBase[]>;
  private debounceInt: any = null;
  constructor(private http: HttpClient) { }

  public list$(): Observable<InventoryBase[]> {
    if (!this.shared$) {
      this.shared$ = this.refreshNeeded$.pipe(
        switchMapTo(this.http.get<InventoryBase[]>(environment.urls.inventory.replace('{key}', ''))),
        shareReplay(1)
      );
    }
    return this.shared$;
  }

  public get(id: string): Promise<InventoryBase> {
    return this.list$().pipe(
      map(data => data.find(itm => itm._id === id)) // Array.isArray(data) ? data[0] : data )
      , first()
    ).toPromise();
    // return this.http.get<InventoryBase | InventoryBase[]>(environment.urls.inventory.replace('{key}', id)).pipe(
    //   map(data => Array.isArray(data) ? data[0] : data )
    // ).toPromise<InventoryBase>();
  }

  public get$(id: string): Observable<InventoryBase> {
    return this.refreshNeeded$.pipe(
      switchMapTo(this.http.get<InventoryBase | InventoryBase[]>(environment.urls.inventory.replace('{key}', id)))
      , map(data => Array.isArray(data) ? data[0] : data )
    );
  }

  public refresh(): void {
    this.refreshNeeded$.next();
  }

  public add(item: InventoryBase): void {
    this.http.post(environment.urls.inventory.replace('{key}', ''), item)
      .pipe(tap(() => this.debounceRefresh())).toPromise();
  }

  public update(item: InventoryBase): void {
    this.http.put(environment.urls.inventory.replace('{key}', item._id), item)
      .pipe(tap(() => this.debounceRefresh())).toPromise();
  }

  public delete(item: InventoryBase): void {
    this.http.delete(environment.urls.inventory.replace('{key}', item._id))
      .pipe(tap(() => this.debounceRefresh())).toPromise();
  }

  private debounceRefresh(): void {
    if (this.debounceInt) {
      clearTimeout(this.debounceInt);
    }
    this.debounceInt = setTimeout(() => {
      this.refreshNeeded$.next();
      this.debounceInt = null;
    }, 500);
  }
}
