import {Component, ElementRef, EventEmitter, OnInit} from '@angular/core';
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
  resLocalExample: string;
  resultSpeechmatics: string;
  speechmaticsTranscription;

  constructor(public audio: AudioService,
              public keyMap: KeymappingService,
              public transcrService: TranscriptionService,
              private uiService: UserInteractionsService,
              public settingsService: SettingsService,
              public appStorage: AppStorageService,
              public speechmaticsService: SpeechmaticsService,
              private elem: ElementRef) {
  }

  private audiofile = this.transcrService.audiofile;

  ngOnInit() {
    LinearEditorComponent.initialized.emit();
  }

  onSignIn(form: NgForm) {
    const userID = form.value.userID;
    const authToken = form.value.authToken;
    this.speechmaticsService.setIDAndAuthToken(userID, authToken);
  }

  onPostSpeechmaticsJob() {
    this.speechmaticsService.postSpeechmaticsJob(this.elem)
      .subscribe(
        (response) => this.resultOfPOST = JSON.stringify(response),
        (error) => console.log(error),
        () => console.log('Finished POST')
      );

    // console.log(this.transcrService.audiofile.name);
  }

  onShowSpeechmaticsJobs() {
    // const id = JSON.parse(this.resultOfPOST).body.id;
    // console.log('JobID: ' + id);

    this.speechmaticsService.getSpeechmaticsJobs()
      .subscribe(data => {
        this.resultOfGET = JSON.stringify(data),
          error => alert(error),
          () => console.log('Finished GET');
      });
  }

  onGetTranscriptionWords() {
    this.speechmaticsTranscription = this.resultOfGET;
    this.resultSpeechmatics = this.speechmaticsService.getWordsFromSpeechmaticsJSON(this.speechmaticsTranscription);

    // this.speechmaticsService.getWordsFromSpeechmaticsJSON(this.speechmaticsTranscription);
      // .subscribe(
      //   (response) => this.resLocalExample = JSON.stringify(response),
      //   error => console.log(error),
      //   () => console.log('Finished GET')
      // );

  }

  onSendToTextEditor() {
    this.transcrService.currentlevel.segments.segments[0].transcript = this.resultSpeechmatics;
    // this.transcrService.currentlevel.segments.segments[0].time.samples = this.transcrService.audiofile.duration;
    // TODO: Segment needs a marker at the end to become seg_num 0 instead of seg_num -1
  }

  // onShowWords() {
  //   const allWords = [];
  //   const wordsOfLocal = JSON.parse(this.resLocalExample).body.words;
  //   for (let i = 0; i < wordsOfLocal.length; i++) {
  //     allWords[i] = wordsOfLocal[i].name;
  //   }
  //   console.log(allWords.join(' '));
  // }

}
