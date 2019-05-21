---
layout: post
title:  "도메인 주도 설계 10 - 유연한 설계"
date:   2019-05-18
desc:  "도메인 주도 설계 10 - 유연한 설계"
keywords: "도메인 주도 설계, DDD, Domain, Domain Driven Design,  Intention-Revealing Interface, 의도를 드러내는 인터페이스, Side-Effect-Free Function, 부수효과, Side effect, Assertion, Conceptual Contour"
categories: [Programming]
tags: [DDD, Domain, Domain Driven Design]
icon: icon-html
---

복잡하게 동작하는 소프트웨어에 좋은 설계가 결여되어 있다면 요소들을 리픽터링하거나 결합하기가 어려워진다. 개발자들이 소프트웨어의 처리 방식에 내포된 모든 의미를 확신하지 못하면 곧바로 중복이 나타나기 시작한다. 소프트웨어가 깔끔하게 설계돼 있지 않다면 개발자들은 엉망진창으로 꼬여버린 코드를 보는 것조차 두려워하며, 뭔가를 망가트릴지도 모르는 변경을 덜 하게 될 것이다.

개발이 진행될수록 현재의 레거시 코드로 인한 중압감에 시달리지 않고 프로젝트 진행을 촉진하려면 즐겁게 작업할 수 있는 유연한 설계가 필요하다.

> 조립가능하고 그럼에도 이해하기가 어렵지 않은 요소를 만들어내려면 Model-Driven Design을 적당한 수준의 엄밀한 설계 형식과 접목하고자 노력해야 한다. 변경에 열려있을려면 설계가 사용하는 모델과 동일한 저변의 모델을 드러내어 쉽게 이해할 수 있어야 한다.

<br>

## Intention-Revealing Interface (의도를 드러내는 인터페이스)

도메인 주도 설계를 적용할 때는 의미 있고 가치 있는 도메인 로직에 관해 생각하고자 한다. 명확하게 표현된 규칙 없이 암묵적인 규칙에 따라 실행되는 코드를 이해하려면 소프트웨어 프로시저를 구성하는 각 단계를 이해하고 기억해야 한다. 계산 자체가 명확하지 않거나 모델과의 연관관계가 분명하지 않을 경우에도 결과를 이해하기 어렵거나 변경의 파급 효과를 예상하기 어렵다.

> 객체가 아름다운 이유는 이 모든 것들을 캡슐화하고 상위 수준의 개념 관점에서 코드를 이해할 수 있기 때문이다.

개발자가 객체를 효과적으로 사용하는 데 알아야 할 정보를 인터페이스로부터 얻지 못한다면 세부적인 측면을 이해하고자 객체 내부를 살펴볼 수 밖에 없다. 캡슐화를 통해서 얻을 수 있는 대부분의 가치를 잃어버리고 인지 과부화와 싸워야 한다. **개발자가 컴포넌트를 사용하기 위해 컴포넌트의 세부 사항을 고려해야 한다면 캡슐화의 가치는 사라진다.** 원래의 개발자가 아닌 다른 사람이 연산이나 클래스의 목적을 짐작하여 개발한다면, 설계의 개념적 기반은 무너지고 개발자들은 서로 의도가 어긋난 상태에서 일하게 된다.

도메인 내의 개념을 클래스나 메서드의 형태로 명확히 모델링하여 가치를 얻으려면 **도메인 개념을 반영하도록 클래스와 메서드의 이름을 지어야 한다.** 설계에 포함된 모든 공개된 요소가 조화를 이뤄 인터페이스를 구성하고, 인터페이스의 각 구성 요소는 이름을 토대로 설계 의도를 드러내어야 한다.

![00.png](/static/assets/img/blog/programming/2019-05-18-domain_driven_design_10/00.png)

**수행하는 방법에 관해서는 언급하지 말고, 결과와 목적만을 표현하도록 클래스와 연산의 이름을 부여해야 한다. 이름은 Ubiquitous Language에 포함된 용어를 따라야 한다.**

<br>

## Side-Effect-Free Function (부수효과가 없는 함수)

연산은 크게 **명령**과 **질의**라는 두 가지 범주로 나눌 수 있다.

