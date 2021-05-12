---
layout: post
title:  "Effective Java 02 - 객체 생성과 파괴"
date:   2019-01-13
desc:  "Effective Java 02 - 객체 생성과 파괴"
keywords: "java, effective java, constructor, builder pattern, factory"
categories: [Java]
tags: [java]
icon: icon-html
---

# 객체 생성과 파괴

<br>
## 01. 생성자 대신 정적 팩터리 메서드를 고려하라.

클라이언트가 클래스의 인스턴스를 얻는 전통적인 수단은 Public 생성자이지만, **정적 팩터리 메소드**를 통해 클래스 인스턴스를 생성할 수도 있다.

```java
public static Boolean valueOf(boolean b) {
    return b ? Boolean.TRUE : Boolean.FALSE
}
```

<br>
### 정적 팩터리 메서드 장점

1. 이름을 가질 수 있다
    - 생성자 사용시 매개변수 및 생성자 자체만으로는 생성할 객체의 특성을 제대로 설명하지 못한다.
      - 하나의 시그니처로는 생성자를 하나만 만들 수 있다. 입력 매개변수들의 순서를 다르게 한 생성자를 새로 추가할 수 있지만 각 생성자들이 어떤 역할을 하는지 정확히 기억할 수 없다.
    - 정적 팩터리 사용시 이름만 잘 지으면 반환될 객체의 특성을 쉽게 묘사할 수 있다.
      - 한 클래스에 시그니처가 같은 생성자가 여러 개 필요할 것 같으면, 생성자 사용하는 대신에 팩터리 메소드를 고려한다.

2. 호출될 때마다 인스턴스를 새로 생성할 필요는 없다.
    - 불변 클래스 같은 것은 내부에서 미리 인스턴스를 만들어놓거나, 기존에 만들어둔 인스턴스를 캐싱하여 팩터리 메서드가 호출될 때 이를 재활용하는 식으로 불필요한 객체 생성을 막을 수 있다.
      - 플라이웨이트 패턴과 비슷한 기법이다.
    - 반복되는 요청에 같은 객체를 반환하는 식으로, 인스턴스 생성에 대해 통제가 가능하다.

3. 반환 타입의 하위 타입 객체를 반환할 수 있다. (공변 반환 타입)
    - 반환될 객체의 클래스를 자유롭게 선택하여 유연성을 확보할 수 있다.
    - 구현 클래스를 클라이언트가 몰라도 사용가능하게 한다.
      - ex) 컬렉션 프레임워크, java.util.Collections

4. 입력 매개변수에 따라 매번 다른 클래스의 객체를 반환할 수 있다.
    - 반환 타입의 하위 타입이기만 하면, 매개변수에 따른 적절한 하위 클래스의 인스턴스를 반환할 수도 있다.

5. 정적 팩터리 메소드를 작성하는 시점에는 반환할 객체의 클래스가 존재하지 않아도 된다.
    - 대표적으로 JDBC의 getConnection 이다.

> 메소드 시그니처: 메소드 오버로딩의 핵심으로 메소드의 선언부에 명시되는 **메소드 이름과 입력 매개변수의 타입으로 구성된다.** 리턴 값의 타입이나 public, private와 같은 엑세스 수준, abstract, final과 같은 선택적 한정자는 포함하지 않는다. 메소드 오버로딩은 서로 다른 시그니처를 갖는 여러 메소드를 같은 이름으로 정의하는 것이다.

<br>
### 정적 팩터리 메서드 단점

1. 상속을 하려면 public이나 protected 생성자가 필요한데, private 생성자로만 정의하고 클라이언트에는 정적 팩터리 메소드만 제공하면 하위 클래스 생성할 수 없다.
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

<br>
## 2. 생성자에 매개변수가 많다면 빌더를 고려하라.

정적 팩터리와 생성자에는 똑같은 제약이 있는데, **선택적 매개변수가 많아지면 적절히 대응하기 어렵다**는 점이다.

