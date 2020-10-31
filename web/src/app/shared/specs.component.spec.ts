import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecsComponent } from './specs.component';

describe('SpecsComponent', () => {
  let component: SpecsComponent;
  let fixture: ComponentFixture<SpecsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
