import {Component, OnDestroy} from '@angular/core';
import {APIService, AppStorageService, SettingsService} from './core/shared/service';
import {TranslateService} from '@ngx-translate/core';
import {SubscriptionManager} from './core/obj/SubscriptionManager';
import {BugReportService, ConsoleType} from './core/shared/service/bug-report.service';
import {AppInfo} from './app.info';
import {environment} from '../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-octra',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})

export class AppComponent implements OnDestroy {

  public get version(): string {
    return AppInfo.version;
  }

  public get environment(): any {
    return environment;
  }

  private subscrmanager: SubscriptionManager = new SubscriptionManager();

  constructor(private api: APIService,
              private langService: TranslateService,
              public appStorage: AppStorageService,
              private settingsService: SettingsService,
              private bugService: BugReportService,
              private router: Router,
              private route: ActivatedRoute) {
    // overwrite console.log
    const oldLog = console.log;
    const serv = this.bugService;
    (() => {
      console.log = function (message) {
        serv.addEntry(ConsoleType.LOG, message);
        oldLog.apply(console, arguments);
      };
    })();

    // overwrite console.err
    const oldError = console.error;
    (() => {
      console.error = function (message) {
        serv.addEntry(ConsoleType.ERROR, message);
        oldError.apply(console, arguments);
      };
    })();

    // overwrite console.info
    const oldInfo = console.info;
    (() => {
      console.info = function (message) {
        serv.addEntry(ConsoleType.INFO, message);
        oldInfo.apply(console, arguments);
      };
    })();

    // overwrite console.warn
    const oldWarn = console.warn;
    (() => {
      console.warn = function (message) {
        serv.addEntry(ConsoleType.WARN, message);
        oldWarn.apply(console, arguments);
      };
    })();


    // after project settings loaded
    this.subscrmanager.add(this.settingsService.projectsettingsloaded.subscribe(
      () => {
        if (!this.settingsService.responsive.enabled) {
          this.setFixedWidth();
        }
      }
    ));
  }

  ngOnDestroy() {
    this.subscrmanager.destroy();
  }

  private setFixedWidth() {
    // set fixed width
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerText = '.container {width:' + this.settingsService.responsive.fixedwidth + 'px}';
    head.appendChild(style);
  }

  test(id: string) {
    this.subscrmanager.add(
      this.api.fetchAnnotation(Number(id)).subscribe(
        (result) => {
          console.log(result);
        }
      )
    );
  }

  reset(id: string) {

    this.subscrmanager.add(
      this.api.closeSession('julian_test', Number(id), '').subscribe(
        (result) => {
          console.log(result);
        }
      )
    );
  }
}
