
window.onload = initMainModule;

function initMainModule() {
    const canvas = document.getElementById('boardcanvas');

    const util = require('coffee-loader!./util.coffee');
    const {Cells, Cell} = require('coffee-loader!./cells.coffee');
    let cells = new Cells(512, 512);
    const graphics = require('coffee-loader!./graphics.coffee');
    const Viewport = graphics.Viewport;

    const hexWidth = 40;
    const hexHeight = hexWidth / Math.cos(Math.PI / 6);
    const hexSideHeight = hexWidth * Math.tan(Math.PI / 6);

    const cellWidth = hexWidth;
    const cellHeight = (hexHeight + hexSideHeight) / 2;
    
    const chunkWidth = 16 * cellWidth, chunkHeight = 16 * cellHeight;
    let renderChunks = {
        /*
         * For example
         * 
         * 1: {
         *   2: undefined // not rendered
         *   3: context.getImageData(..) // rendered
         * },
         * 2: {...}
         */
         shown: {
            x: 0, y: 0,
         },
         getChunk: function(x, y) {
            if (x in this)
                if (y in this[x])
                    return this[x][y];
            return undefined;
         },
         getChunkOr: function(x, y, f) {
            if (!getChunk(x, y))
                return f();
         },
         setChunk: function(x, y, chunk) {
            if (!(x in this))
                this[x] = {};
            this[x][y] = chunk;
         },
    };
    util.setCanvasWidth(canvas, 0);
    util.setCanvasHeight(canvas, 0);
    util.setStylePos(canvas.style, [0, 0]);
    let context = canvas.getContext('2d');
    let viewport = new Viewport({cellWidth: cellWidth, cellHeight: cellHeight});

    function renderCanvasRegion(canvasRegion) {
        let cregion = {};
        cregion.width = Math.floor(canvasRegion.width / viewport.cellWidth()) + 1;
        cregion.height = Math.floor(canvasRegion.height / viewport.cellHeight()) + 1;
        
        canvasShift = [
            renderChunks.shown.x * chunkWidth,
            renderChunks.shown.y * chunkHeight
        ];
        
        cregion.floatY = (canvasShift[1] + canvasRegion.y) / viewport.cellHeight();
        cregion.floatX = (canvasShift[0] + canvasRegion.x) / viewport.cellWidth() - cregion.floatY/2;
        cregion.x = Math.floor(cregion.floatX);
        cregion.y = Math.floor(cregion.floatY);
        let shift = [-canvasShift[0] + (cregion.x - cregion.floatX),
            -canvasShift[1] + (cregion.y - cregion.floatY)];
        graphics.render(context, viewport, cregion, shift, cells);
    };
    
    function renderChunk([chunkX, chunkY]) {
        const region = {
            x: (chunkX - renderChunks.shown.x) * chunkWidth,
            y: (chunkY - renderChunks.shown.y) * chunkHeight,
            width: chunkWidth,
            height: chunkHeight,
        };
        
        const chunkData = renderChunks.getChunk(chunkX, chunkY);
        if (chunkData) { 
            // let's just hope chunkData has the right size
            context.putImageData(region.x, region.y, chunkData);
        }
        else {
            renderCanvasRegion(region);
            const newChunkData = context.getImageData(region.x, region.y, region.width, region.height);
            renderChunks.setChunk(chunkX, chunkY, newChunkData);
        }
    }
    
    // moves/resizes, if needed, the canvas to contain the given chunk
    // without moving the already shown chunks
    // updates renderChunks.shown accordingly
    function fitCanvasForChunk(chunkCoords) {
        let [chunkX, chunkY] = chunkCoords;
        const relChunkCoords = [
            (chunkX - renderChunks.shown.x),
            (chunkY - renderChunks.shown.y)
        ];
        
        let chunkSize = [chunkWidth, chunkHeight];
        
        const canvasPos = util.getStylePos(canvas.style);
        const canvasSize = util.getCanvasSize(canvas);
        let newCanvasPos = canvasPos;
        let newCanvasSize = canvasSize;
        let update = false;
        
        for (let i = 0; i < 2; ++i) {
            if (relChunkCoords[i] < 0) {
                newCanvasPos[i]-= -relChunkCoords[i] * chunkSize[i];
                newCanvasSize[i]+= -relChunkCoords[i] * chunkSize[i];
                update = true;
            }
            if (relChunkCoords[i] > Math.floor(canvasSize[i] / chunkSize[i])) {
                newCanvasSize[i] = (1 + relChunkCoords[i]) * chunkSize[i];
                update = true;
            }
        }
        
        if (update) {
            const data = context.getImageData(0, 0, canvasSize[0], canvasSize[1]);
            util.setStylePos(canvas.style, newCanvasPos);
            util.setCanvasWidth(canvas, newCanvasSize[0]);
            util.setCanvasHeight(canvas, newCanvasSize[1]);
            context.putImageData(data, canvasPos[0] - newCanvasPos[0], canvasPos[1] - newCanvasPos[1]);   
            renderChunks.shown.x+= Math.floor((newCanvasPos[0] - canvasPos[0]) / chunkWidth);
            renderChunks.shown.y+= Math.floor((newCanvasPos[1] - canvasPos[1]) / chunkHeight);
            console.log("Do I have to floor this shit?" + renderChunks);
        }              
    }
    
    function fitCanvasForWindow() {
        const canvasPos = util.getStylePos(canvas.style);
        
        const [left, top] = canvasPos;
        
        const chunksRange = [
            Math.ceil(canvas.width / chunkWidth), // TODO sometimes we need ceil. check for other places, too.
            Math.ceil(canvas.height / chunkHeight),
        ];

        let chunks = [];
        if (left > 0) {
            for (let j = 0; j < chunksRange[1]; ++j) 
                chunks.push([renderChunks.shown.x - 1, renderChunks.shown.y + j]);
        }
        else if (top > 0) {
            for (let i = 0; i < chunksRange[0]; ++i)
                chunks.push([renderChunks.shown.x + i, renderChunks.shown.y - 1]);
        }
        else if (left + canvas.width < window.innerWidth) {
            for (let j = 0; j < chunksRange[1]; ++j) 
                chunks.push([renderChunks.shown.x + chunksRange[0], renderChunks.shown.y + j]);
        }
        else if (top + canvas.height < window.innerHeight) {
            for (let i = 0; i < chunksRange[0]; ++i)
                chunks.push([renderChunks.shown.x + i, renderChunks.shown.y + chunksRange[1]]);
        }
        
        for (let i = 0; i < chunks.length; ++i) {
            fitCanvasForChunk(chunks[i]);
            renderChunk(chunks[i]);
        }
    }
    
    let dragX = 0;
    let dragY = 0;
    let dragDistance = 0;
    let isDragging = false;
    let minDragDistance = 70;

    canvas.addEventListener('mousemove', function(event) {
        let x = event.pageX, y = event.pageY;
        let dx = x - dragX, dy = y - dragY;
        dragX = x; dragY = y;

        dragDistance+= dragX + dragY;

        if (isDragging && dragDistance > minDragDistance) {
            let canvasPos = util.getStylePos(canvas.style);
            canvasPos[0]+= dx;
            canvasPos[1]+= dy;
            util.setStylePos(canvas.style, canvasPos);            
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

        if (dragDistance < minDragDistance)
        {
            let [left, top] = util.getStylePos(canvas.style);
            let startCoords = viewport.getCellCoords([
                renderChunks.shown.x * chunkWidth + x - left, 
                renderChunks.shown.y * chunkHeight + y - top
            ]);
            cells.forBlock(startCoords[0], startCoords[1], function(cx, cy){
                cells.setBlockID(cx, cy, Cell.withGlobalTerrID(isLeftClick ? 1 : 2));
            });

            renderChunk([
                Math.floor((x-left) / chunkWidth) + renderChunks.shown.x,
                Math.floor((y-top) / chunkHeight) + renderChunks.shown.y
            ]);
        }
    });

    canvas.addEventListener('contextmenu', function(e){e.preventDefault(); return false});

    fitCanvasForWindow();
}
