import {Injectable} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';
import {AudioviewerComponent} from './audioviewer.component';
import {AudioviewerConfig} from './audioviewer.config';
import {Interval, Position, Rectangle, Size} from '../../../objects';
import {AudioComponentService} from '../../../service';
import {AudioChunk, AudioSelection, AudioTime, AudioTimeCalculator} from '../../../obj/media/audio';
import {Line} from '../../../obj/Line';
import {AVMousePos} from '../../../obj/AVMousePos';
import {SubscriptionManager} from '../../../../core/obj/SubscriptionManager';
import {AudioService, KeymappingService, TranscriptionService} from '../../../../core/shared/service';
import {PlayCursor} from '../../../obj/PlayCursor';
import {PlayBackState} from '../../../obj/media';


@Injectable()
export class AudioviewerService extends AudioComponentService {

  get LinesArray(): Line[] {
    return this.Lines;
  }

  get Mousecursor(): AVMousePos {
    return this.mousecursor;
  }

  set Mousecursor(new_pos: AVMousePos) {
    this.mousecursor = new_pos;
  }

  get LastLine(): Line {
    return this.last_line;
  }

  set LastLine(line: Line) {
    this.last_line = line;
  }

  get Settings(): AudioviewerConfig {
    return this._settings;
  }

  set Settings(value: AudioviewerConfig) {
    this._settings = value;
  }

  get dragableBoundaryNumber(): number {
    return this._dragableBoundaryNumber;
  }

  get zoomY(): number {
    return this._zoomY;
  }

  set zoomY(value: number) {
    this._zoomY = value;
  }

  get zoomX(): number {
    return this._zoomX;
  }

  // AUDIO

  get minmaxarray(): number[] {
    return this._minmaxarray;
  }

  get drawnselection(): AudioSelection {
    return this._drawnselection;
  }

  set drawnselection(value: AudioSelection) {
    this._drawnselection = value;
  }

  get realRect(): Rectangle {
    return this._realRect;
  }

  get viewRect(): Rectangle {
    return this._viewRect;
  }

  get visibleLines(): Interval {
    return this._visibleLines;
  }

  constructor(protected audio: AudioService,
              protected transcrService: TranscriptionService,
              private keyMap: KeymappingService,
              private langService: TranslateService) {
    super();

    this.subscrmanager = new SubscriptionManager();
    this.subscrmanager.add(this.keyMap.onkeyup.subscribe(this.onKeyUp));
  }

  public overboundary = false;
  public focused = false;
  public shift_pressed = false;
  private _settings: AudioviewerConfig;
  private subscrmanager: SubscriptionManager;
  // LINES
  private Lines: Line[] = [];

  private _dragableBoundaryNumber = -1;

  private _zoomY = 1;

  private _zoomX = 1;

  private _minmaxarray: number[] = [];

  private _drawnselection: AudioSelection;

  private _realRect: Rectangle = new Rectangle(new Position(0, 0), new Size(0, 0));

  private _viewRect: Rectangle = new Rectangle(new Position(0, 0), new Size(0, 0));

  private _visibleLines: Interval = new Interval(0, 0);
  onKeyUp = (event) => {
    this.shift_pressed = false;
  };

  /**
   * initializes audioviewer using inner width
   * @param innerWidth
   */
  public initialize(innerWidth: number, audiochunk: AudioChunk): Promise<void> {
    super.initialize(innerWidth, audiochunk);

    this.Lines = [];

    if (this.Settings.multi_line) {
      this.AudioPxWidth = this.audiomanager.ressource.info.duration.seconds * this.Settings.pixel_per_sec;
      this.AudioPxWidth = (this.AudioPxWidth < innerWidth) ? innerWidth : this.AudioPxWidth;
    } else {
      this.AudioPxWidth = innerWidth;
    }

    if (this.AudioPxWidth > 0) {
      // initialize the default values
      this.audioTCalculator = new AudioTimeCalculator(this.audiomanager.ressource.info.samplerate,
        this.audiochunk.time.duration, this.AudioPxWidth);
      this.Mousecursor = new AVMousePos(0, 0, 0, new AudioTime(0, this.audiomanager.ressource.info.samplerate));
      this.MouseClickPos = new AVMousePos(0, 0, 0, new AudioTime(0, this.audiomanager.ressource.info.samplerate));
      this.PlayCursor = new PlayCursor(0, new AudioTime(0, this.audiomanager.ressource.info.samplerate), innerWidth);
    } else {
      return new Promise<void>((resolve, reject) => {
        console.error('audio px is 0.');
        resolve();
      });
    }

    return this.afterChannelInititialized(innerWidth);
  }

