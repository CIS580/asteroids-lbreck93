"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Asteroid class
 */
module.exports = exports = Astroid;

/**
 * @constructor Asteroid
 * Creates a new asteroid object
 * @param {Postition} position object specifying an x and y
 */
function Astroid(position, canvas, mass, angle) {
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
  this.radius  = 32;
  this.height = this.radius*2;
  this.width = this.radius*2;
  this.mass = mass;
}

/**
 * @function updates the asteroid object
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
 * @function renders the asteroid into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Astroid.prototype.render = function(time, ctx) {
  // ctx.translate(this.position.x, this.position.y);
  ctx.save()
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fill();
  ctx.strokeStyle = 'orange';
  ctx.stroke();
  ctx.restore();
  }