다음과 같이 필수 매개변수를 받는 생성자를 두고, 그 생성자를 사용하는 다른 생성자를 늘려가는 점층적 생성자 패턴으로 구현할 수 있다.

```java
public class NutritionFacts {
    private final int servingSize;  // (mL, 1회 제공량)     필수
    private final int servings;     // (회, 총 n회 제공량)  필수
    private final int calories;     // (1회 제공량당)       선택
    private final int fat;          // (g/1회 제공량)       선택
    private final int sodium;       // (mg/1회 제공량)      선택
    private final int carbohydrate; // (g/1회 제공량)       선택

    public NutritionFacts(int servingSize, int servings) {
        this(servingSize, servings, 0);
    }

    public NutritionFacts(int servingSize, int servings,
                          int calories) {
        this(servingSize, servings, calories, 0);
    }

    public NutritionFacts(int servingSize, int servings,
                          int calories, int fat) {
        this(servingSize, servings, calories, fat, 0);
    }

    public NutritionFacts(int servingSize, int servings,
                          int calories, int fat, int sodium) {
        this(servingSize, servings, calories, fat, sodium, 0);
    }
    public NutritionFacts(int servingSize, int servings,
                          int calories, int fat, int sodium, int carbohydrate) {
        this.servingSize  = servingSize;
        this.servings     = servings;
        this.calories     = calories;
        this.fat          = fat;
        this.sodium       = sodium;
        this.carbohydrate = carbohydrate;
    }
}
```

위의 클래스의 인스턴스를 만들려면 다음과 같이 인스턴스를 생성하게 된다.

```java
NutritionFacts cocaCola = new NutritionFacts(240, 8, 100, 0, 35, 27); // 이해하기 어려움
```

보통 이렇게 클래스를 정의하면 사용자가 **설정하길 원치하는 매개변수까지 포함되기 쉽고 클라이언트 코드를 작성하거나 읽기가 어려워진다.**

다음은 자바빈즈 패턴으로, 매개 변수가 없는 생성자로 객체 생성 후 setter 메서드들을 통해 원하는 매개변수 값을 설정하는 방식이다.

```java
public class NutritionFacts {
    // 매개변수들은 (기본값이 있다면) 기본값으로 초기화된다.
    private int servingSize  = -1; // 필수; 기본값 없음
    private int servings     = -1; // 필수; 기본값 없음
    private int calories     = 0;
    private int fat          = 0;
    private int sodium       = 0;
    private int carbohydrate = 0;

    public NutritionFacts() { }
    // Setters
    public void setServingSize(int val)  { servingSize = val; }
    public void setServings(int val)     { servings = val; }
    public void setCalories(int val)     { calories = val; }
    public void setFat(int val)          { fat = val; }
    public void setSodium(int val)       { sodium = val; }
    public void setCarbohydrate(int val) { carbohydrate = val; }

    public static void main(String[] args) {
        NutritionFacts cocaCola = new NutritionFacts();
        cocaCola.setServingSize(240);
        cocaCola.setServings(8);
        cocaCola.setCalories(100);
        cocaCola.setSodium(35);
        cocaCola.setCarbohydrate(27);
    }
}
```

위 코드의 단점은 객체 하나를 만들려면 메서드를 여러 개 호출해야 되고, **객체가 완전히 생성되기 전까지는 일관성이 깨진 상태에 놓게 된다.**

객체 생성시 매개 변수가 많다면, 점층적 생성자 패턴과 자바 빈즈 패턴 대신에 빌더 패턴을 사용하는 것이 좋다.

1. 클라이언트는 객체를 직접 생성하는 대신에 필수 매개변수만을 생성자 혹은 정적 팩터리 메서드를 통해 빌더 객체를 얻는다.

2. 빌더 객체가 제공하는 일종의 setter 메서드들로 원하는 선택 매개변수들을 설정하고, build 메서드를 통해 필요한 객체를 얻는다.

