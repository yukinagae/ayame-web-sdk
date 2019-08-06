/* @flow */
import ConnectionBase from './base';

/*
 * Peer Connection 接続を管理するクラスです。
 */
class Connection extends ConnectionBase {
  /**
   * PeerConnection  接続を開始します。
   * @param {RTCMediaStream|null} stream ローカルのストリーム
   * @param {Object|null} authnMetadtta 送信するメタデータ
   * @return {Promise<RTCMediaStream|null>} stream ローカルのストリーム
   */
  async connect(stream: ?window.RTCMediaStream, authnMetadata: ?Object = null) {
    if (this._ws || this._pc) {
      this._traceLog('connection already exists');
      throw new Error('Connection Already Exists!');
    }
    this.stream = stream;
    this.authnMetadata = authnMetadata;
    await this._signaling();
    return stream;
  }

  /*
   * Datachannel を追加します。
   * @param {string} channelId dataChannel の Id
   * @param {Object|null} dataChannel の init オプション
   * @return {Promise<null>}
   */
  async addDataChannel(channelId: string, options: Object = undefined) {
    await this._addDataChannel(channelId, options);
  }

  /*
   * Datachannel を削除します。
   * @param {string} channelId 削除する dataChannel の Id
   * @return {Promise<null>}
   */
  async removeDataChannel(channelId: string) {
    this._traceLog('datachannel remove=>', channelId);
    const dataChannel = this._findDataChannel(channelId);
    if (dataChannel && dataChannel.readyState === 'open') {
      await this._closeDataChannel(dataChannel);
      return;
    } else {
      throw new Error('data channel is not exist or open');
    }
  }

  /*
   * Datachannel でデータを送信します。
   * @param {any} 送信するデータ
   * @param {string} channelId 指定する dataChannel の id
   * @return {null}
   */
  sendData(params: any, channelId: string = 'dataChannel') {
    this._traceLog('datachannel sendData=>', params);
    const dataChannel = this._findDataChannel(channelId);
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(params);
    } else {
      throw new Error('datachannel is not open');
    }
  }

  /**
   * PeerConnection  接続を切断します。
   * @return {Promise<void>}
   */
  async disconnect() {
    await this._disconnect();
  }
}

export default Connection;
