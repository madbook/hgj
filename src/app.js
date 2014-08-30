
var V = Vector;

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

function vectorAdd(a, b) {
  a.x += b.x;
  a.y += b.y;
  return a;
}


function Man(x, y) {
  this.position = {x:x, y:y};
  this.movement = {x:0, y:0};
}

Man.prototype.height = 45;
Man.prototype.width = 30;

Man.prototype.draw = function(can) {
  var x = this.position.x + this.width / 2;
  var y = this.position.y + (this.height * 2 / 3);

  can.translate(x, y)
     .fillStyle('#222222')
     .fillRect(0, 0, this.width, this.height)
     .translate(-x, -y);
}

Man.prototype.applyMovement = function(vec) {
  this.movement.x = vec.x;
  this.movement.y = vec.y;
}

Man.prototype.tick = function() {
  this.position.x += this.movement.x;
  this.position.y += this.movement.y;
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