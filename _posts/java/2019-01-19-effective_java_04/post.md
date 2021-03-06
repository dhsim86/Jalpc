---
layout: post
title:  "Effective Java 04 - 클래스와 인터페이스"
date:   2019-01-19
desc:  "Effective Java 04 - 클래스와 인터페이스"
keywords: "java, effective java, class, interface"
categories: [Java]
tags: [java]
icon: icon-html
---

# 클래스와 인터페이스

<br>
## 15. 클래스와 멤버의 접근 권한을 최소화하라.

**잘 설계된 컴포넌트와 그렇지 않은 것의 차이는 클래스의 내부 데이터와 내부 구현 정보를 외부 컴포넌트로부터 얼마나 잘 숨겼느냐다.**

잘 설계된 컴포넌트는 내부 구현을 완벽히 숨겨, **구현과 API를 깔끔히 분리한다.** 
오직 **API를 통해서만 다른 컴포넌트와 소통하며 서로의 내부 동작 방식에는 전혀 개의치 않는다.** 이를 통해, 시스템을 구성하는 컴포넌트들을 서로 독립시켜 개발, 테스트, 적용 등을 개별적으로 할 수 있게 해준다.

> 정보 은닉, 캡슐화는 소프트웨어 설계의 근간이 되는 원리이다.

자바는 정보 은닉을 위한 다양한 장치를 제공해주고 있다.
그 중 접근 제어 메커니즘은 클래스, 인터페이스, 멤버의 접근성을 명시한다.
각 요소의 접근성은 그 요소가 선언된 위치와 접근 제한자 (private, protected, public)으로 정해진다.

**기본 원칙은 모든 클래스와 멤버의 접근성을 가능한 한 좁혀야 한다는 것이다.**
달리 말해, 소프트웨어가 정상적으로 동작하는 한 가장 낮은 접근 수준을 부여해야 한다는 뜻이다.

톱 레벨 클래스와 인터페이스에 부여할 수 있는 접근 수준은 package-private와 public 이다. 
**public으로 선언하면 공개 API가 되며, package-private로 선언하면 해당 패키지 안에서만 이용할 수 있다.**
따라서 패키지 외부에서 쓸 이유가 없다면 package-private로 선언하는 것이 좋다. 공개된 API가 아닌 내부 구현이 되므로 언제든지 수정이 가능하다. 

만약 한 클래스에서만 사용하는 클래스이거나 인터페이스는 이를 사용하는 클래스 안에 **private static 클래스**로 중첩시키는 것이 낫다.

클래스를 설계할 때는 공개 API를 세심히 설계 후 그 외의 모든 멤버는 private로 선언한다. 그 후에 같은 패키지내의 다른 클래스가 접근할 필요가 생긴다면 그 때 package-private로 만들어주면 된다.

public 클래스에서의 protected 멤버는 공개 API이다. 따라서 protected 멤버 또한 가능한 적을수록 좋다.

멤버 접근성을 좁히지 못하게 하는 제약 중 하나는 상위 클래스의 메서드를 재정의할 때이다.
**메서드를 재정의할 때는 그 메서드의 접근 수준을 상위 클래스에서보다 좁게 설정할 수 없다.**
이 제약은 상위 클래스의 인스턴스는 하위 클래스의 인스턴스로 대체해 사용할 수 있어야 한다는 리스코프 치환 원칙을 지키기 위해 필요하다.

테스트를 위해 클래스나 인터페이스, 멤버를 public이나 protected로 선언하여 공개 API로 만들면 안된다.
그럴 필요없이 테스트 클래스를 같은 패키지안에 둠으로써, package-private 요소에 접근할 수 있기 때문이다.

