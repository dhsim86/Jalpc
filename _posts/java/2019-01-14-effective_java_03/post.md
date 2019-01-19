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

