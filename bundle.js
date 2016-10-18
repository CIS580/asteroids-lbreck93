(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Laser = require('./laser.js');
const Astroid = require('./astroid.js')

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
var astroids = new Array();
for (var i=0; i<3; i++){
  astroids.push(
    new Astroid(
      {x: getRand(0, canvas.width), y: getRand(0, canvas.height)},
       canvas, getRand(0, 1)));
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

function collisionCheck(entity1, entity2) {
  return !(
      ((entity1.position.y + entity1.height) < (entity2.position.y)) ||
      (entity1.position.y > (entity2.position.y + entity2.height)) ||
      ((entity1.position.x + entity1.width) < entity2.position.x) ||
      (entity1.position.x > entity2.position.x + entity2.width)
    );
  }

function getRand(min, max){
  return Math.round(Math.random() * (max - min) + min);
}

function reset(){
  player.reset();
  // astroids = new Astroid(
  //   {x: getRand(0, canvas.width), y: getRand(0, canvas.height)}, canvas, 3);
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  player.update(elapsedTime);
  for(var i = 0; i < astroids.length; i++){
    astroids[i].update(elapsedTime);
  }

  //checks to see if laser has collided with astroid
  for(var i = 0; i < player.lasers.length; i++){
    for (var j = 0; j < astroids.length; j++){
      if (collisionCheck(player.lasers[i], astroids[j])){
        player.lasers.splice(i, 1);
        if (astroids[j].break()){
          astroids.splice(j, 1);
        }
        else{
          astroids[j].velocity.x = -astroids[j].velocity.x;
          astroids[j].velocity.y = -astroids[j].velocity.y;
        }//end collision check player-astroid
        console.log('player shot astroid');
        break;
      }//end if-collisionCheck
    }//end for-astroid array
  }//end for-laser array

  // if (collisionCheck(player, astroid)){
  //     if (player.death()){
  //       console.log('gameover');
  //       return;
  //     }
  //     else{
  //       console.log('contact!')
  //       reset();
  //
  //     }
  // }
  // player.lasers.forEach(function(las){
  //   // console.log(player.lasers);
  //   if (collisionCheck(las, astroid)){
  //     console.log('contact!');
  //   }
  //   else{
  //     // console.log('no contact.');
  //   }
    // astroids.foreach(function(ast){
    //   collisionCheck(las, ast);
    // });
// });
  // TODO: Update the game objects
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
  for(var i = 0; i < astroids.length; i++){
    astroids[i].render(elapsedTime, ctx);
  }

  // astroid.render(elapsedTime, ctx);

  var padding = 33*player.lives;
  x = canvas.width-padding;
  y = canvas.height-30;
  for (var i = 0; i < player.lives; i++){
    ctx.beginPath();
    ctx.moveTo(x, y-10);
    ctx.lineTo(x-10, y+10);
    ctx.lineTo(x, y);
    ctx.lineTo(x+10, y+10);
    ctx.closePath();
    if (i < player.deaths){
      ctx.strokeStyle = '#DD4A68';
    }
    else{
      ctx.strokeStyle = '#0095DD';
    }

    ctx.stroke();
    x = x + 35;
  }
}

},{"./astroid.js":2,"./game.js":3,"./laser.js":4,"./player.js":5}],2:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Astroid class
 */
module.exports = exports = Astroid;

/**
 * @constructor Astroid
 * Creates a new astroid object
 * @param {Postition} position object specifying an x and y
 */
function Astroid(position, canvas, mass) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = 'idle';
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 2,
    y: 3
  }
  this.angle = 0;
  this.mass = mass;
  this.setProperties();
}

Astroid.prototype.setProperties = function(){
  switch (this.mass) {
    case 0:
      this.radius = 16;
      break;
    case 1:
      this.radius = 32;
      break;
  }
  this.height = this.radius*2;
  this.width = this.radius*2;
}

Astroid.prototype.break = function(){
  this.mass--;
  if (this.mass < 0){
    return true;
  }
  else{
    this.status = 'breaking';
    this.setProperties();
    return false;
  }
}

/**
 * @function updates the astroid object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Astroid.prototype.update = function(time) {
  // var acceleration = {
  //     x: Math.sin(this.angle),
  //     y: Math.cos(this.angle)
  // }
  // this.velocity.x -= acceleration.x;
  // this.velocity.y -= acceleration.y;
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
}

/**
 * @function renders the astroid into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Astroid.prototype.render = function(time, ctx) {
  // ctx.translate(this.position.x, this.position.y);
  ctx.save();
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fill();
  ctx.strokeStyle = 'orange';
  ctx.rect(this.position.x-this.radius, this.position.y-this.radius, this.width, this.height);
  ctx.stroke();
  ctx.restore();

  }

},{}],3:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],4:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000 / 8;

/**
 * @module exports the laser class
 */
module.exports = exports = Laser;

/**
 * @constructor Laser
 * Creates a new laser object
 * @param {Postition} position object specifying an x and y
 */
function Laser(position, angle) {
    this.width = 3;
    this.height = 15;
    this.position = {
        x: position.x,
        y: position.y
    };
    this.velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
    this.state = 'hot';
  }

