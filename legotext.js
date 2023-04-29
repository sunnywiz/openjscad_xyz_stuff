/**
 * 3D Primitives Demonstration
 * @category Creating Shapes
 * @skillLevel 1
 * @description Demonstrating the basics of a variety of 3D primitives
 * @tags cube, cuboid, sphere, ellipsoid, cylinder, torus, shape, 3d
 * @authors Rene K. Mueller, Moissette Mark, Simon Clark
 * @licence MIT License
 */

const jscad = require('@jscad/modeling')
const { cuboid, sphere, roundedCuboid, cylinder } = jscad.primitives
const { translate, rotate, align } = jscad.transforms
const { expand } = jscad.expansions
const { hull, hullChain } = jscad.hulls
const { colorize, hslToRgb, colorNameToRgb, hexToRgb, hsvToRgb } = jscad.colors
const { union, subtract, intersect } = jscad.booleans
const { TAU } = jscad.maths.constants
const { measureAggregateBoundingBox, measureBoundingBox } = jscad.measurements



const main = () => {

    var template =
        "###\n" +
        "#\n" +
        "##";

    var shapes = [];
    var x = 0;
    var y = 0;

    for(var i=0, len=template.length; i<len; i++) {
        x++; 
        var ch = template[i];
        if (ch == '\n' || ch=='\r') { 
            x = 0; 
            y++; 
        } else { 
            var s = null; 
            if (ch='#') { 
                // always in the box 0,0,0-1,1,10
                s = translate([0.5,0.5,0.5],cuboid({size:[1,1,1]}));
            }
            if (s != null) { 
                s = translate([x,-y,0],s);
                shapes.push(s); 
            }
        }
    }
    return s; 
}

module.exports = { main }
