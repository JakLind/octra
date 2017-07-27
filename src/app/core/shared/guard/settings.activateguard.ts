import {Injectable} from '@angular/core';

import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {SessionService} from '../service/session.service';
import {SettingsService} from '../service/settings.service';
import {isNullOrUndefined} from 'util';

@Injectable()
export class SettingsGuard implements CanActivate {

  constructor(private sessService: SessionService,
              private router: Router,
              private settingsService: SettingsService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (isNullOrUndefined(this.settingsService.app_settings)) {
      return this.settingsService.settingsloaded.first();
    } else {
      return this.settingsService.validated;
    }
  }
}
