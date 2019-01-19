---
layout: post
title:  "Effective Java 03 - 모든 객체의 공통 메서드"
date:   2019-01-14
desc:  "Effective Java 03 - 모든 객체의 공통 메서드"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# 모든 객체의 공통 메서드

자바의 Object 클래스는 상속해서 사용할 수 있는 여러 메서드들이 있다.

Object에서 final이 아닌 메서드 (equals, hashCode, toString, clone, finalize)는 모두 오버라이드를 염두에 두고 설계되어 있고, **재정의시 지켜야 하는 일반 규약이 정의되어 있다.**
따라서 Object를 상속하는 클래스, 즉 자바의 모든 클래스들은 이 메서드들을 일반 규약에 맞게 재정의해야 한다.

<br>
## 10. equals는 일반 규약을 지켜 재정의하라.

equals 메서드는 재정의하기가 쉬워보이지만, 곳곳에 함정이 있어 잘못 재정의하면 의도치 않은 결과를 초래한다.

가장 쉬운 것은 되도록이면 아예 재정의하지 않는 것이다.

> equals 메서드를 재정의하지 않으면 그 클래스의 인스턴스는 오직 자기 자신만 (참조값 비교) 같게 된다.

다음 상황 중 하나이면 재정의하지 않는 것이 좋다.

1. 각 인스턴스가 본질적으로 고유하다.
    - 값을 표현하는 것이 아닌 동작하는 개체를 표현하는 클래스 (ex. Thread 클래스)
2. 인스턴스의 **논리적 동치성 (logical equality)**를 검사할 일이 없다.
3. 상위 클래스에서 재정의한 equals가 하위 클래스에도 들어맞다.
    - 예를 들면 Set 구현체는 AbstractSet이 구현한 equals를 상속받아 사용한다.
4. 클래스가 private이거나 package-private이고, equals 메서드를 호출할 일이 없다.

---

equals를 재정의해야 하는 경우는 **객체 식별성 (object identity)가 아니라 논리적 동치성을 확인해야 될 때인데, 상위 클래스의 equals 메서드가 논리적 동치성을 지원하도록 재정의하지 않았을 경우이다.**

주로 값을 표현하는 클래스인 경우로, Integer나 String이 대표적이다. 

> 값을 표현하는 클래스이지만, 같은 값을 가지는 인스턴스가 둘 이상 만들어지지 않을 보장한다면 equals를 재정의하지 않아도 된다. 이런 클래스는 어차피 논리적 동치성과 객체 식별성이 사실상 같다.

equals 메서드를 재정의하는 경우, 반드시 다음 일반 규약을 따라야 한다.

**equals 메서드는 동치관계를 구현하며, 다음을 만족한다.**
* 반사성(reflexivity): null이 아닌 모든 참조 값 x에 대해, x.equals(x)는 true이다.
* 대칭성(symmetry): null이 아닌 모든 참조 값 x, y에 대해, x.equals(y)가 true이면 y.equals(x)도 true이다.
* 추이성(transitivity): null이 아닌 모든 참조 값 x, y, z에 대해, x.equals(y)가 true이고 y.equals(z)도 true면 x.equals(z)도 true이다.
* 일관성(consistency): null이 아닌 모든 참조 값 x, y에 대해 x.equals(y)를 반복해서 호출하면 항상 true를 반환하거나 항상 false를 반환해야 한다.
* null-아님: null이 아닌 모든 참조 값 x에 대해, x.equals(null)은 false이다.

> 위의 규약을 어기게 되면 프로그램이 오동작하거나 디버깅하기가 매우 힘들어진다. 특히 컬렉션 클래스들을 포함하는 많은 클래스들은 다루는 객체가 equals 규약을 지킨다고 가정하고 동작한다.
 
<br>
### 반사성

객체는 자기 자신과 같아야 한다는 뜻이다.
이 요건을 어기게 되면 클래스 인스턴스를 컬렉션에 넣은 다음, contains 메서드를 호출하면 방금 넣은 인스턴스가 없다고 답할 것이다.

<br>
### 대칭성

두 객체는 서로에 대한 동치 여부를 똑같이 답해야 한다는 것이다.

