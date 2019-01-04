import {HttpClient, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable()
export class SpeechmaticsService {

  private proxyurl = 'https://cors-anywhere.herokuapp.com/';
  private apiJobsURL: string;
  private userID: number;
  private authToken: string;
  private wordsOfSpeechmaticsTranscription;

  constructor(private http: HttpClient) {}

  setIDAndAuthToken(userID: number, authToken: string) {
    this.userID = userID;
    this.authToken = authToken;
    this.apiJobsURL = 'https://api.speechmatics.com/v1.0/user/' + this.userID + '/jobs/?auth_token=' + this.authToken;
  }

  getSpeechmaticsJobs(id) {
    return this.http.get(this.proxyurl + 'https://api.speechmatics.com/v1.0/user/' + this.userID + '/jobs/' + id + '/transcript?auth_token=' + this.authToken);
  }

  // TO return from an existing id:
  // getSpeechmaticsJobs() {
  //   return this.http.get(this.proxyurl + 'https://api.speechmatics.com/v1.0/user/' + this.userID + '/jobs/10434706/transcript?auth_token=' + this.authToken);
  // }

  getSpeechmaticsJobStatus(id) {
    return this.http.get(    this.proxyurl + 'https://api.speechmatics.com/v1.0/user/' + this.userID + '/jobs/' + id + '/?auth_token=' + this.authToken);
  }

  postSpeechmaticsJob(audiofile) {
    const params = new FormData();
    params.append('model',  'de');
    params.append('data_file', audiofile, audiofile.name);
    params.append('diarisation', 'false');

    const req = new HttpRequest(
      'POST',
      (this.proxyurl + this.apiJobsURL),
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
