import { Component, Input, OnInit } from '@angular/core';
import { OpenFoodFactProduct } from '../models/OpenFoodFactProduct';

@Component({
  selector: 'app-specs',
  templateUrl: './specs.component.html',
  styleUrls: ['./specs.component.scss']
})
export class SpecsComponent implements OnInit {

  @Input()
  public hideUnknown = true;

  @Input()
  public product: OpenFoodFactProduct;

  @Input()
  public includeImage = false;

  constructor() { }

  ngOnInit(): void {
  }

}
