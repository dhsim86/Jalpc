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
      - 한 클래스에 시그니처가 같은 생성자가 여러 개 필요할 것 같으면, 생성자 사용하는 대신에 팩터리 메소를 고려한다.

> 메소드 시그니처: 메소드 오버로딩의 핵심으로 메소드의 선언부에 명시되는 **메소드 이름과 입력 매개변수의 타입으로 구성된다.** 리턴 값의 타입이나 public, private와 같은 엑세스 수준, abstract, final과 같은 선택적 한정자는 포함하지 않는다. 메소드 오버로딩은 서로 다른 시그니처를 갖는 여러 메소드를 같은 이름으로 정의하는 것이다.

2. 호출될 때마다 인스턴스를 새로 생성할 필요는 없다.
    - 메서드 내부에서 미리 인스턴스를 만들어놓거나, 기존에 만들어둔 인스턴스를 캐싱하여 재활용시킬 수 있다.
      - 플라이웨이트 패턴과 비슷한 기법이다.
    - 반복되는 요청에 같은 객체를 반환하는 식으로, 인스턴스 통제가 가능하다.

3. 반환 타입의 하위 타입 객체를 반환할 수 있다.
    - 반환될 객체의 클래스를 자유롭게 선택하여 유연성을 확보할 수 있다.

4. 입력 매개변수에 따라 매번 다른 클래스의 객체를 반환할 수 있다.
    - 반환 타입의 하위 타입이기만 하면, 매개변수에 따른 적절한 하위 클래스의 인스턴스를 반환할 수도 있다.

5. 정적 팩터리 메소드를 작성하는 시점에는 반환할 객체의 클래스가 존재하지 않아도 된다.
    - 대표적으로 JDBC의 getConnection 이다.

<br>
### 정적 팩터리 메서드 단점

1. 상속을 하려면 public이나 protected 생성자가 필요한데, 정적 팩터리 메소드만 제공하면 하위 클래스 생성할 수 없다.
2. 정적 팩터리 메서드는 찾기 어렵다.
   - 생성자처럼 API 설명에 명확히 드러나지 않으니 사용자는 정적 팩터리 메서드 클래스를 인스턴스화할 방법을 알아내야 한다.

- 정적 팩터리 메서드에 흔히 사용되는 명명 방식

~~~java
// 1. from: 매개변수를 받아 해당 타입의 인스턴르를 반환하는 형변환 메서드
Date d = Date.from(instant);

// 2. of: 여러 매개변수를 받아 적절한 타입의 인스턴스 반환
Set<Rank> faceCards = EnumSet.of(JACK, QUEEN, KING);

// 3. valueOf: from과 of의 더 자세한 버전
BigInteger prime = BigInteger.valueOf(Integer.MAX_VALUE);

// 4. instance, getInstance: 매개변수로 명시한 인스턴스 반환. 같은 인스턴스임을 보장하지는 않는다.
StackWalker luke = StackWalker.getInstance(options);

// 5. create, newInstance: instance나 getInstance와 같지만, 매번 새로운 인스턴스를 생성하는 것을 보장한다.
Object newArray = Array.newInstance(classObject, arrayLen);

// 6. getType: getInstannce와 같으나 다른 클래스에 팩터리 메서드를 정의할 때 사용. "Type"는 반환되는 객체 타입이다.
FileStore fs = Files.getFileStore(path);

// 7. newType: newInstance와 같으나 다른 클래스에 팩터리 메서드를 정의할 때 사용.
BufferedReader br = Files.newBufferedReader(path);

// 8. type: getType와 newType의 간결한 버전
List<Complaint> litany = Collections.list(legacyLitany);
~~~

> 정적 팩터리 메서드와 public 생성자는 각자의 쓰임새가 있으므로, 상대적인 단점을 이해하고 사용하는 것이 좋다.
