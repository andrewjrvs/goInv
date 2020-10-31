import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OpenFoodFactProduct } from '../models/OpenFoodFactProduct';
import { ProductService } from '../product.service';
import { SoundService } from '../sound.service';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {

  public lookupForm: FormGroup = null;
  public sessionId: string = null;
  public lastProduct: OpenFoodFactProduct = null;

  constructor(private readonly route: ActivatedRoute
            , private readonly productSrv: ProductService
            , private readonly soundSrv: SoundService
            , private fb: FormBuilder) { }

  ngOnInit(): void{
    // get the current 'session'
    const {sessionId} = (this.route.snapshot.data as any);
    this.sessionId = sessionId;

    // build the form...
    this.lookupForm = this.fb.group({
      upc: ['0021908509273'],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.lookupForm.get('upc').value) {
      const product = await this.productSrv.get(this.lookupForm.get('upc').value);
      if (product) {
        this.soundSrv.playSuccess();
        this.lastProduct = product;
      } else {
        this.soundSrv.playFail();
        this.lastProduct = null;
      }
    }
    this.lookupForm.reset();
  }

  public onDelete(): void {
    
  }
}