```java
public class NutritionFacts {
    private final int servingSize;
    private final int servings;
    private final int calories;
    private final int fat;
    private final int sodium;
    private final int carbohydrate;

    public static class Builder {
        // 필수 매개변수
        private final int servingSize;
        private final int servings;

        // 선택 매개변수 - 기본값으로 초기화한다.
        private int calories      = 0;
        private int fat           = 0;
        private int sodium        = 0;
        private int carbohydrate  = 0;

        public Builder(int servingSize, int servings) {
            this.servingSize = servingSize;
            this.servings    = servings;
        }

        public Builder calories(int val)
        { calories = val;      return this; }
        public Builder fat(int val)
        { fat = val;           return this; }
        public Builder sodium(int val)
        { sodium = val;        return this; }
        public Builder carbohydrate(int val)
        { carbohydrate = val;  return this; }

        public NutritionFacts build() {
            return new NutritionFacts(this);
        }
    }

    private NutritionFacts(Builder builder) {
        servingSize  = builder.servingSize;
        servings     = builder.servings;
        calories     = builder.calories;
        fat          = builder.fat;
        sodium       = builder.sodium;
        carbohydrate = builder.carbohydrate;
    }

    public static void main(String[] args) {
        // 빌더의 setter 메소드들은 빌더 자신을 반환하므로 연쇄적으로 호출 가능하다.
        NutritionFacts cocaCola = new NutritionFacts.Builder(240, 8)
                .calories(100).sodium(35).carbohydrate(27).build();
    }
}
```

위와 같이, 클라이언트의 코드는 읽고 쓰기가 쉽다.
객체 유효성 검사시, 빌더의 생성자와 메서드에서 입력 매개변수를 검사하고 build 메서드가 호출하는 생성자에서 여러 매개변수에 걸친 불변식을 검사하도록 한다. 유효성 검사 실패시에는 **IllegalArgumentException** 예외를 던지도록 하면 된다.

> 생성자나 정적 팩터리가 처리해야 할 매개변수가 많다면 빌더 패턴을 선택하는 것이 낫다. 빌더는 점층적으로 생성자를 만드는 방식에 비해 클라이언트 코드를 읽고 쓰기가 간편하고, 자바빈즈보다 안전하다.

<br>
## 3. private 생성자나 열거 타입으로 싱글턴임을 보증하라.

싱글턴이란 인스턴스를 오직 하나만 생성할 수 있는 클래스를 말한다.

> 클래스를 싱글턴으로 만들시 이를 사용하는 클라이언트를 테스트하기가 어려워질 수 있다. 보통 private 생성자를 사용하고 정적 팩터리 메소드를 통해 생성하는데, 테스트시 mock으로 대체하기가 힘들다.

<br>
## 4. 인스턴스화를 막기 위해서는 private 생성자를 사용하라.

정적 메소드나 정적 필드만을 담은 유틸성 클래스를 정의할 때는 private 생성자를 통해 외부에서 해당 클래스를 인스턴스할 수 없도록 한다.

private 생성자 사용은 상속을 불가능하게 하는 효과도 있다.

<br>
## 5. 자원을 직접 명시하지 말고, 의존 객체 주입을 사용하라.

보통 클래스들은 하나 이상의 자원에 의존한다.

```java
// 유틸리티 클래스
public class SpellChecker {
    private static final Lexicon dictionary = ...;
    private SpellChecker() {}

    public static ...
}
```

```java
// 싱글턴
public class SpellChecker {
    private final Lexicon dictionary = ...;
    private SpellChecker(...) {}
    public static SpellChecker INSTANCE = new SpellChecker(...);
}
```

위와 같이 구현한 것은 사전을 단 하나만 사용한다고 가정한 것이다. 만약 다른 사전을 사용한다면 코드 변경이 일어나게 된다. **사용하는 자원에 따라 동작이 달라지는 클래스는 정적 유틸리티 클래스나 싱글턴 방식이 적합하지 않다.**

