---
layout: post
title:  "Effective Java 06 - 열거 타입과 애너테이션"
date:   2019-02-09
desc:  "Effective Java 06 - 열거 타입과 애너테이션"
keywords: "java, effective java, enum, annotation"
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

<br>
## 36. 비트 필드 대신 EnumSet을 사용하라.

열거한 값들이 주로 (단독이 아닌) 집합으로 사용될 경우, 정수 열거 패턴을 사용할 때 다음과 같이 선언해왔다.

```java
public class Text {
    public static final int STYLE_BOLD = 1 << 0;
    public static final int STYLE_ITALIC = 1 << 1;
    public static final int STYLE_UNDERLINE = 1 << 2;
    public static final int STYLE_STRIKETHROUGH = 1 << 3;

    // 매개변수 styles는 위의 STYLE_** 상수를 비트별 OR한 값이다.
    public void applyStyles(int styles) {
        ...
    }
}

text.applyStyles(STYLE_BOLD | STYLE_ITALIC);
```

위와 같이 비트별 OR을 사용해 여러 상수를 모은 집합을 비트 필드라고 한다.

비트 필드를 사용하면 비트별 연산을 통해 집합 연산을 효율적으로 수행할 수 있다. **하지만 비트 필드는 정수 열거 패턴을 사용했을 때의 단점을 그대로 가지며, 추가로 다음 문제까지 안고 있다.**

비트 필드 값이 그대로 출력될 때는 정수 열거 패턴 때보다 **해석하기가 더 까다롭다.** 또한 비트 필드 하나에 녹아 있는 모든 원소를 순회하기도 힘들다.

**또한 비트 필드 선언시 최대 몇 비트가 필요한지를 미리 예측해야 한다.**

자바에서는 이 비트 필드에 대한 더 나은 대안으로 **EnumSet** 클래스를 제공하는데, 이 클래스는 **열거 타입 상수의 값으로 구성된 집합을 효과적으로 표현한다.** Set 인터페이스를 구현하며, 타입 안전하고, 다른 어떤 Set 구현체와도 사용 가능하다. 

> EnumSet 내부는 비트 벡터로 구현되어 있다. 원소가 64개 이하라면, long 변수 하나로 비트 필드에 견주는 성능을 보여준다. removeAll과 같은 대량 작업은 비트를 효율적으로 처리할 수 있는 산술 연산을 써서 구현되어 있다.

```java
public class Text {
    public enum Style {BOLD, ITALIC, UNDERLINE, STRIKETHROUGH}

    // 어떤 Set을 넘겨도 되나, EnumSet이 가장 좋다.
    // 인터페이스로 파라미터 타입을 정의하는 것이 좋다.
    public void applyStyles(Set<Style> styles) {
        System.out.printf("Applying styles %s to text%n",
                Objects.requireNonNull(styles));
    }

    public static void main(String[] args) {
        Text text = new Text();
        text.applyStyles(EnumSet.of(Style.BOLD, Style.ITALIC));
    }
}
```

<br>
## 37. ordinal 인덱싱 대신, EnumMap을 사용하라.

이따금 배열이나 리스트에서 원소를 꺼낼 때, ordinal 메서드를 통해 인덱스를 얻는 코드가 있다.

```java
class Plant {
    enum LifeCycle {
        ANNUAL,
        PERENNIAL,
        BIENNIAL
    }

    final String name;
    final LifeCycle lifeCycle;

    Plant(String name, LifeCycle lifeCycle) {
        this.name = name;
        this.lifeCycle = lifeCycle;
    }

    @Override
    public String toString() {
        return name;
    }
}
```

위와 같이 식물을 표현한 클래스의 인스턴스들을 배열 하나로 관리하고, 이들을 생애주기에 따라 묶어보자.
생애주기별로 총 3개의 집합으로 만들고 각 식물을 해당 집합에 넣는다.

