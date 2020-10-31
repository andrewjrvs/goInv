import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InventoryBase } from '../models/InventoryBase';
import { OpenFoodFactProduct } from '../models/OpenFoodFactProduct';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  public item: InventoryBase;
  public product: OpenFoodFactProduct;

  @ViewChild('dialog') divView: ElementRef;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const {item, product} = (this.route.snapshot.data as any).data;
    this.item = item;
    this.product = product;
  }

  show(): void {
    this.divView.nativeElement.showModal();
  }
}
