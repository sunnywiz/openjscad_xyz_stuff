

const jscad = require('@jscad/modeling')
const { cuboid, cylinder } = jscad.primitives
const { translate, rotate, align, scale, scaleZ, mirrorY } = jscad.transforms
const { expand, offset } = jscad.expansions
const { colorize } = jscad.colors
const { union, subtract, intersect } = jscad.booleans
const { TAU } = jscad.maths.constants
const { measureAggregateBoundingBox, measureBoundingBox, measureDimensions } = jscad.measurements
const { hull, hullChain } = jscad.hulls

const { solidByLengths } = require('./solidByLengths.js');
const { layout } = require('./layout.js');

const main = (params) => {

    var toothpaste = cuboid({ size: [42, 54, 20] });

    var r = 16;
    var l = 44;
    var c1 = cylinder({ radius: r });
    var c2 = translate([0, l - r * 2, 0], c1);

    var flonase = hull([c1, c2]);

    var r1 = 26/2;
    var r2 = 34/2;
    var l = 70;
    var c1 = cylinder({ radius: r1 });
    var c1b = translate([0, l - r * 2, 0], c1);
    var c2 = cylinder({ radius: r2 });
    var c2 = translate([0, l / 2 - r, 0], c2);
    var deodorant = hull([c1, c2, c1b]);

    return layout({ separator: 5 }, [deodorant, flonase, toothpaste]);

}

module.exports = { main }; 