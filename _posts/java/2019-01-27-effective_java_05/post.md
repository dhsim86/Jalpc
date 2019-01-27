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

그런데 instanceof 연산자는 로 타입과 비한정적 와일드카드 타입에서 똑같이 동작한다. 따라서 비한정적 와일드카드 타입 사용시, 꺽쇠나 물음표는 아무 역할없이 코드를 지저분하게 만드므로 다음과 같은 상황에서는 로 타입을 사용하는 것이 낫다.

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

<br>
### 배열과 제네릭 차이

배열과 제네릭 타입에는 중요한 차이가 두 가지 있다.

첫 번째로는 **배열은 공변(Covariant)이지만, 제네릭은 불공변(Incovariant) 이다.**

```java
public class Super {
    ...
}

public class Sub extends Super {
    ...
}

Super[] arr = new Sub[1];   // 가능. Sub[]은 Super[]의 하위 타입
List<Super> list = new ArrayList<Sub>(); // 불가. List<Super>는 List<Sub>과 관계없음
```

배열 Sub[]은 Super[]의 하위 타입이 되지만 List\<Super\>와 List\<Sub\>은 아무 관계가 없다.

이런 특성으로 인해, 배열을 사용할 때는 문제가 발생할 가능성이 높다.

```java
// 문법적으로는 정상. 그러나 런타임에 실패
Object[] objectArray = new Long[1];
objectArray[0] = "test"; // ArrayStoreException. 단, 컴파일 타임에는 알아챌 수 없다.

// 문법에 맞지 않음.
List<Object>ol = new ArrayList<Long>();
ol.add("test"); // 컴파일 에러
```

어느 쪽이든 Long 용 저장소에 String 값을 넣을 수는 없다. 그러나 **배열은 런타임에 실수를 알게 되지만, 리스트를 사용할 때 컴파일시 바로 알 수 있다는 장점이 있다.**

두 번째로는 **배열은 실체화(reify)된다.**

이 말의 뜻은 **배열은 런타임에도 자신이 담기로 한 원소의 타입을 인지하고 확인한다.** 따라서 위의 코드에서 Long 배열에 String 값을 넣으려하면 예외가 발생한 것이다.

그러나 **제네릭은 타입 정보가 런타임에는 소거(erasure)된다.** 원소 타입은 컴파일 타임에만 검사하며 런타임에는 알 수가 없다는 뜻이다.

> 제네릭에서 런타임때 타입 소거는 제네릭이 도입되기 전에 작성한 코드와 호환성을 위환 것이다.

---

위의 차이로 인해 **배열과 제네릭은 잘 어우러지지 못한다.**

예를 들어 배열은 제네릭 타입, 매개변수화 타입, 타입 매개변수로 사용할 수 없다.

```java
public static class Test<T> {

    private T[] arr;

    public Test() {
        arr = new T[10]; // 문법 오류
    }
}

List<String>[] arr = new ArrayList<String>[1]; // 문법 오류
```

제네릭 배열을 만들지 못하게 막은 이유는 타입 안전하지 않기 때문이다.

이를 허용하면 컴파일러가 자동 생성하는 형변환 코드에서 런타임에 ClassCastException 예외가 발생할 수 있다.

**이는 컴파일타임에 타입 체크하고, 런타임에 ClassCastException 예외 발생을 최대한 방지하여 타입 안전성을 확보하기 위한 제네릭 타입 시스템의 취지에 어긋나는 것이다.**

다음과 같이 제네릭 배열을 허용했을 때의 문제점을 살펴보자.

```java
// 허용한다고 가정
List<String>[] stringLists = new ArrayList<String>[1];

List<Integer> intList = new ArrayList<>();
intList.add(42);

// 배열은 공변이므로 아무 문제없이 넣을 수 있다.
Object[] objects = stringLists;  

// 제네릭은 타입 정보가 소거되므로 성공한다.
// 런타임에는 List<Integer>가 List가 되고, List<Integer>[]는 단순히 List[]가 된다.
// 즉 List[0] = List 와 다름없다.
objects[0] = intList;          

// 여기서 ClassCastException 예외 발생
// 컴파일러는 List에서 꺼낸 원소를 String으로 자동 형변환하려고 하는데,
// Integer가 저장되어 있었으므로 예외가 발생한다.
String s = stringLists[0].get(0);
```

