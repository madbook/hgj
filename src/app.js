
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
  white: [255, 253, 251],
  midnight: [22, 31, 40],
}

function main() {
  var app = document.getElementById('app');
  var can = getCan(app);
  var man = new Man(450, 300);

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

  
  var ctl = new Controller();
  ctl.addEntity(man);
  
  window.man = man;
  window.ctl = ctl;
  initEngine(ctl, can);
}

function initEngine(ctl, can) {
  
  function main() {
    requestAnimationFrame(main);
    ctl.tick();
    ctl.draw(can);
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
  this.emoteCooldown = 0;
  this.emoteText = '';
}

Man.prototype.size = 30;

Man.prototype.draw = function(can, t) {
  var x = this.position.x;
  var y = this.position.y;
  var a = V.angle(this.direction);

  this.drawShadow(can, t);
  can.translate(x, y)
     
     // .fillStyle('#000000')
     // .alpha(sAlpha)
     // .fillRect(0, -this.size/2, sLength, this.size)
     // .alpha(1)
     
     .paintStyle('#222222', '#DDDDDD', 1)
     .rotate(a)
     .paintBox(0, 0, this.size, this.size)
     .rotate(-a)
     .translate(-x, -y);
  this.drawEmote(can);
}

Man.prototype.drawShadow = function(can, t) {
  var shadow = this.getShadowLength(t);
  if (shadow === null) {
    return;
  }
  var sSize = 0.75 * this.size + (this.size * 0.75 * (1 - abs(shadow)));
  var sLength = shadow * 100;
  var sAlpha = (1 - abs(shadow)) * 0.3;
  var x = this.position.x;
  var y = this.position.y;
  var a = V.angle(this.direction);
  var xo = 
  can.translate(x, y)
     .fillStyle('#000000')
     .alpha(sAlpha)
     .fillEllipse(sLength/2, 0, abs(sLength) + sSize, sSize)
     .alpha(1)
     .translate(-x, -y);
}

Man.prototype.drawEmote = function(can) {
  if (!this.emoteCooldown) {
    return; 
  }
  var w = can.textWidth(this.emoteText);
  var p = 10;
  var p2 = 5;
  var x = this.position.x;
  var y = this.position.y;
  var w2 = -w / 2;
  var h2 = -30 + p2;
  can.translate(x, y)
     .paintStyle('#DDDDDD', '#AAAAAA', 1)
     .paintRect(w2-p, -60-p2, w+(2*p), 30+(2*p2))
     .beginPath().moveTo(w2, h2).lineTo(0, -10).lineTo(w2+10, h2).fill()
     .fillStyle('#222222')
     .font('20px/30px monospace')
     .textBaseline('top')
     .fillText(this.emoteText, (-w/2), -60)
     .translate(-x, -y);
}

Man.prototype.getShadowLength = function(t) {
  t -= 12;
  if (t > 7 || t < -7) {
    return null;
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
  if (this.emoteCooldown > 0) {
    this.emoteCooldown--;
  }
  var s = lerp(this.speed, this._speed, 0.25);
  this.speed = s;
  var dir = vlerp(this.direction, this._direction, 0.3);
  V.set(this.direction, dir);
  this.momentum = V.sprod(dir, s);
  V.set(this.position, V.sum(this.position, this.momentum));
}

Man.prototype.emote = function(txt) {
  if (this.emoteCooldown) {
    return;
  }
  this.emoteText = txt || '...';
  this.emoteCooldown = 60;
}


function Stranger(x, y, x2, y2) {
  Man.call(this, x, y);
  this.moveTo = {x: x2, y: y2}
  this.size = (random() * 15 | 0) + 25
}

Stranger.prototype = Object.create(Man.prototype);
Stranger.prototype.constructor = Stranger;

Stranger.prototype.draw = function(can, t) {
  var x = this.position.x;
  var y = this.position.y;
  this.drawShadow(can, t);
  can.translate(x, y)
     .paintStyle('#666666', '#DDDDDD', 1)
     .paintCircle(0, 0, this.size / 2)
     .translate(-x, -y);
  this.drawEmote(can);
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
    if (!this.emoteCooldown) {
      this.emote('!');
    }
    V.set(vec, V.sum(vec, V.normFrom(e.position, this.position)));
  }
  return V.norm(vec);
}


function Controller() {
  this.entities = [];
  this.time = 0;
  this.spawnCooldown = 60;
}

Controller.prototype.tick = function() {
  this.time = (Date.now() / 10000) % 24;
  if (this.spawnCooldown) {
    this.spawnCooldown--;
  }
  else {
    this.spawnStranger();
    this.spawnCooldown = this.getSpawnCooldown(this.time);
  }
  this.entities = this.getEntitiesInBounds(this.entities);
  var i = this.entities.length;
  while (i--) {
    this.entities[i].tick(this.entities, this.time);
  }
}

Controller.prototype.getSpawnCooldown = function(t) {
  var r = random();
  if (t >= 3 && t < 5) {
    // 3am to 5am, dead
    return r * 120 | 0;
  }
  if (t >= 5 && t < 7) {
    // early risers, joggers
    return r * 80 | 0;
  }
  if (t >= 7 && t < 9) {
    // morning commute hours
    return r * 20 | 0;
  }
  if (t >= 9 && t < 12) {
    // morning at work
    return r * 60 | 0;
  }
  if (t >= 12 && t < 14) {
    // lunchtime
    return r * 40 | 0;
  }
  if (t >= 14 && t < 17) {
    // afternoon, work hours
    return r * 50 | 0;
  }
  if (t >= 17 && t < 19) {
    // evening commute hours
    return r * 15 | 0;
  }
  if (t >= 19 && t < 21) {
    // evening dinner hours
    return r * 20 | 0;
  }
  if (t >= 21 && t < 23) {
    // evening commute hours
    return r * 40 | 0;
  }
  if (t >= 23 || t < 1) {
    // night bar hours
    return r * 30 | 0;
  }
  if (t >= 1 && t < 3) {
    // night commute hours
    return r * 60 | 0;
  }
}

Controller.prototype.getEntitiesInBounds = function(entities) {
  var res = [];
  var i = entities.length;
  var e, p;
  while (i--) {
    e = entities[i];
    p = e.position;
    if (p.x > -50 && p.x < 950 && p.y > -50 && p.y < 650) {
      res.push(e);
    }
  }
  return res;
}

Controller.prototype.draw = function(can) {
  var i = this.entities.length;
  can.fillStyle(getFillColor(this.time))
     .fillCanvas();
  drawTime(can, this.time);
  while (i--) {
    this.entities[i].draw(can, this.time);
  }
}

Controller.prototype.addEntity = function(ent) {
  this.entities.push(ent);
}

Controller.prototype.spawnStranger = function() {
  var r = random();
  var x = r < 0.5 ? -30 : 930;
  var y = random() * 350 + 150;
  var x2 = x < 0 ? 1000 : -100;
  this.addEntity(new Stranger(x, y, x2, y));
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
  return entities
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
     .textBaseline('top')
     .fillStyle(c)
     .fillText(h + ':' + m + ' ' + x, 20, 20);
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
    b = 'midnight'
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