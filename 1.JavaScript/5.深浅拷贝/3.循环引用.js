var b = {};
var a = { a1: b, a2: b };
a.a1 === a.a2; // true
var c = clone(a);
c.a1 === c.a2; // false

// 保持引用关系 cloneForce在对象数量很多时会出现很大的问题，数据量大不适合
function cloneForce(x) {
  const uniqueList = []; // 用来去重
  let root = {};
  // 循环数组
  const loopList = [
    {
      parent: root,
      key: undefined,
      data: x,
    },
  ];
  while (loopList.length) {
    const node = loopList.pop();
    const parent = node.parent;
    const key = node.key;
    const data = node.data;
    let res = parent;
    if (typeof key !== "undefined") {
      res = parent[key] = {};
    }
    // 数据已经存在
    let uniqueData = find(uniqueList, data);
    if (uniqueData) {
      parent[key] = uniqueData.target;
      continue; // 中断本次循环
    }
    // 数据不存在。保存源数据，在拷贝数据中对应的引用
    uniqueList.push({
      source: data,
      target: res,
    });
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        if (typeof data[k] === "object") {
          loopList.push({
            parent: res,
            key: k,
            data: data[k],
          });
        } else {
          res[k] = data[k];
        }
      }
    }
  }
  return root;
}

function find(arr, item) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].source === item) {
      return arr[i];
    }
  }

  return null;
}
