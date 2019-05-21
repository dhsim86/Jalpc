---
layout: post
title:  "Toby's Spring Chap 06: AOP part.2"
date:   2017-09-11
desc: "Toby's Spring Chap 06: AOP part.2"
keywords: "spring, toby spring, aop"
categories: [Web]
tags: [spring]
icon: icon-html
---

## 스프링 AOP

스프링은 OCP의 중요한 요소인 **유연한 확장** 이라는 개념을 스프링 컨테이너 자신에게도 다양한 방법으로 적용한다. 컨테이너로서 제공하는 기능 중, 변하지 않는 핵심적인 부분외에는 대부분 확장할 수 있도록 확장 포인트를 제공한다.

<br>
### 자동 프록시 생성

자동으로 프록시를 생성하기 위해 스프링에서 지원하는 빈 후처리기를 통해 구현할 수 있다.
스프링은 빈 후처리기가 빈으로 등록되어 있으면, 빈 오브젝트가 생성될 때마다 빈 후처리기에 보내어 후처리 작업을 요청한다. **BeanPostProcessor** 인터페이스를 구현해서 만드는 이 빈 후처리기는 이름 그대로 **스프링 빈 오브젝트로 만들어지고 난 후에 해당 빈 오브젝트를 다시 한번 가공할 수 있게 해준다.**

빈 후처리기들 중에서 자동으로 프록시를 생성하기 위해 사용되는 클래스는 **[DefaultAdvisorAutoProxyCreator](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/aop/framework/autoproxy/DefaultAdvisorAutoProxyCreator.html)** 이다. 이 클래스는 어드바이저를 이용한 **자동 프록시 생성기** 이다. 빈 오브젝트의 일부를 프록시로 포장하고, 프록시를 빈으로 대신 등록시킬 수 있다.

<br>

![00.png](/static/assets/img/blog/web/2017-09-11-toby_spring_06_aop_2/00.png)

DefaultAdvisorAutoProxyCreator 빈 후처리가 등록되어 있다면, 스프링은 빈 오브젝트를 만들 때마다 후처리기에게 빈을 보낸다.

1. 후처리기는 **빈으로 등록된 모든 어드바이저 내의 포인트컷을 이용해** 전달받은 빈이 프록시 적용 대상인지 확인한다.
2. 프록시 적용 대상이면 내장된 프록시 생성기를 통해 현재 빈에 대한 **프록시를 생성하고 어드바이저를 연결한다.**
3. 프록시가 생성되면 전달받은 빈 오브젝트 대신에 **프록시 오브젝트를 컨테이너에게 돌려준다.**
4. 컨테이너는 빈 후처리가 돌려준 프록시 오브젝트를 빈으로 등록한다.

이 후처리기를 통해 일일이 ProxyFactoryBean을 빈으로 등록하지 않아도 **여러 타깃 오브젝트에 자동으로 프록시를 적용시킬 수 있다.**

<br>
### 확장된 포인트컷

포인트컷은 어떤 메소드에 부가기능을 적용할지 결정해주는 역할 뿐만 아니라, **등록된 빈 중에서 어떤 빈에 프록시를 적용할지를 결정할 수도 있다.**

~~~java
public interface Pointcut {
  ClassFilter getClassFilter();   // 프록시를 적용할 클래스인지 확인.
  MethodMatcher getMethodMatcher(); // 어드바이스를 적용할 메소드인지 확인.
}
~~~

위와 같이 포인트컷을 통해 **프록시를 적용할 클래스인지 판단** 하고 나서, 적용 대상 클래스인 경우에는 **어드바이스를 적용할 메소드인지 확인** 할 수 있다. DefaultAdvisorAutoProxyCreator 빈 후처리기를 사용하기 위해 클래스와 메소드를 모두 선정하는 포인트컷이 필요하다.

