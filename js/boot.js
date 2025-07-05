/*!
 * Particleground
 * @author Jonathan Nicol - @mrjnicol
 * @version 1.1.0
 * @description Creates a canvas based particle system background
 * License: MIT
 */
(function(window, document, undefined) {
  'use strict';

  function deepExtend(out) {
    out = out || {};

    for (var i = 1, len = arguments.length; i < len; i++) {
      var obj = arguments[i];

      if (!obj) continue;

      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        if (typeof obj[key] === 'object')
          out[key] = deepExtend(out[key], obj[key]);
        else 
          out[key] = obj[key];
      }
    }

    return out;
  }

  function Particleground(element, options) {
    this.$element = element;
    this.defaults = {
      minSpeedX: 0.1,
      maxSpeedX: 0.7,
      minSpeedY: 0.1,
      maxSpeedY: 0.7,
      directionX: 'center',
      directionY: 'center',
      density: 10000,
      dotColor: '#666666',
      lineColor: '#666666',
      particleRadius: 7,
      lineWidth: 1,
      curvedLines: false,
      proximity: 100,
      parallax: true,
      parallaxMultiplier: 5,
      onInit: function() {},
      onDestroy: function() {}
    };
    this.options = deepExtend({}, this.defaults, options);
    this._init();
  }

  Particleground.prototype._init = function() {
    var canvas = document.createElement('canvas');
    canvas.className = 'pg-canvas';
    canvas.style.display = 'block';
    this.$element.insertBefore(canvas, this.$element.firstChild);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this._resize();
    this._populate();
    this._bindEvents();
    this.options.onInit.call(this);
    this._animationLoop();
  };

  Particleground.prototype._populate = function() {
    var amount = Math.round(this.canvas.width * this.canvas.height / this.options.density);
    while (this.particles.length < amount) {
      this.particles.push(new Particle(this, this.particles.length));
    }
    if (this.particles.length > amount) {
      this.particles.splice(amount);
    }
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].setStackPos(i);
    }
  };

  Particleground.prototype._bindEvents = function() {
    var self = this;
    window.addEventListener('resize', function() {
      self._resize();
      self._populate();
    });
    // Parallax settings
    this.parallax = this.options.parallax;
    this.parallaxMultiplier = this.options.parallaxMultiplier;
    this.parallaxOffsetX = 0;
    this.parallaxOffsetY = 0;
    this.parallaxTargetX = 0;
    this.parallaxTargetY = 0;

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;

    window.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if(self.parallax) {
        self.parallaxTargetX = (mouseX - window.innerWidth / 2) / self.parallaxMultiplier;
        self.parallaxTargetY = (mouseY - window.innerHeight / 2) / self.parallaxMultiplier;
      }
    });
  };

  Particleground.prototype._resize = function() {
    this.canvas.width = this.$element.offsetWidth || window.innerWidth;
    this.canvas.height = this.$element.offsetHeight || window.innerHeight;
  };

  Particleground.prototype._animationLoop = function() {
    var self = this;
    var ctx = self.ctx;
    var width = self.canvas.width;
    var height = self.canvas.height;

    function frame() {
      ctx.clearRect(0,0,width,height);

      // Parallax smooth easing
      self.parallaxOffsetX += (self.parallaxTargetX - self.parallaxOffsetX) * 0.1;
      self.parallaxOffsetY += (self.parallaxTargetY - self.parallaxOffsetY) * 0.1;

      self.particles.forEach(function(particle) {
        particle.updatePosition();
      });

      self.particles.forEach(function(particle){
        particle.draw(ctx, self.parallaxOffsetX, self.parallaxOffsetY);
      });

      requestAnimationFrame(frame);
    }
    frame();
  };

  Particleground.prototype.destroy = function() {
    this.options.onDestroy.call(this);
    if (this.canvas.parentNode === this.$element) {
      this.$element.removeChild(this.canvas);
    }
  };

  // Particle class
  function Particle(pg, stackPos) {
    this.pg = pg;
    this.stackPos = stackPos;
    this.active = true;
    this.layer = Math.ceil(3 * Math.random());
    this.parallaxOffsetX = 0;
    this.parallaxOffsetY = 0;
    this.position = {
      x: Math.ceil(Math.random() * pg.canvas.width),
      y: Math.ceil(Math.random() * pg.canvas.height)
    };
    this.speed = {
      x: calculateSpeed(pg.options.directionX, pg.options.minSpeedX, pg.options.maxSpeedX),
      y: calculateSpeed(pg.options.directionY, pg.options.minSpeedY, pg.options.maxSpeedY)
    };
  }
  Particle.prototype.setStackPos = function(pos) { this.stackPos = pos; };

  Particle.prototype.updatePosition = function() {
    var pg = this.pg;
    var width = pg.canvas.width;
    var height = pg.canvas.height;

    if (pg.parallax) {
      this.parallaxOffsetX += (pg.parallaxTargetX - this.parallaxOffsetX) / 10;
      this.parallaxOffsetY += (pg.parallaxTargetY - this.parallaxOffsetY) / 10;
    }

    var nextX = this.position.x + this.speed.x + this.parallaxOffsetX;
    var nextY = this.position.y + this.speed.y + this.parallaxOffsetY;

    if (nextX < 0) this.position.x = width;
    else if (nextX > width) this.position.x = 0;
    else this.position.x = nextX;

    if (nextY < 0) this.position.y = height;
    else if (nextY > height) this.position.y = 0;
    else this.position.y = nextY;
  };

  Particle.prototype.draw = function(ctx, parallaxX, parallaxY) {
    var pg = this.pg;
    var posX = this.position.x + this.parallaxOffsetX;
    var posY = this.position.y + this.parallaxOffsetY;

    ctx.beginPath();
    ctx.arc(posX, posY, pg.options.particleRadius / 2, 0, 2 * Math.PI, false);

    ctx.fillStyle = pg.options.dotColor;
    ctx.fill();
    ctx.closePath();

    // Draw lines to other nearby particles
    for (var i = this.stackPos + 1; i < pg.particles.length; i++) {
      var p2 = pg.particles[i];
      var dx = posX - (p2.position.x + p2.parallaxOffsetX);
      var dy = posY - (p2.position.y + p2.parallaxOffsetY);
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < pg.options.proximity) {
        ctx.beginPath();
        ctx.strokeStyle = pg.options.lineColor;
        ctx.lineWidth = pg.options.lineWidth;
        ctx.moveTo(posX, posY);

        if (pg.options.curvedLines) {
          var xc = (posX + p2.position.x) / 2;
          var yc = (posY + p2.position.y) / 2;
          ctx.quadraticCurveTo(xc, yc, p2.position.x + p2.parallaxOffsetX, p2.position.y + p2.parallaxOffsetY);
        } else {
          ctx.lineTo(p2.position.x + p2.parallaxOffsetX, p2.position.y + p2.parallaxOffsetY);
        }

        ctx.stroke();
        ctx.closePath();
      }
    }
  };

  function calculateSpeed(direction, min, max) {
    switch(direction) {
      case 'left': return -randomBetween(min, max);
      case 'right': return randomBetween(min, max);
      case 'center': return randomBetween(-max / 2, max / 2);
      default: return randomBetween(-max / 2, max / 2);
    }
  }
  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Export the plugin
  window.particleground = function(element, options) {
    return new Particleground(element, options);
  };

})(window, document);


// Your init code:
$(document).ready(function() {
  particleground(document.getElementById('particles-foreground'), {
    dotColor: 'rgba(255, 255, 255, 1)',
    lineColor: 'rgba(255, 255, 255, 0.05)',
    minSpeedX: 0.3,
    maxSpeedX: 0.6,
    minSpeedY: 0.3,
    maxSpeedY: 0.6,
    density: 50000,
    curvedLines: false,
    proximity: 250,
    parallaxMultiplier: 10,
    particleRadius: 4,
  });

  particleground(document.getElementById('particles-background'), {
    dotColor: 'rgba(255, 255, 255, 0.5)',
    lineColor: 'rgba(255, 255, 255, 0.05)',
    minSpeedX: 0.075,
    maxSpeedX: 0.15,
    minSpeedY: 0.075,
    maxSpeedY: 0.15,
    density: 30000,
    curvedLines: false,
    proximity: 20,
    parallaxMultiplier: 20,
    particleRadius: 2,
  });

  // Fade out the boot screen after 4 seconds (adjust as needed)
  setTimeout(function() {
    $('#bootScreen').addClass('fade-out');
    setTimeout(() => $('#bootScreen').remove(), 1000); // match CSS transition duration
  }, 4000);
});