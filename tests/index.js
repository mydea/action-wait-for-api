const Mocha = require('mocha');

(function () {
  let mocha = new Mocha({
    reporter: 'spec',
  });

  mocha.addFile('tests/try-fetch-test.js');

  mocha.run(function (failures) {
    process.on('exit', function () {
      // eslint-disable-next-line no-process-exit
      process.exit(failures);
    });
  });
})();
