import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

import {AudioNavigationComponent, LoupeComponent, TranscrEditorComponent} from '../../component';
import {AudioService, KeymappingService, TranscriptionService, UserInteractionsService} from '../../shared/service';
import {AudioTime, Segment, SubscriptionManager} from '../../shared';
import {SettingsService} from '../../shared/service/settings.service';
import {AudioChunk} from '../../obj/media/audio/AudioChunk';
import {AudioManager} from '../../obj/media/audio/AudioManager';
import {AudioRessource} from '../../obj/media/audio/AudioRessource';
import {isNullOrUndefined} from 'util';
import {AudioSelection} from '../../obj/media/audio/AudioSelection';

@Component({
  selector: 'app-transcr-window',
  templateUrl: './transcr-window.component.html',
  styleUrls: ['./transcr-window.component.css']
})
export class TranscrWindowComponent implements OnInit, AfterContentInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('loupe') loupe: LoupeComponent;
  @ViewChild('editor') editor: TranscrEditorComponent;
  @ViewChild('audionav') audionav: AudioNavigationComponent;
  @ViewChild('window') window: ElementRef;

  @Output('act') act: EventEmitter<string> = new EventEmitter<string>();
  @Input('easymode') easymode = false;

  @Output('shortcuttriggered')
  get shortcuttriggered(): EventEmitter<string> {
    return this.loupe.shortcuttriggered;
  }

  @Output('marker_insert')
  get marker_insert(): EventEmitter<string> {
    return this.editor.marker_insert;
  }

  @Output('marker_click')
  get marker_click(): EventEmitter<string> {
    return this.editor.marker_click;
  }

  private showWindow = false;
  public pos_y = 0;
  private subscrmanager: SubscriptionManager;

  get app_settings(): any {
    return this.settingsService.app_settings;
  }

  get projectsettings(): any {
    return this.settingsService.projectsettings;
  }

  get responsive(): boolean {
    return this.settingsService.responsive.enabled;
  }

  get audiomanager(): AudioManager {
    return this.audiochunk.audiomanager;
  }

  get ressource(): AudioRessource {
    return this.audiochunk.audiomanager.ressource;
  }

  /*
   set SelectedSegment(segment: Segment) {
   this.transcrService.annotation.levels[0].segments.get(this.transcrService.selectedSegment.index).transcript;
   }
   */

  @Input() audiochunk: AudioChunk;
  @Input() segment_index: number;

  constructor(public keyMap: KeymappingService,
              public transcrService: TranscriptionService,
              public audio: AudioService,
              public uiService: UserInteractionsService,
              public settingsService: SettingsService) {

    this.subscrmanager = new SubscriptionManager();
  }

  ngOnInit() {
    this.editor.Settings.markers = this.transcrService.guidelines.markers;
    this.editor.Settings.responsive = this.settingsService.responsive.enabled;

    this.subscrmanager.add(this.editor.loaded.subscribe(
      () => {
        if (this.segment_index > -1 && this.transcrService.annotation.levels[0].segments &&
          this.segment_index < this.transcrService.annotation.levels[0].segments.length) {
          this.editor_rawText(this.transcrService.annotation.levels[0].segments.get(this.segment_index).transcript);
        }
      }
    ));

    this.subscrmanager.add(this.keyMap.onkeydown.subscribe(this.onKeyDown));
  }

  ngOnChanges(obj) {
    if (obj.hasOwnProperty('audiochunk')) {
      const previous: AudioChunk = obj.audiochunk.previousValue;
      const current: AudioChunk = obj.audiochunk.currentValue;

      if (!obj.audiochunk.firstChange) {
        if ((isNullOrUndefined(previous) && !isNullOrUndefined(current)) ||
          (current.time.start.samples !== previous.time.start.samples &&
            current.time.end.samples !== previous.time.end.samples)) {
          // audiochunk changed
          this.loupe.update();
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscrmanager.destroy();
  }

  ngAfterViewInit() {
    const segment: Segment = this.transcrService.annotation.levels[0].segments.get(this.segment_index);

    let begin = new AudioTime(0, this.audiomanager.ressource.info.samplerate);

    if (this.segment_index > 0) {
      begin = this.transcrService.annotation.levels[0].segments.get(this.segment_index - 1).time.clone();
    }

    this.loupe.Settings.boundaries.readonly = true;
    this.loupe.zoomY = 4;
    setTimeout(() => {
      this.audiochunk.startpos = this.audiochunk.time.start.clone();
      this.loupe.viewer.startPlayback();
    }, 500);
  }

  ngAfterContentInit() {
    this.act.emit('open');
  }

  public close() {
    this.showWindow = false;
    this.act.emit('close');
  }

  public open() {
    this.showWindow = true;
  }

  save() {
    if (this.segment_index > -1 && this.transcrService.annotation.levels[0].segments &&
      this.segment_index < this.transcrService.annotation.levels[0].segments.length) {
      const segment = this.transcrService.annotation.levels[0].segments.get(this.segment_index);
      segment.transcript = this.editor.rawText;
      this.transcrService.annotation.levels[0].segments.change(this.segment_index, segment);
    }
  }

  onButtonClick(event: { type: string, timestamp: number }) {
    if (this.projectsettings.logging.forced === true) {
      this.uiService.addElementFromEvent('mouse_click', {}, event.timestamp, event.type + '_button');
    }

    if (event.type === 'replay') {
      this.audionav.replay = !this.audionav.replay;
    }

    this.loupe.onButtonClick(event);
  }

  /**
   * selects the next segment on the left or on the right side
   * @param direction
   */
  goToSegment(direction: string) {
    if (this.segment_index > -1 && this.transcrService.annotation.levels[0].segments &&
      this.segment_index < this.transcrService.annotation.levels[0].segments.length) {
      let segment: Segment = this.transcrService.annotation.levels[0].segments.get(this.segment_index);

      if (direction === 'right' &&
        this.segment_index < this.transcrService.annotation.levels[0].segments.length - 1) {
        segment = this.transcrService.annotation.levels[0].segments.get(++this.segment_index);
      } else if (direction === 'left' && this.segment_index > 0) {
        segment = this.transcrService.annotation.levels[0].segments.get(--this.segment_index);
      }

      let begin = new AudioTime(0, this.audiomanager.ressource.info.samplerate);

      if (this.segment_index > 0) {
        begin = this.transcrService.annotation.levels[0].segments.get(this.segment_index - 1).time.clone();
      }

      this.editor.rawText = this.transcrService.annotation.levels[0].segments.get(this.segment_index).transcript;
      this.audiochunk = new AudioChunk(new AudioSelection(begin, segment.time.clone()), this.audiochunk.audiomanager);
    }
  }

  public editor_rawText(text: string) {
    this.editor.rawText = text;
  }

  onShortCutTriggered($event, type) {
    this.uiService.addElementFromEvent('shortcut', $event, Date.now(), type);
  }

  onMarkerInsert(marker_code: string) {
    this.uiService.addElementFromEvent('marker_insert', {value: marker_code}, Date.now(), 'editor');
  }

  onMarkerClick(marker_code: string) {
    this.uiService.addElementFromEvent('marker_click', {value: marker_code}, Date.now(), 'editor');
  }

  onSpeedChange(event: { old_value: number, new_value: number, timestamp: number }) {
    this.audiochunk.speed = event.new_value;
  }

  afterSpeedChange(event: { new_value: number, timestamp: number }) {
    if (this.projectsettings.logging.forced === true) {
      this.uiService.addElementFromEvent('slider', event, event.timestamp, 'speed_change');
    }
  }

  onVolumeChange(event: { old_value: number, new_value: number, timestamp: number }) {
    this.audiochunk.volume = event.new_value;
  }

  afterVolumeChange(event: { new_value: number, timestamp: number }) {
    if (this.projectsettings.logging.forced === true) {
      this.uiService.addElementFromEvent('slider', event, event.timestamp, 'volume_change');
    }
  }

  public doit = (direction: string) => {
    if (this.audiomanager.audioplaying) {
      this.loupe.viewer.stopPlayback();
    }
    this.save();
    if (direction !== 'down') {
      this.goToSegment(direction);
      setTimeout(() => {
        this.audiochunk.startpos = this.audiochunk.time.start.clone();
        this.loupe.viewer.startPlayback();
      }, 500);
    } else {
      this.save();
      this.close();
    }
  };

  onKeyDown = ($event) => {
    switch ($event.comboKey) {
      case ('SHIFT + ARROWRIGHT'):
        this.doit('right');
        break;
      case ('SHIFT + ARROWLEFT'):
        this.doit('left');
        break;
      case ('SHIFT + ARROWDOWN'):
        this.doit('down');
        break;
      case ('ESC'):
        this.doit('down');
        break;
    }
  }
}
