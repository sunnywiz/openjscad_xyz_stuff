
// Upload parent folder to https://openjscad.xyz

const jscad = require('@jscad/modeling')
const { cuboid, cylinder } = jscad.primitives
const { translate, rotate, align, scale } = jscad.transforms
const { expand, offset } = jscad.expansions
const { colorize } = jscad.colors
const { union, subtract, intersect } = jscad.booleans
const { TAU } = jscad.maths.constants
const { measureAggregateBoundingBox, measureBoundingBox } = jscad.measurements

const { solidByLengths } = require('./solidByLengths.js');

const getParameterDefinitions = () => [
    {
        name: 'choice', type: 'radio', caption: 'What To Generate',
        values: ['rawshape'],
        captions: ['Raw Shape'], initial: 'rawshape'
    },
]

const main = (params) => {

    var height = 50;  // height of box, not of items
    var roundness = 5;
    var fit = 2;
    var bottom = 2;
    var rim = 3;
    var between = 2;

    var h1 = height - roundness - bottom; // height of these items
    // other items might have their own height

    // lego: 143.8mm = 18 dots
    var dtl = 143.8 / 18;

    // using 0,0 as being "skip this block"
    // Y is in lego sizes, X is in mm chunks measured on a lego rig per lego block
    // divide x in half because its symmetric
    var bigSpoon = solidByLengths(25, 1,
        [23, 23, 0, 0, 0, 0, 0, 9,
            8, 0, 0, 6, 6.5, 0, 7.5, 11,
            24, 0, 44, 0, 45, 0, 42, 0,
            28]);
    bigSpoon = scale([0.5, dtl, 1], bigSpoon);

    var shapes = [bigSpoon
    ];

    var c1 = [1, 0, 0, 0.5];
    var c2 = [0, 1, 0, 0.5];
    var c3 = [0, 0, 1, 0.5];

    if (params.choice='rawshape') return shapes; 

    return shapes;  
    // make them rounder
    for (var i = 0; i < shapes.length; i++) {
        shapes[i] = offset({ delta: (roundness - fit), corners: 'round', segments: 8 }, shapes[i]);
        shapes[i] = expand({ delta: roundness, corners: 'round', segments: 8 }, shapes[i]);
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
    // return shapes;

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
    grab = translate([width / 2, height - bottom - rim + (rim * 4), height], grab);

    base = subtract(base, grab);
    for (var i = 0; i < shapes.length; i++) {
        base = subtract(base, shapes[i]);
    }
    return base;
}

module.exports = { main, getParameterDefinitions }

