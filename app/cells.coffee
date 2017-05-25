
util = require 'coffee-loader!./util.coffee'

class Cell
  @withLocalBlockID: (id) -> if id > 0 then id
  @withGlobalTerrID: (id) -> -id
  @isLocalBlockID: (id) -> id > 0
  @isGlobalTerrID: (id) -> id <= 0

module.exports.Cell = Cell

emptyBlock = (x, y, w, h) ->
  rng = new Math.seedrandom (x.toString() + y.toString())
  for [0..w]
    for [0..h]
      if (Math.abs rng.int32()) % 100 < 26
        Cell.withLocalBlockID 1
      else
        Cell.withLocalBlockID (2 + Math.abs (rng.int32() % 18))

module.exports.Cells = class
  constructor: (w, h) ->
    @w = w
    @h = h
    @cells = emptyBlock 0, 0, 2*w, 2*h
    
    amplitude = 0x20
    @blockColors = {}
    @blockColors[Cell.withGlobalTerrID 1] = '#1c703f'
    @blockColors[Cell.withGlobalTerrID(2)] = '#471c23'

    rng = new Math.seedrandom 'blockColorsSeed'
    for i in [0 .. 20]
        rnd = ((Math.abs rng.int32()) % amplitude)
        r = 0x3A + rnd
        g = 0x3F + rnd
        b = 0x44 + rnd
        @blockColors[Cell.withLocalBlockID i] = util.rgbToHex r, g, b

  getBlockColor: (id) -> @blockColors[id]

  isCellLoaded: (x, y) ->
    x >= -@w and x < @w and
      y >= -@h and y < @h

  getBlockID: (x, y) ->
    if @isCellLoaded x, y
      @cells[x + @w][y + @h]
    else
      Cell.withLocalBlockID 0

  setBlockID: (x, y, id) ->
    if @isCellLoaded x, y
      @cells[x + @w][y + @h] = id
    return

  forBlock: (x, y, f) ->
    blockID = @getBlockID x, y
    # yea ik its serialize not hash but who cares i dont
    hash = (x, y) -> x.toString() + "$" + y.toString()
    unhash = (h) ->
      strs = h.split '$'
      [(parseInt strs[0]), (parseInt strs[1])]
    block = new Set([hash(x, y)])
    updatedBlock = true

    f(x, y)

    while updatedBlock
      updatedBlock = false

      block.forEach (coordHash) =>
        coord = unhash coordHash
        neighbors = [
          [coord[0] + 1, coord[1]],
          [coord[0] - 1, coord[1]],
          [coord[0], coord[1] + 1],
          [coord[0], coord[1] - 1],
          [coord[0] + 1, coord[1] - 1],
          [coord[0] - 1, coord[1] + 1],
        ]

        for n in neighbors
          nHash = hash(n[0], n[1])
          if @isCellLoaded n[0], n[1]
            if (@getBlockID n[0], n[1]) == blockID && !block.has(nHash)
              f(n[0], n[1])
              block.add nHash
              updatedBlock = true
              0
