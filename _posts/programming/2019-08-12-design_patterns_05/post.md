---
layout: post
title:  "디자인 패턴 05 - 싱글톤 (Singleton)"
date:   2019-08-12
desc:  "디자인 패턴 05 - 싱글톤 (Singleton)"
keywords: "디자인 패턴, Design Patterns, 생성 패턴, 싱글톤, Singleton, 단일체"
categories: [Programming]
tags: [Design Patterns]
icon: icon-html
---

싱글톤 (Singleton) 패턴은 프로그램에서 오직 **하나의 클래스 인스턴스**만을 가지도록 하고, 이 인스턴스에 대하여 코드 어느 곳이든 접근할 수 있는 **전역적인 엑세스 포인트**를 제공한다. 클래스 인스턴스가 오직 하나인 것을 보장해야 하고, 잘 정의된 접근점(access point)로 모든 사용자가 접근할 수 있도록 해야될 필요가 있을 때 이 패턴을 사용할 수 있다.

어떤 클래스의 인스턴스는 프로그램 동작 중에는 오직 하나만 존재해야 되는 경우가 있다. 보통 이런 클래스의 인스턴스는 전역 변수로 선언해두는 것으로 간단하게 구현할 수도 있지만, 클래스 자기 자신이 자신의 인스턴스를 관리하도록 하는 것이 관리 측면에서 더 좋다. 클래스 자신이 자신의 인스턴스를 적절히 통제하고(예를 들면 두 개 이상의 인스턴스가 만들어지지 않도록), 접근 방법도 제어하는 것이다.

![00.png](/static/assets/img/blog/programming/2019-08-12-design_patterns_05/00.png)

위 그림과 같이 getInstance와 같은 메소드를 통해 유일한 인스턴스로 생성 / 접근할 수 있도록 구현한다. (클래스 연산으로 정의한다.)

클래스 자체가 인스턴스를 캡슐화하므로, 클래스가 자체적으로 이 인스턴스에 접근하는 것을 제어할 수 있다. 또한 전역 변수와는 다르게 자체 네임 스페이스를 가지므로, 전역 변수를 사용함으로써 혼동될 수 있는 문제를 제거할 수 있다. (같은 이름의 전역 변수가 있는 상황 등)

[Singleton Example
](https://github.com/dhsim86/design_pattern_study/commit/bc96bf8bc9037f31d0995e16ba20d976af635e30)