* 명령(Command): 변수의 값을 변경하는 등의 작업을 통해 시스템의 상태를 변경하는 연산
* 질의(Query): 변수 안에 저장된 데이터에 접근하거나, 저장된 데이터를 기반으로 계산을 수행하여 정보를 얻는 연산

**부수효과(Side Effect)는 의도하지 않은 결과를 의미하지만, 컴퓨터 과학에서는 시스템의 상태에 대한 영향력을 의미한다.** 시스템의 상태를 변경하는, **의도된** 변경을 표현하기 위해 **의도하지 않은 변경을 의미하는 부수효과**를 용어로 채택한 점으로 보아 시스템의 상태를 변경하는 것이 개발자에게 있어서 부정적인 영향을 끼치는 경우가 많아서 그럴 것이다.

대부분의 연산은 다른 연산을 호출하고, 호출 깊이가 깊어질수록 연산을 호출한 결과를 예측하기가 어려워진다. 다수의 규칙에 따라 상호작용하거나 여러 가지 계산을 조합하면 극도로 예측하기가 어려워지는데, 이를 위해 개발자는 연산 그 자체 뿐만 아니라 연산이 호출하는 다른 연산의 구현도 이해해야 한다. **안전하게 예측할 수 있는 추상화가 마련되어 있지 않다면 개발자가 연산을 조합하여 사용하는 데 제약이 따르고, 행위를 풍부하게 할 수 있는 가능성이 낮아진다.**

**부수효과를 일으키지 않으면셔 결과를 반환하는 연산을 함수(Function)이라고 하는데, 함수는 여러 번 호출해도 무방하며 매번 동일한 값을 반환한다.** 또한 부수효과를 지는 연산에 비해 테스트하기가 용이하며, 결과는 오직 함수로 넘긴 인자에 의해서만 의존하기 때문에 예측도 쉽게 가능하다.

대부분의 소프트웨어 시스템에서 부수효과를 일으키는 명령을 사용하지 않기란 불가능하지만, 다음의 두 가지 방법으로 문제를 완화시킬 수 있다.

**첫째, 명령과 질의를 엄격하게 분리된 서로 다른 연산으로 유지한다.** 부수효과, 변경을 발생시키는 메서드는 도메인 데이터를 반환하지 않고 단순하게 유지시키고, 모든 질의나 계산을 부수효과를 발생시키지 않는 메서드 내에서 수행하도록 해야 한다.

**둘째, 연산의 결과를 표현하는 새로운 Value Object를 생성하여 반환한다.** Value Object는 불변 객체로, 함수와 마찬가지로 안전하게 사용할 수 있고 테스트도 쉽게 할 수 있다. 부수효과를 단순한 명령 메서드 내부로 격리하는 작업은 Entity에 대해서만 적용한다. 변경과 질의를 분리하는 리팩터링 후, 복잡한 계산을 처리하는 책임을 Value Object로 옮기도록 한다.

**가능한 한 많은 양의 프로그램 로직을 관찰 가능한 부수효과 없이 결과를 반환하는 함수 안에 작성하라.** 

<br>

## Assertion (단언)

복잡한 계산을 부수효과가 없는 함수(Function)로 분리하면 해결해야 할 문제의 난이도롤 낮출 수 있지만, 여전히 Entity 내부에 부수효과를 초래하는 명령(Command)이 남아 있으므로, 개발자는 이 명령의 영향력을 이해해야 한다. Assertion을 사용한다면 Entity의 해당 명령에 대한 부수효과가 명확해지고 다루기 쉬워진다.

**내부를 조사하지 않고도 설계 요소의 의미와 연산의 실행 결과를 이해할 수 있는 방법이 필요한데, 이는 연산의 사후 조건과 클래스 및 Aggregate의 불변식을 명시하는 것으로 해결할 수 있다.** 만약 Assertion을 따로 명시할 수 없다면, **자동화된 단위 테스트를 통해 Assertion의 내용을 표현해야 한다.**

<br>

## Conceptual Contour (개념적 윤곽)

