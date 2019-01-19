---
layout: post
title:  "Effective Java 04 - 클래스와 인터페이스"
date:   2019-01-14
desc:  "Effective Java 04 - 클래스와 인터페이스"
keywords: "java"
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

Public 클래스에서의 protected 멤버는 공개 API이다. 따라서 protected 멤버 또한 가능한 적을수록 좋다.

멤버 접근성을 좁히지 못하게 하는 제약 중 하나는 상위 클래스의 메서드를 재정의할 때이다.
**메서드를 재정의할 때는 그 메서드의 접근 수준을 상위 클래스에서보다 좁게 설정할 수 없다.**
이 제약은 상위 클래스의 인스턴스는 하위 클래스의 인스턴스로 대체해 사용할 수 있어야 한다는 리스코프 치환 원칙을 지키기 위해 필요하다.

테스트를 위해 클래스나 인터페이스, 멤버를 public이나 protected로 선언하여 공개 API로 만들면 안된다.
그럴 필요없이 테스트 클래스를 같은 패키지안에 둠으로써, package-private 요소에 접근할 수 있기 때문이다.

**public 클래스의 인스턴스 필드는 되도록 public이 아니어야 한다.**
만약 필드가 참조 필드이거나, final이 아니라면 그 필드에 담을 수 있는 값을 제한할 힘을 잃게 된다. 즉, 그 필드와 관련된 모든 불변식을 보장할 수 없다는 뜻이다.
정적 필드도 마찬가지긴 하지만 클래스가 표현하는 추상 개념을 완성하기 위한 상수라면 public static final 필드로 공개해도 된다. 단, 기본 타입이거나 불변 객체여야 한다. 가변 객체라면 내부 필드를 수정할 수 있다.

> 접근 제한자가 public인 가변 필드는 일반적으로 스레드 안전하지 않다.

자바 9에서는 모듈 시스템이 추가되어 두 가지 암묵적 접근 수준이 추가되었다.
모듈은 패키지의 묶음으로, 공개(export)할 것이라고 명시하지 않은 패지키라면 protected나 public이더라도 모듈 외부에서 접근할 수 없다.

> 단, 모듈에 적용되는 새로운 두 접근 수준은 상당히 주의해서 사용해야 한다. 모듈 jar 파일을 자신의 모듈 경로가 아닌 애플리케이션의 클래스패스에 두면 그 모듈안의 모든 패키지는 모듈이 없는 것처럼 행동한다.

<br>
## 16. public 클래스에서는 public 필드가 아닌 접근자 메서드를 사용하라.

public 클래스에서는 패키지 바깥에서 필드를 바로 접근할 수 없도록 제한해야 한다.
불변 필드라하더라도 덜 위험하긴 하지만 안심할 수는 없다. 때로는 package-private 클래스나 private 중첩 클래스에서는 종종 필드를 노출하는 편이 나을 때도 있다.

<br>
## 17. 변경 가능성을 최소화하라.

불변 클래스란 **그 인스턴스의 내부 값을 수정할 수 없는 클래스**이다.
불변 클래스는 설계 및 구현하고 사용하기 쉬우며, 오류가 생길 여지도 적고 안전하다.

클래스를 불변으로 만들기 위해 다음 규칙을 따른다.

* 객체의 상태를 변경하는 메서드(예를 들면 setter)를 제공하지 않는다.
* 클래스를 확장할 수 없도록 한다.
  * 대표적으로 final로 선언하거나 private 생성자를 만든 후 정적 팩토리 메서드로만 인스턴스화하는 것이다.
* 모든 필드를 final로 선언한다.
  * 설계자의 의도를 명확히하고, 스레드 간의 동기화없어도 문제없이 사용할 수 있다.
* 모든 필드를 private로 선언한다.
  * 필드가 참조하는 가변 객체를 클라이언트에서 직접 접근해 수정하는 일이 없도록 한다.
* 자신외에는 내부의 가변 컴포넌트에 접근할 수 없도록 한다.
  * 가변 객체를 하나라도 참조한다면 클라이언트에서 그 객체 참조를 얻을 수 없도록 해야 한다.

**불변 객체는 근본적으로 스레드 안전하여 따로 동기화할 필요가 없다.**
또한 같은 불변 객체가 수시로 필요할 경우, 인스턴스를 중복해서 생성하지 않고 내부적으로 캐싱하는 정적 팩토리 메서드를 통해 성능 향상을 도모할 수 있다.

> 불변 객체는 자유롭게 공유할 수 있으므로 clone 메서드나 복사 생성자를 제공해봐야 의미가 없다.

불변 클래스에도 단점은 존재한다. **값이 다르다면 반드시 서로 다른 독립된 객체로 존재해야 한다.**

**모든 클래스를 불변 클래스로 만들 수는 없지만, 그런 클래스이더라도 변경 가능한 부분을 최소화하는 것이 좋다.**
따라서 꼭 변경해야 할 필드를 뺀 나머지 모두는 final로 선언하는 것이 좋다.

<br>
## 18. 상속보다는 컴포지션을 사용하라.

상속은 코드를 재사용하는 강력한 수단이지만 항상 최선은 아니다.
같은 프로그래머가 통제하는 패키지 안에서라면 상속도 안전하긴 하지만, 다른 패키지의 클래스를 상속하는 일은 위험하다.

> 여기서의 상속은 클래스가 다른 클래스를 확장하는 구현 상속을 말한다.

**메서드 호출과는 다르게 상속은 캡슐화를 깨뜨린다.**
다시 말하면, 상위 클래스가 어떻게 구현되느냐에 따라 하위 클래스의 동작에 이상이 생길 수 있다.

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
    // 이는 HashSet 클래스가 내부적으로 add 메서드를 통해 추가하고, 이 때 추가되는 add 메서드는 카운팅하는 자식 add 메서드이다.
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

> 이를 피하고자 아예 하위 클래스에서 상위 클래스 메서드를 호출하지 않고 재정의할 수도 있는데, 이 방식은 어렵고 시간도 들고 오류 발생하거나 성능을 더 떨어뜨릴 수 있다. 또한 상위 클래스 메서드가 private 필드를 사용하고 있었다면 구현 자체가 불가능하다.

따라서 기존 클래스를 확장하는 대신, **새로 클래스를 만들고 private 필드로 기존 클래스의 인스턴스를 참조하도록 하는 것이 좋다.**
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

디폴트 메서드를 제공할 때는 상속하려는 사람을 위해 @implSpec 자바독 태그를 통해 문서화하는 것이 좋다.

> equals나 hashCode와 같은 Object의 메서드를 디폴트 메서드로 제공해서는 안된다.

**복잡한 인터페이스라면, 인터페이스와 추상 골격 구현 클래스를 함께 제공하는 식으로 인터페이스와 추상 클래스의 장점을 모두 취하는 방법도 있다.**
인터페이스로는 타입을 정의하고 간단한 구현이라면 인퍼페이스의 디폴트 메서드로 정의하고, 따로 인스턴스 필드가 필요한 복잡한 메서드들은 추상 골격 구현 클래스를 통해 구현하는 것이다. 
이렇게 해두면 골격 구현을 확장하는 것만으로 인터페이스를 구현하는 데 필요한 일이 대부분 완료된다. (템플릿 메서드 패턴)

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

