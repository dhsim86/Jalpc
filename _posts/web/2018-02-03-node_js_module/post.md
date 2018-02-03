---
layout: post
title:  "Node.js Module"
date:   2018-02-03
desc: "Node.js Module"
keywords: "node.js"
categories: [Web]
tags: [node.js]
icon: icon-html
---

## Node.js 모듈

자바스크립트는 웹페이지에 있어서 보조적인 기능을 수행하기 위한 한정적인 용도로 만들어진 태생적인 한계로 다른 언어에 비해 부족한 점이 있는데, 대표적으로 모듈 기능이 없는 것이다.

이를 위해 ES2015 에서는 모듈을 위한 키워드가 추가되었다. [ECMAScript6 (ES2015) Module](https://dhsim86.github.io/web/2018/02/03/javascript_es6_module-post.html)

Node.js는 CommonJS 방식을 따라 모듈 기능을 지원하고 있다. [Node.js Modules](https://nodejs.org/api/modules.html)

> Node.js에서도 ES2015 방식의 모듈 시스템을 v8.5.0 부터 지원한다. [Node v8.5.0 changes](https://nodejs.org/en/blog/release/v8.5.0/) / [Node commit log: "module: Allow runMain to be ESM"](https://github.com/nodejs/node/commit/c8a389e19f172edbada83f59944cad7cc802d9d5)

Node.js는 모듈 단위로 각 기능을 분할할 수 있는데, 모듈은 파일과 1:1 대응 관계를 가지며 각각의 모듈은 **만의 독립적인 실행 영역(Scope) 를 가진다.** 따라서 client-side 자바스크립트와는 다르게 전역변수의 중복 문제가 발생하지 않는다.

모듈은 **module.exports 또는 exports** 객체를 통해 외부로 공개한다. 그리고 공개한 모듈은 **require** 함수를 이용하여 import 시킨다.

<br>
## exports

[Node.js exports](https://nodejs.org/api/modules.html#modules_exports)

모듈은 독립적인 파일 스코프를 가지므로, 모듈 안에 선언된 모든 것들은 기본적으로 해당 모듈 내부에서만 참조가능하다. 만약 모듈 안에 선언한 항목을 외부에 공개하여 다른 모듈들이 사용할 수 있게 하고 싶다면 exports 객체를 사용해야 한다.

모듈을 파일로 작성하고, 외부에 공개할 항목을 exports 객체의 프로퍼티 또는 메소드로 정의한다. 

```javascript
// circle.js
const { PI } = Math;

exports.area = (r) => PI * r * r;
exports.circumference = (r) => 2 * PI * r;
```

위 코드는 독립적인 파일 스코프를 가지는 모듈이다. 이 모듈에서는 area와 circumference 를 exports 객체의 메소드로 정의하였다. 변수 PI는 circle 모듈에서만 유효한 private 변수가 되고, area와 circumference 는 외부에 공개된다.

위의 모듈을 다른 쪽에서 사용하기 위해서는 **require** 함수를 통해 임의의 이름으로 모듈을 import 한다. 확장자는 생략 가능하다.

```javascript
// app.js
const circle = require('./circle.js'); // == require('./circle')

console.log(`The area of a circle of radius 4 is ${circle.area(4)}`);
// => The area of a circle of radius 4 is 50.26548245743669
```

이 때 모듈은 객체로 반환된다. 따라서 위와 같이 circle.area / circle.circumference 와 같이 참조한다.

<br>
## module.exports

[Node.js module.exports](https://nodejs.org/api/modules.html#modules_module_exports)

exports 객체는 프로퍼티 또는 메소드를 여러 개 정의할 수 있었다. 하지만 module.exports 는 하나의 값 (기본자료형, 함수, 객체)를 할당할 수 있다.

```javascript
// square.js
module.exports = (width) => {
  return {
    area() { return width * width; }
  };
};
```

위의 모듈에서 module.exports 에 하나의 함수를 할당하였고 다음과 같이 import 한다.

```javascript
// app.js
const square = require('./square.js');
const mySquare = square(2);
console.log(`The area of my square is ${mySquare.area()}`);
// => The area of my square is 4
```

위 코드에서 square 변수는 module.exports 에 할당한 값 자체이다.
exports와 module.exports는 혼동하기 쉬운데, **exports는 module.exports에의 참조이며, module.exports의 alias이다.** 


| 구분 | 모듈 정의 방식 | require 함수의 호출 결과 |
| --- | --- | --- |
| exports | exports 객체 자체에는 값을 할당할 수 없으며,<br> 프로퍼티 또는 메소드를 추가하는 식으로 정의해야 한다. | exports 객체에 추가한 프로퍼티와 메소드가 담긴 객체로 전달된다. |
| module.exports | module.exports 자체에 하나의 값을 할당한다. | module.exports 객체에 할당한 값이 전달된다. |

<br>
## module.exports 에 함수를 할당하는 방식

```javascript
// foo.js
module.exports = function(a, b) {
  return a + b;
};
```

```javascript
// app.js
const add = require('./foo');

const result = add(1, 2);
console.log(result); // => 3
```

위와 같이 module.exports 에는 1개의 값만 할당가능하다. 다음과 같이 객체를 정의하여 복수의 값을 하나로 묶어 공개하는 방식도 사용할 수 있다.

```javascript
// foo.js
module.exports = {
  add (v1, v2) { return v1 + v2 },
  minus (v1, v2) { return v1 - v2 }
};
```

```javascript
// app.js
const calc = require('./foo');

const result1 = calc.add(1, 2);
console.log(result1); // => 3

const result2 = calc.minus(1, 2);
console.log(result2); // => -1
```

<br>
## require

[Node.js require](https://nodejs.org/api/modules.html#modules_require)

require 함수의 파라미터로 모듈을 의미하는 파일뿐만 아니라, 디렉토리를 지정할 수도 있다.
다음과 같은 디렉토리 구조를 가지고 있다고 생각하자.

```
project /
|---- app.js
|---- module /
      |---- index.js
      |---- calc.js
      |---- print.js
```

다음과 같이 모듈을 명시하지 않고, require 함수를 호출하면 해당 디렉토리의 **index.js 를 로드한다.**

```javascript
const myModule = require('./module');
```

그런데 index.js 에서 다음과 같이 calc.js와 print.js를 require 하면 한 번의 require 로 alc.js 와 print.js 의 모든 기능을 사용할 수 있다.

```javascript
// module/index.js
module.exports = {
  calc: require('./calc'),
  print: require('./print')
};
```

```javascript
// module/calc.js
module.exports = {
  add (v1, v2) { return v1 + v2 },
  minus (v1, v2) { return v1 - v2 }
};
```

```javascript
// module/print.js
module.exports = {
  sayHello() { console.log('Hi!') }
};
```

```javascript
// app.js
const myModule = require('./module');

// module/calc.js의 기능
const result = myModule.calc.add(1, 2);

console.log(result);

// module/print.js의 기능
myModule.print.sayHello();
```

<br>
## 코어 모듈과 파일 모듈

Node.js에서 기본으로 포함하고 있는 모듈을 **코어 모듈이라고 한다.** 코어 모듈을 로딩할 때는 모듈 파일이 위치한 path를 명시하지 않아도 된다.

```javascript
const http = require('http');
```

또한 npm을 통해 설치한 외부 패키지 모듈 또한 path를 명시하지 않아도 된다.
