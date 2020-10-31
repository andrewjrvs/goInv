import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { SessionService } from '../session.service';

@Injectable({ providedIn: 'root' })
export class SessionResolver implements Resolve<string> {
  constructor(private service: SessionService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.service.get$().pipe(first());
  }
}
