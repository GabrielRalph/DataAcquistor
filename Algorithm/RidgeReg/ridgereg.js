import numeric from './numeric.js';
import mat from './mat.js';
import KalmanFilter from "./kalman.js";

/**
 * Performs ridge regression, according to the Weka code.
 * @param {Array} y - corresponds to screen coordinates (either x or y) for each of n click events
 * @param {Array.<Array.<Number>>} X - corresponds to gray pixel features (120 pixels for both eyes) for each of n clicks
 * @param {Array} k - ridge parameter
 * @return{Array} regression coefficients
 */
function ridgereg(y, X, k){
    var nc = X[0].length;
    var m_Coefficients = new Array(nc);
    var xt = mat.transpose(X);
    var solution = new Array();
    var success = true;
    do{
        var ss = mat.mult(xt,X);
        // Set ridge regression adjustment
        for (var i = 0; i < nc; i++) {
            ss[i][i] = ss[i][i] + k;
        }

        // Carry out the regression
        var bb = mat.mult(xt,y);
        for(var i = 0; i < nc; i++) {
            m_Coefficients[i] = bb[i][0];
        }
        try{
            var n = (m_Coefficients.length !== 0 ? m_Coefficients.length/m_Coefficients.length: 0);
            if (m_Coefficients.length*n !== m_Coefficients.length){
                console.log('Array length must be a multiple of m')
            }
            solution = (ss.length === ss[0].length ? (numeric.LUsolve(numeric.LU(ss,true),bb)) : (mat.QRDecomposition(ss,bb)));

            for (var i = 0; i < nc; i++){
                m_Coefficients[i] = solution[i];
            }
            success = true;
        }
        catch (ex){
            k *= 10;
            console.log(ex);
            success = false;
        }
    } while (!success);
    return m_Coefficients;
}



export {ridgereg, KalmanFilter};