  /**
   * save mouse position for further processing
   * @param type
   * @param x
   * @param y
   * @param curr_line
   * @param innerWidth
   */
  public setMouseMovePosition(type: string, x: number, y: number, curr_line: Line, innerWidth) {
    super.setMouseMovePosition(type, x, y, curr_line, innerWidth);

    const absX = this.getAbsXByLine(curr_line, x - curr_line.Pos.x, innerWidth);
    let absXTime = this.audioTCalculator.absXChunktoSamples(absX, this.audiochunk);

    let dragableBoundaryTemp = this.getBoundaryNumber(absX);

    if (this.mouse_down && this._dragableBoundaryNumber < 0) {
      // mouse down, nothing dragged
      this.audiochunk.selection.end = new AudioTime(absXTime, this.audiomanager.ressource.info.samplerate);
      this.drawnselection.end = this.audiochunk.selection.end.clone();
    } else if (this.mouse_down && this._dragableBoundaryNumber > -1) {
      // mouse down something dragged
      const segment = this.transcrService.currentlevel.segments.get(this._dragableBoundaryNumber).clone();
      const absXSeconds = (absXTime / this.audiomanager.ressource.info.samplerate);

      // prevent overwriting another boundary
      const segment_before = (this._dragableBoundaryNumber > 0)
        ? this.transcrService.currentlevel.segments.get(this._dragableBoundaryNumber - 1) : null;
      const segment_after = (this._dragableBoundaryNumber < this.transcrService.currentlevel.segments.length - 1)
        ? this.transcrService.currentlevel.segments.get(this._dragableBoundaryNumber + 1) : null;
      if (!(segment_before === null || segment_before === undefined)) {
        // check segment boundary before this segment
        if (absXSeconds < segment_before.time.seconds + 0.02) {
          absXTime = segment_before.time.samples + Math.round((0.02) * this.audiomanager.ressource.info.samplerate);
        }
      }
      if (!(segment_after === null || segment_after === undefined)) {
        // check segment boundary after this segment
        if (absXSeconds > segment_after.time.seconds - 0.02) {
          absXTime = segment_after.time.samples - Math.round((0.02) * this.audiomanager.ressource.info.samplerate);
        }
      }

      segment.time.samples = absXTime;
      this.transcrService.currentlevel.segments.change(this._dragableBoundaryNumber, segment);
      this.transcrService.currentlevel.segments.sort();
      dragableBoundaryTemp = this.getBoundaryNumber(absX);
      this._dragableBoundaryNumber = dragableBoundaryTemp;
    } else {
      this.mouse_down = false;
    }

    // set if boundary was dragged
    this.overboundary = (dragableBoundaryTemp > -1);
  }

