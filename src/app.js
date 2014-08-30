
function main() {
  var can = CannedVas.create();
  var app = document.getElementById('app');
  app.appendChild(can.vas);

  helloWorld(can);
}

function helloWorld(can) {
  can.clear();
  can.size({
    width: 900,
    height: 600,
  });
  can.style('width', '450px');
  can.style('height', '300px');
  can.font('normal normal 40px/40px Helvetica');
  can.textBaseline('top');
  can.fillText('Hello, world!', 10, 10);
}
