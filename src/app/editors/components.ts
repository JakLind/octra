import {TwoDEditorComponent} from './2D-editor/2D-editor.component';
import {LinearEditorComponent} from './linear-editor/linear-editor.component';
import {DictaphoneEditorComponent} from './dictaphone-editor/dictaphone-editor.component';
import {SpeechToTextEditorComponent} from './speech-to-text-editor/speech-to-text-editor.component';

export const EditorComponents = [
  {
    name: DictaphoneEditorComponent.editorname,
    editor: DictaphoneEditorComponent,
    translate: 'interfaces.simple editor',
    icon: 'minus'
  },
  {
    name: LinearEditorComponent.editorname,
    editor: LinearEditorComponent,
    translate: 'interfaces.linear editor',
    icon: 'window-maximize'
  },
  {
    name: TwoDEditorComponent.editorname,
    editor: TwoDEditorComponent,
    translate: 'interfaces.2D editor',
    icon: 'align-justify'
  },
  {
    name: SpeechToTextEditorComponent.editorname,
    editor: SpeechToTextEditorComponent,
    translate: 'interfaces.Speech-to-text editor',
    icon: 'window-maximize'
  }
];
