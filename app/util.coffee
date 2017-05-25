
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

setCanvasWidth = (canvas, width) ->
  canvas.width = width
  canvas.style.width = toStylePx width
  
setCanvasHeight = (canvas, height) ->
  canvas.height = height
  canvas.style.height = toStylePx height

module.exports =
  rgbToHex: rgbToHex
  toStylePx: toStylePx
  fromStylePxStr: fromStylePxStr
  getStylePos: getStylePos
  setStylePos: setStylePos
  setCanvasHeight: setCanvasHeight
  setCanvasWidth: setCanvasWidth
  getCanvasSize: (canvas) -> [canvas.width, canvas.height]
  setCanvasSizeWithData: (canvas, size) ->
    context = canvas.getContext '2d'
    data = context.getImageData 0, 0, canvas.width, canvas.height
    setCanvasWidth canvas, size[0]
    setCanvasHeight canvas, size[1]
    context.putImageData data, 0, 0
    return
