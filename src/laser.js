"use strict";

const MS_PER_FRAME = 1000 / 8;

/**
 * @module exports the Player class
 */
module.exports = exports = Laser;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Laser(position, angle) {
    this.position = {
        x: position.x,
        y: position.y
    };
    this.velocity = {
        x: Math.cos(this.angle),
        y: Math.sin(this.angle)
    }
    this.state = 'hot';
    this.onscreen = true;
    console.log('laser');
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
    if(this.position.x < 0) this.onscreen = false;
    if(this.position.x > this.worldWidth) this.onScreen = false;
    if(this.position.y < 0) this.onscreen = false;
    if(this.position.y > this.worldHeight) this.onScreen = false;

    break;
  }
}

/**
 * @function render the laser object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Laser.prototype.render = function(time, ctx)
{
  // Draw a red line for the laser
  ctx.strokeStyle = "Red";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(this.position.x, this.position.y);
  ctx.lineTo(this.position.x + 15*(this.velocity.x), this.position.y - 15*(this.velocity.y));
  ctx.stroke();
  ctx.lineWidth = 1;
}
