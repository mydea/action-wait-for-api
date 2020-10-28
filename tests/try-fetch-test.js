const chai = require('chai');
const { tryFetch } = require('../lib/try-fetch');
const chaiFetch = require('chai-fetch');
const mockServer = require('mockttp').getLocal();

chai.use(chaiFetch);

const { expect } = chai;

process.env.TESTING = true;

describe('tryFetch', function () {
  this.timeout(10000);

  beforeEach(() => mockServer.start(8080));
  afterEach(() => mockServer.stop());

  it('works with a simple GET request & status 200', async function () {
    let endpointMock = await mockServer.get('/status').thenReply(200);

    await tryFetch({
      url: 'http://localhost:8080/status',
      method: 'GET',
      expectedStatus: 200,
      timeout: 1,
      interval: 1,
    });

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(1);
  });

  it('retries API request', async function () {
    let status = 400;

    let endpointMock = await mockServer.get('/status').thenCallback(() => {
      return { status };
    });

    let promise = tryFetch({
      url: 'http://localhost:8080/status',
      method: 'GET',
      expectedStatus: 200,
      timeout: 10,
      interval: 1,
    });

    await wait(3);

    status = 200;

    await promise;

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(4);
  });

  it('times out after defined time', async function () {
    let endpointMock = await mockServer.get('/status').thenReply(400);
    let error;

    try {
      await tryFetch({
        url: 'http://localhost:8080/status',
        method: 'GET',
        expectedStatus: 200,
        timeout: 5,
        interval: 1,
      });
    } catch (_error) {
      error = _error;
    }

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(5);
    expect(error.message).to.equal('Timeout after 5 seconds.');
  });

  it('works with a simple GET request & status 204', async function () {
    let endpointMock = await mockServer.get('/status').thenReply(204);

    await tryFetch({
      url: 'http://localhost:8080/status',
      method: 'GET',
      expectedStatus: 204,
      timeout: 1,
      interval: 1,
    });

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(1);
  });

  it('works with an expectedResponseField', async function () {
    let endpointMock = await mockServer
      .get('/status')
      .thenReply(200, JSON.stringify({ version: '1.0.0' }));

    await tryFetch({
      url: 'http://localhost:8080/status',
      method: 'GET',
      expectedStatus: 200,
      timeout: 1,
      interval: 1,
      expectedResponseField: 'version',
    });

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(1);
  });

  it('works with a nested expectedResponseField', async function () {
    let endpointMock = await mockServer
      .get('/status')
      .thenReply(200, JSON.stringify({ user: { name: 'John' } }));

    await tryFetch({
      url: 'http://localhost:8080/status',
      method: 'GET',
      expectedStatus: 200,
      timeout: 1,
      interval: 1,
      expectedResponseField: 'user.name',
    });

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(1);
  });

  it('works with an expectedResponseField & expectedResponseFieldValue', async function () {
    let endpointMock = await mockServer
      .get('/status')
      .thenReply(200, JSON.stringify({ version: '1.0.0' }));

    await tryFetch({
      url: 'http://localhost:8080/status',
      method: 'GET',
      expectedStatus: 200,
      timeout: 1,
      interval: 1,
      expectedResponseField: 'version',
      expectedResponseFieldValue: '1.0.0',
    });

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(1);
  });

  it('works with an expectedResponseField & a numeric expectedResponseFieldValue', async function () {
    let endpointMock = await mockServer
      .get('/status')
      .thenReply(200, JSON.stringify({ version: 20 }));

    await tryFetch({
      url: 'http://localhost:8080/status',
      method: 'GET',
      expectedStatus: 200,
      timeout: 1,
      interval: 1,
      expectedResponseField: 'version',
      expectedResponseFieldValue: '20',
    });

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(1);
  });

  it('works with a nested expectedResponseField & expectedResponseFieldValue', async function () {
    let endpointMock = await mockServer
      .get('/status')
      .thenReply(200, JSON.stringify({ user: { name: 'John' } }));

    await tryFetch({
      url: 'http://localhost:8080/status',
      method: 'GET',
      expectedStatus: 200,
      timeout: 1,
      interval: 1,
      expectedResponseField: 'user.name',
      expectedResponseFieldValue: 'John',
    });

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(1);
  });

  it('works with a missing expectedResponseField', async function () {
    let endpointMock = await mockServer
      .get('/status')
      .thenReply(200, JSON.stringify({ version: '1.0.0' }));

    let error;

    try {
      await tryFetch({
        url: 'http://localhost:8080/status',
        method: 'GET',
        expectedStatus: 200,
        timeout: 1,
        interval: 1,
        expectedResponseField: 'missing',
      });
    } catch (_error) {
      error = _error;
    }

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(1);
    expect(error).to.exist;
  });

  it('works with an incorrect expectedResponseFieldValue', async function () {
    let endpointMock = await mockServer
      .get('/status')
      .thenReply(200, JSON.stringify({ version: '1.0.0' }));

    let error;

    try {
      await tryFetch({
        url: 'http://localhost:8080/status',
        method: 'GET',
        expectedStatus: 200,
        timeout: 1,
        interval: 1,
        expectedResponseField: 'version',
        expectedResponseFieldValue: '1.0.1',
      });
    } catch (_error) {
      error = _error;
    }

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(1);
    expect(error).to.exist;
  });

  it('retries API request with expectedResponseFieldValue', async function () {
    let version = 1;

    let endpointMock = await mockServer.get('/status').thenCallback(() => {
      return { status: 200, body: JSON.stringify({ version }) };
    });

    let promise = tryFetch({
      url: 'http://localhost:8080/status',
      method: 'GET',
      expectedStatus: 200,
      timeout: 10,
      interval: 1,
      expectedResponseField: 'version',
      expectedResponseFieldValue: '2',
    });

    await wait(2);

    version = 2;

    await promise;

    let requests = await endpointMock.getSeenRequests();

    expect(requests.length).to.equal(3);
  });
});

function wait(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
