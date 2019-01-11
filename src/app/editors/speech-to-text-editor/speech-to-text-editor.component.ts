import {Component, EventEmitter, OnInit} from '@angular/core';
import {LinearEditorComponent} from '../linear-editor/linear-editor.component';
import {KeymappingService} from '../../core/shared/service/keymapping.service';
import {AudioService} from '../../core/shared/service/audio.service';
import {TranscriptionService} from '../../core/shared/service/transcription.service';
import {SettingsService} from '../../core/shared/service/settings.service';
import {AppStorageService} from '../../core/shared/service/appstorage.service';
import {SpeechmaticsService} from '../../core/shared/service/speechmatics.service';

@Component({
  selector: 'app-new-editor',
  templateUrl: './speech-to-text-editor.component.html',
  styleUrls: ['./speech-to-text-editor.component.css']
})
export class SpeechToTextEditorComponent implements OnInit {
  public static editorname = 'Speech-to-text Editor';
  public static initialized: EventEmitter<void> = new EventEmitter<void>();
  // @ViewChild('downF') downloadForm: NgForm;

  // resultOfGET: string;
  // resultOfPOST: string;
  // resultOfJobStatus: string;
  // resLocalExample: string;
  // resultSpeechmatics: string;
  // resultSpeechmaticsWordsArray = [];
  // resultSpeechmaticsTimesArray = [];
  // resultSpeechmaticsDurationsArray = [];
  // speechmaticsTranscription;
  // jobIDValue: number;
  // private userIDValue: number;
  // private authToken: string;
  private jobStatus: string;
  private signedIn = true;

  constructor(public audio: AudioService,
              public keyMap: KeymappingService,
              public transcrService: TranscriptionService,
              public settingsService: SettingsService,
              public appStorage: AppStorageService,
              public speechmaticsService: SpeechmaticsService) {
  }

  // private audiofile;

  ngOnInit() {
    LinearEditorComponent.initialized.emit();

    // this.audiofile = this.appStorage.file;
    // this.speechmaticsService.userID = this.settingsService.projectsettings.plugins.speechmatics.userID;
    // this.speechmaticsService.authToken = this.settingsService.projectsettings.plugins.speechmatics.authToken;
  }

  // onSignIn(form: NgForm) {
  //
  //   this.userIDValue = this.speechmaticsService.userID;
  //   this.authToken = this.speechmaticsService.authToken;
  // }

/*
  onPostSpeechmaticsJob() {
    // this.speechmaticsService.postSpeechmaticsJob(this.audiofile)
    this.speechmaticsService.postSpeechmaticsJob()
      .subscribe(
        (response) => this.resultOfPOST = JSON.stringify(response),
        (error) => console.log(error),
        () => {
          console.log('Finished POST');
          this.jobIDValue = JSON.parse(this.resultOfPOST).body.id;
        }
      );
  }
*/

  // onDownloadSpeechmaticsTranscription() {
/*    if (form.value.jobID) {
      this.jobIDValue = form.value.jobID;
    } else {
      this.jobIDValue = JSON.parse(this.resultOfPOST).body.id;
    }
    // this.jobIDValue = 10520856;
    // this.jobIDValue = 10434706;
    console.log('JobID: ' + this.jobIDValue);*/

    // this.speechmaticsService.getSpeechmaticsTranscription();
  // }

  // onShowSpeechmaticsJobStatus() {
  //   console.log('JobID: ' + this.jobIDValue);
  //
  //   this.speechmaticsService.getSpeechmaticsJobStatus(this.jobIDValue)
  //     .subscribe(data => {
  //       this.resultOfJobStatus = JSON.stringify(data),
  //         error => alert(error),
  //         () => console.log('Finished GET Job Status' + JSON.parse(this.resultOfJobStatus).body.job_status);
  //     });
  // }

  onSendToTextEditor() {
    for (let i = 0; i < this.speechmaticsService.resultSpeechmaticsWordsArray.length; i++) {
      const time_samples = Math.round(this.speechmaticsService.resultSpeechmaticsTimesArray[i] * this.transcrService.audiofile.samplerate);
      console.log('time: ' + this.speechmaticsService.resultSpeechmaticsTimesArray[i]);
      console.log('round: ' + time_samples);
      console.log('word: ' + this.speechmaticsService.resultSpeechmaticsWordsArray[i]);
      console.log('audiofile lastsample: ' + this.transcrService.last_sample);
      if (!this.speechmaticsService.resultSpeechmaticsTimesArray[i]) {
        const lastSegment = this.transcrService.currentlevel.segments.segments.length - 1;
        this.transcrService.currentlevel.segments.segments[lastSegment].transcript = '<P>';
      }
      if (this.speechmaticsService.resultSpeechmaticsWordsArray[i] !== '.') {
        this.transcrService.currentlevel.segments.add(time_samples, this.speechmaticsService.resultSpeechmaticsWordsArray[i]);
      }
    }
  }
}
