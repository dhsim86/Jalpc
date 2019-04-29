---
layout: post
title:  "도메인 주도 설계 06 - 도메인 객체의 생명주기"
date:   2019-04-28
desc:  "도메인 주도 설계 06 - 도메인 객체의 생명주기"
keywords: "DDD, Domain, Domain Driven Design, Aggregate, Repository, Factory"
categories: [Programming]
tags: [DDD, Domain, Domain Driven Design]
icon: icon-html
---

모든 객체에는 생명주기가 있다. 한 객체는 생성되어 다양한 상태를 거친 후 결국 저장되거나 삭제되면서 소멸한다. 다른 객체와 복잡한 상호의존성을 맺으며, 여러 가지 상태의 변화를 겪기도 하는데 이 때 갖가지 불변식이 적용된다. 이러한 객체들을 관리하는데 실패한다면 Model-Driven Design을 시도하는 것이 쉽게 좌절될 수 있다.

![00.png](/static/assets/img/blog/programming/2019-04-28-domain_driven_design_06/00.png)

도메인 객체의 관리와 관련되 문제는 아래의 두 가지 범주로 나뉜다.

* 생명주기 동안의 무결성 유지하기
* 생명주기 관리의 복잡성으로 모델이 난해해지는 것을 방지하기

이러한 문제를 해결하는데 도메인 주도 설계에서는 세 가지 패턴을 통해 해결한다.

* Aggregate: **소유권과 경계를 명확히 정의하여 모델을 엄격하게 만들어** 객체 간의 연관관계가 혼란스럽게 얽히는 것을 방지하고, 도메인 객체의 **무결성**을 유지한다.
* Factory: 복잡한 객체와 Aggregate를 생성 및 재구성함으로써 그것들의 **내부 구조를 캡슐화**한다.
* Repository: **영속성과 관련된 인프라스트럭처를 캡슐화하면서 영속 객체를 찾아 조회하는 수단**을 제공한다.

Repository와 Factory가 도메인에서 나오는 것은 아니지만, 그것들은 도메인 설계에서 중요한 역할을 담당한다. Aggregate를 모델링하고 Repository와 Factory를 통해 모델 객체의 생명주기 동안 그것들 체계적이고 의미 있는 단위로 조작할 수 있다.

**Aggregate는 생명주기의 전 단계에서 불변식이 유지해야할 범위를 표시하는 것이며, Repository와 Factory는 Aggregate를 대상으로 연산을 수행하며 특정 생명주기로 이동하는 과정에 따른 복잡성을 캡슐화한다.**

<br>

## Aggregate (집합체)

연관관계를 최소주의 관점에서 설계하면 탐색이 단순해지고 증가하는 관계를 제한하는데 어느정도 도움이 되긴 하지만, 대부분의 업무 도메인은 상호 연관의 정도가 높으므로 객체 참조를 통해 얽히고 설킨 객체 관계망을 추적해야 한다. 그런데 이런 과도한 관계망은 소프트웨어 설계에서는 문제가 된다.

**일반적인 객체 모델의 관계망은 잠재적인 변경의 효과가 미칠 범위를 명확히 한정해주지 않는다.** 특히 동일한 객체에 여러 클라이언트가 동시에 접근하는 시스템에서는 문제가 심각해질 수 있다. **변경의 범위를 알맞게 제한하지 않는다면 심각한 결과가 초래될 것이다.**

모델 내에서 복잡한 연관관계를 맺는 객체를 대상으로 변경의 일관성을 보장하기란 쉽지 않다. **개별 객체뿐만 아니라 그 객체가 참조하는, 서로 밀접한 관계에 있는 객체 집합에도 불변식이 적용되어야 하기 때문이다.**

이러한 문제의 균형잡힌 해법을 찾기 위해서는 도메인을 심층적으로 이해해야 하며, 특히 특정 클래스의 인스턴스 사이의 변화 빈도와 같은 사항까지도 이해하고 있어야 한다. **경합이 높은 지점을 느슨하게 연결하고, 엄격한 불변식을 더욱 엄격하게 지켜지케 하는 모델을 찾을 필요가 있다.**

문제의 근원은 **모델에 경계가 정의되어 있지 않다는 점이다.** 모델을 근간으로 하는 해법을 이용하면 모델을 좀 더 이해하기 쉬워지고 설계한 바가 더 쉽게 전달될 것이다.

다음과 같은 엄격한 체계는 그와 같은 개념에서 정수를 뽑아낸 것이다.

