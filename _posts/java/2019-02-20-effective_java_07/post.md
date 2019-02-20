---
layout: post
title:  "Effective Java 07 - 람다와 스트림"
date:   2019-02-20
desc:  "Effective Java 07 - 람다와 스트림"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# 람다와 스트림

## 42. 익명 클래스보다는 람다를 사용하라.

예전에는 자바에서 함수 타입을 표현할 때 추상 메서드를 하나만 담은 인터페이스(혹은 추상 클래스)를 사용했다. 이런 인터페이스의 인스턴스를 **함수 객체**라고 하여 특정 함수나 동작을 나타내는 데 썼다.

JDK 1.1이 등장하면서 함수 객체를 만드는 주요 수단은 **익명 클래스**가 되었다.

```java
Collections.sort(words, new Comparator<String>() {
    public int compare(String s1, String s2) {
        return Integer.compare(s1.length(), s2.length());
    }
});
```

전략 패턴처럼, 함수 객체를 사용하는 과거 객체 지향 디자인 패턴에서는 익명 클래스면 충분하였다. 위의 코드에서 Comparator 인터페이스가 정렬을 담당하는 **추상 전략**을 뜻하여 구체적인 전략을 **익명 클래스**를 통해 구현했다.

> 익명 클래스 방식은 코드가 너무 길어서, 이전의 자바는 함수형 프로그래밍에 적합하지 않았다.

자바 8에 와서 **추상 메서드 하나만 가지는 인터페이스는 특별히 대우를 받게 되었다.** 지금은 **함수형 인터페이스**라고 부르는 이 인터페이스의 인스턴스들을 **람다식**을 사용해 만들 수 있게 된 것이다.

람다는 함수나 익명 클래스와 개념은 비슷하지만 코드는 훨씬 간결하다.

```java
Collections.sort(words, (s1, s2) -> Integer.compare(s1.length(), s2.length()));
```

위 코드에서 람다, 매개변수 및 반환 값의 타입은 각각 Comparator\<String\>, String, int이지만 코드에서는 언급이 없다. 이는 컴파일러가 **문맥을 살펴보고 타입을 추론한 것이다.**

<br>
### 람다 표현식

