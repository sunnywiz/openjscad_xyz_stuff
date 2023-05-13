const jscad = require('@jscad/modeling')
const { cuboid } = jscad.primitives
const { translate } = jscad.transforms
const { hullChain } = jscad.hulls

// Returns X-centered, Y-going away, and Z-resting on 0
const solidByLengths = (lengthMM, heightMM, leftMeasure, rightMeasure) => {

    if (!rightMeasure) rightMeasure = leftMeasure;
    if (leftMeasure.length != rightMeasure.length) throw ("need same # of measurements");

    var shapes = [];
    var perItemLength = (lengthMM * 1.0) / (leftMeasure.length);

    var smallestLeft = leftMeasure[0];
    var smallestRight = rightMeasure[0];
    for (var i = 0; i < leftMeasure; i++) {
        if (leftMeasure[i] > 0 && rightMeasure[i] > 0) {
            if (leftMeasure[i] < smallestLeft) smallestLeft = leftMeasure[i];
            if (rightMeasure[i] < smallestRight) smallestRight = rightMeasure[i];
        } a
    }

    var shapes = [];
    for (var i = 0; i < leftMeasure.length; i++) {

        if (leftMeasure[i] == 0 || rightMeasure[i] == 0) continue;

        var combinedMeasure = leftMeasure[i] + rightMeasure[i];  // centered at 0
        var offsetToCenter = -leftMeasure[i] * .5 + rightMeasure[i] * 0.5; // -((a+b)/2)+a

        var c = cuboid({
            size: [combinedMeasure, perItemLength, heightMM]
        });

        var translated = translate([offsetToCenter, perItemLength * i + (perItemLength / 2), heightMM / 2], c);
        shapes.push(translated);
    }

    var h = hullChain(shapes);
    return h;
}

module.exports = { solidByLengths };