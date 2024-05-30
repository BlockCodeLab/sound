import { useState } from 'preact/hooks';
import { useEditor } from '@blockcode/core';

import Selector from './components/selector/selector';
import Surfer from './components/surfer/surfer';

import styles from './wave-surfer.module.css';

export function WaveSurfer({ onSetupLibrary }) {
  const [soundIndex, setSoundIndex] = useState(0);
  const { assetList } = useEditor();

  const soundList = assetList.filter((asset) => /^audio\//.test(asset.type));
  const recordIndex = soundList.findLastIndex((sound) => sound.record && sound.sampleCount === 0);
  if (recordIndex !== -1) setSoundIndex(recordIndex);

  return (
    <div className={styles.waveSurferWrapper}>
      <Selector
        soundList={soundList}
        soundIndex={soundIndex}
        onSelect={setSoundIndex}
        onSetupLibrary={onSetupLibrary}
      />

      <Surfer
        soundList={soundList}
        soundIndex={soundIndex}
      />
    </div>
  );
}
