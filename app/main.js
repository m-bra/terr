
util = require('coffee-loader!./util.coffee')

window.onload = init;

var cells;

function init() {
    var maxGroupID = 5;
    cells = [];
    for (var x = 0; x < 32; x++)
    {
        var column = [];
        for (var y = 0; y < 32; y++)
        {
            var cell = {
                groupID: Math.floor(maxGroupID * 0.99 * Math.random()),
                territoryID: 0,
            }
            column.push(cell)
        }
        cells.push(column)
    }

    for (var x = 0; x < cells.length; ++x)
    {
        for (var y = 0; y < cells[x].length; ++y)
        {
            var topLeft = y ? cells[x][y-1] : -1;
            var topRight = (y && x != cells.length - 1) ? cells[x+1][y-1] : -1;
            var left = x ? cells[x-1][y] : -1;
            var groupID = cells[x][y].groupID;
            cells[x][y].connections = [
                topLeft.groupID === groupID,
                topRight.groupID === groupID,
                left.groupID === groupID,
            ];
        }
    }

    var radius = 22;
    var canvas = document.getElementById('boardcanvas');
    var context = canvas.getContext('2d');

    context.canvas.width  = window.innerWidth;
    context.canvas.height = window.innerHeight;

    function listener(isLeftClick) {return function(event) {
        if (!isLeftClick)
            event.preventDefault();

        var x = event.pageX - canvas.offsetLeft;
        var y = event.pageY - canvas.offsetTop;
        var startCoords = getCellCoords(radius, x, y);
        forGroup(cells, startCoords[0], startCoords[1], function(x, y){
            cells[x][y].territoryID = isLeftClick ? 1 : 2;
        });


        render(context, radius, cells, maxGroupID);

        if (!isLeftClick)
            return false;
    }}

    canvas.addEventListener('click', listener(true));
    canvas.addEventListener('contextmenu', listener(false));

    render(context, radius, cells, maxGroupID);
}

function getCellPos(radius, x, y)
{
    var radiusY = radius * Math.cos(Math.PI * 0.333333);
    var radiusX = radius * Math.sin(Math.PI * 0.333333);
    var centerX = (x + y * 0.5) * radiusX * 2;
    var centerY = y * (radius+radiusY);
    return [centerX, centerY];
}

function getCellCoords(radius, x, y)
{
    var radiusY = radius * Math.cos(Math.PI * 0.333333);
    var radiusX = radius * Math.sin(Math.PI * 0.333333);

    var baseY = Math.floor(y / (radiusY+radius));
    var shiftX = baseY * radiusX;
    var baseX = Math.floor((x-shiftX) / (radiusX*2));

    var xOff = x - (shiftX + baseX * radiusX * 2);
    var yOff = y - baseY * (radiusY+radius);

    var offCandidates = [
        [0, 0], [2*radiusX, 0], [radiusX, radiusY+radius],
    ];

    function sqdist(x1, y1, x2, y2) {
        return (x1 - x2)*(x1-x2) + (y1 - y2)*(y1-y2);
    }

    var d = sqdist(xOff, yOff, offCandidates[0][0], offCandidates[0][1]);
    var candidateI = 0;
    for (var i = 1; i < 3; i++)
    {
        var newDist = sqdist(xOff, yOff, offCandidates[i][0], offCandidates[i][1]);
        if (newDist < d)
        {
            d = newDist;
            candidateI = i;
        }
    }

    var candidates = [
        [baseX, baseY], [baseX + 1, baseY], [baseX, baseY + 1],
    ];

    return candidates[candidateI];
}

function forGroup(cells, x, y, f)
{
    var groupID = cells[x][y].groupID;
    function hash(x, y) {return x * cells.length + y};
    function unhash(h) {return [Math.floor(h / cells.length), h % cells.length]};
    var group = new Set([hash(x, y)]);
    var updatedGroup = true;

    f(x, y);

    while (updatedGroup) {
        updatedGroup = false;

        for (coordHash of group.keys()) {
            var coord = unhash(coordHash);
            var neighbors = [
                [coord[0] + 1, coord[1]],
                [coord[0] - 1, coord[1]],
                [coord[0], coord[1] + 1],
                [coord[0], coord[1] - 1],
                [coord[0] + 1, coord[1] - 1],
                [coord[0] - 1, coord[1] + 1],
            ];

            for (n of neighbors) {
                var nHash = hash(n[0], n[1]);
                if (n[0] >= 0 && n[0] < cells.length && n[1] >=0 && n[1] < cells[0].length)
                    if (cells[n[0]][n[1]].groupID == groupID && !group.has(nHash))
                    {
                        f(n[0], n[1]);
                        group.add(nHash);
                        updatedGroup = true;
                    }
            }
        }
    }
}