<br>
### 추이성

첫 번째 객체와 두 번째 객체가 같고 두 번째 객체가 세 번째 객체와 같다면, 첫 번째 객체와 세 번째 객체도 같아야 한다는 뜻이다.

```java
public class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point)) {
            return false;
        }
        Point p = (Point)o;
        return p.x ==  x && p.y == y;
    }
}

public class ColorPoint extends Point {
    private final Color color;

    public ColorPoint(int x, int y, Color color) {
        super(x, y);
        this.color = color
    }
}
```

위와 같은 클래스가 있을 때, ColorPoint의 equals 메서드를 구현하지 않으면 색상 정보는 무시하고 비교를 수행한다.

따라서 equals 메서드를 오버라이딩하긴 해야 되는데, 다음과 같이 구현한 equals 메서드를 보자.

```java
@Override
public Boolean equals(Object o) {
    if (!(o instanceof ColorPoint)) {
        return false;
    }
    return super.equals(o) && ((ColorPoint)o).color == color;
}
```

위와 같이 구현하면 Point를 ColorPoint에 비교한 결과와 그 둘을 바꾸어 비교한 결과가 다를 수 있다.
Point의 equals는 색상을 무시하고, ColorPoint의 경우는 입력 매개변수가 자신의 종류와 다르다며 매번 false를 리턴한다.

```java
Point p = new Point(1, 2);
ColorPoint cp = new ColorPoint(1, 2, Color.RED);

p.equals(cp); // true
cp.equals(p); // false
```

따라서 이를 개선하기 위해 다음과 같이 바꾸면 어떻게 될까?
ColorPoint.equals 에서 Point와 비교할 때는 색상을 무시하는 것이다.

```java
@Override 
public boolean equals(Object o) {
    if (!(o instanceof Point))
        return false;
        
    // o가 일반 Point면 색상을 무시하고 비교한다.
    if (!(o instanceof ColorPoint))
        return o.equals(this); // 형재 클래스라면 무한 재귀 위험
    // o가 ColorPoint면 색상까지 비교한다.
    return super.equals(o) && ((ColorPoint) o).color == color;
}

ColorPoint p1 = new ColorPoint(1, 2, Color.RED);
Point p2 = new Point(1, 2);
ColorPoint p3 = new ColorPoint(1, 2, Color.BLUE);

p1.equals(p2); // true
p2.equals(p3); // true
p1.equals(p3); // false, p1 == p2, p2 == p3이므로 p1 == p2여야 한다.
```

이 equals 메서드는 대칭성은 만족하지만, 추이성을 깨버린다.
또한, Point를 상속받는 다른 하위 클래스가 있고 그 클래스의 인스턴스와 ColorPoint를 같은 방식으로 구현된 equals로 비교하면 무한 재귀에 빠질 수도 있다.

이는 객체 지향 언어의 동치 관계애서 나타나는 근본적인 문제로, **구체 클래스를 확장하여 새로운 값을 추가하면서 equals 규약을 만족시킬 수 있는 방법은 존재하지 않는다.**

그래서 이 때문에 다음과 같이 Point 클래스에서, getClass 메서드를 사용해서 같은 클래스의 오브젝트인 경우에만 동치 비교를 하게 되면 **리스코프 치환 원칙**을 깨버리게 된다.

```java
@Override
public boolean equals(Object o) {
    if (o == null || o.getClass() != getClass()) {
        return false;
    }
    Point p = (Point o)o;
    return p.x == x && p.y == y;
}
```

Point와 ColorPoint를 비교할 때는 ColorPoint도 엄연히 Point이므로 비교가 가능해야 한다

> 리스코프 치환 원칙에 따르면, 어떤 타입에 있어 중요한 속성이라면 그 하위 타입에서도 마찬가지로 중요하다. 따라서 그 타입의 모든 메서드는 하위 타입에서도 동일하게 잘 동작해야 한다.

하위 클래스에서 값을 추가하는 우회적인 방법은 상속 대신 컴포지션을 사용하는 것이 있다.

