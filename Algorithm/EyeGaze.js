import * as FaceMesh from "./FaceMesh.js"
import {extractEyeFeatures, deserialiseFeatures, serialiseFeatures} from "./extractEyeFeatures.js"
import * as Webcam from "../Utilities/Webcam.js"
import {getModel, getModels} from "./ModelLibrary.js"
import { EyeGazeModelInterface } from "./ModelInterface.js";


console.log(getModels());

/** @type {?EyeGazeModelInterface} */
let Model = null;

/** @type {String} */
let SelectedModel = "emodel";

let SampleData = [];
let MethodID = null;
let is_sampling = false;
let GetScreenPosition = null;


function sample(features) {
  if (is_sampling && GetScreenPosition instanceof Function) {
    features.method = MethodID;
    SampleData.push({X: features, y: GetScreenPosition()})
  }
}

function processFrame(input) {
  let points = FaceMesh.getFacePointsFromVideo(input.video);
  input.points = points;

  let features = extractEyeFeatures(points, input.canvas);
  input.features = features;


  if (features.errors) {
    // console.log(features.errors);
    throw features.errors;
  }

  sample(features);

  let position = predictScreenPosition(features);
  return position;
}

export async function trainModel(sampleRate = 0.8){
  Webcam.stopProcessing();
  let stats = null;
  try{
    if (SelectedModel == "all") {
      let models = getModels();
      Model = {};
      stats = {}
      for (let key in models) {
        Model[key] = new models[key]();
        stats[key] = await Model[key].trainAndValidate(SampleData, sampleRate)
      }
    } else {
      let ModelClass = getModel(SelectedModel);
      if (ModelClass != null) {
        Model = new ModelClass();
        stats = await Model.trainAndValidate(SampleData, sampleRate);
      } else {
        throw "No model exists with the name " + SelectedModel;
      }
    }
  } catch (e) {
    console.log("training error", e);
  }
  Webcam.startProcessing();
  SampleData = [];
  if (stats == null) throw new Error("Training Error.")
  return stats;
}

function predictScreenPosition(X, kfilter = true) {
  let y = null;
  if (Model) {
    if (Model instanceof EyeGazeModelInterface) {
      try {
        y = Model.predictAndFilter(X);
      } catch(e) {console.log(e);}
    } else {
      y = {}
      for (let key in Model) {
        try {
          y[key] = Model[key].predictAndFilter(X);
        } catch(e) {console.log(e);}
      }
    }
  }
  return y;
}

export function startSampling(methodID){
    MethodID = methodID;
    is_sampling = true;
}

export function stopSampling(){
  is_sampling = false;
}

export function setCalibrationPositionGetter(posGetter) {
  if (posGetter instanceof Function) {
    GetScreenPosition = posGetter;
  }
}

export function selectModel(name) {
  SelectedModel = name;
}
Webcam.setProcess((input) => processFrame(input));

let load = FaceMesh.load;
export {Webcam, load, deserialiseFeatures, serialiseFeatures}
