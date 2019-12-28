---
layout: post
title:  "도메인 주도 설계 15 - 디스틸레이션"
date:   2019-06-20
desc:  "도메인 주도 설계 15 - 디스틸레이션"
keywords: "도메인 주도 설계, DDD, Domain, Domain Driven Design, Distillation, 디스틸레이션"
categories: [Programming]
tags: [DDD, Domain, Domain Driven Design]
icon: icon-html
---

Layered Architecture는 기술적 관심사로부터 도메인 개념을 분리한다. 도메인 주도 설계의 전제 조건은 도메인 영역 자체를 다루는 도메인 계층을 격리시키는 것이다. 하지만 **규모가 큰 시스템에서는 격리된 도메인 계층 그 자체도 관리가 되지 않을 정도로 복잡해질 수도 있다.**

우리는 개발을 진행하면서 도메인을 좀 더 깊이 있게 이해하고, 지식 탐구 및 심층 연구, 리팩터링 과정을 거쳐 도메인 지식의 정수를 추출한 모델을 형상화하여 코드에 반영하게 된다. **더 나아가서 도메인 계층에 있는 복잡한 도메인 모델의 여러 요소들을 분리하여 도메인 본질을 좀 더 값지고 유용한 형태로 뽑아내는 과정인 디스틸레이션(Distillation)이 있다.** 이 과정을 거치면 Generic Subdomain(일반 하위 도메인)과 Coherent Mechanism(응집력 있는 매커니즘)가 나타나는데, 이는 우리 도메인 핵심 영역인 Core Domain을 추출하기 위한 과정인 것이다.

![00.png](/static/assets/img/blog/programming/2019-06-20-domain_driven_design_15/00.png)

