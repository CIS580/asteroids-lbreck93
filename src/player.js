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
    this.radius = 64;
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
                if (self.state != 'ebreak'){
                  self.thrusting = true;
                }
                break;
            case 'ArrowLeft': // left
            case 'a':
                self.steerLeft = true;
                break;
            case 'ArrowRight': // right
            case 'd':
                self.steerRight = true;
                break;
            case ' ':
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
    this.lives--;
    this.deaths++;
    if (lives == 0) {
        return true
    }
    return false;
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

    for(var i = 0; i < this.lasers.length; i++){
      if (this.lasers[i].state == 'cold'){
        this.lasers.splice(i, 1);
      }
    }
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

    this.lasers.forEach(function(las){
      las.render(time, ctx);
    })
}
