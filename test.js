var Mpr121 = require('./main');

// Address, I2c Bus, Gipio interrupt
var mod = new Mpr121(0x5A, 1, 7);

mod.setup();

mod.read();