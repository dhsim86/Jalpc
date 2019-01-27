---
layout: post
title:  "Effective Java 05 - 제네릭"
date:   2019-01-27
desc:  "Effective Java 05 - 제네릭"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# 제네릭

<br>
## 26. 로 타입 (Raw Type)은 사용하지 말라.

클래스와 인터페이스 선언에 **타입 매개변수**가 쓰이면 이를 **제네릭 클래스** 혹은 **제네릭 인터페이스**라고 한다.

위와 같이 List 제네릭 인터페이스는 **타입 매개변수 E**를 받는다. 제네릭 클래스와 제네릭 인터페이스를 **제네릭 타입**이라고 한다.

각각의 제네릭 타입은 일련의 **매개변수화 타입**을 정의한다.
다음과 같이 클래스 혹은 인터페이스 이름이 나오고, 꺽쇠괄호 안에 실제 타입 매개변수들을 나열한다.

제네릭 타입에서 타입 매개변수를 전혀 사용하지 않는 것은 **로 타입**이라고 한다.

```java
// List: 제네릭 인터페이스
// E: 타입 매개변수
public interface List<E> extends Collection<E> {
    ...
}
// List<String>: 매개변수화 타입
List<String> strings = new ArrayList<>();

// List: 로 타입 (raw type)
List list = strings;
```

> 로 타입은 타입 선언에서 제네릭 타입 정보가 전부 지워진 것처럼 동작하는데, 제네릭이 도입되기 전의 코드와 호환성을 맞추도록 하기 위해 사용된다.

다음과 같이 로 타입을 사용하면, 컴파일 오류가 없이 컴파일되고 실행된다.

```java
private final Collection stamps = ...;
stamps.add(new Coin(...)); // 컴파일 에러 X

for (Iterator i = stamps.iterator(); i.hasNext(); ) {
    Stamp stamp = (Stamp)i.next(); // ClassCastException
    stamp.cancel();
}
```

**오류는 가능한 발생 즉시, 이상적으로는 컴파일할 때 발견하는 것이 좋다.** 
위의 예에서는 런타임에서 확인할 수 있는데 이렇게 되면 **런타임에 문제를 겪는 코드와 원인을 제공한 코드가 물리적으로 상당히 떨어져 있을 가능성이 커진다.**

예외 발생시 stamps에 잘못된 값을 넣은 지점을 찾기 위해 코드 전체를 확인해야 될 수 있다.

제네릭을 활용하면 이 정보가 타입 선언 자체에 녹아든다.

```java
private final Collection<Stamp> stamps = ...;
```

위와 같이 선언하면 컴파일러는 stamps에 Stamp의 인스턴스만을 넣어야 한다는 것을 인지하게 된다.
따라서 아무 경고없이 컴파일된다면 의도대로 동작할 것임을 보장한다.

로 타입(타입 매개변수가 없는 제네릭 타입)을 쓰는 것은 언어 차원에서 막지는 않았지만 사용해서는 안된다.
**로 타입을 쓰면 제네릭이 안겨주는 안정성과 표현력을 모두 잃게 된다.**

List와 같은 로 타입은 사용해서는 안되나, List\<Object\> 처럼 임의 객체를 허용하는 매개변수화 타입은 괜찮다.
로 타입인 List와 매개변수화 타입인 List\<Object\>의 차이는, List는 제네릭 타입에서 완전히 발을 뺀 것이고, List\<Object\>는 모든 타입을 허용한다는 의사를 컴파일러에 명확히 전달한 것이다.

매개변수로 List를 받는 메서드에는 List\<String\>을 전달할 수 있지만, List\<Object\>를 받는 메서드에는 전달할 수 없다. List\<String\>은 List의 하위 타입이지만, List\<Object\>의 하위 타입은 아니다. 따라서 **List\<Object\>를 사용할 때와는 달리 List 같은 로 타입을 사용하면 타입 안전성을 잃게 된다.**

