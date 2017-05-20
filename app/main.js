
window.onload = init;

function init() {
    let cells = new (require('coffee-loader!./cells.coffee').Cells)(32, 32);
    let Graphics = require('./graphics.js');
    let graphics = new Graphics(22);
    let render = graphics.render;
    let getCellPos = graphics.getCellPos;
    let getCellCoords = graphics.getCellCoords;

    let canvas = document.getElementById('boardcanvas');
    let context = canvas.getContext('2d');

    context.canvas.width  = window.innerWidth;
    context.canvas.height = window.innerHeight;

    function listener(isLeftClick) {return function(event) {
        if (!isLeftClick)
            event.preventDefault();

        let x = event.pageX - canvas.offsetLeft;
        let y = event.pageY - canvas.offsetTop;
        let startCoords = graphics.getCellCoords(x, y);
        cells.forBlock(startCoords[0], startCoords[1], function(cx, cy){
            cells.cells[cx][cy].territoryID = isLeftClick ? 1 : 2;
        });


        graphics.render(context, cells);

        if (!isLeftClick)
            return false;
    }}

    canvas.addEventListener('click', listener(true));
    canvas.addEventListener('contextmenu', listener(false));

    graphics.render(context, cells);
}
