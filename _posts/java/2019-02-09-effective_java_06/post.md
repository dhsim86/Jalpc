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

위에서 정의한 Planet 열거 타입은 상수 마다 서로 다른 데이터를 할당하는데에 그쳤지만, 때로는 **상수마다 동작이 달라져야 하는 상황도 있을 것이다.** 
예를 들어 다음과 같이 사칙 연산을 표현한 열거 타입을 선언하고 실제 연산까지 열거 타입 상수가 직접 수행한다고 생각해보자.

```java
public enum Operation {
    PLUS, MINUS, TIMES, DIVIDE;

    public double apply(double x, double y) {
        switch(this) {
            case PLUS: return x + y;
            case MINUS: return x - y;
            case TIMES: return x * y;
            case DIVIDE: return x / y;
        }
        throw new AssertionError("Unkown operation: " + this);
    }
}
```

위와 같이 switch문을 통해 분기할 수도 있지만, 이는 깨지기 쉬운 코드이다. 새로운 상수를 추가하려면 해당 case 문도 추가해야 한다. 이런 메서드가 여러 개 있다면 각 메서드마다 추가해주어야 할 것이다.

다행히 자바의 열거 타입은 상수별로 다르게 동작하는 코드를 구현하는 더 나은 수단을 제공한다. 다음과 같이 **열거 타입에 추상 메서드를 추가하고, 각 상수별 클래스 몸체를 각 상수에서 자신에 맞게 재정의하는 것이다.**

이를 **상수별 메서드 구현 (constant-specific method implementation)** 이라고 한다.

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

    @Override public String toString() { return symbol; }

    // 추상 메서드로 선언되었으므로, 상수에서 재정의하지 않으면 컴파일 에러가 발생한다.
    public abstract double apply(double x, double y);

    public static void main(String[] args) {
        double x = Double.parseDouble(args[0]);
        double y = Double.parseDouble(args[1]);
        for (Operation op : Operation.values())
            System.out.printf("%f %s %f = %f%n",
                    x, op, y, op.apply(x, y));
    }
}
```

열거 타입에는 상수 이름을 입력받아 그 이름에 해당하는 상수를 반환해주는 **valueOf(String)** 메서드가 자동 생성된다. 열거 타입의 toString 메서드를 재정의할 때는 toString이 반환하는 문자열을 다시 해당 열거 타입 상수로 반환해주는 **fromString** 메서드를 제공하는 것이 좋다.

```java
public enum Operation {
    
    // Operation 상수가 이 맵에 저장되는 시점은 열거 타입 상수 생성 후,
    // 정적 필드가 초기화될 때이다.
    private static final Map<String, Operation> stringToEnum =
            Stream.of(values()).collect(
                    toMap(Object::toString, e -> e));

    // 지정한 문자열에 해당하는 Operation을 (존재한다면) 반환한다.
    public static Optional<Operation> fromString(String symbol) {
        return Optional.ofNullable(stringToEnum.get(symbol));
    }

}
```

> 열거 타입 생성자에서는 정적 상수 변수가 아닌, 자신의 정적 변수에 접근할 수 없다. 열거 타입 생성자가 실행되는 시점에는 정적 필드가 아직 초기화되기 전이다. 마찬가지로 생성자에서 같은 열거 타입에 정의된 다른 열거 상수에도 접근이 불가능하다.

---

**상수별 메서드 구현시, 열거 타입 상수끼리는 코드를 공유하기가 어렵다는 단점이 있다.**

다음과 같이 급여명세서에 쓸 요일을 표현하는 열거 타입을 예로 들어보자. 이 열거 타입은 직원의 시간당 기본임금과 그날 일한 시간이 주어지면 일당을 계산하는 메서드를 갖는다. 주중에 오버타임이 발생하면 잔업수당이 주어지고, 주말에는 무조건 잔업수당이 주어진다.

```java
enum PayrollDay {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY;

    private static final int MINS_PER_SHIFT = 8 * 60;
    
