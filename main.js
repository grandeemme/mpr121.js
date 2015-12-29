var raspi = require('raspi');
var I2C = require('raspi-i2c').I2C;
var Gpio = require('onoff').Gpio;

var constants = require('./const');

function Mpr121(address, i2cBus, touchThreshold, releaseRhreshold) {
	this.address = address;
	this.i2cBus = i2cBus;

	this.touchThreshold = touchThreshold || constants.TOU_THRESH;
	this.releaseRhreshold = releaseRhreshold || constants.REL_THRESH;
	this.touchStates = new Array(12);
	this.device = new I2C();
	this.started = false;
}

// class methods
Mpr121.prototype.startPolling = function() {
	var self = this;
	this.setup();
	setInterval(function() {
		self.read();
	}, 100);
};

Mpr121.prototype.startInterrupt = function(gpioInterrupt) {
	var self = this;
	this.setup();
	// create gpio controller
	var button = new Gpio(gpioInterrupt, 'in', 'falling');
	button.watch(function(err, value) {
		if (err) {
			throw err;
		}
		self.read();
		// display pin state on console
		console.log(" --> GPIO PIN STATE CHANGE:   = " + value);
	});
};

Mpr121.prototype.read = function() {
	var registers = self.device.readSync(address, 0, 42);
	// notifico la lettura dei registri
	self.notifyPolling(reisters);

	var LSB = registers[0];
	var MSB = registers[1];
	//
	var touched = ((MSB << 8) | LSB);
	// controllo i primi 8
	for (i = 0; i < 12; i++) {
		if ((touched & (1 << i)) != 0x00) {
			if (!self.touchStates[i]) {
				// pin i was just touched
				self.notifyTouch(i);
			} else {
				// pin i is still being touched
			}
			self.touchStates[i] = true;
		} else {
			if (touchStates[i]) {
				self.notifyRelease(i);
				// pin i is no longer being touched
			}
			self.touchStates[i] = false;
		}
	}

};

Mpr121.prototype.notifyTouch = function(electrode) {
	console.log("notifyTouch  " + electrode);
}

Mpr121.prototype.notifyRelease = function(electrode) {
	console.log("notifyRelease  " + electrode);
}

Mpr121.prototype.notifyPolling = function(electrode) {
	console.log("notifyPolling  " + electrode);
}

Mpr121.prototype.setup = function() {
	if (!this.started) {
		console.log("Mpr121 initialize");
		this.setRegister(constants.ELE_CFG, 0x00);

		// Section A - Controls filtering when data is > baseline.
		this.setRegister(constants.MHD_R, 0x01);
		this.setRegister(constants.NHD_R, 0x01);
		this.setRegister(constants.NCL_R, 0x00);
		this.setRegister(constants.FDL_R, 0x00);

		// Section B - Controls filtering when data is < baseline.
		this.setRegister(constants.MHD_F, 0x01);
		this.setRegister(constants.NHD_F, 0x01);
		this.setRegister(constants.NCL_F, 0xFF);
		this.setRegister(constants.FDL_F, 0x02);

		// Section C - Sets touch and release thresholds for each electrode
		this.setRegister(constants.ELE0_T, this.touchThreshold);
		this.setRegister(constants.ELE0_R, this.releaseRhreshold);

		this.setRegister(constants.ELE1_T, this.touchThreshold);
		this.setRegister(constants.ELE1_R, this.releaseRhreshold);

		this.setRegister(constants.ELE2_T, this.touchThreshold);
		this.setRegister(constants.ELE2_R, this.releaseRhreshold);

		this.setRegister(constants.ELE3_T, this.touchThreshold);
		this.setRegister(constants.ELE3_R, this.releaseRhreshold);

		this.setRegister(constants.ELE4_T, this.touchThreshold);
		this.setRegister(constants.ELE4_R, this.releaseRhreshold);

		this.setRegister(constants.ELE5_T, this.touchThreshold);
		this.setRegister(constants.ELE5_R, this.releaseRhreshold);

		this.setRegister(constants.ELE6_T, this.touchThreshold);
		this.setRegister(constants.ELE6_R, this.releaseRhreshold);

		this.setRegister(constants.ELE7_T, this.touchThreshold);
		this.setRegister(constants.ELE7_R, this.releaseRhreshold);

		this.setRegister(constants.ELE8_T, this.touchThreshold);
		this.setRegister(constants.ELE8_R, this.releaseRhreshold);

		this.setRegister(constants.ELE9_T, this.touchThreshold);
		this.setRegister(constants.ELE9_R, this.releaseRhreshold);

		this.setRegister(constants.ELE10_T, this.touchThreshold);
		this.setRegister(constants.ELE10_R, this.releaseRhreshold);

		this.setRegister(constants.ELE11_T, this.touchThreshold);
		this.setRegister(constants.ELE11_R, this.releaseRhreshold);

		this.setRegister(constants.ELE12_T, this.touchThreshold);
		this.setRegister(constants.ELE12_R, this.releaseRhreshold);

		// Section D
		// Set the Filter Configuration
		// Set ESI2
		this.setRegister(constants.FIL_CFG, 0x04);

		// Section E
		// Electrode Configuration
		// Set ELE_CFG to 0x00 to return to standby mode
		this.setRegister(constants.ELE_CFG, 0x0C); // Enables all 12 Electrodes

		console.log("Mpr121 initialized");
		this.started = true;
	}
};

Mpr121.prototype.setRegister = function(address, value) {
	this.device.writeSync(this.address, 0, new Buffer([ address, value ]));
};

// export the class
module.exports = Mpr121;
