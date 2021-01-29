import logo from './logo.svg';
import './App.css';
import './index.css';
import React, { Component, useRef } from 'react'
import ReactPlayer from 'react-player';
import captureVideoFrame from 'capture-video-frame';
import "react-video-trimmer/dist/style.css";
import { ReactMediaRecorder } from "react-media-recorder";
import CanvasDraw from 'react-canvas-draw';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
      save_data: "",
      load_data: null,
      new_image: null,

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

  async loadData(){
    await this.setState({
      load_data : null,
    })

    await this.setState({
      load_data : this.state.save_data,
    })
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
    // -------------------------------------------------------- //
    
    exportImage(){
      // var image = this.state.save_data.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
      // window.location.href = image;
    }

  render() {
    const { crop, croppedImageUrl, src } = this.state;

    return (
      
    	<div className="record-frame">
        {/* --------------- Video Player ---------------  */}

        <ReactPlayer 
          ref={player => { this.player = player }}
          // url="https://cdn.rawgit.com/mediaelement/mediaelement-files/4d21a042/big_buck_bunny.mp4" 
          url={"./media/gran_turismo.mp4"}
          // url={this.state.mediaUrl? this.state.mediaUrl : null}
          playing={this.state.playing}
          width='320px'
          height='180px'
          config={{ file: { attributes: {
            crossorigin: 'anonymous'
          }}}}
          // crossOrigin={'anonymous'}
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
       
        {/* --------------- Drawing on image ---------------  */}
            <h2>Drawing on Image</h2>

                {this.state.image? 
                <div style={{width: "1280px", height: "720px", margin: "2rem"}}>    
                      <button onClick={() =>  this.setState({  save_data: this.saveableCanvas.getSaveData() })} >
                      {/* <button onClick={() => {localStorage.setItem("savedDrawing", this.saveableCanvas.getSaveData());}}> */}
                        Save
                      </button>
                  <CanvasDraw
                    ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
                    brushColor="red"
                    imgSrc={this.state.image}
                  />
                  
                </div>
                : null}


          {this.state.image && (
          <div style={{width: "1280px", height: "720px", margin: "2rem"}}>
           {/* <button onClick={() => {this.loadableCanvas.loadSaveData(localStorage.getItem("savedDrawing"));}}>Load Image</button> */}
            <button onClick={this.exportImage}>Export</button>
           <CanvasDraw
                      disabled
                      hideGrid
                      imgSrc={this.state.image}
                      ref={canvasDraw => (this.loadableCanvas = canvasDraw)}
                      saveData={this.state.save_data}
                      // saveData={localStorage.getItem("savedDrawing")}
                    />  
          </div>
        )}
        <div>

        {/* --------------- Cropping Section ---------------  */}

          <ReactCrop
                  src={this.state.image? this.state.image   : null }
                  crop={crop}
                  ruleOfThirds
                  onImageLoaded={this.onImageLoaded}
                  onComplete={this.onCropComplete}
                  onChange={this.onCropChange}
                  brushRadius={2}
                />

        <h2>Crop</h2>
           
        {croppedImageUrl && (
          <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />
        )}

        </div>

      </div>
      
    );
  }
}

export default App;


   
   {/* --------------- Recording tool ---------------  */}
//    <ReactMediaRecorder
//    screen
//    render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
//      <div className="text-center">
//        <p>{status}</p>
//        <div style={{alignContent: "center"}}>
//          {/* {mediaBlobUrl? <> <video src={mediaBlobUrl} controls loop   />  </>: null} */}
//        </div>
//        <button onClick={startRecording}>Start Recording</button>
//        <button onClick={stopRecording}>Stop Recording</button>
//        {this.setVideo(mediaBlobUrl)}
//      </div>
//    )}
//  />