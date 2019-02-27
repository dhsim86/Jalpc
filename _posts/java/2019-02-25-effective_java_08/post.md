---
layout: post
title:  "Effective Java 08 - 메서드"
date:   2019-02-25
desc:  "Effective Java 08 - 메서드"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# 메서드

<br>
## 49. 매개변수가 유효한지 검사하라.

메서드와 생성자의 대부분은 값이 특정 조건을 만족해야 한다. 이러한 제약은 **반드시 문서화해야 하며, 메서드 몸체가 시작되기 전에 유효한지 검사해야 한다.** 이는 **"오류는 가능한 빨리 (발생한 곳에서) 잡아야 한다"**는 일반 원칙의 사례이기도 하다.

메서드 몸체가 시작되기 전에 매개변수를 확인하여 잘못된 값이 넘어왔을 때 즉각적이고 깔끔한 방식으로 예외를 던질 수 있다.

매개변수 검사를 제대로 하지 않는다면 몇 가지 문제가 발생할 수 있다. 메서드가 수행되는 중간에 모호한 예외를 던질 수 있으며, 더 나쁜 상황은 메서드가 잘 수행되었는데 잘못된 결과를 반환할 수도 있다. 또한 메서드 수행 후 어떤 객체를 이상한 상태로 만들어 미래의 알 수 없는 시점에 이 메서드와는 관련 없는 오류를 낼 수도 있다.

public과 protected 메서드는 매개변수 값이 잘못되었을 때 던지는 예외를 문서화해야 한다. 이는 **@throws** 자바독 태그를 사용하면 된다. 제약을 문서화한다면 그 제약을 어겼을 때 발생하는 예외도 함께 기술해야 한다.

공개되지 않은 메서드라면 메서드가 호출되는 상황을 통제할 수 있다. **오직 유효한 값이 넘겨지리라는 것을 보증할 수 있고 그렇게 해야 한다.**

<br>
## 50. 적시에 방어적 복사본을 만들라.

API나 클래스를 설계할 때는 그것을 사용하는 **클라이언트가 불변식을 깨드리려 혈안이 되어 있다고 가정하고 방어적으로 프로그래밍해야 한다.** 어떠한 경우든 적절치 않은 클라이언트로부터 클래스를 보호하는데 충분한 시간을 투자하는 것이 좋다.

어떤 객체든 그 객체의 허락없이는 외부에서 내부를 수정하는 일은 불가능하다. 하지만 주의를 기울이지 않으면 자기도 모르게 내부를 수정하도록 하는 경우가 생긴한다.

```java
public final class Period {
    private final Date start;
    private final Date end;

    public Period(Date start, Date end) {
        if (start.compareTo(end) > 0) {
            throw new IllegalArgumentException(start + " after " + end);
        }
        this.start = start;
        this.end = end;
    }

    public Date start() {
        return start;
    }

    public Date end() {
        return end;
    }
}
```

얼핏 이 클래스는 불변 클래스로 보이지고, 시작 시각이 종료 시각보다 늦을 수 없다는 불변식이 어렵지 않게 지켜질 것 같다. 그러나 **Date가 가변이라는 사실**을 이용하면 그 불변식을 깨뜨릴 수 있다.

```java
Date start = new Date();
Date end = new Date();
Period p = new Period(start, end);
end.setYear(78); // p의 내부를 수정
```

다행히 자바 8 이후라면 쉽게 해결할 수 있다. Date 대신에 불변인 **Instant(혹은 LocalDateTime, ZonedDateTime)**를 사용하면 된다. **Date는 낡은 API이니 새로운 코드를 작성할 떄는 더 이상 사용하면 안된다.**

외부 공격으로부터 Period 인스턴스의 내부를 보호하려면 **생성자에서 받은 가변 매개변수 각각을 방어적으로 복사해야 한다.** 그런 다음 Period 인스턴스 안에서는 원본이 아닌 복사본을 사용한다.

```java
public Period(Date start, Date end) {
    this.start = new Date(start.getTime());
    this.end   = new Date(end.getTime());
    
    if (this.start.compareTo(this.end) > 0)
        throw new IllegalArgumentException(this.start + "가 " + this.end + "보다 늦다.");
    }
}
```

