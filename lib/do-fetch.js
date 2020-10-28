const fetch = require('node-fetch');
const { getDotted } = require('./get-dotted');
const { log } = require('./log');

async function doFetch({
  url,
  method,
  headers,
  expectedStatus,
  expectedResponseField,
  expectedResponseFieldValue,
}) {
  log(`Try API request...`);
  let response = await fetch(url, { method, headers });

  if (response.status !== expectedStatus) {
    throw new Error(
      `Wrong status ${response.status}, expected ${expectedStatus}`
    );
  }

  if (!expectedResponseField) {
    return true;
  }

  let json = await response.json();

  let value = getDotted(json, expectedResponseField);
  if (typeof value === 'undefined') {
    throw new Error(`Property "${expectedResponseField}" does not exist`);
  }

  if (!expectedResponseFieldValue) {
    return true;
  }

  let actualStringValue = `${value}`;
  if (expectedResponseFieldValue !== actualStringValue) {
    throw new Error(
      `Property "${expectedResponseField}" is "${actualStringValue}" instead of "${expectedResponseFieldValue}"`
    );
  }

  return true;
}

module.exports = { doFetch };
