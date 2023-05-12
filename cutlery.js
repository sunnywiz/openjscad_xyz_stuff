
const jscad = require('@jscad/modeling')
const { translateX, scale, mirrorY,mirrorX } = jscad.transforms
const { solidByLengths } = require('./solidByLengths.js');
const { layout } = require('./layout.js');

// this could almost be its own thing but i needed solidByLengths, so oh well. 

const getModels = () => { 


    // lego: 143.8mm = 18 dots
    var dtl = 143.8 / 18;

    // using 0,0 as being "skip this block"
    var knife = solidByLengths(30, 2,
        [1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [2, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0.1]);
    knife = scale([dtl, dtl, 1], knife);

    var bigfork = solidByLengths(26, 2,
        [1.5, 0,
            1.5, 0, 0, 0, 0, 0,
            .5, 0, 0, 0, 0, 0.5,
            0, 0, 1.7,
            0, 0, 0, 0, 0, 1.5, 0, 1.5]);
    bigfork = scale([dtl, dtl, 1], bigfork);

    var fork = solidByLengths(24, 2,
        [1.5, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0.5, 0, 1.5, 0, 0, 1.6, 0, 0, 0, 0, 0, 1.5]);
    fork = scale([dtl, dtl, 1], fork);

    // set up on a lego "jigsaw" 
    // measure the widths in mm at each stage
    var spoon = solidByLengths(21, 2,
        [18.6, 18.6, 0, 0
            , 12, 10.1, 8.5, 7.3,
            0, 0, 0, 0,
            7.3, 19, 30, 33.8,
            33.9, 33.1, 30.0, 25.2,
            17.4]);
    spoon = scale([0.5, dtl, 1], spoon);

    var chopstick = solidByLengths(103 + 124, 2,
        [5.7 / 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.5 / 2]);
    // straight measurements, not lego scale.
    // two chopsticks side by side though
    chopstick = scale([2,1,1], chopstick); 

    var shapes = [chopstick,
        knife,
        mirrorX(knife),
        bigfork,
        mirrorY(fork),
        spoon,
        mirrorY(spoon)
    ];

    return shapes;     
}

const main = (params) => {
    return layout({separation:10},getModels()); 
}

module.exports = { getModels, main }
