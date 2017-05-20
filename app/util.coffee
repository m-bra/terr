
componentToHex = (c) ->
  hex = c.toString 16
  if hex.length == 1 then "0" + hex else hex

rgbToHex = (r, g, b) ->
  "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)

module.exports =
  rgbToHex: rgbToHex
