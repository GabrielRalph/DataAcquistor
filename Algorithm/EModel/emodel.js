import { EyeGazeModelInterface, Vector } from "../ModelInterface.js";


class L2 {
    static className = 'L2';

    constructor(config) {
       return tf.regularizers.l1l2(config)
    }
}
tf.serialization.registerClass(L2);
let model = undefined;
model = await tf.loadLayersModel("./Algorithm/EModel/ModelMore/model.json");
console.log(model);
model.compile({
    optimizer: tf.train.adam(0.001),
    loss: tf.losses.meanSquaredError,      // Mean Squared Error is typical for regression problems
    metrics: ['mae']  // Mean Absolute Error as a metric for regression performance
});

const features = [112, 26, 22, 23, 24, 110, 25, 33, 246, 161, 160, 159, 158, 157, 173, 243, 469, 470, 471, 472, 468, 463, 398, 384, 385, 386, 387, 388, 466, 263, 255, 339, 254, 253, 252, 256, 341, 474, 475, 476, 477, 473, 4, 243, 463]

/** @param {import("../ModelInterface.js").DataPoint} X */
function getFeatures(X) {
    return features.map(i => {
        let v = X.facePoints.allNoScale[i];
        return [v.x, v.y, v.z];
    });
}

export default class ModelTF extends EyeGazeModelInterface {
    
     /** 
     * @override
     * @param {import("../ModelInterface.js").DataPoint[]} trainData
     */ 
    async train(trainData) {
        // let x = tf.tensor(trainData.map(({X}) => getFeatures(X)));
        // let y = tf.tensor2d(trainData.map(({y}) => [y.x, y.y]));
        // await model.fit(x, y);
    }

    /** 
     * @override
     * @param {import("../ModelInterface.js").Features} x
     */ 
    predict(x){
        // if (this.min) {
            let x2 = tf.tensor3d([getFeatures(x)]);
            let y = model.predict(x2);
            let buff = y.bufferSync().values;
            let y2 =new Vector(buff[0], buff[1]) 
            // y2 = y2.sub(this.min).div(this.max.sub(this.min));
            // console.log(y2);
            return y2;
        // } else {
        //     return null;
        // }

    }

    static get name(){
        return "emodel"
    }

    static get color(){
        return "green"
    }
}