  /**
   * saves mouse click position
   * @param x
   * @param y
   * @param curr_line
   * @param $event
   * @param innerWidth
   * @param callback
   */
  public setMouseClickPosition(x: number, y: number, curr_line: Line, $event: Event,
                               innerWidth: number, viewer: AudioviewerComponent): Promise<Line> {
    const promise = new Promise<Line>((resolve, reject) => {
      super.setMouseClickPosition(x, y, curr_line, $event, innerWidth);

      const absX = this.getAbsXByLine(curr_line, x - curr_line.Pos.x, innerWidth);
      const absXInTime = this.audioTCalculator.absXChunktoSamples(absX, this.audiochunk);

      if (!this.audiomanager.audioplaying) {
        if (this.last_line === null || this.last_line === curr_line) {
          // same line
          // fix margin settings
          if ($event.type === 'mousedown' && !this.shift_pressed) {
            if (this.last_line === null || this.last_line.number === this.last_line.number) {
              // no line defined or same line
              this.mouse_click_pos.absX = absX;
              this.mouse_click_pos.timePos = new AudioTime(absXInTime, this.audiomanager.ressource.info.samplerate);
              this.mouse_click_pos.line = curr_line;

              this.audiochunk.startpos = this.mouse_click_pos.timePos.clone();
              this._drawnselection.end = this.audiochunk.selection.start.clone();

              this._dragableBoundaryNumber = this.getBoundaryNumber(this.mouse_click_pos.absX);
            }
            this.mouse_down = true;
          } else if ($event.type === 'mouseup') {
            if (this._dragableBoundaryNumber > -1 &&
              this._dragableBoundaryNumber < this.transcrService.currentlevel.segments.length) {
              // some boundary dragged
              const segment = this.transcrService.currentlevel.segments.get(this._dragableBoundaryNumber);
              segment.time.samples = this.audioTCalculator.absXChunktoSamples(absX, this.audiochunk);
              this.transcrService.currentlevel.segments.change(this._dragableBoundaryNumber, segment);
              this.transcrService.currentlevel.segments.sort();
            } else {
              // set selection
              this.audiochunk.selection.end = new AudioTime(absXInTime, this.audiomanager.ressource.info.samplerate);

              this.audiochunk.selection.checkSelection();
              this._drawnselection = this.audiochunk.selection.clone();
              this.PlayCursor.changeSamples(this.audiochunk.playposition.samples, this.audioTCalculator, this.audiochunk);
            }

            this._dragableBoundaryNumber = -1;
            this.overboundary = false;
            this.mouse_down = false;
          }
        } else if ($event.type === 'mouseup') {
          if (this._dragableBoundaryNumber > -1 && this._dragableBoundaryNumber < this.transcrService.currentlevel.segments.length) {
            // some boundary dragged
            const segment = this.transcrService.currentlevel.segments.get(this._dragableBoundaryNumber);
            segment.time.samples = this.audioTCalculator.absXChunktoSamples(absX, this.audiochunk);
            this.transcrService.currentlevel.segments.sort();
          } else {
            // set selection
            if (!this.mouse_down) {
              // click only
              this.audiochunk.selection.end = this.audiochunk.selection.start.clone();
            } else {
              this.audiochunk.selection.end = new AudioTime(absXInTime, this.audiomanager.ressource.info.samplerate);
            }
            this.audiochunk.selection.checkSelection();
            this.PlayCursor.changeSamples(this.audiochunk.playposition.samples, this.audioTCalculator, this.audiochunk);
          }

          this._dragableBoundaryNumber = -1;
          this.overboundary = false;
          this.mouse_down = false;
        }
      } else if (this.audiomanager.state === PlayBackState.PLAYING && ($event.type === 'mouseup')) {
        this.audiochunk.stopPlayback(() => {
          const time = new AudioTime(absXInTime, this.audiomanager.ressource.info.samplerate);
          this.audiochunk.startpos = time;
          this.audiochunk.selection.end = time.clone();
          this.PlayCursor.changeSamples(absXInTime, this.audioTCalculator, this.audiochunk);
          viewer.drawSegments();
          viewer.drawCursor(this.Mousecursor.line);
          viewer.drawPlayCursorOnly(this.Mousecursor.line);
          viewer.startPlayback();
          this.mouse_down = false;
          this._dragableBoundaryNumber = -1;
        });
      }

      resolve(this.mouse_click_pos.line);
    });

    return promise;
  }

  /**
   *
   * @param x
   * @param y
   * @returns {any}
   */
  public getLineByMousePosition(x, y): Line {
    for (let i = 0; i < this.Lines.length; i++) {
      if (this.Lines[i].mouseIn(x, y)) {
        return this.Lines[i];
      }
    }
    return null;
  }