위와 같은 문제를 방지하기 위해 제네릭 배열을 사용할 수 없도록 애초에 막아야 하는 것이다.

정규 타입 매개변수 E, List\<E\>나 List\<String\>와 같은 타입을 **실체화 불가 타입(non-reifiable type)**이라고 한다. **실체화되지 않아 런타임에는 컴파일타임보다 타입 정보를 적게 가지는 타입이다.**

소거 메커니즘으로 인해 매개변수화 타입 가운데 실체화될 수 있는 타입은 List\<?\>와 Map\<?, ?\>과 같은 비한정적 와일드카드 타입뿐이다.

> 배열을 제네릭으로 만들 수 없어 귀찮을 때가 많다. 예를 들어 제네릭 컬렉션에서 자신의 원소 타입을 담은 배열을 반환하는게 보통은 불가능하다.

> 제네릭 타입과 가변인수 메서드를 함께 쓰면 해석하기 어려운 경고 메시지를 받게 된다. 가변인수 메서드를 호출할 때마다 가변인수 매개변수를 담을 배열이 만들어지는데, 배열의 원소가 실체화 불가 타입이면 경고가 발생하는 것이다. 이 문제는 @SafeVarargs 애너테이션으로 대처 가능하다.

배열로 형변환할 때 제네릭 배열 생성 오류나 비검사 형변환 경고가 뜨는 경우, 대부분 배열인 E[] 대신에 컬렉션인 List\<E\>를 사용하면 해결된다.

코드가 조금 복잡해지고 성능이 살짝 나빠질 수 있지만 타입 안전성과 상호 운용성은 좋아진다.

```java
public class Chooser {
    private final Object[] choiceArray;

    public Chooser(Collection choices) {
        choiceArray = choices.toArray();
    }

    public Object choose() {
        Random rnd = ThreadLocalRandom.current();
        return choiceArray[rnd.nextInt(choiceArray.length)];
    }
}
```

컬렉션 안의 원소 중 무작위로 선택하는 Chooser 클래스를 예로 살펴볼 때, 이 클래스를 사용하려면 choose 메서드를 호출할 때마다 클라이언트 쪽에서는 반환된 Object를 원하는 타입으로 반환해야 한다.

이 때 만약 타입이 다른 원소가 있었다면 런타임에 형변환 오류가 날 것이다.

이렇게 배열을 사용하는 대신 아예 제네릭을 사용한다면 타입 안정성을 확보할 수 있을 것이다.

```java
public class Chooser<T> {
    private final List<T> choiceList;

    public Chooser(Collection<T> choices) {
        choiceList = new ArrayList<>(choices);
    }

    public T choose() {
        Random rnd = ThreadLocalRandom.current();
        return choiceList.get(rnd.nextInt(choiceList.size()));
    }
}
```

<br>
## 31. 한정적 와일드카드를 사용해 API 유연성을 높이라.

List\<String\>과 같은 매개변수화 타입은 불공변이다.
즉 서로 다른 타입 Type1과 Type2가 있을 때, List\<Type1\>과 List\<Type2\>는 하위 타입도 상위 타입도 아니다.

다음과 같은 스택을 표현하는 클래스가 있다고 해보자.

```java
public class Stack<E> {
    public Stack();
    public void push(E e);
    public E pop();
    public boolean isEmpty();
}
```

그리고 일련의 원소를 스택에 넣는 메서드를 추가한다고 생각해보자.

```java
public void pushAll(Iterable<E> src) {
    for (E e: src) {
        push(e);
    }
}
```

이 메서드는 잘 컴파일되겠지만 완벽하지가 않다. Iterable src의 원소타입이 스택의 원소타입과 일치한다면 잘 동작할 것이다.

그러나 Stack\<Number\>로 선언하고 pushAll 메서드로 Integer 객체를 넘기면 어떻게 될까? Integer는 Number의 하위 타입이므로 논리적으로 잘 동작해야할 것 같다.

