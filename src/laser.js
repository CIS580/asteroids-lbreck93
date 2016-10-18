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