**public 클래스의 인스턴스 필드는 되도록 public이 아니어야 한다.**
만약 필드가 참조 필드이거나, final이 아니라면 그 필드에 담을 수 있는 값을 제한할 힘을 잃게 된다. 즉, 그 필드와 관련된 모든 불변식을 보장할 수 없다는 뜻이다.
정적 필드도 마찬가지긴 하지만 클래스가 표현하는 추상 개념을 완성하기 위한 상수라면 public static final 필드로 공개해도 된다. 단, 기본 타입이거나 불변 객체여야 한다. 가변 객체라면 내부 필드를 수정할 수 있다.

길이가 0 이상인 배열도 public 필드로 두거나, 이 필드를 직접 반환하는 접근자 메서드를 제공해서는 안된다. 이 배열에 요소를 외부에서 직접 추가하거나 수정하게 되면서, 그 객체의 불변식을 깨뜨릴 수 있기 때문이다. 따라서 다음과 같이 객체의 복사본이나 불변 리스트를 리턴하는 방법이 있다.

```java
private static final Thing[] PRIVATE_VALUE = { ... };
public static final List<Thing> VALUES = Collections.unmodifiableList(Arrays.asList(PRIVATE_VALUES));

public static final Thing[] values() {
    return PRIVATE_VALUES.clone();
}
```

> 접근 제한자가 public인 가변 필드는 일반적으로 스레드 안전하지 않다.

자바 9에서는 모듈 시스템이 추가되어 두 가지 암묵적 접근 수준이 추가되었다.
모듈은 패키지의 묶음으로, 자신에 속하는 패키지 중 공개할 것들을 (관례상 module-info.java)에 선언한다. 공개(export)할 것이라고 명시하지 않은 패지키라면 protected나 public이더라도 모듈 외부에서 접근할 수 없다.

> 모듈 내에서는 공개(export) 여부가 영향을 주지 않으므로, 어떤 클래스를 public이나 protected 로 선언하였더라도 외부에 공개하지 않으면서도 같은 모듈내의 패키지 사이에서는 공유되게끔 할 수 있다.

> 단, 모듈에 적용되는 새로운 두 접근 수준은 상당히 주의해서 사용해야 한다. 모듈 jar 파일을 자신의 모듈 경로가 아닌 애플리케이션의 클래스패스에 두면 그 모듈안의 모든 패키지는 모듈이 없는 것처럼 행동한다.

<br>
## 16. public 클래스에서는 public 필드가 아닌 접근자 메서드를 사용하라.

public 클래스에서는 패키지 바깥에서 필드를 바로 접근할 수 없도록 제한해야 한다. 필드에 직접 접근할 수 있게 되면 그 객체의 불변식을 외부에서 깨뜨릴 수 있고, 추후에 내부 구현을 변경할 수 없다.

> package-private 클래스나 private 중첩 클래스에서는 종종 필드를 노출하는 편이 코드 작성하는 측면에서 더 깔끔할 때도 있다. package-private 클래스나 private 중첩 클래스의 필드를 public으로 지정하더라도, 이 필드에 직접 접근할 수 있는 클라이언트 코드는 같은 패키지 안에서 동작하는 코드, 외부 클래스의 코드일 뿐이다.

필드를 불변이라면 위험은 조금 줄어들지만, 여전히 내부 구현을 자유롭게 변경할 수 없다는 단점이 있다.

<br>
## 17. 변경 가능성을 최소화하라.

불변 클래스란 **그 인스턴스의 내부 값을 수정할 수 없는 클래스**이다.
불변 클래스는 설계 및 구현, 사용하기 쉬우며 오류가 생길 여지도 적고 안전하다.

클래스를 불변으로 만들기 위해 다음 규칙을 따른다.

* 객체의 상태를 변경하는 메서드(예를 들면 setter)를 제공하지 않는다.
* 클래스를 확장할 수 없도록 한다.
  * 하위 클래스에서 부주의하게 또는 나쁜 의도로 객체의 상태를 변경시키는 것을 막아야 한다.
  * 대표적으로 final로 클래스를 선언하거나 private 생성자를 만든 후 정적 팩토리 메서드로만 인스턴스화하는 것이다.
* 모든 필드를 final로 선언한다.
  * 설계자의 의도를 명확히하고, 스레드 간의 동기화없어도 문제없이 사용할 수 있다.
