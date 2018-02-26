import React from 'react'
import { Icon, Loading, PlayButton } from 'components'
import { config } from 'utils'
import styles from '../style.less'

export default function Mini ({
  loading,
  audio,
  onClick,
  status,
  progress,
}) {
  const statusIcon = status === config.PLAYING
  const { detail } = audio
  return (
    <div className={styles.miniContent}>
      <Icon type={config.icon.close} />
      <div className={styles.audioInfo}>
        <img src={detail.icon} alt="cover" />
        <div>
          <h4>{ detail.title }</h4>
          <p>{ detail.share_title }</p>
        </div>
      </div>
      <Icon type={config.icon.arrow} style={{ transform: 'rotate(-90deg)' }} />
      {
        loading ? <Loading tip="" /> : <PlayButton status={statusIcon} progress={progress} onClick={onClick} />
       }
    </div>
  )
}