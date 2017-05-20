
module.exports.Cells = class
  constructor: (w, h) ->
    @maxBlockID = 5
    @cells =
      for [0..w]
        for [0..h]
          blockID: Math.floor(this.maxBlockID * 0.99 * Math.random())
          territoryID: 0 # TODO: territoryID is part of blockID!

  forBlock: (x, y, f) ->
    blockID = @cells[x][y].blockID
    hash = (x, y) => x * @cells.length + y
    unhash = (h) => [(Math.floor (h / @cells.length)), h % @cells.length]
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
          if n[0] >= 0 && n[0] < @cells.length && n[1] >=0 && n[1] < @cells[0].length
            if @cells[n[0]][n[1]].blockID == blockID && !block.has(nHash)
              f(n[0], n[1])
              block.add nHash
              updatedBlock = true
              0
