class Mvue {
    constructor(options) {
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
                    if (value !== newValue) {
                        value = newValue;
                        dap.notify(newValue);
                    }
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

            // 文本
            if (nodeType === 3) {
                let reg = /\{\{\s*(\S*)\s*\}\}/; // 匹配文本中的变量 例：{{message}}
                if (reg.test(item.textContent)) {
                    // 使用类中的变量，去替换节点中的字符串
                    item.textContent = this._data[RegExp.$1];

                    // 新建一个观察者，去监听 数据的变化，动态改变dom文本
                    new Watcher(this, RegExp.$1, newValue => {
                        item.textContent = newValue;
                    });
                }
            }

            // 标签
            if (nodeType === 1) {
                const attrs = item.attributes; // 取标签的所有属性
                // 因为是类数组，所以需要转化

                Array.from(attrs).forEach(attr => {
                    let attrName = attr.name;
                    let attrValue = attr.value;
                    // 判断是否是自定义属性
                    if (attrName.includes('k-')) {
                        attrName = attrName.substr(2);
                        // 给显示的文本赋值  这块可以添加其他自定义属性
                        if (attrName === 'modal') {
                            item.value = this._data[attrValue];
                            // 删除自定义属性，不展示在元素节点中
                            item.removeAttribute(attr.name);
                        }
                    }
                    // 监听输入，通过view 修改 modal层。
                    item.addEventListener('input', e => {
                        this._data[attrValue] = e.target.value;
                    })
                    // 监听modal的数据改变，显示到view
                    new Watcher(this, attrValue, newValue => {
                        item.value = newValue;
                    });
                })
                console.log(item.attributes);

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
    // 添加观察者
    addSub(watcher) {
        console.log('添加这个观察者', watcher);
        this.items.push(watcher);
    }
    // 发布者去通知所有订阅者
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
        // 触发属性的get方法，将当前watcher添加到 待通知对象中
        view._data[vm];
        this.callBack = callBack;
        Dap.target = null;
    }
    // 订阅者去更新数据
    update(newValue) {
        this.callBack(newValue);
    }
}
