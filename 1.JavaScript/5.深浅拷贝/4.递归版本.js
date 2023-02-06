// 测试用例
var a = {
  name: "muyiy",
  book: {
    title: "You Don't Know JS",
    price: "45",
  },
  a1: undefined,
  a2: null,
  a3: 123,
};
a.name = "高级前端进阶";
a.book.price = "55";

function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
// 拷贝 Symbol
// 方法一：Object.getOwnPropertySymbols(...)

function cloneDeep(source, hash = new WeakMap()) {
  if (!isObject(source)) return source;
  if (hash.has(source)) return hash.get(source);
  let target = Array.isArray(source) ? [] : {};
  hash.set(source, target);
  // ============= 新增代码
  let symKeys = Object.getOwnPropertySymbols(source); // 查找
  if (symKeys.length) {
    // 查找成功
    symKeys.forEach((symKey) => {
      if (isObject(source[symKey])) {
        target[symKey] = cloneDeep4(source[symKey], hash);
      } else {
        target[symKey] = source[symKey];
      }
    });
  }
  for (let key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (isObject(source[key])) {
        target[key] = cloneDeep4(source[key], hash);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

// 方法二：Reflect.ownKeys(...)
function cloneDeep1(source, hash = new WeakMap()) {
  if (!isObject(source)) return source;
  if (hash.has(source)) return hash.get(source);
  let target = Array.isArray(source) ? [] : {};
  hash.set(source, target);
  Reflect.ownKeys(source).forEach((key) => {
    // 改动
    if (isObject(source[key])) {
      target[key] = cloneDeep4(source[key], hash);
    } else {
      target[key] = source[key];
    }
  });
  return target;
}

// 测试已通过

var b = cloneDeep(a);
console.log(b);
