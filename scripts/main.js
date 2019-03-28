
function main()
{
    drawRect(20, 20, 100, 100, "tomato");
}

function drawRect(x, y, w, h, color)
{
    let canvas = document.getElementById('gameCanvas');
    let ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

main();