function render(context, radius, cells, maxGroupID) {
    for (var x = 0; x < cells.length; ++x)
    for (var y = 0; y < cells[x].length; ++y)
    {
        var radiusY = radius * Math.cos(Math.PI * 0.333333);
        var radiusX = radius * Math.sin(Math.PI * 0.333333);
        var centerX, centerY;
        [centerX, centerY] = getCellPos(radius, x, y);

        var hexFill = 0.88;
        var hexRadius = radius * hexFill;
        var hexRadiusY = hexRadius * Math.cos(Math.PI * 0.333333);
        var hexRadiusX = hexRadius * Math.sin(Math.PI * 0.333333);

        var r,g,b;
        var amplitude = 0x14;
        var hexStyle;
        if (cells[x][y].territoryID == 1) {
            r = 0x1c; g = 0x70; b = 0x3f;
        }
        else if (cells[x][y].territoryID == 2) {
            r = 0x47; g = 0x1c; b = 0x23;
        }
        else {
            r = 0x3A; g = 0x3F; b = 0x44;
        }
        var rnd = cells[x][y].groupID * amplitude / maxGroupID;
        hexStyle = util.rgbToHex(r + rnd, g + rnd, b + rnd);
        context.fillStyle = hexStyle;

        context.beginPath();
        context.moveTo(centerX, centerY - hexRadius);
        context.lineTo(centerX + hexRadiusX, centerY - hexRadiusY);
        context.lineTo(centerX + hexRadiusX, centerY + hexRadiusY);
        context.lineTo(centerX, centerY + hexRadius);
        context.lineTo(centerX - hexRadiusX, centerY + hexRadiusY);
        context.lineTo(centerX - hexRadiusX, centerY - hexRadiusY);
        context.lineTo(centerX, centerY - hexRadius);
        context.closePath();
        context.fill();

        if (connections[0]) { // top left connection
            // vector of one side of the rect that fills the top left gap
            var dirX = radius * 2.1*(1-hexFill) * Math.cos(Math.PI / 3);
            var dirY = radius * 2.1*(1-hexFill) * Math.sin(Math.PI / 3);

            context.beginPath();
            context.moveTo(centerX - hexRadiusX*0.9, centerY - hexRadiusY*0.9);
            context.lineTo(centerX, centerY - hexRadius*0.9);
            context.lineTo(centerX - dirX, centerY - hexRadius - dirY);
            context.lineTo(centerX - hexRadiusX - dirX, centerY - hexRadiusY - dirY);
            context.closePath();
            context.fill();
        }

        if (connections[1]) { // top right connection
            // vector of one side of the rect that fills the top left gap
            var dirX = radius * 2.1*(1-hexFill) * Math.cos(Math.PI / 3);
            var dirY = radius * 2.1*(1-hexFill) * Math.sin(Math.PI / 3);

            context.beginPath();
            context.moveTo(centerX + hexRadiusX*0.9, centerY - hexRadiusY*0.9);
            context.lineTo(centerX, centerY - hexRadius*0.9);
            context.lineTo(centerX + dirX, centerY - hexRadius - dirY);
            context.lineTo(centerX + hexRadiusX + dirX, centerY - hexRadiusY - dirY);
            context.closePath();
            context.fill();
        }

        if (connections[2]) { // left connection
            // vector of one side of the rect that fills the top left gap
            var dirX = radius * 2.6*(1-hexFill);

            context.beginPath();
            context.moveTo(centerX - hexRadiusX*0.9, centerY - hexRadiusY*0.9);
            context.lineTo(centerX - hexRadiusX*0.9, centerY + hexRadiusY*0.9);
            context.lineTo(centerX - hexRadiusX*0.9 - dirX, centerY + hexRadiusY*0.9);
            context.lineTo(centerX - hexRadiusX*0.9 - dirX, centerY - hexRadiusY*0.9);
            context.closePath();
            context.fill();
        }
    }
}
