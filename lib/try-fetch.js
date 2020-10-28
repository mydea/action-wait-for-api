const { doFetch } = require('./do-fetch');
const { log } = require('./log');

async function tryFetch({
  start = +new Date(),
  interval,
  timeout,
  url,
  method,
  headers,
  expectedStatus,
  expectedResponseField,
  expectedResponseFieldValue,
}) {
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
    log(`API request failed with ${error}`);
    // Wait and then continue
    await new Promise((resolve) => setTimeout(resolve, interval * 1000));

    if (+new Date() - start > timeout * 1000) {
      throw new Error(`Timeout after ${timeout} seconds.`);
    }

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

module.exports = { tryFetch };