```java
Plant[] garden = {
    new Plant("바질",    LifeCycle.ANNUAL),
    new Plant("캐러웨이", LifeCycle.BIENNIAL),
    new Plant("딜",      LifeCycle.ANNUAL),
    new Plant("라벤더",   LifeCycle.PERENNIAL),
    new Plant("파슬리",   LifeCycle.BIENNIAL),
    new Plant("로즈마리", LifeCycle.PERENNIAL)
};

Set<Plant>[] plantsByLifeCycle = 
    (Set<Plant>[]) new Set[Plant.LifeCycle.values().length];

for (int i = 0; i < plantsByLifeCycle.length; i++) {
    plantsByLifeCycle[i] = new HashSet<>();
}

for (Plant p : garden) {
    plantsByLifeCycle[p.lifeCycle.ordinal()].add(p);
}

for (int i = 0; i < plantsByLifeCycle.length; i++) {
    System.out.println("%s: %s\n",
        Plant.LifeCycle.values()[i], plantsByLifeCycle[i]);
}
```

동작은 하는데 문제가 한가득이다. 배열은 제네릭과 호환되지 않으니 비검사 형변환을 수행해야 되고, 깔끔히 컴파일되지 않을 것이다. 

**심각한 문제는 정확하게 정숫값을 사용한다는 것을 직접 보증해야 한다는 점이다.** 정수는 열거 타입과는 다르게 타입 안전하지 않기 때문이다. 잘못된 정숫값을 사용시 오동작하거나, ArrayIndexOutOfBoundsException을 던질 것이다.

여기서 배열은 실질적으로 열거 타입 상수를 값으로 매핑하는 역할을 한다. 그러니 **Map으로 대체할 수 있다.**
자바에서 열거 타입을 키로 사용하도록 설계한 Map 구현체인 **EnumMap** 클래스를 제공한다.

```java
Map<Plant.LifeCycle, Set<Plant>> plantsByLifeCycle =
    new EnumMap<>(Plant.LifeCycle.class);

for (Plant.LifeCycle lc : Plant.LifeCycle.values()) {
    plantsByLifeCycle.put(lc, new HashSet<>());
}

for (Plant p : garden) {
    plantsByLifeCycle.get(p.lifeCycle).add(p);
}

System.out.println(plantsByLifeCycle);
```

**더 짧고 명료할 뿐만 아니라 안전하고 성능도 원래 일반 배열 사용했을 때와 비등하다.**
안전하지 않은 형 변환을 사용하지 않고, 맵의 키인 열거 타입이 그 자체로 출력용 문자열을 제공하므로 출력 결과에 직접 레이블을 달 필요가 없다.

EnumMap의 성능이 ordinal을 쓴 배열과 비슷한 이유는 그 내부에서 배열을 사용하기 때문이다.

스트림을 통해 맵을 관리하면 코드를 더 줄일 수도 있다.

```java
System.out.println(Arrays.stream(garden)
    .collect(groupingBy(p -> p.lifeCycle));
```

위의 groupingBy는 키를 p.lifeCycle로, 값을 Set\<Plant\> 인스턴스로 하는 Map을 만들어준다. 그런데 위 코드는 EnumMap을 사용하지 않으므로 성능 이점이 사라지는 문제가 있다. EnumMap을 사용하기 위해서는 다음과 같이 작성한다.

```java
// 두 번째 파라미터인 Supplier<M> mapFactory에 원하는 맵 구현체를 명시해주면 된다.
Map<Plant.LifeCycle, Set<Plant>> t = Arrays.stream(garden)
        .collect(groupingBy(p -> p.lifeCycle, () -> new EnumMap<>(LifeCycle.class), toSet()));
```

<br>
## 38. 확장할 수 있는 열거 타입이 필요하다면 인터페이스를 사용하라.

열거 타입은 확장할 수 없다. 

```java
enum Plant {
    
}

// 컴파일 에러
enum PlantEx extends Plant {
    
}
```

대부분의 상황에서 열거 타입을 확장하는 것은 좋지 않은 생각이다. 확장한 열거 타입의 원소가 기반 열거 타입의 원소로 취급하는데, 그 반대가 성립되지 않는다. 또한 기반 열거 타입과 확장한 열거 타입 원소 모두를 순회할 방법이 마땅치 않고, 확장성을 높이려면 고려할 요소가 늘어나 설계와 구현이 복잡해진다.

