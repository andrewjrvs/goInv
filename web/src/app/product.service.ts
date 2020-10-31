import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.defaults';
import { OpenFoodFactProduct } from './models/OpenFoodFactProduct';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(public http: HttpClient) { }

  public get(code: string): Promise<OpenFoodFactProduct> {
    return this.http.get<OpenFoodFactProduct>(environment.urls.product.replace('{code}', code))
    .pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 404) {
        return of(null);
      }
      throw error;
    }))
    .toPromise();
  }
}
