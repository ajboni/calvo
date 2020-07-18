## DO NOT USE. WIP!

# Calvo 🧑🏼‍🦲

A [jalv](http://drobilla.net/software/jalv) based lv2 plugin host for your terminal.

# Description

Calvo is an LV2 plugin browser and host to stack plugins in a rack fashion.

It uses:

- [jalv](http://drobilla.net/software/jalv) to host plugins
- [lilv](http://drobilla.net/software/lilv) to get plugin data
- [blessed](https://github.com/chjj/blessed) for the UI.
- nodejs to glue all together

# Dependencies

JACK, Nodejs, lilv, jalv

# Settings
Modify `settings.js` with your settings, more info [in the docs](https://ajboni.github.io/calvo/module-settings.html).

# Keys

### Layout

- `TAB | Shift + TAB` Cycle between each widget.
- `1...9` Select menu option.

### Rack

- `enter` Select plugin for handling
- `delete | backspace` Remove plugin
- `CTRL + up/down` Swap plugins up/down


# DEV

### Initialize repo

```
git clone repo
git submodule init
git submodule update
npm install
npm start
```

### Documentation

Dev Documentation is available at: https://ajboni.github.io/calvo/

To build doc locally:
```
npm run document
```

documentation will be available at ./docs
@TODO: set up travis build to do this automatically