확장할 수 있는 열거 타입이 어울리는 쓰임이 최소한 하나는 있다. 가끔 API에서 제공하는 기본 열거 타입 외에 사용자가 확장할 수 있도록 열어줘야할 때가 있다.

이럴 때에는 **열거 타입이 임의의 인터페이스를 구현할 수 있다는 사실을 이용하면 된다.** 열거 타입용 인터페이스를 정의하고, 열거 타입이 이 인터페이스를 구현하도록 하는 것이다. 이 때, 이 열거 타입은 그 인터페이스의 표준 구현체 역할을 한다.

```java
public interface Operation {
    double apply(double x, double y);
}

public enum BasicOperation implements Operation {

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

    BasicOperation(String symbol) {
        this.symbol = symbol;
    }

    @Override public String toString() {
        return symbol;
    }
}

```

열거 타입인 BasicOperation을 확장할 수는 없지만, 인터페이스인 Operation은 확장할 수 있고 그 인터페이스를 연산의 타입으로 사용하면 된다. 사용자가 BasicOperation이 아닌 자기만의 Operation 열거 타입을 정의하고 싶을 때는 Operation을 구현한 또 다른 열거 타입을 정의하도록 하면 된다.

```java
public enum ExtendedOperation implements Operation {
    EXP("^") {
        public double apply(double x, double y) {
            return Math.pow(x, y);
        }
    },
    REMAINDER("%") {
        public double apply(double x, double y) {
            return x % y;
        }
    };

    private final String symbol;

    ExtendedOperation(String symbol) {
        this.symbol = symbol;
    }
    @Override public String toString() {
        return symbol;
    }
}
```

새로 작성한 연산은 Operation 인터페이스를 사용하는 어느 곳에서든 사용 가능하다.

```java
// Class 객체가 열거 타입인 동시에 Operation의 하위 타입이어야 한다는 뜻이다.
private static <T extends Enum<T> & Operation> void test(
        Class<T> opEnumType, double x, double y) {
    for (Operation op : opEnumType.getEnumConstants())
        System.out.printf("%f %s %f = %f%n",
                x, op, y, op.apply(x, y));
}
public static void main(String[] args) {
    double x = Double.parseDouble(args[0]);
    double y = Double.parseDouble(args[1]);
    test(ExtendedOperation.class, x, y);
}
```

인터페이스를 이용해 확장 가능한 열거 타입을 흉내내는 방식에도 한 가지 문제가 있는데, **열거 타입끼리 구현을 상속할 수 없다는 점이다.**

아무 상태에 의존하지 않는 코드라면, **인터페이스의 default 메서드**를 사용하는 방법이 있다. 그러나 위의 Operation의 예에서는 연산 기호를 저장하고 찾는 로직 (toString)이 열거 타입 모두 들어가야 한다. 이런 경우에는 **도우미 클래스나 정적 도우미 메서드로 분리하는 방식으로 코드 중복을 없앨 수 있다.**

<br>
## 39. 명명 패턴보다 애너테이션을 사용하라.

전통적으로 도구나 프레임워크가 특별히 다루어야 할 프로그램 요소에는 딱 구분되는 **명명 패턴**을 사용해왔다.

예를 들어 테스트 프레임워크인 **JUnit**은 버전 3까지 테스트 메서드 이름을 **test**로 시작하게끔 하였다. 이 방식의 단점은 오타가 나면 안될 뿐만 아니라, 올바르게 사용되리라 보장이 안된다. 예를 들어, 개발자가 클래스 이름을 Test**로 시작하게 하여도 JUnit은 무시한다. 

마지막으로 프로그램 요소를 매개변수로 전달할 방법이 없다는 점이다. 특정 예외를 던져야만 성공하는 테스트가 있다고 했을 때 기대하는 예외 타입을 테스트 메서드에 매개변수로 전달해야 되는데, 예외의 이름을 테스트 메서드 이름에 붙이는 방법도 있지만 보기가 나쁘고 깨지기도 쉽다.

**애너테이션**은 이 모든 문제를 해결해줄 수 있다. Junit도 버전 4부터 전면 애너테이션을 도입하였다.
Test라는 이름의 애너테이션을 정의해보자.

