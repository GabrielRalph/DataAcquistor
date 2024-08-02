import { EyeGazeModelInterface, Vector } from "../ModelInterface.js";


class L2 {
    static className = 'L2';

    constructor(config) {
       return tf.regularizers.l1l2(config)
    }
}
tf.serialization.registerClass(L2);
let model = undefined;
model = await tf.loadLayersModel("./Algorithm/EModel/model.json");
console.log(model);
model.compile({
    optimizer: tf.train.adam(0.001),
    loss: tf.losses.meanSquaredError,      // Mean Squared Error is typical for regression problems
    metrics: ['mae']  // Mean Absolute Error as a metric for regression performance

});

export default class ModelTF extends EyeGazeModelInterface {
    
     /** 
     * @override
     * @param {import("../ModelInterface.js").DataPoint[]} trainData
     */ 
    async train(trainData) {
        let x = tf.tensor(trainData.map(({X}) => X.facePoints.allNoScale.map((v3d) => [v3d.x, v3d.y, v3d.z])));
        let y = tf.tensor2d(trainData.map(({y}) => [y.x, y.y]));
        await model.fit(x, y);
    }

    /** 
     * @override
     * @param {import("../ModelInterface.js").Features} x
     */ 
    predict(x){
        // if (this.min) {
            let x2 = tf.tensor3d([x.facePoints.all.map(({v3d}) => [v3d.x, v3d.y, v3d.z])]);
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
}