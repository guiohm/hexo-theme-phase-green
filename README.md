# Phase

Feel the flow of time with Phase, the most beautiful theme for [Hexo].
This is a fork from the [original phase theme](https://github.com/hexojs/hexo-theme-phase). You may find a demo [here](http://guilhaume.fr/blog/). The main changes are:
- Color is now green
- Added french language support
- Added polygons support into phasebeam
- Added a shutdown timer with friction into phasebeam so that it does not keep moving and using CPU/GPU ressources
- Removed controls in the gallery widget when only one image.
- Added an exerpts link feature
- Improved open graph tags + add default site image
- Fixed gallery photos url
- Added sharing on article but not home page
- Fixed comments
- Add direct facebook and google plus sharing buttons on article
- Added blog main title

## Install

Execute the following command and modify `theme` in `_config.yml` to `phase-green`.

```
git clone git://github.com/guiohm/hexo-theme-phase-green.git themes/phase-green
cp themes/phase-green/_config.yml.tpl themes/phase-green/_config.yml
```

## Update

Execute the following command to update the theme.

```
cd themes/phase-green
git pull
```

Then check any new option in `_config.yml.tpl` and report any change in your unversionned file.

## Features

- [Phase Beam](https://www.youtube.com/watch?v=NhCXnWeXDT0) live background.
- Read `alt` property of photos and add it below photos.
- Built-in [Fancybox](http://fancyapps.com/fancybox/) enables you to show your works easily.
- Resize HTML5 `video` and embedded video like `iframe`, `object` to page width automatically.

[Hexo]: http://hexo.io
