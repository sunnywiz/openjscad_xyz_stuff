

const jscad = require('@jscad/modeling')
const { cuboid, cylinder } = jscad.primitives
const { translate, rotate, align, scale } = jscad.transforms
const { expand, offset } = jscad.expansions
const { colorize } = jscad.colors
const { union, subtract, intersect } = jscad.booleans
const { TAU } = jscad.maths.constants
const { measureAggregateBoundingBox,
    measureBoundingBox,
    measureVolume } = jscad.measurements
const { hullChain } = jscad.hulls

const arrange = (shapes) => {

    var widest = 0;
    var deepest = 0;
    for (var i = 0; i < shapes.length; i++) {
        var bb = measureBoundingBox(shapes[i]);
        var sx = bb[1][0] - bb[0][0];
        var sy = bb[1][1] - bb[0][1];
        var sz = bb[1][2] - bb[0][2];
        if (sy > deepest) { deepest = sy; }
        if (sx > widest) { widest = sx; }
    }

    var stepx = 0.25;
    var minwidth = 1;

    var startx = 0;
    shapes[0] = align({
        modes: ['min', 'min', 'min'],
        relativeTo: [startx, 0, 0]
    }, shapes[0]);

    for (var i = 1; i < shapes.length; i++) {
        var prevShape = shapes[i - 1];

        var found = 0;
        for (var tryx = startx;
            (found == 0) && (tryx < startx + widest);
            tryx += stepx) {
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
            if (vi == 0) {
                // we found a spot where they don't intersect 
                startx = tryx + minwidth;
                found = 1;
            }
        }
        if (!found) {
            console.log("Could not find a spot")
        } else {
            shapes[i] =
                align({
                    modes: ['min', 'min', 'min'],
                    relativeTo: [startx, 0, 0]
                }, shapes[i]);
        }
    }

    return shapes;
}

const projectup = (shapes) => {
    var projectheight = 10;
    for (var i = 0; i < shapes.length; i++) {
        c = translate([0, 0, projectheight], shapes[i]);
        h = hullChain([shapes[i], c]);
        shapes[i] = h;
    }
    return shapes;
}

const main = (params) => {

    var shapes = [];
    shapes.push(
        union(
            align(
                { modes: ['min', 'max', 'min'] },
                cuboid({ size: [1, 4, 1] }),
                cuboid({ size: [4, 1, 1] })
            )
        )
    );
    shapes.push(rotate([TAU / 4, TAU / 4, 0], cylinder()));
    shapes.push(cuboid({ size: [1, 3, 0.1] }));

    shapes = projectup(shapes);

    shapes = arrange(shapes);

    return shapes;
}

module.exports = { main }