**모델 내의 참조에 대한 캡슐화를 추상화할 필요가 있다.** **Aggregate는 데이터 변경의 "단위"로 다루는 연관 객체의 묶음을 말하는데, 각 Aggregate에는 루트(root)와 경계(boundary)가 있다.** 

* 경계: Aggregate에 무엇이 포함되고 포함되지 않는지를 정의한다.
* 루트: Aggregate 내에 단 하나만 존재하며 특정 Entity를 가리킨다.

경계 안의 객체들은 서로 참조할 수 있지만, **경계 바깥의 객체는 해당 Aggregate의 구성요소 가운데 루트만 참조할 수 있다.**

> 루트 이외의 Aggregate 내부의 Entity는 지역 식별성을 가지며, Aggregate 내에서만 구분된다. Aggregate 경계 밖에서는 루트 Entity 말고는 내부를 직접 들여다 볼 수 없도록 하기 때문이다.

![01.png](/static/assets/img/blog/programming/2019-04-28-domain_driven_design_06/01.png)

위의 그림과 같이 Car는 외부에서 식별할 수 있는 루트 Entity이며, Aggregate 내부의 Wheel, Tire는 외부에서 바로 접근할 수 없다.

**불변식은 데이터가 변경될 때마다 유지되어야 하는 일관성 규칙을 뜻하며, Aggregate를 구성하는 각 구성요소 간의 관계도 포함한다.** 

이런 특징을 가지는 Aggregate에 대한 트랜잭션에 적용되는 규칙은 다음과 같다.

1. 루트 Entity는 전역 식별성을 가지며, 불변식을 검사할 책임이 있다.
2. Aggregate 경계 안의 Entity들은 지역 식별성을 지니며, Aggregate 내부에서만 유일하다.
3. Aggregate 경계 밖에서는 루트 Entity를 제외하고는 내부의 구성요소에 대해 직접 참조할 수 없다.
    * 루트 Entity가 내부 Entity에 대한 참조를 바깥에 전달해 줄 수는 있지만 그러한 객체는 바깥에서 일시적으로만 사용해야 되고 계속 보유하면 안된다.
    * 방어적 복사를 통해 다른 객체에 전달하도록 하며 외부에 의해 불변식이 깨지지 않도록 한다.
4. 데이터베이스에 질의를 하면 Aggregate의 루트만 직접적으로 획득하도록 구현한다.
    * Aggregate 내부의 다른 객체들은 모두 Aggregate의 루트를 통해서 탐색해서 발견해야 한다.
5. Aggregate 안의 객체는 다른 Aggregate의 루트만 참조 가능하다.
6. 삭제 연산은 Aggregate 경계 안의 모든 요소를 한 번에 제거해야 불변식을 지킬 수 있다.
7. Aggregate 경계 안의 어떤 객체를 변경하더라도 전체 Aggregate의 불변식은 지켜져야 한다.

**객체 간의 복잡한 연관관계로 인해 발생하는 문제점을 해소하고, 지켜져야 하는 불변식의 경계를 명확히 하기 위해서는** Entity와 Value Object를 한 Aggregate로 모으고 각각에 대해 경계를 정의하도록 한다.

 <br>
 
 ## Factory (팩터리)

**어떤 객체나 Aggregate를 생성하는 일이 복잡하거나 외부로 내부 구조를 많이 드러내는 경우 Factory가 이를 캡슐화해준다.**

객체의 장점 중 상당 부분은 객체의 내부구조와 연관관계를 정교하게 구성하는 데서 나온다. 객체는 그것의 존재 이유와 관련이 없거나 다른 객체와 상호작용함에 있어서 필요없는 것이 남지 않을 때까지 정제해야 한다. 이러한 객체의 책임 중에는 객체 전체 생명 주기의 중간 단계에서 수행하는 것들이 많다. 문제는 이러한 책임만으로도 복잡한 객체에 객체 자체를 생성하는 책임까지 맡기는 데 있다.

**복잡한 객체를 조립하거나 생성하는 일은 생성 후 해당 객체가 하는 일이나 책임과 가장 관련성이 적은 일이다.**

객체 생성하는 책임을 클라이언트 객체로 옮긴다면 문제가 훨씬 더 나빠진다. 클라이언트가 객체 생성 책임을 가진다는 것은 **클라이언트가 도메인 객체의 내부 구조를 어느 정도 알고 있어야 한다는 것이다.** 도메인 객체의 각 구성요소에 대해 적용되는 모든 불변식을 지키기 위해 **클라이언트는 해당 객체의 규칙을 알아야 한다.** 이렇게 되면 객체의 클래스와 클라이언트가 결합되어, 객체 구현을 변경시, 클라이언트도 변경해야 한다.

