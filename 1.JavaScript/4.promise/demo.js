class myPromise {
  constructor(executor) {
    if (typeof executor !== "function") {
      return new TypeError("executor is not function");
    }
    this.state = "pending";
    this.reason = null;
    this.value = null;
    this.onRejectedCallbacks = [];
    this.onResolvedCallbacks = [];
    let resolve = (value) => {
      if (this.state == "pending") {
        this.value = value;
        this.onResolvedCallbacks.forEach((fn) => fn());
        this.state = "fulfilled";
      }
    };
    let reject = (reason) => {
      if (this.state == "pending") {
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
        this.state = "rejected";
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
        throw err;
      };
    }
    let promise2 = new myPromise((resolve, reject) => {
      if (this.state == "fulfilled") {
        try {
          setTimeout(() => {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          }, 0);
        } catch (error) {
          reject(error);
        }
      }
      if (this.state == "rejected") {
        try {
          setTimeout(() => {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          }, 0);
        } catch (error) {
          reject(error);
        }
      }
      if (this.state == "pending") {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
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
function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  let called;
  if (x != null && (typeof x === "object" || typeof x === "function")) {
    try {
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
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
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}
// resolve方法
myPromise.resolve = function (value) {
  return new myPromise((resolve, reject) => {
    resolve(value);
  });
};
// reject方法
myPromise.reject = function (value) {
  return new myPromise((resolve, reject) => {
    reject(value);
  });
};
// race方法
myPromise.race = function (promises) {
  return new myPromise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject);
    }
  });
};
myPromise.all = function (promises) {
  let arr = [];
  let i = 0;
  function processData(index, data) {
    arr[index] = data;
    i++;
    if (i === promises.length) {
      resolve(arr);
    }
  }
  return new myPromise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then((data) => {
        processData(i, data);
      }, reject);
    }
  });
};
myPromise.deferred = function () {
  let result = {};
  result.promise = new myPromise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
};

module.exports = myPromise;
