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

# Keys

### Layout

- `TAB | Shift + TAB` Cycle between each widget.
- `1...9` Select menu option.

### Rack

- `enter` Select plugin for handling
- `delete | backspace` Remove plugin

# DEV

### Initialize repo

```
git clone repo
git submodule init
git submodule update
npm install
npm start
```

### Generate documentation

```
npm run document
```

documentation will be available at ./docs
@TODO: set up travis build to do this automatically
