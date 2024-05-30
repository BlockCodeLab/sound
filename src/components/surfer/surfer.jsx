import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import { useRef, useEffect } from 'preact/hooks';
import { useLocale, useEditor } from '@blockcode/core';
import { classNames, Label, BufferedInput, Button } from '@blockcode/ui';
import { loadWaveFromBlob } from '../../lib/load-wave';

import styles from './surfer.module.css';
import recordIcon from '../selector/icon-record.svg';
import playIcon from './icon-play.svg';
import stopIcon from './icon-stop.svg';

export default function Painter({ soundList, soundIndex }) {
  const ref = useRef();
  const playRef = useRef();
  const recordRef = useRef();
  const { getText } = useLocale();
  const { modifyAsset } = useEditor();

  const soundAsset = soundList[soundIndex];
  const disabled = !soundAsset;

  if (ref.ws) {
    ref.ws.stop();
    ref.ws.setTime(0);
    setTimeout(() => {
      ref.ws.setOptions({
        cursorColor: 'hsla(215, 100%, 65%, 0)',
        cursorWidth: 0,
      });
    });
  }

  if (ref.record) {
    ref.record.soundAsset = soundAsset;
  }

  if (playRef.current) {
    playRef.current.src = playIcon;
    playRef.current.title = getText('waveSurfer.surfer.play', 'Play');
  }

  if (recordRef.current) {
    recordRef.current.src = recordIcon;
    recordRef.current.title = getText('waveSurfer.surfer.record', 'Record');
  }

  const handleChange = (key, value) => {
    modifyAsset({
      ...soundAsset,
      [key]: value,
    });
  };

  const handlePlayOrStop = () => {
    if (ref.ws) {
      if (ref.ws.isPlaying()) {
        ref.ws.stop();
      } else if (soundAsset.sampleCount > 0) {
        ref.ws.play();
      }
    }
    if (recordRef.current) {
      setTimeout(() => {
        const recordButton = recordRef.current.parentElement.parentElement;
        recordButton.disabled = ref.ws.isPlaying();
        if (ref.ws.isPlaying()) {
          recordButton.classList.add(styles.groupButtonToggledOff);
        } else {
          recordButton.classList.remove(styles.groupButtonToggledOff);
        }
      });
    }
  };

  const handlePlay = () => {
    if (playRef.current) {
      playRef.current.src = stopIcon;
      playRef.current.title = getText('waveSurfer.surfer.stop', 'Stop');
    }
    if (ref.ws) {
      ref.ws.setOptions({
        cursorColor: 'hsla(215, 100%, 65%, 1)',
        cursorWidth: 1,
      });
    }
    if (recordRef.current) {
      const recordButton = recordRef.current.parentElement.parentElement;
      recordButton.disabled = false;
      recordButton.classList.remove(styles.groupButtonToggledOff);
    }
  };

  const handlePause = () => {
    if (playRef.current) {
      playRef.current.src = playIcon;
      playRef.current.title = getText('waveSurfer.surfer.play', 'Play');
      if (ref.ws) {
        ref.ws.setTime(0);
        setTimeout(() => {
          ref.ws.setOptions({
            cursorColor: 'hsla(215, 100%, 65%, 0)',
            cursorWidth: 0,
          });
        });
      }
    }
    if (recordRef.current) {
      recordRef.current.src = recordIcon;
      recordRef.current.title = getText('waveSurfer.surfer.record', 'Record');

      const recordButton = recordRef.current.parentElement.parentElement;
      recordButton.disabled = false;
      recordButton.classList.remove(styles.groupButtonToggledOff);
    }
  };

  const handleSeeking = () => {
    if (ref.ws && !ref.record.isRecording()) {
      ref.ws.setOptions({
        cursorColor: 'hsla(215, 100%, 65%, 1)',
        cursorWidth: 1,
      });
    }
  };

  const handleRecord = () => {
    if (recordRef.current) {
      recordRef.current.src = stopIcon;
      recordRef.current.title = getText('waveSurfer.surfer.stop', 'Stop');
    }
    if (playRef.current) {
      const playButton = playRef.current.parentElement.parentElement;
      playButton.disabled = true;
      playButton.classList.add(styles.groupButtonToggledOff);
    }
  };

  let recordTimer;
  const handleRecordOrStop = () => {
    if (ref.record) {
      if (ref.record.isRecording()) {
        ref.record.stopRecording();
        ref.record.stopMic();
        clearTimeout(recordTimer);
      } else {
        ref.record.startRecording();
        recordTimer = setTimeout(handleRecordOrStop, 10000);
      }
    }
  };

  const handleRecordEnd = async (blob) => {
    const wav = await loadWaveFromBlob(blob);
    modifyAsset({
      ...ref.record.soundAsset,
      data: wav.toBase64(),
      sampleCount: wav.data.chunkSize,
    });

    if (playRef.current) {
      const playButton = playRef.current.parentElement.parentElement;
      playButton.disabled = false;
      playButton.classList.remove(styles.groupButtonToggledOff);
    }
  };

  if (soundAsset && ref.ws) {
    if (ref.ws.isPlaying()) {
      ref.ws.stop();
    }
    ref.ws.empty();
    if (soundAsset.sampleCount > 0) {
      ref.ws.load(`data:${soundAsset.type};base64,${soundAsset.data}`);
    }
  }

  useEffect(() => {
    if (ref.current) {
      ref.ws = WaveSurfer.create({
        container: ref.current,
        dragToSeek: true,
        height: 'auto',
        waveColor: 'hsla(300, 48%, 50%, 1)',
        progressColor: 'hsla(300, 48%, 50%, 0.8)',
        cursorColor: 'hsla(215, 100%, 65%, 0)',
        cursorWidth: 0,
      });
      ref.record = ref.ws.registerPlugin(RecordPlugin.create());
      ref.ws.on('play', handlePlay);
      ref.ws.on('pause', handlePause);
      ref.ws.on('finish', handlePause);
      ref.ws.on('seeking', handleSeeking);
      ref.record.on('record-start', handleRecord);
      ref.record.on('record-end', handleRecordEnd);
      if (soundAsset) {
        ref.ws.empty();
        if (soundAsset.sampleCount > 0) {
          ref.ws.load(`data:${soundAsset.type};base64,${soundAsset.data}`);
        }
        ref.record.soundAsset = soundAsset;
      }
    }
    return () => {
      if (ref.ws) {
        ref.ws.destroy();
      }
    };
  }, [ref]);

  return (
    <div
      className={classNames(styles.surferWrapper, {
        [styles.disabled]: disabled,
      })}
    >
      <div className={styles.row}>
        <div className={styles.group}>
          <Label text={getText('waveSurfer.surfer.sound', 'Sound')}>
            <BufferedInput
              disabled={disabled}
              className={styles.nameInput}
              placeholder={getText('waveSurfer.surfer.name', 'name')}
              onSubmit={(value) => handleChange('name', value)}
              value={soundAsset ? soundAsset.name : getText('waveSurfer.surfer.sound', 'Sound')}
            />
          </Label>
        </div>
      </div>

      <div className={styles.row}>
        <div
          ref={ref}
          className={styles.waveBoxWrapper}
        />
      </div>

      <div className={styles.row}>
        <Button
          className={classNames(styles.button, styles.playButton, {
            [styles.groupButtonToggledOff]: disabled,
          })}
          onClick={handlePlayOrStop}
        >
          <img
            ref={playRef}
            src={playIcon}
            className={styles.buttonIcon}
            title={getText('waveSurfer.surfer.play', 'Play')}
          />
        </Button>

        {soundAsset && soundAsset.record && (
          <Button
            className={classNames(styles.button, styles.recordButton, {
              [styles.groupButtonToggledOff]: disabled,
            })}
            onClick={handleRecordOrStop}
          >
            <img
              ref={recordRef}
              src={recordIcon}
              className={styles.buttonIcon}
              title={getText('waveSurfer.surfer.record', 'Record')}
            />
          </Button>
        )}
      </div>
    </div>
  );
}
