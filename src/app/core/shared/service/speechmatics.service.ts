import {HttpClient, HttpRequest} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import {SettingsService} from './settings.service';
import {AppStorageService} from './appstorage.service';

@Injectable()
export class SpeechmaticsService {
  get transcriptionReady(): boolean {
    return this._transcriptionReady;
  }

  set transcriptionReady(value: boolean) {
    this._transcriptionReady = value;
  }
  get transcriptionInserted(): boolean {
    return this._transcriptionInserted;
  }

  set transcriptionInserted(value: boolean) {
    this._transcriptionInserted = value;
  }
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
  get authToken(): string {
    return this._authToken;
  }

  set authToken(value: string) {
    this._authToken = value;
  }
  get userID(): number {
    return this._userID;
  }

  set userID(value: number) {
    this._userID = value;
  }

  transcriptionReadyToBeInserted = new EventEmitter<any>();


  constructor(private http: HttpClient,
              public settingsService: SettingsService,
              public appStorageService: AppStorageService) {}

  private proxyurl = 'https://cors-anywhere.herokuapp.com/';
  private _userID;
  private _authToken;
  private _wordsOfSpeechmaticsTranscription;
  private audiofile = this.appStorageService.file;
  private jobID = 10634488;
  private _jobStatus: string;
  private resultOfPOST: string;
  private resultOfGET: string;
  private resultOfGetJobStatus: string;
  private _resultSpeechmaticsWordsArray: any[];
  private _resultSpeechmaticsTimesArray: any[];
  private resultSpeechmaticsDurationsArray: any[];
  private _transcriptionRequested: boolean;
  private _transcriptionInserted: boolean;
  private _transcriptionReady: boolean;

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
        (error) => this.errorHandling(error),
        () => {
          console.log('Finished POST');
          this.jobID = JSON.parse(this.resultOfPOST).body.id;
          this.getSpeechmaticsJobStatus();
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
      (error) => this.errorHandling(error),
      () => {
        this._jobStatus = JSON.parse(this.resultOfGetJobStatus).job.job_status;
        if (this._jobStatus === 'done') {
          console.log('Finished GET JobStatus: ' + this._jobStatus);
          this.getSpeechmaticsTranscription();
        } else if (this._jobStatus === 'expired') {
          console.log('Finished GET. But JobStatus status is ' + this._jobStatus);
        } else {
          console.log('JobStatus: ' + this._jobStatus + ' -> Requesting again until job is done...');
          setTimeout(() => this.getSpeechmaticsJobStatus(), 600);
        }
      }
    );
  }

  getSpeechmaticsTranscription() {
    this.http.get(
      this.proxyurl
      + 'https://api.speechmatics.com/v1.0/user/' + this._userID
      + '/jobs/' + this.jobID
      + '/transcript?auth_token=' + this._authToken)
      .subscribe(
        data => this.resultOfGET = JSON.stringify(data),
        error => this.errorHandling(error),
        () => {
          console.log('Finished GET');
          this._resultSpeechmaticsWordsArray = this.getWordsFromSpeechmaticsJSON(this.resultOfGET);
          this._resultSpeechmaticsTimesArray = this.getTimesFromSpeechmaticsJSON();
          this.resultSpeechmaticsDurationsArray = this.getDurationsFromSpeechmaticsJSON();
          this._transcriptionReady = true;
          this.transcriptionReadyToBeInserted.emit();
        }
      );
  }

  getWordsFromSpeechmaticsJSON(speechmaticsTranscription) {
    const allWords = [];
    this._wordsOfSpeechmaticsTranscription = JSON.parse(speechmaticsTranscription).words;
    for (let i = 0; i < this._wordsOfSpeechmaticsTranscription.length; i++) {
      if (this._wordsOfSpeechmaticsTranscription[i].name === '.') {
        this._wordsOfSpeechmaticsTranscription.splice(i, 1);
        i--;
      }
    }
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
    for (let i = 0; i < this._wordsOfSpeechmaticsTranscription.length; i++) {
      allTimes[i] = this._wordsOfSpeechmaticsTranscription[i].time;
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

  errorHandling(error) {
    switch (error.error.code) {
      case 400:
        console.log('Could not sent audio to speech recognition. The following error occurred: ' + error.error.error);
        break;
      case 401:
        console.log('Could not sent audio to speech recognition. Check your projectconfig.json (plugins). ' + error.error.error);
        break;
      case 403:
        console.log('Unsupported audio format or insufficient credit: ' + error.error.error);
        break;
      case 404:
        console.log('There was an error while trying to sent audio to speech recognition: ' + error.error.error);
        break;
      case 429:
        console.log('Too many requests were sent to speech recognition. Please try again later. ' + error.error.error);
        break;
      // case 500:
      //   console.log('There is a problem with the speech recognition server.Please try again later. ' + error.error.error);
      //   break;
      // case 502:
      //   console.log('The speech recognition server is not active at present. Please try again later. ' + error.error.error);
      //   break;
      // case 503:
      //   console.log('The speech recognition service is temporarily unavailable. Please try again later. ' + error.error.error);
      //   break;
      default:
        console.log(error);
    }
  }
}
