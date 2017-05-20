
module.exports =
  generateGroupIDs: (w, h) ->
    (Math.floor (4 * Math.random) for [0..h])
