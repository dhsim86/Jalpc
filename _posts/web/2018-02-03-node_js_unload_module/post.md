---
layout: post
title:  "Node.js unload module 테스트"
date:   2018-02-03
desc: "Node.js unload module 테스트"
keywords: "node.js, module"
categories: [Web]
tags: [node.js]
icon: icon-html
---

## Node.js 모듈 시스템

[Node.js require.cache](https://nodejs.org/api/modules.html#modules_require_cache)<br>
[Node.js module object](https://nodejs.org/api/modules.html#modules_the_module_object)

Node.js 에서 require 함수를 통해 외부의 모듈을 로드시키면 다음과 같이 require.cache에 배열 형태로 캐싱된다.

<br>
![00.png](/static/assets/img/blog/web/2018-02-03-node_js_unload_module/00.png)

모듈 오브젝트들은 자신이 로드한 모듈들은 children 배열에 레퍼런스들로 가지고 있으며, 자신을 로드한 부모의 모듈 또한 parent 프로퍼티에 레퍼런스로 두고 있다.

<br>
![01.png](/static/assets/img/blog/web/2018-02-03-node_js_unload_module/01.png)

이렇게 계속 레퍼런스를 통해 모듈 오브젝트들을 참조하고 있기 때문에 require 함수를 통해 같은 모듈을 계속 import 하면 **이미 로드된 같은 오브젝트들이 리턴된다.**

> Modules are cached after the first time they are loaded. This means (among other things) that every call to require('foo') will get exactly the same object returned, if it would resolve to the same file. [Node.js Caching](https://nodejs.org/api/modules.html#modules_caching)


Node.js 에서 require 함수를 통해 한번 로드된 모듈들은 더 이상 사용하지 않더라도 **레퍼런스를 통해 모듈 오브젝트들을 참조하고 있기 때문에 메모리를 계속 점유하고 있게 된다.**

<br>
## Delete module

이렇게 require 함수를 통해 로드된 모듈들 중에서 더 이상 사용하지 않는 모듈들은 다음과 같이 레퍼런스들을 delete 키워드를 통해 삭제함으로써 모듈을 언로드시킬 수 있다.

```javascript
require('moduleName')
...

let id = require.resolve('moduleName')
let mod = require.cache[id];

delete require.cache[id];
for (let i = 0; i < mod.parent.children.length; i++) {
    if (mod.parent.children[i] === mod) {
        mod.parent.children.splice(i, 1);
        break;
    }
}

Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
    if (cacheKey.indexOf('moduleName')>0) {
        delete module.constructor._pathCache[cacheKey];
    }
});
```

이렇게 require.cache 배열에서 지워주고, 자신을 로드한 부모 모듈 오브젝트의 children 배열에서 자신을 가리키는 레퍼런스도 삭제해야 한다.

또한 Node.js 가 모듈을 위해 모듈 파일이 위치하는 path도 캐싱하는데, 여기에 있는 레퍼런스들도 삭제해주어야 한다.

<br>
![02.png](/static/assets/img/blog/web/2018-02-03-node_js_unload_module/02.png)

> 위 코드는 모듈 그 자체를 지우는 것이 아니라, 캐싱된 모듈을 가리키는 레퍼런스를 delete 함으로써 자바스크립트 garbage collection의 대상이 되게 하는 것이다. 

---

```javascript
// userCodes.js
module.exports = {
  value: "test",
  userDefinedMethod: function () {
    console.log(arguments)
    console.log(this.value)
  }
}
```

```javascript
// main.js

let userCodes = require('./userCodes');
console.log(userCodes.value);   // test

userCodes.value = 'changed';
console.log(userCodes.value);   // changed

userCodes = require('./userCodes');
console.log(userCodes.value);   // changed, 한번 로드된 모듈은 캐싱되고 있다.

let id = require.resolve('./userCodes')
let mod = require.cache[id];

// require.cache 에서 해당 모듈의 레퍼런스를 삭제한다.
delete require.cache[id];

// 로드된 모듈들은 부모 모듈에서 children 배열에 레퍼런스로 참조되고 있으므로, 이 레퍼런스 또한 삭제해야 한다.
for (let i = 0; i < mod.parent.children.length; i++) {
    if (mod.parent.children[i] === mod) {
        mod.parent.children.splice(i, 1);
        break;
    }
}

Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
    if (cacheKey.indexOf(moduleName)>0) {
        delete module.constructor._pathCache[cacheKey];
    }
});

userCodes = require('./userCodes');
console.log(userCodes.value);   // test, require.cache 에서 지웠으므로 다시 리로드된다.
```

그런데 위의 코드는 그 모듈의 레퍼런스만 삭제하는 것이지, 그 모듈이 의존하는 다른 모듈을 삭제하는 것은 아니다. 가령 예시로든 'userCodes.js' 가 다른 모듈을 import 하고 있을 경우에는 그 모듈은 언로드되지 않는다.

```javascript
// userCodes.js
require('./deplibs.js')   // 이 모듈은 언로드되지 않는다.

module.exports = {
  value: "test",
  userDefinedMethod: function () {
    console.log(arguments)
    console.log(this.value)
  }
}
```

즉, 어느 특정 모듈이 의존성을 가지는 다른 모듈들까지 검색하여 수동으로 delete를 해주어야 완벽하게 언로드시킬 수 있는 것이다. 따라서 모듈 오브젝트의 children 배열에 있는, 모듈이 require 함수를 통해 로드한 다른 모듈들의 레퍼런스도 삭제해야 한다.

---

이 포스트에서 언급한 모듈 언로드 방법말고, Node.js 에서 제공하는 VM 모듈을 활용하면 런타임에 코드가 담긴 모듈을 실행시키고 종료시킬 수 있다. [Node.js VM Module](https://nodejs.org/api/vm.html)


<br>
## Reference

[Deleting Objects in JavaScript](https://stackoverflow.com/questions/742623/deleting-objects-in-javascript)<br>
[node.js require() cache - possible to invalidate?](https://stackoverflow.com/questions/9210542/node-js-require-cache-possible-to-invalidate)<br>
[Is Node's require cache garbage collected?](https://stackoverflow.com/questions/37620697/is-nodes-require-cache-garbage-collected)<br>
[unloading code/modules](https://stackoverflow.com/questions/6676612/unloading-code-modules)<br>
[decache - An easy way to delete a cached module.](https://github.com/dwyl/decache)<br>