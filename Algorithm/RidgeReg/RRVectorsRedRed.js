import {EyeGazeModelInterface, Vector} from "../ModelInterface.js"
import {ridgeregvec} from "./ridgereg.js"


const FEATURE_SET = [468, 473, 4];

function getFacePointFeatures(X) {
    let newX = FEATURE_SET.map(i => X.facePoints.all[i]).flatMap(({v3d}) => [v3d.x, v3d.y, v3d.z]);
    return newX;
}


export default class RRVectorsRedRed extends EyeGazeModelInterface {
  train(data) {
    let myX = [];
    console.log(data);
    for (let {X, y} of data) {
        try {
            let Xp = getFacePointFeatures(X);
            myX.push({X: Xp, y: y});
        } catch(e) {
            console.log('IDP');
        }
    }
    console.log(myX);
    this.MP = ridgeregvec(myX);
    
  }
  predict(X) {
    let y = null;
    if (this.MP) {
      try {
        let x = getFacePointFeatures(X);
        y = this.MP.predict(x);
      } catch (e) {
        console.log('IDP');

      }
    }
    return y;
  }

  static get name(){
    return "RRVectorsReduced2"
  }

  static get color(){
    return "purple"
  }
}
