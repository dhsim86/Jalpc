---
layout: post
title:  "디자인 패턴 07 - 가교 (Bridge)"
date:   2019-08-17
desc:  "디자인 패턴 07 - 가교 (Bridge)"
keywords: "디자인 패턴, Design Patterns, 구조 패턴, 가교, Bridge"
categories: [Programming]
tags: [Design Patterns]
icon: icon-html
---

가교(Bridge) 패턴은 **구현 코드로부터 추상을 분리하여 이들이 서로 독립적으로 발전**할 수 있도록 하기 위한 목적을 가지는 패턴이다.

보통 하나의 추상적인 개념, 기능이 여러가지 방법으로 구현할 수 있을 때, 대부분은 상속을 통해서 이 문제를 해결한다. 추상 클래스로 인터페이스를 정의하고, 구체적인 서브 클래스들에서 서로 다른 방식으로 이 인터페이스를 구현하는 것이다. 그런데 이 방법으로는 **충분한 융통성을 얻을 수는 없다. 상속은 구현부와 추상적 개념을 영구적으로 결속시키므로, 추상적 개념과 구현을 분리하여 수정, 발전시킬 수 없다.**

예를 들어 다음 코드를 보자.

```java
public interface LoginManager {

    boolean isAutenticated(String userName, String password);
    boolean isExist(String userName);

}

// 웹 환경에서 사용자 인증 처리
public class WebLoginManager implements LoginManager {

    public boolean isAutenticated(String userName, String password) {
        ...
    }

    public boolean isExist(String userName) {
        ...
    }

}

// CLI 콘솔 환경에서 사용자 인증 처리
public class ConsoleLoginManager implements LoginManager {

    public boolean isAutenticated(String userName, String password) {
        ...
    }

    public boolean isExist(String userName) {
        ...
    }

}
```

위와 같이 로그인시 사용자의 인증을 처리하는 기능의 인터페이스를 정의한 LoginManager 인터페이스가 있고, 이를 각각 웹 환경과 CLI 콘솔에 맞게 구현된 서브 클래스들이 있다고 하자. 각 서브 클래스들은 각자 환경에 맞게 사용자의 인증을 처리할 것이다.

그런데 위와 같이 상속을 통해 추상적인 개념을 구현할 때 다음과 같은 문제가 발생한다.

1. LoginManager 인터페이스를 확장하기가 불편하다. 
   - 만약 인증 처리를 위해 **부가적인 기능이 필요해지거나 추상 개념을 확장해야 하는 상황이 온다면, 이 인터페이스를 구현하는 모든 구현 코드를 다 수정해야 한다.** 예를 들어 LoginManager의 추상적 개념을 확장한 ExtendLoginManager 추상 클래스를 정의하고 새로운 추상 메서드를 추가된다면, 웹 환경과 CLI 콘솔 환경을 위해, ExtendLoginManager를 상속하는 서브 클래스들 또한 정의하거나 WebLoginManager, ConsoleLoginManager를 수정해야 한다.
2. 클라이언트 입장에서는 이 기능을 구현한 특정 서브 클래스에 종속된다. 
   - 예를 들어 웹 환경에서 WebLoginManager를 생성해서 사용한다면, 사용자 코드는 이 클래스나 WebLoginManager의 부모인 LoginManager 인터페이스에 묶이게 된다. 그런데 1번의 예와 같이 만약 ExtendLoginManager를 상속받은, 웹 환경을 위해 새로운 기능을 포함한 클래스인 ExtendWebLoginManager가 필요하다면 사용자 코드를 모두 수정해야할 가능성이 있다.

위의 문제를 해결하기 위해 가교 패턴을 사용할 수 있다. 이 패턴은 **추상적 개념에 해당하는 클래스 계층과 구현부에 해당하는 클래스 계층을 분리하여 문제를 해결한다.** 즉 추상적인 개념 확장은 추상적 개념을 담당하는 클래스 계층에서 발전시켜나가도록 하고, 구현부에서 기능이 확장 / 개선된다면 구현부에 해당하는 클래스 계층에서 진행되도록 하는 것이다.

![00.png](/static/assets/img/blog/programming/2019-08-17-design_patterns_07/00.png)

* Abstraction(LoginManager): 추상적 개념에 대한 인터페이스를 정의하고, 구현부에 대해 참조 필드를 가진다.
* RefinedAbstraction(ExtendLoginManager, OAuthLoginManager): 추상적 개념에 정의된 인터페이스를 확장한다.
* Implementor(LoginManagerImpl): 구현 클래스에 대한 인터페이스를 정의한다.
  * 실질적인 구현을 위한 공통 연산의 시그니처만을 정의한다.
  * Abstraction에 정의된 연산과 1:1 대응할 필요없다. 두 인터페이스는 서로 다른 형태일 수 있다. Abstraction는 더 추상화된 서비스 관점의 인터페이스를 제공한다.
* ConcreteImplementor(WebLoginManager, ConsoleLoginManager, MobileLoginManager): 인터페이스를 구현하는 것으로, 실질적인 구현 내용을 담는다.

위 그림과 같이 로그인 처리를 담당하는 최상위 LoginManager 를 정의하고, 이를 구현하는 클래스의 최상위 클래스로 LoginManagerImpl을 정의한다. **LoginManager는 자신의 인터페이스를 실제로 구현하는 클래스가 어느 것인지 참조하는 필드를 가지고 있어야 한다. 즉 LoginManager 인터페이스는 LoginManagerImpl에 정의된 연산을 이용하여 기능이 완성된다.**

LoginManagerImpl는 각 환경에 종속적인 구현을 정의하므로 각 환경(웹, 콘솔, 모바일)별 서브 클래스를 가진다.

LoginManager는 추상적인 개념을 정의하는 인터페이스를 가지고, 로그인과 관련하여 추가적인 개념이나 기능이 추가될 때마다 이 LoginManager로부터 새로운 서브 클래스를 만들고 정의한다. 물론 추가되는 연산은 LoginManagerImpl을 상속받는 구현부에서 정의한 연산에 의해 구현될 수 있다.

**이렇게 LoginManager와 LoginManagerImpl 클래스 간의 관련성을 가리켜 가교(Bridge)라고 정의한다.**

이 패턴을 통해 추상적인 개념, **인터페이스와 구현부 사이의 종속관계를 최소화**하고, **추상적인 개념과 구현 부분을 독립적으로 확장, 개선**해나갈 수 있다. 특히 **클라이언트에게 환경에 종속적인 구현부를 숨길 수 있다.** 따라서 구현부가 변경되더라도 클라이언트 코드는 수정될 필요없어야 한다.

> 구현 방법이 하나일 때는 딱히 이 패턴을 사용할 필요는 없어보이지만, 여전히 사용자 코드를 클래스 구현의 변경과 독립시킬 수 있다.

> Abstraction 클래스에서 참조할 Implementor 인스턴스를 결정하기 위해 팩토리 클래스를 통해 요청할 수도 있다. 따라서 추상 팩토리 패턴을 통해 특정 ConcreteImplementor 인스턴스를 반환하도록 구현할 수 있다. 이는 Abstraction 클래스와 ConcreteImplementor 클래스 간의 종속성을 제거할 수 있다.

> 어댑터 패턴은 서로 관련이 없는 클래스들이 함께 동작하도록 하기 위함이라면, 가교 패턴은 설계 단계에서부터 추상화 및 구현이 독립적으로 발전시키기 위해 사용된다.

[Bridge Example
](https://github.com/dhsim86/design_pattern_study/commit/ae282697437b896266d1d3899554bb106250b5dc)