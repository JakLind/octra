import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';

import { AudioNavigationComponent, AudioplayerComponent, TranscrEditorComponent } from "../../component";
import { AudioService, KeymappingService, TranscriptionService, UserInteractionsService } from "../../service";
import { SubscriptionManager } from "../../shared";
import { SettingsService } from "../../service/settings.service";

@Component({
	selector   : 'app-audioplayer-gui',
	templateUrl: './audioplayer-gui.component.html',
	styleUrls  : [ './audioplayer-gui.component.css' ]
})
export class AudioplayerGUIComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild("nav") nav: AudioNavigationComponent;
	@ViewChild("audioplayer") audioplayer: AudioplayerComponent;
	@ViewChild('transcr') editor: TranscrEditorComponent;

	private subscrmanager: SubscriptionManager;

	public get NavShortCuts() {
		return this.nav.shortcuts;
	}

	public set NavShortCuts(value: any) {
		this.nav.shortcuts = value;
	}

	public get settings(): any {
		return this.audioplayer.settings;
	}

	public set settings(value: any) {
		this.audioplayer.settings = value;
	}

	private get app_settings():any{
		return this.settingsService.app_settings;
	}

	constructor(private audio: AudioService,
				private keyMap: KeymappingService,
				private transcr: TranscriptionService,
				private uiService: UserInteractionsService,
				private settingsService:SettingsService
	) {
		this.subscrmanager = new SubscriptionManager();
	}

	ngOnInit() {
		this.settings.shortcuts = this.keyMap.register("AP", this.settings.shortcuts);
		this.nav.shortcuts = this.settings.shortcuts;
		this.editor.Settings.markers = this.settingsService.markers.items;
		this.editor.Settings.responsive = this.settingsService.app_settings.octra.responsive.enabled;
	}

	ngAfterViewInit() {
		if (this.transcr.segments.length > 0) {
			this.editor.rawText = this.transcr.segments.get(0).transcript;
		}
		this.editor.Settings.height = 300;
		this.editor.update();
	}

	ngOnDestroy() {
		this.subscrmanager.destroy();
	}

	onButtonClick(event: { type: string, timestamp: number }) {
		if (this.app_settings.octra.logging_enabled == true)
			this.uiService.addElementFromEvent("mouse_click", {}, event.timestamp, event.type + "_button");

		switch (event.type) {
			case("play"):
				this.audioplayer.startPlayback();
				break;
			case("pause"):
				this.audioplayer.pausePlayback();
				break;
			case("stop"):
				this.audioplayer.stopPlayback();
				break;
			case("replay"):
				this.nav.replay = this.audioplayer.rePlayback();
				break;
			case("backward"):
				this.audioplayer.stepBackward();
				break;
			case("default"):
				break;
		}
	}

	onSpeedChange(event: { old_value: number, new_value: number, timestamp: number }) {
		this.audio.speed = event.new_value;
	}

	afterSpeedChange(event: { new_value: number, timestamp: number }) {
		if (this.app_settings.octra.logging_enabled == true)
			this.uiService.addElementFromEvent("slider", event, event.timestamp, "speed_change");
	}

	onVolumeChange(event: { old_value: number, new_value: number, timestamp: number }) {
		this.audio.volume = event.new_value;
	}

	afterVolumeChange(event: { new_value: number, timestamp: number }) {
		if (this.app_settings.octra.logging_enabled == true)
			this.uiService.addElementFromEvent("slider", event, event.timestamp, "volume_change");
	}

	updateSegment($event) {
		let segment = this.transcr.segments.get(0);
		segment.transcript = this.editor.getRawText();
		this.transcr.segments.change(0, segment);
	}

	onShortcutTriggered(event) {
		if (this.app_settings.octra.logging_enabled == true)
			this.uiService.addElementFromEvent("shortcut", event, Date.now(), 'audioplayer');
	}

	onMarkerInsert(marker_code: string) {
		if (this.app_settings.octra.logging_enabled == true)
			this.uiService.addElementFromEvent("marker_insert", { value: marker_code }, Date.now(), 'editor');
	}

	onMarkerClick(marker_code: string) {
		this.updateSegment(null);
		if (this.app_settings.octra.logging_enabled == true)
			this.uiService.addElementFromEvent("marker_click", { value: marker_code }, Date.now(), 'editor');
	}
}
