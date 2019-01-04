import {Component, EventEmitter, OnInit} from '@angular/core';
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
  resultOfGET: string;
  resultOfPOST: string;
  resultOfJobStatus: string;
  resLocalExample: string;
  resultSpeechmatics: string;
  resultSpeechmaticsWordsArray = [];
  resultSpeechmaticsTimesArray = [];
  resultSpeechmaticsDurationsArray = [];
  speechmaticsTranscription;

  constructor(public audio: AudioService,
              public keyMap: KeymappingService,
              public transcrService: TranscriptionService,
              private uiService: UserInteractionsService,
              public settingsService: SettingsService,
              public appStorage: AppStorageService,
              public speechmaticsService: SpeechmaticsService) {
  }

  private audiofile;

  ngOnInit() {
    LinearEditorComponent.initialized.emit();
    this.audiofile = this.appStorage.file;
  }

  onSignIn(form: NgForm) {
    const userID = form.value.userID;
    const authToken = form.value.authToken;
    this.speechmaticsService.setIDAndAuthToken(userID, authToken);
  }

  onPostSpeechmaticsJob() {
    this.speechmaticsService.postSpeechmaticsJob(this.audiofile)
      .subscribe(
        (response) => this.resultOfPOST = JSON.stringify(response),
        (error) => console.log(error),
        () => console.log('Finished POST')
      );

    // console.log(this.transcrService.audiofile.name);
  }

  onShowSpeechmaticsJobs() {
    const id = JSON.parse(this.resultOfPOST).body.id;
    console.log('JobID: ' + id);

    this.speechmaticsService.getSpeechmaticsJobs(id)
      .subscribe(data => {
        this.resultOfGET = JSON.stringify(data),
          error => alert(error),
          () => console.log('Finished GET');
      });
  }

  onShowSpeechmaticsJobStatus() {
    const id = JSON.parse(this.resultOfPOST).body.id;
    console.log('JobID: ' + id);

    this.speechmaticsService.getSpeechmaticsJobStatus(id)
      .subscribe(data => {
        this.resultOfJobStatus = JSON.stringify(data),
          error => alert(error),
          () => console.log('Finished GET Job Status' + JSON.parse(this.resultOfJobStatus).body.job_status);
      });
  }

  onGetTranscriptionWords() {
    this.speechmaticsTranscription = this.resultOfGET;
    this.resultSpeechmaticsWordsArray = this.speechmaticsService.getWordsFromSpeechmaticsJSON(this.speechmaticsTranscription);
    this.resultSpeechmaticsTimesArray = this.speechmaticsService.getTimesFromSpeechmaticsJSON();
    this.resultSpeechmaticsDurationsArray = this.speechmaticsService.getDurationsFromSpeechmaticsJSON();

    // this.speechmaticsService.getWordsFromSpeechmaticsJSON(this.speechmaticsTranscription);
      // .subscribe(
      //   (response) => this.resLocalExample = JSON.stringify(response),
      //   error => console.log(error),
      //   () => console.log('Finished GET')
      // );

  }

  onSendToTextEditor() {
    for (let i = 0; i < this.resultSpeechmaticsWordsArray.length; i++) {
      const time_samples = Math.round(this.resultSpeechmaticsTimesArray[i] * this.transcrService.audiofile.samplerate);
      console.log('time: ' + this.resultSpeechmaticsTimesArray[i]);
      console.log('round: ' + time_samples);
      console.log('word: ' + this.resultSpeechmaticsWordsArray[i]);
      console.log('audiofile lastsample: ' + this.transcrService.last_sample);
      if (!this.resultSpeechmaticsTimesArray[i]) {
        this.transcrService.currentlevel.segments.segments[i - 1].transcript = '<P>';
      }
      if (this.resultSpeechmaticsWordsArray[i] !== '.') {
        this.transcrService.currentlevel.segments.add(time_samples, this.resultSpeechmaticsWordsArray[i]);
      }
    }
  }
}