  /**
   * addSegment() adds a boundary to the list of segments or removes the segment
   * @returns {any}
   */
  public addSegment(): { type: string, seg_samples: number, msg: { type: string, text: string } } {
    let i = 0;
    const line = this.last_line;
    this.audioTCalculator.audio_px_width = this.audio_px_w;

    if (!(line === null || line === undefined) && this.Settings.boundaries.enabled && !this.Settings.boundaries.readonly) {
      const absXTime = (!this.audiochunk.isPlaying) ? this.mousecursor.timePos.samples : this.audiochunk.playposition.samples;
      let b_width_time = this.audioTCalculator.absXtoSamples2(this.Settings.boundaries.width * 2, this.audiochunk);
      b_width_time = Math.round(b_width_time);

      if (this.transcrService.currentlevel.segments.length > 0 && !this.audiochunk.isPlaying) {
        for (i = 0; i < this.transcrService.currentlevel.segments.length; i++) {
          if ((this.transcrService.currentlevel.segments.get(i).time.samples >= absXTime - b_width_time
            && this.transcrService.currentlevel.segments.get(i).time.samples <= absXTime + b_width_time)
            && this.transcrService.currentlevel.segments.get(i).time.samples !== this.audiomanager.ressource.info.duration.samples
          ) {

            const seg_samples = this.transcrService.currentlevel.segments.get(i).time.samples;
            this.transcrService.currentlevel.segments.removeByIndex(i, this.transcrService.break_marker.code);

            return {
              type: 'remove',
              seg_samples: seg_samples,
              msg: {
                type: 'success',
                text: ''
              }
            };
          }
        }
      }

      const selection: number = !(this.drawnselection === null || this.drawnselection === undefined) ? this.drawnselection.length : 0;

      if (selection > 0 && absXTime >= this.drawnselection.start.samples && absXTime <= this.drawnselection.end.samples) {
        // some part selected
        const segm1 = this.transcrService.currentlevel.segments.BetweenWhichSegment(this.drawnselection.start.samples);
        const segm2 = this.transcrService.currentlevel.segments.BetweenWhichSegment(this.drawnselection.end.samples);

        if (segm1 === null && segm2 === null || (segm1 === segm2 || (segm1.transcript === '' && segm2.transcript === ''))) {
          if (this.drawnselection.start.samples > 0) {
            // prevent setting boundary if first sample selected
            this.transcrService.currentlevel.segments.add(this.drawnselection.start.samples);
          }
          this.transcrService.currentlevel.segments.add(this.drawnselection.end.samples);
          return {
            type: 'add',
            seg_samples: this.drawnselection.start.samples,
            msg: {
              type: 'success',
              text: ''
            }
          };
        } else {
          return {
            type: 'add',
            seg_samples: this.drawnselection.start.samples,
            msg: {
              type: 'error',
              text: this.langService.instant('boundary cannot set')
            }
          };
        }
      } else {
        // no selection
        let segment = this.transcrService.currentlevel.segments.BetweenWhichSegment(absXTime);
        const transcript = segment.transcript;
        segment.transcript = '';
        this.transcrService.currentlevel.segments.add(Math.round(absXTime));
        segment = this.transcrService.currentlevel.segments.BetweenWhichSegment(absXTime);
        segment.transcript = transcript;
        return {
          type: 'add',
          seg_samples: -1,
          msg: {
            type: 'success',
            text: ''
          }
        };
      }
    }
    return null;
  }

