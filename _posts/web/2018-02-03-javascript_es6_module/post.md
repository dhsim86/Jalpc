---
layout: post
title:  "ECMAScript6 Module"
date:   2018-02-03
desc: "ECMAScript6 Module"
keywords: "javascript"
categories: [Web]
tags: [javascript]
icon: icon-html
---

##  자바스크립트에게 있어서 모듈

프로그램에서 모듈이란 각 기능의 분할과 그 분할의 결합으로 생각할 수 있다. 
프로그램이 커지면 **필연적으로 코드를 쪼개는 행위 (코드의 모듈화)가 필요해진다.** 당연히 프로그램 로직을 하나의 파일에 우겨넣는 것 보다는 여러 개의 파일로 기능을 나누는 것이 개발하기에 더 편한다.

보통 다른 언어에 대해서는 이러한 모듈화를 위해 언어 차원에서 지원한다. C언어에서는 #include, 자바는 import 를 쓰는 등, 대부분의 언어는 모듈 기능을 가지고 있다.

그런데 자바스크립트, 특히 client-side 자바스크립트의 경우 \<script\> 태그를 통해 외부의 스크립트 파일을 가져올 수는 있지만, **파일마다 독립적인 파일 scope를 가지고 있지 않고 하나의 전역 객체 (Global Object)에 바인딩되므로 전역변수가 중복되는 등의 문제가 발생할 수 있다.**

> 자바스크립트는 웹페이지에 있어서 보조적인 기능을 수행하기 위한 한정적인 용도로 만들어진 태생적인 한계로 다른 언어에 비해 부족한 부분이 있는 것이 사실이다. 그 대표적인 것이 모듈 기능이 없는 것이다.

자바스크립트는 언어레벨에서 명시적인 지원을 하지 않으며 따라서 이러한 경우를 고려한 자바스크립트의 일반적인 모듈 구현은 다음과 같다.

```javascript
(function (exports) {
  "use strict";

  // private
  var name = "private name";

  // public 
  var obj = {};

  obj.getName() {
    return name;
  }

  // 외부 공개
  exports.aModule = obj;

}) (exports || global);

(exports || global).aModule.getName();
```

위와 같이 구현하면 변수에 대해 private / public 키워드를 사용한 것과 같은 접근제어를 할 수 있으며, 그로 인한 캡슐화로 모듈 사용이 쉬운 장점이 있지만, 여러 개의 모듈을 선언하면서 exports 객체에 프로퍼티가 겹칠 경우 앞서 선언된 값은 덮어써지는 문제가 있고, **모듈 간의 의존성이 있을 때 의존성을 정의하기가 매우 어렵다.**

이것으로는 모듈화를 구현할 수는 없다.

자바스크립트를 client-side에 국한되지 않고, 범용적으로 사용하기 위해서는 모듈 기능이 반드시 해결되어야 하는 핵심 과제가 되었고 이런 상황에서 제안된 것이 **[CommonJS](http://www.commonjs.org/)** 와 **[AMD(Asynchronous Module Definition)](https://github.com/amdjs/amdjs-api/wiki/AMD)** 이다.

결국 자바스크립트 모듈화는 크게 CommonJS 진영과 AMD 진영으로 나뉘게 되었고, 브라우저에서 모듈을 사용하기 위해서는 CommonJS 또는 AMD를 구현한 모듈 로더 라이브러리를 사용해야 하는 상황이 되었다.

ES6에서는 client-side 자바스크립트에서도 동작하는 모듈 기능을 추가하였지만, 대부분의 브라우저가 ES6의 모듈을 지원하지 않으므로 ES6 모듈을 사용하기 위해서는 **[SystemJS](https://github.com/systemjs/systemjs)**나 **[RequireJS](http://requirejs.org/)** 등의 모듈 로더 또는, **[Webpack](https://webpack.js.org/)** 등의 모듈 번들러를 사용해야 한다.

> Server-side 의 node.js 는 모듈 시스템의 사실상 표준 (de facto standard)인 CommonJS를 채택하였고,  현재는 100% 동일하지 않지만 기본적으로 CommonJS 방식을 통해 모듈 기능을 제공한다.


<br>
## export & import

ES6 에서는 모듈 기능을 위해 키워드 **export / import** 를 제공한다.
모듈은 독립적인 파일 스코프를 가지므로, 모듈 안에 선언한 모든 것들은 기본적으로 해당 모듈 내부에서만 참조 가능하다.

<br>
### export

만약 모듈 안에 선언한 항목을 외부에 공개하여 다른 모듈들이 사용할 수 있게 하고 싶다면 export 해야 한다. 변수 / 함수 / 클래스 모두 export 할 수 있다.

다음과 같이 선언문 앞에 export 키워드를 사용함으로써 외부에 노출시킬 수 있다.

```javascript
export const pi = Math.PI;

export function square(x) {
  return x * x;
}

export class Person {
  constructor(name) {
    this.name = name;
  }
}
```

만약 위와 같이 매번 export 키워드를 사용하는 것이 싫다면, export 대상을 모아 객체로 구성하여 한 번에 export 할 수 있다.

```javascript
const pi = Math.PI;

function square(x) {
  return x * x;
}

class Person {
  constructor(name) {
    this.name = name;
  }
}

export { pi, square, Person };
```

<br>
### import

export 한 모듈을 로드하려면 export 된 이름으로 다음과 같이 import 한다.

```javascript
import { pi, square, Person } from './lib';

console.log(pi);
console.log(square(10));
console.log(new Person('Lee'));
```

각각의 이름을 지정하지 않고, 하나의 이름으로 한 번에 import 할 수 있으며 이 때 import 되는 항목은 **as 뒤에 지정한 객체의 프로퍼티가 된다.**

```javascript
import * as lib from './lib';

console.log(lib.pi);
console.log(lib.square(10));
console.log(new lib.Person('Lee'));
```

또는 이름을 변경하여 import 할 수도 있다.

```javascript
import { pi as PI, square as sq, Person as P } from './lib';

console.log(PI);
console.log(sq(2));
console.log(new P('Kim'));
```

<br>
### default

모듈에서 하나만 export 하는 경우, **default 키워드를 사용할 수 있다.** 
default를 사용할 때, var / let / const 키워드는 사용할 수 없다.

```javascript
function (x) {
  return x * x;
}

export default;
```

위의 코드는 다음과 같이 축약 표현 할 수 있다.

```javascript
export default function (x) {
  return x * x;
}
```

위와 같이 default 키워드를 사용해 export 한 모듈은 import 할 때, 다음과 같이 임의의 이름으로 import 한다.

```javascript
import square from './lib';

console.log(square(3));
```

> 아직까지 대부분의 브라우저에서는 ES6의 모듈을 지원하지 않으므로 ES6 모듈을 브라우저에서 사용하기 위해서는 앞서 언급한  **SystemJS[https://github.com/systemjs/systemjs]**나 **RequireJS[http://requirejs.org/]** 등의 모듈 로더 또는, **Webpack[https://webpack.js.org/]** 등의 모듈 번들러를 사용해야 한다.

## Reference

[JavaScript 표준을 위한 움직임: CommonJS와 AMD](http://d2.naver.com/helloworld/12864)<br>
[ECMAScript6 - Babel + Webpack](http://poiemaweb.com/es6-babel)<br>
[RequireJS – JavaScript 파일 및 모듈 로더](http://blog.javarouka.me/2013/04/requirejs-javascript.html)<br>
[Webpack 적용기 1 : 왜 필요한가?](https://hjlog.me/post/117)

