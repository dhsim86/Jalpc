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

> 메소드 시그니처: 메소드 오버로딩의 핵심으로 메소드의 선언부에 명시되는 **메소드 이름과 입력 매개변수의 타입으로 구성된다.** 리턴 값의 타입이나 public, private와 같은 엑세스 수준, abstract, final과 같은 선택적 한정자는 포함하지 않는다. 메소드 오버로딩은 서로 다른 시그니처를 갖는 여러 메소드를 같은 이름으로 정의하는 것이다.

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

<br>
## 2. 생성자에 매개변수가 많다면 빌더를 고려하라.

정적 팩터리와 생성자에는 똑같은 제약이 있는데, **선택적 매개변수가 많아지면 적절히 대응하기 어렵다**는 점이다.

다음과 같이 필수 매개변수를 받는 생성자를 두고, 그 생성자를 사용하는 다른 생성자를 늘려가는 점층적 생성자 패턴으로 구현할 수도 있다.

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
Boolean(String); // Java 9에서 deprecated. 매번 새로운 객체를 생성한다.
Boolean.valueOf(String) // 불필요한 객체 생성을 피한다.
```

불필요한 객체를 만들어내는 예로 오토박싱이 있다. 오토박싱은 프로그래머가 기본 타입과 박싱된 기본 타입을 섞어 쓸 때 자동으로 상호 변환해준다. 오토박싱을 위한 객체 생성 비용으로 인해 성능에 영향이 갈 수도 있다.
따라서 되도록이면 박싱된 타입보다는 기본 타입을 사용하도록 한다.