* 모든 필드를 private로 선언한다.
  * 필드가 참조하는 가변 객체를 클라이언트에서 직접 접근해 수정하는 일이 없도록 한다.
  * 불변이라도 public이라면 내부 구현을 바꾸지 못한다.
* 자신외에는 내부의 가변 컴포넌트에 접근할 수 없도록 한다.
  * 가변 객체를 하나라도 갖고 있다면 클라이언트에서 그 객체 참조를 얻을 수 없도록 해야 한다. 
  * 이런 필드는 불변 객체 초기화시, 클라이언트가 제공한 참조를 바로 가리키게 해서는 안된다.
  * 접근자 메서드가 그대로 참조 필드를 반환해서는 안되며 필요시 방어적 복사를 수행해야 한다.

**불변 객체는 근본적으로 스레드 안전하여 따로 동기화할 필요가 없다.**
또한 같은 불변 객체가 수시로 필요할 경우, 인스턴스를 중복해서 생성하지 않고 내부적으로 캐싱하는 정적 팩토리 메서드를 통해 성능 향상을 도모할 수 있다.

> 불변 객체는 자유롭게 공유할 수 있으므로 clone 메서드나 복사 생성자를 제공해봐야 의미가 없다.

불변 클래스에도 단점은 존재한다. **값이 다르다면 반드시 서로 다른 독립된 객체로 존재해야 한다.**

**모든 클래스를 불변 클래스로 만들 수는 없지만, 그런 클래스이더라도 변경 가능한 부분을 최소화하는 것이 좋다. 객체가 가질 수 있는 상태의 경우의 수를 줄인다면 객체를 예측하기 쉬어지고 오류가 생길 가능성이 줄어든다.**
따라서 꼭 변경해야 할 필드를 뺀 나머지 모두는 final로 선언하는 것이 좋다.

<br>
## 18. 상속보다는 컴포지션을 사용하라.

상속은 코드를 재사용하는 강력한 수단이지만 항상 최선은 아니다.
같은 프로그래머가 통제하는 패키지 안에서라면 상속도 안전하긴 하지만, 다른 패키지의 클래스를 상속하는 일은 위험하다.

> 여기서의 상속은 클래스가 다른 클래스(인터페이스가 아닌)를 확장하는 구현 상속을 말한다.

**메서드 호출과는 다르게 상속은 캡슐화를 깨뜨린다.**
다시 말하면, 상위 클래스가 어떻게 구현되느냐에 따라 하위 클래스의 동작에 이상이 생길 수 있다. 릴리스마다 상위 클래스의 동작이 달라질 수 있으며, 이는 코드 변경하지 않은 하위 클래스의 오동작을 일으킬 수 있다. 따라서 하위 클래스는 상위 클래스의 변화에 맞게 수정이 필요해질 수 있다.

다음 클래스는 HashSet에 엔트리가 추가될 때마다 카운팅하는 클래스인데, 정상적으로 동작하지 않는다.

```java
public class InstrumentedHashSet<E> extends HashSet<E> {
    private int addCount = 0;

    public InstrumentedHashSet() {
    }

    public InstrumentedHashSet(int initCap, float loadFactor) {
        super(initCap, loadFactor);
    }

    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    // addAll 메서드를 통해 원소가 3개인 컬렉션을 추가하였을 때, 카운팅되는 횟수는 6이다.
    // 이는 HashSet 클래스가 내부적으로 add 메서드를 통해 추가하고, 이 때 추가되는 add 메서드는 카운팅하는 InstrumentedHashSet::add 메서드이다.
    // HashSet 문서에는 이를 전혀 언급하지 않고 있다.
    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);
    }

    public int getAddCount() {
        return addCount;
    }
}
```

결국 상위 클래스의 구현 방식에 따라 하위 클래스에 영향이 생기며, 이 때문에 상위 클래스의 변화에 맞춰 하위 클래스도 수정해야 되는 일이 생길 수 있다.

