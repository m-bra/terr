
module.exports = function(radius) {
    const util = require('coffee-loader!./util.coffee');

    this.getCellPos = function(x, y)
    {
        let radiusY = radius * Math.cos(Math.PI * 0.333333);
        let radiusX = radius * Math.sin(Math.PI * 0.333333);
        let centerX = (x + y * 0.5) * radiusX * 2;
        let centerY = y * (radius+radiusY);
        return [centerX, centerY];
    };

    this.getCellCoords = function(x, y)
    {
        let radiusY = radius * Math.cos(Math.PI * 0.333333);
        let radiusX = radius * Math.sin(Math.PI * 0.333333);

        let baseY = Math.floor(y / (radiusY+radius));
        let shiftX = baseY * radiusX;
        let baseX = Math.floor((x-shiftX) / (radiusX*2));

        let xOff = x - (shiftX + baseX * radiusX * 2);
        let yOff = y - baseY * (radiusY+radius);

        let offCandidates = [
            [0, 0], [2*radiusX, 0], [radiusX, radiusY+radius],
        ];

        function sqdist(x1, y1, x2, y2) {
            return (x1 - x2)*(x1-x2) + (y1 - y2)*(y1-y2);
        }

        let d = sqdist(xOff, yOff, offCandidates[0][0], offCandidates[0][1]);
        let candidateI = 0;
        for (let i = 1; i < 3; i++)
        {
            let newDist = sqdist(xOff, yOff, offCandidates[i][0], offCandidates[i][1]);
            if (newDist < d)
            {
                d = newDist;
                candidateI = i;
            }
        }

        let candidates = [
            [baseX, baseY], [baseX + 1, baseY], [baseX, baseY + 1],
        ];

        return candidates[candidateI];
    };

    this.render = function(context, cells) {
        for (let x = 0; x < cells.cells.length; ++x)
        for (let y = 0; y < cells.cells[x].length; ++y)
        {
            let radiusY = radius * Math.cos(Math.PI * 0.333333);
            let radiusX = radius * Math.sin(Math.PI * 0.333333);
            let centerX, centerY;
            [centerX, centerY] = this.getCellPos(x, y);

            let hexFill = 0.88;
            let hexRadius = radius * hexFill;
            let hexRadiusY = hexRadius * Math.cos(Math.PI * 0.333333);
            let hexRadiusX = hexRadius * Math.sin(Math.PI * 0.333333);

            let r,g,b;
            let amplitude = 0x14;
            let blockID = cells.cells[x][y].blockID;
            if (cells.cells[x][y].territoryID == 1) {
                r = 0x1c; g = 0x70; b = 0x3f;
            }
            else if (cells.cells[x][y].territoryID == 2) {
                r = 0x47; g = 0x1c; b = 0x23;
            }
            else {
                let rnd = blockID * amplitude / cells.maxBlockID;
                r = 0x3A + rnd; g = 0x3F + rnd; b = 0x44 + rnd;
            }
            let hexStyle = util.rgbToHex(r, g, b);
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

            let territoryID = cells.cells[x][y].territoryID;
            let topLeft = territoryID == 0
                ? (y ? blockID == cells.cells[x][y - 1].blockID : false)
                : (y ? territoryID == cells.cells[x][y - 1].territoryID : false);
            let xInW = x < cells.cells.length - 1;
            let topRight = territoryID == 0
                ? (y && xInW ? blockID == cells.cells[x + 1][y - 1].blockID : false)
                : (y && xInW ? territoryID == cells.cells[x + 1][y - 1].territoryID : false);
            let left = territoryID == 0
                ? (x ? blockID == cells.cells[x - 1][y].blockID : false)
                : (x ? territoryID == cells.cells[x - 1][y].territoryID : false);

            if (topLeft) { // top left connection
                // vector of one side of the rect that fills the top left gap
                let dirX = radius * 2.1*(1-hexFill) * Math.cos(Math.PI / 3);
                let dirY = radius * 2.1*(1-hexFill) * Math.sin(Math.PI / 3);

                context.beginPath();
                context.moveTo(centerX - hexRadiusX*0.9, centerY - hexRadiusY*0.9);
                context.lineTo(centerX, centerY - hexRadius*0.9);
                context.lineTo(centerX - dirX, centerY - hexRadius - dirY);
                context.lineTo(centerX - hexRadiusX - dirX, centerY - hexRadiusY - dirY);
                context.closePath();
                context.fill();
            }

            if (topRight) { // top right connection
                // vector of one side of the rect that fills the top left gap
                let dirX = radius * 2.1*(1-hexFill) * Math.cos(Math.PI / 3);
                let dirY = radius * 2.1*(1-hexFill) * Math.sin(Math.PI / 3);

                context.beginPath();
                context.moveTo(centerX + hexRadiusX*0.9, centerY - hexRadiusY*0.9);
                context.lineTo(centerX, centerY - hexRadius*0.9);
                context.lineTo(centerX + dirX, centerY - hexRadius - dirY);
                context.lineTo(centerX + hexRadiusX + dirX, centerY - hexRadiusY - dirY);
                context.closePath();
                context.fill();
            }

            if (left) { // left connection
                // vector of one side of the rect that fills the top left gap
                let dirX = radius * 2.6*(1-hexFill);

                context.beginPath();
                context.moveTo(centerX - hexRadiusX*0.9, centerY - hexRadiusY*0.9);
                context.lineTo(centerX - hexRadiusX*0.9, centerY + hexRadiusY*0.9);
                context.lineTo(centerX - hexRadiusX*0.9 - dirX, centerY + hexRadiusY*0.9);
                context.lineTo(centerX - hexRadiusX*0.9 - dirX, centerY - hexRadiusY*0.9);
                context.closePath();
                context.fill();
            }
        }
    };
}
