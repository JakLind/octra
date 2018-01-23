import {Injectable} from '@angular/core';

import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AppStorageService} from '../service/appstorage.service';

@Injectable()
export class TranscrEndGuard implements CanActivate {

  constructor(private appStorage: AppStorageService, private router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (!this.appStorage.submitted) {
      this.router.navigate(['/user/load'], {
        queryParamsHandling: 'preserve'
      });
      return false;
    }
    return true;
  }
}
