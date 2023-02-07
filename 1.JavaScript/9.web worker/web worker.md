- web worker:
  > 允许一段 JavaScript 程序运行在主线程之外的另外一个线程中。
  > Web Worker 规范中定义了两类工作线程，分别是【专用线程】Dedicated Worker
  > 和【共享线程】Shared Worker。
  > 其中，Dedicated Worker 只能为一个页面所使用，而 Shared Worker 则可以被多个页面所共享。

> Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，这也造成了 Worker 比较耗费资源，不应该过度使用，而且一旦使用完毕，就应该关闭。

- Web Worker 注意点:

* 同源限制：分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件同源。
* DOM 限制：Worker 线程所在的全局对象，与主线程不一样，无法读取主线程所在网页的 DOM 对象，也无法使用 document、window、parent 这些对象。但是，Worker 线程可以 navigator 对象和 location 对象。
* 通信联系：Worker 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息完成。
* 脚本限制：Worker 线程不能执行 alert()方法和 confirm()方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求。
* 文件限制：Worker 线程无法读取本地文件，即不能打开本机的文件系统（file://），它所加载的脚本，必须来自网络。

* 基本用法：

- 主线程：
- 主线程采用 new 命令，调用 Worker()构造函数，新建一个 Worker 线程

```c
var worker = new Worker('work.js');
//Worker()构造函数的参数是一个脚本文件，该文件就是 Worker 线程所要执行的任务。
//由于 Worker 不能读取本地文件，所以这个脚本必须来自网络。
//如果下载没有成功（比如404错误），Worker 就会默默地失败。
```

- 主线程调用 worker.postMessage()方法，向 Worker 发消息。

```c
worker.postMessage('Hello World');
worker.postMessage({method: 'echo', args: ['Work']});
```

- 主线程通过 worker.onmessage 指定监听函数，接收子线程发回来的消息。

```c
worker.onmessage = function (event) {
  console.log('Received message ' + event.data);
  //事件对象的data属性可以获取 Worker 发来的数据。
  doSomething();
}

function doSomething() {
  // 执行任务
  worker.postMessage('Work done!');
}
```

- Worker 完成任务以后，主线程就可以把它关掉。

```c
worker.terminate();
```

- Worker 线程

- Worker 线程内部需要有一个监听函数，监听 message 事件。

```c
//除了使用【self.addEventListener()】指定监听函数，也可以使用【self.onmessage】指定
self.addEventListener('message', function (e) {
  //self代表子线程自身，即子线程的全局对象
  self.postMessage('You said: ' + e.data);
}, false);
```

- 事件对象的 data 属性包含主线程发来的数据。
- self.postMessage()方法用来向主线程发送消息。

```c
//根据主线程发来的数据，Worker 线程可以调用不同的方法
self.addEventListener('message', function (e) {
  var data = e.data;
  switch (data.cmd) {
    case 'start':
      self.postMessage('WORKER STARTED: ' + data.msg);
      break;
    case 'stop':
      self.postMessage('WORKER STOPPED: ' + data.msg);
      self.close(); // self.close()用于在 Worker 内部关闭自身。
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);
```

- Worker 加载脚本 --- importScripts()

```c
// 可以同时加载多个脚本
importScripts('script1.js', 'script2.js');
```

- 错误处理
- 主线程可以监听 Worker 是否发生错误。如果发生错误，Worker 会触发主线程的 error 事件。

```c
worker.onerror(function (event) {
  console.log([
    'ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message
  ].join(''));
});

// 或者
worker.addEventListener('error', function (event) {
  // ...
});
```

- 关闭 Worker

```c
// 主线程
worker.terminate();

// Worker 线程
self.close();
```

- 同页面的 Web Worker（主线程和 Worker 的代码都在同一个网页上面）
  > 通常情况下，Worker 载入的是一个单独的 JavaScript 脚本文件 . 但是也可以载入与主线程在同一个网页的代码。

```c
<!DOCTYPE html>
  <body>
  //指定<script>标签的type属性是一个浏览器不认识的值
    <script id="worker" type="app/worker">
      addEventListener('message', function () {
        postMessage('some message');
      }, false);
    </script>
  </body>
</html>
```

- 然后，读取脚本，用 Worker 来处理。

```c
// 先将嵌入网页的脚本代码，转成一个二进制对象
var blob = new Blob([document.querySelector('#worker').textContent]);
// 为这个二进制对象生成 URL
var url = window.URL.createObjectURL(blob);
// 再让 Worker 加载这个 URL
var worker = new Worker(url);

worker.onmessage = function (e) {
  // e.data === 'some message'
};
```

- API 总结
- 主线程

```c
var myWorker = new Worker(jsUrl, options);
```

> Worker()构造函数，可以接受两个参数。第一个参数是脚本的网址（必须遵守同源政策），该参数是必需的，且只能加载 JS 脚本，否则会报错。第二个参数是配置对象，该对象可选。它的一个作用就是指定 Worker 的名称，用来区分多个 Worker 线程。

```c
// 主线程
var myWorker = new Worker('worker.js', { name : 'myWorker' });

// Worker 线程
self.name // myWorker
```

- 主线程中的 线程对象的属性和方法如下：

```c
    Worker.onerror：指定 error 事件的监听函数。
    Worker.onmessage：指定 message 事件的监听函数，发送过来的数据在Event.data属性中。
    Worker.onmessageerror：指定 messageerror 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
    Worker.postMessage()：向 Worker 线程发送消息。
    Worker.terminate()：立即终止 Worker 线程。
```

- worker 线程

```c
    self.name： Worker 的名字。该属性只读，由构造函数指定。
    self.onmessage：指定message事件的监听函数。
    self.onmessageerror：指定 messageerror 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
    self.close()：关闭 Worker 线程。
    self.postMessage()：向产生这个 Worker 线程发送消息。
    self.importScripts()：加载 JS 脚本。
```