[Pointcut test with ClassFilter](https://github.com/dhsim86/tobys_spring_study/commit/2b662f79f750afe68d70b8e8e601b5dd46997630)

> 포인트컷이 클래스 필터링을 통해 클래스를 걸러버리면, 부가기능이 전혀 적용되지 않는다.

<br>
### 어드바이저를 이용하는 자동 프록시 생성기 등록

**DefaultAdvisorAutoProxyCreator** 의 동작 방식

1. **Advisor** 인터페이스를 구현한 모든 빈을 찾는다.
2. 생성되는 모든 빈에 대해서 어드바이저의 포인트컷을 적용해보면서 **프록시 적용 대상을 선정한다.**
3. 빈 클래스가 프록시 선정 대상이면 **프록시를 만들어 원래 빈 오브젝트가 바꿔치기한다.**
4. 타깃 빈에 의존하던 다른 빈들은 프록시 오브젝트를 DI 받게 된다.

DefaultAdvisorAutoProxyCreator를 사용하기 위해 다음과 같이 애플리케이션 컨텍스트 xml에 추가한다.
~~~xml
<bean class="org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator" />
~~~

> 다른 빈에서 참조되거나 코드상에서 빈 이름으로 조회할 필요가 없는 빈이라면 빈 아이디를 등록하지 않아도 된다.

[Transaction code using auto proxy](https://github.com/dhsim86/tobys_spring_study/commit/10d946e05be19f56bdfd875f1fac3ec4c47e932f)

[Check proxy class instance](https://github.com/dhsim86/tobys_spring_study/commit/10c3db691e7e78c59ae5e0c8d395459e7f70b5c3)

<br>
### 포인트컷 표현식을 이용한 포인트컷

스프링에서는 클래스 필터나 메소드 매처를 사용하는 것이 아닌, 정규식과 비슷하게 포인트컷의 클래스와 메소드를 선정할 수 있도록 **포인트컷 표현식** 이라는 방법을 사용할 수 있다.

포인트컷 표현식을 사용하기 위해서는 **AspectJExpressionPointcut** 클래스를 사용한다. 이 클래스를 통해 포인트컷 표현식을 사용해서 클래스와 메소드 선정 방식을 한 번에 지정할 수 있다.

> 스프링이 사용하는 포인트컷 표현식은 AspectJ 프레임워크에서 사용하는 문법을 확장해서 사용한다.

---

**포인트컷 표현식 문법**

AspectJ 포인트컷 표현식은 **포인트컷 지시자** 를 이용해 작성한다.

포인트컷 지시자 중 **execution()** 에대한 문법구조는 다음과 같다.
~~~
execution([접근제한자 패턴] 리턴값의 타입패턴 [클래스 타입패턴.]메소드 이름패턴 (파라미터 타입패턴 | "..", ...) throws 예외패턴 )
~~~

* 접근제한자 패턴: public이나 protected, private. 생략 가능하다.
* 리턴값의 타입패턴: 리턴 값의 타입, **필수 항목**, \* 를 써서 모든 타입에 대해 적용할 수도 있다.
* 클래스 타입패턴: 패키지와 타입 이름을 포함한 클래스의 타입 패턴, 생략 가능, 생략하면 모든 타입에 대해 적용된다. 이름에 \* 를 사용할 수 있다. 또한 ".." 를 써서 한 번에 여래 개의 패키지를 선택할 수 있다.
* 메소드 이름패턴: **필수항목**, 모든 메소드에 적용하려면 \* 를 쓴다.
* 파라미터 타입패턴: **필수항목**, "," 로 구분하면서 메소드 파라미터 타입을 적는다. 파라미터가 없다면 "()" 만 사용하며, 만약 타입과 개수에 상관없이 모두 다 허용하겠다면 ".." 를 사용한다. 만약 앞에는 파라미터가 있고 뒷 부분의 파라미터만 생략하겠다면 "..."를 사용한다.
* 예외패턴: 예외 이름에 대한 타입 패턴이고 생략 가능하다.

> 패턴 요소를 생략하면 모든 경우를 다 허용하도록 되어 있다.

* **execution(int minus(int, int))**: int 타입의 리턴 값, minus 라는 메소드 이름, 두 개의 int 파라미터를 가지는 메소드
* **execution(\* minus(int, int))**: 리턴 타입은 상관없이, minus 라는 메소드 이름, 두 개의 int 파라미터를 가지는 메소드
* **execution(\* minus(..))**: 리턴 타입과 파라미터의 종류 및 개수에 상관없이 minus 이름을 가진 메소드
* **execution(\* \*(..))**: 리턴 타입, 파라미터, 메소드 이름에 상관없는 모든 메소드
* **execution(\* \*())**: 리턴 타입, 메소드 이름에 상관없고 파라미터는 없는 모든 메소드
* **execution(\* springbook.aop.Target.\*(..))**: springbook.aop.Target 클래스의 모든 메소드
* **execution(\* springbook.aop.\*.\*(..))**: springbook.aop 패키지의 모든 메소드, 단 서브패키지의 클래스는 포함 안된다.
* **execution(\* springbook.aop..\*.\*(..))**: springbook.aop 패키지의 모든 메소드, 서브패키지의 클래스까지 포함
* **execution(\* \*..Target.\*(..))**: 패키지에는 상관없이 Target 클래스의 모든 메소드

[Pointcut execution example](https://github.com/dhsim86/tobys_spring_study/commit/a341034dd17964824dc912714f29135f6d490629)

[Pointcut execution expression test](https://github.com/dhsim86/tobys_spring_study/commit/5e2b189aa79b4f4f8a1aecad4e5effae6bc2cf2c)

> 포인트컷 표현식은 execution() 말고도, **bean()** 이 있다. bean(\*Service) 라고 지정하면 빈 아이디가 Service로 끝나는 모든 빈을 선택한다.

---

**AspectJExpressionPointcut** 직접 사용시, 포인트컷 표현식을 다음과 같이 메소드 시그니처를 **execution()** 안에 넣어 expression 프로퍼티에 설정한다.

~~~java
AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
pointcut.setExpression("execution(* *(..))");
~~~

스프링 빈으로 등록하여 사용할 때는 다음과 같이 작성한다.

~~~xml
<bean id="transactionPointcut" class="org.springframework.aop.aspectj.AspectJExpressionPointcut">
    <property name="expression" value="execution(* *..*ServiceImpl.upgrade*(..))" />
</bean>
~~~

[Use AspectJExpressionPointcut](https://github.com/dhsim86/tobys_spring_study/commit/f989cecfa3e8e3fc4d8a8d20e5653d432d68201a)

위의 xml과 같이 expression을 설정하면 패키지에 상관없이 ServiceImpl 로 끝나는 클래스의 upgrade로 시작하는 모든 메소드에 적용될 것이다.

포인트컷 표현식은 클래스 및 메소드를 선정하는 로직이 짧은 문자열에 담기기 때문에 코드와 설정이 단순해진다. 그러나, 문자열로 된 표현식이므로 런타임 시점까지 문법의 검증이나 기능 확인이 되지 않는다는 단점이 있다.

> 포인트컷 표현식을 이용하는 포인트컷이 정확히 원하는 빈, 메소드만 선정했는지 확인하는 것은 어렵다. 스프링 개발팀에서 제공하는 스프링 지원 툴을 사용하면 아주 간단하게 포인트컷이 선정한 빈, 메소드가 무엇인지 한 눈에 알 수 있다.

---

**포인트컷 타입 패턴**

포인트컷 표현식의 클래스 이름에 적용되는 패턴은 클래스 이름에 대한 매칭이 아니라, 타입 패턴이다.

~~~java
public interface UserService {
  void add(User user);
  void upgradeLevels();
}

public class UserServiceImpl implements UserService {
  ...
}

public class TestUserService implements userServiceImpl {
  ...
}
~~~

위와 같이 클래스가 정의되어 있을 때, 포인트컷 표현식을 **execution(\* \*..\*ServiceImpl.upgrade\*(..))** 과 같이 설정하면 TestUserService 까지 매칭된다. 이는 포인트컷 표현식에서 클래스 패턴은 타입에 대한 패턴이기 때문이다.

마찬가지로 인터페이스를 지정하면 그 인터페이스를 구현하는 모든 클래스에 대해 매칭될 것이다. **execution(\* \*..UserService.\*(..))** 같이 지정하면 UserService 인터페이스를 구현하는 모든 클래스에 대해 적용된다.

<br>
## AOP (Aspect Oriented Programming)

트랜잭션 경계 설정 코드와 같은 부가기능을, 다른 비즈니스 로직과는 다르게 일반적인 객체지향적인 설계 방법으로는 독립적인 모듈화가 불가능하였다. 다이내믹 프록시라든가 빈 후처리기와 같은 복잡한 기술까지 동원하였기 때문이다.

이런 부가기능에 대해서 모듈화 작업을 진행할 때 객체지향 설계 패러다임과는 다른 새로운 특성을 가지고 있어, 모듈화된 부가기능을 오브젝트라고 부르지 않고 **애스팩트(Aspect)** 라고 부른다.

애스팩트는 그 자체로 **애플리케이션의 핵심 기능을 담고 있지는 않으나, 애플리케이션을 구성하는 중요 요소이고 핵심기능에 부가되어 의미를 갖는 특별한 모듈을 말한다.** 애스팩트는 부가될 기능을 정의한 **어드바이스** 와 어드바이스를 어디에 적용할지를 결정하는 **포인트컷** 을 함께 갖고 있다.

<br>

![01.png](/static/assets/img/blog/web/2017-09-11-toby_spring_06_aop_2/01.png)

애스팩트를 통해 분리하기 전의 코드는 부가기능과 핵심 비즈니스 로직이 한 군데에 모여 있어 설계와 코드가 모두 지저분하였다. 또한 부가기능은 여러 군데에서 나타나 중복될 확률도 높고 부가기능을 추가할 때마다 여러 곳에서 코드를 추가해야 한다.

그러나 애스팩트를 통한 부가기능의 모듈화로 부가기능에 대한 코드의 중복을 피할 수가 있었고 핵심기능은 그 기능을 담은 코드로만 존재할 수 있었다. **설계와 개발시에는 부가기능을 담은 애스팩트와 핵심기능에 해당하는 비즈니스 로직을 분리된, 독립적인 관점으로 작성할 수 있게 된 것이다.**

애플리케이션의 핵심적인 기능에서 **부가적인 기능을 분리해서 애스팩트라는 독특한 모듈로 만들어서 설계하고 개발하는 방법을 애스팩트 지향 프로그래밍(Aspect Oriented Programming), 관점 지향 프로그래밍** 이라고 부른다.

AOP는 객체지향프로그래밍인 OOP를 대체하는 기술은 아니고 OOP를 돕는 보조적인 기술이다. AOP를 통해 애스팩트를 분리하고 애플리케이션 핵심기능에 대해서는 OOP의 가치를 보존할 수 있도록 하는 것이다.

또한 **AOP는 애플리케이션을 다양한 측면에서 독립적으로 모델링하고, 설계하고, 개발할 수 있도록 만들어준다.** 애스팩트를 분리하고 개발할 수 있게 됨으로써 개발자로 하여금, 애플리케이션을 핵심 기능을 담당하는 프로그램이 아닌 부가기능을 설정하는 프로그램이라는 관점에서 바라보고 개발할 수 있다는 점에서 AOP를 **관점 지향 프로그래밍** 이라고도 하는 것이다.

<br>
### AOP 적용기술

스프링은 IoC/DI 컨테이너와 다이내믹 프록시, 데코레이터 패턴, 프록시 패턴, 자동 프록시 생성 기법, 빈 오브젝트의 후처리 조작 등을 통해 AOP를 지원한다. 그중 가장 핵심적인 것은 **프록시** 이다.

프록시를 통해 DI로 연결된 빈 사이에 적용해 **타깃의 메소드 호출 과정에 참여해서 부가기능을 제공하도록 만들었다.** MethodInterceptor 인터페이스는 프록시로부터 메소드 요청 정보를 전달받아 타깃 오브젝트의 메소드를 호출한다.

> 스프링의 AOP는 프록시 방식의 AOP 이다.

<br>
### 바이트코드 생성과 조작을 통한 AOP

AOP 기술의 원조이자, 가장 강력한 AOP 프레임워크인 **AspectJ** 는 프록시 방식을 사용하지 않고, **타깃 오브젝트를 뜯어고쳐 부가기능을 직접 넣어주는 직접적인 방식을 사용한다.** 컴파일된 타깃의 클래스 파일 자체를 수정하거나 클래스가 JVM 상에 로딩될 때 바이트코드를 조작하는 복잡한 방법을 사용한다.

이렇게 직접적인 방식을 사용함으로써 스프링 AOP와 같이 **자동 프록시 생성 방식을 사용하지 않아도 AOP를 적용할 수 있다.** 그리고 프록시 방식보다 강력하고 유연한 AOP가 가능해진다.

프록시 방식의 AOP는 부가기능을 부여할 대상이 **타깃의 메소드만으로 한정되지만**, 바이트코드 조작을 통한 AOP에서는 **오브젝트의 생성, 필드 값의 조회와 조작, 스태틱 초기화 등의 다양한 작업에 부가기능을 부여할 수 있다.**

대부분의 부가기능은 프록시 방식을 통해 메소드 호출 시점에 적용하는 것만으로 충분하나, 특별한 AOP 요구사항이 있어 스프링의 프록시 AOP 수준을 넘어서는 기능이 필요하다면 그때 AspectJ를 사용하면 된다.

<br>
### AOP의 용어

* 타깃: 부가기능을 부여할 대상. 핵심기능을 담은 클래스일 수도 있으나 다른 부가기능을 제공하는 다른 프록시일 수도 있다.
* 어드바이스: 타깃에게 제공할 부가기능을 담을 모듈.
* 조인포인트: 어드바이스가 적용될 수 있는 위치, 타깃 오브젝트가 구현한 인터페이스의 모든 메소드는 조인포인트가 된다.
* 포인트컷: 어드바이스를 적용할 조인포인트를 선별하는 작업 또는 그 기능을 정의한 모듈. 스프링 AOP의 조인포인트는 메소드의 실행이므로 포인트컷 표현식은 메소드의 실행이라는 의미인 **execution** 으로 시작한다.
* 프록시: 클라이언트와 타깃 사이에 투명하게 존재하면서 부가기능을 제공하는 오브젝트
* 어드바이저: 포인트컷과 어드바이스를 하나씩 갖고 있는 오브젝트. 스프링 AOP에서만 사용되고 자동 프록시 생성기가 이 어드바이저를 AOP 작업의 정보로 활용한다.
* 애스팩트: AOP의 기본 모듈로, 한 개 또는 그 이상의 포인트컷과 어드바이스의 조합으로 만들어지며 싱글톤 형태의 오브젝트로 존재한다.

<br>
### AOP 네임스페이스

스프링 AOP를 적용하기 위해 추가했던 어드바이저, 포인트컷, 자동 프록시 생성기와 같은 빈들은 다른 애플리케이션 로직을 담은 빈들과는 성격이 다르다. 이런 빈들은 **스프링 컨테이너에 의해 자동으로 인식되어 특별한 작업을 위해 사용된다.**

스프링의 프록시 방식 AOP를 적용하려면 최소한 다음과 같은 네 가지 빈을 등록해야 한다.

* 자동프록시 생성기: 스프링의 **DefaultAdvisorAutoProxyCreator** 클래스를 빈으로 등록한다. 애플리케이션 컨텍스트가 빈을 생성할 때 빈 후처리로 참여한다. 빈으로 등록된 **어드바이저를 이용해서 프록시를 자동으로 생성한다.**
* 어드바이스: **부가기능을 구현한 클래스** 를 빈으로 등록한다.
* 포인트컷: 스프링의 **AspectJExpressionPointcut** 을 빈으로 등록하고 **expression** 프로퍼티에 포인트컷 표현식을 넣어주면 된다.
* 어드바이저: 스프링의 **DefaultPointcutAdvisor** 클래스를 빈으로 등록해서 사용하며 어드바이스와 포인트컷을 프로퍼티로 설정하면 된다. 자동프록시 생성기에 의해 자동 검색되어 사용된다.

스프링에서는 AOP와 관련된 태그를 정의해둔 **aop 스키마** 를 통해 간편하게 빈으로 등록할 수 있다. aop 스키마에 정의된 태그를 사용하려면 설정파일에 다음과 같이 추가한다.

~~~xml
<beans ...
  xmlns:aop="http://www.springframework.org/schema/aop"
  xsi:schemaLocation="...
  http://www.springframework.org/schema/aop
  http://www.springframework.org/schema/aop/spring-aop-4.3.xsd">
~~~

위와 같이 네임스페이스 선언을 추가해준 후, aop 네임스페이스를 통해 기존 AOP 관련 빈 설정을 다음과 같이 변경할 수 있다.
~~~xml
<!--    
    <bean id="transactionPointcut" class="org.springframework.aop.aspectj.AspectJExpressionPointcut">
        <property name="expression" value="execution(* *..*ServiceImpl.upgrade*(..))" />
    </bean>

    <bean id="transactionAdvisor" class="org.springframework.aop.support.DefaultPointcutAdvisor">
        <property name="advice" ref="transactionAdvice"/>
        <property name="pointcut" ref="transactionPointcut"/>
    </bean>

    <bean class="org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator" />
-->

    <!-- AOP 설정을 담는 부모태그로, 필요에 따라 AspectJAdvisorAutoProxyCreator를 빈으로 등록해준다. -->
    <aop:config>
        <!-- expression 표현식을 프로퍼티로 가진 AspectJExpressionPointcut을 빈으로 등록해준다. -->
        <aop:pointcut id="transactionPointcut" expression="execution(* *..*ServiceImpl.upgrade*(..))" />

        <!-- advice와 pointcut의 ref를 프로퍼티로 갖는 DefaultBeanFactoryPointcutAdvisor를 빈으로 등록해준다. -->
        <aop:advisor advice-ref="transactionAdvice" pointcut-ref="transactionPointcut" />
    </aop:config>
~~~

위의 주석처리된 포인트컷 및 어드바이저를 aop 태그를 통해 쉽게 AOP를 적용할 수 있다. 직접 구현한 클래스로 등록하는 어드바이스를 제외한 AOP 관련 빈들은 의미를 잘 드러내는 독립된 전용 태그를 사용하도록 권장된다.

[Use aop namespace](https://github.com/dhsim86/tobys_spring_study/commit/aeb468ad39e5ef0cbd1c61a32ddd23fbf4c90aac)

> 애플리케이션을 구성하는 컴포넌트 빈과 컨테이너에 의해 사용되는 기반 기능을 지원하는 빈은 구분이 되는 것이 좋다.


<br>
## 애스펙트 AOP

AOP는 모듈화된 부가기능과 적용 대상(포인트 컷)의 조합을 통해 여러 오브젝트에 산재해서 나타나는 공통적인 기능을 손쉽게 개발하고 관리하는 기술이다.

> 스프링은 자바 JDK에서 지원하는 다이내믹 프록시 기술을 통해 프록시 기반의 AOP 개발 기능을 제공한다.

> 프록시 방식의 AOP는 데코레이터 패턴 또는 프록시 패턴을 응용해서, 기존 코드에 영향을 주지 않은 채로 부가 기능을 타킷 오브젝트에 제공하는 객체지향 프로그래밍 모델로부터 출발한다.

<br>
### AOP 개발 방법

- AOP 인터페이스 구현과 빈 등록을 이용하는 방법
  - 가장 기초적인 개발 방식으로, AOP의 구성 요소를 모두 클래스로 개발하고 빈으르 등록하여 적용한다.
  - 스프링이 제공하는 어드바이스와 포인트컷 인터페이스를 구현하고, 어드바이저로 구성하여 빈으로 등록한다.
  - 어드바이저를 프록시로 만들어 자동으로 바꿔치기하는 자동 프록시 생성기 빈을 등록한다.
- AOP 인터페이스 구현과 aop 네임스페이스의 \<aop:advisor\> 태그 사용
  - aop 스키마의 태그를 통해 포인트컷과 어드바이저, 자동 프록시 생성기를 빈으로 등록하는 방법이다.
- 임의의 자바 클래스와 aop 네임스페이스의 \<aop:aspect\> 태그 사용
  - 어드바이스, 어드바이저 개념 대신 **애스펙트**라는 개념을 사용한다.
  - 일반적인 자바 클래스 및 XML 태그를 통해 애스펙트를 정의한다. (특정 인터페이스를 구현할 필요가 없다.)
- @AspectJ 애노테이션을 통한 애스펙트 개발
  - @AspectJ는 Aspect AOP 프레임워크에서 정의되는 애노테이션을 사용하여 애스펙트를 정의할 수 있게 해준다.
  - Aspect AOP의 애노테이션만 차용할 뿐, 여전히 프록시 기반의 AOP 방식이다.
  - @Transactional과 마찬가치로 AOP의 구성요소 (포인트 컷, 어드바이스)를 애노테이션을 이용해 정의할 수도 있도록 해준다.


> 애스펙트는 독립적인 AOP 모듈을 의미한다.

<br>
### 자동 프록시 생성기와 프록시 빈

스프링 AOP를 사용한다면 어떤 개발 방식을 사용하든 모두 **프록시 방식의 AOP**이다.
프록시 개념은 데코레이터 패턴에서 나온 것이고, 동작 원리는 JDK 다이내믹 프록시와 DI를 이용한다.

```java
public class Client {
    @Autowired
    private Target target;
}

public class Target {
    ...
}
```

위와 같이 두 개의 클래스가 있고, Target 클래스에 AOP를 통해 부가 기능을 제공하고자 할 때 문제가 있다.
**Client 클래스가 바로 Target 클래스를 바라보기 때문에, Client 클래스의 의존관계를 DI 컨테이너와 설정을 통해 바꿀 수 없기 때문이다.**

따라서 Client 클래스는 Target 클래스를 직접 의존하는 대신에 인터페이스를 통하여 느슨하게 연결하도록 해야 한다.

```java
public class Client {
    @Autowired
    private Interface intf;
}

interface Interface {
    ...
}

public class Target implements Interface {
    ...
}
```

위와 같이 코드를 정의하면 인터페이스를 통해 느슨하게 연결하였으므로, DI 설정을 조작하여 중간에 프록시 객체가 끼어들 수 있다. 하지만 여전히 문제가 있다.

Client 클래스는 @Autowired 애노테이션을 통한 자동 와이어링을 사용하는데, 프록시를 추가하면 **같은 Interface 를 구현한 빈이 2개가 된다.** 따라서 이 때 @Autowired를 통한 자동 빈 선택이 불가능해진다.

스프링은 이를 위해 자동 프록시 생성기를 이용해 컨테이너 초기화 중에 만들어진 **빈을 바꿔치기 해 프록시 빈을 자동으로 등록한다.** 자동 프록시 생성기는 **프록시 빈을 별도로 추가하는 것이 아니라, 타겟 오브젝트를 아예 자신이 포장하여 마치 그 빈처럼 동작하는 프록시 객체를 대체시키는 것이다.**

<br>

![02.png](/static/assets/img/blog/web/2017-09-11-toby_spring_06_aop_2/02.png)

위의 그림과 같이 자동 프록시 생성기를 통해 프록시를 생성하면 타겟 오브젝트가 빈으로 노출되지 않아 자동 와이어링을 진행할 수 있다.

이 때, 다른 클라이언트인 Client2가 다음과 같이 코드를 정의해놓았었다면 또 다른 문제가 발생한다.

```java
public class Client2 {
    @Autowired
    private Target target;
}
```

자동 프록시 생성기를 적용하기 전에는 문제가 없겠지만, AOP를 적용 후에는 타겟 오브젝트가 프록시 빈 안으로 숨겨짐으로써 문제가 발생하는 것이다. 
**Client2 입장에서는 Target 클래스 오브젝트를 찾을 수 없다. 자동 프록시 생성기가 등록하는 프록시 빈은 Target 클래스가 구현하던 Interface를 구현하는 다른 타입일 뿐이다.**

<br>

![03.png](/static/assets/img/blog/web/2017-09-11-toby_spring_06_aop_2/03.png)

자동 프록시 생성기의 기본 옵션은 프록시를 적용할 타겟이 구현한 모든 인터페이스를 프록시 빈도 구현하게 해주는 것이다. **프록시 빈의 클래스는 타겟 클래스와 같은 인터페이스를 구현할 뿐 다른 타입이다.**

---

JDK 다이내믹 프록시 방식을 활용한 AOP 적용시 주의사항이 있다. 애너테이션을 통해 AOP를 적용시, 클래스 뿐만 아니라 인터페이스에도 애너테이션을 붙여야 한다. 만약 인터페이스가 아닌 클래스에만 붙이면 다음과 같은 문제가 발생할 수 있다.

```java
public interface AopService {
    void childOnly();

    @AopTest
    void parentChildBoth();
}

@Service
public class AopServiceImpl implements AopService {
    @Override
    @AopTest
    public void childOnly() {
    }

    @Override
    @AopTest
    public void parentChildBoth() {
    }
}

@Getter
@Setter
@Aspect
@Component
public class AopObject {
    @Pointcut("execution(public * ((@AopTest *)+).*(..)) && within(@AopTest *)")
    private void executionOfAnyPublicMethodInAtAopTestType() {
    }

    @Pointcut("execution(@AopTest * *(..))")
    private void executionOfAopTestMethod() {
    }

    @Before("executionOfAnyPublicMethodInAtAopTestType() || executionOfAopTestMethod()")
    public void beforeWoved(JoinPoint joinPoint) {
        Method method = ((MethodSignature)joinPoint.getSignature()).getMethod();
        value.incrementAndGet();

        // 클래스에만 애너테이션을 달았을 경우, AopTest 애너테이션 객체를 얻을 수 없다!
        AopTest aopTestAnnotationOnMethod = method.getAnnotation(AopTest.class);
        if (aopTestAnnotationOnMethod == null) {
            foundAnnotationOnMethod = false;
        }
    }

    private AtomicInteger value = new AtomicInteger();
    private boolean foundAnnotationOnMethod = true;

    public void reset() {
        foundAnnotationOnMethod = true;
        value.set(0);
    }
}

// Spring Boot 2.0부터 디폴트 값이 true로, CGLib을 활용한 클래스 프록시 방식이 디폴트이다.
@SpringBootTest(properties = {
    "spring.aop.proxy-target-class=false"   
})
@RunWith(SpringRunner.class)
public class AopServiceWithJdkProxyTest {

    @Autowired
    private AopObject aopObject;

    @Autowired
    private AopService aopService;

    // JDK 다이내믹 프록시 방식이므로, 해당 빈을 찾을 수 없다.
    @Autowired(required = false)
    private AopServiceImpl aopServiceImpl;

    @Before
    public void beforeTest() {
        aopObject.reset();
    }

    @Test
    public void springDiTest() {
        assertThat(aopService).isNotNull();
        assertThat(aopServiceImpl).isNull();    // JDK 다이내믹 프록시 방식이므로, 해당 빈을 찾을 수 없다.

        assertThat(AopUtils.isJdkDynamicProxy(aopService)).isTrue();
    }

    @Test
    public void childOnlyTest() {
        given: {
        }
        when: {
            aopService.childOnly();
        }
        then: {
            assertThat(aopObject.getValue().get()).isEqualTo(1);

            // AopTest 애너테이션을 얻을 수 없다.
            assertThat(aopObject.isFoundAnnotationOnMethod()).isFalse();
        }
    }
    
    @Test
    public void parentChildBothTest() {
        given: {
        }
        when: {
            aopService.parentChildBoth();
        }
        then: {
            assertThat(aopObject.getValue().get()).isEqualTo(1);

            // 인터페이스, 클래스 모두 애너테이션을 달면 얻을 수 있다.
            assertThat(aopObject.isFoundAnnotationOnMethod()).isTrue();
        }
    }
}
```

클래스에만 붙이더라도 @Before 어드바이스가 적용되기는 하지만, 어드바이스 내에서 @AopTest 애너테이션 정보를 얻을 수 없다. 이를 해결하기 위해서는 AOP를 적용할 클래스 뿐만 아니라 해당 클래스가 구현하는 인터페이스 쪽에도 애너테이션을 달아야 한다.

> 클래스 프록시 방식을 사용할 경우에는 해당 문제가 없다.

<br>

### 클래스를 이용한 프록시

원래 스프링이 제공하는 AOP의 프록시는 인터페이스를 구현한 프록시이다.
JDK 다이내믹 프록시가 인터페이스를 사용하고, 프록시의 원리인 데코레이터 패턴과 DI도 인터페이스를 통한 의존관계를 사용하기 때문이다.

하지만 다음과 같이 인터페이스가 아닌 클래스를 직접 참조하는 경우에도 프록시를 적용시킬 수 있다.

```java
public class Client {
    @Autowired
    private Target target;
}

public class Target {
    ...
}
```

**타겟 클래스 자체를 인터페이스처럼 사용하는 것이다.**
클라이언트가 타겟 클래스에 의존하는 것은 변함이 없지만, 프록시를 구현할 때는 이 타겟 클래스를 상속받는 서브 클래스를 만들어 이를 프록시 빈으로 사용하는 것이다. 서브 클래스를 만들고 상속받은 모든 public 메소드를 오버라이드한다.

서브 클래스니까 클라이언트에 프록시 빈을 DI할 수 있다.

이 방식에는 다음과 같은 제약 사항이 있다.

- final 클래스 및 final 메소드는 적용이 되지 않는다.
  - fianl 클래스는 상속이 불가능하고, final 메소드는 오버라이드가 불가능하다.
- 타겟 클래스의 생성자가 두 번 호출된다.
  - 타겟 오브젝트와 프록시 빈을 생성하기 때문에 2번 호출되는 것이다.
- 클래스 프록시를 만들기 위해 CGLib이라는 별도의 라이브러리를 사용하게 된다.
- 타겟 오브젝트의 모든 public 메소드는 모두 프록시 대상으로 삼아 오버라이드한다.

> ~~스프링은 이 클래스를 이용한 프록시를 제공하는 것은 어디까지나 레거시 코드나 인터페이스가 없는 외부 라이브러리 클래스에 AOP를 적용할 수 있도록 만들어준 것일 뿐, 평소에 타겟 클래스를 직접 DI받아 사용하다가 AOP가 필요해지면 이를 이용하라는 것이 아니다.~~

> Spring Framework 4 부터 위의 제약 사항이 해결되었다. 이제 CGLib 라이브러리를 활용한 클래스 프록시 방식을 사용하더라도 objenesis 라이브러리를 통해 프록시 객체를 생성하여, 생성자가 두 번 호출되지 않는다.  또한 public 메소드를 대상으로 모두 프록시 대상으로 삼는 것이 아닌, 메서드 하나 하나 따로 AOP 설정이 가능하다. (final 클래스 및 final 메서드는 여전히 AOP 적용이 되지 않는다.)

스프링은 타깃 오브젝트가 인터페이스를 구현하고 있다면 인터페이스를 사용하는 JDK 다이내믹 프록시를 통해 프록시를 만들지만, 인터페이스가 없다면 CGLib을 통한 클래스 프록시를 만든다.

만약 인터페이스 유무에 상관없이 강제로 클래스 프록시를 사용하려면 다음과 같이 설정한다.

```java
 @Configuration
 @EnableAspectJAutoProxy(proxyTargetClass=true)
 public class AppConfig {
     // ...
 }
```

> Spring Boot 2.0부터 클래스 프록시 방식이 디폴트이다. (spring.aop.proxy-target-class 기본 값이 true이다.) CGLib을 활용한 이 클래스 프록시 방식은 바이트 코드 조작을 통한 일종의 캐싱 방식으로 JDK Dynamic 프록시 방식에 비해 성능 상의 이점도 존재한다. [What is the difference between JDK dynamic proxy and CGLib?
](https://stackoverflow.com/questions/10664182/what-is-the-difference-between-jdk-dynamic-proxy-and-cglib)


참고: [Spring Manual 5.8 Proxying Mechanisms](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-proxying)
