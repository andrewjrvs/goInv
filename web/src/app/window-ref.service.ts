/*
  code taken from https://stackoverflow.com/questions/34177221/how-to-inject-window-into-a-service
*/
import { Injectable } from '@angular/core';

// just so I have it in the future...
// tslint:disable-next-line: no-empty-interface
export interface ICustomWindow extends Window {}

function getWindow(): any {
  return window;
}

@Injectable({
  providedIn: 'root'
})
export class WindowRefService {

  constructor() { }

  get nativeWindow(): ICustomWindow {
    return getWindow();
  }
}
