
/**
 * pop this in openjscad.xyz
 */

const jscad = require('@jscad/modeling')
const { cuboid, sphere, roundedCuboid } = jscad.primitives
const { translate } = jscad.transforms
const { expand } = jscad.expansions
const { hull, hullChain } = jscad.hulls

const main = (params) => {

    var lengthMM = 200;
    var heightMM = 50;
    var leftMeasure = [10, 20, 10, 10, 0, 10, 20, 30, 20];
    var rightMeasure = [10, 10, 17, 20, 10, 10, 10, 10, 5];
    var extraRoundness = 5;

    if (leftMeasure.length != rightMeasure.length) throw ("need same # of measurements");

    var shapes = [];
    var perItemLength = (lengthMM * 1.0) / (leftMeasure.length);

    var smallestLeft = leftMeasure[0];
    var smallestRight = rightMeasure[0];
    for (var i = 0; i < leftMeasure; i++) {
        if (leftMeasure[i] < smallestLeft) smallestLeft = leftMeasure[i];
        if (rightMeasure[i] < smallestRight) smallestRight = rightMeasure[i];
    }

    var shapes = [];
    for (var i = 0; i < leftMeasure.length; i++) {

        var combinedMeasure = leftMeasure[i] + rightMeasure[i];  // centered at 0
        var offsetToCenter = +leftMeasure[i] * .5 - rightMeasure[i] * 0.5; // -((a+b)/2)+a

        // var c = cuboid({
        //     size: [combinedMeasure, perItemLength, heightMM]
        // });
        var c = roundedCuboid({
            size: [
                combinedMeasure + (extraRoundness * 2),
                perItemLength + (extraRoundness * 2),
                heightMM + (extraRoundness * 2)
            ],
            roundRadius: extraRoundness,
            segments: 32
        });

        var translated = translate([offsetToCenter, perItemLength * i, 0], c);
        shapes.push(translated);
    }

    var c = hullChain(shapes);
    // return expand({ delta: extraRoundness, corners: 'round', segments:32},c); 
    return c;
}

module.exports = { main }