> 위의 예에서는 addAll을 재정의하지 않는 것으로 문제를 해결할 수 있지만, 이는 HashSet의 addAll이 add를 이용해 구현했음을 가정한 해법이라는 한계를 지닌다. 클래스의 어떤 메서드가 자기 자신의 다른 메서드를 사용하여 구현하였다는 것은 외부에 알릴 필요가 없는 내부 구현 방식에 해당된다.

> 아예 하위 클래스에서 상위 클래스 메서드를 호출하지 않고 재정의할 수도 있는데, 이 방식은 어렵고 시간도 들고 오류 발생하거나 성능을 더 떨어뜨릴 수 있다. 또한 상위 클래스 메서드가 private 필드를 사용하고 있었다면 구현 자체가 불가능하다.

> 상위 클래스의 메서드가 추가되었을 때, 이를 상속받은 하위 클래스의 불변식이 깨질 수 있는 상황이 올 수 있다.

> 클래스를 상속하더라도 메서드를 재정의하지 않고, 새로운 메소드를 정의하여 구현하더라도 여전히 문제는 남는다. 만약 상위 클래스에 새로운 메서드가 추가되었는데 메서드 시그니처가 우연히 같다면 컴파일이 되지 않거나 재정의하는 꼴이 되니 여전히 위험이 도사리고 있다.

따라서 기존 클래스를 확장하는 대신, **새로 클래스를 만들고 private 필드로 기존 클래스의 인스턴스를 참조하도록 하면 이러한 문제를 해결할 수 있다.**
기존 클래스가 새로운 클래스의 구성요소로 사용된다는 뜻에서 컴포지션(composition)이라 한다.

새 클래스의 메서드들은 private 필드로 참조하고 있는 메서드들을 대신 호출하도록 함으로써, 기존 클래스의 내부 구현 방식의 영향에서 벗어나도록 한다.

```java
public class ForwardingSet<E> implements Set<E> {
    private final Set<E> s;
    public ForwardingSet(Set<E> s) { this.s = s; }

    public void clear()               { s.clear();            }
    public boolean contains(Object o) { return s.contains(o); }
    public boolean isEmpty()          { return s.isEmpty();   }
    public int size()                 { return s.size();      }
    public Iterator<E> iterator()     { return s.iterator();  }
    public boolean add(E e)           { return s.add(e);      }
    public boolean remove(Object o)   { return s.remove(o);   }
    public boolean containsAll(Collection<?> c)
                                   { return s.containsAll(c); }
    public boolean addAll(Collection<? extends E> c)
                                   { return s.addAll(c);      }
    public boolean removeAll(Collection<?> c)
                                   { return s.removeAll(c);   }
    public boolean retainAll(Collection<?> c)
                                   { return s.retainAll(c);   }
    public Object[] toArray()          { return s.toArray();  }
    public <T> T[] toArray(T[] a)      { return s.toArray(a); }
    @Override public boolean equals(Object o)
                                       { return s.equals(o);  }
    @Override public int hashCode()    { return s.hashCode(); }
    @Override public String toString() { return s.toString(); }
}

public class InstrumentedSet<E> extends ForwardingSet<E> {
    private int addCount = 0;

    public InstrumentedSet(Set<E> s) {
        super(s);
    }

    @Override 
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }
    @Override 
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);
    }
    public int getAddCount() {
        return addCount;
    } }
}
```

위와 같이 Set 인터페이스를 구현하고 기존 Set 인터페이스를 구현한 구체 클래스의 영향에서 벗어나도록 한다.
또한 ForwardingSet 과 같은 랩퍼 클래스를 사용함으로써 어떠한 Set 구현체라도 사용할 수 있다.

> 이렇게 어떤 특정 클래스에 기능이 추가시키는 것을 데코레이터 패턴이라고 한다.

