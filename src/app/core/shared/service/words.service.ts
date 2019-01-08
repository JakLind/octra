import {Injectable} from '@angular/core';
import {Segment, Segments} from '../../obj/Annotation';

@Injectable()
export class WordsService {

  private wordArray = [];
  // private wordsInTranscription: boolean;
  private wordPerSegmentArray = [];
  // private wordsInSegment: boolean;
  private samplesPerWordOfFullTranscription: number;
  private samplesPerWordOfSegment: number;
  private samples = 0;
  private lastSamplesValue = 0;

  constructor() {
  }

  getTotalWords(transcription: string) {
    if (transcription) {
      // this.wordsInTranscription = true;
      this.wordArray = transcription.split(' ');
      console.log(this.wordArray);
      for (let i = 0; i <= this.wordArray.length; i++) {
        if (this.wordArray[i] === '') {
          this.wordArray.splice(i, 1);
          i--;
        }
      }
      return this.wordArray;
    } else {
      // this.wordsInTranscription = false;
      return 'There is no transcription available, yet';
    }
  }

  getWordsPerSegment(segment: Segment) {
    this.wordPerSegmentArray = [];
    // if (segment.transcript) {
    //   this.wordsInSegment = true;
    this.wordPerSegmentArray = segment.transcript.split(' ');
    console.log(this.wordPerSegmentArray);
    for (let i = 0; i <= this.wordPerSegmentArray.length; i++) {
      if (this.wordPerSegmentArray[i] === '') {
        this.wordPerSegmentArray.splice(i, 1);
        i--;
      }
    }
    return this.wordPerSegmentArray;
    // } else {
    //   this.wordsInSegment = false;
    //   return this.wordPerSegmentArray;
    // }
  }

  getSamplesPerWordOfFullTranscription(segments: Segments) {
    this.samplesPerWordOfFullTranscription = 0;
    let transcribedSamples;
    for (let i = 0; i < segments.length; i++) {
      if (segments.segments[i - 1]) {
        transcribedSamples = segments.segments[i - 1].time.samples;
        console.log('Transcribed samples from wordOfFullTrans: ' + transcribedSamples);
        i = segments.length;
      }
    }
    if (this.wordArray.length !== 0 && transcribedSamples > 0) {
      this.samplesPerWordOfFullTranscription = transcribedSamples / this.wordArray.length;
    }
    return this.samplesPerWordOfFullTranscription;
  }

  getSamplesPerWordOfSegment(segment: Segment, segments: Segments) {
    this.samplesPerWordOfSegment = 0;
    // if (this.wordsInSegment) {
    let segmentSamples;

    for (let i = 0; i < segments.length; i++) {
      if (segments.segments[i] === segment) {
        if (segments.segments[i - 1]) {
          segmentSamples = segment.time.samples - segments.segments[i - 1].time.samples;
          console.log('Segment end timestamp: ' + segment.time.samples);
          console.log('Segment start timestamp: ' + segments.segments[i - 1].time.samples);
        } else {
          segmentSamples = segment.time.samples;
        }
        console.log('Segment duration: ' + segmentSamples);
        if (this.wordPerSegmentArray.length !== 0) {
          this.samplesPerWordOfSegment = Math.round(segmentSamples / this.wordPerSegmentArray.length);
        }
        i = segments.length;
        return this.samplesPerWordOfSegment;
      }
    }
    // } else {
    //   return this.samplesPerWordOfSegment;
    // }

  }

  getSamplesPerCharacter(lengthOfTranscription: number, totalWordsOfTranscription: number) {
    let samplesPerCharacter = 0;
    if (totalWordsOfTranscription !== 0) {
      const charactersPerWord = lengthOfTranscription / totalWordsOfTranscription;
      console.log('charactersPerWord of full transcription: ' + charactersPerWord);
      samplesPerCharacter = this.samplesPerWordOfFullTranscription / charactersPerWord;
      console.log('samplesPerCharacter of full transcription: ' + samplesPerCharacter);
    }
    return samplesPerCharacter;
  }

  getSamplesPerCharacterOfSegment(lengthOfCurrentSegment: number, wordsOfSegment: number, transcriptExists: boolean, samplerate: number) {
    let samplesPerCharacter = 0;

    if (wordsOfSegment !== 0) {
      const charactersPerWord = Math.round(lengthOfCurrentSegment / wordsOfSegment);
      console.log('charactersPerWord: ' + charactersPerWord);
      samplesPerCharacter = Math.round(this.samplesPerWordOfSegment / charactersPerWord);
    }

    console.log('last sample value: ' + this.lastSamplesValue);
    console.log('samplesPerCharacter: ' + samplesPerCharacter);

    if (!transcriptExists) {
      if (samplesPerCharacter < this.lastSamplesValue || this.lastSamplesValue === 0) {
        this.lastSamplesValue = samplesPerCharacter;
        return samplesPerCharacter;
      } else {
        this.lastSamplesValue = Math.round((Math.abs(samplesPerCharacter - 2 * samplerate / 100) + this.lastSamplesValue) / 2);
        return this.lastSamplesValue;
      }
    } else {
      // führe Berechnung nur durch, falls sie einen Samplewert von mindestens 20ms ergibt, ansonsten übernehme den samplesPerCharacter Wert ohne Abzüge
      if (Math.abs(samplesPerCharacter - samplerate / 100) >= samplerate / 100 * 2) {
        this.lastSamplesValue = Math.abs(samplesPerCharacter - samplerate / 100);
      } else {
        this.lastSamplesValue = samplesPerCharacter;
      }
      return this.lastSamplesValue;
    }
  }
}
