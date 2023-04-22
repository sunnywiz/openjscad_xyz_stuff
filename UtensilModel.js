
/**
 * pop this in openjscad.xyz
 */

const jscad = require('@jscad/modeling')
const { cuboid, sphere, roundedCuboid } = jscad.primitives
const { translate } = jscad.transforms
const { expand } = jscad.expansions
const { hull, hullChain } = jscad.hulls

const utensil = (lengthMM, heightMM, leftMeasure, rightMeasure) => {

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

        var c = cuboid({
            size: [combinedMeasure, perItemLength, heightMM]
        });

        var translated = translate([offsetToCenter, perItemLength * i, 0], c);
        shapes.push(translated);
    }

    var h = hullChain(shapes);
    return h;
}

const main = (params) => {

    var heightMM = 50;
    var fork1 = utensil(
        200, heightMM, [10, 10, 10, 10, 10, 20, 25, 20, 5]
        , [10, 10, 10, 10, 10, 20, 25, 20, 5]);
    return fork1;
    //     var extraRoundness = 5;

    //     return expand({ delta: extraRoundness, corners: 'round', segments: 32 }, h);

}

module.exports = { main }