상속은 **하위 클래스가 상위 클래스의 하위 타입인 상황에서만 사용해야 한다.**. 
즉 클래스 B가 클래스 A와 **is-a 관계**일 때만 상속해야 한다. 만약 아니라면 A를 private 인스턴스로 두고, A와는 다른 API를 제공해야 한다. 이 때 A는 B의 필수 구성요소가 아니라 구현 하는 방법 중 하나일 뿐인 것이다.

> 자바 라이브러리에서 이 원칙을 위배한 클래스가 대표적으로 Stack 및 Properties 클래스가 있다.

> is-a 관계이더라도 안심할 수는 없는게, 클래스의 패키지가 상위 클래스와 다르고 상위 클래스가 확장을 고려해 설계하지 않았다면 여전히 문제가 발생할 수 있다.

<br>
## 19. 상속을 고려해 설계하고 문서화하라. 그러지 않았다면 상속을 금지하라.

상속용 클래스는 하위 클래스에서 재정의할 수 있는 메서드들을 **상위 클래스에서는 내부적으로 어떻게 사용하는지 문서로 남겨야 한다.** 가령, API로 공개된 메서드가 자기 자신의 다른 메서드들을 호출할 수 있다.

문서화할 때는 그 메서드가 어떤 메소드를 호출하며 어떤 순서로 호출하는지, 또는 각각의 호출 결과가 어떤 영향을 주는지도 담아야 한다. 이렇게 해야 하위 클래스에서는 상속할 때 주의점을 알게 되어 제대로 구현할 수 있게 된다.

> API 문서의 메서드 설명 끝에서 종종 "Implementation Requirements" 로 시작되는 절을 확인할 수있는데, 이는 그 메서드의 내부 동작 방식을 설명하는 것이다. 메서드 주석에 @implSepc 태그를 달아놓으면 자바독 도구가 생성해준다.

> @implSepc 태그는 자바 8에서 처음 도입되어 자바 9부터 본격적으로 사용되기 시작하였다.

**좋은 API문서란 "어떻게"가 아닌 "무엇"을 하는지를 설명해야 한다는 원칙과 대치된다.**
이는 상속이 캡슐화를 해치기 때문이며, 클래스를 안전하게 상속하도록 하려면 내부 구현 방식을 설명할 수 밖에 없다.

내부 메커니즘을 문서로 남기는 것만이 상속을 위한 설계의 전부는 아니다.
효율적으로 하위 클래스를 어려움없이 구현할 수 있도록 하려면 **클래스의 내부 동작 과정 중간에 끼어들 수 있는 훅을 잘 선별하여 protected 메서드 형태로 공개해야 할 수도 있다.**

상속용 클래스를 시험하는 방법은 직접 하위 클래스를 만들어보는 것이 유일한 방법이다.
**널리 쓰일 클래스를 상속용으로 설계한다면 문서화한 내부 사용 패턴과 protected 메서드, 필드를 구현하면서 선택한 결정에 영원히 책임져야 한다.**

상속용 클래스의 생성자는 직접적이든 간접적이든, **하위 클래스에서 재정의 가능한 메서드를 호출해서는 안 된다.** 마침 하위 클래스에서 재정의한 메서드가 그 하위 클래스의 필드에 의존한다면 의도대로 동작하지 않는다.

마찬가지로 Cloneable과 Serializable 인터페이스를 구현해서 사용하는 clone 및 readObject 메서드 또한 하위 클래스에서 재정의 가능한 메서드를 호출해서는 안된다. 

> Cloneable이나 Serializable 인터페이스를 구현한 클래스를 상속할 수 있게 설계하는 것은 일반적으로는 좋지 않은 생각이다.

> Serializable을 구현한 상속용 클래스가 readResolve나 writeReplace 메서드를 가진다면 이 메서드는 protected로 선언해야 한다. private로 선언하면 하위 클래스에서 무시된다.

**상속용으로 설계하지 않았다면 상속을 금지하는 것이 옳다.** 
방법은 클래스를 final로 선언하거나 private 생성자를 선언한 뒤, 정적 팩터리 메서드를 통해 인스턴스화시키는 것이다.