```java
// 매개변수가 없는 정적 메서드 전용
// 적절한 애너테이션 처리가 없이 인스턴스 메서드나 매개변수가 있는 메서드에 달면 에러가 발생한다.

// 메타 애너테이션
@Retention(RetentionPolicy.RUNTIME) // 런타임에도 유지되어야 함
@Target(ElementType.METHOD) // 메서드 선언에서만 사용되어야 함
public @interface Test {

}

public class Sample {
    @Test
    public static void m1() { }        // 성공해야 한다.

    public static void m2() { }

    @Test public static void m3() {    // 실패해야 한다.
        throw new RuntimeException("실패");
    }

    public static void m4() { }  // 테스트가 아니다.

    @Test public void m5() { }   // 잘못 사용한 예: 정적 메서드가 아니다.

    public static void m6() { }

    @Test public static void m7() {    // 실패해야 한다.
        throw new RuntimeException("실패");
    }

    public static void m8() { }
}

public class RunTests {
    public static void main(String[] args) throws Exception {
        int tests = 0;
        int passed = 0;
        Class<?> testClass = Sample.class;

        // 클래스에 정의된 메서드를 차례로 호출한다.
        for (Method m : testClass.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Test.class)) {
                tests++;
                try {
                    m.invoke(null);
                    passed++;

                // 테스트 메서드가 예외를 던지면 리플렉션 매커니즘이
                // InvocationTargetException 예외로 감싸서 다시 던진다.
                } catch (InvocationTargetException wrappedExc) {
                    Throwable exc = wrappedExc.getCause();
                    System.out.println(m + " 실패: " + exc);
                } catch (Exception exc) {
                    System.out.println("잘못 사용한 @Test: " + m);
                }
            }
        }
        System.out.printf("성공: %d, 실패: %d%n",
                passed, tests - passed);
    }
}

```


위와 같은 애너테이션을 **"애너테이션을 아무 매개변수 없이 단순히 대상에 마킹한다."는 뜻에서 마커 애너테이션이라고 한다.**

@Test 애너테이션이 **Sample 클래스의 의미에 직접적인 영향을 주지 않는다.**
**그저 이 애너테이션에 관심있는 프로그램에게 추가적인 정보만 제공해줄 뿐이다.**

즉, **대상 코드의 의미는 그대로 둔 채, 그 애너테이션에 관심있는 도구에서 특별하게 처리할 수 있는 기회를 주는 것이다.**

다음과 같이 의도한 대로 테스트 하나만 통과하는 것을 알 수 있다.
<br>
![00.png](/static/assets/img/blog/java/2019-02-09-effective_java_06/00.png)

이제 특정 예외를 던져야만 성공하는 테스트를 지원해보자.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
    Class<? extends Throwable> value();
}
```

이 애너테이션의 매개변수 타입은 **Class\<? extends Throwable\>** 이다. Throwable을 확장한 클래스의 Class 객체를 의미하며, 따라서 모든 예외와 오류 타입을 수용한다.

```java
public class Sample2 {
    @ExceptionTest(ArithmeticException.class)
    public static void m1() {  // 성공해야 한다.
        int i = 0;
        i = i / i;
    }

    @ExceptionTest(ArithmeticException.class)
    public static void m2() {  // 실패해야 한다. (다른 예외 발생)
        int[] a = new int[0];
        int i = a[1];
    }

    @ExceptionTest(ArithmeticException.class)
    public static void m3() { }  // 실패해야 한다. (예외가 발생하지 않음)
}

public class RunTests {
    public static void main(String[] args) throws Exception {
        int tests = 0;
        int passed = 0;
        Class<?> testClass = Sample2.class;
        for (Method m : testClass.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Test.class)) {
                tests++;
                try {
                    m.invoke(null);
                    passed++;
                } catch (InvocationTargetException wrappedExc) {
                    Throwable exc = wrappedExc.getCause();
                    System.out.println(m + " 실패: " + exc);
                } catch (Exception exc) {
                    System.out.println("잘못 사용한 @Test: " + m);
                }
            }

