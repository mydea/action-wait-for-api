const core = require('@actions/core');

function log(message) {
  if (process.env.TESTING) {
    return;
  }

  core.debug(message);
}

module.exports = { log };