    int pay(int minutesWorked, int payRate) {
        int basePay = minutesWorked * payRate;

        int overtimePay;
        switch(this) {
            case SATURDAY:
            case SUNDAY:
                overtimePay = basePay / 2;
                break;
            default:
                overtimePay = minutesWorked <= MINS_PER_SHIFT ?
                    0 : (minutesWorked - MINS_PER_SHIFT) * payRate / 2;
        }

        return basePay + overtimePay;
    }
}
```

관리 관점에서는 위험한 코드이다. 휴가와 같은 새로운 값을 추가하려면 그 값을 처리하는 case 문도 잊지 말아야 한다.

간단한 구현으로 급여를 정확히 계산하는 방법은 두 가지이다.

1. 잔업수당을 계산하는 코드를 모든 상수에 중복해서 넣는 방법
2. 계산코드를 평일용과 주말용으로 나누어 도우미 메서드로 작성 후 각 상수가 자신에 필요한 메서드를 호출

위의 두 가지 방법 모두 코드가 장황해져 가독성이 크게 떨어지고 오류 발생 가능성이 커진다.

가장 깔끔한 방법은 **새로운 상수를 추가할 때, 잔업수당 "전략"을 선택하도록 하는 것이다.**

잔업수당 계산 자체를 **private 중첩 열거 타입**으로 옮기고 PayrollDay 열거 타입 생성자에서 이 중 적당한 것을 선택하도록 하는 것이다. 그리고 PayrollDay 열거 타입은 잔업수당 계산시, 중첩 열거 타입에 위임하도록 한다.

```java
enum PayrollDay {
    MONDAY(WEEKDAY), TUESDAY(WEEKDAY), WEDNESDAY(WEEKDAY),
    THURSDAY(WEEKDAY), FRIDAY(WEEKDAY),
    SATURDAY(WEEKEND), SUNDAY(WEEKEND);

    private final PayType payType;

    PayrollDay(PayType payType) { this.payType = payType; }
    
    int pay(int minutesWorked, int payRate) {
        // 전략 열거 타입으로 위임
        return payType.pay(minutesWorked, payRate);
    }

    // 전략 열거 타입
    enum PayType {
        WEEKDAY {
            int overtimePay(int minsWorked, int payRate) {
                return minsWorked <= MINS_PER_SHIFT ? 0 :
                        (minsWorked - MINS_PER_SHIFT) * payRate / 2;
            }
        },
        WEEKEND {
            int overtimePay(int minsWorked, int payRate) {
                return minsWorked * payRate / 2;
            }
        };

        abstract int overtimePay(int mins, int payRate);
        private static final int MINS_PER_SHIFT = 8 * 60;

        int pay(int minsWorked, int payRate) {
            int basePay = minsWorked * payRate;
            return basePay + overtimePay(minsWorked, payRate);
        }
    }
```

> switch 문은 열거 타입의 상수별 동작을 구현하는데 적합하지 않다.

**필요한 원소들이 컴파일 타임에 알 수 있는 상수 집합이라면 항상 열거 타입을 사용하도록 한다.**

<br>
## 35. ordinal 메서드 대신 인스턴스 필드를 사용하라.

대부분의 열거 타입 상수는 자연스럽게 하나의 정숫값에 대응된다. 그리고 모든 열거 타입은 해당 상수가 몇 번째 위치인지를 반환하는 **ordinal** 메서드를 제공한다.

열거 타입 상수와 연결된 정수값이 필요하면 다음과 같이 ordinal 메서드를 사용할 때가 있다.

```java
public enum Ensemble {
    SOLO, DUET, TRIO, QUARTET, QUINTET,
    SEXTET, SEPTET, OCTET, NONET, DECTET;

    // 연주자 수 리턴
    public int numberOfMusicians() {
        return ordinal() + 1;
    }
}
```

동작은 하는데, 유지보수하기가 어려운 코드이다. 만약 상수 선언 순서를 변경하면 해당 메서드는 오동작하며, 이미 사용 중인 정수와 값이 같은 상수는 추가할 방법이 없다. 또한 값을 중간에 비워둘 수도 없다.

따라서 **열거 타입 상수에 연결된 값은 ordinal 메서드로 얻지 말고 인스턴스 필드에 명시적으로 저장하는 것이 좋다.**

```java
public enum Ensemble {
    SOLO(1), DUET(2), TRIO(3), QUARTET(4), QUINTET(5),
    SEXTET(6), SEPTET(7), OCTET(8), DOUBLE_QUARTET(8),
    NONET(9), DECTET(10), TRIPLE_QUARTET(12);

    private final int numberOfMusicians;

    Ensemble(int size) { 
        this.numberOfMusicians = size;
    }
    public int numberOfMusicians() {
        return numberOfMusicians;
    }
}
```

Enum API 문서에서 ordinal 메서드는 다음과 같이 설명되어 있다.

> 대부분의 프로그래머는 이 메서드를 쓸 일이 없다. 이 메서드는 EnumSet과 EnumMap과 같은 열거 타입 기반의 범용 자료구조에 쓸 목적으로 설계되었다.

따라서 위의 용도가 아니면 ordinal 메서드는 사용하지 않는다.

