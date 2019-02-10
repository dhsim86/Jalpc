---
layout: post
title:  "Effective Java 06 - 열거 타입과 애너테이션"
date:   2019-02-09
desc:  "Effective Java 06 - 열거 타입과 애너테이션"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# 열거 타입과 애너테이션

<br>
## 34. int 상수 대신 열거 타입을 사용하라.

열거 타입은 일정 개수의 상수 값을 정의한 다음, 그 외의 값은 허용하지 않는 타입이다.

자바에서 열거 타입을 지원하기 전에는 다음 코드처럼 정수 상숭를 한 묶음 선언해서 사용하곤 했다.

```java
public static final int APPLE_FUJI = 0;
public static final int APPLE_PIPPIN = 1;
public static final int APPLE_GRANNY_SMITH = 2;

public static final int ORANGE_NAVEL = 0;
public static final int ORANGE_TEMPLE = 1;
public static final int ORANGE_BLOOD = 2;
```

위와 같은 정수 열거 패턴은 단점이 많다. **타입 안전을 보장할 방법이 없으며 표현력도 좋지 않다.**

다음과 같이 사과 상수를 사용할 코드에 오렌지 상수를 사용해도 컴파일러는 아무런 경고 메시지를 출력하지 않는다.

```java
int i = (APPLE_FUJI - ORANGE_TEMPLE) / APPLE_PIPPIN;
```

특히 사과용 상수의 이름은 APPLE_로 시작하고, 오렌지용 상수는 ORANGE_로 시작하게 되는데, 이는 자바가 정수 열거 패턴을 위한 별도의 이름공간(namespace)를 지원하지 않기 때문에 접두어를 사용하는 것이다.

**정수 열거 패턴을 사용한 프로그램은 깨지기 쉽다.** 평범한 상수를 나열한 것일 뿐이라, 컴파일하면 그 값이 그대로 클라이언트 파일에 새겨진다. 따라서 **상수의 값이 바뀌면 클라이언트도 반드시 다시 컴파일해야 한다.**

**정수 상수는 문자열로 출력하기가 다소 까다롭다. 또한, 같은 그룹에 속한 정수 상수를 한 바퀴 순회하는 방법도 마땅치 않다.**

이런 단점을 해결하기 위해 자바는 열거 타입을 도입하였다.

```java
public enum Apple { FUJI, PIPPIN, GRANNY_SMITH }
public enum Orange { NAVEL, TEMPLE, BLOOD }
```

겉보기에는 C, C++과 같은 다른 언어의 열거 타입과 비슷하지만 **자바의 열거 타입은 완전한 형태의 클래스이다.** 따라서 다른 언어의 열거 타입보다 더 강력한 기능을 제공한다.

**열거 타입 자체는 클래스이며, 상수 하나당 자신의 인스턴스를 하나씩 만들어 public static final 필드로서 공개한다.** 열거 타입은 밖에서 접근할 수 있는 생성자를 제공하지 않으므로, 사실상 final이다. 따라서 클라이언트가 직접 열거 타입의 인스턴스를 생성하거나 확장할 수 없으니 **열거 타입의 인스턴스는 딱 하나씩만 존재함을 보장한다.**

**열거 타입은 정수 열거 패턴과는 다르게 타입 안전성을 제공한다.** 서로 다른 열거 타입끼리 대입하거나 연산하려고 하면 컴파일 에러가 발생한다. 또한 열거 타입 당 각자 이름 공간이 있어, 이름이 같은 상수라도 공존할 수 있다.

열거 타입에 새로 상수를 추가하거나 순서를 바꿔도 다시 컴파일할 필요 없다. 공개되는 것이 오직 필드의 이름뿐이라서 상수 값이 클라이언트로 컴파일되어 각인되지 않기 때문이다. 

또한 열거 타입의 toString 메서드는 출력하기에 적합한 문자열을 내어준다.

**열거 타입에는 임의의 메서드나 필드를 추가할 수 있고, 임의의 인터페이스를 구현하게 할 수도 있다.** 이를 통해 상수 모음일 뿐인 열거 타입에 **고차원의 추상 개념 하나를 완벽히 표현할 수도 있다.**

다음 코드는 행성을 표현하는 열거 타입이다. 단순한 상수가 아닌 행성과 관련된 속성이나 메서드들을 추가할 수 있다.

```java
public enum Planet {
    MERCURY(3.302e+23, 2.439e6),
    VENUS  (4.869e+24, 6.052e6),
    EARTH  (5.975e+24, 6.378e6),
    MARS   (6.419e+23, 3.393e6),
    JUPITER(1.899e+27, 7.149e7),
    SATURN (5.685e+26, 6.027e7),
    URANUS (8.683e+25, 2.556e7),
    NEPTUNE(1.024e+26, 2.477e7);

    // 열거 타입은 근본적으로 불변이므로, 모든 필드는 final이어야 한다.
    private final double mass;           // 질량(단위: 킬로그램)
    private final double radius;         // 반지름(단위: 미터)
    private final double surfaceGravity; // 표면중력(단위: m / s^2)

    // 중력상수(단위: m^3 / kg s^2)
    private static final double G = 6.67300E-11;

    // 생성자
    // 열거 타입 상수 각각을 특정 필드와 연결할 때,
    // 생성자에서 데이터를 받아 인스턴스 필드에 저장한다.
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
        surfaceGravity = G * mass / (radius * radius);
    }

    public double mass()           { return mass; }
    public double radius()         { return radius; }
    public double surfaceGravity() { return surfaceGravity; }

    public double surfaceWeight(double mass) {
        return mass * surfaceGravity;  // F = ma
    }
}
```

열거 타입은 자신 안에 정의된 상수들의 값을 배열에 담아 반환하는 정적 메서드 **values**를 제공한다. 또한 각 열거 타입의 값의 **toString** 메서드는 상수 이름을 문자열로 내어준다. 이들 메서드들을 통해 쉽게 열거 타입을 순회하면서 이름을 출력시킬 수 있다.

**열거 타입에서 상수 하나를 제거하면 제거한 상수를 참조하지 않는 한 클라이언트에게는 아무 영향이 없다.**
참조하더라도 컴파일시에는 컴파일 오류가 발생할 것이며, 런타임에는 유용한 정보를 담은 예외가 발생할 것이다. 이는 단순한 정수 열거 패턴에서는 기대할 수 없는 것이다.

> 열거 타입도 클래스처럼 기능을 클라이언트에 노출해야할 이유가 없다면 private나 package-private로 선언한다. 널리 쓰이는 열거 타입이라면 톱 레벨 클래스로 두고, 특정 톱 레벨 클래스에서만 사용된다면 해당 클래스의 멤버로 둔다.


