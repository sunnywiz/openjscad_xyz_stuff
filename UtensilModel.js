/**
 * pop this in openjscad.xyz
 */

const jscad = require('@jscad/modeling')
const { cuboid, sphere, roundedCuboid } = jscad.primitives
const { translate } = jscad.transforms
const { hull, hullChain } = jscad.hulls

const main = (params) => {

    var lengthMM = 100; 
    var heightMM = 50; 
    var measureMents=[10,20,15,10,10,10,20,30,20]; 
    var extraRoundness = 5; 

    var shapes = [];
    var perItemLength = (lengthMM * 1.0 ) / (measureMents.length); 

    var shapes = [];
    for (var i=0; i<measureMents.length; i++) { 

        var cuboid = roundedCuboid( { 
            size: [ perItemLength+extraRoundness*2, measureMents[i]+extraRoundness*2, heightMM+extraRoundness*2], 
            roundRadius: extraRoundness,
            segments: 16
        }); 
        var translated = translate([perItemLength * i,0,0],cuboid);
        shapes.push(translated); 
    }

/*    const shapes = [
        translate([10, 0, 5], sphere({ radius: 2, segments: 16 })),
        translate([-3, 0, 0], sphere({ radius: 3.5, segments: 16 })),
        translate([0, 10, -3], sphere({ radius: 5, segments: 16 })),
        translate([5, 5, -10], cuboid({ size: [15, 17, 2] }))
    ]
    if (params.doHull === 'hull') {
        return hull(shapes)
    } else if (params.doHull === 'chain') {
        return hullChain(shapes)
    } else {
        return shapes
    }*/
    return hullChain(shapes); 
}

module.exports = { main }
