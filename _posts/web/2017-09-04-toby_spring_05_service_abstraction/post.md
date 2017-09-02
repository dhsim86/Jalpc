---
layout: post
title:  "Toby's Spring Chap 05: 서비스 추상화"
date:   2017-09-04
desc: "Toby's Spring Chap 05: 서비스 추상화"
keywords: "spring, spring boot"
categories: [Web]
tags: [spring, spring boot]
icon: icon-html
---

자바에는 사용 방법과 형식은 다르지만, 기능과 목적이 유사한 기술이 존재한다. 스프링은 성격이 비슷한 여러 종류의 기술을 추상화하고 이를 일관된 방법으로 사용할 수 있도록 지원하고 있다.

[Implemented UserService](https://github.com/dhsim86/tobys_spring_study/commit/c46c3cd12ef49fe09f69fd53672b57814da293e9)

* 코드 개선
  * 코드에 중복된 부분은 없는가?
  * 코드가 무엇을 하는 것인지 이해하기 불편하지 않은가?
  * 코드가 자신이 있어야 할 자리에 있는가?
  * 앞으로 변경이 일어난다면 어떤 것이 있을 수 있고, 그 변화에 쉽게 대응할 수 있게 작성되어 있는가?

> 객체지향적인 코드는 다른 오브젝트의 데이터를 가져와서 작업하는 대신에, 데이터를 갖고 있는 오브젝트에게 작업을 해달라고 요청한다.

[Refactored](https://github.com/dhsim86/tobys_spring_study/commit/e1eed87a77bbaf9e93eeda76e92a045fdefedc20)

<br>
## 트랜잭션 서비스 추상화
