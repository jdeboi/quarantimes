import React, { Component } from 'react';
import "./WetStreams.css";

///////////////////// Babylon
import { Scene, AnaglyphUniversalCamera, UniversalCamera,PBRMaterial, HemisphericLight, Vector3, Vector2, SceneLoader,AssetContainer, MeshBuilder, StandardMaterial,  VideoTexture, CubeTexture, Color3,Color4, Mesh, Texture } from 'babylonjs';
import BabylonScene from '../../Universal/Babylon.jsx'; // import the component above linking to file we just created.
import { WaterMaterial } from 'babylonjs-materials';

///////////////////// other components
import Frame from '../../Universal/Frame/Frame';
import FrameSimple from '../../Universal/Frame/FrameSimple';
// import InstagramEmbed from 'react-instagram-embed';
import ReactPlayer from 'react-player';
import Playbar from "./Playbar";

///////////////////// material UI
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
// import TextField from '@material-ui/core/TextField';
// import { faWineBottle } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

///////////////////// p5.js
import P5Wrapper from 'react-p5-wrapper';
import sketch from './wetSketch';
import Stair from './Stair';


// palm https://poly.google.com/view/ficLBIjGliK

var duckies = [];
var bottles = [];
var bottle;
var myscene;
var camera;

var water, waterMesh;
var start;
var changed = false;



