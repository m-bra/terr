/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var componentToHex, fromStylePxStr, getStylePos, rgbToHex, setCanvasHeight, setCanvasWidth, setStylePos, toStylePx;

componentToHex = function(c) {
  var hex;
  hex = c.toString(16);
  if (hex.length === 1) {
    return "0" + hex;
  } else {
    return hex;
  }
};

rgbToHex = function(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

toStylePx = function(px) {
  return px.toString() + 'px';
};

fromStylePxStr = function(str) {
  return parseInt(str.substring(0, str.length - 2));
};

getStylePos = function(style) {
  return [!style.left ? 0 : fromStylePxStr(style.left), !style.top ? 0 : fromStylePxStr(style.top)];
};

setStylePos = function(style, pos) {
  style.position = 'absolute';
  style.left = toStylePx(pos[0]);
  style.top = toStylePx(pos[1]);
};

setCanvasWidth = function(canvas, width) {
  canvas.width = width;
  return canvas.style.width = toStylePx(width);
};

setCanvasHeight = function(canvas, height) {
  canvas.height = height;
  return canvas.style.height = toStylePx(height);
};

module.exports = {
  rgbToHex: rgbToHex,
  toStylePx: toStylePx,
  fromStylePxStr: fromStylePxStr,
  getStylePos: getStylePos,
  setStylePos: setStylePos,
  setCanvasHeight: setCanvasHeight,
  setCanvasWidth: setCanvasWidth,
  getCanvasSize: function(canvas) {
    return [canvas.width, canvas.height];
  },
  setCanvasSizeWithData: function(canvas, size) {
    var context, data;
    context = canvas.getContext('2d');
    data = context.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasWidth(canvas, size[0]);
    setCanvasHeight(canvas, size[1]);
    context.putImageData(data, 0, 0);
  }
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var Cell, emptyBlock, util;

util = __webpack_require__(0);

Cell = (function() {
  function Cell() {}

  Cell.withLocalBlockID = function(id) {
    if (id > 0) {
      return id;
    }
  };

  Cell.withGlobalTerrID = function(id) {
    return -id;
  };

  Cell.isLocalBlockID = function(id) {
    return id > 0;
  };

  Cell.isGlobalTerrID = function(id) {
    return id <= 0;
  };

  return Cell;

})();

module.exports.Cell = Cell;

emptyBlock = function(x, y, w, h) {
  var j, ref, results, rng;
  rng = new Math.seedrandom(x.toString() + y.toString());
  results = [];
  for (j = 0, ref = w; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
    results.push((function() {
      var k, ref1, results1;
      results1 = [];
      for (k = 0, ref1 = h; 0 <= ref1 ? k <= ref1 : k >= ref1; 0 <= ref1 ? k++ : k--) {
        if ((Math.abs(rng.int32())) % 100 < 26) {
          results1.push(Cell.withLocalBlockID(1));
        } else {
          results1.push(Cell.withLocalBlockID(2 + Math.abs(rng.int32() % 18)));
        }
      }
      return results1;
    })());
  }
  return results;
};

module.exports.Cells = (function() {
  function _Class(w, h) {
    var amplitude, b, g, i, j, r, rnd, rng;
    this.w = w;
    this.h = h;
    this.cells = emptyBlock(0, 0, 2 * w, 2 * h);
    amplitude = 0x20;
    this.blockColors = {};
    this.blockColors[Cell.withGlobalTerrID(1)] = '#1c703f';
    this.blockColors[Cell.withGlobalTerrID(2)] = '#471c23';
    rng = new Math.seedrandom('blockColorsSeed');
    for (i = j = 0; j <= 20; i = ++j) {
      rnd = (Math.abs(rng.int32())) % amplitude;
      r = 0x3A + rnd;
      g = 0x3F + rnd;
      b = 0x44 + rnd;
      this.blockColors[Cell.withLocalBlockID(i)] = util.rgbToHex(r, g, b);
    }
  }

  _Class.prototype.getBlockColor = function(id) {
    return this.blockColors[id];
  };

  _Class.prototype.isCellLoaded = function(x, y) {
    return x >= -this.w && x < this.w && y >= -this.h && y < this.h;
  };

  _Class.prototype.getBlockID = function(x, y) {
    if (this.isCellLoaded(x, y)) {
      return this.cells[x + this.w][y + this.h];
    } else {
      return Cell.withLocalBlockID(0);
    }
  };

  _Class.prototype.setBlockID = function(x, y, id) {
    if (this.isCellLoaded(x, y)) {
      this.cells[x + this.w][y + this.h] = id;
    }
  };

  _Class.prototype.forBlock = function(x, y, f) {
    var block, blockID, hash, results, unhash, updatedBlock;
    blockID = this.getBlockID(x, y);
    hash = function(x, y) {
      return x.toString() + "$" + y.toString();
    };
    unhash = function(h) {
      var strs;
      strs = h.split('$');
      return [parseInt(strs[0]), parseInt(strs[1])];
    };
    block = new Set([hash(x, y)]);
    updatedBlock = true;
    f(x, y);
    results = [];
    while (updatedBlock) {
      updatedBlock = false;
      results.push(block.forEach((function(_this) {
        return function(coordHash) {
          var coord, j, len, n, nHash, neighbors, results1;
          coord = unhash(coordHash);
          neighbors = [[coord[0] + 1, coord[1]], [coord[0] - 1, coord[1]], [coord[0], coord[1] + 1], [coord[0], coord[1] - 1], [coord[0] + 1, coord[1] - 1], [coord[0] - 1, coord[1] + 1]];
          results1 = [];
          for (j = 0, len = neighbors.length; j < len; j++) {
            n = neighbors[j];
            nHash = hash(n[0], n[1]);
            if (_this.isCellLoaded(n[0], n[1])) {
              if ((_this.getBlockID(n[0], n[1])) === blockID && !block.has(nHash)) {
                f(n[0], n[1]);
                block.add(nHash);
                updatedBlock = true;
                results1.push(0);
              } else {
                results1.push(void 0);
              }
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        };
      })(this)));
    }
    return results;
  };

  return _Class;

})();


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var Cell, Viewport, util;

util = __webpack_require__(0);

Cell = __webpack_require__(1).Cell;

module.exports.Viewport = Viewport = (function() {
  function Viewport(arg) {
    this.arg = arg;
  }

  Viewport.prototype.cellWidth = function() {
    return this.arg.cellWidth;
  };

  Viewport.prototype.cellHeight = function() {
    return this.arg.cellHeight;
  };

  Viewport.prototype.getCellCenter = function(arg) {
    var inX, inY;
    inX = arg[0], inY = arg[1];
    return [(inX + inY / 2) * this.cellWidth(), inY * this.cellHeight()];
  };

  Viewport.prototype.getCellCoords = function(arg) {
    var baseRelX, baseRelY, baseX, baseY, candidates, dist2, dists, i, outX, outY, shiftBaseX;
    outX = arg[0], outY = arg[1];
    baseY = Math.floor(outY / this.cellHeight());
    shiftBaseX = baseY * this.cellWidth() / 2;
    baseX = Math.floor((outX - shiftBaseX) / this.cellWidth());
    baseRelX = outX - (baseX * this.cellWidth() + shiftBaseX);
    baseRelY = outY - baseY * this.cellHeight();
    candidates = [[0, 0], [this.cellWidth(), 0], [this.cellWidth() / 2, this.cellHeight()]];
    dist2 = function(arg1, arg2) {
      var aX, aY, bX, bY;
      aX = arg1[0], aY = arg1[1];
      bX = arg2[0], bY = arg2[1];
      return (aX - bX) * (aX - bX) + (aY - bY) * (aY - bY);
    };
    dists = (function() {
      var j, results;
      results = [];
      for (i = j = 0; j <= 2; i = ++j) {
        results.push(dist2([baseRelX, baseRelY], candidates[i]));
      }
      return results;
    })();
    if (dists[0] < dists[1]) {
      if (dists[0] < dists[2]) {
        return [baseX, baseY];
      } else {
        return [baseX, baseY + 1];
      }
    } else {
      if (dists[1] < dists[2]) {
        return [baseX + 1, baseY];
      } else {
        return [baseX, baseY + 1];
      }
    }
  };

  return Viewport;

})();

module.exports.render = function(context, viewport, cellregion, shift, cells) {
  var absCenterX, absCenterY, blockID, centerX, centerY, connectBottomLeft, connectBottomRight, connectLeft, connectRight, connectTopLeft, connectTopRight, dx, firstX, firstY, hexHeight, hexScale, hexSideHeight, hexWidth, inX, inY, innerFill, innerHeight, innerSideHeight, innerWidth, ref, ref1, ref2, results, rndclr;
  hexScale = 1.01;
  hexWidth = viewport.cellWidth() * hexScale;
  hexHeight = hexWidth * hexScale / Math.cos(Math.PI / 6);
  hexSideHeight = hexWidth * Math.tan(Math.PI / 6) * hexScale;
  innerFill = 0.9 / hexScale;
  innerWidth = hexWidth * innerFill;
  innerHeight = hexHeight * innerFill;
  innerSideHeight = hexSideHeight * innerFill;
  ref = viewport.getCellCenter([cellregion.x, cellregion.y]), firstX = ref[0], firstY = ref[1];
  rndclr = function() {
    return Math.floor(Math.random() * 256);
  };
  context.fillStyle = '#111111';
  context.fillRect(firstX + shift[0] - 1, firstY + shift[1] - 1, cellregion.width * viewport.cellWidth() + 1, cellregion.height * viewport.cellHeight() + 1);
  dx = 0;
  inY = cellregion.y;
  results = [];
  while (inY <= cellregion.y + cellregion.height) {
    inX = Math.floor(cellregion.x + dx - ((inY - cellregion.y) / 2));
    ref1 = viewport.getCellCenter([inX, inY]), absCenterX = ref1[0], absCenterY = ref1[1];
    ref2 = [absCenterX + shift[0], absCenterY + shift[1]], centerX = ref2[0], centerY = ref2[1];
    blockID = cells.getBlockID(inX, inY);
    context.fillStyle = cells.getBlockColor(blockID);
    connectTopLeft = blockID === cells.getBlockID(inX, inY - 1);
    connectTopRight = blockID === cells.getBlockID(inX + 1, inY - 1);
    connectLeft = blockID === cells.getBlockID(inX - 1, inY);
    connectBottomLeft = blockID === cells.getBlockID(inX - 1, inY + 1);
    connectBottomRight = blockID === cells.getBlockID(inX, inY + 1);
    connectRight = blockID === cells.getBlockID(inX + 1, inY);
    context.beginPath();
    context.moveTo(centerX, centerY - innerHeight / 2);
    if (connectTopRight) {
      context.moveTo(centerX, centerY - hexHeight / 2);
      context.lineTo(centerX + hexWidth / 2, centerY - hexSideHeight / 2);
    }
    context.lineTo(centerX + innerWidth / 2, centerY - innerSideHeight / 2);
    if (connectRight) {
      context.lineTo(centerX + hexWidth / 2, centerY - hexSideHeight / 2);
      context.lineTo(centerX + hexWidth / 2, centerY + hexSideHeight / 2);
    }
    context.lineTo(centerX + innerWidth / 2, centerY + innerSideHeight / 2);
    if (connectBottomRight) {
      context.lineTo(centerX + hexWidth / 2, centerY + hexSideHeight / 2);
      context.lineTo(centerX, centerY + hexHeight / 2);
    }
    context.lineTo(centerX, centerY + innerHeight / 2);
    if (connectBottomLeft) {
      context.lineTo(centerX, centerY + hexHeight / 2);
      context.lineTo(centerX - hexWidth / 2, centerY + hexSideHeight / 2);
    }
    context.lineTo(centerX - innerWidth / 2, centerY + innerSideHeight / 2);
    if (connectLeft) {
      context.lineTo(centerX - hexWidth / 2, centerY + hexSideHeight / 2);
      context.lineTo(centerX - hexWidth / 2, centerY - hexSideHeight / 2);
    }
    context.lineTo(centerX - innerWidth / 2, centerY - innerSideHeight / 2);
    if (connectTopLeft) {
      context.lineTo(centerX - hexWidth / 2, centerY - hexSideHeight / 2);
      context.lineTo(centerX, centerY - hexHeight / 2);
    }
    context.lineTo(centerX, centerY - innerHeight / 2);
    context.closePath();
    context.fill();
    dx = dx + 1;
    if (dx > cellregion.width) {
      dx = 0;
      results.push(inY = inY + 1);
    } else {
      results.push(void 0);
    }
  }
  return results;
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



window.onload = initMainModule;

function initMainModule() {
    const canvas = document.getElementById('boardcanvas');

    const util = __webpack_require__(0);
    const {Cells, Cell} = __webpack_require__(1);
    let cells = new Cells(512, 512);
    const graphics = __webpack_require__(2);
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


/***/ })
/******/ ]);