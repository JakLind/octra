import {Injectable} from '@angular/core';

import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AppStorageService, SettingsService} from '../service';

@Injectable()
export class TranscActivateGuard implements CanActivate {

  constructor(private appStorage: AppStorageService,
              private router: Router,
              private settService: SettingsService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (this.appStorage.usemode === 'online' || this.appStorage.usemode === 'url') {
      if (!this.settService.allloaded) {
        console.log('go back to load');
        this.router.navigate(['/user/load'], {
          queryParamsHandling: 'preserve'
        });
        return false;
      }
    } else if (this.appStorage.usemode === 'local') {
      if (!this.settService.allloaded) {
        this.router.navigate(['/user/transcr/reload-file'], {
          queryParamsHandling: 'preserve'
        });
        return false;
      }
    }
    return true;
  }
}
