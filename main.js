var i2c = require('i2c-bus');
var Gpio = require('onoff').Gpio;
var constants = require('./const');

function Mpr121(address, i2cBus, touchThreshold, releaseRhreshold) {
	this.address = address;
	this.i2cBus = i2cBus;

	this.touchThreshold = touchThreshold || constants.TOU_THRESH;
	this.releaseRhreshold = releaseRhreshold || constants.REL_THRESH;
	this.touchStates = new Array(12);
	this.device = i2c.openSync(i2cBus || 1);
	this.started = false;
}

// class methods
Mpr121.prototype.startPolling = function(polling) {
	var self = this;
	this.setup();
	this.interval = setInterval(function() {
		self.readFullAndNotify();
	}, polling);
};

Mpr121.prototype.stopPolling = function() {
	clearInterval(this.interval);
};

Mpr121.prototype.startInterrupt = function(gpioInterrupt) {
	var self = this;
	this.setup();
	// create gpio controller
	var button = new Gpio(gpioInterrupt, 'in', 'both');
	button.watch(function(err, value) {
		if (err) {
			throw err;
		}
		self.readAndNotify();
	});
};

Mpr121.prototype.readAndNotify = function() {
	var registers = new Buffer(2);
	this.device.i2cReadSync(this.address, 2, registers);

	var touched = this.decodeTouch(registers);
	this.notifyTouch(touched);
};

Mpr121.prototype.notifyTouch = function(touched) {
	for (i = 0; i < 12; i++) {
		if ((touched & (1 << i)) != 0x00) {
			if (!this.touchStates[i]) {
				// pin i was just touched
				this.onTouch(i);
			}
			this.touchStates[i] = true;
		} else {
			if (this.touchStates[i]) {
				// pin i is no longer being touched
				this.onRelease(i);
			}
			this.touchStates[i] = false;
		}
	}
};

Mpr121.prototype.decodeTouch = function(registers) {
	var LSB = registers[0];
	var MSB = registers[1];
	//
	return ((MSB << 8) | LSB);
};

Mpr121.prototype.decodeValues = function(registers) {
	var values = new Array(12);
	for (i = 4; i < 28; i = i + 2) {
		var LSB = registers[i];
		var MSB = registers[i + 1];
		values[(i - 4) / 2] = ((MSB << 8) | LSB);
	}
	return values;
};

Mpr121.prototype.readFullAndNotify = function() {
	var registers = new Buffer(42);
	this.device.i2cReadSync(this.address, 42, registers);

	var touched = this.decodeTouch(registers);
	this.notifyTouch(touched);

	var values = this.decodeValues(registers);
	this.onRead(values);
};

Mpr121.prototype.onTouch = function(electrode) {
}

Mpr121.prototype.onRelease = function(electrode) {
}

Mpr121.prototype.onRead = function(values) {
}

Mpr121.prototype.setup = function() {
	if (!this.started) {
		console.log("Mpr121 initialize - touch " + this.touchThreshold
				+ " - release - " + this.releaseRhreshold);
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
	this.device.i2cWriteSync(this.address, 2, new Buffer([ address, value ]));
};

// export the class
module.exports = Mpr121;