<br>
## 20. 추상 클래스보다는 인터페이스를 우선하라.

자바가 제공하는 다중 구현 메커니즘은 인터페이스와 추상 클래스가 있다.
자바 8부터는 인터페이스도 디폴트 메서드를 제공할 수 있게 되어 두 메커니즘 모두 인스턴스 메서드를 구현 형태로 제공할 수 있다.

둘의 가장 큰 차이는 **추상 클래스가 정의한 타입을 구현하는 클래스는 반드시 추상 클래스의 하위 클래스여야 한다는 점이다.** 자바는 단일 상속만을 지원하므로, 추상 클래스 방식은 새로운 타입을 정의하는데 큰 제약을 준다.

**이미 구현된 기존 클래스에는 쉽게 인터페이스를 구현해넣을 수 있다.** 인터페이스 메서드 추가하고, 클래스 선언 부에 implements 구문만 추가하면 된다.
반면에 추상 클래스의 경우에는 기존 클래스 위에 새로 끼워넣기에는 힘든 점이 있다. 만약 이미 상속을 하고 있는 경우라면?

**추상 클래스보다는 인터페이스가 믹스인 정의에 알맞다.**
믹스인이란 클래스가 구현할 수 있는 타입으로 원래 "주된 타입"외에 특정 선택적 행위를 제공한다고 선언하는 효과를 준다.

> 대표적으로 Comparable 인터페이스와 같이 순서를 정하는 선택적 기능을 제공해주는 경우

인터페이스의 메서드 중 구현 방법이 명백한 것이 있다면, 그 구현을 디폴트 메서드로 제공해줄 수도 있다.

```java
public interface Calculator {

    public int plus(int i, int j);

    public int multiple(int i, int j);

    default int exec(int i, int j){      //default로 선언함으로 메소드를 구현할 수 있다.
        return i + j;
    }

}
```

디폴트 메서드를 제공할 때는 상속하려는 사람을 위해 @implSpec 자바독 태그를 통해 문서화해야 한다. 디폴트 메서드 또한 하위 클래스에서 오버라이드할 수 있으므로 디폴트 메서드의 구현 방식을 잘 설명해놓아야 한다.

> equals나 hashCode와 같은 Object의 메서드를 디폴트 메서드로 제공해서는 안된다.

**복잡한 인터페이스라면, 인터페이스와 추상 골격 구현(skeletal implementation) 클래스를 함께 제공하는 식으로 인터페이스와 추상 클래스의 장점을 모두 취하는 방법도 있다.**
인터페이스로는 타입을 정의하고 간단한 구현이라면 인퍼페이스의 디폴트 메서드로 정의하고, 나머지 메서드들은 추상 골격 구현 클래스를 통해 구현한다. 이러면 단순히 골격 구현을 상속받는 것만으로 이 인터페이스를 구현하는데 필요한 모든 작업이 완료된다.

> ex) ArrayList는 골격 구현인 AbstractList 추상 클래스를 상속받으며, AbstractList는 List 인터페이스를 구현하고 있다.

```java
static List<Integer> intArrayAsList(int[] a) {
    Objects.requireNonNull(a);

    // 다이아몬드 연산자를 이렇게 사용하는 건 자바 9부터 가능하다.
    // 더 낮은 버전을 사용한다면 <Integer>로 수정하자.
    return new AbstractList<>() {
        @Override 
        public Integer get(int i) {
            return a[i];
        }

        @Override
        public Integer set(int i, Integer val) {
            int oldVal = a[i];
            a[i] = val;  
            return oldVal; 
        }

        @Override
        public int size() {
            return a.length;
        }
    };
}
```

골격 구현 클래스는 추상 클래스처럼 구현을 도와주는 동시에, 추상 클래스로 타입을 정의할 때 따라오는 심각한 제약에서 자유롭다는 장점이 있다.