```java
Stack<Number> numberStack = new Stack<>();
Iterable<Integer> integers = ...;
numberStack.pushAll(integers);
```

위와 같이 코드를 작성하면 오류 메시지가 뜬다. 매개변수화 타입이 불공변이기 때문이다.

이를 위해 자바는 **한정적 와일드카드 타입**이라는 특별한 매개변수화 타입을 지원한다. 이를 통해 하위 타입인 원소도 사용할 수 있다.

```java
public void pushAll(Iterable<? extends E> src) {
    for (E e: src) {
        push(e);
    }
}
```

다음은 pushAll의 대척점에 있는 popAll 메서드를 작성해보자.

이 메서드는 Stack안의 모든 원소를 주어진 컬렉션으로 옮겨 담는다.

```java
public void popAll(Collection<E> dst) {
    while (!isEmpty()) {
        dst.add(pop())
    }
}
```

이번에도 주어진 컬렉션의 원소 타입이 스택의 원소 타입과 일치한다면 잘 동작할 것이다.

그러나 컬렉션의 원소 타입이 Object라고 한다면 오류가 발생한다. 이 경우에도 한정적 와일드카드 타입으로 해결할 수 있다. 이를 통해 상위 타입의 원소를 가지는 컬렉션에 넣을 수 있다.

```java
public void popAll(Collection<? super E> dst) {
    while (!isEmpty()) {
        dst.add(pop())
    }
}
```

위의 예에서 알 수 있듯이, 제네릭을 사용할 때 **유연성을 극대화하려면 원소의 생산자나 소비자용 입력 매개변수에 와일드카드 타입을 사용해야 한다.**

어떤 와일드카드 타입을 사용해야 되는지는 **PECS(producer-extends, consumer-super)** 라는 공식을 기억해두면 좋을 것이다.

즉 매개변수 타입 T가 생산자라면 \<? extends T\>를 사용하고, 소비자라면 \<? super T\>를 사용하는 것이다. PECS 공식은 와일드카드 타입을 사용하는 기본 원칙이다.

> 여기서 생산자는 원소를 주는 역할이고, 소비자는 원소를 가져가는 역할이라고 보면 된다.

> 입력 매개변수가 생산자 / 소비자 역할을 동시에 한다면 와일드카드 타입을 써도 좋을 게 없다. 타입을 정확히 지정해야 하는 상황으로 이 때는 와일드카드 타입을 사용하면 안된다.

> 반환 타입에 한정적 와일드카드를 사용해서는 안된다. 유연성을 높여주기는 커녕 클라이언트 쪽에서 와일드카드 타입을 사용해야 되기 때문이다. 제대로 제네릭을 사용했다면 사용자는 와일드카드 타입이 쓰였다는 사실을 의식하지 못하겠지만, 와일드카드 타입을 신경써야 한다면 그 API에 문제가 있을 가능성이 크다.

와일드카드 타입을 사용함으로써, **받아들여 할 매개변수는 받고 거절해야 할 매개변수는 거절하는 작업이 자동으로 이루어진다.** 

---

타입 매개변수와 와일드카드에는 공통되는 부분이 많아 둘 중 어느 것을 사용해도 괜찮을 때가 많다.

예를 들어 주어진 리스트에서 명시한 두 인덱스의 아이템을 교환하는 정적 메서드를 다음과 같이 정의해보자. 

```java
public static <E> void swap(List<E> list, int i, int j);
public static void swap(List<?> list, int i, int j);
```

이 경우에 어떤 선언이 더 나을까? public API라면 간단한 두 번째가 낫다. 어떠한 리스트든 이 메서드에 넘기면 명시한 인덱스의 원소를 교환해줄 것이다.

**기본 원칙은 메서드 선언에 타입 매개변수가 한 번만 나오면 와일드 카드로 대체하는 것이다.**

비한정적 타입 매개변수라면 비한정적 와일드카드로 바꾸고, 한정적 타입 매개변수라면 한정적 와일드카드로 변경하면 된다. 그런데 두 번째 swap 메서드는 문제가 하나 있는데 다음과 같이 구현했을 때 컴파일이 안된다는 것이다.