```java
public class ColorPoint {
    private final Point point;
    private final Color color;

    public ColorPoint(int x, int y, Color color) {
        point = new Point(x, y);
        this.color = Objects.requireNonNull(color);
    }

    /**
     * 이 ColorPoint의 Point 뷰를 반환한다.
     */
    public Point asPoint() {
        return point;
    }

    @Override 
    public boolean equals(Object o) {
        if (!(o instanceof ColorPoint))
            return false;
        ColorPoint cp = (ColorPoint) o;
        return cp.point.equals(point) && cp.color.equals(color);
    }
}
```

> 추상 클래스의 하위 클래스라면 equals 규약을 지키면서도 값을 추가할 수 있다.

<br>
### 일관성

두 객체가 같다면, 앞으로도 영원히 같아야 한다는 뜻이다.
만약 불변 객체를 만든다면 equals로 한 번 같다고 한 객체는 계속 같아야 한다.

특히, equals를 구현함에 있어서 외부적인 요인으로 인해 변할 수 있는 값을 포함하여 비교해서는 안된다. 
대표적으로 java.net.URL의 equals로, 주어진 URL과 매핑된 호스트 IP를 이용해 비교하는데, 그 IP 주소가 매번 같다고 할 수 없다.

따라서 equals는 항상 메모리 상에 존재하는 객체만을 사용하는 결정적(deterministic) 계산만 수행해야 한다.

<br>
### null-아님

모든 객체는 null과 같으면 안된다는 뜻이다. NullPointerException과 같은 예외도 던지면 안된다.
예를 들어 instanceof 연산자는 null과 비교해도 false를 리턴한다.

<br>
### equals 구현 방식

1. == 연산자를 통해 입력이 자기 자신의 참조인지 확인
    - 단순한 성능 향상을 위한 것이다.
2. instanceof 연산자로 올바른 타입인지 확인
    - 그렇지 않다면 false
    - 만약 부모 인터페이스가 자기 자신을 구현한 다른 클래스들끼리도 비교할 수 있도록 equals 규약을 수정하였다면 해당 인터페이스의 equals를 사용해야 한다.
3. 입력을 올바른 타입으로 형변환한다.
4. 입력 객체와 자기 자신의 대응되는 핵심 필드들이 모두 일치하는지 하나씩 검사한다.

> null이 정상적인 값으로 간주하는 필드가 있을 경우, 이런 필드는 Object.equals 정적 메서드를 통해 NullPointerException을 방지하도록 한다.

> equals를 구현할 때는 가급적 서로 다른 경우가 많거나 비교 비용이 싼 필드부터 검사하는 것이 좋다.

> equals를 재정의하면 반드시 hashCode 메서드도 재정의해야 한다.

<br>
## 11. equals를 재정의하려거든 hashCode도 재정의하라.

equals 메서드를 재정의하면 hashCode 메서드도 재정의해야 한다.
재정의하지 않으면 hashCode의 일반 규약을 어기게 되어 컬렉션의 원소로 사용될 때 문제를 일으키게 된다.

* equals 비교에 사용되는 정보가 변경되지 않았다면, 그 객체의 hashCode 메서드는 몇 번을 호출해도 같은 값을 반환해야 한다.
  * 단, 애플리케이션 재시작할 때는 이 값이 달라져도 된다.
* equals가 두 객체를 같다고 판단하면 두 객체의 hashCode도 같은 값을 반환해야 한다.
* equals가 두 객체를 다르다고 판단하더라도, hashCode가 서로 다른 값을 반환할 필요는 없다.
  * 하지만 다른 객체에 대해서 다른 값을 반환하도록 해야 해시테이블의 성능이 좋아진다.

즉, **논리적으로 같은 객체는 같은 해시코드를 반환해야 한다.**

hashCode 메서드를 구현할 때는 서로 다른 인스턴스에 대해서는 다른 해시코드를 반환하도록 구현하는 것이 좋다. 이를 통해 hashMap과 같이 내부에 해시 테이블을 사용하는 컬렉션을 사용시 성능 향상을 꾀할 수 있다.

> 이상적인 해시 함수는 주어진 서로 다른 인스턴스들에 대한 해시코드 값이 32비트 정수 범위내에 균일하게 분배되도록 해야한다.

