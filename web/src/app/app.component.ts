import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, tap } from 'rxjs/operators';
import { SessionService } from './session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'inventory';
  private activeURL: string = null;

  public allowBack = false;

  constructor(private router: Router
            // , private sessionSrv: SessionService
            , private location: Location
            ) {
    // we need to keep track of the 'route'
    this.router.events.pipe(
       filter(event => event instanceof NavigationEnd)
       , map((event: NavigationEnd) => event.url)
       , tap(url => this.allowBack = (url !== '/'))
    ).subscribe((url) => this.activeURL = url);

    // this.sessionSrv.get$().subscribe((key) => console.log('sessionID', key));
    // setTimeout(() => this.sessionSrv.createNewSession(), 1000);
  }

  public async onBack(): Promise<void> {
    // UGG... there HAS to be a better way to do this, but it appears that because
    // this navigation isn't part of the child element... I can't just go up to it's parent...
    // THIS SUCKS....
    // if (this.activeURL) {
    //   const newURLarr = this.activeURL.split('/');
    //   newURLarr.pop();
    //   this.router.navigate([newURLarr.join('/')]);
    //   return;
    // }
    // this.router.navigate(['..']);
    this.location.back();
  }
}
