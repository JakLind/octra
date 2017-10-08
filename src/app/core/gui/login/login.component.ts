import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {LoginService} from './login.service';
import {AppStorageService, OIDBLevel, OIDBLink} from '../../shared/service/appstorage.service';
import {ComponentCanDeactivate} from './login.deactivateguard';
import {Observable} from 'rxjs/Rx';
import {FileSize, Functions} from '../../shared/Functions';
import {APIService} from '../../shared/service/api.service';
import {BrowserCheck} from '../../shared/BrowserCheck';
import {SessionFile} from '../../obj/SessionFile';
import {OCTRANIMATIONS} from '../../shared/OCTRAnimations';
import {isArray, isNullOrUndefined, isNumber} from 'util';
import {SubscriptionManager} from '../../shared';
import {SettingsService} from '../../shared/service/settings.service';
import {ModalService} from '../../shared/service/modal.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {TranslateService} from '@ngx-translate/core';
import {Converter} from '../../obj/Converters/Converter';
import {OctraDropzoneComponent} from '../octra-dropzone/octra-dropzone.component';
import {AudioService} from '../../shared/service/audio.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService],
  animations: OCTRANIMATIONS
})
export class LoginComponent implements OnInit, OnDestroy, ComponentCanDeactivate, AfterViewInit {
  @ViewChild('f') loginform: NgForm;
  @ViewChild('dropzone') dropzone: OctraDropzoneComponent;
  @ViewChild('agreement') agreement: ModalComponent;
  @ViewChild('localmode') localmode: ElementRef;
  @ViewChild('onlinemode') onlinemode: ElementRef;

  public valid_platform = false;
  public valid_size = false;
  public browser_check: BrowserCheck;
  public agreement_checked = true;

  public projects: string[] = [];

  private subscrmanager: SubscriptionManager;

  get sessionfile(): SessionFile {
    return this.appStorage.sessionfile;
  }

  get apc(): any {
    return this.settingsService.app_settings;
  }

  public get Math(): Math {
    return Math;
  }

  valid = false;

  member = {
    id: '',
    agreement: '',
    project: '',
    jobno: ''
  };

  err = '';

  constructor(private router: Router,
              public appStorage: AppStorageService,
              private api: APIService,
              private cd: ChangeDetectorRef,
              private settingsService: SettingsService,
              public modService: ModalService,
              private langService: TranslateService,
              private audioService: AudioService) {
    this.subscrmanager = new SubscriptionManager();
  }

  ngOnInit() {
    this.browser_check = new BrowserCheck();
    this.valid_platform = false;

    if (this.apc.octra.allowed_browsers.length > 0) {
      this.valid_platform = this.browser_check.isValidBrowser(this.apc.octra.allowed_browsers);
    } else {
      this.valid_platform = true;
    }

    if (this.settingsService.responsive.enabled === false) {
      this.valid_size = window.innerWidth >= this.settingsService.responsive.fixedwidth;
    } else {
      this.valid_size = true;
    }

    const loaduser = () => {
      if (!isNullOrUndefined(this.appStorage.user) && this.appStorage.user.id !== '-1') {
        this.member.id = this.appStorage.user.id;
      }

      if (!isNullOrUndefined(this.appStorage.user) && this.appStorage.user.hasOwnProperty('project')) {
        this.member.project = this.appStorage.user.project;
      }

      if (!isNullOrUndefined(this.appStorage.user) && this.appStorage.user.hasOwnProperty('jobno')
        && this.appStorage.user.jobno !== null && this.appStorage.user.jobno > -1) {
        this.member.jobno = this.appStorage.user.jobno.toString();
      }
    };

    if (!this.appStorage.idbloaded) {
      this.subscrmanager.add(this.appStorage.loaded.subscribe(
        () => {
        },
        () => {
        },
        () => {
          loaduser();
        })
      );
    } else {
      loaduser();
    }
  }

  ngAfterViewInit() {
    this.loadPojectsList();
  }

  ngOnDestroy() {
    this.subscrmanager.destroy();
    console.log('LEAVE AUDIOMANAGERS = ' + this.audioService.audiomanagers.length);
  }

