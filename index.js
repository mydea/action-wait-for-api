const core = require('@actions/core');
const fetch = require('node-fetch');

(async function () {
  try {
    let method = core.getInput('method');
    let url = core.getInput('url');
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
      headers,
      expectedStatus,
      expectedResponseField,
      expectedResponseFieldValue,
    });

    core.debug('API request was successfull.');
  } catch (error) {
    core.setFailed(error.message);
  }
})();

async function tryFetch({
  start,
  interval,
  timeout,
  url,
  method,
  headers,
  expectedStatus,
  expectedResponseField,
  expectedResponseFieldValue,
}) {
  if (start - +new Date() > timeout * 1000) {
    throw new Error(`Timeout after ${timeout} seconds.`);
  }

  try {
    await doFetch({
      url,
      method,
      headers,
      expectedStatus,
      expectedResponseField,
      expectedResponseFieldValue,
    });
  } catch (error) {
    core.debug(`API request failed with ${error}`);
    // Wait and then continue
    await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    await tryFetch({
      start,
      interval,
      timeout,
      url,
      method,
      headers,
      expectedStatus,
      expectedResponseField,
      expectedResponseFieldValue,
    });
  }
}

async function doFetch({
  url,
  method,
  headers,
  expectedStatus,
  expectedResponseField,
  expectedResponseFieldValue,
}) {
  core.debug(`Try API request...`);
  let response = await fetch(url, { method, headers });

  if (response.status !== expectedStatus) {
    throw new Error('Wrong status');
  }

  if (!expectedResponseField) {
    return true;
  }

  let json = await response.json();

  let value = typeof getDotted(json);
  if (typeof value === 'undefined') {
    throw new Error(`Property "${expectedResponseField}" does not exist`);
  }

  if (!expectedResponseFieldValue) {
    return true;
  }

  if (expectedResponseFieldValue !== `${value}`) {
    throw new Error(
      `Property "${expectedResponseField}" does not contain value "${expectedResponseFieldValue}`
    );
  }

  return true;
}

function getDotted(obj, propertyName) {
  let parts = propertyName.split('.');

  let value = obj;

  for (let part of parts) {
    try {
      value = value[part];
    } catch (error) {
      return undefined;
    }
  }

  return value;
}
