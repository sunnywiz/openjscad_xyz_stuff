

/**
 * pop this in openjscad.xyz
 */

const jscad = require('@jscad/modeling')
const { cuboid, sphere, roundedCuboid, cylinder } = jscad.primitives
const { translate, rotate, align, scale } = jscad.transforms
const { expand } = jscad.expansions
const { hull, hullChain } = jscad.hulls
const { colorize, hslToRgb, colorNameToRgb, hexToRgb, hsvToRgb } = jscad.colors
const { union, subtract, intersect } = jscad.booleans
const { TAU } = jscad.maths.constants
const { measureAggregateBoundingBox, measureBoundingBox } = jscad.measurements

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
        }
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

const main = (params) => {

    var height = 50;  // height of box, not of items
    var roundness = 2;
    var bottom = 2;
    var rim = 3;
    var between = 2;

    var h1 = height - roundness - bottom; // height of these items
    // other items might have their own height

    // lego: 143.8mm = 18 dots
    var dtl = 143.8 / 18;

    // using 0,0 as being "skip this block"
    var knife = solidByLengths(30, h1,
        [1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [2, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0.1]);
    knife = scale([dtl, dtl, 1], knife);

    var bigfork = solidByLengths(26, h1,
        [1.5, 0,
            1.5, 0, 0, 0, 0, 0,
            .5, 0, 0, 0, 0, 0.5,
            0, 0, 1.7,
            0, 0, 0, 0, 0, 1.5, 0, 1.5]);
    bigfork = scale([dtl, dtl, 1], bigfork);

    var fork = solidByLengths(24, h1,
        [1.5, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0.5, 0, 1.5, 0, 0, 1.6, 0, 0, 0, 0, 0, 1.5]);
    fork = scale([dtl, dtl, 1], fork);

    var spoon = solidByLengths(21, h1,
        [1.5, 0, 0, 0, 0,
            0, 0, 0.5, 0, 0,
            0, 0, 0.5, 0, 0,
            0, 2.5, 0, 2.5, 0,
            1.5]);
    spoon = scale([dtl, dtl, 1], spoon);

    var shapes = [knife, bigfork, fork, spoon];
    var c1 = [1, 0, 0, 0.5];
    var c2 = [0, 1, 0, 0.5];
    var c3 = [0, 0, 1, 0.5];

    // make them rounder
    var e = { delta: roundness, corners: 'round', segments: 16 };
    for (var i = 0; i < shapes.length; i++) {
        shapes[i] = expand(e, shapes[i]);
    }

    // figure out layout

    var startX = 0;
    var startY = 0;
    startX += rim;

    for (var i = 0; i < shapes.length; i++) {

        var bb = measureBoundingBox(shapes[i]);

        shapes[i] = align({
            modes: ['min', 'min', 'min'],
            relativeTo: [startX, rim, bottom]
        }, shapes[i]);

        startX += (bb[1][0] - bb[0][0]);
        startX += between;
    }
    return [bigfork, shapes[1]];

    // container to keep them in, but at specific height only
    var bb = measureAggregateBoundingBox(shapes);
    var width = bb[1][0] - bb[0][0] + (rim * 2);
    var depth = bb[1][1] - bb[0][1] + (rim * 2);
    var base = cuboid({
        size:
            [width, depth, height]
    });
    base = align({
        modes: ['min', 'min', 'min'],
        relativeTo: [0, 0, 0]
    }, base);

    // grabber
    var grab = cylinder({ radius: height - bottom - rim, height: width + rim * 2, segments: 64 });
    grab = rotate([0, TAU / 4, 0], grab)
    grab = translate([width / 2, depth / 2, height], grab);

    base = subtract(base, grab);
    for (var i = 0; i < shapes.length; i++) {
        base = subtract(base, shapes[i]);
    }
    return base;
}

module.exports = { main }