어떤 객체를 생성하는 것이 그 자체로도 주요한 연산이 될 수 있지만 **복잡한 생성 / 조립 연산은 생성된 객체 자체의 책임으로는 어울리지 않는다. 그렇다고 이 책임을 클라이언트에 두면 이해하기 힘든 설계, 구현이 나올 수도 있다.**

복잡한 객체를 생성하는 일은 도메인 계층의 책임이지만, 그것이 모델을 표현하는 객체에 속하는 것은 아니다. 일반적으로 객체 생성하는 것은 도메인에서는 의미가 없긴 하지만, 구현 측면에서는 반드시 필요하다. **이러한 문제를 해결하기 위해 Entity나 Value Object, Service가 아닌 다른 무언가를 도메인 설계에 추가해야 한다.** 도메인 모델링의 결과로 나타나는 모델 내의 어떤 것에도 해당하지 않는 요소를 추가하는 것이지만, 이는 도메인 계층에서 맡고 있는 책임의 일부를 구성한다.

**자신의 책임이 다른 객체를 생성하는 것인 프로그램 요소를 Factory라고 한다.**

![02.png](/static/assets/img/blog/programming/2019-04-28-domain_driven_design_06/02.png)

어느 한 객체의 인터페이스가 자신의 구현을 캡슐화하고 객체의 동작방식을 알 필요가 없도록 해주듯이 **Factory는 복잡한 객체나 Aggregate를 생성하는데 필요한 지식을 캡슐화한다.**

> 복잡한 객체와 Aggregate의 인스턴스를 생성하는 책임을 가지는 Factory는 도메인 설계의 일부를 구성하며, 이를 통해 클라이언트로 해당 객체의 내부구조나 규칙을 캡슐화할 수 있다. Factory는 전체 Aggregate 단위로 생성해서 그 것의 불변식이 지켜지도록 해야 한다.

Factory를 설계하는 방법에는 여러가지가 있지만, 다음 두 가지 요건을 통해 Factory를 잘 설계하기 위한 필요 요소를 알 수 있다.

1. 각 생성 방법은 원자적이어야 하며, 생성된 객체나 Aggregate의 불변식은 반드시 지켜져야 한다.
2. Factory는 생성된 클래스보다는 생성하고자 하는 타입으로 추상화되어야 한다.

<br>

### Factory와 Factory의 위치 선정

Aggregate 내부에 요소를 추가하기 위해 내부 객체를 생성하는 용도라면, 해당 **Aggregate 루트에 Factory 메서드를 둘 수 있다.** 다음과 같이 한 요소가 추가될 때마다 Aggregate의 무결성을 보장하는 책임을 루트가 담당하고 동시에 외부에 대해 Aggregate의 내부 구현을 숨길 수 있다.

![03.png](/static/assets/img/blog/programming/2019-04-28-domain_driven_design_06/03.png)

또 다른 예로는 생성된 객체를 소유하지는 않지만 다른 객체를 만들어내는 것과 **밀접한 관련이 있는 특정 객체에 Factory 메서드를 두는 것이다.** 이렇게 하면 한 객체의 데이터나 규칙이 객체를 생성하는데 큰 영향을 주는 경우 클라이언트에서 해당 객체를 생성할 때 필요로 하는 정보의 양을 줄일 수 있다.

![04.png](/static/assets/img/blog/programming/2019-04-28-domain_driven_design_06/04.png)

위 그림에서 TradeOrder 객체와 Brokerage Account 객체는 같은 Aggregate를 구성하지는 않지만 Brokerage Account 객체가 TradeOrder 객체를 생성함에 있어서 충분한 정보를 가지고 있으므로 Factory 메서드를 둘 수 있다.

Factory는 해당 Factory에서 생성되는 객체와 매우 강하게 결합되므로, **자신의 생성하는 객체와 가장 밀접한 관계에 있는 객체에 있어야 한다.** 생성 과정이 복잡하여 여러 프로그램 요소가 개입되는 경우, 비록 자연스럽게 보이지는 않더라도 별도의 Factory 객체나 Service를 만들어야 한다. 이런 독립형 Factory는 전체 Aggregate를 생성하여 (불변식은 지켜지고) 루트에 대한 참조를 리턴할 것이다.

![05.png](/static/assets/img/blog/programming/2019-04-28-domain_driven_design_06/05.png)

