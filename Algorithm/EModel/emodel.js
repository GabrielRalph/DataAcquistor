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