이렇게 생성자를 작성하면 앞서의 공격은 위협이 되지 않는다. **매개변수의 유효성을 검사하기 전에 방어적 복사본을 만들고, 이 복사본으로 유효성을 검사하는 것에 주목해야 한다.** 순서가 부자연스러워 보이지만 반드시 이렇게 작성해야 한다. 멀티스레딩 환경이라면 원본 객체의 유효성을 검사 후 복사본을 만드는 그 찰나의 취약한 순간에 다른 스레드가 원본 객체를 수정할 수 있기 때문이다.

방어적 복사에 Date의 **clone 메서드를 사용하지 않는 점에도 주목하자.** Date는 final이 아니므로 clone 메서드를 Date가 정의한 것이 아닐 수 있다. clone 메서드가 악의를 가진 하위 클래스의 인스턴스를 반환할 수도 있다. 하위 클래스가 start, end 인스턴스 필드의 참조를 따로 저장해두었다가 다시 접근할 수도 있다. 이런 공격을 막기 위해 **매개변수가 제 3자에 의해 확장될 수 있는 타입이라면 방어적 복사본을 생성시 clone을 사용해서는 안된다.**

아직 Period 인스턴스는 변경이 가능하다. 접근자 메서드가 내부의 가변 정보를 그대로 드러내기 때문이다.

```java
Date start = new Date();
Date end = new Date();
Period p = new Period(start, end);
p.end().setYear(78) // 내부 변경
```

두 번째 공격을 막아내려면 단순히 접근자가 가변 필드의 방어적 복사본을 반환하면 된다.

```java
public Date start() {
    return new Date(start.getTime());
}
public Date end() {
    return new Date(end.getTime());
}
```

새로운 접근자까지 갖추면 Period는 완전한 불변이 된다. 생성자와는 달리 **접근자 메서드에는 방어적 복사에 clone을 사용해도 된다.** Period가 가진 Date 객체는 java.util.Date 임이 확실하기 때문이다.

매개변수를 방어적으로 복사하는 목적이 불변 객체를 만들기 위해서만은 아니다. 메서드든 생성자든 클라이언트가 제공한 **객체의 참조를 보관해야 할 때면 항시 그 객체가 잠재적으로 변경될 수 있는지를 생각해야 한다.** 확신할 수 없다면 복사본을 만들어 저장해야 한다.

내부 객체를 클라이언트에 돌려줄 떄도 방어적 복사본을 만드는 이유도 마찬가지이다. 안심할 수 없다면 방어적 복사를 해야 한다. 길이가 1 이상인 배열은 무조건 가변임을 잊지 말자.

방어적 복사는 성능 저하가 따르고, 또 항상 쓸 수 있는 것도 아니다. 호출자가 컴포넌트 내부를 수정하지 않는다고 확신할 수 있다면 생략할 수 있다.

<br>
## 51. 메서드 시그니처를 신중히 설계하라.

**메서드 이름은 신중히 짓자.** 항상 표준 명명 규칙을 따르고 이해할 수 있으며 같은 패키지에 속한 다른 이름들과 일관되게 지어야 한다.

**편의 메서드를 너무 많이 만들지 말자.** 모든 메서드는 각각 자 자신의 소임을 다해야 한다. 메서드가 너무 많은 클래스는 익히고, 사용하고, 문서화하고 테스트하고 유지보수하기 힘들다.

**매개변수 목록은 짧게 유지하자.** 4개 이하가 좋다. 특히 **같은 타입의 매개변수 여러 개가 연달아 나오는 경우가 특히 해롭다.**

과하게 긴 매개변수 목록을 줄이기 위한 방법은 3가지가 있다.
**여러 메서드로 쪼갠 후 쪼갠 메서드 각각은 원래 매개변수 목록의 부분집합을 받도록 한다.** 메서드가 너무 많아질 수 있지만 **직교성(orthogonality)**를 높여 오히려 메서드 수를 줄여주는 효과도 있다. java.util.List 인터페이스가 그 예이다.

```java
// 리스트에서 특정 범위의 부분 리스트에서 특정 값의 인덱스를 찾는 것은
// 다음과 같이 subList와 indexOf 메서드의 조합으로 가능하다.

List<Integer> valueList = Arrays.asList(1, 2, 3, 4, 5);
valueList.subList(0, 3).indexOf(2);
```