  /**
   * get selection of segment
   * @returns AudioSelection
   */
  public getSegmentSelection(position_samples: number): AudioSelection {
    // complex decision needed because there are no segments at position 0 and the end of the file
    let result = null;
    const segments = this.transcrService.currentlevel.segments;
    const length = this.transcrService.currentlevel.segments.length;

    if (length > 0) {
      if (position_samples < segments.get(0).time.samples) {
        // select in first Boundary
        result = new AudioSelection(new AudioTime(0, this.audiomanager.ressource.info.samplerate), segments.get(0).time);
      } else if (position_samples > segments.get(segments.length - 1).time.samples) {
        // select in first Boundary
        const seg = segments.get(segments.length - 1).time.clone();
        result = new AudioSelection(seg, this.audiomanager.ressource.info.duration);
      } else {
        for (let i = 1; i < length; i++) {
          if (position_samples > segments.get(i - 1).time.samples
            && position_samples < segments.get(i).time.samples) {
            const seg1 = segments.get(i - 1).time;
            const seg2 = segments.get(i).time;
            result = new AudioSelection(seg1, seg2);
            return result;
          }
        }
      }
    }
    return result;
  }

  /**
   * get selection of an sample relative to its position and width
   * @param line
   * @param start_samples
   * @param end_samples
   * @param innerWidth
   * @returns {{start: number, end: number}}
   */
  public getRelativeSelectionByLine(line: Line, start_samples: number,
                                    end_samples: number, innerWidth: number): { start: number, end: number } {

    if (!(line === null || line === undefined)) {
      const absX = line.number * innerWidth;
      const absEnd = absX + line.Size.width;
      const SelAbsStart = this.audioTCalculator.samplestoAbsX(start_samples - this.audiochunk.time.start.samples);
      const SelAbsEnd = this.audioTCalculator.samplestoAbsX(end_samples - this.audiochunk.time.start.samples);

      const result = {
        start: SelAbsStart,
        end: SelAbsEnd
      };

      // is some seletion in line?
      if (this.Lines.length > 0) {
        if (SelAbsEnd > -1 && SelAbsEnd >= absX) {
          if (SelAbsStart > -1) {
            // check start selection
            if (SelAbsStart >= absX) {
              result.start = SelAbsStart - (line.number * innerWidth);
            } else {
              result.start = 0;
            }
          } else {
            result.start = 0;
          }

          if (SelAbsStart <= absEnd) {
            // check end selection
            if (SelAbsEnd > absEnd) {
              result.end = innerWidth;
            } else if (SelAbsEnd <= absEnd) {
              result.end = SelAbsEnd - (line.number * innerWidth);
            }
            return result;
          } else {
            return {start: -3, end: -1};
          }
        } else {
          return {start: -1 * SelAbsStart, end: -1 * SelAbsEnd};
        }
      }
    }
  }

  /**
   * updates all lines of audioviewer: the number of lines and their sizes
   * @param innerWidth
   */
  public updateLines(innerWidth: number) {
    if (this.Settings.multi_line) {
      const lines = Math.ceil(this.audio_px_w / innerWidth);
      let rest_width = Number(this.audio_px_w);

      if (lines < this.Lines.length) {
        // too many lines, delete
        this.Lines.splice(lines - 1, (this.Lines.length - lines));
      } else if (lines > this.Lines.length) {
        // too few lines, add new ones
        for (let i = 0; i < lines - this.Lines.length; i++) {
          this.addLine(i, 0, this.Settings.lineheight);
        }
      }

      for (let i = 0; i < lines; i++) {
        const w = (rest_width > innerWidth) ? innerWidth : rest_width;

        const line = this.Lines[i];
        if (line) {
          line.number = i;

          line.Size = {
            width: Number(w),
            height: Number(line.Size.height)
          };

          if (i > 0) {
            line.Pos = {
              x: Number(this.Lines[i - 1].Pos.x),
              y: Number(this.Lines[i - 1].Pos.y + this.Lines[i - 1].Size.height + this.Settings.margin.bottom)
            };
          } else {
            line.Pos = {
              x: this.Settings.margin.left,
              y: this.Settings.margin.top
            };
          }
        } else {
          this.addLine(i, w, this.Settings.lineheight);
        }

        rest_width = rest_width - innerWidth;
      }
    } else {
      this.audio_px_w = innerWidth;
      const w = innerWidth;

      const line = this.Lines[0];
      if (!(line === null || line === undefined)) {
        line.number = 0;
        line.Size = {
          width: w,
          height: this.Settings.lineheight
        };
      } else {
        this.addLine(0, w, this.Settings.lineheight);
      }
    }
  }

