
var V = Vector;
var max = Math.max;
var min = Math.min;
var random = Math.random;
var abs = Math.abs;

var colors = {
  midnightBlue: [44, 62, 80],
  wisteria: [142, 68, 173],
  pomegranate: [192, 57, 43],
  carrot: [230, 126, 34],
  concrete: [149, 165, 166],
  white: [255, 255, 255],
  black: [0, 0, 0],
}

function main() {
  var app = document.getElementById('app');
  var can = getCan(app);
  var man = new Man(50, 50);

  var keyVectors = {
    'none': {x:0, y:0},
    'left': {x:-1, y:0},
    'up': {x:0, y:-1},
    'right': {x:1, y:0},
    'down': {x:0, y:1},
  };
  var keyOpposites = {
    'left': 'right',
    'up': 'down',
    'right': 'left',
    'down': 'up',
  }
  var keyState = {
    left: false,
    up: false,
    right: false,
    down: false,
  };

  function getCompositeVector() {
    var vec = {x:0, y:0};
    if (keyState.up) {
      vec = V.sum(vec, keyVectors.up);
    }
    if (keyState.down) {
      vec = V.sum(vec, keyVectors.down);
    }
    if (keyState.left) {
      vec = V.sum(vec, keyVectors.left);
    }
    if (keyState.right) {
      vec = V.sum(vec, keyVectors.right);
    }
    return V.norm(vec);
  }

  initKeyboardEvents(keyState,
    function keyPressed(key) {
      man.applyMovement(getCompositeVector());
    },
    function keyReleased(key) {
      man.applyMovement(getCompositeVector());
    });

  var entities = [man];

  var i = 10;
  while (i--) {
    entities.push(new Stranger(random() * 900, random() * 600))
  }

  initEngine(entities, can);
}

function initEngine(entities, can) {
  function main() {
    requestAnimationFrame(main);
    tick(entities);
    draw(entities, can, Date.now())
  }
  main();
}

function Man(x, y) {
  this.position = {x:x, y:y};
  this.direction = {x:0, y:1};
  this.isMoving = false;
  this.speed = 0;
  this._speed = 0;
  this.momentum = {x:0, y:0};
  this._direction = {x:0, y:1};
}

Man.prototype.size = 30;

Man.prototype.draw = function(can, t) {
  var x = this.position.x;
  var y = this.position.y;
  var a = V.angle(this.direction);
  var shadow = this.getShadowLength(t);
  var sLength = shadow * 100;
  var sAlpha = (1 - abs(shadow)) * 0.3;
  can.translate(x, y)
     .fillStyle('#000000')
     .alpha(sAlpha)
     .fillRect(0, -this.size/2, sLength, this.size)
     .alpha(1)
     .paintStyle('#222222', '#DDDDDD', 1)
     .rotate(a)
     .paintBox(0, 0, this.size, this.size)
     .rotate(-a)
     .translate(-x, -y);
}

Man.prototype.getShadowLength = function(t) {
  t -= 12;
  if (t > 7 || t < -7) {
    return 0;
  }
  t /= 7;
  return t
}

Man.prototype.applyMovement = function(vec) {
  this.isMoving = (vec.x !== 0 || vec.y !== 0);
  this._speed = (this.isMoving ? 5 : 0);
  if (this.isMoving) {
    V.set(this._direction, vec);
  }
}

Man.prototype.tick = function() {
  var s = lerp(this.speed, this._speed, 0.25);
  this.speed = s;
  var dir = vlerp(this.direction, this._direction, 0.3);
  V.set(this.direction, dir);
  this.momentum = V.sprod(dir, s);
  V.set(this.position, V.sum(this.position, this.momentum));
}


function Stranger(x, y) {
  Man.call(this, x, y);
  this.moveTo = {x: random() * 900, y: random() * 450}
  this.size = (random() * 15 | 0) + 25
}

Stranger.prototype = Object.create(Man.prototype);
Stranger.prototype.constructor = Stranger;

Stranger.prototype.draw = function(can, t) {
  var x = this.position.x;
  var y = this.position.y;
  var shadow = this.getShadowLength(t);
  var sLength = shadow * 100;
  var sAlpha = (1 - abs(shadow)) * 0.3;
  can.translate(x, y)
     .fillStyle('#000000')
     .alpha(sAlpha)
     .fillRect(0, -this.size/2, sLength, this.size)
     .alpha(1)
     .paintStyle('#666666', '#DDDDDD', 1)
     .paintCircle(0, 0, this.size / 2)
     .translate(-x, -y);
}

Stranger.prototype.tick = function(entities) {
  // if (abs(V.dist(this.moveTo, this.position)) < 1) {
  //   this.moveTo = this.position;
  // }
  var vec = this.getForces(entities)
  this.applyMovement(vec);
  Man.prototype.tick.call(this, entities);
}

