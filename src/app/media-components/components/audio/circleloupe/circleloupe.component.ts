import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {LoupeComponent} from '../loupe/loupe.component';
import {CircleLoupeService} from './circleloupe.service';
import {AudioChunk} from '../../../obj/media/audio/AudioChunk';

declare var window: any;

@Component({
  selector: 'app-circleloupe',
  templateUrl: './circleloupe.component.html',
  styleUrls: ['./circleloupe.component.css'],
  providers: [CircleLoupeService]
})

export class CircleLoupeComponent implements AfterViewInit, OnChanges {
  @ViewChild('loupe') loupe: LoupeComponent;

  @Input() audiochunk: AudioChunk;
  @Input() height: number;
  @Input() width: number;
  public pos: any = {
    x: 0,
    y: 0
  };
  private initialized = false;

  public get zoomY(): number {
    return this.loupe.zoomY;
  }

  public set zoomY(value: number) {
    this.loupe.zoomY = value;
  }

  get Settings(): any {
    return this.loupe.Settings;
  }

  set Settings(new_settings: any) {
    this.loupe.Settings = new_settings;
  }

  constructor() {
    this.height = 80;
    this.width = 80;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('height')) {
      if (!(this.loupe === null || this.loupe === undefined)) {
        this.loupe.Settings.lineheight = changes.height.currentValue;
        if ((this.loupe.Settings.lineheight === null || this.loupe.Settings.lineheight === undefined) || this.loupe.Settings.lineheight < 1) {
          this.loupe.Settings.lineheight = 80;
        }
        if (this.initialized) {
          this.loupe.update();
        }
      }
    }
  }

  ngAfterViewInit() {
    this.loupe.Settings.multi_line = false;
    this.loupe.Settings.justify_signal_height = false;
    this.loupe.Settings.boundaries.enabled = true;
    this.loupe.Settings.disabled_keys = [];
    this.loupe.Settings.type = 'line';
    this.loupe.Settings.backgroundcolor = 'white';
    this.loupe.Settings.frame.color = 'transparent';
    this.loupe.Settings.cropping = 'circle';
    this.loupe.Settings.margin.left = 0;
    this.loupe.Settings.margin.top = 0;
    this.loupe.Settings.margin.right = 0;
    this.loupe.Settings.margin.bottom = 0;
    this.loupe.Settings.lineheight = this.height;
    this.loupe.Settings.selection.enabled = false;
    this.loupe.Settings.shortcuts_enabled = false;
    this.loupe.Settings.boundaries.enabled = true;
    this.loupe.Settings.timeline.enabled = false;
    this.loupe.viewer.round_values = false;
    this.loupe.name = 'circleloupe';
    this.loupe.update();

    this.initialized = true;
  }

  public updateSegments() {
    this.loupe.update();
  }
}
