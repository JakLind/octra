import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoupeComponent} from './components/audio/loupe';
import {CircleLoupeComponent} from './components/audio/circleloupe';
import {AudioviewerComponent, AudioviewerDirective} from './components/audio/audioviewer';
import {AudioNavigationComponent} from './components/audio/audio-navigation';
import {AudioplayerComponent, AudioplayerDirective} from './components/audio/audioplayer';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LeadingNullPipe, ProcentPipe, SecondsPipe, TimespanPipe} from './pipe';
import {Timespan2Pipe} from './pipe/timespan2.pipe';
// icons
import {library} from '@fortawesome/fontawesome';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {
  faClock,
  faForward,
  faPause,
  faPlay,
  faRetweet,
  faStepBackward,
  faStepForward,
  faStop,
  faVolumeDown,
  faVolumeUp
} from '@fortawesome/fontawesome-free-solid';

library.add(faPlay, faPause, faStop, faForward, faStepForward, faStepBackward, faRetweet, faClock, faVolumeUp, faVolumeDown);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  declarations: [
    AudioNavigationComponent,
    AudioplayerComponent,
    AudioplayerDirective,
    AudioviewerComponent,
    AudioviewerDirective,
    CircleLoupeComponent,
    LoupeComponent,
    ProcentPipe,
    TimespanPipe,
    SecondsPipe,
    LeadingNullPipe,
    Timespan2Pipe
  ],
  exports: [
    CommonModule,
    AudioNavigationComponent,
    AudioplayerComponent,
    AudioplayerDirective,
    AudioviewerComponent,
    AudioviewerDirective,
    CircleLoupeComponent,
    LoupeComponent,
    SecondsPipe,
    LeadingNullPipe,
    TimespanPipe,
    Timespan2Pipe
  ]
})
export class MediaComponentsModule {
}