```java
public static void swap(List<?> list, int i, int j) {
    list.set(i, list.set(j, list.get(i)));
}
```

원인은 List\<?\>에는 null 값외에는 어떠한 값도 넣을 수 없다는 데 있다. 이 문제를 해결하기 위한 간단한 방법은 private 도우미 메서드를 통해 구현하는 것이다. 실제 타입을 알아내려면 도우미 메서드는 제네릭 메서드여야 한다.

```java
public static void swap(List<?> list, int i, int j) {
    swapHelper(list, i, j);
}

private static<E> void swapHelper(List<E> list, int i, int j) {
    list.set(i, list.set(j, list.get(i)));
}
```

이렇게 도우미 메서드는 원소의 타입이 E인 것을 알고 있으므로 문제가 없고, 클라이언트 입장에서는 public인 swap 메서드가 비한정적 와일드카드를 사용하고 있으니 어떤 타입의 리스트든 넘길 수 있다는 것을 알 수 있다.

> 위의 예에서 도우미 메서드는 public API로 사용하기에 부적절한 첫 번째 swap 메서드와 시그니처가 같다.

<br>
## 32. 제네릭과 가변인수를 함께 쓸 때는 신중하라.

가변인수 메서드와 제네릭은 서로 어울리지 않다.

**실체화 불가 타입인 제네릭이나 매개변수화 타입은 런타임에는 컴파일타임보다 타입 관련 정보를 적게 담고 있다.**

먼저 메서드를 선언할 때 실체화 불가 타입으로 가변 매개변수를 선언하면 컴파일러가 경고를 보낸다. 제네릭이나 매개변수화 타입을 담고 있는 배열이 생성되기 때문이다. 가변인수 메서드를 호출할 때도 넘겨지는 변수가 실체화 불가 타입으로 추론되면 경고를 보낸다.

그렇다면 왜 다음과 같이 직접 제네릭 배열을 생성하는 것은 금지하면서도, 가변인수를 제네릭으로 선언하는 것은 허용하는 것일까?

```java
List<String>[] stringLists = new ArrayList<String>[1]; // 컴파일 오류

// 문제 없음
public <T> void genericVargsMethod(T... List) {
    ...
}
```

그 이유는 제네릭이나 매개변수화 타입의 가변 매개변수를 받는 메서드가 실무에서 매우 유용하기 때문이다. 사실 자바 라이브러리도 이런 메서드를 여럿 제공하고 있다.

* Arrays.asList(T... a)
* Collections.addAll(Collection\<? super T\> c, T... elements)

그러나 이렇게 제네릭으로 가변 매개변수를 선언할 때 컴파일 경고가 발생하므로, 자바 7 전에는 이 경고를 없애기 위해 @SuppressWarning 애너테이션을 통해 제거해야만 했다.

자바 7에서는 **@SafeVarargs** 애너테이션이 추가되어 제네릭 가변인수 메서드 작성자가 클라이언트 측에서 발생하는 경고를 숨길 수 있게 되었다.

**@SafeVarargs 애너테이션은 메서드 작성자가 그 메서드가 타입 안전함을 보장하는 장치이다.** 따라서 메서드가 안전한게 확실하지 않다면 애너테이션을 달아서는 안된다.

가변인수 메서드를 호출할 때 그 메서드가 타입 안전한지는 메서드가 안에서 가변인수 배열에 대해 건드리지 않고 그 배열의 참조를 밖으로 노출하지 않는다면 타입 안전하다고 할 수 있다.

즉, 가변 매개변수 배열이 호출자로부터 그 메서드로 **순수하게 인수들을 전달하는 역할만 한다면 그 메서드는 타입 안전하다.**

만약 다음과 같이 가변 매개변수를 받는 메서드가 외부로 가변 매개변수 배열 참조를 외부로 노출하면 타입 안전성이 깨지게 된다.

