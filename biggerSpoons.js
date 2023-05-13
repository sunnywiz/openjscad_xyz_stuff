
const jscad = require('@jscad/modeling')
const { scale, mirrorY } = jscad.transforms
const { solidByLengths } = require('./lib/solidByLengths.js');

// this could almost be its own thing but i needed solidByLengths, so oh well. 

const getShapesAndLayout = () => { 

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
    
        return { 
            shapes: [bigSpoon, mirrorY(server)], 
            layoutOptions: {}
         };

}

module.exports = { getShapesAndLayout }