            if (m.isAnnotationPresent(ExceptionTest.class)) {
                tests++;
                try {
                    m.invoke(null);
                    System.out.printf("테스트 %s 실패: 예외를 던지지 않음%n", m);
                } catch (InvocationTargetException wrappedEx) {
                    Throwable exc = wrappedEx.getCause();
                    Class<? extends Throwable> excType =
                            m.getAnnotation(ExceptionTest.class).value();
                    
                    // 예외 발생시, 해당 예외 타입이면 성공
                    if (excType.isInstance(exc)) {
                        passed++;
                    } else {
                        System.out.printf(
                                "테스트 %s 실패: 기대한 예외 %s, 발생한 예외 %s%n",
                                m, excType.getName(), exc);
                    }
                } catch (Exception exc) {
                    System.out.println("잘못 사용한 @ExceptionTest: " + m);
                }
            }
        }

        System.out.printf("성공: %d, 실패: %d%n",
                passed, tests - passed);
    }
}
```

<br>

![01.png](/static/assets/img/blog/java/2019-02-09-effective_java_06/01.png)


다음과 같이 예외를 여러 개 명시하고 그 중 하나만 발생해도 테스트 성공하게 할 수도 있다.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
    // 배열 매개변수 지정
    Class<? extends Exception>[] value();
}

public class Sample3 {

    @ExceptionTest(ArithmeticException.class)
    public static void m1() {  // 성공해야 한다.
        int i = 0;
        i = i / i;
    }
    @ExceptionTest(ArithmeticException.class)
    public static void m2() {  // 실패해야 한다. (다른 예외 발생)
        int[] a = new int[0];
        int i = a[1];
    }
    @ExceptionTest(ArithmeticException.class)
    public static void m3() { }  // 실패해야 한다. (예외가 발생하지 않음)

    // 여러 개 지정시 중괄호로 감싸고, 쉼표로 구분한다.
    @ExceptionTest({ IndexOutOfBoundsException.class,
                     NullPointerException.class })
    public static void doublyBad() {   // 성공해야 한다.
        List<String> list = new ArrayList<>();

        // 자바 API 명세에 따르면 다음 메서드는 IndexOutOfBoundsException이나
        // NullPointerException을 던질 수 있다.
        list.addAll(5, null);
    }
}

public class RunTests {
    public static void main(String[] args) throws Exception {
        int tests = 0;
        int passed = 0;
        Class<?> testClass = Sample3.class;
        for (Method m : testClass.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Test.class)) {
                tests++;
                try {
                    m.invoke(null);
                    passed++;
                } catch (InvocationTargetException wrappedExc) {
                    Throwable exc = wrappedExc.getCause();
                    System.out.println(m + " 실패: " + exc);
                } catch (Exception exc) {
                    System.out.println("잘못 사용한 @Test: " + m);
                }
            }

            // 배열 매개변수를 받는 애너테이션을 처리하는 코드
            if (m.isAnnotationPresent(ExceptionTest.class)) {
                tests++;
                try {
                    m.invoke(null);
                    System.out.printf("테스트 %s 실패: 예외를 던지지 않음%n", m);
                } catch (Throwable wrappedExc) {
                    Throwable exc = wrappedExc.getCause();
                    int oldPassed = passed;
                    Class<? extends Throwable>[] excTypes =
                            m.getAnnotation(ExceptionTest.class).value();

                    // 여러 예외를 검사할 수 있다.
                    for (Class<? extends Throwable> excType : excTypes) {
                        if (excType.isInstance(exc)) {
                            passed++;
                            break;
                        }
                    }
                    if (passed == oldPassed)
                        System.out.printf("테스트 %s 실패: %s %n", m, exc);
                }
            }
        }
        System.out.printf("성공: %d, 실패: %d%n",
                passed, tests - passed);
    }
}
```

<br>

![02.png](/static/assets/img/blog/java/2019-02-09-effective_java_06/02.png)

---

자바 8부터는 여러 개의 값을 받는 애너테이션을 다른 방식으로 만들 수도 있다.
**배열 매개변수를 지정하는 대신, 애너테이션에 @Repetable 메타애너테이션을 다는 것이다.**

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
// 이 애너테이션에 "컨테이너 애너테이션"의 class 객체를 정의해야 한다.
@Repeatable(ExceptionTestContainer.class)
public @interface ExceptionTest {
    Class<? extends Throwable> value();
}

