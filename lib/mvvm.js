function MVVM(option = {}) {
  this.$option = option
  this.$el = document.querySelector(option.el)
  this._data = option.data
  this._watcherTpl = {}
  this._observer(this._data)
  this._compile(this.$el)
}
window.MVVM = MVVM

function Watcher(el, vm, val, attr) {
  this.el = el
  this.vm = vm
  this.val = val
  this.attr = attr
  this.update()
}
Watcher.prototype.update = function() {
  this.el[this.attr] = this.vm._data[this.val]
}

MVVM.prototype._observer = function(obj) {
  var _this = this
  Object.keys(obj).forEach(key=> {
    _this._watcherTpl[key] = {
      _directives: []
    }
    var value = obj[key]
    console.log(_this._data[key])
    var watcherTpl = this._watcherTpl[key]
    Object.defineProperty(_this._data, key, {
      configurable: true,
      enumerable: true,
      get() {
        console.log(`${key}值改为${value}-------`)
        return value
      },
      set(val) {
        if(val === value) {
          return
        }
        console.log(`${key}的值更新为${value}`)
        value = val
        // debugger
        watcherTpl._directives.forEach(item=> {
          item.update()
        })
      }
    })
  })
}
MVVM.prototype._compile = function(el) {
  var _this = this, nodes = el.children;
   for(var i = 0, len = nodes.length; i < len; i++) {
     var node = nodes[i]
     if(node.children.length) {
      _this._compile(node)
     }
     if(node.hasAttribute('v-model') && (node.tagName == 'INPUT' || node.tagName == 'TEXTAREA')) {
        node.addEventListener('input', (function(key) {
        var attrval = node.getAttribute('v-model')
        _this._watcherTpl[attrval]._directives.push(new Watcher(node, _this, attrval, 'value'))
        return function() {
          _this._data[attrval] = nodes[key].value
        }
       })(i))
     }
     if(node.hasAttribute('v-bind')) {
       var attrval = node.getAttribute('v-bind') 
       console.log(attrval, 'attrval')
       _this._watcherTpl[attrval]._directives.push(new Watcher(node, _this, attrval, 'innerHTML'))
     }
     // 正则匹配{{}}
     var reg = /\{\{\s*([^}]+\S)\s*\}\}/g, txt = node.textContent
     if(reg.test(txt)) {
       node.textContent = txt.replace(reg, (matched, placeholder) => {
        var getName = _this._watcherTpl
        getName = getName[placeholder]
        if(!getName._directives) {
          getName._directives = []
        }
        getName._directives.push(new Watcher(node, _this, placeholder, 'innerHTML'))
        return placeholder.split('.').reduce((val, key) => {
          return _this._data[key]
        }, _this.$el)
       })
     }

   }
}