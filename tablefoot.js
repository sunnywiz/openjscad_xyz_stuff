

const jscad = require('@jscad/modeling')
const { cube, cuboid, cylinder, cylinderElliptic, ellipsoid, geodesicSphere, roundedCuboid, roundedCylinder, sphere, torus } = jscad.primitives
const { translate, align } = jscad.transforms
const { union,subtract } =jscad.booleans
const { generalize } = jscad.modifiers

const main = () => {
  var c1 = cylinder({ radius: 11, height: 9.1 });
  // 2.3 d, 25 tall
  // 8 to 2.8 d, 3mm tall
  // 2.8d, 8.2 tall
  var s1 = cylinderElliptic({ 
    height: 3, 
    startRadius:[8/2,8/2], 
    endRadius:[2.8/2,2.8/2] 
  }); 
  var s2 = cylinder({height:8.2, radius:2.8/2}); 
  var s3 = cylinder({height:25, radius:2.5/2}); 
  var a = align({
    modes:['center','center','min']
  },[s1,s2,s3]); 
  var screw = union(a);
  
  a=align({
    modes:['center','center','min']
  },[c1, screw]); 
  var x= subtract(a[0],a[1]);
  return generalize({snap:true,simplify:true,triangulate:true},[x]);
}

module.exports = { main }