모델 또는 설계를 구성하는 요소과 모놀리식 구조에 묻혀 있을 경우 각 요소의 기능이 중복될 수 있다. 그렇지만 그렇다고 클래스나 메서드를 잘게 나누면 클라이언트 쪽 객체가 무의미하게 복잡해질 수 있다. 클라이언트 객체가 작은 부분들의 협력 방식을 이해해야 하기 때문이다.

**도메인을 중요 영역을 나누는 것과 관련한 직관을 감안해서, 설계 요소 (연산, 인터페이스, 클래스, Aggregate)를 응집력 있는 단위로 분해하라.** 높은 응집도와 낮은 결합도와 같은 두 가지 기본원리에 따라 요구사항에 따른 변경되는 영역을 분리하라.

만약 요구사항에 대한 변경이나 리팩터링시 지역적으로 한정된 범위에서만 이루어진다면 모델이 현제 도메인에 적합해졌다는 뜻이다. 반대로 객체와 메서드를 와해시킬 정도로 광범위한 변경을 야기한다면 도메인에 관해 알고 있는 지식을 개선하고 그에 따라 설계 및 구현도 따라야 한다는 메시지이다.

<br>

## Standalone Class (독립형 클래스)

**상호의존성은 모델과 설계를 이해하기 어렵게 만든다.** 모든 연관관계는 의존성을 의미하므로 클래스를 이해하려면 연관관계를 토대로 어떤 요소가 연결되어 있는지 이해해야 한다. 메서드에 포함된 인자타입이나 반환타입에 대해서도 마찬가지로 이해해야 한다.

Module이나 Aggregate 모두 지나치게 얽히고설키는 상호의존성을 방지하고자 하는 것이 목적이다. 하지만 Module이나 Aggregate 모두 각각 내부의 의존성을 제어하려고 열심히 노력하지 않으면 고려할 사항이 많아질 수 있다. 이는 설계를 파악하는데 어려움이 따르고, 정신적 과부하를 주어 개발자가 다룰 수 있는 설계의 복잡도를 제한한다.

**낮은 결합도는 개념적 과부하를 줄이고 객체 설계의 기본 원리이다. 가능한 늘 결합도를 낮추고 노력하라. 객체와 무관한 모든 개념을 제거하라.** 그러면 클래스가 완전히 독립적으로 바뀌고 단독으로 검토하고 이해할 수 있다. 모든 의존성을 제거하는 것이 아니라 모든 비본질적인 의존성을 제거하는 것이 목표다.

<br>

## Closure Of Operation (연산의 닫힘)

의존성은 늘 존재하겠지만 근본 개념을 구성하는 의존성은 나쁜 것이 아니다. 정제된 설계에서 흔히 볼 수 있는 일반적인 지침으로 **Closure Of Operation**이 있다. 이는 "1 + 1 = 2와 같은 덧셈 연산은 실수 집합에 닫혀있다."라는 수학에서 유래한 것이다. XML 문서를 다른 XML 문서로 변환할 때 XSLT를 사용하는 데 XSLT 연산은 XML 문서 집합에 닫혀 있다. 이러한 닫힘의 특성은 **연산을 간단히 해석할 수 있고 닫힌 연산을 연결하거나 결합하는 것에 쉽게 생각할 수 있다.**

**적절한 위치에 반환 타입과 인자 타입이 동일한 연산을 정의하라.** 객체가 연산에 사용되는 상태를 포함한다면 인자의 타입과 반환 타입을 객체의 타입과 동일하게 정의한다. 이런 방식으로 정의된 연산은 해당 타입의 인스턴스 집합에 닫혀 있다. **닫힌 연산은 부차적인 개념을 사용하지 않고도 고수준의 인터페이스를 제공한다.**

이 패턴은 Value Object의 연산을 정의하는데 주로 사용된다. 도메인 내에서 Entity의 생명주기는 중요하므로, 연산의 결과로 새로운 Entity를 생성해서 반환할 수는 없다. Entity는 어떤 계산의 수행 결과를 표현하는 개념이 아니기 때문이다.

때로는 인자 타입은 객체의 타입과 같지만 반환 타입이 다르거나, 반환 타입은 같은데 인자 타입은 다를 수 있다. 이러한 연산은 특정 타입에 닫혀 있는 것은 아니지만 어느 정도 Closure의 혜택을 받을 수 있다.