# Migration from WaveformPlaylist to WaveSurfer.js

This document outlines the migration process from WaveformPlaylist to WaveSurfer.js for the NextKast MobileVT application.

## Overview

WaveformPlaylist is no longer actively maintained, and WaveSurfer.js provides a more modern and actively maintained alternative with similar functionality. This migration aims to:

1. Replace all WaveformPlaylist instances with WaveSurfer.js
2. Maintain backward compatibility where possible
3. Improve performance and reliability
4. Enable future enhancements

## Key Changes

### Files Added

- `wavesurfer.min.js` - The main WaveSurfer.js library
- `plugin/wavesurfer.timeline.min.js` - Timeline plugin
- `plugin/wavesurfer.regions.min.js` - Regions plugin for markers
- `plugin/wavesurfer.cursor.min.js` - Cursor plugin
- `plugin/wavesurfer.microphone.min.js` - Microphone plugin
- `wavesurfer-init.js` - Initialization script
- `migration-helper.js` - Compatibility layer
- `audioprocessing.js` - Audio processing utilities

### Files Modified

- `index.html` - Updated script references
- `eventmanager.js` - Replaced playlist initialization
- `recording.js` - Updated recording processing
- `audiometer.js` - Updated audio meter implementation
- `metareader.js` - Updated MP3 tag handling
- `importTrack.js` - Updated import functionality
- `volumecontrol.js` - Updated volume control

### API Changes

WaveSurfer.js has a different API than WaveformPlaylist. The key differences include:

- Event names (e.g., 'audioprocess' instead of 'timeupdate')
- Method names (e.g., 'seekTo' instead of 'seek')
- Plugin system for additional functionality

A compatibility layer has been implemented to maintain backward compatibility with existing code.

## Usage

### Basic WaveSurfer Initialization

```javascript
const wavesurfer = createWaveSurfer("container-id", {
  height: 100,
  waveColor: 'black',
  progressColor: '#4353FF',
  cursorColor: 'red'
});
```

### Loading Audio

```javascript
// Load from URL
wavesurfer.load('path/to/audio.mp3');

// Load from Blob
wavesurfer.loadBlob(audioBlob);
```

### Playback Control

```javascript
// Play
wavesurfer.play();

// Pause
wavesurfer.pause();

// Stop (seek to beginning and pause)
wavesurfer.stop();

// Seek to position (0-1)
wavesurfer.seekTo(0.5); // Seek to 50%
```

### Adding Markers/Regions

```javascript
wavesurfer.regions.addRegion({
  start: 5, // seconds
  end: 5.1, // seconds
  color: 'rgba(255, 0, 0, 0.5)',
  data: {
    type: 'marker'
  }
});
```

## Known Issues

- Some visual differences in waveform rendering
- Timeline markers may appear slightly different
- Performance may vary on older devices

## Future Enhancements

- Improved mobile support
- Better visualization options
- Enhanced marker functionality
- WebAssembly audio processing