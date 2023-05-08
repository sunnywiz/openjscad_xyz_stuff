
// Upload parent folder to https://openjscad.xyz

const jscad = require('@jscad/modeling')
const { cuboid, cylinder } = jscad.primitives
const { translate, rotate, align, scale, scaleZ, mirrorY } = jscad.transforms
const { expand, offset } = jscad.expansions
const { colorize } = jscad.colors
const { union, subtract, intersect } = jscad.booleans
const { TAU } = jscad.maths.constants
const { measureAggregateBoundingBox, measureBoundingBox, measureDimensions } = jscad.measurements

const { solidByLengths } = require('./solidByLengths.js');
const { layout } = require('./layout.js');

const getParameterDefinitions = () => [
    {
        name: 'choice', type: 'radio', caption: 'What To Generate',
        values: ['init', 'rawshape', 'roundedcuts', 'outlinedholders'],
        captions: ['Initial - nothing', 'Raw Shapes Arranged', 'Rounded Cuts Arranged', 'outlinedholders'],
        initial: 'init'
    },
]

const main = (params) => {

    var height = 50;  // height of box, not of items
    var roundness = 5;
    var fit = 2;
    var bottom = 2;
    var rim = 3;
    var between = 2;

    if (params.choice == 'init') return cuboid();

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

    var shapes = [bigSpoon, mirrorY(bigSpoon)];

    // for debugging
    var c1 = [1, 0, 0, 0.5];
    var c2 = [0, 1, 0, 0.5];
    var c3 = [0, 0, 1, 0.5];

    if (params.choice == 'rawshape') {
        shapes = layout({ separation: between }, shapes);
        return shapes;
    }

    // extend up to the height we need them to be

    for (var i = 0; i < shapes.length; i++) {

        // this will not work for things that don't have flat bottom profiles

        var d = measureDimensions(shapes[i]);
        var sf = (height * 2) / d[2];
        if (sf < 1) sf = 1;
        shapes[i] = scaleZ(sf, shapes[i]);

        // proceed with making them rounder, the space for them to fall into
        var e = expand({ delta: roundness, corners: 'round', segments: 4 }, shapes[i]);
        shapes[i] = e;
    }

    shapes = layout({ separation: between }, shapes);

    if (params.choice == 'roundedcuts') {
        return shapes;
    }

    if (params.choice == 'outlinedholders') {
        var x = [];
        for (var i = 0; i < shapes.length; i++) {
            console.log("reexpanding "+i+1);
            var egg = expand({ delta: between, corners: 'round', segments: 4 }, shapes[i]);
            console.log("subtracting original "+i+1);
            var wall = subtract(egg, shapes[i]);
            x.push(wall);
        }
        console.log("union");
        var u = union(x);
        // we now need to carve up the walls
        // luckily, our (rounded) shapes are resting on Z=0 and touching x=0 and y=0
        var bb = measureAggregateBoundingBox(x);
        var maxwidth = bb[1][0] - bb[0][0];
        var maxdepth = bb[1][1] - bb[0][1];
        var cutterCube = cuboid({ size: [maxwidth * 5, maxdepth * 5, height * 5] });
        cutterCube = align({
            modes: ['center', 'center', 'max'],
            relativeTo: [0, 0, 0]
        }, cutterCube);
        console.log("bottom cut");
        u = subtract(u, cutterCube);
        cutterCube = align({
            modes: ['center', 'center', 'min'],
            relativeTo: [0, 0, height]
        }, cutterCube);
        console.log("top cut");
        u = subtract(u, cutterCube);
        return u;
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

