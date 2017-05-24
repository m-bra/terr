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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {


window.onload = init;

function init() {
    let canvas = document.getElementById('boardcanvas');

    const util = __webpack_require__(2);
    let {Cells, Cell} = __webpack_require__(1);
    let cells = new Cells(512, 512);
    let graphics = __webpack_require__(3);
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
                dirty = true;
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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var Cell, emptyBlock;

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

emptyBlock = function(x, y, w, h, maxBlockID) {
  var i, ref, results, rng;
  rng = new Math.seedrandom(x.toString() + y.toString());
  results = [];
  for (i = 0, ref = w; 0 <= ref ? i <= ref : i >= ref; 0 <= ref ? i++ : i--) {
    results.push((function() {
      var j, ref1, results1;
      results1 = [];
      for (j = 0, ref1 = h; 0 <= ref1 ? j <= ref1 : j >= ref1; 0 <= ref1 ? j++ : j--) {
        results1.push(Cell.withLocalBlockID(1 + Math.abs(rng.int32() % maxBlockID)));
      }
      return results1;
    })());
  }
  return results;
};

module.exports.Cells = (function() {
  function _Class(w, h) {
    this.w = w;
    this.h = h;
    this.maxBlockID = 5;
    this.cells = emptyBlock(0, 0, 2 * w, 2 * h, 5);
  }

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
          var coord, i, len, n, nHash, neighbors, results1;
          coord = unhash(coordHash);
          neighbors = [[coord[0] + 1, coord[1]], [coord[0] - 1, coord[1]], [coord[0], coord[1] + 1], [coord[0], coord[1] - 1], [coord[0] + 1, coord[1] - 1], [coord[0] - 1, coord[1] + 1]];
          results1 = [];
          for (i = 0, len = neighbors.length; i < len; i++) {
            n = neighbors[i];
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
/***/ (function(module, exports) {

var componentToHex, fromStylePxStr, getStylePos, rgbToHex, setStylePos, toStylePx;

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

module.exports = {
  rgbToHex: rgbToHex,
  toStylePx: toStylePx,
  fromStylePxStr: fromStylePxStr,
  getStylePos: getStylePos,
  setStylePos: setStylePos
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Cell, Viewport, util;

util = __webpack_require__(2);

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
    console.log("base: " + baseX + ", " + baseY);
    console.log("baseRel: " + [baseRelX, baseRelY]);
    console.log("candidates: " + candidates);
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
    console.log("distances: " + dists[1]);
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
  var absCenterX, absCenterY, amplitude, b, blockColors, blockID, centerX, centerY, connectBottomLeft, connectBottomRight, connectLeft, connectRight, connectTopLeft, connectTopRight, dx, firstX, firstY, g, hexHeight, hexScale, hexSideHeight, hexWidth, i, inX, inY, innerFill, innerHeight, innerSideHeight, innerWidth, j, r, ref, ref1, ref2, ref3, results, rnd;
  hexScale = 1.01;
  hexWidth = viewport.cellWidth() * hexScale;
  hexHeight = hexWidth * hexScale / Math.cos(Math.PI / 6);
  hexSideHeight = hexWidth * Math.tan(Math.PI / 6) * hexScale;
  innerFill = 0.92 / hexScale;
  innerWidth = hexWidth * innerFill;
  innerHeight = hexHeight * innerFill;
  innerSideHeight = hexSideHeight * innerFill;
  amplitude = 0x14;
  blockColors = {};
  blockColors[Cell.withGlobalTerrID(1)] = '#1c703f';
  blockColors[Cell.withGlobalTerrID(2)] = '#471c23';
  for (i = j = 0, ref = cells.maxBlockID + 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
    rnd = i * amplitude / cells.maxBlockID;
    r = 0x3A + rnd;
    g = 0x3F + rnd;
    b = 0x44 + rnd;
    blockColors[Cell.withLocalBlockID(i)] = util.rgbToHex(r, g, b);
  }
  ref1 = viewport.getCellCenter([cellregion.x, cellregion.y]), firstX = ref1[0], firstY = ref1[1];
  context.fillStyle = '#111111';
  context.fillRect(firstX + shift[0], firstY + shift[1], cellregion.width * viewport.cellWidth(), cellregion.height * viewport.cellHeight());
  dx = 0;
  inY = cellregion.y;
  results = [];
  while (inY < cellregion.y + cellregion.height) {
    inX = Math.floor(cellregion.x + dx - ((inY - cellregion.y) / 2));
    ref2 = viewport.getCellCenter([inX, inY]), absCenterX = ref2[0], absCenterY = ref2[1];
    ref3 = [absCenterX + shift[0], absCenterY + shift[1]], centerX = ref3[0], centerY = ref3[1];
    blockID = cells.getBlockID(inX, inY);
    context.fillStyle = blockColors[blockID];
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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(0);
module.exports = __webpack_require__(0);


/***/ })
/******/ ]);