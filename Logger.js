const chalk = require("chalk");
const moment = require("moment");

class Logger {

  constructor(muted = false) {

    this.muted = muted;

  }

  // will show only on logger level 1 or more
  debug(payload) {

    this.output(chalk.blue("[DEBUG]"), payload);

  }

  // will show only on logger level 1 or more
  info(payload) {

    this.output(chalk.green("[INFO]"), payload);

  }

  // will show even if logger level 0
  error(payload) {

    this.output(chalk.red("[ERR]"), payload);

  }

  // output function
  output(tag, payload) {

    if(this.muted) {
      return;
    }

    console.log(chalk.gray(moment().format()), tag, payload);

  }

}

module.exports = new Logger();
