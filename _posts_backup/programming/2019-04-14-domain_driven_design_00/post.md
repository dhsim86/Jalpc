---
layout: post
title:  "도메인 주도 설계 00 - 서문"
date:   2019-04-14
desc:  "도메인 주도 설계 00 - 서문"
keywords: "DDD, Domain"
categories: [Programming]
tags: [DDD, Domain]
icon: icon-html
---

## 서문

* 성공한 프로젝트의 공통적인 특징: 반복적인 설계를 거쳐 발전하고 프로젝트의 일부분이 된 풍부한 **도메인 모델**이 있다.

* 복잡성으로 생기는 한계를 극복하려면, **도메인 로직 설계에 진지하게 접근해야 한다.**

<br>

### 도메인 로직에 초첨을 맞춤으로써 생기는 장점

* 각기 다른 요구사항에 유연함과 확장 능력을 토대로 대응할 수 있다.
  * 코드 안에 정제되고 표현되는 예리한 도메인 모델이 있기에 가능함
  * 변경이나 확장이 점점 쉬워지는 구조로 바뀐다.
* 도메인에 대한 새로운 통찰력을 얻으면서 모델은 깊이가 더해가고 의사소통의 품질도 향상된다.

> 모델링과 코드의 구현이 단절되어서는 안된다. 이러면 도메인을 분석한 내용이 설계에 반영되지 못하는 결과가 발생한다.

> 도메인 모델을 프로젝트에서 일어나는 의사소통의 중심에 놓일 때, 팀원들은 공통 언어를 사용하여 의사소통의 품질을 높이고 의사소통의 결과를 코드에 반영할 수 있게 된다.

<br>

### 복잡성이라는 도전과제

* 얼마나 복잡한 소프트웨어를 만들어 낼 수 있는가를 결정하는 주요 요인은 **설계 접근법**에 있다.  

* 수많은 애플리케이션에서 가장 중요한 복잡성은 사용자의 활동이나 업무에 해당하는 **도메인** 그 자체이다.
  * 대부분의 소프트웨어 프로젝트는 가장 먼저 **도메인과 도메인 로직에 집중해야 한다.**
  * 복잡한 도메인 설계는 **모델**을 기반으로 해야 한다.

> 도메인 모델은 도메인에 대한 깊은 통찰력과 핵심 개념에 집중한 바를 반영한다. 가치 있는 모델은 곧바로 나타나지 않으며, 먼저 도메인을 깊이 있기 이해해야 한다.

> 도메인을 이해하기 위해서는 원시적인 차원의 모델에 기반을 둔 초기 설계 내용을 구현해본 다음, 그 구현을 반복해서 변형하는 과정을 거쳐야 한다. 새로운 통찰력을 얻을 떄마다 모델은 더욱 풍부한 지식을 반영하게 된다.

> 어떤 설계 요소는 네트워크나 데이터베이스와 같은 기술과 관련이 있지만, 도메인의 복잡성을 제대로 다루지 않으면 기술을 잘 이해하더라도 무용지물이다.

<br>

### 설계 vs. 개발 프로세스

* 도메인 주도 개발은 **애자일 프로세스**를 지향한다.
  * 개발은 반복주기를 토대로 진행되어야 한다.
  * 개발자와 도메인 전문가는 밀접한 관계에 있어야 한다.
