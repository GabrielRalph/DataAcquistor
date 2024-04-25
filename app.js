import {SvgPlus, Vector} from "../SvgPlus/4.js"
import * as zip from "https://deno.land/x/zipjs/index.js";
// import * as EyeGaze from "../Algorithm/EyeGaze.js"
// import * as FaceMesh from "../Algorithm/FaceMesh.js"
// import {extractEyeFeatures, renderBoxSection, decode} from "../Algorithm/extractEyeFeatures.js"
import * as Webcam from "../Utilities/Webcam.js"
import {CalibrationFrame, HideShow, SvgResize, dotGrid} from "../UI/calibration-frame.js"
import {FeedbackFrame} from "../UI/feedback-frame.js"

async function delay(time){
  return new Promise((resolve, reject) => {
    if (time) {
      setTimeout(resolve, time);
    } else {
      window.requestAnimationFrame(resolve);
    }
  })
}

async function parallel() {
  let res = [];
  for (let argument of arguments) {
    res.push(await argument);
  }
  return res;
}



class SvgGrid extends SvgResize {
  draw(){
    let s = 3;
    let {W, H} = this;
    if (this.lastW != W || this.lastH != H) {
      this.innerHTML = "";
      this.lastW = W;
      this.lastH = H;
      let grid = dotGrid(7, new Vector(s), new Vector(W-s, s), new Vector(s, H-s), new Vector(W-s, H-s));
      for (let p of grid) {
        this.createChild("circle", {cx: p.x, cy: p.y, r: s})
      }
    }
  }
}

class EyesFeedbackFrame extends HideShow{
  constructor(el = "eyes-feedback"){
    super(el);
    this.size = 1;
    this.styles = {
      overflow: "hidden",
      "border-radius": "1em",
    };
    // Eye box
    this.eyebox = this.createChild("div", {styles: {overflow: "hidden", display: "flex", position: "relative"}});
    this.eye2 = this.eyebox.createChild("canvas", {styles: {width: "50%"}});
    this.eye1 = this.eyebox.createChild("canvas", {styles: {width: "50%"}});

      // FeedbackFrame
    this.fb = this.createChild(FeedbackFrame);
    Webcam.addPredictionListener((input) => this.renderFace(input));

  }

  set size(size){
    this._size = size;
    this.styles = {
      width: `${size * 100}vmin`
    }
  }
  get size(){
    return this._size;
  }

  hideEyes(){
    this.showEyes(false);
  }
  showEyes(show = true){
    if (show && !!this.eyes_hidden) {
      this.eyebox.styles = {height: "auto"}
      this.eyes_hidden = false;
    } else if (!show && !this.eyes_hidden) {
      this.eyebox.styles = {height: "0px"}
      this.eyes_hidden = true;
    }
  }

  ondblclick(){
    console.log(this.eyes_hidden);
    this.showEyes(!!this.eyes_hidden)
  }

  renderFace(input) {
    this.fb.updateCanvas(input.canvas);

    this.styles = {
      border: !!input.error ? "2px solid red" : "none",
      padding: !!input.error ? "0px" : "2px"
    }
    try {
      let eyefeatures = decode(input.prediction);
      renderBoxSection(eyefeatures.left.pixels, this.eye1);
      renderBoxSection(eyefeatures.right.pixels, this.eye2);
      let svg = this.fb.svg;
      for (let key in input.points.eyeboxes) {
        let ps = input.points.eyeboxes[key];
        svg.createChild("path", {
          d: `M${ps[0]}L${ps[1]}L${ps[2]}L${ps[3]}Z`,
          fill: "#00ff0044"
        })
      }
    } catch(e){}
  }
}

let COLORS = ["blue", "red", "purple", "orange"];
class Pointers extends SvgPlus {
  constructor(el = "div"){
    super(el)
    this.pi = 0;
    this.pointers = {};
    this.bounds = this.createChild("div", {styles: {
      position: "fixed",
      width: "10px",
      height: "10px",
      "border-radius": "10px",
      transform: "translate(-50%, -50%)",
      border: "2px solid #0005",
    }});
  }

  set(name, vec) {
    let abs = null;
    let {pointers} = this;
    if (name in pointers) {
      let style = {display: "none"}
      if (vec instanceof Vector) {
        abs = vec.mul(new Vector(window.innerWidth, window.innerHeight));
        style = {
          display: "block",
          top: abs.y + 'px',
          left: abs.x + 'px',
        }
      }
      pointers[name].styles = style;
      pointers[name].pos = abs;
    }
  }

