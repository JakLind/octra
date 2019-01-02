import {HttpClient, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable()
export class SpeechmaticsService {

  proxyurl = 'https://cors-anywhere.herokuapp.com/';
  private apiJobsURL: string;
  private userID: number;
  private authToken: string;

  constructor(private http: HttpClient) {}

  setIDAndAuthToken(userID: number, authToken: string) {
    this.userID = userID;
    this.authToken = authToken;
    this.apiJobsURL = 'https://api.speechmatics.com/v1.0/user/' + this.userID + '/jobs/?auth_token=' + this.authToken;
  }

  // getSpeechmaticsJobs(id) {
  //   return this.http.get(this.proxyurl + 'https://api.speechmatics.com/v1.0/user/' + this.userID + '/jobs/' + id + '/transcript?auth_token= + this.authToken);
  // }

  // TO return form an existing id:
  getSpeechmaticsJobs() {
    return this.http.get(this.proxyurl + 'https://api.speechmatics.com/v1.0/user/' + this.userID + '/jobs/10434706/transcript?auth_token=' + this.authToken);
  }

  postSpeechmaticsJob(audiofile) {
    const files = audiofile.nativeElement.querySelector('#selectFile').files;
    console.log(files);
    const params = new FormData();
    // let fileReader = new FileReader();
    // let blob = new Blob();
    // let test = fileReader.readAsDataURL(blob);
    const audio = new File(['how to get filebits?'], 'zero.wav', {type: 'audio/wav'});
    const inputFile = files[0];
    console.log('Audio: ' + audio);
    console.log('File: ' + inputFile, 'files: ' + files[0]);
    params.append('model',  'de');
    params.append('data_file', inputFile, inputFile.name);

    console.log('Params get data_file: ' + params.get('data_file'));

    const req = new HttpRequest(
      'POST',
      (this.proxyurl + this.apiJobsURL),
      params
    );
    return this.http.request(req);
    // return null;

    // const fdHeader = new Headers({'Content-Type': 'multipart/form-data'});
  }

  getWordsFromSpeechmaticsJSON(speechmaticsTranscription) {
    // const fullTranscription = speechmaticsTranscription.join(' ');

    //   const req = new HttpRequest(
    //     'GET',
    //     ('../../../assets/transcription_example.json')
    //   );
    //
    //   return this.http.request(req);
    // }

    const allWords = [];
    // console.log('stringified speechmaticsTranscription: ' + speechmaticsTranscription);
    // console.log('stringified speechmaticsTranscription JSON parse: ' + JSON.parse(speechmaticsTranscription).words);
    const wordsOfLocal = JSON.parse(speechmaticsTranscription).words;
    for (let i = 0; i < wordsOfLocal.length; i++) {
      // if (wordsOfLocal[i].name === '.') {
      // } else {
        allWords[i] = wordsOfLocal[i].name;
      // }
    }
    const resultSpeechmatics = allWords.join(' ');
    return resultSpeechmatics;
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
