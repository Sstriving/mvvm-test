class Mvue {
    constructor(options) {
        console.log(options);
        this.$options = options;
        this._data = options.data;
        // 劫持数据
        this.observer(this._data);

        this.compile(options.el);
    }
    // 劫持
    observer(data) {
        const keys = Object.keys(data);
        console.log(keys);
        keys.forEach(key => {
            let value = data[key];
            Object.defineProperty(data, key, {
                enumerable: true,
                configurable: true,
                set(newValue) {
                    console.log('set',newValue);
                    value = newValue;
                },
                get() {
                    return value;
                }
            })
        });
        console.log(data);
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