---
layout: post
title:  "Toby's Spring Chap 06: AOP part.2"
date:   2017-09-11
desc: "Toby's Spring Chap 06: AOP part.2"
keywords: "spring, spring boot"
categories: [Web]
tags: [spring, spring boot]
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
