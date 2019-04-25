---
layout: post
title:  "Effective Java 07 - 람다와 스트림"
date:   2019-02-20
desc:  "Effective Java 07 - 람다와 스트림"
keywords: "java, effective java, lambda, stream, functional programming"
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

<br>
## 44. 표준 함수형 인터페이스를 사용하라.

java.util.function 패키지를 보면 다양한 용도의 표준 함수형 인터페이스가 담겨있다. 

**필요한 용도에 맞는 게 있다면 직접 구현하지 말고 표준 함수형 인터페이스를 활용하는 것이 낫다.** API가 다루는 개념의 수가 줄어들어 익히기 더 쉬워진다. 또한 표준 함수형 인터페이스들은 유용한 디폴트 메서드를 제공하므로 다른 코드와의 상호운용성도 크게 좋아진다.

java.util.function 패키지에는 총 43개의 인터페이스가 담겨 있다. 전부 기억하긴 어렵겠지만, 기본 인터페이스 6개만 기억하면 나머지를 충분히 유추할 수 있다.

| 인터페이스 | 함수 시그니처 | 예 |
| --- | --- | ---
| UnaryOperator\<T\> | T apply(T t) | String::toLowerCase |
| BinaryOperator\<T\> | T apply(T t1, T t2) | BigInteger::add |
| Predicate\<T\> | boolean test(T t) | Collection::isEmpty |
| Function\<T, R\> | R apply(T t) | Arrays.asList |
| Supplier\<T\> | T get() | Instant::now |
| Consumer\<T\> | void accept(T t) | System.out::println |

<br>

* Operator: 인수가 1개인 UnaryOperator와 2개인 BinaryOperator로 나뉘며, 반환값과 인수의 타입이 같은 함수
* Predicate: 인수 하나를 받아 boolean을 반환
* Function: 인수와 반환 타입이 다른 함수
* Supplier: 인수를 받지 않고 값을 반환하는 함수
* Consumer: 인수를 하나 받고 반환값은 없는 함수

<br>
### Supplier와 Callable

Supplier와 Callable은 같이 인수를 받지 않고 값을 반환하는 메서드를 정의하지만 차이점이 존재한다

```java
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}

``` 

```java
@FunctionalInterface
public interface Supplier<T> {
    T get();
}

```

Callable 인터페이스는 예외가 발생할 수 있는 구현을 위해 존재하며, 다른 스레드에 의해 수행될 수 있는 클래스의 인스턴스를 위해 디자인되었다.

> A task that returns a result and **may throw an exception.** Implementors define a single method with no arguments called call.
The Callable interface is similar to Runnable, in that both are **designed for classes whose instances are potentially executed by another thread.**

이에 반해 Supplier 인터페이스는 **값을 제공하는 목적**에 충실한 인터페이스이다.

> Represents a supplier of results.
There is no requirement that a new or distinct result be returned each time the supplier is invoked.

