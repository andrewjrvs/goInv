import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { InventoryBase } from '../models/InventoryBase';

declare var DocumentTouch: any;

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  @HostBinding('class.pendingDelete')
  private pendingDelete = false;

  @HostBinding('class.dragging')
  private isDragging = false;

  @ViewChild('wrapper')
  private wrapperEl: ElementRef;

  @Output()
  public delete = new EventEmitter<InventoryBase>();

  @Output()
  public selected = new EventEmitter<InventoryBase>();

  @Input()
  public item: InventoryBase;

  private offset: {x: number, y: number} = {x: 0, y: 0};

  @HostListener('touchstart', ['$event'])
  mouseDown(e: TouchEvent): void {
    this.isDragging = true;
    const touchobj = e.changedTouches[0];
    this.offset.x = touchobj.pageX;
    this.offset.y = touchobj.pageY;
  }

  @HostListener('touchend', ['$event'])
  mouseup(e: TouchEvent): void {
    const positionX = parseInt(this.wrapperEl.nativeElement.style.marginLeft, 10);
    // if they arn't removing it don't worry
    if (positionX >= 0) {
      return;
    }
    const elOffsetWidth = this.elRef.nativeElement.offsetWidth || 1;

    // if we are atleast 20% moved, we can delete it.
    if ((-1 * positionX * 100 / elOffsetWidth) > 20) {
      this.delete.emit(this.item);
      this.isDragging = false;
      return;
    }
    this.clearSwip();
  }

  @HostListener('touchcancel', ['$event'])
  mouseleave(e: TouchEvent): void {
    if (this.isDragging) {
      this.clearSwip();
    }
  }


  @HostListener('touchmove', ['$event'])
  mousemove(e: TouchEvent): void {
    if (this.isDragging) {
      const touchobj = e.changedTouches[0];
      const positionX = (touchobj.pageX - this.offset.x);
      if (positionX > 0) {
        return;
      }
      this.wrapperEl.nativeElement.style.position = 'relative';
      this.wrapperEl.nativeElement.style.marginLeft = positionX + 'px';
      if (positionX < 0) {
        this.pendingDelete = true;
      } else {
        this.pendingDelete = false;
      }
    }
  }

  constructor(private elRef: ElementRef) {
  }

  public onClickDelete(): void {
    this.delete.emit(this.item);
  }

  public onClickSelect(): void {
    this.selected.emit(this.item);
  }

  ngOnInit(): void {
  }

  private clearSwip(): void {
    this.isDragging = false;
    this.pendingDelete = false;
    this.offset.x = 0;
    this.offset.y = 0;
    this.wrapperEl.nativeElement.style.position = '';
    this.wrapperEl.nativeElement.style.marginLeft = '';
  }

  public getIcon(): string {
    let rtnValue = '🥫';
    const compareNm = this.item.product_name.toLowerCase();
    if (compareNm === '' ) {
      rtnValue = '❓';

    } else if (compareNm.indexOf('bar') > -1) {
      rtnValue = '🥜';
    } else if (compareNm.indexOf('soup') > -1 ||
               compareNm.indexOf('broth') > -1) {
      rtnValue = '🥣';
    } else if (compareNm.indexOf('mix') > -1) {
      rtnValue = '📦';
    } else if (compareNm.indexOf('juice') > -1) {
      rtnValue = '🧃';
    } else if (compareNm.indexOf('chocolate') > -1) {
      rtnValue = '🍫';
    } else if (compareNm.indexOf('vegetable') > -1) {
      rtnValue = '🍆';
    } else if (compareNm.indexOf('marshmallow') > -1) {
      rtnValue = '🍬';
    } else if (compareNm.indexOf('cookie') > -1) {
      rtnValue = '🍪';
    } else if (compareNm.indexOf('oil') > -1) {
      rtnValue = '💧';
    } else if (compareNm.indexOf('dressing') > -1) {
      rtnValue = '🥗';
    } else if (compareNm.indexOf('pasta') > -1 ||
              compareNm.indexOf('lasagna') > -1 ) {
      rtnValue = '🍝';
    } else if (compareNm.indexOf('water') > -1) {
      rtnValue = '🚰';
    }

    return rtnValue;
  }

  

}