  /**
   * get Line by absolute width of the audio sample
   * @param absX
   * @param innerWidth
   * @returns Line
   */
  getLineByAbsX(absX, innerWidth): Line {
    const line_num = Math.floor(absX / innerWidth);
    if (this.Lines[line_num]) {
      return this.Lines[line_num];
    }

    return null;
  }

  /**
   * add line zu the list of lines
   * @param line_num
   * @param w
   * @param h
   */
  addLine(line_num: number, w: number, h: number) {
    const size = {
      height: h,
      width: w
    };

    const position = {
      x: this.Settings.margin.left,
      y: this.Settings.margin.top
    };

    position.y += (this.Lines.length > line_num - 1 && !(this.Lines[line_num - 1] === null
      || this.Lines[line_num - 1] === undefined)) ? this.Lines[line_num - 1].Pos.y : 0;
    const line_obj = new Line(line_num, size, position);
    this.Lines.push(line_obj);
  }

  /**
   * get boundary number by absolute x position
   * @param absX
   * @returns {number}
   */
  getBoundaryNumber(absX: number): number {
    // last boundary may not be returned!
    for (let i = 0; i < this.transcrService.currentlevel.segments.length - 1; i++) {
      const segment = this.transcrService.currentlevel.segments.get(i);
      const segAbsX = this.audioTCalculator.samplestoAbsX(segment.time.samples - this.audiochunk.time.start.samples);
      const next_unblocked = true;

      /*
       if (i < this.transcrService.currentlevel.segments.length - 1) {
       const next_segment = this.transcrService.currentlevel.segments.get(i + 1);
       if (next_segment.transcript !== '' && next_segment.transcript !== this.transcrService.break_marker.code) {
       next_unblocked = false;
       }
       }*/
      if (segAbsX >= absX - this.Settings.boundaries.width / 2
        && segAbsX <= absX + this.Settings.boundaries.width / 2
        // && (segment.transcript === '' || segment.transcript === this.transcrService.break_marker.code)
        && next_unblocked
      ) {
        return i;
      }
    }
    return -1;
  }

  /**
   * move cursor to one direction and x samples
   * @param direction
   * @param samples
   */
  public moveCursor(direction: string, samples: number) {
    const line = this.mousecursor.line;
    if (samples > 0) {
      if ((direction === 'left' || direction === 'right') &&
        ((this.mousecursor.timePos.samples >= this.audiochunk.time.start.samples + samples && direction === 'left') ||
          (this.mousecursor.timePos.samples <= this.audiochunk.time.end.samples - samples && direction === 'right')
        )) {

        if (direction === 'left') {
          if (this.mousecursor.timePos.samples >= this.audiochunk.time.start.samples + samples) {
            this.mousecursor.timePos.samples -= samples;
            const rel_samples = this.mousecursor.timePos.samples - this.audiochunk.time.start.samples;
            const absx = this.audioTCalculator.samplestoAbsX(rel_samples, this.audiochunk.time.duration);
            this.mousecursor.relPos.x = absx % line.Size.width;
            this.mousecursor.line = this.getLineByAbsX(absx, line.Size.width);
            this.last_line = this.mousecursor.line;
          }
        } else if (direction === 'right') {
          if (this.mousecursor.timePos.samples <= this.audiochunk.time.end.samples - samples) {
            this.mousecursor.timePos.samples += samples;
            const rel_samples = this.mousecursor.timePos.samples - this.audiochunk.time.start.samples;
            const absx = this.audioTCalculator.samplestoAbsX(rel_samples, this.audiochunk.time.duration);
            this.mousecursor.relPos.x = absx % line.Size.width;
            this.mousecursor.line = this.getLineByAbsX(absx, line.Size.width);
            this.last_line = this.mousecursor.line;
          }
        }
      }
    } else {
      throw new Error('can not move cursor by given samples. Number of samples less than 0.');
    }
  }

