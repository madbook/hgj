
function main() {
  var can = CannedVas.create();
  var app = document.getElementById('app');
  can.size({
    width: 900,
    height: 600,
  });
  can.style('width', '450px');
  can.style('height', '300px');
  app.appendChild(can.vas);

  var man = new Man(50, 50);
  man.draw(can);
}

function Man(x, y) {
  this.x = x;
  this.y = y;
}

Man.prototype.height = 45;
Man.prototype.width = 30;

Man.prototype.draw = function(can) {
  var x = this.x + this.width / 2;
  var y = this.y + (this.height * 2 / 3);

  can.translate(x, y)
     .fillStyle('#222222')
     .fillRect(0, 0, this.width, this.height)
     .translate(-x, -y);
}