따라서 Callable 인터페이스는 Supplier 인터페이스의 특수한 버전이라고 할 수도 있다. 사실상 별 차이는 없다. Spring WebFlux에서 사용하는 Reactive Streams 구현체인 reactor **Mono**도 [**Mono.fromCallable**](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html#fromCallable-java.util.concurrent.Callable-)과 [**Mono.fromSupplier**](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html#fromSupplier-java.util.function.Supplier-) 라는 두 정적 메서드를 제공하고 있는데 문서를 보면 알겠지만 차이는 없다.

**코드 상의 의미를 부여하고 좀 더 이해하기 쉽도록** Callable과 Supplier를 구분해서 사용하는 것이 좋다고 생각한다. 다른 스레드에 의해 수행될 수 있거나 예외가 발생할 수 있으면 Callable 인터페이스를 사용하는 것이다.

---

위의 기본 인터페이스 (Operator, Predicate, Function, Supplier, Consumer)들은 **기본 타입을 좀 더 쉽게 쓸 수 있도록** 여러 변형이 존재한다. 그리고 **인수의 개수가 다른** (예를 들면 BiFunction\<T, U, R\>이나 BiConsumer\<T, U\>) 변형도 있다.

표준 함수형 인터페이스 대부분은 기본 타입만 지원한다. 성능을 위해서 박싱된 기본 타입을 넣어서 사용하는 것은 좋지 않다.

미리 정의된 표준 함수형 인터페이스를 사용하는 것이 좋지만, 필요한 용도에 맞는 게 없다면 직접 정의해야 한다. 만약 다음과 같은 경우라면 직접 함수형 인터페이스를 구현해야 될 것인지 고민해야 한다.

1. 자주 쓰이며 이름 자체가 용도를 명확히 설명해줄 경우
2. 반드시 따라야하는 규약이 있을 경우
3. 유용한 디폴트 메서드를 제공할 경우

> 직접 함수형 인터페이스를 작성하기로 하였다면, 어쨋든 "**인터페이스**"이므로 주의하여 설계헤야 한다.

함수형 인터페이스 정의시, **@FunctionalInterface** 애너테이션을 달아야 한다. **@Override** 애너테이션을 사용하는 이유가 비슷하게 **프로그래머의 의도를 명시하는 것이다.** **람다용으로 사용하는 것과 추상 메서드를 단 하나만 가져야 하며, 유지보수 과정에서 누군가가 메서드를 추가하지 않도록 막기 위한 것이다.**

함수형 인터페이스를 API에서 사용할 때, **서로 다른 함수형 인터페이스를 같은 위치의 인수로 받는 메서드들을 오버로딩해서는 안된다.** 클라이언트쪽으로 불필요하게 모호함을 안겨줄 뿐이며, 정확하게 메서드를 호출하기 위해 형변환해야 될 수도 있다.

<br>
## 45. 스트림은 주의해서 사용하라.

스트림 API는 다량의 데이터 처리 작업을 위해 자바 8에 추가된 것이다. 이 API에서 제공하는 추상 개념 중 핵심은 두 가지이다. 

1. 스트림(Stream): 데이터 원소의 유한 혹은 무한 시퀀스를 말한다. 스트림의 원소들은 컬렉션이나 배열, 파일 등 어디로부터든 올 수 있다.
2. 스트림 파이프라인(Stream Pipeline): 원소들로 수행하는 연산 단계를 표현하는 개념

스트림 파이프라인은 소스 스트림에서 시작해 **종단 연산으로 끝나며, 중간에 중간 연산이 있을 수 있다.** 중간 연산은 스트림을 어떠한 방식으로 **변환하는 것이다.**

> 스트림 파이프라인은 기본적으로 지연 평가된다. 종단 연산이 호출될 때 평가가 이루어지며, 종단 연산을 빠뜨리면 중간 연산들은 아예 실행되지도 않는다. 

스트림을 과하게 사용하면 다음 코드와 같이 이해하기가 어려울 수 있다.

```java
public static void main(String[] args) throws IOException {
    Path dictionary = Paths.get(args[0]);
    int minGroupSize = Integer.parseInt(args[1]);

    try (Stream<String> words = Files.lines(dictionary)) {
        words.collect(
                groupingBy(word -> word.chars().sorted()
                        .collect(StringBuilder::new,
                                (sb, c) -> sb.append((char) c),
                                StringBuilder::append).toString()))
                .values().stream()
                .filter(group -> group.size() >= minGroupSize)
                .map(group -> group.size() + ": " + group)
                .forEach(System.out::println);
    }
}
```

코드가 짧기는 하지만 읽기는 어렵다. **스트림을 과다하게 사용하면 프로그램을 읽거나 유지보수하기가 어려워진다.**

스트림으로 모든 것을 해결하려고 하기 보다는 다음과 같이 적절히 코드를 분리하고, 적당히 사용하는 것이 더 읽기가 쉽다.

```java
public static void main(String[] args) throws IOException {
    Path dictionary = Paths.get(args[0]);
    int minGroupSize = Integer.parseInt(args[1]);

    try (Stream<String> words = Files.lines(dictionary)) {
        words.collect(groupingBy(word -> alphabetize(word)))
                .values().stream()
                .filter(group -> group.size() >= minGroupSize)
                .forEach(g -> System.out.println(g.size() + ": " + g));
    }
}

private static String alphabetize(String s) {
    char[] a = s.toCharArray();
    Arrays.sort(a);
    return new String(a);
}
```

> 위 코드처럼 도우미 메서드 활용의 중요성은 예전의 for / while과 같은 반복적인 코드보다 스트림 파이프라인에서 더 크다. 특정 연산에 적절한 이름을 지어주고 세부 구현을 분리하여 전체적인 가독성을 높인 것이다. 

스트림을 처음 사용할 때, 모든 코드를 스트림으로 바꾸고 싶겠지만 **코드 가독성을 위해 스트림과 반복문을 적절히 조합하는 것이 최선이다.**

다음과 같은 경우라면 스트림과 맞지 않는 것이다.

1. 범위 안의 지역변수를 수정해야 할 필요가 있는 경우
   - 람다는 final로 선언된 변수에 한해 **접근만 할 수 있고 수정은 불가능하다.**
2. 중간에 return 문을 통해 빠져나가야 하거나, break / continue문을 통해 반복문을 종료, 아니면 Checked 예외를 던지는 경우
   - 람다는 Checked 예외를 던질 수 없고, 중간에 빠져나오는 연산 같은 것은 없다.

반대로 다음과 같은 경우라면 스트림과 궁합이 맞는 경우이다.

1. 원소들의 시퀀스를 일관되게 변환하는 경우
   - map이나 flatMap으로 변환하면 된다.
2. 원소들의 시퀀스를 필터링하는 경우
   - filter
3. 시퀀스를 하나의 연산을 이용해 결합하는 경우
   - reduce 등
4. 원소들의 시퀀스를 컬렉션에 모은다.
5. 원소들의 시퀀스에서 특정 조건을 만족하는 원소를 찾는 경우

<br>
## 46. 스트림에서는 부작용(Side effect) 없는 함수를 사용하라.

스트림은 **함수형 프로그래밍에 기초한 패러다임이다.** 

> 함수형 프로그래밍은 상태 변경이나 가변(mutable) 데이터를 피하고 **불변성(Immutability)를 지향**한다. 부작용이 없는 **순수 함수(오직 입력만이 결과에 영향을 주는 함수)**와 보조 함수의 조합을 통해 로직 내의 조건문과 반복문을 제거하여 복잡성을 해결하고, 변수의 사용을 억제하여 상태 변경을 피하려는 프로그래밍 패러다임이다. 조건문이나 반복문은 로직의 흐름을 어렵게 하여 가독성을 해치고 변수의 값은 누군가에 의해 언제든지 변경될 수 있어 오류 발생의 근본적 원인이 될 수 있기 때문이다.

> 함수형 프로그래밍은 순수 함수를 통해 부작용을 최대한 억제하여 오류를 피하고 프로그램의 안정성을 높이는 노력의 한 방법이라고 할 수 있다.

스트림이 제공하는 표현력, 속도, 병렬성을 얻으려면 이 패러다임까지 받아들여야 한다.

스트림 패러다임의 핵심은 계산을 일련의 변환으로 재구성하는 부분이다. 이 때 각 변환 단계는 **가능한 이전 단계의 결과값만 보고 처리하는 순수 함수여야 한다.** 다른 가변 상태를 참조하지 않고, 함수 스스로도 다른 상태를 변경하지 않아야 한다.

```java
Map<String, Long> freq = new HashMap<>();
try (Stream<String> words = new Scanner(file).tokens()) {
    words.forEach(word -> {
        freq.merge(word.toLowerCase(), 1L, Long::sum);
    });
}
```

위의 코드는 절대 스트림 코드라 할 수 없다. 스트림 코드를 가장한 반복적 코드인데, forEach내에서 외부 상태인 freq를 변경하는 것이 문제이다.

다음과 같이 **외부 상태를 변경하는 일이 없도록** 제대로 사용해야 한다.

```java
Map<String, Long> freq;
try (Stream<String> words = new Scanner(file).tokens()) {
    freq = words
            .collect(groupingBy(String::toLowerCase, counting()));
}
```

> forEach 연산은 스트림 계산 결과를 보고할 때만 사용해야 하고, 계산하는 용도로 사용해서는 안된다.

<br>
## 47. 반환 타입으로는 스트림보다 컬렉션이 낫다.

일련의 원소 시퀀스를 반환하는 메서드를 작성할 때는, 이를 스트림으로 처리하기를 원하는 사용자와 반복문으로 처리하길 원하는 사용자가 있을 수 있으므로, 되도록 컬렉션으로 반환하는 것이 좋다.

스트림은 Iterable으로 바로 변환이 되지 않으므로, 클라이언트 쪽에서 복잡하게 형변환해야 하는 작업이 필요하다. 그에 반해 Collection 인터페이스는 Iterable의 하위 타입이고, stream 메서드도 제공하여 반복과 스트림을 동시에 지원한다. 따라서 **원소 시퀀스를 반환하는 메서드는 Collection이나 그 하위 타입으로 사용하는 것이 최선이다.**

<br>
## 48. 스트림 병렬화는 주의해서 적용하라.

스트림 API는 **parallel** 메서드를 통해 스트림 파이프라인을 병렬 실행할 수 있도록 지원한다. **동시성 프로그래밍을 할 때는 안정성(safety)와 응답 가능(liveness) 상태를 유지하기 위해 애써야 하는데,** 이는 병렬 스트림 파이프라인에서도 다를게 없다.

```java
public static void main(String[] args) {
    primes().map(p -> TWO.pow(p.intValueExact()).subtract(ONE))
            .parallel() // 스트림 병렬화
            .filter(mersenne -> mersenne.isProbablePrime(50))
            .limit(20)
            .forEach(System.out::println);
}

static Stream<BigInteger> primes() {
    return Stream.iterate(TWO, BigInteger::nextProbablePrime);
}
```

위의 코드는 메르센 소수를 생성하는 프로그램인데, parallel 메서드를 통해 병렬적으로 수행하려고 한 것이다. 그런데, 이 프로그램을 실행하면 끝날 기미가 보이지 않는다. 이는 **스트림 라이브러리가 파이프라인을 병렬화하는 방법을 찾아내지 못했기 때문이다.**

파이프라인 병렬화는 limit를 다룰 때, CPU 코어가 남는다면 원소를 몇 개 더 처리한 후 제한된 개수 이후의 결과를 버려도 아무런 해가 없다고 가정한다. 

원래 메르센 소수를 찾을 때는 그 전 소수를 찾을 때보다 두 배의 시간이 걸리는데, 20번째까지 메르센 소수를 찾았을 때 그 시점의 CPU 코어가 놀고 있다면 21,22,23번째의 메르센 소수를 찾는 작업이(쿼드 코어일 경우) 병렬로 수행되며 결국 이 때문에 시간이 많이 걸리는 것이다.

**이처럼 스트림을 잘못 병렬화하면 응답 불가를 포함해 성능이 나빠질뿐만 아니라 결과 자체가 잘못되거나 예상 못한 동작이 발생할 수 있다.**

> 데이터 소스가 Stream.iterate이거나, 중간 연산으로 limit를 사용하면 파이프라인 병렬화로는 성능 개선을 기대할 수 없다.

대체로 스트림 소스가 ArrayList, HashMap, HashSet의 인스턴스이거나 배열, int / long 범위일 때 병렬화의 효과가 가장 좋다. 이 자료구조들은 **모두 데이터를 원하는 크기로 정확하고 손쉽게 나눌 수 있어 다수의 스레드에 분배하기 좋다는 특징이 있다.**

> 이 자료구조들의 공통점은 참조 지역성이 뛰어나다는 것이다. 

계산도 올바르게 수행하고 성능도 빨라질 거라는 확신이 없다면 스트림 파이프라인 병렬화는 시도하지 않는게 좋다. 스트림을 잘못 병렬화하면 프로그램을 오동작하게 하거나, 성능을 급격히 떨어뜨린다.