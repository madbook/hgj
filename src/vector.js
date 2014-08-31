Vector = (function() {
  var sin = Math.sin;
  var cos = Math.cos;
  var sqrt = Math.sqrt;
  var atan2 = Math.atan2;  
  var PI = Math.PI;
  var TAU = PI * 2;

  var clamp = function (n, min, max) {
    return (n > max) ? max : (n < min) ? min : n;
  }

  var mclamp = function (n, min, max) {
    max -= min
    n = (n - min) % max
    if (n < 0)
      n += max
    return n + min;
  }

  function sum(a, b) {
    return {
      x: a.x + b.x, 
      y: a.y + b.y,
    };
  }

  function diff(a, b) {
    return {
      x: a.x - b.x, 
      y: a.y - b.y,
    };
  }

  function prod(a, b) {
    return {
      x: a.x * b.x,
      y: a.y * b.y,
    };
  }

  function qtnt(a, b) {
    return {
      x: a.x / b.x,
      y: a.y / b.y,
    };
  }

  function normFrom(a, b) {
    return norm(diff(b, a));
  }

  function cross(a, b) {
    return {
      x: a.y - b.y,
      y: b.x - a.x,
    };
  }

  // returns a vector that is point b mirrored across point a
  function neg(a, b) {
    return sum(a, diff(a, b));
  }

  // returns the distance between two vectors
  function dist(a, b) {
      return length(diff(b, a))
  }

  // (1 same direction, 0 perpendicular, -1 opposite direction)
  function dot(a, b) {
      return (a.x * b.x + a.y * b.y);
  }

  // return a unit vector from the given angle t in radians
  function ang(t) {
    return {
      x: cos(t),
      y: sin(t),
    };
  }

  // multiply both coordinates by a value, return as a new vector
  function sprod(a, s) {
    return {
      x: a.x * s,
      y: a.y * s,
    };
  }

  function sqtnt(a, s) {
    return {
      x: a.x / s || 0,
      y: a.y / s || 0,
    };
  }
  
  // return a unit vector of the current vector
  function norm(a) {
    return sqtnt(a, length(a));
  }

  // return a vector that is this point mirrored across the origin
  function neg(a) {
    return {
      x: -a.x,
      y: -a.y,
    };
  }

  // return a copy of this vector
  function clone(a) {
    return {
      x: a.x, 
      y: a.y,
    };
  }

  // returns a unit vector perpendicular to this one
  function cross(a) {
    return {
      x: a.y, 
      y: -a.x,
    };
  }

  function cross2(a) {
    return {
      x: -a.y,
      y: a.x,
    };
  }

  // return the distance of this point from the origin
  function length(a) {
    return sqrt(a.x * a.x + a.y * a.y);
  }

  // return the angle in radians of this vector
  function angle(a) {
    return mclamp(atan2(a.y, a.x), 0, TAU);
  }

  function set(a, b) {
    a.x = b.x;
    a.y = b.y;
    return a;
  }

  return {
    sum: sum,
    diff: diff,
    prod: prod,
    qtnt: qtnt,
    norm: norm,
    normFrom: normFrom,
    cross: cross,
    neg: neg,
    dist: dist,
    dot: dot,
    ang: ang,
    sprod: sprod,
    sqtnt: sqtnt,
    neg: neg,
    clone: clone,
    cross: cross,
    cross2: cross2,
    length: length,
    angle: angle,
    set: set,
  };
})();