구조 상으로 골격 구현 클래스를 사용하지 못한다면, 인터페이스를 직접 구현해야 한다.
이런 경우라도 디폴트 메서드의 이점을 여전히 누릴 수 있으며, 필요하다면 골격 구현 클래스를 확장한 클래스를 private 내부 클래스 정의 및 필드로 두어 사용하는 컴포지션처럼 구현할 수도 있다.

> 골격 구현은 기본적으로 상속해서 사용한다는 것을 가정하므로, 상속을 고려해 설계해야 되고 문서화 지침도 따라야 한다.

<br>
## 21. 인터페이스는 구현하는 쪽을 생각해 설계하라.

자바 8 이전에는 기존 구현체를 깨뜨리지 않고는 인터페이스에 메서드를 추가할 방법이 없었다.
디폴트 메서드를 통해 기존 인터페이스에 메서드를 추가할 수 있도록 하였지만 위험이 사라진 것은 아니다.

디폴트 메서드를 선언하면 그 인터페이스를 구현한 후 디폴트 메서드를 재정의하지 않은 모든 클래스에서 디폴트 구현이 쓰이게 된다. 디폴트 메서드는 기존 구현체에 런타임 오류를 일으킬 수도 있다.

> 대표적으로 자바 8의 인터페이스에 추가된 removeIf 디폴트 메서드가 있는데, 이를 구현하는 아차피 커먼즈 라이브러리의 Collections.synchronizedCollection 정적 팩토리 메서드가 반환하는 클래스에서 removeIf를 재정의하지 않아 동기화해주지 못하는 경우가 있다.

기존 인터페이스가 있고 이 인터페이스를 구현하는 여러 클래스가 존재할 때, 이 인터페이스에 디폴트 메서드로 새 메서드를 추가하는 일은 기존 구현체와 충돌할 수도 있으므로 심사숙고해서 결정해야 한다. 

> 새로운 인터페이스를 만드는 경우라면 표준적인 메서드 구현을 제공하는 데 유용하다.

<br>
## 22. 인터페이스는 타입을 정의하는 용도로만 사용하라.

**인터페이스는 자신을 구현한 클래스의 인스턴스를 참조할 수 있는 타입 역할을 한다.**
즉, 클래스가 어떤 인터페이스를 구현한다는 것은 자신의 인스턴스로 무엇을 할 수 있는지 클라이언트에 알리는 것이다.

인터페이스는 이 용도로만 사용해야 한다.

다음과 같은 메서드가 없어 상수만 나열된 상수 인터페이스 안티패턴은 인터페이스를 잘못 사용한 예다.

```java
public interface PhysicalConstants {

    static final double AVOGADROS_NUMBER   = 6.022_140_857e23;

    static final double BOLTZMANN_CONSTANT = 1.380_648_52e-23;

    static final double ELECTRON_MASS      = 9.109_383_56e-31;

}
```

클래스 내부에서 사용하는 상수는 외부 인터페이스가 아니라 내부 구현에 해당한다. 따라서 이런 메서드가 하나도 없는 상수 인터페이스를 구현하는 것은 내부 구현을 클래스의 공개 API로 노출하는 행위이다. (클라이언트 코드가 상수 인터페이스의 상수들을 직접 사용할 수도 있다.)

상수를 공개할 목적이라면 클래스나 메서드가 있는 인터페이스 (인터페이스 용도에 맞는) 자체에 추가하거나, 인스턴스화할 수 없는 유틸리티 클래스에 담아 공개하도록 한다.

<br>
## 23. 태그 달린 클래스보다는 클래스 계층 구조를 활용하라.

두 가지 이상을 표현할 수 있으며, 그 중 현재 표현하려는 의미를 태그 값으로 알려주는 다음과 같은 클래스가 있다고 하자. 이 클래스는 원이나 사각형을 표현하는 클래스이다.

