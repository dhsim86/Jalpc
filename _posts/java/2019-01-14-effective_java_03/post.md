---
layout: post
title:  "Effective Java 03 - 모든 객체의 공통 메서드"
date:   2019-01-14
desc:  "Effective Java 03 - 모든 객체의 공통 메서드"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# 모든 객체의 공통 메서드

자바의 Object 클래스는 상속해서 사용할 수 있는 여러 메서드들이 있다.

Object에서 final이 아닌 메서드 (equals, hashCode, toString, clone, finalize)는 모두 오버라이드를 염두에 두고 설계되어 있고, **재정의시 지켜야 하는 일반 규약이 정의되어 있다.**
따라서 Object를 상속하는 클래스, 즉 자바의 모든 클래스들은 이 메서드들을 일반 규약에 맞게 재정의해야 한다.

<br>
## 10. equals는 일반 규약을 지켜 재정의하라.

equals 메서드는 재정의하기가 쉬워보이지만, 곳곳에 함정이 있어 잘못 재정의하면 의도치 않은 결과를 초래한다.

가장 쉬운 것은 되도록이면 아예 재정의하지 않는 것이다.

> equals 메서드를 재정의하지 않으면 그 클래스의 인스턴스는 오직 자기 자신만 (참조값 비교) 같게 된다.

다음 상황 중 하나이면 재정의하지 않는 것이 좋다.

1. 각 인스턴스가 본질적으로 고유하다.
    - 값을 표현하는 것이 아닌 동작하는 개체를 표현하는 클래스 (ex. Thread 클래스)
2. 인스턴스의 **논리적 동치성 (logical equality)**를 검사할 일이 없다.
3. 상위 클래스에서 재정의한 equals가 하위 클래스에도 들어맞다.
    - 예를 들면 Set 구현체는 AbstractSet이 구현한 equals를 상속받아 사용한다.
4. 클래스가 private이거나 package-private이고, equals 메서드를 호출할 일이 없다.

---

equals를 재정의해야 하는 경우는 **객체 식별성 (object identity)가 아니라 논리적 동치성을 확인해야 될 때인데, 상위 클래스의 equals 메서드가 논리적 동치성을 지원하도록 재정의하지 않았을 경우이다.**

주로 값을 표현하는 클래스인 경우로, Integer나 String이 대표적이다. 

> 값을 표현하는 클래스이지만, 같은 값을 가지는 인스턴스가 둘 이상 만들어지지 않을 보장한다면 equals를 재정의하지 않아도 된다. 이런 클래스는 어차피 논리적 동치성과 객체 식별성이 사실상 같다.

equals 메서드를 재정의하는 경우, 반드시 다음 일반 규약을 따라야 한다.

**equals 메서드는 동치관계를 구현하며, 다음을 만족한다.**
* 반사성(reflexivity): null이 아닌 모든 참조 값 x에 대해, x.equals(x)는 true이다.
* 대칭성(symmetry): null이 아닌 모든 참조 값 x, y에 대해, x.equals(y)가 true이면 y.equals(x)도 true이다.
* 추이성(transitivity): null이 아닌 모든 참조 값 x, y, z에 대해, x.equals(y)가 true이고 y.equals(z)도 true면 x.equals(z)도 true이다.
* 일관성(consistency): null이 아닌 모든 참조 값 x, y에 대해 x.equals(y)를 반복해서 호출하면 항상 true를 반환하거나 항상 false를 반환해야 한다.
* null-아님: null이 아닌 모든 참조 값 x에 대해, x.equals(null)은 false이다.

> 위의 규약을 어기게 되면 프로그램이 오동작하거나 디버깅하기가 매우 힘들어진다. 특히 컬렉션 클래스들을 포함하는 많은 클래스들은 다루는 객체가 equals 규약을 지킨다고 가정하고 동작한다.
 
---


