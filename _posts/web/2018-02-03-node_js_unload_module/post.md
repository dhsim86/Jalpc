---
layout: post
title:  "Node.js unload module 테스트"
date:   2018-02-03
desc: "Node.js unload module 테스트"
keywords: "node.js"
categories: [Web]
tags: [node.js]
icon: icon-html
---

## Node.js 모듈 시스템

[Node.js require.cache](https://nodejs.org/api/modules.html#modules_require_cache)
[Node.js module object](https://nodejs.org/api/modules.html#modules_the_module_object)

Node.js 에서 require 메소드를 통해 외부의 모듈을 로드시키면 다음과 같이 require.cache에 배열 형태로 캐싱된다.

<br>
![00.png](/static/assets/img/blog/web/2018-02-03-node_js_unload_module/00.png)

배열에 저장된 module 오브젝트들은 자신이 로드한 모듈들은 children 배열에 레퍼런스들로 참조하고 있으며, 자신을 로드한 부모의 모듈 또한 parent 프로퍼티에 레퍼런스를 두고 있다.

<br>
![01.png](/static/assets/img/blog/web/2018-02-03-node_js_unload_module/01.png)