```java
class Figure {
    enum Shape { RECTANGLE, CIRCLE };

    // 태그 필드 - 현재 모양을 나타낸다.
    final Shape shape;

    // 다음 필드들은 모양이 사각형(RECTANGLE)일 때만 쓰인다.
    double length;
    double width;

    // 다음 필드는 모양이 원(CIRCLE)일 때만 쓰인다.
    double radius;

    // 원용 생성자
    Figure(double radius) {
        shape = Shape.CIRCLE;
        this.radius = radius;
    }

    // 사각형용 생성자
    Figure(double length, double width) {
        shape = Shape.RECTANGLE;
        this.length = length;
        this.width = width;
    }

    double area() {
        switch(shape) {
            case RECTANGLE:
                return length * width;
            case CIRCLE:
                return Math.PI * (radius * radius);
            default:
                throw new AssertionError(shape);
        }
    }
}
```

이 클래스는 단점이 가득하다. 열거 타입 선언이나 태그 필드, switch 문과 같이 쓸데없는 코드가 많다.
특히 필드들을 final로 선언하려면 해당 의미에 쓰이지 않는 필드들까지 초기화해야 한다.

또 새로운 의미가 추가된다면 siwtch 문을 찾아 코드를 추가해나가야 하며, 인스턴스 타입만으로는 현재 나타내는 의미를 정확히 알기 어렵다.

따라서 이런 클래스는 계층 구조를 가지는 클래스로 바꾸어야 한다.
추상 클래스를 정의하여 공통적인 의미가 담도록 하고, 상속받도록 한다.

```java
abstract class Figure {
    abstract double area();
}

class Rectangle extends Figure {
    final double length;
    final double width;

    Rectangle(double length, double width) {
        this.length = length;
        this.width  = width;
    }
    @Override
    double area() { return length * width; }
}


class Circle extends Figure {
    final double radius;

    Circle(double radius) { this.radius = radius; }

    @Override
    double area() { return Math.PI * (radius * radius); }
}

```

<br>
## 24. 멤버 클래스는 되도록 static으로 만들라.

중첩 클래스란 다른 클래스 안에 정의된 클래스를 말한다.
**중첩 클래스는 자신을 감싼 바깥 클래스에서만 쓰여야 하며, 그 외의 쓰임새가 있다면 톱레벨 클래스로 만들어야 한다.**

정적 멤버 클래스는 다른 클래스 안에 선언되고, 외부 클래스의 private 필드에 직접 접근할 수 있다는 점만 빼고는 일반 클래스와 같다. 정적 멤버 클래스는 다른 정적 멤버와 똑같은 접근 규칙을 적용받는다. 흔히 바깥 클래스와 함께 쓰일 때만 유용한 도우미 클래스로 많이 쓰인다.

정적 멤버 클래스와 비정적 멤버 클래스는 구문상의 차이는 static 뿐이지만 의미 상으로 차이가 크다. **비정적 멤버 클래스의 인스턴스는 암묵적으로 외부 클래스 인스턴스와 연결된다.**

**중첩 클래스의 인스턴스가 외부 클래스 인스턴스와 독립적으로 존재할 수 있다면 정적 멤버 클래스로 만들어야 한다.** 비정적 멤버 클래스는 외부 클래스 인스턴스로의 숨은 외부 참조를 가지게 된다. 

이 관계 정보는 비정적 멤버 클래스의 인스턴스 안에 만들어져 메모리 공간을 차지하며 생성 시간도 더 걸린다. 만약 비정적 멤버 클래스의 인스턴스를 누군가가 계속 참조하고 있다면, 더 이상 사용하지 않는 외부 클래스 인스턴스를 가비지 컬렉터가 수거하지 못할 수도 있다.

<br>
## 25. 톱레벨 클래스는 한 파일에 하나만 담으라.

소스 파일 하나에 톱레벨 클래스를 여러 개 선언해도 자바 컴파일러는 불평하지 않는다.
그러나 아무런 이득이 없고, 만약 똑같은 클래스가 여러 파일에 걸쳐 존재한다면, 자바 컴파일시 소스 파일을 어느 순서로 컴파일하냐에 따라 동작이 달라진다.
