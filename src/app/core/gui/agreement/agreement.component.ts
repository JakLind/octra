import {Component, OnInit} from '@angular/core';
import {isNullOrUndefined} from 'util';
import {SettingsService} from '../../shared/service/settings.service';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {AppStorageService} from '../../shared/service/appstorage.service';
import {SubscriptionManager} from '../../obj/SubscriptionManager';

@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.css']
})
export class AgreementComponent implements OnInit {

  private subscrmanager: SubscriptionManager = new SubscriptionManager();

  constructor(public settService: SettingsService,
              private router: Router,
              private langService: TranslateService,
              private appStorage: AppStorageService) {
    if (isNullOrUndefined(this.settService.projectsettings)) {
      this.router.navigate(['/user/load'], {
        queryParamsHandling: 'preserve'
      });
    }
  }

  ngOnInit() {
  }

  public toHTML(text: any): string {
    if (!isNullOrUndefined(text)) {
      if (!isNullOrUndefined(text[this.langService.currentLang])) {
        return text[this.langService.currentLang].replace('\n', '<br/>');
      } else {
        for (const l in text) {
          if (!isNullOrUndefined(text[l])) {
            return text[l].replace('\n', '<br/>');
          }
        }
      }
    } else {
      return '';
    }
  }

  logout() {
    this.settService.clearSettings();
    this.router.navigate(['/logout'], {
      queryParamsHandling: 'preserve'
    });
  }

  accept() {
    if (isNullOrUndefined(this.appStorage.agreement)) {
      this.appStorage.agreement = {};
    }
    this.appStorage.agreement[this.appStorage.user.project] = true;
    this.appStorage.sessStr.store('agreement', this.appStorage.agreement);
    this.router.navigate(['/user/transcr'], {
      queryParamsHandling: 'preserve'
    });
  }
}