> 소프트웨어 설계 영역에서 직교성이 높다라는 것은 **공통점이 없는 기능들이 잘 분리되어 있다.** 혹은 **기능을 원자적으로 쪼개 제공한다.** 정도로 해석할 수 있다. 위의 subList와 indexOf 메서드는 서로 관련이 없다. 서로 관련없는 기능을 개별 메서드로 제공하면 직교성이 높다고 할 수 있다.

> 직교성이 높다라는 것이 오히려 메서드 수를 줄여주는 효과가 있다는 뜻은 **기본 기능에 충실한 API를 설계해놓으면 아무리 복잡한 기능도 조합하여 구현함으로써 구현해야할 메서드의 개수가 줄어든다는 것이다.** 예를 들어 기본 기능 3개로 조합할 수 있는 기능을 7가지가 된다. 기능을 원자적으로 쪼개다보면 자연스럽게 코드 중복이 줄어들고 결합성이 낮아져 코드를 수정하기 수월해진다. 테스트하기 쉬워짐은 물론이다. 일반적으로 직교성이 높은 설계는 가볍고 구현하기 쉽고 유연하면서 강력하다.

> 그렇다고 너무 쪼개면 안되고 다루는 **개념의 추상화 수준에 맞추어 조절해야 한다.** 특정 조합의 패턴이 자주 사용되거나 최적화하여 성능을 개선할 수 있다면 직교성이 낮아지더라도 편의 기능 하나로 제공하는 편이 나을 수 있다. 직교성은 절대적인 가치라기 보다는 **철학과 원칙을 가지고 일관되게 적용해야 하는 설계 특성이다.**

두 번째로 매개변수를 줄일 수 있는 방법은 **매개변수 여러 개를 묶어주는 도우미 클래스를 만드는 것이다.** 특히 잇따른 매개변수 몇 개를 하나의 독립된 개념으로 볼 수 있을 때 추천한다.

세 번째는 객체 생성 사용에 필요한 **빌더 패턴**을 메서드 호출에 응용하는 것이다. 이 기법은 매개변수가 많은 데 그 중 일부는 생략해도 되는 경우가 있으며 도움이 된다. 모든 매개변수를 하나로 추상화한 객체를 정의하고 클라이언트에서는 setter를 통해 실제 매개변수를 설정 후 호출하도록 하는 것이다.

**매개변수의 타입으로는 클래스보다는 인터페이스가 낫다.** 인터페이스 대신 클래스를 사용하면 클라이언트게 특정 구현체만 사용하도록 강제하는 꼴이 된다.

**boolean 보다는 원소 2개짜리의 열거 타입이 매개변수 타입에 적합하다.** 열거 타입을 사용하면 코드 읽기가 쉬워지고 나중에 선택지를 더 추가할 수도 있다.

<br>
## 52. 다중 정의 (Overloading)은 신중히 사용하라.

```java
public class CollectionClassifier {
    public static String classify(Set<?> s) {
        return "집합";
    }

    public static String classify(List<?> lst) {
        return "리스트";
    }

    public static String classify(Collection<?> c) {
        return "그 외";
    }

    public static void main(String[] args) {
        Collection<?>[] collections = {
                new HashSet<String>(),
                new ArrayList<BigInteger>(),
                new HashMap<String, String>().values()
        };

        for (Collection<?> c : collections)
            System.out.println(classify(c));
    }
}
```

위 코드는 IDE를 사용해봐도 알겠지만, **Collection<?> 타입의 매개변수를 받는 메서드만 호출된다.** 이유는 오버로딩된 메서드를 선택하는 것은 컴파일타임에 정해지기 때문이다. main 메서드 for문의 c는 항상 Collection<?> 타입이다. 런타임에는 달라지겠지만 호출할 메서드를 선택하는 데는 영향을 주지 않는다.

**재정의(Overriding)한 메서드는 동적으로 선택되고, 다중정의(Overloading)한 메서드는 정적으로 선택되므로 주의가 필요하다.** 메서드를 재정의했다면 객체의 런타임 타입이 어떤 메서드를 호출할지의 기준이 된다.

