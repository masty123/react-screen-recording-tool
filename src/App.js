import logo from './logo.svg';
import './App.css';
import './index.css';
import React, { Component, useRef } from 'react'
import ReactPlayer from 'react-player';
import captureVideoFrame from 'capture-video-frame';
import "react-video-trimmer/dist/style.css";
// import { ReactMediaRecorder } from "react-media-recorder";
// import CanvasDraw from 'react-canvas-draw';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ReactSketchCanvas } from "react-sketch-canvas";


const styles =  {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem",
  background: `url('../media/logo192.png')`,
};
 
// const Canvas = (props) => {
//   console.log(props);
//   return (
//     <ReactSketchCanvas
//       style={styles}
//       width="1280px"
//       height="720px"
//       strokeWidth={4}
//       strokeColor="red"
//       background={props.image}
//     />
//   );
// };


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

    this.canvas = React.createRef();
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

  // ------------------- image cropping section ------------------------ //
    
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
    

  render() {
    const { crop, croppedImageUrl, src } = this.state;

    return (
      <>
        {/* --------------- Video Player ---------------  */}
        <div className="video-player">
            <ReactPlayer 
              ref={player => { this.player = player }}
              // url="https://cdn.rawgit.com/mediaelement/mediaelement-files/4d21a042/big_buck_bunny.mp4" 
              url={"./media/gran_turismo.mp4"}
              // url={this.state.mediaUrl? this.state.mediaUrl : null}
              playing={this.state.playing}
              controls
              width='100%'
              height='100%'
              config={{ file: { attributes: {
                crossOrigin: 'anonymous'
              }}}}
              // crossOrigin={'anonymous'}
            />
            <div className="player-button">
              <button onClick={() => this.setState({ playing: !this.state.playing })}>{this.state.playing ? "Pause" : "Play"}</button>
              <button onClick={() => {
                  const frame = captureVideoFrame(this.player.getInternalPlayer())
                  console.log('captured frame', frame)
                  this.setState({ image: frame.dataUri })
                }}>Capture Frame</button>
            </div>
        {/* -------------------------------------------  */}
        </div>
        
        {/* <div className="drawing-canvas"> */}
          {this.state.image && 
            <ReactSketchCanvas
              strokeWidth={4}
              strokeColor="red"
              ref={this.canvas}
              width="850px"
              height="480px"
              style={{margin: "0 auto 0 auto", }}
              background={`url(${this.state.image}) no-repeat center`}
            />
          }
        {/* </div> */}
        <div className="get-image-button">
        <button  onClick={() => { this.canvas.current.exportImage("png").then(data => { this.setState({new_image: data}) }).catch(e => {   console.log(e); }); }}>
            Get Image
        </button>
        </div>
       {this.state.new_image && 
        <>
    

        {/* {this.state.new_image &&<img src={this.state.new_image}    width='850px'height='480px' />} */}


        {/* --------------- Cropping Section ---------------  */}
        <div className="crop-session">
          <ReactCrop
                  src={this.state.new_image? this.state.new_image   : null }
                  crop={crop}
                  ruleOfThirds
                  onImageLoaded={this.onImageLoaded}
                  onComplete={this.onCropComplete}
                  onChange={this.onCropChange}
                  brushRadius={2}
                />
          </div>
        <h2>Crop</h2>
           
        <div className="crop-result">
        {croppedImageUrl && (  <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} /> )}
        </div>
        </>
        }
      </>
      
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

//      {/* --------------- Drawing on image ---------------  */}
//      <h2>Drawing on Image</h2>

//      {this.state.image? 
//      <div style={{width: "1280px", height: "720px", margin: "2rem"}}>    
//            <button onClick={() =>  this.setState({  save_data: this.saveableCanvas.getSaveData() })} >
//            {/* <button onClick={() => {localStorage.setItem("savedDrawing", this.saveableCanvas.getSaveData());}}> */}
//              Save
//            </button>
//        <CanvasDraw
//          ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
//          brushColor="red"
//          imgSrc={this.state.image}
//        />
       
//      </div>
//      : null}


// {this.state.image && (
// <div style={{width: "1280px", height: "720px", margin: "2rem"}}>
//  <button onClick={this.exportImage}>Export</button>
// <CanvasDraw
//            disabled
//            hideGrid
//            imgSrc={this.state.image}
//            ref={canvasDraw => (this.loadableCanvas = canvasDraw)}
//            saveData={this.state.save_data}
//            // saveData={localStorage.getItem("savedDrawing")}
//          />  
// </div>
// )}