// @Repetable 애너테이션을 단 애너테이션을 반환하는 "컨테이너 애너테이션"을 정의해야 한다.
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTestContainer {
    // 내부 애너테이션의 타입의 배열을 반환하는 value 메서드를 정의해야 한다.
    ExceptionTest[] value();
}

public class Sample4 {

    // 다음과 같이 반복 가능하게 애너테이션을 달 수 있다.
    @ExceptionTest(IndexOutOfBoundsException.class)
    @ExceptionTest(NullPointerException.class)
    public static void doublyBad() {
        List<String> list = new ArrayList<>();

        // 자바 API 명세에 따르면 다음 메서드는 IndexOutOfBoundsException이나
        // NullPointerException을 던질 수 있다.
        list.addAll(5, null);
    }
}

public class RunTests {
    public static void main(String[] args) throws Exception {
        int tests = 0;
        int passed = 0;
        Class testClass = Sample4.class;
        for (Method m : testClass.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Test.class)) {
                tests++;
                try {
                    m.invoke(null);
                    passed++;
                } catch (InvocationTargetException wrappedExc) {
                    Throwable exc = wrappedExc.getCause();
                    System.out.println(m + " 실패: " + exc);
                } catch (Exception exc) {
                    System.out.println("잘못 사용한 @Test: " + m);
                }
            }

            // 반복 가능한 애너테이션을 여러 개 달았을 경우에는 "컨테이너 애너테이션"이 적용되므로
            // m.isAnnotationPresent(ExceptionTest.class) == false,
            // m.isAnnotationPresent(ExceptionTestContainer.class) == true 가 된다.
            // 따라서 둘 다 검사하도록 해야 한다.
            if (m.isAnnotationPresent(ExceptionTest.class)
                    || m.isAnnotationPresent(ExceptionTestContainer.class)) {
                tests++;
                try {
                    m.invoke(null);
                    System.out.printf("테스트 %s 실패: 예외를 던지지 않음%n", m);
                } catch (Throwable wrappedExc) {
                    Throwable exc = wrappedExc.getCause();
                    int oldPassed = passed;
                    ExceptionTest[] excTests =
                            m.getAnnotationsByType(ExceptionTest.class);
                    for (ExceptionTest excTest : excTests) {
                        if (excTest.value().isInstance(exc)) {
                            passed++;
                            break;
                        }
                    }
                    if (passed == oldPassed)
                        System.out.printf("테스트 %s 실패: %s %n", m, exc);
                }
            }
        }
        System.out.printf("성공: %d, 실패: %d%n",
                          passed, tests - passed);
    }
}

```

이렇게 **소스코드에 추가적인 정보를 제공할 필요가 있다면 명명패턴 보다는 애너테이션을 사용하도록 한다.** 그리고 **자바 프로그래머라면 예외없이 자바가 제공하는 애너테이션 타입들은 사용해야 한다.**

<br>
## 40. @Override 애너테이션을 일관되게 사용하라.

자바가 기본으로 제공하는 애너테이션 중 보통의 프로그래머에게 가장 중요한 것은 **@Override** 애너테이션이다. 이 애너테이션이 달렸다는 것은 **상위 타입의 메서드를 재정의했음을 의미한다.**

이 애너테이션을 일관되게 사용하면 각종 버그들을 예방할 수 있다.

```java
public class Bigram {
    private final char first;
    private final char second;

    public Bigram(char first, char second) {
        this.first  = first;
        this.second = second;
    }

    public boolean equals(Bigram b) {
        return b.first == first && b.second == second;
    }

    public int hashCode() {
        return 31 * first + second;
    }

