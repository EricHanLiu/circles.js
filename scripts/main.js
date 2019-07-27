let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let score = 0;

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
    document.getElementById('gameCanvas').style.backgroundColor = '#eee';
    // create player ball
    let midX = window.innerWidth / 2;
    let midY = window.innerHeight / 2;
    let playerRadius = 7;
    let playerSpeed = 6;
    let player = new Ball(midX, midY, playerRadius, playerSpeed, 'tomato');

    attachListeners(player);
    setCanvasSize();

    // generate enemies
    let enemies = [];
    generateEnemies(enemies, player);

    let colorStack = ['#FF9E9E', '#82F8EA', '#FA8728', '#D47DD7', 'F34E8D', 'D4C6FC'];

    // draw/game loop
    let start = Date.now();
    let set = [true];
    function loop ()
    {
        score = transitionBackground(start, colorStack, set);

        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawPlayer(player);
        let gameOver = drawEnemies(enemies, player);
        movePlayer(player);
        moveEnemies(enemies, player);

        if (!gameOver) {
            window.requestAnimationFrame(loop);
        } else {
            drawGameOver();
        }
    }
    window.requestAnimationFrame(loop);
}

function newGameListener(e)
{
    if (e.key === ' ') {
        document.removeEventListener('keypress', newGameListener);
        document.getElementById('gameCanvas').style.backgroundColor = '#eee';
        main();
    }
}

drawIntro();

function drawIntro()
{
    setCanvasSize();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "100px Rubik";
    ctx.fillText("Circles.js", canvas.width / 2, canvas.height / 2 - 100);
    ctx.font = "24px Rubik";
    ctx.fillText("Move with WASD or arrow keys", canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText("Collect the green & avoid the purple", canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Press SPACE to play", canvas.width / 2, canvas.height / 2 + 50);
    document.addEventListener('keypress', newGameListener);
}

function drawGameOver()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Rubik";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText("Your final score was: " + score, canvas.width / 2, canvas.height / 2);
    ctx.fillText("Press SPACE to play again", canvas.width / 2, canvas.height / 2 + 30);
    document.addEventListener('keypress', newGameListener);
    document.getElementById('gameCanvas').style.backgroundColor = '#AD65CF';
}

function drawScore(score)
{
    ctx.font = "16px Rubik";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function transitionBackground(start, colorStack, set)
{
    let now = Date.now();
    let elapsed = Math.floor((now - start) / 1000);
    score = elapsed;
    if (elapsed !== 0 && elapsed % 30 === 0 && set[0]) { // change every 30 seconds
        document.getElementById('gameCanvas').style.backgroundColor = colorStack[0];
        colorStack.unshift(colorStack.pop());
        set[0] = false;
    }
    // really janky way to avoid game loop shifting colorStack
    if (elapsed % 28 === 0) { 
        set[0] = true;
    }

    // to update score
    return Math.floor((now - start) / 100);
}

function generateEnemies(enemies, player)
{
    let enemyGenInterval = 1500;
    setInterval(() => {
        // create enemy ball
        let attr = getRandomAttributes(player);
        let color;
        if (attr.r > player.r) {
            color = 'midnightblue';
        } else {
            color = 'lime';
        }
        // golden snitch enemy 3% of time, hard to catch
        if (Math.random() > 0.97) {
            attr.r = 4;
            attr.speed = player.speed * 1.5;
            color = 'pink';
        }
        enemies.push(new Ball(attr.x, attr.y, attr.r, attr.speed, color));
    }, enemyGenInterval);
}

// returns random attributes scaled to a player
function getRandomAttributes(player)
{
    let w = canvas.width;
    let h = canvas.height;
    // make sure x doesn't generate too close to player
    let x1 = getRandomInt(0, player.x - 200);
    let x2 = getRandomInt(player.x + 200, w);
    let x = Math.random() > 0.5 ? x1 : x2;
    if (player.x - 200 < 0) // if player close to left wall, generate on right half
        x = x2;
    else
        x = x1;

    let y1 = getRandomInt(0, player.y - 200);
    let y2 = getRandomInt(player.y + 200, h);
    let y = Math.random() > 0.5 ? y1 : y2;
    if (player.y - 200 < 0)
        y = y2;
    else
        y = y1;

    // size based on player radius
    let r = getRandomInt(player.r / 2, player.r * 1.5);
    let radiusRatio = r / player.r;
    // speed based on comparative radius
    let speed = Math.floor((1 / radiusRatio) * getRandomInt(2, player.speed)); 
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
                if (e.color === 'pink') { // snitch caught, increase speed
                    player.speed += 1;
                } else { 
                    // increase by 10% percent of enemy radius, 
                    // by decreasing chance (based on your radius)
                    player.r += Math.random() < (4 / player.r) ? (e.r / 10) : 0;
                }
                return false; // whether we lost
            } else {
                // player dies
                return true; // whether we lost
            }
        } else {
            if (e.r <= player.r && e.color != 'pink') {
                e.color = 'lime';
            }
            draw(e);
        }
    }
}

function moveEnemies(enemies, player)
{
    for (let i = 0; i < enemies.length; i++)
    {
        let e = enemies[i];
        // janky way to only do 15% of time
        if (Math.random() > 0.85) {
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

    let w = canvas.width;
    let h = canvas.height;

    if (enemyBigger) { // move towards player
        enemy.uP = weightedBool(!wantMoveDown);
        enemy.dP = weightedBool(wantMoveDown);
        enemy.lP = weightedBool(!wantMoveRight);
        enemy.rP = weightedBool(wantMoveRight);
    } else { // move away from player
        // if enemy is near edges, don't move away from player (prevents getting stuck in corners)
        if (enemy.y < 200)
            enemy.uP = Math.random() < 0.2;
        else
            enemy.uP = weightedBool(wantMoveDown);
        if (enemy.y > h - 200)
            enemy.dP = Math.random() < 0.2;
        else
            enemy.dP = weightedBool(!wantMoveDown);
        if (enemy.x < 200)
            enemy.lP = Math.random() < 0.2;
        else
            enemy.lP = weightedBool(wantMoveRight);
        if (enemy.x > w - 200)
            enemy.rP = Math.random() < 0.2;
        else
            enemy.rP = weightedBool(!wantMoveRight);
    }
}

function weightedBool(weigh)
{
    // returns true weighted based on input bool
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

    drawScore(score);
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

function between(x, min, max)
{
    return x >= min && x <= max;
}