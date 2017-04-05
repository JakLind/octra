# OCTRA

This is a web-application for the orthographic transcription of longer
audiofiles. It uses three editors for the orthographic transcription:

* Editor without signaldisplay: An typical, easy-to-use editor with just a texteditor and an audioplayer.
* Linear-Editor: This editor shows two signaldisplays: One for the whole view of the signal and one as loupe. You can set boundaries and define segments.
* 2D-Editor: This editor breaks the whole view of the signal to pieces and shows the pieces as lines one after one. Here you can set boundaries und define segments too.

One special feature of OCTRA is that it saves your proceedings automatically in your browser. If the browser is closed (abruptly) you can continue your transcription without data-loss.

## Remarks
At the moment, OCTRA can only be used locally. Please notice that OCTRA is still in development and could be buggy.

## Production Use
In a production environment you don't need to compile OCTRA again. Just copy the content of the ``dist`` folder to your http-server. __Do not override your old config.json and markers.json__.

Before you can use OCTRA duplicate and rename `config_sample.json` to `config.json`.Please make sure, that you offer all translation files for any language you defined in config.json. If you had another config files before make sure to keep these files. To make sure that the strucure of your config files are valid in the new version please compare these with the new *_sample.json files

## Translation
To translate OCTRA to a new language you need to create these new files:

* assets/i18n/octra_<language code>.json
* assets/guidelines/guidelines_<language code>.json

The easiest way to translate to a new language is to duplicate e.g. english files and overwrite their contents with the new translations. __Please translate the right side only__:

For example (Translation English -> German):

English:

```
[...]
"continue": "continue"
[...]
```

German:

```
[...]
"continue": "weiter"
[...]
```

## Installation (Development Use)
On the Development level OCTRA requires Node 6.9.0 or higher, together with NPM 3 or higher.

Then you can install OCTRA:

1. Go to your octra directory via Terminal (or GitBash on Windows)
2. Call `` npm install ``
3. Wait.
4. Duplicate the file ``src/app/app.config.sample.ts`` and rename it to ``src/app/app.config.ts``. In app.config.ts you can change the settings of your instance of OCTRA.
5. After the installation you can call `` npm start `` to start the node server.
6. After that please read the notice about the config files in the production use section

## Used third-party packages:
* angular-cli: https://github.com/angular/angular-cli
* summernote: https://github.com/summernote/summernote
* bootstrap: http://getbootstrap.com/
* bootstrap-material-design: http://fezvrasta.github.io/bootstrap-material-design/
* glyphicons (in bootstrap package): http://glyphicons.com/
* ng2-webstorage: https://github.com/PillowPillow/ng2-webstorage
* browser-signal-processing: https://www.npmjs.com/package/browser-signal-processing
* ng2-bs3-modal: https://github.com/dougludlow/ng2-bs3-modal
* platform: https://github.com/bestiejs/platform.js/