하지만 다중정의한 메서드 사이에서는 객체의 런타임 타입은 전혀 중요하지 않다. 호출할 메서드의 선택은 컴파일 타임에, 오직 매개변수의 컴파일타임 타입에 의해 정해진다. 따라서 다중정의된 API를 사용하는 사용자가 매개변수를 넘기면서 어떤 다중정의된 메서드가 호출될지를 모른다면 프로그램이 오동작하기 쉽다. **다중정의가 혼동을 일으키는 상황은 피해야 한다.**

**안전하고 보수적으로 가려면 매개변수의 수가 같은 다중정의는 만들지말자.** 가변인수를 사용하는 메서드라면 아예 다중정의를 하지말아야 한다. **ObjectOutputStream** 클래스의 경우에는 모든 메서드에 다른 이름을 지어주는 길을 택했다. **writeBoolean(boolean), writeInt(int), writeLong(long)** 같은 식이다.

한편 생성자는 이름을 다르게 지을 수 없으므로 두 번째 생성자부터는 무조건 다중정의가 된다. 하지만 정적 팩터리라는 대안을 활용할 수 있다.

다중정의된 메서드들이 **함수형 인터페이스**를 인수로 받을 떄, 서로 다른 함수형 인터페이스라도 인수 위치가 같으면 혼란이 생길 수 있다. **ExecutorService** 클래스의 submit 메서드가 그 예로, Runnable과 Callable 인터페이스를 다중 정의하여 혼란을 일으킨다.

```java
ExecutorService exec = Executors.newCachedThreadPool();
exec.submit(System.out::println); // 컴파일 에러, Runnable을 받는 메서드를 호출하고자 했지만 Callable를 받는 메서드도 있어 혼란을 일으킨다.
```

<br>

![00.png](/static/assets/img/blog/java/2019-02-25-effective_java_08/00.png)

println은 void를 반환하므로, 반환 값이 있는 Callable과 헷갈릴 리는 없다고 생각할 수도 있지만, 다중정의 메서드를 호출하는 알고리즘은 이렇게 동작하지 않는다. 따라서 메서드를 다중정의할 때 **서로 다른 함수형 인터페이스라도 같은 위치의 인수로 받아서는 안 된다.**

> 기술적으로 말하면 System.out::println은 부정확한 메서드 레퍼런스(inexact method reference)이다. 암시적 타입 람다식이나 부정확한 메서드 레퍼런스 같은 인수 표현식은 목표 타입이 정해지기 전까지는 그 의미가 정해지지 않으므로, 적용성 테스트 때 무시된다.

일반적으로 매개변수 수가 같을 때는 다중정의를 피하는 것이 좋다. 또한 다중정의시 어떤 다중정의 메서드가 호출될지 몰라도 기능은 같아야 한다.

<br>
## 53. 가변인수는 신중히 사용하라.

인수 개수가 일정하지 않은 메서드를 정의해야 한다면 가변인수는 필요하다. 메서드 정의시 필수 매개변수는 가변인수 앞에 두고, 가변인수를 사용할 때는 성능 문제까지 고려해야 한다.

<br>
## 54. null이 아닌 빈 컬렉션이나 배열을 반환하라.

```java
public List<Cheese> getCheeses() {
    return cheesesInStock.isEmpty() ? null : new ArrayList<>(cheeseInStock);
}
```

이런 식으로 null을 리턴하는 메서드를 사용한다면 클라이언트 입장에서는 이 null을 처리하는 코드를 추가로 작성해야 한다. 따라서 이보다는 비어 있는 컬렉션이나 배열로 리턴하는 것이 좋다. 

비어있는 컨테이너를 할당 후 리턴하는 것이 성능저하가 있다고 할 수는 있지만, 신경 쓸 수준이 못 된다. 그렇다하더라도 매번 같은 빈 불변 컬렉션을 반환하면 된다. **Collections.emptyList** 메서드가 그 예다.

<br>
## 55. Optional 반환은 신중히 하라.

자바 8 이전에는 특정 조건에서 값을 반환할 수 없을 때 취할 수 있는 선택지가 두 가지 있었다. 예외를 던지거나, null을 리턴하는 것이다.

