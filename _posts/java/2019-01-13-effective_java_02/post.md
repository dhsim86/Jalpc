---
layout: post
title:  "Effective Java 02 - 객체 생성과 파괴"
date:   2019-01-13
desc:  "Effective Java 02 - 객체 생성과 파괴"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# 객체 생성과 파괴

<br>
## 01. 생성자 대신 정적 팩터리 메서드를 고려하라.

클라이언트가 클래스의 인스턴스를 얻는 전통적인 수단은 Public 생성자이지만, **정적 팩토리 메소드**를 통해 클래스 인스턴스를 생성할 수도 있다.

```java
public static Boolean valueOf(boolean b) {
    return b ? Boolean.TRUE : Boolean.FALSE
}
```

<br>
### 정적 팩터리 메서드 장점

1. 이름을 가질 수 있다
    - 생성자 사용시 매개변수 및 생성자 자체만으로는 객체의 특성을 제대로 설명하지 못한다.
      - 하나의 시그니처로는 생성자를 하나만 만들 수 있다. 입력 매개변수들의 순서를 다르게 한 생성자를 새로 추가할 수 있지만 각 생성자들이 어떤 역할을 하는지 정확히 기억할 수 없다.
    - 정적 팩터리 사용시 이름만 잘 지으면 반환될 객체의 특성을 쉽게 묘사할 수 있다.
