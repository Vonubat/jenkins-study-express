const assert = require('assert');

describe('Express App Dummy Tests', function () {
  it('should pass this basic math test', function () {
    assert.strictEqual(1 + 1, 2); // Randomly fail to simulate a flaky test
  });

  it('should simulate checking the express server port', function () {
    const port = 3000;
    assert.strictEqual(port, 3000);
  });
});
