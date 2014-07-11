var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFram ||
    window.mozRequestAnimationFram ||
    function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.getElementById("game");
var width = document.body.clientWidth;
var height = document.body.clientHeight;
var p1ScoreElm = document.getElementById("p1score");
var p2ScoreElm = document.getElementById("p2score");
var p1Score = 0;
var p2Score = 0;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var paddle_width = 10;
var paddle_height = 100;
var base_speed = 4;
var player_max_speed = 5;
var comp_max_speed = 5;
var player = new Player();
var computer = new Computer();
var ball = new Ball(width / 2, height / 2);

var touchQuadrant = 0;
var keysDown = {};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});

    document.addEventListener("touchstart", function(event) {
        event.preventDefault();
        var touchobj = event.changedTouches[0];
        x = parseInt(touchobj.clientX);
        y = parseInt(touchobj.clientY);
        if (x < width/2 && y < height/2) { // top left quadrant
            touchQuadrant = 0;
            keysDown[38] = true;
        } else if (x > width/2 && y < height/2) { //top right quadrant
            touchQuadrant = 1;
            keysDown[38] = true;
        } else if (x > width/2 && y > height/2) { //bot right quadrant
            touchQuadrant = 2;
            keysDown[40] = true;
        } else if (x < width/2 && y > height/2) { //bot left quadrant
            touchQuadrant = 3;
            keysDown[40] = true;
        }
    }, false);

    document.addEventListener("touchend", function(event) {
        event.preventDefault();
        if (touchQuadrant == 0) {
            delete keysDown[38];
        } else if (touchQuadrant == 1) {
            delete keysDown[38];
        } else if (touchQuadrant == 2) {
            delete keysDown[40];
        } else if (touchQuadrant == 3) {
            delete keysDown[40];
        }
    }, false);


window.onload = function() {
    initField();
    animate(step);
};

window.onresize = function() {
    width = document.body.clientWidth;
    height = document.body.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

var step = function() {
    update();
    render();
    animate(step);
};

var update = function() {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
};


var render = function() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);
    drawCenterLine();
    player.render();
    computer.render();
    ball.render();
};

var initField = function() {
    initScoreboard();
    drawCenterLine();
}

var initScoreboard = function() {
    var p1Score = document.getElementById("p1score");
    var p2Score = document.getElementById("p2score");
    p1Score.style.left = width/2 + 20;
    p2Score.style.right = width/2 + 20;
}

var drawCenterLine = function() {
    context.beginPath();
    context.moveTo(width/2, 0);
    context.lineTo(width/2, height);

    context.strokeStyle = '#999'
    context.lineWidth = 10;
    context.setLineDash([25]);
    context.stroke();
}

var updateScores = function() {
    p1ScoreElm.innerHTML = p1Score;
    p2ScoreElm.innerHTML = p2Score;
}

function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
}

Paddle.prototype.render = function() {
    context.fillStyle = "#DDDDDD";
    context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if(this.y < 0) { // all the way to the left
        this.y = 0;
        this.y_speed = 0;
    }
    if (this.y + this.height > height) { // all the way to the right
        this.y = height - this.height;
        this.y_speed = 0;
    }
};

function Player() {
    this.paddle = new Paddle(width - 2*paddle_width, height/2 - paddle_height/2, paddle_width, paddle_height);
}

Player.prototype.render = function() {
    this.paddle.render();
};

Player.prototype.update = function() {
    for (var key in keysDown) {
        var value = Number(key);
        if (value == 37) { // left arrow
            this.paddle.move(-player_max_speed, 0);
        } else if (value == 39) { // right arrow
            this.paddle.move(player_max_speed, 0);
        } else if (value == 38) { // up arrow
            this.paddle.move(0, -player_max_speed);
        } else if (value == 40) { // down arrow
            this.paddle.move(0, player_max_speed);
        } else {
            this.paddle.move(0,0);
        }
    }
};

function Computer() {
    this.paddle = new Paddle(10, height/2 - paddle_height/2, paddle_width, paddle_height);
}

Computer.prototype.render = function() {
    this.paddle.render();
};

Computer.prototype.update = function(ball) {
    var y_pos = ball.y;
    var diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
    if (diff < 0 && diff < -(comp_max_speed - 1)) { // max speed up
        diff = -comp_max_speed;
    } else if (diff > 0 && diff > (comp_max_speed - 1)) { // max speed down
        diff = comp_max_speed;
    }
    this.paddle.move(0, diff);
    if (this.paddle.y < 0) {
        this.paddle.y = 0;
    } else if (this.paddle.y + this.paddle.height > height) {
        this.paddle.y = height - this.paddle.height
    }
};

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = base_speed;
    this.y_speed = 0;
    this.radius = 5;
}

Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius,  2 * Math.PI, false);
    context.fillStyle = "#DDDDDD";
    context.fill();
};

Ball.prototype.update = function(paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_x = this.x - 5;
    var top_y = this.y - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;

    if (this.y - 5 < 0) { // hitting the top wall
        this.y = 5;
        this.y_speed = -this.y_speed;
    } else if (this.y + 5 > height) { // hitting the right wall}
        this.y = height - 5;
        this.y_speed = -this.y_speed;
    }
    if (this.x < 0) { // a point was scored on left player
        this.y_speed = 0;
        this.x_speed = -base_speed;
        this.x = width / 2;
        this.y = height / 2;;
        p1Score += 1;
        console.log("GOAL: Player 2 scores. Score P1: " + p1Score + " P2: " + p2Score);
        updateScores();
    }
    if (this.x > width) { // a point was scored on right player
        this.y_speed = 0;
        this.x_speed = base_speed;
        this.x = width / 2;
        this.y = height / 2;;
        p2Score += 1;
        console.log("GOAL: Player 1 scores. Score P1: " + p1Score + " P2: " + p2Score);
        updateScores();
    }

   if (top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x && top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y) {
       // hit the player's paddle
       this.x_speed = -base_speed;
       this.y_speed += (paddle1.y_speed / 2);
       this.x += this.x_speed;
   }
   if (top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x && top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y) {
       // hit the computer's paddle
       this.x_speed = base_speed;
       this.y_speed += (paddle2.y_speed / 2);
       this.x += this.x_speed;
   }
};