  /**
   * destroy this audioviewer object
   */
  public destroy() {
    this.subscrmanager.destroy();
  }

  /**
   * initialize settings
   */
  public initializeSettings() {
    this._settings = new AudioviewerConfig();
  }

  public refresh(): Promise<any> {
    return new Promise<void>(
      (resolve, reject) => {
        try {
          this._minmaxarray = this.computeDisplayData(this.AudioPxWidth / 2, this.Settings.lineheight, this.audiochunk.audiomanager.channel,
            {
              start: this.audiochunk.selection.start.samples,
              end: this.audiochunk.selection.end.samples
            });
          resolve();
        } catch (err) {
          reject(err);
        }
      }
    );
  }

  /**
   * computeDisplayData() generates an array of min-max pairs representing the
   * audio signal. The values of the array are float in the range -1 .. 1.
   * @param w
   * @param h
   * @param channel
   */
  computeDisplayData(width: number, height: number, cha: Float32Array, _interval: { start: number; end: number; }) {
    width = Math.floor(width);

    if (_interval.start !== null && _interval.end !== null && _interval.end >= _interval.start) {
      const min_maxarray = [], len = _interval.end - _interval.start;

      let min = 0,
        max = 0,
        val = 0,
        offset = 0,
        maxindex = 0;

      const xZoom = len / width;

      const yZoom = height / 2;

      for (let i = 0; i < width; i++) {
        offset = Math.round(i * xZoom) + _interval.start;
        min = cha[offset];
        max = cha[offset];

        if (isNaN(cha[offset])) {
          break;
        }

        if ((offset + xZoom) > _interval.start + len) {
          maxindex = len;
        } else {
          maxindex = Math.round(offset + xZoom);
        }

        for (let j = offset; j < maxindex; j++) {
          val = cha[j];
          max = Math.max(max, val);
          min = Math.min(min, val);
        }

        if (this.Settings.round_values) {
          min_maxarray.push(Math.round(min * yZoom));
          min_maxarray.push(Math.round(max * yZoom));
        } else {
          min_maxarray.push(min * yZoom);
          min_maxarray.push(max * yZoom);
        }
      }

      return min_maxarray;
    } else {
      throw new Error('interval.end is less than interval.start');
    }
  }

  private calculateZoom(height: number, width: number, minmaxarray: number[]) {
    if (this.Settings.justify_signal_height) {
      // justify height to maximum top border
      let max_zoom_x = 0;
      let max_zoom_y = 0;
      const timeline_height = (this.Settings.timeline.enabled) ? this.Settings.timeline.height : 0;
      let max_zoom_y_min = height / 2;
      const x_max = this.AudioPxWidth;

      // get_max_signal_length
      for (let i = 0; i <= x_max; i++) {
        max_zoom_x = i;

        if (isNaN(minmaxarray[i])) {
          break;
        }
        max_zoom_y = Math.max(max_zoom_y, minmaxarray[i]);
        max_zoom_y_min = Math.min(max_zoom_y_min, minmaxarray[i]);
      }

      let rest = (height - timeline_height - (max_zoom_y + Math.abs(max_zoom_y_min)));
      rest = Math.floor(rest - 2);

      if (rest > 0) {
        this._zoomY = (rest / (max_zoom_y + Math.abs(max_zoom_y_min))) + 1;
        this._zoomY = Math.floor(this._zoomY * 10) / 10;
        this._zoomX = width / max_zoom_x;
      }
    } else {
      this._zoomY = 1;
    }
  }

  /**
   * after Channel was initialzed
   * @param innerWidth
   */
  private afterChannelInititialized(innerWidth: number, calculateZoom: boolean = true): Promise<void> {
    return this.refresh()
      .then(() => {
        if (calculateZoom) {
          this.calculateZoom(this.Settings.lineheight, this.AudioPxWidth, this._minmaxarray);
        }

        this.audiochunk.playposition = this.audiochunk.time.start.clone();
        this.updateLines(innerWidth);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
