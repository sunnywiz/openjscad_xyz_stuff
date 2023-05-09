
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
    { name: 'height', type: 'number', initial: 50, min: 1.0, max: 100.0, step: 5, caption: 'Height of Tray' },    
    {
        name: 'choice', type: 'radio', caption: 'What To Generate',
        values: ['init', 'rawshape', 'roundedcuts', 'outlinedholders', 'tray','traywithcutout'],
        captions: ['Initial - nothing', 'Raw Shapes Arranged', 'Rounded Cuts Arranged', 'outlinedholders', 'Full Tray','Tray with cutout'],
        initial: 'init'
    },
    { name: 'grabY', type: 'number', initial: 10, min: 1.0, max: 300.0, step: 20, caption: 'Center of Cutout Y mm' },
]

const main = (params) => {

    var height = params.height;  // height of box, not of items
    var roundness = 3;
    var fit = 2;
    var bottom = 3;
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

    var server = solidByLengths(28, 1,
        [26, 26, 0, 0, 0, 0, 0, 0,
            9.5, 0, 0, 0, 0, 0, 0, 0,
            8, 14, 34, 39, 41, 41, 41, 40,
            39, 0, 0, 29]);
    server = scale([0.5, dtl, 1], server);

    var shapes = [bigSpoon, mirrorY(server)];

    // for debugging
    var c1 = [1, 0, 0, 0.5];
    var c2 = [0, 1, 0, 0.5];
    var c3 = [0, 0, 1, 0.5];

    if (params.choice == 'rawshape') {
        shapes = layout({ separation: between }, shapes);
        return shapes;
    }

    // extend up to the height we need them to be
    var projectedUpToHeightShapes = [];
    for (var i = 0; i < shapes.length; i++) {

        // this will not work for things that don't have flat bottom profiles

        var d = measureDimensions(shapes[i]);
        var sf = (height * 2) / d[2];
        if (sf < 1) sf = 1;
        var p1 = scaleZ(sf, shapes[i]);

        projectedUpToHeightShapes.push(p1);
    }

    if (params.choice == 'outlinedholders') {
        // this is different.  we need a double-expand .. and we're trying to just make sure things fit
        // it won't be in the same layout as the final, as intermediary not available
        var shelled = [];
        for (var i = 0; i < projectedUpToHeightShapes.length; i++) {
            var e1 = expand({ delta: roundness, corners: 'round', segments: 8 }, projectedUpToHeightShapes[i]);
            // expanding an expanded thing is too expensive, so this instead
            var e2 = expand({ delta: roundness + between, corners: 'round', segments: 8 }, projectedUpToHeightShapes[i]);
            var shell = subtract(e2, e1);
            shelled.push(shell);
        }

        var layedOutShells = layout({ seperation: 1 }, shelled);

        console.log("union");
        var u = union(layedOutShells);
        // we now need to carve up the walls
        var d = measureDimensions(u);
        var maxwidth = d[0];
        var maxdepth = d[1];
        var cutterCube = cuboid({ size: [maxwidth * 5, maxdepth * 5, height * 5] });
        cutterCube = align({
            modes: ['center', 'center', 'max'],
            relativeTo: [0, 0, roundness + between + 1]
        }, cutterCube);
        console.log("bottom cut");
        u = subtract(u, cutterCube);
        cutterCube = align({
            modes: ['center', 'center', 'min'],
            relativeTo: [0, 0, height - 1]
        }, cutterCube);
        console.log("top cut");
        u = subtract(u, cutterCube);
        return u;
    }

    var expandedProjected = [];
    var layedOutProjectedShapes = [];
    // make them rounder 

    var expandedProjected = [];
    for (var i = 0; i < projectedUpToHeightShapes.length; i++) {
        var e = expand({ delta: roundness, corners: 'round', segments: 8 }, projectedUpToHeightShapes[i]);
        expandedProjected.push(e);
    }

    // THEN lay them out. This will match the final
    layedOutProjectedShapes = layout({ separation: between }, expandedProjected);

    if (params.choice == 'roundedcuts') {
        return layedOutProjectedShapes;
    }

    var bb = measureAggregateBoundingBox(layedOutProjectedShapes);
    var width = bb[1][0] - bb[0][0] + (rim * 2);
    var depth = bb[1][1] - bb[0][1] + (rim * 2);
    var base = cuboid({
        size:
            [width, depth, height]
    });
    base = align({
        modes: ['min', 'min', 'min'],
        relativeTo: [bb[0][0] - rim, bb[0][1] - rim, bb[0][2] - bottom]
    }, base);

    for (var i = 0; i < layedOutProjectedShapes.length; i++) {
        base = subtract(base, layedOutProjectedShapes[i]);
    }

    if (params.choice == 'tray') { 
        return base;
    }

    if (params.choice =='traywithcutout') {
        // grabber
        var grab = cylinder({ radius: height - bottom, height: width + rim * 2, segments: 128 });
        grab = rotate([0, TAU / 4, 0], grab)
        grab = align({
            modes:['min','min','min'],
            relativeTo: [bb[0][0] - rim, bb[0][1] - rim, bb[0][2] - bottom]
        },grab)
        grab = translate([0, params.grabY, bottom], grab);
    
        base = subtract(base, grab);
        return base;
    }
    
    throw("do not know "+params.choice);
}

module.exports = { main, getParameterDefinitions }