다음은 일반적인 좋은 hashCode를 구현하는 간단한 방법이다.

1. int 변수 result를 선언 후, 값 c로 초기화한다.
    - 이 때 c는 2.a의 방식으로 계산된 첫 번째 핵심필드의 해시코드 값이다.
2. 나머지 필드들에 대해 다음 작업을 수행한다.
    - a: 해당 필드의 해시코드 c를 계산한다.
        - 기본 타입 필드: Type.hashCode를 통해 계산
        - 참조 타입 필드: equals 메서드가 이 필드 클래스의 equals를 재귀적으로 호출하면, hashCode 메서드를 재귀적으로 호출한다. 필드 값이 null이면 0을 사용한다.
        - 배열: 핵심 원소들에 대해 별도 필드처럼 다룬다. 핵심 원소가 없다면 0을 사용하고, 모든 원소가 핵심 필드라면 Arrays.hashCode를 사용한다.
    - b: a 단계에서 계산한 해시코드 c로 result를 갱신한다. -> result = 31 * result + c;
3. result를 반환한다.

```java
@Override
public int hashCode() {
    int result = Short.hashCode(areaCode);
    result = 31 * result + Short.hashCode(prefix);
    result = 31 * result + Short.hashCode(lineNum);
    return result;
}
```

> equals 비교에 사용되지 않는 필드는 hashCode 대상에서 반드시 제외해야 한다.

> 31 * result 는 해시 효과를 높여주는 효과가 있다.

Object 클래스는 임의의 개수만큼 객체를 받아, 해시코드를 계산해주는 hash 정적 메서드를 제공해준다.
앞의 요령대로 구현하는 코드와 비슷한 수준의 hashCode 함수를 단 한 줄로 작성할 수 있지만, 속도는 더 느리다. 입력 인수를 담기 위해 배열이 생성되고, 인수 중에 기본 타입이 있다면 박싱과 언박싱도 거치기 때문이다.

```java
@Override
public int hashCode() {
    return Objects.hash(lineNum, prefix, areaCode);
}
```

> 어떤 타입의 객체의 해시코드를 계산하는 비용이 크고, 주로 해시의 키로 사용될만 하다면, 인스턴스 생성시 해시코드를 계산해두고, hashCode 호출될 때 캐싱된 값을 리턴하는 것도 고려할만 하다.

> 해시코드 계산의 성능을 높인다고 핵심 필드를 생략하는 일은 없어야 한다. 해시 품질이 나빠져 해시 테이블 사용시 성능을 심각하게 떨어뜨릴 수 있다.

<br>
## 12. toString을 항상 재정의하라.

Object의 toString 메서드는 보통 **클래스이름@16진수로_표현한_해시코드**를 반환한다.

toString 메서드는 원래 일반 규약에 따르면 **간결하고도 사람이 읽기 쉬운 형태의 정보**로 반환되어야 한다. 그리고 **모든 Object의 하위 클래스는 toString 메서드를 재정의하라고 규정되어 있다.**

toString을 잘 구현한 클래스는 디버깅하기가 쉬워진다.
println이나 printf, 문자열 연결 연산자 (+), assert 구문에 넘길 때 또는 디버거가 객체를 출력할 때 자동으로 toString을 호출한다.

<br>
## 13. clone 재정의는 주의해서 진행하라.

Cloneable 인터페이스는 복제해도 되는 클래스임을 명시하는, 메서드는 하나도 없는 믹스인 인터페이스이다.

원래대로라면 clone 메서드는 Object 클래스에 정의되어 있고 그마저도 protected로 되어 있어 Cloneable 인터페이스를 구현하는 것만으로는 외부에서 clone 메서드를 호출할 수 없다.

그런데 이 **Cloneable 인터페이스는 Object의 protected 메서드인 clone 메서드의 동작 방식을 결정한다.**
Cloneable을 구현한 클래스 인스턴스에서 clone을 호출하면 그 객체의 필드를 하나하나 복사한 객체를 반환하며, 그렇지 않은 클래스라면 CloneNotSupportedException 예외를 던진다. 이는 인터페이스를 이례적으로 사용한 예이다.

