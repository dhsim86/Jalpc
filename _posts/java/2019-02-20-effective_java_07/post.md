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

<br>
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

<br>
## 43. 람다보다는 메서드 레퍼런스를 사용하라.

람다가 익명 클래스보다 나은 점 중에서 가장 큰 특징은 **간결함**이다. 그런데 자바에서는 함수 객체를 람다보다도 더 간결하게 만드는 방법이 있는데 바로 **메서드 레퍼런스**이다.

다음 코드는 임의의 키와 Integer 값의 매핑을 관리하는 프로그램의 일부이다. 이 코드는 키가 맵 안에 없다면 키와 숫자 1을 매핑하고, 이미 있다면 기존 매핑 값을 증가시킨다.

```java
map.merge(key, 1, (count, incr) -> count + incr);
```

> Map의 merge 메서드는 키, 값, 함수를 인수로 받으며, 주어진 키가 맵 안에 없다면 주이진 {키, 값} 쌍을 그대로 저장한다. 반대로 키가 이미 있다면 함수를 통해 현재 값과 주어진 값에 적용한 다음, 그 결과로 현재 값을 덮어 쓴다. {키, 함수의 결과}

깔끔해 보이지만 매개변수 count와 incr가 하는 일 없이 공간을 꽤 차지하고 있다. 위 코드에서 람다는 단순히 두 인수의 합을 반환할 뿐이다.

자바 8에서 Integer 클래스와 같은 박싱 타입은 이 람다와 기능이 같은 정적 메서드 sum을 제공한다.

```java
map.merge(key, 1, Integer::sum);
```

이렇게 메서드 레퍼런스를 사용하면 똑같은 결과를 더 보기 좋게 얻을 수 있다.

매개변수가 늘어날수록 **메서드 레퍼런스로 제거할 수 있는 코드의 양이 늘어난다.** 다만 어떤 람다는 매개변수의 이름 자체가 프로그래머에게 좋은 가이드가 되기도 하므로, 메서드 레퍼런스보다 읽기 쉽고 유지보수도 용이할 수 있다.

**보통 메서드 레퍼런스를 사용하는 편이 코드가 더 짧고 간결하므로, 람다로 구현했을 때 너무 길거나 복잡하다면 메서드 레퍼런스가 좋은 대안이 될 수 있다.**

람다를 직접 사용하는 것보다는 람다로 작성할 코드를 새로운 메서드에 담은 다음, 람다 대신 그 메서드 레퍼런스를 사용하는 식으로 구현하면 **기능을 잘 드러내는 이름도 지어줄 수 있고 문서로도 남길 수 있다.**

보통 IDE에서는 메서드 레퍼런스로 대체하라고 권하지만, 꼭 람다보다 메서드 레퍼런스가 간결한 것은 아니다. **주로 람다와 메서드가 같은 클래스에 있을 때 그렇다.** 다음과 같은 코드가 있다고 해보자.

```java
public class GoshThisClassNameIsHumongous {
    ...
    public static void action() {
        ...
    }
    public static void foo() {
        service.execute(GoshThisClassNameIsHumongous::action);
    }
    ...
}
```

이를 람다로 대체해보면 다음과 같다.

```java
service.execute(() -> action());
```

이럴 때는 람다가 더 낫다. 같은 선상에서 **Function.identity()**를 사용하는 것보다는 람다 (x -\> x)를 사용하는 것이 낫다.

> Function.identity 메서드는 인자로 들어온 값 그대로 반환하는 메서드이다.

메서드 레퍼런스의 유형은 다섯 가지가 있는데, 가장 흔한 유형은 앞의 예에서 본 것처럼 **정적 메서드를 가리키는 메서드 레퍼런스이다.**

다음으로 **인스턴스의 메서드를 참조하는 유형이 두 가지가 있다.**

<br>
### 한정적 메서드 레퍼런스

수신 객체(receiving object)를 특정하는 한정적 인스턴스 메서드 레퍼런스이다. 근본적으로 정적 메서드 레퍼런스와 비슷한데, **함수 객체가 받는 인수와 참조되는 메서드가 받는 인수가 똑같다.**

람다 캡쳐링을 통해, 람다 표현식 바깥에 있는 인스턴스의 메서드를 호출할 때 사용한다.

```java
Integer test = 10;
List<Integer> values = Arrays.asList(10, 20, 30);
 
// Predicate<Integer> t = Integer::equals;
Predicate<Integer> testEquals = test::equals;

long testCount = values.stream()
        .filter(testEquals) // .filter(test::equals)
        .count();
```

Predicate 인터페이스의 test 메서드는 인자 하나를 받는다. 그런데 equals 메서드는 비교하기 위해 두 객체(자신 및 비교 대상)가 필요하므로

```java
Predicate<Integer> predicate = Integer::equals;
```

와 같은 식으로 작성하지 못한다. 나머지 하나를 추론할 수 없기 때문이다. 

하지만 다음과 같이 특정 인스턴스를 지정한다면 컴파일러 입장에서는 추론이 가능해진다.

```java
Predicate<Integer> testEquals = test::equals;
```

<br>
### 비한정적 메서드 레퍼런스

수신 객체를 특정하지 않는다.
다음과 같이 특정 인스턴스를 지정하지 않고 String::isEmpty 메서드 레퍼런스를 사용했지만, 컴파일러가 추론하여 호출할 수 있다.

```java
List<String> test = Arrays.asList("", "Not Empty", "");
long testCount = test.stream()
        .filter(String::isEmpty)
        .count();
```

---

마지마으로 클래스 생성자를 가리키는 메서드 레퍼런스와 배열 생성자를 가리키는 메서드 레퍼런스가 있다. 생성자 메서드 레퍼런스는 팩터리 객체로 사용된다.

```java
public static class Point {
    private int x;

    public Point(int x) {
        this.x = x;
    }
}

List<Integer> valueList = Arrays.asList(1, 2, 3, 4, 5);
List<Point> pointList = valueList.stream()
        .map(Point::new)
        .collect(Collectors.toList());
```

> 메서드 레퍼런스는 람다의 간단명료한 대안이 될 수 있다. 메서드 레퍼런스 쪽이 짧고 명확하다면 메서드 레퍼런스를 쓰고, 그렇지 않을 때만 람다를 사용하라.