```java
public class Raw {
    public static void main(String[] args) {
        List<String> strings = new ArrayList<>();
        unsafeAdd(strings, Integer.valueOf(42));
        String s = strings.get(0); // ClassCastException
    }

    private static void unsafeAdd(List list, Object o) {
        list.add(o);
    }
}
```

이 코드를 그대로 실행하면, 예외가 발생한다. Integer를 String으로 변환하려 시도한 것이다.
문제는 List와 같은 로 타입을 사용함으로써 컴파일 타임이 아닌, 런 타임에 이 오류를 인지할 수 있다는 것이다.

이번에는 2개의 집합(Set)을 받아 공통 원소를 반환하는 메서드를 작성한다고 해보자.

```java
static int numElementsInCommon(Set s1, Set s2) {
    int result = 0;
    for (Object o1: s1) {
        if (s2.contains(o1)) {
            result++;
        }
    }
    return result;
}
```

위의 메서드는 동작은 하지만, 로 타입을 사용하여 안전하지 않다. 
원소의 타입과는 상관없는 메서드를 작성할 때는 **안전하지 않은 로 타입보다는 비한정적 와일드카드 타입을 사용해야 한다.**

```java
static int numElementsInCommon(Set s1<?>, Set<?> s2)
```

Set과 Set\<?\>의 차이점은 Set과 같은 로 타입 컬렉션에는 아무 원소나 넣을 수 있어, 불변식을 훼손하기 쉽지만 Set\<?\>과 같은 비한정적 와일드카드 타입을 사용한 경우 null 이외에 어떤 원소도 넣을 수 없다.

<br>
### 몇 가지 예외사항

로 타입을 사용하지 말라는 규칙에는 몇 가지 예외가 있다.

**class 리터럴에는 로 타입을 써야 한다.** 자바 명세에서는 class 리터럴에 매개변수화 타입을 사용하지 못하도록 하였다.

```java
List.class
String[].class
int.class

List<String>.class // X
List<?>.class   // X
```

두 번째로는 instanceof 연산자와 관련이 있는데, **런타임에는 제네릭 타입 정보가 지워지므로 instanceof 연산자는 비한정적 와일드카드 타입 이외의 매개변수화 타입에는 적용할 수 없다.**

그런데 instanceof 연산자는 로 타입과 비한정적 와일드카 드타입에서 똑같이 동작한다. 따라서 비한정적 와일드카드 타입 사용시, 꺽쇠나 물음표는 아무 역할없이 코드를 지저분하게 만드므로 다음과 같은 상황에서는 로 타입을 사용하는 것이 낫다.

```java
if (o instanceof Set) { // instanceof 연산자 사용시에는 로 타입 사용
    Set<?> s = (Set<?>) o;  // 실제 사용시에는 로 타입이 아닌 비한정적 와일드카드 타입 사용
    ...
}
```

<br>
## 27. 비검사 경고 (unchecked warning)를 제거하라.

제네릭을 사용하기 시작하면 수 많은 컴파일러 경고를 받게 된다.
제네릭에 익숙해질수록 마주치는 경고 수는 줄겠지만 **경고를 무시해서는 안된다.**

대부분의 비검사 경고는 쉽게 제거할 수 있다.
다음과 같이 코드 작성시, unchecked conversion 경고가 발생할 것이다.

```java
Set<Lark> exaltation = new HashSet();
```

자바 7부터 지원하는 다이아몬드 연산자를 통해 해당 경고는 쉽게 제거할 수 있다. 그러면 컴파일러는 올바른 실제 타입 매개변수 Lark를 추론한다.

```java
Set<Lark> exaltation = new HashSet<>();
```

제거하기 어려운 경고도 많지만, **할 수 있는 한 모든 비검사 경고 (unchecked) 경고를 제거하는 것이 좋다.**

모두 제거한다면 그 코드의 타입 안전성은 확실히 보장된다. 즉 런타임에는 ClassCastException이 발생할 일이 없고 의도대로 잘 동작하리라 확신할 수 있다.

<br>
### @SuppressWarnings("unchecked")

**경고를 제거할 수는 없지만 타입 안전하다고 확신할 수 있다면 @SuppressWarnings 애너테이션을 통해 경고를 숨기도록 한다.**

