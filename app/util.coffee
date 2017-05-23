
componentToHex = (c) ->
  hex = c.toString 16
  if hex.length == 1 then "0" + hex else hex

rgbToHex = (r, g, b) ->
  "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)

toStylePx = (px) -> px.toString() + 'px'
fromStylePxStr = (str) -> parseInt (str.substring 0, str.length - 2)

getStylePos = (style) ->
  [
    if not style.left
      0
    else
      fromStylePxStr style.left,
    if not style.top
      0
    else
      fromStylePxStr style.top,
  ]

setStylePos = (style, pos) ->
  style.position = 'absolute'
  style.left = toStylePx pos[0]
  style.top = toStylePx pos[1]
  return

module.exports =
  rgbToHex: rgbToHex
  toStylePx: toStylePx
  fromStylePxStr: fromStylePxStr
  getStylePos: getStylePos
  setStylePos: setStylePos