다음과 같이 객체 생성시 의존성이 있는 객체를 주입해줌으로써, 유연성 및 테스트 용이성을 개선할 수 있다.

```java
public class SpellChecker {
    private final Lexicon dictionary;

    public SpellChecker(Lexicon dictionary) {
        this.dictionary = Objects.requireNonNull(dictionary);
    }
}
```

이 패턴의 쓸만한 변형으로, 생성자나 팩터리 메서드로 자원 팩터리를 넘겨주는 방식이 있다.

```java
Mosaic create(Supplier<? extends Tile> tileFactory) {
    ...
}
```

위 방식을 사용하면 클라이언트는 자신이 명시한 타입의 하위 타입이라면 무엇이든 생성이 가능한 팩터리를 넘길 수 있다.

> 클래스가 내부적으로 하나 이상의 자원에 의존하고, 그 자원이 클래스 동작에 영향을 준다면 싱글턴과 정적 유틸리티 클래스는 적합하지 않다. 필요한 자원이나 자원을 생성해주는 팩터리를 클라이언트에서 주입하는 것이 좋다. 의존 객체 주입은 클래스의 유연성, 재사용성, 테스트 용이성을 개선해준다.

<br>
## 6. 불필요한 객체 생성을 피하라.

똑같은 기능의 객체를 매번 생성하기 보다는 객체 하나를 재사용하는 편이 나을 때가 많다.
특히 불변 객체는 언제든 재사용 가능하다.

생성자 대신 정적 팩터리 메서드를 제공하는 불변 객채에서는 정적 팩터리 메서드를 사용해 불필요한 객체 생성을 막을 수 있다.

```java
String s = new String("str");  // 매번 불필요하게 String 인스턴스를 생성한다.
Boolean(String); // Java 9에서 deprecated. 매번 새로운 객체를 생성한다.

String s = "str"; // 매번 새로운 String 인스턴스를 생성하지 않고 문자열 리터럴를 한번 생성하고 이를 참조만 한다.
Boolean.valueOf(String) // 불필요한 객체 생성을 피한다.
```

불필요한 객체를 만들어내는 예로 오토박싱이 있다. 오토박싱은 프로그래머가 기본 타입과 박싱된 기본 타입을 섞어 쓸 때 자동으로 상호 변환해준다. 오토박싱을 위한 객체 생성 비용으로 인해 성능에 영향이 갈 수도 있다.

```java
public static long sum() {
    Long sum = 0L;
    for (long i = 0; i <= Integer.MAX_VALUE; i++) {
        sum += i;   // 불필요한 오토박싱으로 Long 객체가 불필요하게 생성된다.
    }
    return sum;
}
```

따라서 되도록이면 박싱된 타입보다는 기본 타입을 사용하도록 한다.

<br>
## 7. 다 쓴 객체 참조를 해제하라.

다음 코드 중 pop 메서드에서 메모리 누수가 발생한다.

```java
public class Stack {
    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Stack() {
        elements = new Object[DEFAULT_INITIAL_CAPACITY];
    }

    public void push(Object e) {
        ensureCapacity();
        elements[size++] = e;
    }

    public Object pop() {
        if (size == 0)
            throw new EmptyStackException();
        return elements[--size];    // 가비지 컬렉터 입장에서는 size 뒤에 있는 객체도 모두 유효한 객체이다.
    }

    private void ensureCapacity() {
        if (elements.length == size)
            elements = Arrays.copyOf(elements, 2 * size + 1);
    }

    public static void main(String[] args) {
        Stack stack = new Stack();
        for (String arg : args)
            stack.push(arg);

        while (true)
            System.err.println(stack.pop());
    }
}
```

스택을 표현한 배열이 다 쓴 참조를 여전히 가지고 있기 때문이다. 참조를 가지고 있으므로, 가비지 컬렉터는 스택에서 꺼내진 객체들을 회수하지 않는다.

