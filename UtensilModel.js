
// Upload parent folder to https://openjscad.xyz

const jscad = require('@jscad/modeling')
const { cuboid, cylinder } = jscad.primitives
const { translate, rotate, align, scale } = jscad.transforms
const { expand, offset} = jscad.expansions
const { colorize } = jscad.colors
const { union, subtract, intersect } = jscad.booleans
const { TAU } = jscad.maths.constants
const { measureAggregateBoundingBox, measureBoundingBox } = jscad.measurements

const { solidByLengths } = require('./solidByLengths.js');

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

    // set up on a lego "jigsaw" 
    // measure the widths in mm at each stage
    var spoon = solidByLengths(21, h1,
        [18.6, 18.6, 0, 0
            , 12, 10.1, 8.5, 7.3,
            0, 0, 0, 0,
            7.3, 19, 30, 33.8,
            33.9, 33.1, 30.0, 25.2,
            17.4]);
    spoon = scale([0.5, dtl, 1], spoon);

    var chopstick = solidByLengths(103 + 124, h1,
        [5.7 / 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.5 / 2]);
    // straight measurements, not lego scale.
    // two chopsticks side by side though
    chopstick = scale([2,1,1], chopstick); 

    var shapes = [chopstick,
        knife,
        knife,
        bigfork,
        fork,
        spoon,
        spoon
    ];
    var c1 = [1, 0, 0, 0.5];
    var c2 = [0, 1, 0, 0.5];
    var c3 = [0, 0, 1, 0.5];

    // make them rounder
    for (var i = 0; i < shapes.length; i++) {
        shapes[i] = offset({ delta: (roundness-fit), corners: 'round', segments: 8 }, shapes[i]);
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

module.exports = { main }

