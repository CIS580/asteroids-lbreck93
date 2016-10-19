"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Laser = require('./laser.js');
const Astroid = require('./astroid.js')

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var destroyed = new Audio('assets/destroyed.m4a');
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
var astroids = new Array();
for (var i=0; i<10; i++){
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
  for (var i=0; i<10; i++){
    astroids.push(
      new Astroid(
        {x: getRand(0, canvas.width), y: getRand(0, canvas.height)},
         canvas, getRand(0, 1)));
  }
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
        }//end collision check player-astroid
        console.log('player shot astroid');
        break;
      }//end if-collisionCheck
    }//end for-astroid array
  }//end for-laser array

  for(var i = 0; i < astroids.length; i++){
    for (var j = i+1; j < astroids.length-1; j++){
      if (collisionCheck(astroids[i], astroids[j])){
        if (astroids[i].break()){
          astroids.splice(i, 1);
        }//end if astroid[i]
        if (astroids[j].break()){
          astroids.splice(j, 1);
        }//end if astroid[j]
        destroyed.play();
        console.log('astroids collided.');
      }//end collisioncheck
    }//end for-j-astroid
  }//end for-i-astroid

  for(var i = 0; i < astroids.length; i++){
    if (collisionCheck(player, astroids[i])){
      player.death();
      if (astroids[i].break()){
        astroids.splice(i, 1);
      }//end if astroids is dead
      destroyed.play();
      console.log('player killed by astroid.');
    }//end if-astroid hits player
  }//end for if astroid hits player

  if (player.lives == player.deaths){
    player = null;
    console.log('gameover');
  }

  if (astroids.length == 0){
    player.score++;
    reset();
  }

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

  if (player == null){
    ctx.strokeStyle = 'white';
    ctx.font = "32px";
    ctx.strokeText('GAME OVER', canvas.width/2 - 40, canvas.height/2);
  }
  else{
    player.render(elapsedTime, ctx);
  }

  for(var i = 0; i < astroids.length; i++){
    astroids[i].render(elapsedTime, ctx);
  }

  var padding = 33*player.lives;
  x = canvas.width-padding;
  y = canvas.height-30;
  for(var i = 0; i < player.lives; i++){
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
  }//end drawing spaceships

  ctx.font = "32px";
  ctx.strokeText('Level: ' + player.score, 5, canvas.height - 30);
  ctx.strokeText('Score: ' + player.score, 5, canvas.height - 10);
}