객체 참조 하나를 살려두면, 그 객체가 참조하는 모든 객체들까지도 모두 회수하지 못한다. 이를 위해 다음과 같이 null을 대입하여 참조를 해제한다.

```java
public Object pop() {
    if (size == 0)
        throw new EmptyStackException();
    Object result = elements[--size];
    elements[size] = null; // 다 쓴 참조 해제
    return result;
}
```

null 대입을 해두면 나중에 다 쓴 참조(obsolete reference)를 엉뚱하게 참조하여 이상 동작하는 것을, NullPointerException 예외를 통해 조기에 버그를 발견할 수도 있다.

null 대입과 같은 객체 참조 해제는 항상 위의 경우와 같은 예외적인 상황에서만 사용하여 코드가 지저분해지지 않도록 한다. 자기 메모리를 직접 관리하는 경우라면 항상 메모리 누수에 주의해야 한다.

<br>
## 8. finalizer와 cleaner 사용을 피하라.

자바는 두 가지 객체 소멸자를 제공한다.

**finalizer는 예측할 수 없고, 상황에 따라 위험할 수 있어 일반적으로 불필요하다.
cleaner는 finalizer 보다는 덜 위험하지만 여전히 예측할 수 없고, 느리고, 일반적으로는 불필요하다.**

C++의 파괴자(destructor)와는 다른 개념이다. C++에서의 파괴자는 생성자의 대척점으로 특정 객체와 관련된 자원을 회수하는 보편적인 방법이다.

자바에서는 접근할 수 없게 된 객체를 회수하는 역할을 가비지 컬렉터가 담당하며, 이 때 finalizer가 호출된다.
이 **메서드를 언제 호출할지는 전적으로 가비지 컬렉터 알고리즘에 달려있다.** 따라서 즉시 수행된다는 보장이 없으므로 **finalizer와 cleaner로는 제때 실행해야 되는 작업을 수행해서는 안된다.**

이렇게 가비지 컬렉터 마음대로 메서드 실행이 지연되므로 finalizer에서 구현되어 있는 자원 회수도 제멋대로 지연되어 OutOfMemoryError가 발생할 수도 있다.

> finalizer 스레드는 다른 애플리케이션 스레드보다 우선순위가 낮다.

자바 언어 명세는 finalizer나 cleaner의 수행 시점뿐만 아니라 수행 여부까지 보장하지 않는다. 따라서 그 메서드에서 구현된 종료 작업이 전혀 수행되지 않을 수도 있다.

finalizer 동작 중에 발생한 예외는 무시되며, 그 순간 작업이 종료되어 뒤에 있는 작업이 되지 않는 위험도 있다. 보통의 경우에는 예외가 스레드를 중단시키고 스택 트레이스를 출력하겠지만, 같은 일이 finalizer 안에서 일어난다면 경고조차 출력하지 않는다.

finalizer와 cleaner는 또한 가비지 컬렉터의 효율을 떨어뜨린다.

finalizer 및 cleaner 대신에 **AutoCloseable** 을 구현해주고, 인스턴스 사용 후 close 메소드를 통해 정리 작업을 진행하는 것이 좋다. (예외가 발생하더라도 close를 호출할 수 있도록 try-with-resource를 사용해야 한다.)

cleanner 와 finalizer의 적절한 쓰임새는 close 메서드를 호출하지 않을 경우에 대한 안전망 역할과 네이티브 객체를 참조하고 있는 경우이다.

