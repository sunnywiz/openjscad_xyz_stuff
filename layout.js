

const jscad = require('@jscad/modeling')
const { cuboid, cylinder } = jscad.primitives
const { translate, rotate, align, scale } = jscad.transforms
const { expand, offset } = jscad.expansions
const { colorize } = jscad.colors
const { union, subtract, intersect } = jscad.booleans
const { TAU } = jscad.maths.constants
const { measureDimensions,
    measureVolume } = jscad.measurements
const { hullChain } = jscad.hulls

// o.separation = minimum how far apart

const layout = (o,shapes) => {

    if (!o.separation) o.separation= 1; 

    var widest = 0;
    var deepest = 0;
    for (var i = 0; i < shapes.length; i++) {
        var bb = measureDimensions(shapes[i]);
        if (bb[1] > deepest) { deepest = bb[1]; }
        if (bb[0] > widest) { widest = bb[0]; }
    }

    var startx = 0;
    shapes[0] = align({
        modes: ['min', 'min', 'min'],
        relativeTo: [startx, 0, 0]
    }, shapes[0]);

    for (var i = 1; i < shapes.length; i++) {
        var prevShape = shapes[i - 1];
        var bb = measureDimensions(shapes[i-1]);
        var tryx = startx + bb[0]; 
        var found = 0; 

        for (var tryx = startx+bb[0];
            (found == 0) && (tryx > startx + o.separation);
            tryx -= (o.separation/2)) {
                
            shapes[i] = align({
                modes: ['min', 'min', 'min'],
                relativeTo: [tryx, 0, 0]
            }, shapes[i]);

            var vi = measureVolume(
                intersect(
                    prevShape, shapes[i]
                )
            );
            console.log("at " + tryx + " volume is " + vi);
            if (vi > 0) {
                // we found them! 
                found=1; 
                // back it up a bit
                tryx += o.separation *1.5; 
                shapes[i] = align({
                    modes: ['min', 'min', 'min'],
                    relativeTo: [tryx, 0, 0]
                }, shapes[i]);
            }
        }
        if (!found) {
            console.log("Could not find a spot where they interesect!")
            // leave them where we last tested them
        } 
        startx = tryx; 
    }

    return shapes;
}

module.exports = { layout }