두 방법은 모두 헛점이 있는데, **예외는 진짜 예외적인 상황에서만 사용해야 하며 스택 트레이스를 캡쳐하는 비용도 만만치 않다.** null을 반환하면 클라이언트 쪽에서는 별도의 null 처리 코드도 추가해야 한다.

자바 8 이후 **Optional\<T\>**를 통해 반환할 수 있다. 이 클래스는 원소 최대 하나를 가질 수 있는 불변 컬렉션으로서, 보통 T를 반환해야 하지만 특정 조건에서는 반환하지 못할 경우 사용할 수 있다. 이 컬렉션을 반환하는 메서드는 **예외를 던지는 메서드보다 유연하고 사용하기 쉬우며, null을 반환하는 것보다 오류 가능성이 적다.**

```java
public static <E extends Comparable<E>> E max(Collection<E> c) {
    if (c.isEmpty())
        throw new IllegalArgumentException("빈 컬렉션");

    E result = null;
    for (E e : c)
        if (result == null || e.compareTo(result) > 0)
            result = Objects.requireNonNull(e);
    return result;
}
```

위의 메서드는 빈 컬렉션을 건네면 예외를 던진다. 다음은 Optional를 반환하는 메서드이다.

```java
public static <E extends Comparable<E>> Optional<E> max(Collection<E> c) {
    if (c.isEmpty())
        return Optional.empty();
    E result = null;
    for (E e : c)
        if (result == null || e.compareTo(result) > 0)
            result = Objects.requireNonNull(e);
    return Optional.of(result);
}
```

스트림의 종단 연산 중 상당수는 Optional을 반환한다. 따라서 다음과 같이 작성할 수도 있다.

```java
public static <E extends Comparable<E>>
Optional<E> max(Collection<E> c) {
    return c.stream().max(Comparator.naturalOrder());
}
```

이렇게 Optional을 반환하면 사용하는 클라이언트 쪽에서는 적절한 값을 받지 못했을 때의 행동을 쉽게 취할 수 있다.

```java
public static void main(String[] args) {
    List<String> words = Arrays.asList(args);
    System.out.println(max(words));

    // 값이 없을 경우 orElse 메서드를 통해 대신 취할 값을 선택한다.
    String lastWordInLexicon = max(words).orElse("단어 없음...");
    System.out.println(lastWordInLexicon);
}
```

이렇게 Optional은 **Checked 예외와 취지가 비슷하다.** 클라이언트 쪽으로 값이 없을 수도 있다는 점을 알려주고 클라이언트는 반드시 취할 행동을 선택해야 한다.

없다면 다음과 같이 예외를 던지게 할 수도 있다.

```java
// 예와가 아닌 예외 팩터리를 사용한 것이다.
// 예외가 실제로 발생하지 않는 한 예외 생성 비용은 발생하지 않는다.
Toy myToy = max(toys).orElseThrow(Exception::new)
```

만약 **orElse** 메서드로 기본 값을 설정하는 비용이 크다면 **Supplier 인터페이스**를 받는 **orElseGet** 메서드를 사용할 수도 있다.

```java
// 기본 값이 필요없는 경우라도 바로 평가되므로 String 값은 매번 생성된다.
max(words).orElse("단어 없음...");

// 기본 값이 없는 경우에 람다를 호출하여 생성하므로 매번 String 값을 생성하는 비용을 낮출 수 있다.
max(words).orElseGet(() -> "단어 없음...");
```

반환 값으로 Optional을 사용한다고 해서 무조건 득이 되는 것은 아니다. 만약 컬렉션, 스트림, 배열과 같은 컨테이너 타입은 Optional로 감싸면 안된다. **비어 있는 컬렉션을 반환하도록 해야 클라이언트 쪽에서 Optional 처리코드를 넣지 않아도 된다.**

박싱된 기본 타입을 담은 Optional은 기본 타입 자체보다 무거울 수 밖에 없다. 값을 두 겹이나 감싸기 때문이다. 따라서 이를 위해 **OptionalInt, OptionalLong, OptionalDouble**과 같은 클래스도 제공한다. Optional\<Integer\>와 같이 사용할 이유가 없다.