/**
 * @function updates the update object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Laser.prototype.update = function(time){
  switch (this.state) {
    case "hot":
    // move the laser
    this.position.x += 15*(this.velocity.x);
    this.position.y -= 15*(this.velocity.y);

    //disappear if it goes off screen
    if(this.position.x < 0) this.state = 'cold';
    if(this.position.x > this.worldWidth) this.state = 'cold';
    if(this.position.y < 0) this.state = 'cold';
    if(this.position.y > this.worldHeight) this.state = 'cold';
    break;
  }
}

/**
 * @function render the laser object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Laser.prototype.render = function(time, ctx)
{ 
  ctx.save()
  // Draw a line for the laser
  ctx.strokeStyle = "green";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(this.position.x, this.position.y);
  ctx.lineTo(this.position.x + 15*(this.velocity.x), this.position.y - 15*(this.velocity.y));
  ctx.stroke();
  ctx.restore();
}

},{}],5:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000 / 8;
const Laser = require('./laser.js');

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas) {
    this.worldWidth = canvas.width;
    this.worldHeight = canvas.height;
    this.state = "idle";
    this.position = {
        x: position.x,
        y: position.y
    };
    this.velocity = {
        x: 0,
        y: 0
    }
    this.angle = 0;
    this.radius = 20;
    this.height = this.radius;
    this.width = this.radius;
    this.thrusting = false;
    this.steerLeft = false;
    this.steerRight = false;
    this.lives = 3;
    this.deaths = 0;
    this.lasers = new Array();

    var self = this;
    window.onkeydown = function(event) {
        switch (event.key) {
            case 'e': // e for emergency break
              self.thrusting = false;
              self.velocity.x = 0;
              self.velocity.y = 0;
              self.state = 'ebreak';
              break;
            case 'ArrowUp': // up
            case 'w':
                event.preventDefault();
                if (self.state != 'ebreak'){
                  self.thrusting = true;
                }
                break;
            case 'ArrowLeft': // left
            case 'a':
              event.preventDefault();
                self.steerLeft = true;
                break;
            case 'ArrowRight': // right
            case 'd':
              event.preventDefault();
                self.steerRight = true;
                break;
            case ' ':
              event.preventDefault();
              if (self.state == 'idle'){
                self.lasers.push(new Laser(self.position, self.angle+1.575));
                self.state = 'firing';
              }
              break;
        }
    }

    window.onkeyup = function(event) {
        switch (event.key) {
            case 'e': // e for emergency break
              self.state = 'idle';
              break;
            case 'ArrowUp': // up
            case 'w':
                self.thrusting = false;
                break;
            case 'ArrowLeft': // left
            case 'a':
                self.steerLeft = false;
                break;
            case 'ArrowRight': // right
            case 'd':
                self.steerRight = false;
                break;
            case ' ':
              // console.log('can fire again.');
              self.state = 'idle';
        }
    }
}

/**
  * @function handles player death function.
  */
Player.prototype.death = function() {
    this.state = 'dead';
    this.deaths++;
    if (this.lives == this.deaths) {
        return true
    }
    return false;
}

Player.prototype.reset = function(){
  this.position = {x: this.worldWidth/2, y: this.worldHeight/2};
  this.velocity = {x: 0, y: 0};
  this.angle = 0;
  this.thrusting = false;
  this.steerRight = false;
  this.steerLeft = false;
  this.lasers = new Array();
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
    // Apply angular velocity
    if (this.steerLeft) {
        this.angle += time * 0.005;
    }
    if (this.steerRight) {
        this.angle -= 0.1;
    }
    // Apply acceleration
    if (this.thrusting) {
        var acceleration = {
            x: Math.sin(this.angle),
            y: Math.cos(this.angle)
        }
        this.velocity.x -= acceleration.x;
        this.velocity.y -= acceleration.y;
    }
    // Apply velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    // Wrap around the screen
    if (this.position.x < 0) this.position.x += this.worldWidth;
    if (this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
    if (this.position.y < 0) this.position.y += this.worldHeight;
    if (this.position.y > this.worldHeight) this.position.y -= this.worldHeight;

    this.lasers.forEach(function(las){
      las.update(time);
    });

    //remove laser from game.
    // for(var i = 0; i < this.lasers.length; i++){
    //   if (this.lasers[i].state == 'cold'){
    //     this.removeLaser(i);
    //   }
    // }
}

Player.prototype.removeLaser = function(i){
  this.lasers.splice(i, 1);
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
    ctx.save();

    // Draw player's ship
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(-this.angle);
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-10, 10);
    ctx.lineTo(0, 0);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw engine thrust
    if (this.thrusting) {
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(5, 10);
        ctx.arc(0, 10, 5, 0, Math.PI, true);
        ctx.closePath();
        ctx.strokeStyle = 'orange';
        ctx.stroke();
    }
    ctx.restore();

    // ctx.strokeStyle = 'yellow';
    // ctx.rect(this.position.x-this.radius/2, this.position.y-this.radius/2, this.width, this.height);
    // ctx.stroke();

    this.lasers.forEach(function(las){
      las.render(time, ctx);
    })
}

},{"./laser.js":4}]},{},[1]);
