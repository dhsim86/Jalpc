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
