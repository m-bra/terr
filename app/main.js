
'use strict';

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

    const cellWidth = Math.floor(hexWidth);
    const cellHeight = Math.floor((hexHeight + hexSideHeight) / 2);
    
    const chunkWidth = 4, chunkHeight = 4;
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
    
    function renderChunk([chunkX, chunkY], nocache) {
        nocache = true;
        const canvasRegion = {
            x: (chunkX - renderChunks.shown.x) * chunkWidth * cellWidth,
            y: (chunkY - renderChunks.shown.y) * chunkHeight * cellHeight,
            width: chunkWidth * cellWidth,
            height: chunkHeight * cellHeight,
        };
        
        const chunkData = renderChunks.getChunk(chunkX, chunkY);
        if (chunkData && !nocache) { 
            // let's just hope chunkData has the right size
            context.putImageData(chunkData, canvasRegion.x, canvasRegion.y);
        }
        else {
            let cregion = {};
            cregion.width = chunkWidth;
            cregion.height = chunkHeight;
            
            const canvasShift = [
                renderChunks.shown.x * chunkWidth * cellWidth,
                renderChunks.shown.y * chunkHeight * cellHeight
            ];
            
            cregion.y = chunkY * chunkHeight;
            let shiftX = cregion.y / 2;
            cregion.x = chunkX * chunkWidth - Math.floor(shiftX);
            if (cregion.y % 2 != 0)
                console.log("no, i think you don't understand. chunkHeight must be a multiple of two!");
     
            let shift = [-canvasShift[0], -canvasShift[1]];
            
            cregion.x-= 1;
            cregion.y-= 1;
            cregion.width+= 2;
            cregion.height+= 2;
            graphics.render(context, viewport, cregion, shift, cells);
            
            const newChunkData = context.getImageData(canvasRegion.x, canvasRegion.y, 
                    canvasRegion.width, canvasRegion.height);
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
        
        let chunkSize = [chunkWidth * cellWidth, chunkHeight * cellHeight];
        
        const canvasPos = util.getStylePos(canvas.style);
        const canvasSize = util.getCanvasSize(canvas);
        let newCanvasPos = [canvasPos[0], canvasPos[1]];
        let newCanvasSize = [canvasSize[0], canvasSize[1]];
        let update = false;
        
        for (let i = 0; i < 2; ++i) {
            if (relChunkCoords[i] < 0) {
                newCanvasPos[i]-= -relChunkCoords[i] * chunkSize[i];
                newCanvasSize[i]+= -relChunkCoords[i] * chunkSize[i];
                update = true;
            }
            if (relChunkCoords[i] >= Math.ceil(canvasSize[i] / chunkSize[i])) {
                newCanvasSize[i] = (1 + relChunkCoords[i]) * chunkSize[i];
                update = true;
            }
        }
        
        if (update) {
            const data = canvasSize[0] * canvasSize[1] 
                ? context.getImageData(0, 0, canvasSize[0], canvasSize[1])
                : null;
            util.setStylePos(canvas.style, newCanvasPos);
            util.setCanvasWidth(canvas, newCanvasSize[0]);
            util.setCanvasHeight(canvas, newCanvasSize[1]);
            if (data)
                context.putImageData(data, canvasPos[0] - newCanvasPos[0], canvasPos[1] - newCanvasPos[1]);   
            renderChunks.shown.x+= Math.floor((newCanvasPos[0] - canvasPos[0]) / (chunkWidth*cellWidth));
            renderChunks.shown.y+= Math.floor((newCanvasPos[1] - canvasPos[1]) / (chunkHeight*cellHeight));
            console.log("Do I have to floor this shit?" + renderChunks.shown.x);
        }              
    }
    
    function fitCanvasForWindow() {
        const canvasPos = util.getStylePos(canvas.style);
        
        const [left, top] = canvasPos;
        
        const chunksRange = [
            Math.ceil(canvas.width / (chunkWidth*cellWidth)), // TODO sometimes we need ceil. check for other places, too.
            Math.ceil(canvas.height / (chunkHeight*cellHeight)),
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
        return chunks.length > 0;
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
            fitCanvasForWindow();         
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
                renderChunks.shown.x * chunkWidth*cellWidth + x - left, 
                renderChunks.shown.y * chunkHeight*cellHeight + y - top
            ]);
            let dirtyChunks = {};
            cells.forBlock(startCoords[0], startCoords[1], function(cx, cy){
                cells.setBlockID(cx, cy, Cell.withGlobalTerrID(isLeftClick ? 1 : 2));
                const chunkY = Math.floor(cy / chunkHeight);
                const chunkX = Math.floor((cx+cy/2) / chunkWidth);
                dirtyChunks[chunkX.toString() + ";" + chunkY.toString()] = true;
            });
            
            for (let chunk in dirtyChunks)
                if (dirtyChunks.hasOwnProperty(chunk))
                {
                    const strs = chunk.split(";");
                    const chunkXY = [parseInt(strs[0]), parseInt(strs[1])];
                    console.log("render" + chunkXY);
                    renderChunk(chunkXY, true);
                }
        }
    });

    canvas.addEventListener('contextmenu', function(e){e.preventDefault(); return false});

    fitCanvasForChunk([0, 0]);
    renderChunk([0, 0]);
    while (fitCanvasForWindow()) ;
}
