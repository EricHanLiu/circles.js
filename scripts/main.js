let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

class Ball
{
    constructor(x, y, r, speed, color)
    {
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = speed;
        this.color = color;
        this.dP = null;
        this.uP = null;
        this.lP = null;
        this.rP = null;
    }
}

function main()
{
    // create player ball
    let midX = window.innerWidth / 2;
    let midY = window.innerHeight / 2;
    let player = new Ball(midX, midY, 10, 7, 'tomato');

    setCanvasSize();
    attachListeners(player);

    // generate enemies
    let enemies = [];
    generateEnemies(enemies, player);

    // draw/game loop
    let start = Date.now();
    function loop ()
    {
        transitionBackground(start);

        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawPlayer(player);
        let gameOver = drawEnemies(enemies, player);
        movePlayer(player);
        moveEnemies(enemies, player);

        if (!gameOver) {
            window.requestAnimationFrame(loop);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            document.getElementById('gameCanvas').style.backgroundColor = '#000';
        }
    }
    window.requestAnimationFrame(loop);
}

main();

function transitionBackground(start)
{
    let now = Date.now();
    let elapsed = Math.floor((now - start) / 1000);
    if (elapsed % 15 === 0 && elapsed !== 0) { // change color every 10 seconds
        let randomColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
        document.getElementById('gameCanvas').style.backgroundColor = randomColor;
    }
}

function generateEnemies(enemies, player)
{
    let enemyGenInterval = 2000;
    setInterval(() => {
        // create enemy ball
        let attr = getRandomAttributes(player);
        enemies.push(new Ball(attr.x, attr.y, attr.r, attr.speed, 'blue'));
    }, enemyGenInterval);
}

// returns random attributes scaled to a player
function getRandomAttributes(player)
{
    let x = getRandomInt(0, window.innerWidth);
    let y = getRandomInt(0, window.innerHeight);
    // size based on player radius
    let r = getRandomInt(player.r / 2, player.r * 1.5);
    let radiusRatio = r / player.r;
    let speed = Math.floor((1 / radiusRatio) * getRandomInt(2, player.speed)); // speed based on comparative radius
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

// draw the enemies and handle collisions
function drawEnemies(enemies, player)
{
    if (enemies === []) {
        return;
    }
    for (let i = 0; i < enemies.length; i++)
    {
        let e = enemies[i];
        if (circleCollision(player, e)) {
            if (player.r >= e.r) {
                // remove enemy from enemies array, increase radius size
                let index = enemies.indexOf(e);
                enemies.splice(index, 1);
                player.r += Math.floor(e.r / 10);
                return false; // whether we lost
            } else {
                // player dies
                return true; // whether we lost
            }
        } else {
            draw(e);
        }
    }
}

function moveEnemies(enemies, player)
{
    for (let i = 0; i < enemies.length; i++)
    {
        let e = enemies[i];
        // janky way to only do 25% of time
        if (Math.random() > 0.75) {
            generateRandomKeypress(e, player);
        }
        movePlayer(e);
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

function generateRandomKeypress(enemy, player)
{
    let enemyBigger = enemy.r > player.r;
    let wantMoveRight = enemy.x < player.x;
    let wantMoveDown = enemy.y < player.y;

    if (enemyBigger) { // move towards player
        enemy.uP = weightedBool(!wantMoveDown);
        enemy.dP = weightedBool(wantMoveDown);
        enemy.lP = weightedBool(!wantMoveRight);
        enemy.rP = weightedBool(wantMoveRight);
    } else { // move away from player
        enemy.uP = weightedBool(wantMoveDown);
        enemy.dP = weightedBool(!wantMoveDown);
        enemy.lP = weightedBool(wantMoveRight);
        enemy.rP = weightedBool(!wantMoveRight);
    }
}

function weightedBool(weigh)
{
    // returns true weighted based on input ratio
    if (weigh) {
        return Math.random() < 0.8;
    }
    return Math.random() < 0.2;
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
