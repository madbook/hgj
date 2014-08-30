
var V = Vector;
var max = Math.max;
var min = Math.min;

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
  initEngine([man], can);
}

function initEngine(entities, can) {
  function main() {
    requestAnimationFrame(main);
    tick(entities);
    draw(entities, can)
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

Man.prototype.height = 30;
Man.prototype.width = 30;

Man.prototype.draw = function(can) {
  var x = this.position.x// + this.width / 2;
  var y = this.position.y// + (this.height * 2 / 3);
  var a = V.angle(this.direction);

  can.translate(x, y)
     .rotate(a)
     .fillStyle('#222222')
     .fillBox(0, 0, this.width, this.height)
     .rotate(-a)
     .translate(-x, -y);
}

Man.prototype.applyMovement = function(vec) {
  this.isMoving = (vec.x !== 0 || vec.y !== 0);
  this._speed = (this.isMoving ? 5 : 0);
  if (this.isMoving) {
    V.set(this._direction, vec);
  }
}

Man.prototype.tick = function() {
  var s = lerp(this.speed, this._speed, 0.3);
  this.speed = s;
  var dir = vlerp(this.direction, this._direction, 0.3);
  V.set(this.direction, dir);
  this.momentum = V.sprod(dir, s);
  V.set(this.position, V.sum(this.position, this.momentum));
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
    entities[i].tick();
  }
}

function draw(entities, can) {
  var i = entities.length;
  can.clearCanvas();
  while (i--) {
    entities[i].draw(can);
  }
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