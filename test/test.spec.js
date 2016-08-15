/*eslint-env node, mocha*/
const { expect } = require('chai');
const Semaphore  = require('../index.js');

let semaphore = null;

describe('synchronous-semaphore', function() {


  beforeEach(() => semaphore = Semaphore());


  describe('::lock', function() {

    it('should return a key that allows me to unlock the new lock', () =>

      semaphore.lock('test')
        .then((key) => semaphore.release('test', key))
        .then((results) => expect(results).to.be.true)

    );


    it('should return null when attempting to lock an already locked ' +
    'resource.', () =>

      semaphore.lock('test')
        .then(() => semaphore.lock('test'))
        .then((results) => expect(results).to.be.null)

    );


    it('should only allow one resource to succeed with a lock attempt',
    () => {
      
      let lock_count = 0;
      let promise_array = [];

      for(let i = 0; i < 1000; i++) {

        let p1 = semaphore.lock('test')
          .then((key) => key ? lock_count++ : null);

        let p2 = semaphore.lock('test')
          .then((key) => key ? lock_count++ : null);

        promise_array.push(p1, p2);
      }

      return Promise.all(promise_array)
        .then(() => expect(lock_count).to.eql(1));

    })

  });


  describe('::release', function() {

    it('should return true when unlocking a resource with the correct key',
    () => 
      semaphore.lock('test')
      .then((key) => semaphore.release('test', key))
      .then((results) => expect(results).to.be.true)
    );


    it('should return false when unlocking a resource with an invalid key',
    () =>
      semaphore.lock('test')
      .then(() => semaphore.release('test', 'foo-bar'))
      .then((results) => expect(results).to.be.false)
    );

  });

});
