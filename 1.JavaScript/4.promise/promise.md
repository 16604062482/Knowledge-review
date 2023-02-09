- promise 解决以下问题：

* 回调地狱，代码难以维护， 常常第一个的函数的输出是第二个函数的输入这种现象
* promise 可以支持多个并发的请求，获取并发请求中的数据
* 这个 promise 可以解决异步的问题，本身不能说 promise 是异步的

- Promise 的构造函数：
  接收一个函数作为参数，并且这个函数需要传入两个参数：

  > 这两个函数由 JavaScript 引擎提供，不用自己部署。
  > resolve 函数的作用是，将 Promise 对象的状态从“未完成”变为“成功”（即从 pending 变为 resolved），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；
  > reject 函数的作用是，将 Promise 对象的状态从“未完成”变为“失败”（即从 pending 变为 rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

- then 方法：可以接受两个回调函数作为参数。

  > 第一个回调函数是 Promise 对象的状态变为 resolved 时调用.
  > 第二个回调函数是 Promise 对象的状态变为 rejected 时调用。
  > 这两个函数都是可选的，不一定要提供。它们都接受 Promise 对象传出的值作为参数。

  ```c
      // bad
      promise
      .then(function(data) {
          // success
      }, function(err) {
          // error
      });

      // good---可以捕获前面then方法执行中的错误，也更接近同步的写法（try/catch）
      promise
      .then(function(data) { //cb
          // success
      })
      .catch(function(err) {
          // error
      });
  ```

- catch 方法：
  它和 then 的第二个参数一样，用来指定 reject 的回调。效果和写在 then 的第二个参数里面一样。
  另外一个作用：在执行 resolve 的回调（也就是上面 then 中的第一个参数）时，如果抛出异常了，那么并不会报错卡死 js，而是会进到这个 catch 方法中。

- finally()方法：用于指定不管 Promise 对象最后状态如何，都会执行的操作。

  > finally 方法的回调函数不接受任何参数,没有办法知道前面的 Promise 状态是 fulfilled 还是 rejected。
  > 所以 finally 方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果。
  ```c
    promise
    .then(result => {···})
    .catch(error => {···})
    .finally(() => {···});
  ```

- done：done 并不返回 Promise 对象，所以在 done 之后并不能在使用 catch 。done 的错误是直接抛出去的，并不会进行 Promise 的错误处理。Promise 具有强大的错误处理机制，而 done 则会在函数中跳过错误处理，直接抛出异常。

  > finally 其实并不一定是这个 promise 链的最后一环，相对而言，其实 done 才是。因为 finally 可能之后还有 then 和 catch 等等，所以其必须要返回一个 promise 对象。

- all 方法：谁跑的慢，以谁为准执行回调。

  ```c
    const p = Promise.all([p1, p2, p3]);
  ```

  - p 的状态由 p1、p2、p3 决定，分成两种情况：
    > 只有 p1、p2、p3 的状态都变成 fulfilled，p 的状态才会变成 fulfilled，此时 p1、p2、p3 的返回值组成一个数组，传递给 p 的回调函数。
    > 只要 p1、p2、p3 之中有一个被 rejected，p 的状态就变成 rejected，此时第一个被 reject 的实例的返回值，会传递给 p 的回调函数。

- race 方法：谁跑的快，以谁为准执行回调。

  ```c
    const p = Promise.race([p1, p2, p3]);
  ```

  > 上面代码中，只要 p1、p2、p3 之中有一个实例率先改变状态，p 的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给 p 的回调函数。

- allSettled 方法：用来确定一组异步操作是否都结束了（不管成功或失败）。包含了”fulfilled“和”rejected“两种情况。

  > 接受一个数组作为参数，数组的每个成员都是一个 Promise 对象，并返回一个新的 Promise 对象。只有等到参数数组的所有 Promise 对象都发生状态变更（不管是 fulfilled 还是 rejected），返回的 Promise 对象才会发生状态变更。

- any 方法：接受一组 Promise 实例作为参数.

  > 只要参数实例有一个变成 fulfilled 状态，包装实例就会变成 fulfilled 状态
  > 如果所有参数实例都变成 rejected 状态，包装实例就会变成 rejected 状态。

  - Promise.any()跟 Promise.race()方法很像，只有一点不同，就是 Promise.any()不会因为某个 Promise 变成 rejected 状态而结束，必须等到所有参数 Promise 变成 rejected 状态才会结束。

- Promise.resolve()：将现有对象转为 Promise 对象。

  - 如果参数是 Promise 实例：那么 Promise.resolve 将不做任何修改、原封不动地返回这个实例。

  - 参数是一个 thenable 对象（指的是具有 then 方法的对象）：

    > Promise.resolve()方法会将这个对象转为 Promise 对象，然后就立即执行 thenable 对象的 then()方法。

  - 参数不是具有 then()方法的对象，或根本就不是对象：则 Promise.resolve()方法返回一个新的 Promise 对象，状态为 resolved。

  - 不带有任何参数：Promise.resolve()方法允许调用时不带参数，直接返回一个 resolved 状态的 Promise 对象。

- Promise.try()：不管函数 f 是同步函数还是异步操作，但是想用 Promise 来处理它。
  > 因为这样就可以不管 f 是否包含异步操作，都用 then 方法指定下一步流程，用 catch 方法处理 f 抛出的错误。一般就会采用下面的写法。
  ```c
      Promise.resolve().then(f)//如果f是同步函数，那么它会在本轮事件循环的末尾执行。
  ```