> 인터페이스를 구현한다는 것은 일반적으로 해당 클래스가 그 인터페이스에서 정의한 기능을 제공한다는 것이다. 그런데 Cloneable의 경우에는 상위 클래스에 정의된 protected 메서드의 동작 방식을 변경한 것이다.

실무에서는 Cloneable을 구현한 클래스는 **clone 메서드를 public으로 제공하며, 사용자는 당연히 복제가 제대로 이뤄지리라 기대한다.**

이를 위해 Cloneable을 구현한 클래스 및 모든 상위 클래스는 복잡하지만 강제할 수는 없고, 허술하게 기술된 프로토콜을 지켜야 한다.

다음은 clone 메서드의 일반 규약이다.

* 객체의 복사본을 생성해 반환한다. 어떤 객체 x에 대해 다음 식은 참이다. 반드시 지킬 필요는 없다.
  * x.clone() != x
  * x.clone().getClass() == x.getClass()
* 다음 식은 일반적으로 참이지만, 필수는 아니다.
  * x.clone().equals(x)
* 관례상, 이 메서드가 반환하는 객체는 super.clone을 호출해 얻어야 한다. 만약 이 클래스 및 상위 클래스가 이 관례를 따른다면 다음 식은 참이다.
  * x.clone().getClass() == x.getClass()
* 반환된 객체와 원본 객체는 서로 독립적이어야 한다.

즉, Cloneable을 구현한 클래스와 상위 클래스의 clone 메서드는 super.clone을 통해 객체를 얻어야 한다.

> 클래스 B가 A를 상속할 때, 하위 클래스 B의 clone은 B 타입 객체를 반환해야 한다. 그런데 A의 clone이 자신의 생성자를 통해 생성한 객체를 반환하면 B.clone도 A 타입 객체를 반환할 수 밖에 없다.

> 다르게 말하면, super.clone을 연쇄적으로 호출하도록 하면 clone이 처음 호출된 하위 클래스의 객체가 생성된다.

```java
@Override
public PhoneNumber clone() {
    // Object.clone 메서드는 checked 예외를 던지도록 되어 있어 try-catch 블록으로 감싸야 한다.
    // 이는 CloneNotSupportedException이 unchecked 예외였어야 한다는 것이다.
    try {
        return (PhoneNumber)super.clone(); //super.clone을 호출하는 것만으로 원본의 완벽한 복제본을 얻는다.
    } catch(CloneNotSupportedException e) {
        throw new AssertionError();
    }
}
```

> Object.clone은 Object 타입을 리턴하지만, 오버라이드한 PhoneNumber의 clone은 PhoneNumber 타입을 리턴한다. 이는 자바가 공변 반환 타이핑 (covariant return typing)을 지원하기 때문으로, 이렇게 구현하는 것이 권장된다.

만약 클래스 내부에 가변 객체를 참조한다면 clone 메서드를 구현할 경우, 원본 객체 및 복사된 객체가 서로 독립적이도록 **깊은 복사**를 구현해야 한다. **원래 clone 메서드는 대입에 의해 복사되는 얕은 복사를 수행하기 때문이다.**

```java
public class Stack implements Cloneable {
    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Stack() {
        this.elements = new Object[DEFAULT_INITIAL_CAPACITY];
    }

    public void push(Object e) {
        ensureCapacity();
        elements[size++] = e;
    }
    
    public Object pop() {
        if (size == 0)
            throw new EmptyStackException();
        Object result = elements[--size];
        elements[size] = null; // 다 쓴 참조 해제
        return result;
    }

    public boolean isEmpty() {
        return size ==0;
    }

    @Override 
    public Stack clone() {
        try {
            Stack result = (Stack) super.clone();
            result.elements = elements.clone(); // 이렇게 참조 값으로 가지는 필드는 따로 복제를 수행해야 한다.
            return result;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError();
        }
    }

    // 원소를 위한 공간을 적어도 하나 이상 확보한다.
    private void ensureCapacity() {
        if (elements.length == size)
            elements = Arrays.copyOf(elements, 2 * size + 1);
    }
}
```

