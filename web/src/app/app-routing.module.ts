import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntryComponent } from './entry/entry.component';
import { DetailComponent } from './inventory/detail.component';
// import { InventoryComponent } from './inventory/inventory.component';
import { ListComponent } from './inventory/list.component';
import { InventoryDetailsResolver } from './resolver/inventory-details.resolver';
import { SessionResolver } from './resolver/session.resolver';

const routes: Routes = [
  { path: 'inventory', children: [
    { path: '', component: ListComponent }
    , { path: ':id', component: DetailComponent, resolve: { data: InventoryDetailsResolver} }
  ] }
  , { path: 'entry', component: EntryComponent, resolve: { sessionId: SessionResolver} }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
