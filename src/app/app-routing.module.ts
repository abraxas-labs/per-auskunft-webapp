import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsAuthenticatedGuard } from '@abraxas/base-components';
import { PersonDetailComponent } from './features/person-detail/pages/person-detail/person-detail.component';
import { SearchComponent } from './features/search/pages/search/search.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [IsAuthenticatedGuard],
    component: SearchComponent,
  },
  {
    path: 'person/:id',
    pathMatch: 'full',
    canActivate: [IsAuthenticatedGuard],
    component: PersonDetailComponent,
  },
  {
    path: 'person/:id/:evalDate',
    pathMatch: 'full',
    canActivate: [IsAuthenticatedGuard],
    component: PersonDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
