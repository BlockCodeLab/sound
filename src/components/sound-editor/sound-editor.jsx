import { Selector } from '../selector/selector';
import { Wave } from '../wave/wave';

import styles from './sound-editor.module.css';

export function SoundEditor({ onShowLibrary, onSurprise }) {
  return (
    <div className={styles.waveEditorWrapper}>
      <Selector
        onShowLibrary={onShowLibrary}
        onSurprise={onSurprise}
      />

      <Wave />
    </div>
  );
}