<br>
## 14. Comparable을 구현할지 고려하라.

compareTo는 Object의 메서드가 아니고, Comparable 인터페이스의 메서드이다. 순서를 비교할 수 있으며 이 메서드가 정의된 Comparable 인터페이스를 구현한다는 것은 **그 클래스의 인스턴스들에게는 순서가 있다는 것을 의미한다.**

```java
public interface Comparable<T> {
    int compareTo(T t);
}
```

Comparable 인터페이스를 통해 compareTo 메서드를 구현하면 자연스럽게 정렬을 수행할 수 있다.

```java
Arrays.sort(a);
```

순서가 명확한 값 클래스를 작성한다면 Comparable 인터페이스를 구현하는 것이 좋다.

compareTo 메서드의 일반 규약은 equals와 비슷하다.

* 객체와 주어진 객체의 순서를 비교한다. 이 객체가 주어진 객체보다 작으면 음수를, 같으면 0을, 크다면 양수를 리턴한다.
  * 비교할 수 없는 타입일 경우 ClassCastException 예외를 던진다.
* 다음에서 **sgn** 표기는 부호 함수를 뜻하며 표현식의 값이 음수, 0, 양수일 때 -1, 0, 1을 반환하도록 정의했다.
  * x, y에 대해 sgn(x.compareTo(y)) ==  -sgn(y.compareTo(x))
    * y.compareTo(x)가 예외를 던지는 경우에 한해, x.compareTo(y)에서 예외를 던져야 한다.
  * 추이성을 보장해야 한다.
    * x.compareTo(y) > 0 && y.compareTo(z) > 0 이면, x.compareTo(z) > 0 이다.
  * x.compare(y) == 0 일 때, sgn(x.compareTo(z)) == sgn(y.compareTo(z)) 이다.
  * 필수는 아니지만, 동치성 테스트 결과가 equals와 같아야 한다.
    * x.compareTo(y) == 0 이면 x.equals(y) 여야 한다.

**compareTo 메서드로 수행하는 동치성 검사도 equals 와 마찬가지로 반사성, 대치성, 추이성을 충족해야 한다.** 단, equals 메서드와는 다르게, compareTo는 타입이 다른 객체를 신경쓰지 않아도 된다. ClassCaseException 예외만 던져도 충분하다.

**compareTo 규약을 지키지 않는다면 비교를 활용하는 클래스와 어울리지 못한다.** 비교를 활용하는 TreeSet과 TreeMap, 검색과 정렬을 사용하는 Collections와 Arrays가 있다.

객체 참조 필드를 비교할 때는 compareTo 메서드를 재귀적으로 호출하도록 한다. 만약 해당 필드의 클래스가 Comparable 인터페이스를 구현하지 않았거나, 표준이 아닌 순서로 비교해야 한다면 **Comparator**를 사용하도록 한다.

```java
public int compareTo(CaseInsensitiveString cis) {
    return String.CASE_INSENSITIVE_ORDER.compare(s, cis.s);
}
```

CompareTo 메서드 구현할 때, **기본 타입 필드의 경우에는 박싱된 기본 타입 클래스의 정적 메서드인 compare를 사용하도록 한다.** 관계 연산자를 사용하는 방식은 거추장스럽고 오류를 유발시킬 수 있다.

equals 메서드와 마찬가지로 가장 핵심적인 필드부터 비교해나가면서 중간에 결과가 0이 아니라면 바로 리턴하는 것이 성능 상의 이득이 된다.

자바 8부터는 Comparator 인터페이스를 통해 메서드 연쇄 방식으로 비교자를 생성하여 비교할 수도 있다.

```java
// PhoneNumber 클래스 객체를 비교할 수 있는 Comparator 반환
private static final Comparator<PhoneNumber> COMPARATOR =
        comparingInt((PhoneNumber pn) -> pn.areaCode)
                .thenComparingInt(pn -> pn.prefix)
                .thenComparingInt(pn -> pn.lineNum);

public int compareTo(PhoneNumber pn) {
    return COMPARATOR.compare(this, pn);
}
```