```java
// 컴파일 타임에 반환되는 배열의 타입이 결정
// 컴파일 시점에 컴파일러로 충분한 정보가 주어지지 않아 타입을 잘못 판단할 수 있다.
// 따라서 그대로 반환시 힙 오염이 이 메서드를 호출한 쪽의 콜 스택까지 전이할 수 있다.
static <T> T[] toArray(T... args) {
    return args;
}

// 이 메서드를 본 컴파일러는 toArray 메서드에 넘길 가변 매개변수를 담을 배열을 만드는 코드를 생성한다.
// 이 때, 이 배열의 타입은 Object[] 인데, pickTwo에 어떤 타입의 객체를 넘기더라도
// 담을 수 있는 가장 구체적인 타입이기 떄문이다.
static <T> T[] pickTwo(T a, T b, T c) {
    switch(ThreadLocalRandom.current().nextInt(3)) {
        case 0: return toArray(a, b);
        case 1: return toArray(a, c);
        case 2: return toArray(b, c);
    }
    throw new AssertionError();
}

// ClassCastException 예외 발생
// pickTwo는 Object[] 타입의 배열을 리턴하게 된다.
// 컴파일러는 pickTwo의 반환 값을 attributes에 저장하기 위해
// String[] 으로 변환하는 코드를 컴파일러가 자동 생성한다.
// Object[]는 String[]의 하위 타입이 아니므로 이 형변환은 실패한다.
String[] attributes = pickTwo("Test1", "Test2", "Test3");
```

위의 예는 **제네릭 가변 매개변수 배열에 다른 메서드가 접근하도록 허용하면 안전하지 않다**라는 예시이다. 단, 이에 대한 예외는 두 가지가 있다.

첫 번째로는 @SafeVarargs 애너테이션이 달린, 또 다른 가변 매개변수를 받는 메서드에 넘기는 것은 안전하다. (@SafeVarargs 애너테이션을 사용한다는 것은 타입 안전하다는 것을 보장한다는 의미이다.)

두 번째는 그저 이 배열의 일부를 일반 메서드에 넘기는 것도 안전하다.

다음이 제네릭 가변 매개변수를 안전하게 사용하는 예이다.

```java
@SafeVarargs
static <T> List<T> flatten(List<? extends T>... lists) {
    List<T> results = new ArrayList<>();
    for (List<? extends T> list: lists) {
        result.addAll(list);
    }
    return result;
}
```

@SafeVarargs 애너테이션을 사용해야 할 때 정하는 규칙은 간단하다. **제네릭이나 매개변수화 타입의 가변 매개변수를 받는 모든 메서드에는 @SafeVarargs 애너테이션을 단다.** 그래야 사용자를 헷갈리게 하는 컴파일러 경고를 없앨 수 있다. **이 말은 안전하지 않은 메서드는 절대 작성해서는 안 된다는 뜻이기도 하다.**

만약 타입 안전하지 않은 가변 매개변수를 받는 메서드가 있으면 다음과 같이 수정해야 된다.

* 가변 매개변수 배열을 건드는 코드가 있다면, 아무것도 저장하지 않고 건들지 않도록 수정한다.
* 그 배열의 참조 또는 복제복을 신뢰할 수 없는 외부로 노출시키지 않는다.

> @SafeVarargs 애너테이션은 재정의할 수 없는 메서드에만 달아야 한다. 재정의한 메서드도 안전할지는 보장할 수 없기 때문이다.

사실 @SafeVarargs 애너테이션만이 유일한 정답은 아니다.

다음과 같이 제네릭만을 사용해, 사용자 쪽에서는 임의 개수의 매개변수를 넘길 수도 있다.

```java
static <T> List<T> flatten(List<List<? extends T>> lists) {
    List<T> result = new ArrayList<>();
    for (List<? extends T> list: lists) {
        result.addAll(list);
    }
    return result;
}

// 정적 팩터리 메서드인 List.of를 활용해 임의 개수의 매개변수를 넘길 수 있다.
List<String> flattenList = flatten(List.of(friends, romans, countrymen));
```

위 방식의 장점은 컴파일러가 이 메서드의 타입 안전성을 검증할 수 있는데에 있다.

