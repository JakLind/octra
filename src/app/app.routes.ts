import {RouterModule, Routes} from '@angular/router';

import {LoginComponent} from './gui/login/login.component';
import {MEMBER_ROUTES} from './gui/members-area/members.routes';
import {MembersAreaComponent} from './gui/members-area/members-area.component';
import {ALoginGuard} from './guard/login.activateguard';
import {LogoutComponent} from './gui/logout/logout.component';
import {LogoutGuard} from './guard/logout.guard';
import {SettingsGuard} from './guard/settings.activateguard';

const APP_ROUTES: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent, canActivate: [SettingsGuard, ALoginGuard]},
  {path: 'logout', component: LogoutComponent, canActivate: [SettingsGuard, LogoutGuard]},
  {path: 'user', component: MembersAreaComponent, children: MEMBER_ROUTES},
  {path: 'user', component: MembersAreaComponent},
  {path: '**', redirectTo: '/login', pathMatch: 'full'}
];

export const routing = RouterModule.forRoot(APP_ROUTES);
