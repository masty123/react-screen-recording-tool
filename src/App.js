import logo from './logo.svg';
import './App.css';
import './index.css';
import React from 'react'
import ReactPlayer from 'react-player';
import captureVideoFrame from 'capture-video-frame';
import "react-video-trimmer/dist/style.css";
import { ReactMediaRecorder } from "react-media-recorder";
import CanvasDraw from 'react-canvas-draw';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// const RecordView = () => (

// );

class App extends React.Component {
	constructor (props) {
  	super(props)
    this.state = {
    	playing: false,
      image: null,
      src: null,
      mediaUrl: null,
      crop: {
        unit: '%',
        width: 30,
        aspect: 16 / 9,
      },
    }
  }

  setVideo(mediaItem){
    // console.log(mediaItem);
    if(mediaItem != null && this.state.mediaUrl == null){
      this.setState({
        mediaUrl: mediaItem,
      })
     console.log(mediaItem);
    } 
  }

  setImage(){
    if(this.state.image != null){
        return this.state.image;
    }
  }

  // ------------------- image cropping section ------------------------
  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        'newFile.jpeg'
      );
      this.setState({ croppedImageUrl });
    }
  }

    // If you setState the crop in here you should return false.
    onImageLoaded = image => {
      this.imageRef = image;
    };
  
    onCropComplete = crop => {
      this.makeClientCrop(crop);
    };
  
    onCropChange = (crop, percentCrop) => {
      // You could also use percentCrop:
      // this.setState({ crop: percentCrop });
      this.setState({ crop });
    };

    getCroppedImg(image, crop, fileName) {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
  
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
  
      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (!blob) {
            //reject(new Error('Canvas is empty'));
            console.error('Canvas is empty');
            return;
          }
          blob.name = fileName;
          window.URL.revokeObjectURL(this.fileUrl);
          this.fileUrl = window.URL.createObjectURL(blob);
          resolve(this.fileUrl);
        }, 'image/jpeg');
      });
    }

      // --------------------------------------------------------

  render() {
    const { crop, croppedImageUrl, src } = this.state;
    return (
    	<div className="record-frame">
      <ReactPlayer 
          ref={player => { this.player = player }}
          // url="https://cdn.rawgit.com/mediaelement/mediaelement-files/4d21a042/big_buck_bunny.mp4" 
          // url={"./video/Simba.mp4"}
          url={this.state.mediaUrl? this.state.mediaUrl : null}
          playing={this.state.playing}
          width='320px'
          height='180px'
          // config={{ file: { attributes: {
          //   crossorigin: 'anonymous'
          // }}}}
          crossOrigin={'anonymous'}
        />
        <button onClick={() => this.setState({ playing: true })}>Play</button>
        <button onClick={() => this.setState({ playing: false })}>Pause</button>
        <button onClick={() => {
            const frame = captureVideoFrame(this.player.getInternalPlayer())
            console.log('captured frame', frame)
            this.setState({ image: frame.dataUri })
          }}>Capture Frame</button>
         <br />
        {this.state.image &&<img src={this.state.image} width='320px' />}


        {/* <RecordView/> */}
          {/* --------------- Recording tool ---------------  */}
         <ReactMediaRecorder
            screen
            render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
              <div className="text-center">
                <p>{status}</p>
                <div style={{alignContent: "center"}}>
                  {/* {mediaBlobUrl? <> <video src={mediaBlobUrl} controls loop   />  </>: null} */}
                </div>
                <button onClick={startRecording}>Start Recording</button>
                <button onClick={stopRecording}>Stop Recording</button>
                {this.setVideo(mediaBlobUrl)}
              </div>
            )}
          />

        {/* --------------- Drawing on image ---------------  */}
        <h2>Background Image</h2>
                <p>You can also set the `imgSrc` prop to draw on a background-image.</p>
                <p>
                  It will automatically resize to fit the canvas and centered vertically
                  & horizontally.
                </p>
                {this.state.image? 
                <div style={{width: "auto", height: "auto"}}>     
                  <CanvasDraw
                    brushColor="rgba(155,12,60,0.3)"
                    imgSrc={this.state.image}
                    
                  />
                     <button onClick={() => {
                      const frame = captureVideoFrame(this.state.image)
                      console.log('captured frame', frame)
                      this.setState({ src: frame.dataUri })
                    }}>Capture Drawing</button>
                </div>
                : null}

          {src && (
          <div style={{width: "640px", height: "480px"}}>
          <ReactCrop
            src={src? src: null}
            crop={crop}
            ruleOfThirds
            onImageLoaded={this.onImageLoaded}
            onComplete={this.onCropComplete}
            onChange={this.onCropChange}
          />
          </div>
        )}
        {croppedImageUrl && (
          <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />
        )}
    	</div>
    );
  }
}

export default App;
