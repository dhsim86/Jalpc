---
layout: post
title:  "Effective Java 05 - 제네릭"
date:   2019-01-27
desc:  "Effective Java 05 - 제네릭"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# 제네릭

<br>
## 26. 로 타입 (Raw Type)은 사용하지 말라.

클래스와 인터페이스 선언에 **타입 매개변수**가 쓰이면 이를 **제네릭 클래스** 혹은 **제네릭 인터페이스**라고 한다.

위와 같이 List 제네릭 인터페이스는 **타입 매개변수 E**를 받는다. 제네릭 클래스와 제네릭 인터페이스를 **제네릭 타입**이라고 한다.

각각의 제네릭 타입은 일련의 **매개변수화 타입**을 정의한다.
다음과 같이 클래스 혹은 인터페이스 이름이 나오고, 꺽쇠괄호 안에 실제 타입 매개변수들을 나열한다.

제네릭 타입에서 타입 매개변수를 전혀 사용하지 않는 것은 **로 타입**이라고 한다.

```java
// List: 제네릭 인터페이스
// E: 타입 매개변수
public interface List<E> extends Collection<E> {
    ...
}
// List<String>: 매개변수화 타입
List<String> strings = new ArrayList<>();

// List: 로 타입 (raw type)
List list = strings;
```

> 로 타입은 타입 선언에서 제네릭 타입 정보가 전부 지워진 것처럼 동작하는데, 제네릭이 도입되기 전의 코드와 호환성을 맞추도록 하기 위해 사용된다.

다음과 같이 로 타입을 사용하면, 컴파일 오류가 없이 컴파일되고 실행된다.

```java
private final Collection stamps = ...;
stamps.add(new Coin(...)); // 컴파일 에러 X

for (Iterator i = stamps.iterator(); i.hasNext(); ) {
    Stamp stamp = (Stamp)i.next(); // ClassCastException
    stamp.cancel();
}
```

**오류는 가능한 발생 즉시, 이상적으로는 컴파일할 때 발견하는 것이 좋다.** 위의 예에서는 런타임에서 확인할 수 있는데 이렇게 되면 **런타임에 문제를 겪는 코드와 원인을 제공한 코드가 물리적으로 상당히 떨어져 있을 가능성이 커진다.**

예외 발생시 stamps에 잘못된 값을 넣은 지점을 찾기 위해 코드 전체를 확인해야 될 수 있다.

제네릭을 활용하면 이 정보가 타입 선언 자체에 녹아든다.

```java
private final Collection<Stamp> stamps = ...;
```

위와 같이 선언하면 컴파일러는 stamps에 Stamp의 인스턴스만을 넣어야 한다는 것을 인지하게 된다.

