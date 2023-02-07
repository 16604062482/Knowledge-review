self.addEventListener(
  "message",
  function (e) {
    console.log("worker线程接受到：" + e.data);
  },
  false
);
