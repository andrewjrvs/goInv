import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import * as uuid from 'uuid';
import { TKStorageService } from './go-inv.constants';
import { WindowRefService } from './window-ref.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy {
  private readonly keyName = 'session_id';

  private activeSessionID = new ReplaySubject<string>(1);

  // @HostListener('storage', ['$event'])
  private onStorageChange(event: StorageEvent): void {
    if (event.key === this.keyName) {
      this.activeSessionID.next(event.newValue);
    }
  }

  public get$(): Observable<string> {
    return this.activeSessionID.asObservable();
  }

  private generateSessionID(): string {
    return uuid.v4();
  }

  private findSessionID(): string {

    let strSession = this.storageSrv.getItem(this.keyName);
    if (!strSession) {
      strSession = this.generateSessionID();
      this.storageSrv.setItem(this.keyName, strSession);
    }
    return strSession;
  }

  constructor(@Inject(TKStorageService) private storageSrv: Storage, private windowRefSrv: WindowRefService) {
    this.activeSessionID.next(this.findSessionID());

    this.windowRefSrv.nativeWindow.addEventListener('storage', this.onStorageChange.bind(this));
  }

  ngOnDestroy(): void {
    this.windowRefSrv.nativeWindow.removeEventListener('storage', this.onStorageChange.bind(this));
  }

  public createNewSession(): void {
    const newSessionID = this.generateSessionID();
    this.storageSrv.setItem(this.keyName, newSessionID);
    this.activeSessionID.next(newSessionID);
  }

}
