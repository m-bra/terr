

(function(window, document, undefined){

    window.onload = init;

    function render() {
        var canvas = document.getElementById('#boardcanvas');
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = 70;

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.fillStyle = 'green';
        context.fill();
        context.closePath();
    }

    function init(){
        render();
    }
})(window, document, undefined);