참고: [Java8#01.람다 표현식(Lambda Expression)](https://multifrontgarden.tistory.com/124)

람다의 핵심은 지울 수 있는 것은 모두 지우자는 것이다.
컴파일러가 자동으로 추론할 수 있는 것은 모두 빼고 코드를 간결하게 하는 것이다.

```java
interface Movable {
    void move(String str);    
}

class Car implements Movable{
    @Override
    public void move(String str) {
        System.out.println("gogo car move" + str);
    }
}

Movable movable = new Movable() {
    @Override
    public void move(String str) {
        System.out.println("gogo move move" + str);
    }
};
```

위의 코드에서 Movable 인터페이스를 구현하는 클래스를 만들어 사용하거나, 재사용성이 없다면 익명 클래스로 만들어 사용하는 것이 기존 방식이다.

어떤 방식으로 사용하는 코드 몇 줄 이상을 작성하는 것이 기본이다. 이 익명 클래스를 람다로 변경해보자. 먼저 어떤 것을 생략해도 될까 생각해보자.

1. 이미 대상 타입에서 Movable 이라고 명시하였기 때문에, **new Movable**은 없어도 컴파일러가 추론할 수 있다.
2. 구현하려고보니, 구현해야할 것은 move 메서드밖에 없다. 따라서 **구현할 메서드가 하나뿐이라면 메서드 명칭이 없어도 추론할 수 있을 것이다.**
3. 컴파일러가 구현할 인터페이스 및 메서드를 추론했다면, **인자 타입**도 추론할 수 있을 것이다.

위의 1,2,3을 토대로 다시 코드를 작성해보면

```java
Movable movable1 = (str) -> {
    System.out.println("gogo move move" + str);
};
```

위의 코드와 같이 작성하여도 컴파일러가 추론할 수 있을 것이다. 여기서 더 코드를 생략할 수 있는지 알아보자.

1. 인자가 여러 개이면 모르겠지만 하나 뿐이라면 **인자의 괄호 부분**을 생략해도 될 것이다.
2. 실행 구문이 위의 코드처럼 1줄 뿐이면 **블록으로 감쌀 필요가 없이** 사용해도 문제가 없을 것이다.

다시 위의 1,2를 토대로 코드를 생략해보면

```java
Movable movable2 = str -> System.out.println("gogo move move" + str);
```

여러 줄이었던 코드가 한 줄로 줄어들었다.

> 상황에 따라 컴파일러가 타입을 추론하지 못할 수도 있는데, 그럴 때는 프로그래머가 직접 명시해야 한다. 타입 추론 규칙은 자바 언어 명세의 하나의 chapter를 차지할 만큼 복잡하다.

**타입을 명시해야 코드가 더 명확할 경우는 제외하고, 람다의 모든 매개변수 타입은 생략하도록 하자.** 컴파일러가 타입을 알 수 없다고 오류를 낼 때만 타입을 명시하면 된다.

---

위의 코드 중, 다음 코드는 람다 자리에 **비교자 생성 메서드**를 사용하면 더 간결하게 만들 수 있다.

**Before**
```java
Collections.sort(words, (s1, s2) -> Integer.compare(s1.length(), s2.length()));
```

**After**
```java
Collections.sort(words, comparingInt(String::length));
```

더 나아가서, 자바 8에서 List 인터페이스에 추가된 sort 메서드를 사용하면 더욱 짧아진다.

```java
words.sort(comparingInt(String::length));
```

람다를 언어 차원에서 지원하면서, 기존에는 적합하지 않았던 곳에서도 객체를 실용적으로 사용할 수 있게 되었다.

다음은 Operation 열거 타입에서 각 상수마다 달라지는 동작을 **상수별 클래스 몸체**를 통해 정의한 코드이다.

```java
public enum Operation {
    PLUS("+") {
        public double apply(double x, double y) { return x + y; }
    },
    MINUS("-") {
        public double apply(double x, double y) { return x - y; }
    },
    TIMES("*") {
        public double apply(double x, double y) { return x * y; }
    },
    DIVIDE("/") {
        public double apply(double x, double y) { return x / y; }
    };

    private final String symbol;

    Operation(String symbol) { this.symbol = symbol; }
    public abstract double apply(double x, double y);
}
```

람다를 이용하면 열거 타입의 인스턴스 필드를 이용하는 방식으로, 상수별로 다르게 동작하는 코드를 쉽게 구현할 수 있다.

다음 코드와 같이 각 열거 타입별 동작을 람다로 구현해 생성자에 넘기고, 이를 인스턴스 필드에 저장해두는 것이다. 이렇게 구현하면 상수별 클래스 몸체를 사용했을 때보다 코드가 더 간결해진다.

```java
public enum Operation {
    PLUS  ("+", (x, y) -> x + y),
    MINUS ("-", (x, y) -> x - y),
    TIMES ("*", (x, y) -> x * y),
    DIVIDE("/", (x, y) -> x / y);

    private final String symbol;
    private final DoubleBinaryOperator op;

    Operation(String symbol, DoubleBinaryOperator op) {
        this.symbol = symbol;
        this.op = op;
    }
}
```

그렇다고 상수별 클래스 몸체가 쓸모없다는 것은 아니다. 메서드나 클래스와는 다르게 **람다는 이름이 없고 문서화하지도 못한다. 따라서 코드 자체로 명확히 설명되지 않거나, 코드 줄 수가 많아지면 람다를 쓰지 말아야 한다.**

> 람다는 코드가 한 줄이때 가장 좋고, 길어봐야 세 줄 안에 끝나는 것이 좋다.

열거 타입 생성자에 넘겨지는 인수들의 타입도 컴파일 타임에 추론된다. 따라서 **생성자 안의 람다는 열거 타입 인스턴스필드에 접근이 불가능하다.** (인스턴스는 런타임에 생성되기 때문이다.)

상수별 동작을 단 몇 줄로 구현하기 어렵거나, 인스턴스 필드 / 메서드를 사용해야 하는 상황이면 상수별 클래스 몸체를 사용해야 한다.

람다가 등장하면서 익명 클래스의 자리는 크게 좁아지긴 했지만 아직 람다로 대체할 수 없는 곳이 많다. 특히 람다는 추상 메서드가 하나 분인 **함수형 인터페이스에서만 쓰인다.** 추상 메서드가 여러 개라면 익명 클래스를 써야 한다.

또한 람다는 자기 참조가 불가능하다. **람다에서 this 키워드는 바깥 인스턴스를 가리킨다.** 이 람다의 특징은 자바스크립트 화살표 함수의 **Lexical this**와 비슷하다. 

반대로 익명 클래스에서의 this는 익명 클래스의 인스턴스, 자신을 가리킨다.  따라서 함수 객체가 자기 자신을 참조해야 한다면, 반드시 익명 클래스를 사용해야 한다.

참고: [자바스크립트, 화살표 함수](https://poiemaweb.com/es6-arrow-function)