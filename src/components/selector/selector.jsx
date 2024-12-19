import { batch } from '@preact/signals';
import { nanoid } from '@blockcode/utils';
import {
  useTranslator,
  useProjectContext,
  translate,
  setAlert,
  delAlert,
  openAsset,
  addAsset,
  delAsset,
} from '@blockcode/core';
import { loadSoundFromFile } from '../../lib/load-sound';
import { formatTime } from '../../lib/format-time';

import { Text, IconSelector, ActionButton } from '@blockcode/core';
import styles from './selector.module.css';

import thumbIcon from './icons/icon-thumb.svg';
import soundIcon from './icons/icon-sound.svg';
import searchIcon from './icons/icon-search.svg';
import recordIcon from './icons/icon-record.svg';
import surpriseIcon from './icons/icon-surprise.svg';
import fileUploadIcon from './icons/icon-file-upload.svg';
import { useCallback } from 'preact/hooks';

export function Selector({ onShowLibrary, onSurprise }) {
  const translator = useTranslator();
  const { assets, assetId } = useProjectContext();

  const sounds = assets.value.filter((res) => /^audio\//.test(res.type));

  // 默认打开第一个声音
  if (!sounds.find((sound) => sound.id === assetId.value) && sounds[0]) {
    openAsset(sounds[0].id);
  }

  const handleUploadFile = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.wav,.mp3';
    fileInput.multiple = true;
    fileInput.click();
    fileInput.addEventListener('change', async (e) => {
      const alertId = nanoid();
      setAlert('importing', { id: alertId });

      try {
        for (const file of e.target.files) {
          const wavId = nanoid();
          const wavName = file.name.slice(0, file.name.lastIndexOf('.'));
          const data = await loadSoundFromFile(file);
          addAsset({
            ...data,
            id: wavId,
            name: wavName,
          });
        }
      } catch (err) {
        setAlert(
          {
            id: alertId,
            message: (
              <Text
                id="sound.error.formatNotSupperted"
                defaultMessage="This wav format is not supported."
              />
            ),
          },
          2000,
        );
      }

      delAlert(alertId);
    });
  }, []);

  const handleRecordSound = useCallback(() => {
    const soundId = nanoid();
    batch(() => {
      addAsset({
        id: soundId,
        type: 'audio/mp3',
        name: translate('sound.sound', 'Sound', translator),
        data: '',
        rate: 22050,
        sampleCount: 0,
        record: true,
      });
      openAsset(soundId);
    });
  }, []);

  const handleDeleteSound = useCallback((i) => delAsset(sounds[i].id), [sounds]);

  const wrapDeleteSound = useCallback((i) => () => delAsset(sounds[i].id), [sounds]);

  return (
    <div className={styles.selectorWrapper}>
      <IconSelector
        displayOrder
        id="sound-selector"
        className={styles.selectorItemsWrapper}
        items={sounds.map((sound, i) => ({
          ...sound,
          details: `${formatTime(sound.sampleCount / sound.rate) || 0}`,
          icon: thumbIcon,
          order: i,
          className: styles.selectorItem,
          contextMenu: [
            [
              {
                label: (
                  <Text
                    id="sound.contextMenu.export"
                    defaultMessage="export"
                  />
                ),
                disabled: true,
              },
            ],
            [
              {
                label: (
                  <Text
                    id="sound.contextMenu.delete"
                    defaultMessage="delete"
                  />
                ),
                className: styles.deleteMenuItem,
                disabled: sounds.length <= 1,
                onClick: wrapDeleteSound(i),
              },
            ],
          ],
        }))}
        selectedId={assetId.value}
        onSelect={(i) => openAsset(sounds[i].id)}
        onDelete={handleDeleteSound}
      />

      <div className={styles.addButtonWrapper}>
        <ActionButton
          tooltipPlacement="right"
          className={styles.addButton}
          icon={soundIcon}
          tooltip={
            <Text
              id="sound.actionButton.sound"
              defaultMessage="Choose a Sound"
            />
          }
          onClick={onShowLibrary}
          moreButtons={[
            {
              icon: fileUploadIcon,
              tooltip: (
                <Text
                  id="sound.actionButton.upload"
                  defaultMessage="Upload Sound"
                />
              ),
              onClick: handleUploadFile,
            },
            {
              icon: surpriseIcon,
              tooltip: (
                <Text
                  id="sound.actionButton.surprise"
                  defaultMessage="Surprise"
                />
              ),
              onClick: onSurprise,
            },
            {
              icon: recordIcon,
              tooltip: (
                <Text
                  id="sound.actionButton.record"
                  defaultMessage="Record"
                />
              ),
              onClick: handleRecordSound,
            },
            {
              icon: searchIcon,
              tooltip: (
                <Text
                  id="sound.actionButton.sound"
                  defaultMessage="Choose a Sound"
                />
              ),
              onClick: onShowLibrary,
            },
          ]}
        />
      </div>
    </div>
  );
}