```java
public class Room implements AutoCloseable {
    private static final Cleaner cleaner = Cleaner.create();

    // 청소가 필요한 자원
    // Room 인스턴스를 참조하면 순환 참조하게 되므로 가비지 컬렉터가 Room 인스턴스를 회수할 기회를 가지지 못하게 된다.
    // 정적 이너 클래스가 아닌 일반 이너 클래스면 자동으로 바깥 클래스 객체 참조를 가지므로 가비지 컬렉터가 회수 못할 수 있다.
    private static class State implements Runnable {
        int numJunkPiles;

        State(int numJunkPiles) {
            this.numJunkPiles = numJinkPiles;
        }

        @Override
        public void run()  {
            System.out.println("방 청소");
            numJunkPiles = 0;
        }
    }

    private final State state;
    private final Cleaner.Cleanable cleanable;

    public Room(int numJunkPiles) {
        state = new State(numJunkPiles);

        // 미처 close 메소드를 호출하지 않는 경우가 있다면, 
        // 가비지 컬렉터가 Room 인스턴스를 회수할 때, 아마도 State의 run 메소드를 호출하여 자원을 회수할 수 있다. (maybe)
        cleanable = cleaner.register(this, state);
    }

    // 보통 try-with-resource에 의해 호출되어 자원이 회수될 것이다.
    @Override
    public void close() {
        cleanable.clean();
    }
}
```

<br>
## 9. try-finally 보다는 try-with-resources를 사용하라.

자바 라이브러리에는 InputStream / OutputStream과 같이 close 메소드를 호출해 직접 닫아줘야 하는 자원이 많다.

보통 다음과 같이 finally 블록에서 close 메소드를 호출하여 자원이 반납되도록 하였다.

```java
static void copy(String src, String dst) throws IOException {
    InputStream in = new FileInputStream(src);
    try {
        OutputStream out = new FileOutputStream(dst);
        try {
            byte[] buf = new byte[BUFFER_SIZE];
            int n;
            while ((n = in.read(buf)) >= 0)
                out.write(buf, 0, n);
        } finally {
            out.close();
        }
    } finally {
        in.close();
    }
}
```

위의 코드와 같이 여러 자원을 사용할 때는 중첩되는 try-finally 블록을 사용해야 되서 코드가 지저분해질 수 있고, read 메서드에서 예외 발생했는데, close 메서드에서도 예외가 발생하면 두 번째 예외 (close 예외)가 첫 번째 예외(read 예외)를 삼킨다. 따라서 사용자 입장에서는 디버깅이 매우 어렵게 될 수 있다.

이러한 문제를 자바 7의 try-with-resource를 통해 해결할 수 있다.
이 구조를 사용하려면 해당 자원이 **AutoCloseable** 인터페이스를 구현해야 한다.
AutoCloeseable 인터페이스는 close 메소드 하나만 정의한 단순한 인터페이스이다.

```java
static void copy(String src, String dst) throws IOException {
    try (InputStream in = new FileInputStream(src);
         OutputStream out = new FileOutputStream(dst)) {
        byte[] buf = new byte[BUFFER_SIZE];
        int n;
        while ((n = in.read(buf)) >= 0)
            out.write(buf, 0, n);
    }
}
```

try-with-resources 를 사용하면 코드가 간결해질 뿐만 아니라, read 및 close (보이지 않는) 메서드에서 둘다 예외가 발생시 read에 대한 예외가 삼켜지지 않고 기록된다. (억제된 예외, supressed 예외로 확인 가능하다.)
close 메서드에 대한 예외는 숨겨지긴 하지만 스택 추적 내역에 suppressed라는 꼬리표를 통해 기록이 남게 된다. getSuppressed 메소드를 통해 프로그램 코드에서 숨겨진 예외를 가져올 수도 있다.

다음과 같이 다수의 예외를 한 catch 문으로 처리할 수도 있다.

```java
static String firstLineOfFile(String path, String defaultVal) {
    try (BufferedReader br = new BufferedReader(
            new FileReader(path))) {
        return br.readLine();
    } catch (IOException e) {
        return defaultVal;
    }
}
```

> try-with-resources를 사용하면 코드는 더 짧고 명확해지고, 만들어지는 예외 정보도 훨씬 유용해진다.

