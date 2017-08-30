import {Converter, ExportResult, IFile, ImportResult} from './Converter';
import {OAnnotJSON, OAudiofile, OItem, OLabel, OLevel, OSegment} from '../Annotation/AnnotJSON';
import {isNullOrUndefined} from 'util';

export class PartiturConverter extends Converter {

  public constructor() {
    super();
    this._application = '';
    this._name = 'BAS Partitur Format';
    this._extension = '.par';
    this._website.title = 'BAS Partitur Format';
    this._website.url = 'www.bas.uni-muenchen.de/Bas/BasFormatsdeu.html';
    this._conversion.export = false;
    this._conversion.import = false;
    this._encoding = 'UTF-8';
  }

  public export(annotation: OAnnotJSON, audiofile: OAudiofile): ExportResult {
    return null;
  };

  public import(file: IFile, audiofile: OAudiofile): ImportResult {
    if (audiofile !== null && audiofile !== undefined) {
      const lines = file.content.split(/\r?\n/g);
      let pointer = 0;
      const sam_found = lines[pointer].match(/SAM: ([0-9]+)/);
      if (isNullOrUndefined(sam_found)) {
        console.error(this._name + ' Converter Error: samplerate not found in .par file');
        return null;
      }
      const samplerate = Number(sam_found[1]);

      if (samplerate !== audiofile.samplerate) {
        console.error(this._name + ' Converter Error: samplerate of audiofile is not equal with samplerate of .par file.');
        return null;
      }
      pointer++;

      const result = new OAnnotJSON(audiofile.name, audiofile.samplerate);
      const tiers = {};

      // skip not needed information and read needed information
      let previous_tier = '';
      let level = null;
      let counter = 1;
      let start = 0;
      while (pointer < lines.length) {
        const search = lines[pointer].match(
          new RegExp(
            '(KAN)|(ORT)|(DAS)|(TR2)|(SUP)|(PRS)|(NOI)|(LBP)|(LBG)|(PRO)|(POS)|(LMA)|(SYN)|(FUN)|(LEX)|' +
            '(IPA)|(TRN)|(TRS)|(GES)|(USH)|(USM)|(OCC)|(USP)|(GES)|(TLN)|(PRM)|(TRW)|(MAS)'));
        if (!isNullOrUndefined(search)) {
          if (previous_tier !== search[0]) {
            if (level !== null) {
              result.levels.push(level);
            }
            level = (search[0] !== 'TRN') ? new OLevel(search[0], 'ITEM', []) : new OLevel(search[0], 'SEGMENT', []);
            previous_tier = search[0];
            tiers[`${previous_tier}`] = [];
          }
          const columns = lines[pointer].split(' ');
          if (previous_tier !== 'TRN') {
            level.items.push(new OItem(counter, [new OLabel(previous_tier, columns[2])]));
            tiers[`${previous_tier}`].push(columns[2]);
          } else {
            const transcript = lines[pointer].match(new RegExp('TRN: ([0-9]+) ([0-9]+) ([0-9]+,?)+ (.*)'));
            level.items.push(new OSegment(
              counter, Number(transcript[1]), Number(transcript[2]) + 1, [new OLabel(previous_tier, transcript[4])]
              )
            );
          }

          counter++;
        }
        pointer++;
      }
      result.levels.push(level);

      console.log(result);
      return {
        annotjson: result,
        audiofile: null
      };
    }

    return null;
  };
}
