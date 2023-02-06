
class myPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = null;
    this.reason = null;
    this.resolveCallback = [];
    this.rejectCallback = [];
    let resolve = (value) => {
      if (this.state == "pending") {
        this.value = value;
        this.state = "fulfilled";
        this.resolveCallback.forEach((fn) => fn());
      }
    };
    let reject = (reason) => {
      if (this.state == "pending") {
        this.reason = reason;
        this.state = "rejected";
        this.rejectCallback.forEach((fn) => fn());
      }
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  then(onFulfilled, onRejected) {
    if (typeof onFulfilled !== "function") {
      onFulfilled = (value) => value;
    }
    if (typeof onRejected !== "function") {
      onRejected = (err) => {
        throw err
      };
    }
    let promise2 = new myPromise((resolve, reject) => {
      if (this.state == "fulfilled") {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromsie(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (this.state == "rejected") {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromsie(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (this.state == "pending") {
        this.resolveCallback.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromsie(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        this.rejectCallback.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromsie(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
  catch(fn) {
    return this.then(null, fn);
  }
}
myPromise.resolve = function (value) {
  return new myPromise((resolve, reject) => {
    resolve(value);
  });
};
myPromise.reject = function (reason) {
  return new myPromise((resolve, reject) => {
    reject(reason);
  });
};
myPromise.race = function (promises) {
  return new myPromise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject);
    }
  });
};
myPromise.all = function (promises) {
  let i = 0;
  let arr = [];
  function promiseData(index, data) {
    arr[index] = data;
    i++;
    if (i == promises.length) {
      resolve(arr);
    }
  }
  return new myPromise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then((data) => {
        promiseData(i, data);
      });
    }
  });
};

function resolvePromsie(promise2, x, resolve, reject) {
  if (promise2 == x) {
    return reject(new TypeError("xxx"));
  }
  let called;
  if (x != null && (typeof x == "object" || typeof x == "function")) {
    try {
      let then = x.then;
      if (typeof then == "function") {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromsie(promise2, y.resolve, reject);
          },
          (err) => {
            if (called) return;
            called = true;
            reject(err);
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}

myPromise.deferred = function () {
  let result = {};
  result.promise = new myPromise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
};

module.exports = myPromise;
