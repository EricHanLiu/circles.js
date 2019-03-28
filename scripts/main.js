let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

class Ball
{
    constructor(x, y, r, speed, color, id)
    {
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = speed
        this.color = color;
        this.dP = null;
        this.uP = null;
        this.lP = null;
        this.rP = null;
        this.id = id;
    }
}

function main()
{
    // create player ball
    let midX = window.innerWidth / 2;
    let midY = window.innerHeight / 2;
    let player = new Ball(midX, midY, 10, 7, 'tomato', 0);

    setCanvasSize();
    attachListeners(player);

    // generate enemies
    let enemies = [];
    let enemyGenInterval = 2000;
    let enemyId = 1;
    setInterval(() => {
        // create enemy ball
        let attr = getRandomAttributes(player);
        enemies.push(new Ball(attr.x, attr.y, attr.r, attr.speed, 'blue', enemyId));
        enemyId++;
    }, enemyGenInterval);

    // draw loop
    function loop ()
    {
        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawPlayer(player);
        drawEnemies(enemies, player);
        movePlayer(player);
        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
}

main();

// returns random attributes scaled to a player
function getRandomAttributes(player)
{
    let x = getRandomInt(0, window.innerWidth);
    let y = getRandomInt(0, window.innerHeight);
    let r = getRandomInt(player.r / 2, player.r * 2);
    let speed = getRandomInt(player.speed / 2, player.speed * 2);
    return {
        x: x,
        y: y,
        r: r,
        speed: speed
    }
}

function drawPlayer(player)
{
    draw(player);
}

// create an enemy ball
function drawEnemies(enemies, player)
{
    if (enemies === []) {
        return;
    }
    for (let i = 0; i < enemies.length; i++)
    {
        let e = enemies[i];
        if (circleCollision(player, e)) {
            // TODO: make deletion depend on radii
            // remove enemy from enemies array, increase radius size
            let index = enemies.indexOf(e);
            enemies.splice(index, 1);
            player.r += Math.floor(e.r / 2);
        } else {
            draw(e);
        }
    }
}

function movePlayer(player)
{
    let delta = player.speed;
    if (player.dP) {
        player.y + delta + player.r <= canvas.height ? player.y += delta : player.y = canvas.height - player.r;
    }
    if (player.uP) {
        player.y - delta - player.r >= 0 ? player.y -= delta : player.y = player.r;
    }
    if (player.lP) {
        player.x - delta - player.r >= 0 ? player.x -= delta : player.x = player.r;
    }
    if (player.rP) {
        player.x + delta + player.r <= canvas.width ? player.x += delta : player.x = canvas.width - player.r;
    }
}

function draw(ball)
{
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function setCanvasSize()
{
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
}

function attachListeners(player)
{
    // movement
    window.addEventListener('keydown', (e) =>
    {
        if (e.key === 'ArrowUp' || e.key === 'w') { // up
            player.uP = true;
        } else if (e.key === 'ArrowDown' || e.key === 's') { // down
            player.dP = true;
        } else if (e.key === 'ArrowLeft' || e.key === 'a') { // left
            player.lP = true;
        } else if (e.key === 'ArrowRight' || e.key === 'd') { // right
            player.rP = true;
        }
    });
    window.addEventListener('keyup', (e) =>
    {
        if (e.key === 'ArrowUp' || e.key === 'w') { // up
            player.uP = false;
        } else if (e.key === 'ArrowDown' || e.key === 's') { // down
            player.dP = false;
        } else if (e.key === 'ArrowLeft' || e.key === 'a') { // left
            player.lP = false;
        } else if (e.key === 'ArrowRight' || e.key === 'd') { // right
            player.rP = false;
        }
    });
}

function getRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function circleCollision(c1, c2)
{
    return (Math.pow(c2.x - c1.x, 2) + Math.pow(c1.y - c2.y, 2) <= Math.pow(c1.r + c2.r, 2));
}