class WetStreams extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      deltaPosition0: {
        x: 0, y: 0
      },
      deltaPosition1: {
        x: 0, y: 0
      },
      isPlaying0: true,
      isPlaying1: true,
      percent0: 0,
      percent1: 1
    }

    this.babStyle = {
      width: 900,
      height: 100
    }
    this.bab = {
      x: (window.innerWidth-this.babStyle.width)/2,
      y: (window.innerHeight-this.babStyle.height)/2-60
    };
    this.svFrame = {};
    this.svFrame.w = 400;
    this.svFrame.h = 400;
    // this.svFrame.x = this.bab.x + this.babStyle.height + 50; //(window.innerWidth - this.svFrame.w)/2;
    // this.svFrame.y = this.bab.y - 50; //(window.innerHeight - this.svFrame.h)/2-60;
    this.svFrame.x0 = window.innerWidth/2-this.svFrame.w - 50;;
    this.svFrame.x1 = window.innerWidth/2+ 50;;
    this.svFrame.y = (window.innerHeight-30)*.15;

    this.onRender = this.onRender.bind(this);
    this.handleDrag0 = this.handleDrag0.bind(this);
    this.handleDrag1 = this.handleDrag1.bind(this);
    this.onToggle0 = this.onToggle0.bind(this);
    this.onToggle1 = this.onToggle1.bind(this);
    this.onChangePercent0 = this.onChangePercent0.bind(this);
    this.onChangePercent1 = this.onChangePercent1.bind(this);
  }


  handleDrag0 = (e, ui) => {
    console.log("DRAG 0")
    const {x, y} = this.state.deltaPosition0;
    this.setState({
      deltaPosition0: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      }
    });
  };

  handleDrag1 = (e, ui) => {
    // console.log("DRAG 1")
    const {x, y} = this.state.deltaPosition1;
    this.setState({
      deltaPosition1: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      }
    });
  };

  onToggle0 = (val) => {
    // console.log("Toggle 0", val);
    this.setState({isPlaying0: val});
  };

  onToggle1 = (val) => {
    // console.log("Toggle 0", val);
    this.setState({isPlaying1: val});
  };

  onChangePercent0 (val) {
    // console.log("Slider percent 0", val);
    this.setState({percent0: val});
  };

  onChangePercent1(val) {
    // console.log("Slider percent 1", val);
    this.setState({percent1: val});
  };

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
  }


  onSceneReady(scene) {
    start = new Date();
    myscene = scene;
    // const camera = new UniversalCamera("UniversalCamera", new Vector3(0, 1, -25), scene);
    camera = new AnaglyphUniversalCamera("af_cam", new Vector3(0, 8, -5), 0.033, scene);
    scene.clearColor = new Color4(0, 0, 0, 0);
    camera.setTarget(new Vector3(4, -8, -2));

    const canvas = scene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Skybox
    var skyW = 1000;
    var skybox = Mesh.CreateBox("skyBox", skyW, scene);
    var skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture("/textures/skybox/grid", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    // Water
    waterMesh = Mesh.CreateGround("waterMesh", 512, 512, 32, scene, false);
    waterMesh.position.y = -9;
    water = new WaterMaterial("water", scene, new Vector2(1024, 1024));
    water.backFaceCulling = true;
    water.bumpTexture = new Texture("textures/waterbump.png", scene);
    waterGo();
    water.colorBlendFactor = 0;
    water.addToRenderList(skybox);
    waterMesh.material = water;
  }

  onRender(scene) {}


  render() {
    let stairS = 100;
    // const {deltaPosition} = this.state;

    return (
      <div className="WetStreams">
      <div className="Frame-box">
      <Frame title=""
      content={<BabylonScene style={this.babStyle} className="noSelect" antialias onSceneReady={this.onSceneReady} onRender={this.onRender} id='babylon-canvas' />}
      width={this.babStyle.width} height={this.babStyle.height} x={100} y={300}
      />

      {/* https://media.giphy.com/media/Kk4f3yrTot95K/giphy.gif*/}
        <Frame onDrag={this.handleDrag0} title="wet" content={
          <div className="showerhead">
          <img src="/images/tub/7.png" />
          {/* <Playbar onToggle={this.onToggle0} onPercentChange={this.onChangePercent0} loadRate={.1} playRate={.1} />
          */}
          </div>
        }
        width={this.svFrame.w} height={this.svFrame.h} x={this.svFrame.x0} y={this.svFrame.y}
        />
        <Frame onDrag={this.handleDrag1} title="streams" content={
          <div className="showerhead">
          <img src="/images/tub/7.png" className="flippedX" />
          {/*<Playbar onToggle={this.onToggle1} onPercentChange={this.onChangePercent1} loadRate={.1} playRate={.1} />
          */}
          </div>

        }
        width={this.svFrame.w} height={this.svFrame.w} x={this.svFrame.x1 + 50} y={this.svFrame.y}
        />

        <Frame title="streams" content={
          <div className="showerhead">
          <img src="/images/tub/9.png"  />
          {/*<Playbar onToggle={this.onToggle1} loadRate={.1} playRate={.1} />
          */}
          </div>

        }
        width={this.svFrame.w} height={this.svFrame.w} x={this.svFrame.x1} y={this.svFrame.y-40}
        />


        {/*<Stair x={this.bab.x - stairS} y={this.bab.y + 1.5*stairS} stepW={stairS} stepH={stairS} numSteps={6} stepDown={stairS*.6} />*/}
        <P5Wrapper className="p5sketch" sketch={sketch}
        x0={this.svFrame.x0+240+this.state.deltaPosition0.x}
        y0={this.svFrame.y+315+this.state.deltaPosition0.y}
        isPlaying0={this.state.isPlaying0}
        percent0={this.state.percent0}
        x1={this.svFrame.x1+230+this.state.deltaPosition1.x}
        y1={this.svFrame.y+315+this.state.deltaPosition1.y}
        isPlaying1={this.state.isPlaying1}
        percent1={this.state.percent1}
        />


        </div>
        </div>
      )
    }
  }


  function waterGo() {
    water.windForce = -5;
    water.waveHeight = 0.8;
    water.bumpHeight = 0.1;
    water.waveLength = 0.3;
  }

  function waterStop() {
    // water.windForce*=2;
    water.waveHeight=0;
    water.bumpHeight*=2;
    // water.waveLength *=2;
  }

  export default WetStreams;