  onSubmit(form: NgForm) {
    let new_session = false;
    let new_session_after_old = false;
    let continue_session = false;

    if (isNullOrUndefined(this.member.jobno) || this.member.jobno === '') {
      this.member.jobno = '0';
    }

    if (this.appStorage.sessionfile !== null) {
      // last was offline mode, begin new Session
      new_session = true;

    } else {
      if (!isNullOrUndefined(this.appStorage.data_id) && isNumber(this.appStorage.data_id)) {
        // last session was online session
        // check if credentials are available
        if (
          !isNullOrUndefined(this.appStorage.user.project) &&
          !isNullOrUndefined(this.appStorage.user.jobno) &&
          !isNullOrUndefined(this.appStorage.user.id)
        ) {
          // check if credentials are the same like before
          if (
            this.appStorage.user.id === this.member.id &&
            Number(this.appStorage.user.jobno) === Number(this.member.jobno) &&
            this.appStorage.user.project === this.member.project
          ) {
            continue_session = true;
          } else {
            new_session_after_old = true;
          }
        }
      } else {
        new_session = true;
      }
    }

    if (new_session_after_old) {
      this.setOnlineSessionToFree(
        () => {
          this.createNewSession(form);
        }
      );
    }

    if (new_session) {
      this.createNewSession(form);
    } else if (continue_session) {
      this.subscrmanager.add(this.api.fetchAnnotation(this.appStorage.data_id).subscribe(
        (result) => {
          const json = result.json();

          if (json.hasOwnProperty('message')) {
            const counter = (json.message === '') ? '0' : json.message;
            this.appStorage.sessStr.store('jobs_left', Number(counter));
          }

          if (form.valid && this.agreement_checked
            && json.message !== '0'
          ) {
            if (this.appStorage.sessionfile !== null) {
              // last was offline mode
              this.appStorage.clearLocalStorage();
            }
            const res = this.appStorage.setSessionData(this.member, json.data.id, json.data.url);
            if (res.error === '') {
              this.navigate();
            } else {
              alert(res.error);
            }
          } else {
            this.modService.show('login_invalid');
          }
        },
        (error) => {
          this.modService.show('error', 'Server cannot be requested. Please check if you are online.');
          return Observable.throw(error);
        }
      ));
    }
  }

