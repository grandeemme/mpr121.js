var Mpr121 = require('./main');

// Address, I2c Bus
var mod = new Mpr121(0x5A, 1);

mod.onTouch = function(pin){
  console.log("Pin " + pin + " was touched");
}

mod.onRelease = function(pin){
  console.log("Pin " + pin + " was released");
}

mod.onRead = function(values){
  values.forEach(function(element, index, array) {
    console.log("Pin " + index + " value " +element);
  });
}
//polling time in milliseconds
mod.startPolling(200);
