import {HttpClient, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable()
export class SpeechmaticsService {
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
  get signedIn(): boolean {
    return this._signedIn;
  }

  set signedIn(value: boolean) {
    this._signedIn = value;
  }

  private proxyurl = 'https://cors-anywhere.herokuapp.com/';
  private _userID: number;
  private _authToken: string;
  private wordsOfSpeechmaticsTranscription;
  private _signedIn = false;

  constructor(private http: HttpClient) {}

  getSpeechmaticTranscription(id) {
    return this.http.get(this.proxyurl + 'https://api.speechmatics.com/v1.0/user/' + this._userID + '/jobs/' + id + '/transcript?auth_token=' + this._authToken);
  }

  getSpeechmaticsJobStatus(id) {
    return this.http.get(    this.proxyurl + 'https://api.speechmatics.com/v1.0/user/' + this._userID + '/jobs/' + id + '/?auth_token=' + this._authToken);
  }

  postSpeechmaticsJob(audiofile) {
    const params = new FormData();
    params.append('model',  'de');
    params.append('data_file', audiofile, audiofile.name);
    params.append('diarisation', 'false');

    const req = new HttpRequest(
      'POST',
      (this.proxyurl + 'https://api.speechmatics.com/v1.0/user/' + this._userID + '/jobs/?auth_token=' + this._authToken),
      params
    );
    return this.http.request(req);
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
    this.wordsOfSpeechmaticsTranscription = JSON.parse(speechmaticsTranscription).words;
    for (let i = 0; i < this.wordsOfSpeechmaticsTranscription.length; i++) {
        allWords[i] = this.wordsOfSpeechmaticsTranscription[i].name;
    }
    // const resultSpeechmatics = allWords.join(' ');
    const resultSpeechmatics = allWords;
    return resultSpeechmatics;
  }

  getTimesFromSpeechmaticsJSON() {
    const allTimes = [];
    allTimes[0] = 0;
    for (let i = 0; i < this.wordsOfSpeechmaticsTranscription.length - 1; i++) {
      allTimes[i] = this.wordsOfSpeechmaticsTranscription[i + 1].time;
    }
    const resultSpeechmaticsTimes = allTimes;
    return resultSpeechmaticsTimes;

  }

  getDurationsFromSpeechmaticsJSON() {
    const allDurations = [];
    for (let i = 0; i < this.wordsOfSpeechmaticsTranscription.length; i++) {
      allDurations[i] = this.wordsOfSpeechmaticsTranscription[i].duration;
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
