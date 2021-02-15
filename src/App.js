import logo from "./logo.svg";
import "./App.css";
import "./index.css";
import React, { Component, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import captureVideoFrame from "capture-video-frame";
import "react-video-trimmer/dist/style.css";
// import { ReactMediaRecorder } from "react-media-recorder";
// import CanvasDraw from 'react-canvas-draw';
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Canvas, ReactSketchCanvas } from "react-sketch-canvas";

import "literallycanvas/lib/css/literallycanvas.css";
import LiterallyCanvas from "literallycanvas";



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      image: null,
      src: null,
      mediaUrl: null,
      crop: {
        unit: "%",
        width: 30,
        aspect: 16 / 9,
      },
      save_data: "",
      load_data: null,
      new_image: null,

      duration: null,
      secondsElapsed: null,

      width: window.innerWidth,
      height: window.innerHeight,
      lcRef: null,
      lcimage: null,
      lc_result: null,
    };

    this.canvas = React.createRef();
  }

  setVideo(mediaItem) {
    // console.log(mediaItem);
    if (mediaItem != null && this.state.mediaUrl == null) {
      this.setState({
        mediaUrl: mediaItem,
      });
      console.log(mediaItem);
    }
  }

  setImage() {
    if (this.state.image != null) {
      return this.state.image;
    }
  }

  async loadData() {
    await this.setState({
      load_data: null,
    });

    await this.setState({
      load_data: this.state.save_data,
    });
  }

  // ------------------- image cropping section ------------------------ //

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        "newFile.jpeg"
      );
      this.setState({ croppedImageUrl });
    }
  }

  // If you setState the crop in here you should return false.
  onImageLoaded = (image) => {
    this.imageRef = image;
  };

  onCropComplete = (crop) => {
    this.makeClientCrop(crop);
  };

  onCropChange = (crop, percentCrop) => {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    this.setState({ crop });
  };

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

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
      canvas.toBlob((blob) => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, "image/jpeg");
    });
  }

  onDuration = (duration) => {
    this.setState({ duration });
  };

  onProgress = (progress) => {
    if (!this.state.duration) {
      // Sadly we don't have the duration yet so we can't do anything
      return;
    }

    // progress.played is the fraction of the video that has been played
    // so multiply with duration to get number of seconds elapsed
    const secondsElapsed = progress.played * this.state.duration;

    if (secondsElapsed !== this.state.secondsElapsed) {
      this.setState({ secondsElapsed });
    }
  };
  // -------------------------------------------------------- //

  getLCReference(lc) {
      this.setState({
        lcRef: lc,
      })
  }

  render() {
    const { crop, croppedImageUrl, src, width, height } = this.state;

    const backgroundImage = new Image();
    backgroundImage.src = this.state.image;

    return (
      <>
        {/* {this.exportLiterallyCanvasTest()} */}
        {/* --------------- Video Player ---------------  */}       
        <div className="video-player">
          <div className="video-section">
            <ReactPlayer
              ref={(player) => {
                this.player = player;
              }}
              // url="https://cdn.rawgit.com/mediaelement/mediaelement-files/4d21a042/big_buck_bunny.mp4"
              url={"./media/gran_turismo.mp4"}
              // url={this.state.mediaUrl? this.state.mediaUrl : null}
              playing={this.state.playing}
              style={{
                minHeight: "543px",                
                minWidth: "1000px"
              }}
              width="100%"
              height="100%"
              config={{
                file: {
                  attributes: {
                    crossOrigin: "anonymous",
                  },
                },
              }}
              onDuration={this.onDuration}
              onProgress={this.onProgress}
              // crossOrigin={'anonymous'}
            ></ReactPlayer>
           {this.state.image &&  
                    <LiterallyCanvas.LiterallyCanvasReactComponent 
                    imageURLPrefix="img"
                    onInit={(lc) => this.getLCReference(lc)}
                    backgroundShapes={[
                        LiterallyCanvas.createShape(
                            'Image', 
                            { 
                              x: 0, 
                              y: 0, 
                              image:  backgroundImage, 
                              scale:"1.135",
                            }),
                          ]
                      }   
                    />
            }
          </div>
        </div>

        <div className="player-button">
          <button
            onClick={() => {
                this.setState({ 
                    playing: !this.state.playing ,
                    image: null,
                    image_lc: null,
                })}
                
            }
          >
            {this.state.playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              const frame = captureVideoFrame(this.player.getInternalPlayer());
            //   console.log("captured frame", frame);
              this.setState({ 
                  image: frame.dataUri ,
                  playing: false,
                });
              console.log(frame.dataUri);
            }}
          >
            Capture Frame
          </button>
          <button
            onClick={() => { 
                    var image_lc =  this.state.lcRef.getImage().toDataURL();
                    console.log(image_lc);
                    this.setState({
                        lcimage: image_lc
                    })
                }
            }
          >
            Capture Drawing
          </button>
          <button
            onClick={() => {
            


            }}
          >
                Combine
          </button>
        </div>
        
        <div>
            <div className="time-section">
                  Duration:  {" "+this.state.duration}
                        <br></br>
                  Current time: {" "+this.state.secondsElapsed}
                        <br></br>
            </div>

            <div className="captured-section">
                {this.state.lcimage  && <img src={this.state.lcimage}/>}
            </div>

        </div>


        {/* -------------------------------------------  */}


        {/* --------------- Cropping Section ---------------  */}
        {/* {this.state.new_image &&
          <>
            <div className="crop-session">
              <ReactCrop
                src={this.state.new_image ? this.state.new_image : null}
                crop={crop}
                ruleOfThirds
                onImageLoaded={this.onImageLoaded}
                onComplete={this.onCropComplete}
                onChange={this.onCropChange}
                brushRadius={2}
              />
            </div>

            <div className="crop-result">
              <h2>Crop</h2>

              {croppedImageUrl && (<img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />)}
            </div>
          </>
        } */}
      </>
    );
  }
}

export default App;