타입 안전성을 검증하지 않은 채 경고를 숨긴다면 예외가 발생할 수 있으니 피해야 되지만, 그렇다고 안전하다고 검증된 코드에 대해 **경고를 숨기지 않고 그대로 두면 진짜 문제를 알리는 새로운 경고가 발생하더라도 눈치채지 못할 수 있다.**

@SuppressWarning 애너테이션은 개별 지역변수부터 클래스 전체까지 어떤 선언에도 달 수 있다. 하지만 **@SuppressWarning 애너테이션 사용시, 항상 가능한 한 좁은 범위에 적용하도록 한다.** 그래야 심각한 경고를 놓치지 않을 수 있다.

만약 한 줄이 넘는 메서드나 생성자에 달린 @SuppressWarning 애너테이션을 발견하면 가급적 지역변수 선언 쪽으로 옮기는 것이 좋다. 지역변수를 새로 선언하는 수고를 해야할 수 있으나, 그만한 값어치가 있다.

```java
public <T> T[] toArray(T[] a) {
    if (a.length < size)
        return (T[]) Arrays.copyOf(elements, size, a.getClass()); // unchecked cast warning
    System.arraycopy(elements, 0, a, 0, size);
    if (a.length > size)
        a[size] = null;
    return a;
}
```

위의 코드를 컴파일하면 주석이 달린 줄에서 경고가 발생할 것이다.

만약 이 코드의 타입 안전성이 확실하다고 검증된다면 @SuppressWarning 애너테이션를 사용해야 할텐데, 메소드 전체에 적용하는 것보다는 가능한 범위를 좁히는 것이 좋다.

그런데 애너테이션은 선언에만 달 수 있으므로 위 코드의 주석이 달린 줄에 바로 애너테이션을 달 수는 없다.

따라서 다음과 같이 반환 값을 담을 지역변수를 하나 선언하고 그 변수에 애너테이션을 다는 것이다. 지역변수가 선언되기는 했지만 비검사 경고를 무시하는 범위를 최대한 좁힐 수 있다.

```java
public <T> T[] toArray(T[] a) {
    if (a.length < size) {
        @SuppressWarnings("unchecked") T[] result =
            (T[]) Arrays.copyOf(elements, size, a.getClass());
        return result;
    }
    System.arraycopy(elements, 0, a, 0, size);
    if (a.length > size)
        a[size] = null;
    return a;
}
```

**@SuppressWarning 애너테이션을 사용할 때는, 그 경고를 무시해도 되는 이유를 항상 주석으로 남겨야 한다.** 그래야 다른 사람이 코드를 이해하는 데 도움이 되며, 다른 사람이 그 코드를 잘못 수정하여 타입 안전성을 잃는 상황을 줄일 수 있다.

<br>
## 28. 배열보다는 리스트를 사용하라.

배열과 제네릭 타입에는 중요한 차이가 두 가지 있다.

첫 번째로는 **배열은 공변(Covariant)이지만, 제네력은 불공변(Incovariant) 이다.**

```java
public class Super {
    ...
}

public Sub extends Super {
    ...
}

Super[] arr = new Sub[1];   // 가능. Sub[]은 Super[]의 하위 타입
List<Super> list = new ArrayList<Sub>(); // 불가. List<Super>는 List<Sub>과 관계없음
```

배열 Sub[]은 Super[]의 하위 타입이 되지만 List\<Super\>와 List\<Sub\>은 아무 관계가 없다.

이런 특성으로 인해, 배열을 사용할 때는 문제가 발생할 가능성이 높다.

```java
Object[] objectArray = new Long[1];
objectArray[0] = "test"; // ArrayStoreException. 단, 컴파일 타임에는 알아챌 수 없다.

List<Object>ol = new ArrayList<Long>();
ol.add("test"); // 컴파일 에러
```

어느 쪽이든 Long 용 저장소에 String 값을 넣을 수는 없다.
그러나 **배열은 런타임에 실수를 알게 되지만, 리스트를 사용할 때 컴파일시 바로 알 수 있다는 장점이 있다.**

