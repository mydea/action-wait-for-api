const core = require('@actions/core');
const { tryFetch } = require('./lib/try-fetch');

(async function () {
  try {
    let method = core.getInput('method');
    let url = core.getInput('url');
    const authString = core.getInput('auth');
    const digestAuthString = core.getInput('digest-auth');
    let headersString = core.getInput('headers');
    let timeout = parseInt(core.getInput('timeout'));
    let interval = parseInt(core.getInput('interval'));
    let expectedStatus = parseInt(core.getInput('expected-status'));
    let expectedResponseField = core.getInput('expected-response-field');
    let expectedResponseFieldValue = core.getInput(
      'expected-response-field-value'
    );

    core.debug(`=== Waiting for API response to continue. ===`);
    core.debug(`URL: ${url}`);
    core.debug(`Method: ${method}`);
    if (authString) {
      core.debug('Will make API call with HTTP Basic Authorization');
    }
    if (digestAuthString) {
      core.debug('Will make API call with HTTP Digest Authorization');
    }
    core.debug(`Headers: ${headersString}`);
    core.debug('# Waiting for this response:');
    core.debug(`HTTP Status: ${expectedStatus}`);

    if (expectedResponseField && expectedResponseFieldValue) {
      core.debug(
        `Response contains field "${expectedResponseField}" with value "${expectedResponseFieldValue}"`
      );
    } else if (expectedResponseField) {
      core.debug(`Response contains field "${expectedResponseField}"`);
    }

    core.debug('');
    core.debug('');

    let headers = headersString ? JSON.parse(headersString) : {};
    let start = +new Date();

    await tryFetch({
      start,
      interval,
      timeout,
      url,
      method,
      auth: authString !== '' ? authString : undefined,
      digestAuth: digestAuthString !== '' ? digestAuthString : undefined,
      headers,
      expectedStatus,
      expectedResponseField,
      expectedResponseFieldValue,
    });

    core.debug('API request was successful.');
  } catch (error) {
    core.setFailed(error.message);
  }
})();
