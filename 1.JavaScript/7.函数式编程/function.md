- 函数式编程的核心则在于组合

* 函数式编程 三个特征：

- 使用纯函数，隔离副作用
- 函数是“一等公民”
- 避免对状态的改变（不可变值）

* 纯函数：纯函数的本质——有且仅有【显式数据流】

  - 对于相同的输入，总是会得到相同的输出：
  - 在执行过程中没有语义上可观察的副作用：
    > 如果一个函数除了计算之外，还对它的执行上下文、执行宿主等外部环境造成了一些其它的影响，那么这些影响就是所谓的”副作用”。

  ```js
  let a = 10;
  let b = 20;
  function add(a, b) {
    return a + b;
  }

  add(a, b); // 30
  a = 30; //隐式的数据输入
  b = 40; //全局作用域
  add(a, b); // 70
  ```

* 纯函数的好处：
  - 高度确定的函数。对于同样的输入，能够保证同样的输出。
  - 没有副作用的函数。纯函数的计算发生在函数的内部，不会对外部资源产生任何影响。
    > 如果：A 函数和 B 函数都需要向某个文件写入信息，一旦我们先后调用了 A、B 两个函数，就将触发两个并行的写入过程，进入混乱的竞争态。
  - 更加灵活的函数。不依赖上下文

```js
function foo(num1, num2) {
  //纯函数
  return num1 + num2;
}
```

- 一等公民 === 头等函数

  > 头等函数的核心特征是“可以被当做变量一样用”。

  - 可以被当作参数传递给其他函数
  - 可以作为另一个函数的返回值
  - 可以被赋值给一个变量

- 不可变值：像数字类型这样，自创建起就无法再被修改的数据，我们称其为“不可变数据”。

  - “值类型”数据均为不可变数据。
  - 不可变数据の实践原则：拷贝，而不是修改

- DRY 原则---Don't Repeat Yourself（低耦合、高内聚）

- reduce----一种 pipeline 函数

  > reduce = 参数组合+函数 pipeline。

- 声明式的数据流:

  > 只需要观察一个函数调用链，这个调用链如同一条传送带一般，用函数名标注了每道工序的行为。
  > 即便不清楚数据到底是如何在“传送带”上流转的，我们也能够通过函数名去理解程序的意图。
  > 这样的代码，是声明式的。基于此构建出的数据流，就是声明式的数据流.

- 命令式的数据流:
  > 我有三行代码，我需要逐行阅读、理解计算中间态和主流程之间的逻辑关系，才能够推导出程序的意图。
  > 这样的代码，是命令式的。

* 实现声明式的数据流，除了借助链式调用，还可以借助函数组合。

* 链式调用的前提:(如：map()、reduce()、filter())

- 它们都挂载在 Array 原型的 Array.prototype 上
- 它们在计算结束后都会 return 一个新的 Array
- 既然 return 出来的也是 Array，那么自然可以继续访问原型 Array.prototype 上的方法

* 链式调用的本质：
  > 是通过在方法中返回对象实例本身的 this/ 与实例 this 相同类型的对象，达到多次调用其原型（链）上方法的目的。

- compose/pipe 函数思路:
  > 把待组合的函数放进一个数组里，然后调用这个函数数组的 reduce 方法，就可以创建出多个函数组成的工作流。

链式调用： input--->func1--->func2--->func3

reduce： initValue--->callback--->callback--->callback
⬆️ ⬆️ ⬆️
func1 func2 func3

        => callback(initValue, func1) = func1(input)
        => callback(value1, func2) = func2(value1)

```js
function callback(input, func) {
  func(input);
}

funcs.reduce(callback, 0);
```

```js
function pipe(funcs) {
  function callback(input, func) {
    return func(input);
  }

  return function (param) {
    return funcs.reduce(callback, param);
  };
}
```

```js
//正序是 pipe，倒序是 compose。
function compose(...funcs) {
  function callback(input, func) {
    return func(input);
  }

  return function (param) {
    return funcs.reduceRight(callback, param);
  };
}
```

- 偏函数和柯里化解决的最核心的问题：

* 函数组合链中的多元参数问题
* 函数逻辑复用的问题

- 柯里化：把 1 个 n 元函数改造为 n 个相互嵌套的一元函数的过程

  > fn(a, b, c) -> fn(a)(b)(c)

- 偏函数：通过固定函数的一部分参数，生成一个参数数量更少的函数的过程。

```js
// 定义高阶函数 curry
function addThreeNum(a, b, c) {
  return a + b + c;
}
function curry(addThreeNum) {
  // 返回一个嵌套了三层的函数
  return function addA(a) {
    // 第一层“记住”参数a
    return function addB(b) {
      // 第二层“记住”参数b
      return function addC(c) {
        // 第三层直接调用现有函数 addThreeNum
        return addThreeNum(a, b, c);
      };
    };
  };
}
const curriedAddThreeNum = curry(addThreeNum);
console.log(curriedAddThreeNum(1)(2)(3));
```

```js
function add(x, y) {
  return x + y;
}
function partial(func, fixedValue) {
  return function wrapper(input) {
    // 包装函数
    // 这个函数会固定 fixedValue，然后把 input 作为动态参数读取
    return func(input, fixedValue);
  };
}
const fn = partial(add, 3);
console.log(fn(2));
```

- 实现通用柯里化函数
  > 我们简单拆解一下这个函数的任务：
  - 获取函数参数的数量
  - 自动分层嵌套函数：有多少参数，就有多少层嵌套
  - 在嵌套的最后一层，调用回调函数，传入所有入参。

```js
function curry(func) {
  function generateCurried(prevArgs) {
    return function (nextArg) {
      //每次调用，都传进来一个参数
      const args = [...prevArgs, nextArg]; //累计接受到的所有参数
      if (args.length >= func.length) {
        //所有参数都已经获取完
        return func(...args);
      } else {
        return generateCurried(args); //把当前所有累计参数，当作下一次的入参
      }
    };
  }
  return generateCurried([]);
}
const fn = curry(addThreeNum);
console.log(fn(1)(2)(3));

function addThreeNum(a, b, c) {
  return a + b + c;
}
```

- 柯里化解决组合链的元数问题：

```js
// 多个不同元的函数，通过pipe调用，形成声明式的数据流
// 1.将多个不同元的函数，通过柯里化，做“一元化”处理
// 2.将“一元化”的函数，传进pipe
function add(a, b) {
  return a + b;
}
function multiply(a, b, c) {
  return a * b * c;
}
function addMore(a, b, c, d) {
  return a + b + c + d;
}
function divide(a, b) {
  return a / b;
}

function curry(func) {
  function generateCurried(prevArgs) {
    return function (nextArg) {
      const args = [...prevArgs, nextArg];
      if (args.length >= func.length) {
        return func(...args);
      } else {
        return generateCurried(args);
      }
    };
  }
  return generateCurried([]);
}
function pipe(...funcs) {
  function callback(input, fn) {
    return fn(input);
  }
  return function (param) {
    return funcs.reduce(callback, param);
  };
}

const curriedAdd = curry(add);
const curriedMultiply = curry(multiply);
const curriedAddMore = curry(addMore);
const curriedDivide = curry(divide);
const compute = pipe(
  curriedAdd(1),
  curriedMultiply(2)(3),
  curriedAddMore(1)(2)(3),
  curriedDivide(300)
);
console.log(compute(3));
```