    public static void main(String[] args) {
        Set<Bigram> s = new HashSet<>();
        for (int i = 0; i < 10; i++)
            for (char ch = 'a'; ch <= 'z'; ch++)
                s.add(new Bigram(ch, ch));
        System.out.println(s.size());
    }
}
```

main 메서드를 보면, 똑같은 소문자 2개로 구성된 인스턴스 26개를 10번 반복해서 Set에 추가한다음, 그 집합의 크기를 출력한다. Set은 중복을 허용하지 않으므로, 26이 출력될 것 같지만 실제로는 260이 출력된다.

Bigram 클래스는 equals 메서드 및 hashCode 메서드를 재정의하였다. 그런데 이 클래스는 equals를 재정의한 것이 아니고 다중 정의한 것이다. **Object의 equals 메서드를 재정의하려면 매개변수 타입을 Object로 해야된다.** Object의 equals 메서드는 기본적으로 == 연산자와 똑같은 객체 식별성만을 검사하므로, 결국 위의 코드에서 260을 출력한 것이다.

이 오류를 컴파일 단계에서 찾아내기 위해서는 @Override 애너테이션을 사용하여 재정의한다는 의도를 명시해야 한다.

```java
// 컴파일 에러

@Override 
public boolean equals(Bigram b) {
    return b.first == first && b.second == second;
}
```

잘못된 부분을 명확히 알려주므로, 올바르게 수정할 수 있다.

```java
@Override
public boolean equals(Object o) {
    if (!(o instanceof Bigram2))
        return false;
    Bigram2 b = (Bigram2) o;
    return b.first == first && b.second == second;
}
```

이렇게 컴파일 단계에서 오류를 즉각 찾아낼 수 있도록, **상위 클래스의 메서드를 재정의하려는 모든 메서드에 @Override 애너테이션을 다는 것이 좋다.**

@Override는 클래스 뿐만 아니라 인터페이스의 메서드를 재정의할 때도 사용할 수 있다. **디폴트 메서드**를 지원하기 시작하면서, 인터페이스 메서드를 구현할 때도 @Override 애너테이션을 다는 습관을 들이면 메서드 시그니처가 올바른지 확인할 수 있다.

<br>
## 41. 정의하려는 것이 타입이라면 마커 인터페이스를 사용하라.

아무 메서드도 담지 않고, 단지 자신을 구현하는 클래스가 특정 속성을 가짐을 표시해주는 인터페이스를 **마커 인터페이스**라고 한다. **Serializable** 인터페이스가 좋은 예이다. 

> Serializable 인터페이스는 자신을 구현한 클래스의 인스턴스는 ObjectOutputStream을 통해 write할 수 있다고 알려준다.

마커 애너테이션과 비교하자면, 두 가지 면에서 장점을 가진다.

1. 마커 인터페이스는 이를 구현한 **클래스의 인스턴스들을 구분하기 위한 타입**으로 사용할 수 있으나 마커 애너테이션은 그럴 수 없다.
   - 마커 인터페이스는 엄연한 타입이므로, 런타임에 발견할 오류를 컴파일 타임에 찾을 수 있다.
2. 적용 대상을 더 정밀하게 지정할 수 있다.
   - 적용 대상을 **ElementType.TYPE**으로 지정한 애너테이션은 모든 타입(클래스, 인터페이스, 열거 타입 등)에 달 수 있는데, 이는 부착할 수 있는 타입을 세밀하게 제한을 하지 못한다는 뜻이다.
   - 마커 인터페이스라면 특정 클래스에서만 그 인터페이스를 확장하면 된다.

반대로 **마커 애너테이션이 마커 인터페이스보다 나은 점으로는 거대한 애너테이션 시스템의 지원을 받을 수 있다는 점이다.** 따라서 애너테이션을 적극적으로 활용하는 프레임워크에서는 마커 애너테이션을 쓰는 쪽이 일관성을 지키는데 유리하다.

클래스와 인터페이스 외의 프로그램 요소들(모듈, 패키지, 필드, 지역 변수등)에 마킹해야 될 경우에는 애너테이션을 사용해야 한다.

만약 마커를 클래스나 인터페이스에 적용해야 할 때, **이 마킹이 된 클래스의 인스턴스를 매개변수로 받는 메서드를 작성할 일이 있다면 마커 인터페이스를 써야 한다.** 이렇게 하면 그 마커 인터페이스를 매개변수 타입으로 지정하여 컴파일타임에 오류를 잡을 수 있다. 만약 이런 메서드를 작성할 일이 없다면 마커 애너테이션이 더 나은 선택이다.