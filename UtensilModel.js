
    


/**
 * pop this in openjscad.xyz
 */

const jscad = require('@jscad/modeling')
const { cuboid, sphere, roundedCuboid, cylinder, ellipsoid } = jscad.primitives
const { translate, rotate, align } = jscad.transforms
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

    var height = 50;  // height of box, not of items
    var roundness = 2;
    var bottom = 2;
    var rim = 3;
    var between = 2;

    var h1 = height - roundness - bottom; // height of these items
    // other items might have their own height

    var knife = solidByLengths(260, h1,
        [1, 15, 16, 13, 12, 11, 10, 9, 8, 7, 7, 10, 12, 13, 13, 14, 14, 13, 12, 12, 11, 10, 7],
        [1, 7, 9, 7, 6, 6, 5, 5, 5, 5, 6, 12, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],)
    var fork = solidByLengths(220, h1,
        [1, 10, 13, 11, 10, 8, 6, 5, 5, 5, 5, 5, 5, 5, 8, 14, 15, 15, 15, 14, 13, 12]);

    var shapes = [knife, fork];
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

    // individual grabbers.  Model single grabber based on hand shape 
    var grabber = ellipsoid({
        radius: [60, 30, 50],
        segments: 32
    });
    var grabbershapes = [];

    for (var i = 0; i < shapes.length; i++) {

        shapes[i] = align({
            modes: ['min', 'min', 'min'],
            relativeTo: [startX, rim, bottom]
        }, shapes[i]);

        var bb = measureBoundingBox(shapes[i]);
        console.log(bb);

        var o = {
            modes: ['center', 'center', 'min'],
            relativeTo: [
                (bb[0][0] + bb[1][0]) / 2,
                0, // (bb[0][1] + bb[1][1]) / 2,
                bb[0][2]
            ]
        };
        var ig = align(o, grabber);
        grabbershapes.push(ig);

        startX += (bb[1][0] - bb[0][0]);
        startX += between;
    }

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


    // grabber v1: cylinder
    //    var grab = cylinder({ 
    //        radius: height - bottom - rim, 
    //        height: width + rim * 2, 
    //        segments: 64 });
    //    grab = rotate([0, TAU / 4, 0], grab)
    //    grab = translate([width / 2, depth / 2, height], grab);

    // grabber v2: sphere, transformed.  Very meh. 
    //     var grab = ellipsoid(
    //         {
    //             radius:[width*2,depth/2-rim,height-bottom] 
    // , 
    //             segments: 64
    //         });
    //     grab = align({
    //         modes:['center','center','min'],
    //         relativeTo:[width/2,depth/2,bottom]
    //     }, grab)

    for (var i = 0; i < shapes.length; i++) {
        // move the grabber to the mid-y
        grabbershapes[i] = translate([0,depth/2,0],grabbershapes[i]);
        base = subtract(base, shapes[i]);
        base = subtract(base, grabbershapes[i]);
    }

    return base;
}

module.exports = { main }

