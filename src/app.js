"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Laser = require('./laser.js');
const Asteroid = require('./asteroid.js')

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
// var asteroids = new Array();
var asteroid = new Asteroid({x: canvas.width/6, y: canvas.height/2}, canvas,
5, 0);

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
  asteroid.update(elapsedTime);
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
  asteroid.render(elapsedTime, ctx);

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
