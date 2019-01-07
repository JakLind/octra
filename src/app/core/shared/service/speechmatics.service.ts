import {HttpClient, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SettingsService} from './settings.service';
import {AppStorageService} from './appstorage.service';

@Injectable()
export class SpeechmaticsService {
  get jobStatus(): string {
    return this._jobStatus;
  }

  set jobStatus(value: string) {
    this._jobStatus = value;
  }
  get resultSpeechmaticsWordsArray(): any[] {
    return this._resultSpeechmaticsWordsArray;
  }

  set resultSpeechmaticsWordsArray(value: any[]) {
    this._resultSpeechmaticsWordsArray = value;
  }
  get resultSpeechmaticsTimesArray(): any[] {
    return this._resultSpeechmaticsTimesArray;
  }

  set resultSpeechmaticsTimesArray(value: any[]) {
    this._resultSpeechmaticsTimesArray = value;
  }
  get transcriptionRequested(): boolean {
    return this._transcriptionRequested;
  }

  set transcriptionRequested(value: boolean) {
    this._transcriptionRequested = value;
  }
  // get wordsOfSpeechmaticsTranscription() {
  //   return this._wordsOfSpeechmaticsTranscription;
  // }
  //
  // set wordsOfSpeechmaticsTranscription(value) {
  //   this._wordsOfSpeechmaticsTranscription = value;
  // }
  // get authToken(): string {
  //   return this._authToken;
  // }
  //
  // set authToken(value: string) {
  //   this._authToken = value;
  // }
  // get userID(): number {
  //   return this._userID;
  // }
  //
  // set userID(value: number) {
  //   this._userID = value;
  // }
  // get signedIn(): boolean {
  //   return this._signedIn;
  // }
  //
  // set signedIn(value: boolean) {
  //   this._signedIn = value;
  // }

  constructor(private http: HttpClient,
              public settingsService: SettingsService,
              public appStorageService: AppStorageService) {}

  private proxyurl = 'https://cors-anywhere.herokuapp.com/';
  private _userID = this.settingsService.projectsettings.plugins.speechmatics.userID;
  private _authToken = this.settingsService.projectsettings.plugins.speechmatics.authToken;
  private _wordsOfSpeechmaticsTranscription;
  private audiofile = this.appStorageService.file;
  private jobID: number;
  private _jobStatus: string;
  private resultOfPOST: string;
  private resultOfGET: string;
  private resultOfGetJobStatus: string;
  private _resultSpeechmaticsWordsArray: any[];
  private _resultSpeechmaticsTimesArray: any[];
  private resultSpeechmaticsDurationsArray: any[];
  private _transcriptionRequested: boolean;

  getSpeechmaticTranscription() {
    this.http.get(
      this.proxyurl
      + 'https://api.speechmatics.com/v1.0/user/' + this._userID
      + '/jobs/' + this.jobID
      + '/transcript?auth_token=' + this._authToken)
      .subscribe(
        data => this.resultOfGET = JSON.stringify(data),
        error => console.log(error),
        () => {
          console.log('Finished GET');
          this._resultSpeechmaticsWordsArray = this.getWordsFromSpeechmaticsJSON(this.resultOfGET);
          this._resultSpeechmaticsTimesArray = this.getTimesFromSpeechmaticsJSON();
          this.resultSpeechmaticsDurationsArray = this.getDurationsFromSpeechmaticsJSON();
        }
      );
  }

  getSpeechmaticsJobStatus() {
    this.http.get(
      this.proxyurl
      + 'https://api.speechmatics.com/v1.0/user/' + this._userID
      + '/jobs/' + this.jobID +
      '/?auth_token=' + this._authToken).
      subscribe(
      (response) => this.resultOfGetJobStatus = JSON.stringify(response),
      (error) => console.log(error),
      () => {
        this._jobStatus = JSON.parse(this.resultOfGetJobStatus).job.job_status;
        if (this._jobStatus === 'done') {
          console.log('Finished GET JobStatus: ' + this._jobStatus);
          this.getSpeechmaticTranscription();
        } else {
          console.log('Finished GET JobStatus: ' + this._jobStatus + 'Requesting again...');
          this.getSpeechmaticsJobStatus();
        }
      }
    );
  }

  postSpeechmaticsJob() {
    const params = new FormData();
    params.append('model',  'de');
    params.append('data_file', this.audiofile, this.audiofile.name);
    params.append('diarisation', 'false');

    const req = new HttpRequest(
      'POST',
      (this.proxyurl + 'https://api.speechmatics.com/v1.0/user/' + this._userID + '/jobs/?auth_token=' + this._authToken),
      params
    );

    this.http.request(req)
      .subscribe(
      (response) => this.resultOfPOST = JSON.stringify(response),
      (error) => console.log(error),
      () => {
        console.log('Finished POST');
        this.jobID = JSON.parse(this.resultOfPOST).body.id;
        this.getSpeechmaticsJobStatus();
      }
    );
  }

  getWordsFromSpeechmaticsJSON(speechmaticsTranscription) {
    //   const req = new HttpRequest(
    //     'GET',
    //     ('../../../assets/transcription_example.json')
    //   );
    //
    //   return this.http.request(req);
    // }

    const allWords = [];
    this._wordsOfSpeechmaticsTranscription = JSON.parse(speechmaticsTranscription).words;
    for (let i = 0; i < this._wordsOfSpeechmaticsTranscription.length; i++) {
        allWords[i] = this._wordsOfSpeechmaticsTranscription[i].name;
    }
    // const resultSpeechmatics = allWords.join(' ');
    const resultSpeechmatics = allWords;
    return resultSpeechmatics;
  }

  getTimesFromSpeechmaticsJSON() {
    const allTimes = [];
    allTimes[0] = 0;
    for (let i = 0; i < this._wordsOfSpeechmaticsTranscription.length - 1; i++) {
      allTimes[i] = this._wordsOfSpeechmaticsTranscription[i + 1].time;
    }
    const resultSpeechmaticsTimes = allTimes;
    return resultSpeechmaticsTimes;

  }

  getDurationsFromSpeechmaticsJSON() {
    const allDurations = [];
    for (let i = 0; i < this._wordsOfSpeechmaticsTranscription.length; i++) {
      allDurations[i] = this._wordsOfSpeechmaticsTranscription[i].duration;
    }
    const resultSpeechmaticsDurations = allDurations;
    return resultSpeechmaticsDurations;

  }

  //   return this.http.get('src/assets/transcription_example.json')
  //     .map((response) => {
  //         console.log('Local transcription example words: ' + JSON.parse(JSON.stringify(response)).words);
  //       const fullTranscription = JSON.parse(JSON.stringify(response)).words.join(' ');
  //
  //       return console.log(fullTranscription);
  //       }
  //     );
  // }

}
