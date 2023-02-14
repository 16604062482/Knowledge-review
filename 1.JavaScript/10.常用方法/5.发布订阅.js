class Observer {
  constructor() {
    this.message = {};
  }

  $on(type, callback) {
    // 判断有没有这个属性（事件类型）
    if (!this.message[type]) {
      // 如果没有这个属性，就初始化一个空的数组
      this.message[type] = [];
    }
    this.message[type].push(callback);
  }

  $emit(type) {
    // 判断是否有订阅
    if (!this.message[type]) return;
    this.message[type].forEach((item) => {
      item();
    });
  }

  $once(type, callback) {
    let _this = this;
    //中间函数，在调用完之后立即删除订阅
    function only() {
      callback();
      _this.$off(type, only);
    }
    this.$on(type, only);
  }

  $off(type, callback) {
    // 判断是否有订阅，即消息队列里是否有type这个类型的事件，没有的话就直接return
    if (!this.message[type]) return;
    // 判断是否有callback这个参数
    if (!callback) {
      // 如果没有callback,就删掉整个事件
      this.message[type] = undefined;
      return;
    }
    // 如果有callback,就仅仅删掉callback这个消息(过滤掉这个消息方法)
    this.message[type] = this.message[type].filter((item) => item !== callback);
  }
}

function handlerA() {
  console.log("buy handlerA");
}
function handlerB() {
  console.log("buy handlerB");
}
function handlerC() {
  console.log("buy handlerC");
}

// 使用构造函数创建一个实例
const person1 = new Observer();

person1.$on("buy", handlerA);
// person1.$on("buy", handlerB);
// person1.$on("buy", handlerC);
person1.$once("buy", handlerC);

// 触发 buy 事件
person1.$emit("buy");
person1.$emit("buy");