Stranger.prototype.getForces = function(entities) {
  var i = entities.length;
  var d = abs(V.dist(this.position, this.moveTo));

  var vec = (d < 5) ? {x:0, y:0} : V.normFrom(this.position, this.moveTo);
  
  var e;
  while (i--) {
    e = entities[i];
    if (e === this) {
      continue;
    }
    d = abs(V.dist(this.position, e.position));
    if (d > this.size * 1.5) {
      continue;
    }
    V.set(vec, V.sum(vec, V.normFrom(e.position, this.position)));
  }
  return V.norm(vec);
}

function getCan(app) {
  // creates a canvas element in the dom, returns it wrapped in cannedvas
  var can = CannedVas.create();
  can.size({
    width: 900,
    height: 600,
  });
  can.style('width', '450px');
  can.style('height', '300px');
  app.appendChild(can.vas);
  return can;
}


function tick(entities) {
  var i = entities.length;
  while (i--) {
    entities[i].tick(entities);
  }
}

function draw(entities, can, t) {
  // 10 seconds = 1 hour
  // 2 minutes = 12 hours
  // 4 minutes = 1 day
  t /= 10000
  t %= 24;
  var i = entities.length;
  can.fillStyle(getFillColor(t))
     .fillCanvas();
  drawTime(can, t);
  while (i--) {
    entities[i].draw(can, t);
  }
}

var colorNexts = {
  'concrete': 'carrot',
  'carrot': 'pomegranate',
  'pomegranate': 'wisteria',
  'wisteria': 'midnightBlue',
}

function drawTime(can, t) {
  var c = t > 6 && t < 18 ? '#000000' : '#FFFFFF';
  var h = t|0;
  var x = h >= 12 ? 'PM' : 'AM';
  var m = (t - h) * 60 | 0;
  h %= 12;
  if (!h) {
    h = '12';
  }
  else {
    h += '';
  }
  if (h.length === 1) {
    h = '0'+h;
  }
  m += '';
  if (m.length === 1) {
    m = '0'+m;
  }
  can.font('20px/30px monospace')
     .fillStyle(c)
     .fillText(h + ':' + m + ' ' + x, 20, 40);
}

function getFillColor(t) {
  var r, a, b, f;
  if (t > 7 && t < 17) {
    a = 'concrete'
    b = 'white'
    if (t > 12) {
      f = (t - 12) / 5
      return formatRGB(clerp(colors[b], colors[a], f));
    }
    else {
      f = (t - 7) / 5
      return formatRGB(clerp(colors[a], colors[b], f));
    }
  }
  else if (t < 5 || t > 19) {
    a = 'midnightBlue'
    b = 'black'
    if (t < 5) {
      f = t / 5
      return formatRGB(clerp(colors[b], colors[a], f));
    }
    else {
      f = (t - 19) / 5
      return formatRGB(clerp(colors[a], colors[b], f));
    }
  }
  else {
    if (t >= 17) {
      f = 2 - (19 - t);
    }
    else {
      f = 7 - t;
    }

    if (f < 0.5) {
      a = 'concrete';
    }
    else if (f < 1) {
      a = 'carrot';
      f -= 0.5;
    }
    else if (f < 1.5) {
      a = 'pomegranate';
      f -= 1;
    }
    else {
      a = 'wisteria';
      f -= 1.5;
    }
    f /= 0.5;
    b = colorNexts[a];
    return formatRGB(clerp(colors[a], colors[b], f));
  }
  // 5pm      
  // concrete -> carrot -> pomegranate -> wisteria -> midnightBlue
  // 7am
}

function formatRGB(color) {
  return 'rgb('+(color[0]|0)+','+(color[1]|0)+','+(color[2]|0)+')';
}

function clerp(colora, colorb, f) {
  return [
    lerp(colora[0], colorb[0], f),
    lerp(colora[1], colorb[1], f),
    lerp(colora[2], colorb[2], f),
  ];
}

function lerp(curr, goal, f) {
  // where 0 < f < 1
  return goal > curr 
      ? min(goal, curr + f * (goal - curr))
      : max(goal, curr - f * (curr - goal));
}

function vlerp(curr, goal, f) {
   return V.sum(V.sprod(goal, f), V.sprod(curr, (1 - f)));
}


function initKeyboardEvents(keyState, onPress, onRelease) {
  function pressKey(key) {
    if (!keyState[key]) {
      keyState[key] = true;
      onPress(key);
    }
  }

  function releaseKey(key) {
    if (keyState[key]) {
      keyState[key] = false;
      onRelease(key);
    }
  }

  var keys = {
    '37': 'left',
    '38': 'up',
    '39': 'right',
    '40': 'down',
  };

  addEventListener('keydown', function(e) {
    var keyCode = e.keyCode;
    if (typeof keys[keyCode] !== 'undefined') {
      pressKey(keys[keyCode]);
    }
  });

  addEventListener('keyup', function(e) {
    var keyCode = e.keyCode;
    if (typeof keys[keyCode] !== 'undefined') {
      releaseKey(keys[keyCode]);
    }
  });
}