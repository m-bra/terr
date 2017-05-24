
window.onload = init;

function init() {
    let canvas = document.getElementById('boardcanvas');

    const util = require('coffee-loader!./util.coffee');
    let {Cells, Cell} = require('coffee-loader!./cells.coffee');
    let cells = new Cells(512, 512);
    let graphics = require('coffee-loader!./graphics.coffee');
    let Viewport = graphics.Viewport;

    let hexWidth = 40;
    let hexHeight = hexWidth / Math.cos(Math.PI / 6);
    let hexSideHeight = hexWidth * Math.tan(Math.PI / 6);

    let cellWidth = hexWidth;
    let cellHeight = (hexHeight + hexSideHeight) / 2;

    let hiddenCanvasWidth = cellWidth, hiddenCanvasHeight = cellHeight;
    hiddenCanvasWidth-= hiddenCanvasWidth % cellWidth;
    hiddenCanvasHeight-= hiddenCanvasHeight % cellHeight;
    canvas.width = (window.innerWidth + 2*hiddenCanvasWidth);
    canvas.height = (window.innerHeight + 2*hiddenCanvasHeight);
    canvas.style.width  = util.toStylePx(canvas.width);
    canvas.style.height = util.toStylePx(canvas.height);
    util.setStylePos(canvas.style, [-hiddenCanvasWidth, -hiddenCanvasHeight]);
    let context = canvas.getContext('2d');

    let dragX = 0;
    let dragY = 0;
    let dragDistance = 0;
    let isDragging = false;
    let minDragDistance = 20;

    let canvasShift = [0, 0];
    let viewport = new Viewport({cellWidth: cellWidth, cellHeight: cellHeight});

    let render = function(canvasRegion) {
        let region = {};
        region.width = Math.floor(canvasRegion.width / viewport.cellWidth()) + 1;
        region.height = Math.floor(canvasRegion.height / viewport.cellHeight()) + 1;
        region.floatY = (canvasShift[1] + canvasRegion.y) / viewport.cellHeight();
        region.floatX = (canvasShift[0] + canvasRegion.x) / viewport.cellWidth() - region.floatY/2;
        region.x = Math.floor(region.floatX);
        region.y = Math.floor(region.floatY);
        let shift = [-canvasShift[0] + (region.x - region.floatX),
            -canvasShift[1] + (region.y - region.floatY)];
        graphics.render(context, viewport, region, shift, cells);
    };

    canvas.addEventListener('mousemove', function(event){
        let x = event.pageX, y = event.pageY;
        let dx = x - dragX, dy = y - dragY;
        dragX = x; dragY = y;

        dragDistance+= dragX + dragY;

        if (isDragging && dragDistance > minDragDistance) {
            let [left, top] = util.getStylePos(canvas.style);
            left+= dx;
            top+= dy;

            // TODO: Only rerender new part.
            // TODO: Grow canvas instead of just moving

            if (left > 0) {
                left-= hiddenCanvasWidth;
                canvasShift[0]-= hiddenCanvasWidth;
                let data = context.getImageData(0, 0, canvas.width, canvas.height);
                canvas.width+= hiddenCanvasWidth;
                canvas.style.width = util.toStylePx(hiddenCanvasWidth +
                    util.fromStylePxStr(canvas.style.width));
                context.putImageData(data, hiddenCanvasWidth, 0);
                render({x: 0, y: 0, width: hiddenCanvasWidth, height: canvas.height});
            }
            if (top > 0) {
                top-= hiddenCanvasHeight;
                canvasShift[1]-= hiddenCanvasHeight;
                let data = context.getImageData(0, 0, canvas.width, canvas.height);
                canvas.height+= hiddenCanvasHeight;
                canvas.style.height = util.toStylePx(hiddenCanvasHeight +
                    util.fromStylePxStr(canvas.style.height));
                context.putImageData(data, hiddenCanvasHeight, 0);
                render({x: 0, y: 0, width: canvas.width, height: hiddenCanvasHeight});
            }
            if (left + canvas.width < window.innerWidth) {
                let data = context.getImageData(0, 0, canvas.width, canvas.height);
                canvas.width+= hiddenCanvasWidth;
                canvas.style.width = util.toStylePx(hiddenCanvasWidth +
                    util.fromStylePxStr(canvas.style.width));
                context.putImageData(data, 0, 0);
                render({x: canvas.width - hiddenCanvasWidth, y: 0,
                    width: hiddenCanvasWidth, height: canvas.height});
            }
            if (top + canvas.height < window.innerHeight) {
                let data = context.getImageData(0, 0, canvas.width, canvas.height);
                canvas.height+= hiddenCanvasHeight;
                canvas.style.height = util.toStylePx(hiddenCanvasHeight +
                    util.fromStylePxStr(canvas.style.height));
                context.putImageData(data, 0, 0);
                render({x: 0, y: canvas.height - hiddenCanvasHeight,
                    width: canvas.width, height: hiddenCanvasHeight});
            }

            util.setStylePos(canvas.style, [left, top]);
        }
    });

    canvas.addEventListener('mousedown', function(event) {
        isDragging = true;
        dragDistance = 0;
        dragX = event.pageX;
        dragY = event.pageY;
    });

    canvas.addEventListener('mouseup', function(event) {
        isDragging = false;

        let isLeftClick = event.button == 0;
        let x = event.pageX;
        let y = event.pageY;
        console.log("x" + x + "y" + y);

        if (dragDistance < minDragDistance)
        {
            let [left, top] = util.getStylePos(canvas.style);
            let startCoords = viewport.getCellCoords([canvasShift[0] + x - left, canvasShift[1] + y - top]);
            console.log(startCoords);
            cells.forBlock(startCoords[0], startCoords[1], function(cx, cy){
                cells.setBlockID(cx, cy, Cell.withGlobalTerrID(isLeftClick ? 1 : 2));
            });

            render({x: 0, y: 0, width: canvas.width , height: canvas.height});
        }
    });

    canvas.addEventListener('contextmenu', function(e){e.preventDefault(); return false});

    render({x: 0, y: 0, width: canvas.width , height: canvas.height});
}
