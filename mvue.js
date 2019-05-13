class Mvue {
    constructor(options) {
        console.log(options);
        this.$options = options;
        this._data = options.data;
        // 劫持数据
        this.observer(this._data);

        // 查找节点，做数据替换&&绑定。
        this.compile(options.el);
    }
    // 数据劫持，替换默认的get / set方法
    observer(data) {
        const keys = Object.keys(data);
        console.log(keys);
        keys.forEach(key => {
            let value = data[key];
            let dap = new Dap();

            Object.defineProperty(data, key, {
                enumerable: true,
                configurable: true,
                get() {
                    if (Dap.target) {
                        dap.addSub(Dap.target);
                    }
                    return value;
                },
                set(newValue) {
                    console.log('set', newValue);
                    value = newValue;
                    dap.notify(newValue);
                },
            })
        });
    }
    compile(el) {
        let element = document.querySelector(el);
        this.compileNode(element);
    }
    // 循环查找的方法
    compileNode(element) {
        let childNodes = element.childNodes;
        // console.log(childNodes);
        Array.from(childNodes).forEach(item => {
            let { nodeType } = item;
            if (nodeType === 3) {
                // 文本
                let reg = /\{\{\s*(\S*)\s*\}\}/;
                if (reg.test(item.textContent)) {
                    // console.log(RegExp.$1);
                    item.textContent = this._data[RegExp.$1];
                    new Watcher(this, RegExp.$1, newValue => {
                        item.textContent = newValue;
                    });
                }

            } else if (nodeType === 1) {
                // 标签
            }
            // 递归节点中还有子节点
            if (item.childNodes.length > 0) {
                this.compileNode(item);
            }
        })
    }
}
// 发布者
class Dap {
    constructor() {
        this.items = [];
    }
    addSub(watcher) {
        console.log('添加这个观察者', watcher);
        this.items.push(watcher);
    }
    notify(data) {
        console.log(this.items);
        this.items.forEach(item => {
            item.update(data);
        })
    }
}
// 订阅者
class Watcher {
    constructor(view, vm, callBack) {
        Dap.target = this;
        view._data[vm];
        this.callBack = callBack;
        Dap.target = null;
    }
    update(newValue) {
        this.callBack(newValue);
    }
}
