import { useState } from 'preact/hooks';
import { useLocale, useLayout, useEditor } from '@blockcode/core';
import { IconSelector, ActionButton } from '@blockcode/ui';
import { loadWave, uploadWave } from '../../lib/load-wave';
import formatTime from '../../lib/format-time';
import uid from '../../lib/uid';

import styles from './selector.module.css';
import thumbIcon from './icon-thumb.svg';
import soundIcon from './icon-sound.svg';
import searchIcon from './icon-search.svg';
import recordIcon from './icon-record.svg';
import surpriseIcon from './icon-surprise.svg';
import fileUploadIcon from './icon-file-upload.svg';

export default function Selector({ soundList, soundIndex, onSelect, onSetupLibrary }) {
  const [soundsLibrary, setSoundsLibrary] = useState(false);
  const { getText } = useLocale();
  const { createAlert, removeAlert } = useLayout();
  const { addAsset, deleteAsset } = useEditor();

  const { SoundsLibrary } = onSetupLibrary();

  const handleShowLibrary = () => setSoundsLibrary(true);
  const handleCloseLibrary = () => setSoundsLibrary(false);

  const handleSelectAsset = async (asset) => {
    const assetId = uid();
    createAlert('importing', { id: assetId });

    const wav = await loadWave(`./assets/${asset.id}.wav`);
    addAsset({
      ...asset,
      id: assetId,
      type: 'audio/wav',
      data: wav.toBase64(),
      sampleCount: wav.data.chunkSize,
    });
    removeAlert(assetId);

    onSelect(soundList.length);
  };

  const handleSurprise = () => handleSelectAsset(SoundsLibrary.surprise());

  const handleUploadFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/wav';
    fileInput.multiple = true;
    fileInput.click();
    fileInput.addEventListener('change', async (e) => {
      const alertId = uid();
      createAlert('importing', { id: alertId });

      try {
        for (const file of e.target.files) {
          const wavId = uid();
          const wavName = file.name.slice(0, file.name.lastIndexOf('.'));
          const wav = await uploadWave(file);
          console.log(wav);
          addAsset({
            id: wavId,
            type: file.type,
            name: wavName,
            data: wav.toBase64(),
            rate: wav.fmt.sampleRate,
            sampleCount: wav.data.chunkSize,
          });
        }
        removeAlert(alertId);
      } catch (err) {
        createAlert(
          {
            id: alertId,
            message: getText('waveSurfer.error.formatNotSupperted', 'This wav format is not supported.'),
          },
          2000,
        );
      }
    });
  };

  const handleRecordSound = () => {
    addAsset({
      id: uid(),
      type: 'audio/wav',
      name: getText(`waveSurfer.surfer.sound`, 'Sound'),
      data: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=',
      rate: 11025,
      sampleCount: 0,
      record: true,
    });
    onSelect(soundList.length);
  };

  const handleDeleteSound = (index) => {
    deleteAsset(soundList[index].id);
  };

  return (
    <div className={styles.selectorWrapper}>
      <IconSelector
        displayOrder
        id="paint-selector"
        className={styles.selectorItemsWrapper}
        items={soundList.map((sound, index) => ({
          ...sound,
          details: `${formatTime(sound.sampleCount / sound.rate || 0)}`,
          icon: thumbIcon,
          order: index,
          className: styles.selectorItem,
          contextMenu: [
            [
              {
                label: getText('waveSurfer.contextMenu.export', 'export'),
                disabled: true,
              },
            ],
            [
              {
                label: getText('waveSurfer.contextMenu.delete', 'delete'),
                className: styles.deleteMenuItem,
                disabled: soundList.length <= 1,
                onClick: () => handleDeleteSound(index),
              },
            ],
          ],
        }))}
        selectedIndex={soundIndex}
        onSelect={onSelect}
        onDelete={handleDeleteSound}
      />

      <div className={styles.addButtonWrapper}>
        <ActionButton
          tooltipPlacement="right"
          className={styles.addButton}
          icon={soundIcon}
          tooltip={getText('waveSurfer.actionButton.sound', 'Choose a Sound')}
          onClick={handleShowLibrary}
          moreButtons={[
            {
              icon: fileUploadIcon,
              tooltip: getText('waveSurfer.actionButton.upload', 'Upload Sound'),
              onClick: handleUploadFile,
            },
            {
              icon: surpriseIcon,
              tooltip: getText('waveSurfer.actionButton.surprise', 'Surprise'),
              onClick: handleSurprise,
            },
            {
              icon: recordIcon,
              tooltip: getText('waveSurfer.actionButton.record', 'Record'),
              onClick: handleRecordSound,
            },
            {
              icon: searchIcon,
              tooltip: getText('waveSurfer.actionButton.sound', 'Choose a Sound'),
              onClick: handleShowLibrary,
            },
          ]}
        />
      </div>

      {soundsLibrary && SoundsLibrary && (
        <SoundsLibrary
          onClose={handleCloseLibrary}
          onSelect={handleSelectAsset}
        />
      )}
    </div>
  );
}
