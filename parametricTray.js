
// Upload parent folder to https://openjscad.xyz

const jscad = require('@jscad/modeling')
const { cuboid, cylinder, roundedCuboid } = jscad.primitives
const { translate, rotate, align, scaleZ} = jscad.transforms
const { expand} = jscad.expansions
const { colorize } = jscad.colors
const { union, subtract, intersect } = jscad.booleans
const { TAU } = jscad.maths.constants
const { measureAggregateBoundingBox, measureDimensions } = jscad.measurements

const { layout } = require('./lib/layout.js');

const getParameterDefinitions = () => [
    { 
        name: 'whichModel',
        type:'choice',
        values:[
            'biggerSpoons.js',
            'cutlery.js',
            'bathroomThings.js'
        ],
        caption:'Which items to build a tray for?',
        initial:'biggerspoons.js'},
    { name: 'height', type: 'number', initial: 50, min: 1.0, max: 100.0, step: 5, caption: 'Height of Tray' },    
    {
        name: 'choice', type: 'choice', caption: 'What To Generate',
        values: ['init', 'rawshape', 'roundedcuts', 'outlinedholders', 'tray','traywithcutout'],
        captions: ['Initial - nothing', 'Raw Shapes Arranged', 'Rounded Cuts Arranged', 'outlinedholders', 'Full Tray','Tray with cutout'],
        initial: 'init'
    },
    { name: 'grabY', type: 'number', initial: 10, min: 1.0, max: 300.0, step: 20, caption: 'Center of Cutout Y mm' },
]

const main = (params) => {

    if (params.choice == 'init') return cuboid();

    const { getShapesAndLayout }  = require('./'+params.whichModel);

    var mal = getShapesAndLayout(); 
    var shapes = mal.shapes;
    var lo = mal.layoutOptions; 

    var height = params.height;  // height of box, not of items
    var roundness = 3;
    var fit = 2;
    var bottom = 3;
    var rim = 3;
    var between = 2;

    // for debugging
    var c1 = [1, 0, 0, 0.5];
    var c2 = [0, 1, 0, 0.5];
    var c3 = [0, 0, 1, 0.5];

    if (params.choice == 'rawshape') {
        shapes = layout(lo, shapes);
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

        var layedOutShells = layout(lo, shelled);

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
    layedOutProjectedShapes = layout(lo, expandedProjected);

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
        // hand shaped cutter - 3 fingers is 50mm
        var grab = 
        roundedCuboid({ 
            size: [width+roundness*2, 50+roundness*2, roundness*2+height-bottom], 
            roundRadius: roundness, 
            segments: 32 });
        grab = align({
            modes:['min','min','min'],
            relativeTo: [bb[0][0] - rim - roundness, bb[0][1] - rim - roundness, bb[0][2] - bottom]
        },grab)
        grab = translate([0, params.grabY, bottom], grab);
    
        base = subtract(base, grab);
        return base;
    }
    
    throw("do not know "+params.choice);
}

module.exports = { main, getParameterDefinitions }

