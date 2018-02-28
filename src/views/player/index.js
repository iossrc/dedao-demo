import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { config, isEmpty } from 'utils'

import Mini from './c/MiniPlayer'
import PlayerPage from './c/PlayerPage'
import styles from './style.less'

class PlayBar extends React.Component {
  videoEle = null;
  timer = null;
  getvideoEle = ele => {
    this.videoEle = ele
  };

  componentWillReceiveProps (nextProps) {
    const { status, audio, audioList } = nextProps
    if (audio !== this.props.audio) {
      const currentAudio = audioList.find(a => a.id === audio)
      if (!isEmpty(currentAudio)) {
        this.videoEle.src = currentAudio.audio_detail.mp3_play_url
        this.videoEle.currentTime = 0
        this.handlePlay()
      }
    } else if (status !== config.PLAYING) {
      this.handlePause()
    } else {
      this.handlePlay()
    }
  }

  componentWillUnmount () {
    this.videoEle = null
    clearInterval(this.timer)
    this.timer = null
  }

  handlePlay = () => {
    const { dispatch } = this.props
    if (this.timer) clearInterval(this.timer)
    this.videoEle.play()
    dispatch({ type: 'player/save', payload: { status: config.PLAYING, visible: true } })
    this.timer = setInterval(() => {
      const progress =
        +(this.videoEle.currentTime / this.videoEle.duration).toFixed(2) * 100 || 0
      dispatch({ type: 'player/save', payload: { progress: Math.ceil(progress) } })
    }, 1000)
  }

  handlePause = () => {
    if (this.timer) clearInterval(this.timer)
    const { dispatch } = this.props
    this.videoEle.pause()
    dispatch({ type: 'player/save', payload: { status: config.PAUSE } })
  }

  handlePlayEnded = () => {
    const { dispatch, infinite, audio, audioList } = this.props
    let status = config.STOP
    let nextAudio = audio
    if (infinite) {
      let nextIndex = (audioList.findIndex(a => a.id === audio)) + 1
      if (nextIndex === audioList.length) nextIndex = 0
      status = config.PLAYING
      nextAudio = audioList[nextIndex].id
    }
    dispatch({ type: 'player/save', payload: { status, progress: 0, audio: nextAudio } })
  }

  handlePlayToggle = () => {
    const { audio, audioList } = this.props
    if (audioList.find(a => a.id === audio)) {
      if (this.videoEle.paused) {
        this.handlePlay()
      } else {
        this.handlePause()
      }
    }
  }

  handleHidePlayer = () => {
    const { dispatch } = this.props
    dispatch({ type: 'player/save', payload: { visible: false } })
  }
  handlePanelChange = () => {
    const { dispatch, mini } = this.props
    dispatch({ type: 'player/save', payload: { mini: !mini } })
  }

  handleChangeCrtTime = disTime => {
    const { audio } = this.props
    if (audio) {
      let crtTime = Math.min(Math.max(this.videoEle.currentTime + disTime, 0), this.videoEle.duration)
      this.videoEle.currentTime = crtTime
      this.handlePlay()
    }
  }
  render () {
    const { mini, audio, audioList, loading, status, visible, progress } = this.props
    const currentAudio = audioList.find(a => a.id === audio) || {}
    const audioIndex = audioList.findIndex(a => a.id === audio) || 0
    const playerProps = { loading, status, audio: currentAudio, progress, audioIndex, audioList, onPanelChange: this.handlePanelChange }
    return (
      <div
        className={classNames(
          styles.playBar,
          mini ? styles.mini : styles.playerPage
        )}
        style={{ display: visible ? 'block' : 'none' }}
      >
        {mini
          ? <Mini {...playerProps} onClick={this.handlePlayToggle} onClose={this.handleHidePlayer} />
          : <PlayerPage {...playerProps}
            onAudioToggle={this.handlePlayToggle}
            onChangeCrtTime={this.handleChangeCrtTime}
            />}
        <video
          ref={this.getvideoEle}
          height="0"
          width="0"
          onEnded={this.handlePlayEnded}
          onError={this.handlePlayEnded}
        />
      </div>
    )
  }
}

function mapStateToProps ({ player }) {
  // const { loading, audio, mini, status, visible } = player
  return {
    ...player,
  }
}

export default connect(mapStateToProps)(PlayBar)
