import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InventoryService } from './inventory.service';
import { InventoryComponent } from './inventory/inventory.component';
import { ItemComponent } from './inventory/item.component';
import { ListComponent } from './inventory/list.component';
import { DetailComponent } from './inventory/detail.component';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TKStorageService } from './go-inv.constants';
import { SessionService } from './session.service';
import { WindowRefService } from './window-ref.service';
import { EntryComponent } from './entry/entry.component';
import { SoundService } from './sound.service';
import { SpecsComponent } from './shared/specs.component';

@NgModule({
  declarations: [
    AppComponent,
    InventoryComponent,
    ItemComponent,
    ListComponent,
    DetailComponent,
    EntryComponent,
    SpecsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    InventoryService,
    DatePipe,
    SessionService,
    WindowRefService,
    SoundService,
    { provide: TKStorageService, useValue: localStorage }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
