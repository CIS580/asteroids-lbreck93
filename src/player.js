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
    this.score = 0;
    this.angle = 0;
    this.radius = 20;
    this.maxVelocity = 3;
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

    this.reset();

    if (this.lives == this.deaths) {
        return true
    }
    return false;
}

Player.prototype.reset = function(){
  this.position = {x: this.worldWidth/2, y: this.worldHeight/2};
  this.velocity = {x: 0, y: 0};
  this.angle = 0;
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
        if (this.velocity.x > this.maxVelocity){
          this.velocity.x = this.maxVelocity;
        }else if(this.velocity.x < -this.maxVelocity){
          this.velocity.x = -this.maxVelocity
        }
        else{
          this.velocity.x -= acceleration.x;
        }

        if (this.velocity.y > this.maxVelocity){
          this.velocity.y = this.maxVelocity;
        }else if(this.velocity.y < -this.maxVelocity){
          this.velocity.y = -this.maxVelocity
        }
        else{
          this.velocity.y -= acceleration.y;
        }
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