> 특정 Aggregate 안의 어떤 객체가 Factory를 필요로 하는데, Aggregate 루트가 해당 Factory가 있기에 적절하지 않다면 독립형 Factory로 만들면 된다.

<br>

### 생성자만으로 충분한 경우

때로는 직접적으로 생성자를 이용하여 객체를 생성하는 것이 최선의 선택일 때가 있다. 특히 Factory는 **다형성을 활용하지 않는 객체를 생성하는데 좋다.** 반대로 생성자를 사용하는 편이 좋은 상황은 다음과 같다.

* 클라스가 타입인 경우, 클래스가 어떤 계층 구조의 일부를 구성하지 않으며 인터페이스를 구현하는 식으로 다형적으로 사용되지 않는 경우
* 클래스가 Strategy, 즉 전략 패턴을 위해 구현체에 관심이 있는 경우
* 클라이언트가 이미 객체의 속성을 모두 이용할 수 있고, 노출된 생성자 내에서 객체 생성 구현이 중복되지 않는 경우
* 생성자가 복잡하지 않은 경우
* 공개 생성자가 Factory가 동일한 규칙을 준수하는 경우. 마찬가지로 생성자로 객채 생성시에도 불변식은 충족시켜야 한다.

> 다른 클래스의 생성자 내에서 생성자를 호출하지 않도록 한다. 생성자는 극도로 단순해야 한다.

<br>

### 인터페이스 설계

Factory의 메서드를 설계할 때는 Factory가 어떤 형태이든지 상관없이 다음의 두 가지 사항을 명심해야 한다.

1. 각 연산은 원자적이어야 한다.
    * 복잡한 객체를 생성하기 위해 필요한 모든 것들을 한 번에 전달해야 한다.
    * 생성이 실패할 경우에 대해서도 대비를 해야 한다.
2. Factory는 자신에게 전달된 인자와도 결합된다.
    * 입력 매개변수 타입이나 클래스에 대해서 결합이 생기게 된다.
    * 구체적인 클래스가 아닌 추상적인 타입의 인자를 사용하도록 한다.

<br>

### 불변식 로직의 위치

Factory의 책임은 그것이 만들어내는 객체나 Aggregate의 불변식이 충족되도록 보장하는 것이다. 자기 자신이 직접 불변식을 검사할 수도 있지만, 간혹 생성된 객체에 위임할 수도 있다. 특히 **각 도메인 객체 각각 내부에서 불변식을 검사하는 것이 더 깔끔할 때이다.**

예를 들면 Entity를 생성할 때, Entity 식별성을 위해 사용하는 값은 Entity 내부에서 검사하는 것이 좋을 수 있다.

그 외에 해당 객체가 활동하는 생애 동안 결코 수행되거나 적용되지 않을 불변식 로직을 객체에 위치시킬 필요는 없다. 이 때는 Factory가 불변식을 둘 논리적인 위치가 되며, 객체는 더 단순하게 유지될 것이다.

<br>

### Entity Factory와 Value Object Factory

Entity Factory와 Value Object Factory는 두 가지 점에서 다른데, Value Object가 불변적이고, Entity는 식별성을 가진다는 차이에 기인한다.

특히 Entity는 식별성을 위해 식별성 할당이 필요하므로 그런 식별자를 관리하기에는 Factory가 적절한 곳이다.

<br>

### 저장된 객체의 재구성

Factory는 특정 객체의 생명주기의 초반에 해당하는 부분에 관여하지만, 객체를 재구성할 때 (DB에서 데이터를 읽어 객체를 생성하는 등)도 사용할 수 있다.

객체를 재구성할 때 사용되는 Factory는 객체 생명주기의 초반에 관여하는 Factory와 유사하지만 주된 차이점은 아래의 두 가지가 있다.

1. 재구성에 사용되는 Entity Factory는 식별성을 위해 새로운 ID를 할당하지 않는다.
2. 객체를 재구성하는 Factory는 불변식 위반을 다른 방식으로 처리해야 한다.
    * 새로운 객체를 생성할 경우에는 단순히 객체 생성을 멈추면 되지만, 재구성할 때의 불변식 위반은 좀 더 탄력적으로 대응해야 된다. 가령 DB의 데이터 정합성이 맞지 않거나 일시적인 오류가 원인일 수도 있기 때문이다.

---

**Factory는 모델의 어떤 부분도 표현하지는 않지만 해당 모델을 나타내는 객체를 뚜렷하게 드러내는 데 일조하는 도메인 설계의 일부로 볼 수 있다. Factory는 객체의 생성과 재구성이라는 생명주기 전이를 캡슐화한다.**

<br>