  onOfflineSubmit = (form: NgForm) => {
    if (!isNullOrUndefined(this.appStorage.data_id) && isNumber(this.appStorage.data_id)) {
      // last was online mode
      this.setOnlineSessionToFree(() => {
        this.audioService.registerAudioManager(this.dropzone.audiomanager);
        console.log('AUDIOMANAGER: ' + this.audioService.audiomanagers[0].ressource.info.samplerate);
        this.appStorage.beginLocalSession(this.dropzone.files, false, () => {
          if (!isNullOrUndefined(this.dropzone.oannotation)) {
            const new_levels: OIDBLevel[] = [];
            for (let i = 0; i < this.dropzone.oannotation.levels.length; i++) {
              new_levels.push(new OIDBLevel(i + 1, this.dropzone.oannotation.levels[i], i));
            }

            const new_links: OIDBLink[] = [];
            for (let i = 0; i < this.dropzone.oannotation.links.length; i++) {
              new_links.push(new OIDBLink(i + 1, this.dropzone.oannotation.links[i]));
            }

            this.appStorage.overwriteAnnotation(new_levels).then(
              () => {
                return this.appStorage.overwriteLinks(new_links);
              }
            ).then(() => {
              this.navigate();
            }).catch((err) => {
              console.error(err);
            });
          } else {
            this.navigate();
          }
        }, (error) => {
          alert(error);
        });
      });
    } else {
      this.audioService.registerAudioManager(this.dropzone.audiomanager);
      console.log('AUDIOMANAGER: ' + this.dropzone.audiomanager.ressource.info.samplerate);
      this.appStorage.beginLocalSession(this.dropzone.files, true, () => {
        if (!isNullOrUndefined(this.dropzone.oannotation)) {
          const new_levels: OIDBLevel[] = [];
          for (let i = 0; i < this.dropzone.oannotation.levels.length; i++) {
            new_levels.push(new OIDBLevel(i + 1, this.dropzone.oannotation.levels[i], i));
          }

          const new_links: OIDBLink[] = [];
          for (let i = 0; i < this.dropzone.oannotation.links.length; i++) {
            new_links.push(new OIDBLink(i + 1, this.dropzone.oannotation.links[i]));
          }

          this.appStorage.overwriteAnnotation(new_levels).then(() => {
            return this.appStorage.overwriteLinks(new_links);
          }).then(() => {
            this.navigate();
          }).catch((err) => {
            console.error(err);
          });
        } else {
          this.navigate();
        }
      }, (error) => {
        alert(error);
      });
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    return (this.valid);
  }

  private navigate = (): void => {
    this.router.navigate(['user'], {
      queryParams: {
        login: true
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize($event) {
    if (this.settingsService.responsive.enabled === false) {
      this.valid_size = window.innerWidth >= this.settingsService.responsive.fixedwidth;
    } else {
      this.valid_size = true;
    }
  }

  getDropzoneFileString(file: File | SessionFile) {
    const fsize: FileSize = Functions.getFileSize(file.size);
    return Functions.buildStr('{0} ({1} {2})', [file.name, (Math.round(fsize.size * 100) / 100), fsize.label]);
  }

  newTranscription = () => {
    this.audioService.registerAudioManager(this.dropzone.audiomanager);
    console.log('AUDIOMANAGER: ' + this.dropzone.audiomanager.ressource.info.samplerate);

    this.appStorage.beginLocalSession(this.dropzone.files, false, () => {
        if (!isNullOrUndefined(this.dropzone.oannotation)) {
          const new_levels: OIDBLevel[] = [];
          for (let i = 0; i < this.dropzone.oannotation.levels.length; i++) {
            new_levels.push(new OIDBLevel(i + 1, this.dropzone.oannotation.levels[i], i));
          }

          const new_links: OIDBLink[] = [];
          for (let i = 0; i < this.dropzone.oannotation.links.length; i++) {
            new_links.push(new OIDBLink(i + 1, this.dropzone.oannotation.links[i]));
          }

          this.appStorage.overwriteAnnotation(new_levels).then(
            () => {
              return this.appStorage.overwriteLinks(new_links);
            }
          ).then(() => {
            this.navigate();
          }).catch((err) => {
            console.error(err);
          });
        } else {
          this.navigate();
        }
      },
      (error) => {
        if (error === 'file not supported') {
          this.modService.show('error', this.langService.instant('reload-file.file not supported', {type: ''}));
        }
      }
    );
  }

  getFileStatus(): string {
    if (!isNullOrUndefined(this.dropzone.files) && this.dropzone.files.length > 0 &&
      (!isNullOrUndefined(this.dropzone.oaudiofile))) {
      // check conditions
      if (isNullOrUndefined(this.appStorage.sessionfile) || (this.dropzone.oaudiofile.name === this.appStorage.sessionfile.name)
        && isNullOrUndefined(this.dropzone.oannotation)) {
        return 'start';
      } else {
        return 'new';
      }
    }

    return 'unknown';
  }

  getValidBrowsers(): string {
    let result = '';

    for (let i = 0; i < this.apc.octra.allowed_browsers.length; i++) {
      const browser = this.apc.octra.allowed_browsers[i];
      result += browser.name;
      if (i < this.apc.octra.allowed_browsers.length - 1) {
        result += ', ';
      }
    }

    return result;
  }

  loadPojectsList() {
    this.subscrmanager.add(this.api.getProjects().subscribe(
      ((result) => {
        const json = result.json();
        if (isArray(json.data)) {
          this.projects = json.data;
          if (!isNullOrUndefined(this.appStorage.user) &&
            !isNullOrUndefined(this.appStorage.user.project) && this.appStorage.user.project !== '') {
            if (isNullOrUndefined(this.projects.find(
                (x) => {
                  return x === this.appStorage.user.project;
                }))) {
              // make sure that old project is in list
              this.projects.push(this.appStorage.user.project);
            }
          }
        }
      })
    ));
  }

  public selectProject(event: HTMLSelectElement) {
    this.member.project = event.value;
  }

  private createNewSession(form: NgForm) {
    this.subscrmanager.add(this.api.beginSession(this.member.project, this.member.id, Number(this.member.jobno)).catch((error) => {
      alert('Server cannot be requested. Please check if you are online.');
      return Observable.throw(error);
    }).subscribe(
      (result) => {
        const json = result.json();
        if (form.valid && this.agreement_checked
          && json.message !== '0'
        ) {

          // delete old data for fresh new session
          this.appStorage.clearSession();
          this.appStorage.clearLocalStorage().then(
            () => {
              const res = this.appStorage.setSessionData(this.member, json.data.id, json.data.url);

              // get transcript data that already exists
              if (json.data.hasOwnProperty('transcript')) {
                const transcript = JSON.parse(json.data.transcript);

                if (isArray(transcript) && transcript.length > 0) {
                  this.appStorage.servertranscipt = transcript;
                }
              }

              if (json.hasOwnProperty('message')) {
                const counter = (json.message === '') ? '0' : json.message;
                this.appStorage.sessStr.store('jobs_left', Number(counter));
              }

              if (res.error === '') {
                this.navigate();
              } else {
                this.modService.show('error', res.error);
              }
            }
          ).catch((err) => {
            console.error(err);
          });
        } else {
          this.modService.show('login_invalid');
        }
      }
    ));
  }

  private setOnlineSessionToFree = (callback: () => void) => {
    // check if old annotation is already annotated
    this.subscrmanager.add(this.api.fetchAnnotation(this.appStorage.data_id).subscribe(
      (result) => {
        const json = result.json();

        if (json.data.hasOwnProperty('status') && json.data.status === 'BUSY') {
          this.subscrmanager.add(this.api.closeSession(this.appStorage.user.id, this.appStorage.data_id, '').subscribe(
            (result2) => {
              callback();
            }
          ));
        } else {
          callback();
        }
      },
      () => {
        // ignore error because this isn't important
        callback();
      }
    ));
  }

  public testFile(converter: Converter, file: File) {
    const reader: FileReader = new FileReader();
    reader.onload = function (e) {
      // e.target.result should contain the text
    };
    reader.readAsText(file);
    reader.readAsText(file, 'utf-8');
  }


}
