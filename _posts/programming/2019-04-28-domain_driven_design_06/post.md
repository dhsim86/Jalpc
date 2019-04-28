---
layout: post
title:  "도메인 주도 설계 06 - 도메인 객체의 생명주기"
date:   2019-04-28
desc:  "도메인 주도 설계 06 - 도메인 객체의 생명주기"
keywords: "DDD, Domain, Domain Driven Design, Aggregate, Repository, Factory"
categories: [Programming]
tags: [DDD, Domain, Domain Driven Design]
icon: icon-html
---

모든 객체에는 생명주기가 있다. 한 객체는 생성되어 다양한 상태를 거친 후 결국 저장되거나 삭제되면서 소멸한다. 다른 객체와 복잡한 상호의존성을 맺으며, 여러 가지 상태의 변화를 겪기도 하는데 이 때 갖가지 불변식이 적용된다. 이러한 객체들을 관리하는데 실패한다면 Model-Driven Design을 시도하는 것이 쉽게 좌절될 수 있다.

![00.png](/static/assets/img/blog/programming/2019-04-28-domain_driven_design_06/00.png)

도메인 객체의 관리와 관련되 문제는 아래의 두 가지 범주로 나뉜다.

* 생명주기 동안의 무결성 유지하기
* 생명주기 관리의 복잡성으로 모델이 난해해지는 것을 방지하기

이러한 문제를 해결하는데 도메인 주도 설계에서는 세 가지 패턴을 통해 해결한다.

* Aggregate: **소유권과 경계를 명확히 정의하여 모델을 엄격하게 만들어** 객체 간의 연관관계가 혼란스럽게 얽히는 것을 방지하고, 도메인 객체의 **무결성**을 유지한다.
* Factory: 복잡한 객체와 Aggregate를 생성 및 재구성함으로써 그것들의 **내부 구조를 캡슐화**한다.
* Repository: **영속성과 관련된 인프라스트럭처를 캡슐화하면서 영속 객체를 찾아 조회하는 수단**을 제공한다.

Repository와 Factory가 도메인에서 나오는 것은 아니지만, 그것들은 도메인 설계에서 중요한 역할을 담당한다. Aggregate를 모델링하고 Repository와 Factory를 통해 모델 객체의 생명주기 동안 그것들 체계적이고 의미 있는 단위로 조작할 수 있다.

**Aggregate는 생명주기의 전 단계에서 불변식이 유지해야할 범위를 표시하는 것이며, Repository와 Factory는 Aggregate를 대상으로 연산을 수행하며 특정 생명주기로 이동하는 과정에 따른 복잡성을 캡슐화한다.**

<br>

## Aggregate (집합체)

