const urllib = require('urllib');
const { getDotted } = require('./get-dotted');
const { log } = require('./log');

async function fetch(url, { auth, digestAuth, method, headers }) {
  return urllib.request(url, {
    method,
    headers,
    auth,
    digestAuth
  })
}

async function doFetch({
                         url,
                         method,
                         auth, // HTTP Basic
                         digestAuth, // HTTP Digest
                         headers,
                         expectedStatus,
                         expectedResponseField,
                         expectedResponseFieldValue,
                       }) {
  log(`Try API request...`);
  let response = await fetch(url, { auth, digestAuth, method, headers });

  if (response.status !== expectedStatus) {
    throw new Error(
      `Wrong status ${response.status}, expected ${expectedStatus}`
    );
  }

  if (!expectedResponseField) {
    return true;
  }

  let json = JSON.parse(response.data.toString());

  let value = getDotted(json, expectedResponseField);
  if (typeof value === 'undefined') {
    throw new Error(`Property "${expectedResponseField}" does not exist. Response Data: ${JSON.stringify(json)}`);
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