  updateBounds(){
    let {pointers} = this;
    let mid = new Vector(0);
    let n = 0;
    for (let name in pointers) {
      if (pointers[name].pos instanceof Vector) {
        mid = mid.add(pointers[name].pos);
        n++;
      }
    }
    if (n > 0) mid = mid.div(n);

    let r = 0;
    for (let name in pointers) {
      if (pointers[name].pos instanceof Vector) {
        let rd = mid.dist(pointers[name].pos)
        if (rd > r) r = rd;
      }
    }
    let style = {display: "none"}
    if (r > 0) {
      style = {
        display: "block",
        top: mid.y + 'px',
        left: mid.x + 'px',
        width: 2*r + 'px',
        height: 2*r + 'px',
        "border-radius": r + 'px'
      }
    }
    this.bounds.styles = style;
  }

  add(name, color = COLORS[this.pi], size = 10) {
    this.pi ++;
    this.pointers[name] = this.createChild("div", {styles: {
      position: "fixed",
      width: size + "px",
      height: size + "px",
      "border-radius": "10px",
      transform: "translate(-50%, -50%)",
      background: color,
      display: "none",
    }});
  }
}

class EyeApp extends SvgPlus {
  async onconnect(){
    this.styles = {
      display: "block",
      width: "100%",
      height: "100%",
      position: "fixed",
      background: "white",

      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };

    let grid = this.createChild(SvgGrid);
    grid.styles = {
      width: `calc(100% - 2em)`,
      height: `calc(100% - 2em)`,
      margin: '1em',
      opacity: 0.3
    };
    grid.start();

    this.start_window = this.createChild(HideShow);
    this.start_message = this.start_window.createChild("div");
    this.start_window.styles = {
      position: "fixed",
      top: "2em",
      left: "50%",
      transform: "translate(-50%, 0)"
    };

    this.start_button = this.start_window.createChild(HideShow);
    this.start_button.props = {
      class: "btn",
      content: "Start Webcam",
    }
    this.start_button.onclick = () => {this.startWebcam();}
    this.start_button.shown = true;

    this.calibrate_button = this.start_window.createChild(HideShow);
    this.calibrate_button.props = {
      content: "Calibrate",
      class: "btn",
    }
    this.calibrate_button.onclick = () => {this.calibrate();}

    this.start_window.show(1000)
    // this.start_window.show(400);// = true;

    this.feedback = this.createChild(EyesFeedbackFrame);
    this.feedback.styles = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    }
    this.feedback.hideEyes();
    this.feedback.size = 0.5;
    //
    this.results = this.createChild(HideShow);
    this.results.styles = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    }
    this.rimage = this.results.createChild("img", {styles: {"border-radius": "1em"}});
    this.resultButtons = this.results.createChild(HideShow);
    this.resultButtons.styles = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
     
    }
    let rel = this.resultButtons.createChild("div", {styles: {
      display: "flex",
      fill: "white",
      "font-size": "3em",
      gap: `0.3em`,
      background: "#0006",
      "border-radius": "0.3em",
      padding: "0.3em",
    }})
    let play = rel.createChild("div", {style: {cursor: "pointer", display: "flex"}, content: `<svg xmlns="http://www.w3.org/2000/svg" width = "1em" viewBox="0 0 384 512"><<path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>`})
    let save = rel.createChild("div", {style: {cursor: "pointer", display: "flex"}, content: `<svg xmlns="http://www.w3.org/2000/svg" width = "1em" viewBox="0 0 448 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`})
    play.onclick = () => this.playRecording();
    save.onclick = () => this.saveRecording();

    let pointers = this.createChild(Pointers);
    pointers.add("p1");
    pointers.add("p2");
    this.pointers = pointers;


   
    this.calibrator = this.createChild(CalibrationFrame);
    Webcam.addPredictionListener((input) => this.onPrediction(input));

    
  }

  async saveRecording(){
    if (!this._saving) {
      this._saving = true;
      this.resultButtons.disabled = true;
      const zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/zip"));
      await Promise.all(
        images.map(([ts, pos, img]) => zipWriter.add(`${ts}_(${pos}).jpeg`, new zip.Data64URIReader(img)) )
      );
      let blob = await zipWriter.close();
      console.log(blob);
      let a = this.createChild("a", {
        download: "eyedata_" + (new Date()).getTime() + ".zip",
        href: URL.createObjectURL(blob),
        textContent: "Download zip file",
      })
      a.click();
      this.resultButtons.disabled =false;
      this._saving = false;
    }
  }

  async startWebcam(){
    console.log("starting webcam");
    this.start_button.disabled = true;
    let webcam_on = await Webcam.startWebcam();
    console.log("webcam " + (webcam_on ? "started" : "failed to start"));
    if (webcam_on) {
      Webcam.startPredictions();
      this.start_message.innerHTML = "";
      await parallel(this.start_button.hide(), this.feedback.show());
      this.start_button.disabled = false;
      await this.calibrate_button.show();
    } else {
      this.start_message.innerHTML = "You browser does not support webcam accesability, or the webcam is currently being used.<br/><br/>Click to try again."
      this.start_button.disabled = false;
    }
  }



  async playRecording(){
    console.log(images);
    if (!this._playing) {
      this._playing = true;
      await this.results.show()
      await this.resultButtons.hide();
      let lastTime = null
      for (let [time, point, image] of images) {
        if (lastTime == null) lastTime = time;
        this.rimage.props = {src: image};
        this.pointers.set("p1", point);
        await delay(time - lastTime);
        lastTime = time;
      }
      this.resultButtons.show();
      this._playing = false;
    }
  }

  async calibrate(){
    // train_data = [];
    images = [];

    await this.calibrator.show();
    this.feedback.styles = {transform: "none", top: "1em", left:"1em"};
    this.feedback.size = 0.2;
    // await this.calibrator.calibrate1();
    await this.calibrator.calibrate5(4000);
    // await this.calibrator.calibrate4();
    // await this.calibrator.hide();
    // this.m1 = EyeGaze.trainModel(train_data, "ridge", Math.round(train_data.length * 0.8));
    // console.log(this.m1);
    // train_data2 = [];
    // for (let [oldx1, oldy, oldx2] of train_data) {
    //   let y1 = this.m1.predict(oldx1);
    //   let x2 = [...oldx2, y1.x, y1.y]
    //   train_data2.push([x2, oldy]);
    // }

    console.log(images.length);
    // await this.calibrator.calibrate5();
    // console.log(train_data2);
    // this.m2 = EyeGaze.trainModel(train_data2, "ridge");

    await this.calibrator.hide();
    await this.playRecording();


   
  }

  onPrediction(input){
    // console.log(input.canvas.getDataURL("image/ong"));
    // if (this.calibrate_button.shown) {
    //   this.calibrate_button.disabled = !!input.error;
    // }
    // let y1 = null;
    // let y2 = null;
    if (this.calibrator.recording || this.capture) {
      images.push([(new Date()).getTime(), this.calibrator.position, input.canvas.toDataURL("image/jpeg")]);
    }

    // if (!input.error) {
    //   let x1 = input.feature;
    //   let x2 = input.info.feat2;
    //   if (this.calibrator.recording) {
    //     train_data.push([x1, this.calibrator.position, x2]);
    //   }

    //   if (this.m1) {
    //     y1 = this.m1.predict(x1);
    //     x2 = [...x2, y1.x, y1.y];
    //     if (this.calibrator.recording) {
    //       train_data2.push([x2, this.calibrator.position]);
    //     }

    //     if (this.m2) {
    //       y2 = this.m2.predict(x2);
    //     }
    //   }
    // }

    // this.pointers.set("p1", y1);
    // this.pointers.set("p2", y2);
  }
}

// let train_data = [];
let images = [];
// let train_data2 = [];

Webcam.setPredictor((input) => {
  let lastFeatures = null;
  try {
    // let points = FaceMesh.getFacePointsFromVideo(input.video);
    // if (!("left" in points)) throw 'No face detected'
    // input.points = points;
    // lastFeatures = extractEyeFeatures(points, input.canvas);
    // let x = decode(lastFeatures);
    // input.info = x;
    // input.feature = x.feat;
  } catch (e) {
    // lastFeatures = null;
    // console.log("prediction error:", e);
    // throw e;
  }
  return lastFeatures;
})

SvgPlus.defineHTMLElement(EyeApp)
