

/**
 * pop this in openjscad.xyz
 */

const jscad = require('@jscad/modeling')
const { cuboid, sphere, roundedCuboid } = jscad.primitives
const { translate } = jscad.transforms
const { expand, offset } = jscad.expansions
const { hull, hullChain } = jscad.hulls
const { colorize, hslToRgb, colorNameToRgb, hexToRgb, hsvToRgb } = jscad.colors
const { union, subtract, intersect } = jscad.booleans


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

        var c = colorize([1, 0, 0, .5], cuboid({
            size: [combinedMeasure, perItemLength, heightMM]
        }));
        // we're going to get it center-x on 0, z resting on zero, y resting on 0 
        var ct = translate([offsetToCenter, 0, heightMM / 2], c);
        // we need to give it a hat to take away from
        var hat = colorize([0, 1, 0, 0.5],
            cuboid({ size: [combinedMeasure + 2 * extraRoundness, perItemLength, extraRoundness] })
        );

        hat = translate([0, 0, heightMM - extraRoundness / 2], hat);

        var u = union([ct, hat]);

        var translated = translate([offsetToCenter, perItemLength * i, 0], u);
        shapes.push(translated);
    }

    var h = hullChain(shapes);
    return expand({ delta: extraRoundness, corners: 'round', segments: 32 }, h);
}

module.exports = { main }
