class Logger {
  constructor (transportNames) {
    const transports = [];

    if (transportNames.includes('console')) {
      transports.push({
        transport: console,
        methods: ['log','error','warn'],
      });
    }

    this.transports = transports;
    this.debugEnabled = true;
  }

  output (txt, level) {
    /*
    if (typeof obj !== 'object') {
      throw new Error('Logger expects object argument')
    }
    if (typeof obj.time !== 'number' || typeof obj.txt !== 'string') {
      throw new Error('Logger expects object argument with "time" and "txt" properties');
    }
    */

    const line = `${(new Date()).toLocaleString('SE')}:\t${txt}`;
    this.transports.forEach(({ transport, methods }) => {
      if (methods.includes(level)) {
        transport[level](line);
      } else {
        if(level === 'debug' && this.debugEnabled) {
          transport.log(line);
        } else if (level !== 'debug') {
          transport.log(line);
        }
      }
    });
  }

  log (...args) {
    return this.output(args[0], 'info');
  }

  info (...args) {
    return this.output(args[0], 'info');
  }

  debug (...args) {
    return this.output(args[0], 'debug');
  }

  warn (...args) {
    return this.output(args[0], 'warn');
  }

  error (...args) {
    return this.output(args[0], 'error');
  }
}


export default Logger;
