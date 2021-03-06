import {Line} from '../obj/Line';
import {AVMousePos} from '../obj/AVMousePos';
import {PlayCursor} from '../obj/PlayCursor';
import {AudioChunk, AudioTimeCalculator} from '../obj/media/audio';
import {AudioviewerComponent} from '../components/audio/audioviewer';
import {AudioManager} from '../obj/media/audio/AudioManager';

export class AudioComponentService {
  public audioTCalculator: AudioTimeCalculator;
  // LINES
  protected last_line: Line = null;
  // MOUSE
  protected mouse_down = false;
  protected mouse_click_pos: AVMousePos = new AVMousePos(
    0,
    0,
    0,
    null
  );
  protected mousecursor: AVMousePos = null;
  protected playcursor: PlayCursor = null;
  // AUDIO
  protected audio_px_w = 0;
  protected hZoom = 0;
  protected audiochunk: AudioChunk;

  get AudioPxWidth(): number {
    return this.audio_px_w;
  }

  set AudioPxWidth(audio_px: number) {
    this.audio_px_w = audio_px;
  }

  get MouseClickPos(): AVMousePos {
    return this.mouse_click_pos;
  }

  set MouseClickPos(mouse_click_pos: AVMousePos) {
    this.mouse_click_pos = mouse_click_pos;
  }

  get Mousecursor(): any {
    return this.mousecursor;
  }

  set Mousecursor(mousecursor: any) {
    this.mousecursor = mousecursor;
  }

  // PlayCursor in absX
  get PlayCursor(): PlayCursor {
    return this.playcursor;
  }

  set PlayCursor(playcursor: PlayCursor) {
    this.playcursor = playcursor;
  }

  protected get audiomanager(): AudioManager {
    return this.audiochunk.audiomanager;
  }

  constructor() {
  }

  public initialize(innerWidth: number, audiochunk: AudioChunk) {
    this.audiochunk = audiochunk;
  }

  /***
   *        ALL FUNCTIONS RELATED TO MOUSE
   */

  public setMouseMovePosition(type: string, x: number, y: number, curr_line: Line, innerWidth) {
    this.mousecursor.relPos.x = x;
    this.mousecursor.absX = this.getAbsXByLine(curr_line, x, innerWidth);
    this.mousecursor.timePos.samples = this.audioTCalculator.absXChunktoSamples(this.mousecursor.absX, this.audiochunk);
    this.mousecursor.relPos.y = y;
    this.mousecursor.line = curr_line;
    this.last_line = curr_line;
  }

  public setMouseClickPosition(x: number, y: number, curr_line: Line, $event: Event, innerWidth: number, viewer?: AudioviewerComponent) {
    this.mousecursor.relPos.x = x;
    this.mousecursor.relPos.y = y;
  }

  public getAbsXByLine(line: Line, rel_x, innerWidth): number {
    return (line.number * innerWidth + rel_x);
  }

  /***
   *        -----------------------------------
   */
}
