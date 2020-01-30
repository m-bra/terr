import { StringCache, LocalCache, PrefixCache } from "./shared/cache";
import {vec2} from "tsm"

import * as tsm from "tsm"
import {NationID} from "./shared/types"


window.onload = function() {
    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    let context = canvas.getContext("2d");
    if (context == null)
        return;
    

    let cache = new LocalCache
    let cells = new PrefixCache("cells.", cache)
    cells.set(coords(0, 0), nationID(1));
    cells.set(coords(0, 1), nationID(2));
    cells.set(coords(4, 2), nationID(3));
    cells.set(coords(2, 3), nationID(4));
    cells.set(coords(2, 4), nationID(5));
    
    render(context, cells, new vec2(0, 0), new vec2(5, 5));
}

function coords(x: number, y: number): string {
    return "(" + x + "," + y + ")";
}

function nationID(i: number): NationID {
    return i;
}

let colors = [
    "#000000",
    "green",
    "brown",
    "blue"
];

function colorFromNationID(n: NationID): string {
    return colors[n];
}

function render(ctx: CanvasRenderingContext2D, cells: PrefixCache, from: vec2, to: vec2) {
    let cellCoord = new vec2(0, 0)
    for (cellCoord.x = from.x; cellCoord.x < to.x; cellCoord.x+= 1)
    for (cellCoord.y = from.y; cellCoord.y < to.y; cellCoord.y+= 1) {
        let nationID: NationID = cells.get(coords(cellCoord.x, cellCoord.y)) || 0;
        let cellHeight = 20;
        let drawHeight = 18;
        renderCell(ctx, nationID, cellToScreen(cellCoord - from, cellHeight), drawHeight);
    }
}

// about hexagons:
// radius_min is the distance from the center of the hexagon to a line,
// whereas radius_max would be the distance from the center to a corner.
// so the width of a cell is radius_max * 2   (with our alignment)
// and the height of a cell is radius_min * 2   (with our alignment)

const radiusMinToMax = Math.tan(2 * Math.PI / 6);
// another name for it, because you can also imagine the radius, when "turned" inside the hexagon, becomes longer.
const hexagonTilt = radiusMinToMax;

// maps a cell coordinate to the center of its rendered hexagon on the screen
// (not taking into account camera translation, of course.)
function cellToScreen(cellCoord: vec2, cellHeight: number): vec2 {
    let cellWidth = cellHeight * hexagonTilt; 
    return new vec2([cellCoord.x * cellWidth + cellCoord.y * cellWidth/2, cellCoord.y * cellHeight / 2])
}

function renderCell(ctx: CanvasRenderingContext2D, nationID: NationID, screenPos: vec2, cellHeight: number) {
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = colorFromNationID(nationID);

    let radius_min = cellHeight / 2;
    // length of a hexagon side, which is also coincidentally radius_max
    let side = hexagonTilt * radius_min;

    // hexagon, from top left corner, clockwise
    let vertices = [
        screenPos + new vec2(-side/2, -radius_min),
        screenPos + new vec2(+side/2, -radius_min),
        screenPos + new vec2(+side, 0),
        screenPos + new vec2(+side/2, +radius_min),
        screenPos + new vec2(-side/2, +radius_min),
        screenPos + new vec2(-side, 0)
    ];

    // draw one rectangle and two triangles (faster than polygon i think)
    ctx.fillRect(vertices[0].x, vertices[0].y, vertices[3].x, vertices[3].y);
    fillTriangle(ctx, vertices[0], vertices[4], vertices[5]);
    fillTriangle(ctx, vertices[1], vertices[2], vertices[3]);
}

function fillTriangle(ctx: CanvasRenderingContext2D, a: vec2, b: vec2, c: vec2) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.fill();
}
