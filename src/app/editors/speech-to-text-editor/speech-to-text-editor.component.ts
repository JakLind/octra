import {Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {LinearEditorComponent} from '../linear-editor/linear-editor.component';
import {KeymappingService} from '../../core/shared/service/keymapping.service';
import {AudioService} from '../../core/shared/service/audio.service';
import {TranscriptionService} from '../../core/shared/service/transcription.service';
import {UserInteractionsService} from '../../core/shared/service/userInteractions.service';
import {SettingsService} from '../../core/shared/service/settings.service';
import {AppStorageService} from '../../core/shared/service/appstorage.service';
import {SpeechmaticsService} from '../../core/shared/service/speechmatics.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-new-editor',
  templateUrl: './speech-to-text-editor.component.html',
  styleUrls: ['./speech-to-text-editor.component.css']
})
export class SpeechToTextEditorComponent implements OnInit {
  public static editorname = 'Speech-to-text Editor';
  public static initialized: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('downF') downloadForm: NgForm;

  resultOfGET: string;
  resultOfPOST: string;
  resultOfJobStatus: string;
  resLocalExample: string;
  resultSpeechmatics: string;
  resultSpeechmaticsWordsArray = [];
  resultSpeechmaticsTimesArray = [];
  resultSpeechmaticsDurationsArray = [];
  speechmaticsTranscription;
  jobIDValue: number;
  private userIDValue: number;
  private authToken: string;
  private signedIn: boolean;

  constructor(public audio: AudioService,
              public keyMap: KeymappingService,
              public transcrService: TranscriptionService,
              public settingsService: SettingsService,
              public appStorage: AppStorageService,
              public speechmaticsService: SpeechmaticsService) {
  }

  private audiofile;

  ngOnInit() {
    LinearEditorComponent.initialized.emit();
    this.audiofile = this.appStorage.file;
    this.userIDValue = this.speechmaticsService.userID;
    this.authToken = this.speechmaticsService.authToken;
    this.signedIn = this.speechmaticsService.signedIn;
  }

  onSignIn(form: NgForm) {
    this.speechmaticsService.userID = form.value.userID;
    this.speechmaticsService.authToken = form.value.authToken;
    this.speechmaticsService.signedIn = true;
    this.userIDValue = this.speechmaticsService.userID;
    this.authToken = this.speechmaticsService.authToken;
    this.signedIn = this.speechmaticsService.signedIn;
  }

  onPostSpeechmaticsJob() {
    this.speechmaticsService.postSpeechmaticsJob(this.audiofile)
      .subscribe(
        (response) => this.resultOfPOST = JSON.stringify(response),
        (error) => console.log(error),
        () => {
          console.log('Finished POST');
          this.jobIDValue = JSON.parse(this.resultOfPOST).body.id;
        }
      );
  }

  onDownloadSpeechmaticsTranscription(form: NgForm) {
    if (form.value.jobID) {
      this.jobIDValue = form.value.jobID;
    } else {
      this.jobIDValue = JSON.parse(this.resultOfPOST).body.id;
    }
    // this.jobIDValue = 10520856;
    // this.jobIDValue = 10434706;
    console.log('JobID: ' + this.jobIDValue);

    this.speechmaticsService.getSpeechmaticTranscription(this.jobIDValue)
      .subscribe(
        data => this.resultOfGET = JSON.stringify(data),
        error => alert(error),
        () => {
          console.log('Finished GET');
          this.speechmaticsTranscription = this.resultOfGET;
          this.resultSpeechmaticsWordsArray = this.speechmaticsService.getWordsFromSpeechmaticsJSON(this.speechmaticsTranscription);
          this.resultSpeechmaticsTimesArray = this.speechmaticsService.getTimesFromSpeechmaticsJSON();
          this.resultSpeechmaticsDurationsArray = this.speechmaticsService.getDurationsFromSpeechmaticsJSON();
        }
      );
  }

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
    for (let i = 0; i < this.resultSpeechmaticsWordsArray.length; i++) {
      const time_samples = Math.round(this.resultSpeechmaticsTimesArray[i] * this.transcrService.audiofile.samplerate);
      console.log('time: ' + this.resultSpeechmaticsTimesArray[i]);
      console.log('round: ' + time_samples);
      console.log('word: ' + this.resultSpeechmaticsWordsArray[i]);
      console.log('audiofile lastsample: ' + this.transcrService.last_sample);
      if (!this.resultSpeechmaticsTimesArray[i]) {
        const lastSegment = this.transcrService.currentlevel.segments.segments.length - 1;
        this.transcrService.currentlevel.segments.segments[lastSegment].transcript = '<P>';
      }
      if (this.resultSpeechmaticsWordsArray[i] !== '.') {
        this.transcrService.currentlevel.segments.add(time_samples, this.resultSpeechmaticsWordsArray[i]);
      }
    }
  }
}
