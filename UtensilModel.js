
/**
 * pop this in openjscad.xyz
 */

const jscad = require('@jscad/modeling')
const { cuboid, sphere, roundedCuboid, cylinder } = jscad.primitives
const { translate, rotate } = jscad.transforms
const { expand } = jscad.expansions
const { hull, hullChain } = jscad.hulls
const { colorize, hslToRgb, colorNameToRgb, hexToRgb, hsvToRgb } = jscad.colors
const { union, subtract, intersect } = jscad.booleans
const { TAU } = require('@jscad/modeling').maths.constants


// Returns X-centered, Y-going away, and Z-resting on 0
const solidByLengths = (lengthMM, heightMM, leftMeasure, rightMeasure) => {

    if (!rightMeasure) rightMeasure = leftMeasure;
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

        var translated = translate([offsetToCenter, perItemLength * i + (perItemLength / 2), heightMM / 2], c);
        shapes.push(translated);
    }

    var h = hullChain(shapes);
    return h;
}

const main = (params) => {

    var width = 110;
    var height = 50;
    var bottom = 5;
    var rim = 5;
    var roundness = 5;
    var depth = 260 + rim * 2 + roundness * 2;

    var h1 = height - roundness - bottom;

    var knife = solidByLengths(260,h1,
        [1,15,16,13,12,11,10,9,8,7,7,10,12,13,13,14,14,13,12,12,11,10, 7],
        [1, 7, 9, 7, 6, 6, 5,5,5,5,6,12,14,15,15,15,15,15,15,15,15,15,15],)
    var fork = solidByLengths(220, h1, 
        [1,10,13,11,10,8,6,5,5,5,5,5,5,5,8,14,15,15,15,14,13,12]);

    // make them rounder
    var e = { delta: roundness, corners: 'round', segments: 16 };
    knife = expand(e, knife);
    fork = expand(e, fork);

    // position
    knife = translate([25, rim + roundness, bottom + roundness], knife);
    fork = translate([80, rim + roundness, bottom + roundness], fork);

    // base 
    var base = cuboid({ size: [width, depth, height] });
    base = translate([width / 2, depth / 2, height / 2], base);

    // grabber
    var grab = cylinder({ radius: height - bottom - rim, height: width + rim * 2, segments: 64 });
    grab = rotate([0, TAU / 4, 0], grab)
    grab = translate([width / 2, depth / 2, height], grab);

    base = subtract(base, knife);
    base = subtract(base, fork);
    base = subtract(base, grab);
    base = colorize([1, 0, 0, 0.5], base);

    return [base];

}

module.exports = { main }
