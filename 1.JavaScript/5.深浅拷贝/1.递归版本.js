

function clone(source) {
  var target = {};
  for (var i in source) {
    if (source.hasOwnProperty(i)) {
      if (typeof source[i] === "object") {
        target[i] = clone(source[i]); // 注意这里
      } else {
        target[i] = source[i];
      }
    }
  }

  return target;
}

// 关于循环引用的问题解决思路:
    // 一种是循环检测（JSON.parse(JSON.stringify(data));）
    // 一种是暴力破解:一种是消除尾递归、一种是改用循环
