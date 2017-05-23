
util = require 'coffee-loader!./util.coffee'
{Cell} = require 'coffee-loader!./cells.coffee'

# entire rendering forms logical inputs (cells) into graphical output (canvas)
# thus, the prefix 'in' often denotes a property of the logical input,
# while the prefix 'out' often denotes a property of the graphical output.

module.exports.Viewport = class Viewport
  constructor: (@arg) ->

  cellWidth: -> @arg.cellWidth
  # this does NOT equal any side-length or radius in a hexagon!
  # it is rather the vertical distance between two hexagons.
  cellHeight: -> @arg.cellHeight

  getCellCenter: ([inX, inY]) ->
    [
      (inX + (inY)/2) * @cellWidth()
      (inY) * @cellHeight()
    ]

  getCellCoords: ([outX, outY]) ->
    baseY = Math.floor(outY / @cellHeight())
    shiftBaseX = baseY * @cellWidth() / 2
    baseX = Math.floor((outX-shiftBaseX) / @cellWidth())

    # out position relative to base out position
    baseRelX = outX - (baseX * @cellWidth() + shiftBaseX)
    baseRelY = outY - baseY * @cellHeight()

    candidates = [
      [0, 0], # base coord
      [@cellWidth(), 0], # right to base
      [@cellWidth() / 2, @cellHeight()] # bottom to base
    ]

    console.log("base: " + baseX + ", " + baseY)
    console.log("baseRel: " + [baseRelX, baseRelY])
    console.log("candidates: " + candidates)

    dist2 = ([aX, aY], [bX, bY]) -> (aX-bX)*(aX-bX)+(aY-bY)*(aY-bY)
    dists = ((dist2 [baseRelX, baseRelY], candidates[i]) for i in [0..2])
    console.log "distances: " + dists[1]

    if dists[0] < dists[1]
      if dists[0] < dists[2]
        [baseX, baseY]
      else
        [baseX, baseY+1] # bottom
    else
      if dists[1] < dists[2]
        [baseX+1, baseY] #right
      else
        [baseX, baseY+1] # bottom

module.exports.render = (context, viewport, cellregion, shift, cells) ->
  # metrics of hexagon filling whole cell
  hexScale = 1.01 # make it slightly larger
  hexWidth = viewport.cellWidth() * hexScale
  # also is two times the radius.
  hexHeight = hexWidth * hexScale / Math.cos(Math.PI / 6)
  # height of the side of the hexagon
  hexSideHeight = hexWidth * Math.tan(Math.PI / 6) * hexScale

  # metrics of inner hexagon
  innerFill = 0.92 / hexScale
  innerWidth = hexWidth * innerFill
  innerHeight = hexHeight * innerFill
  innerSideHeight = hexSideHeight * innerFill

  amplitude = 0x14
  blockColors = {}
  blockColors[Cell.withGlobalTerrID 1] = '#1c703f'
  blockColors[Cell.withGlobalTerrID(2)] = '#471c23'
  for i in [0 .. cells.maxBlockID + 1]
    rnd = i * amplitude / cells.maxBlockID
    r = 0x3A + rnd
    g = 0x3F + rnd
    b = 0x44 + rnd
    blockColors[Cell.withLocalBlockID i] = util.rgbToHex r, g, b

  [firstX, firstY] = viewport.getCellCenter [cellregion.x, cellregion.y]

  context.fillStyle = '#111111'
  context.fillRect firstX + shift[0], firstY + shift[1],
    cellregion.width * viewport.cellWidth(),
    cellregion.height * viewport.cellHeight()

  dx = 0
  inY = cellregion.y
  while inY < cellregion.y + cellregion.height
    # because cellregion.height goes down VERTICALLY, not diagonally
    inX = Math.floor(cellregion.x + dx - ((inY - cellregion.y) / 2))
    [absCenterX, absCenterY] = viewport.getCellCenter [inX, inY]
    [centerX, centerY] = [absCenterX + shift[0], absCenterY + shift[1]]

    blockID = cells.getBlockID inX, inY
    context.fillStyle = blockColors[blockID]

    # perhaps factor out the variable allocation
    connectTopLeft = blockID == cells.getBlockID inX, (inY - 1)
    connectTopRight = blockID == cells.getBlockID (inX+1), (inY - 1)
    connectLeft = blockID == cells.getBlockID (inX-1), inY
    connectBottomLeft = blockID == cells.getBlockID (inX-1), (inY + 1)
    connectBottomRight = blockID == cells.getBlockID inX, (inY + 1)
    connectRight = blockID == cells.getBlockID (inX+1), inY

    context.beginPath()

    context.moveTo centerX, centerY - innerHeight/2
    if connectTopRight
      context.moveTo centerX, centerY - hexHeight/2
      context.lineTo centerX + hexWidth/2, centerY - hexSideHeight/2

    context.lineTo centerX + innerWidth/2, centerY - innerSideHeight/2
    if connectRight
      context.lineTo centerX + hexWidth/2, centerY - hexSideHeight/2
      context.lineTo centerX + hexWidth/2, centerY + hexSideHeight/2

    context.lineTo centerX + innerWidth/2, centerY + innerSideHeight/2
    if connectBottomRight
      context.lineTo centerX + hexWidth/2, centerY + hexSideHeight/2
      context.lineTo centerX, centerY + hexHeight/2

    context.lineTo centerX, centerY + innerHeight/2
    if connectBottomLeft
      context.lineTo centerX, centerY + hexHeight/2
      context.lineTo centerX - hexWidth/2, centerY + hexSideHeight/2

    context.lineTo centerX - innerWidth/2, centerY + innerSideHeight/2
    if connectLeft
      context.lineTo centerX - hexWidth/2, centerY + hexSideHeight/2
      context.lineTo centerX - hexWidth/2, centerY - hexSideHeight/2

    context.lineTo centerX - innerWidth/2, centerY - innerSideHeight/2
    if connectTopLeft
      context.lineTo centerX - hexWidth/2, centerY - hexSideHeight/2
      context.lineTo centerX, centerY - hexHeight/2

    context.lineTo centerX, centerY - innerHeight/2

    context.closePath()
    context.fill()

    dx = dx + 1
    if dx > cellregion.width
      dx = 0
      inY = inY + 1
