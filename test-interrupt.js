var Mpr121 = require('./main');

// Address, I2c Bus
var mod = new Mpr121(0x5A, 1);

mod.onTouch = function(pin){
  console.log("Pin" + pin + " was touched");
}

mod.onRelease = function(pin){
  console.log("Pin" + pin + " was released");
}

//Gipio for interrupt
mod.startInterrupt(4);
