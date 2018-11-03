---
layout: post
title:  "Toby's Spring Chap 10: IOC 컨테이너와 DI"
date:   2018-11-03
desc: "Toby's Spring Chap 10: IOC 컨테이너와 DI"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

<br>
## IoC 컨테이너: 빈 팩토리와 애플리케이션 컨텍스트

스프링에서는 오브젝트의 생성과 관계설정, 사용, 제거 등의 작업을 애플리케이션 코드 대신 독립된 **컨테이너가 담당한다.**

컨테이너가 오브젝트에 대한 제어권을 가지고 있으므로, **IoC**라고 부른다. 따라서 스프링 컨테이너를 **IoC 컨테이너**라고도 한다.

이 컨테이너를 두 가지 관점에서 볼 수 있다.

* 빈 팩토리: 오브젝트의 생성과 오브젝트 사이의 런타임 관계를 설정하는 DI 관점으로 볼 때
* 애플리케이션 컨텍스트: 빈 팩토리의 기능 이외에, 여러 컨테이너 기능을 추가한 것

스프링의 빈 팩토리와 애플리케이션 컨텍스트는 각 기능을 대표하는 **BeanFactory**와 **ApplicationContext** 라는 두 개의 인터페이스로 정의되어 있다.

* ApplicationContext: BeanFactory 인터페이스를 상속한 서브인터페이스

```java
public interface ApplicationContext extends ListableBeanFactory, HierarchicalBeanFactory, MessageSource, ApplicationEventPublisher, ResourcePatternResolver {
  ...
}
```

> 스프링 컨테이너 또는 IoC 컨테이너라고 부르는 것은 바로 이 ApplicationContext 인터페이스를 구현한 클래스의 오브젝트이다.

<br>
### IoC 컨테이너를 이용해 애플리케이션 만들기

IoC 컨테이너를 만드는 간단한 방법은 다음과 같이 ApplicationContext 구현 클래스의 인스턴스를 만드는 것이다.

```java
StaticApplicationContext sc = new StaticApplicationContext();
```

이렇게 만들어지는 컨테이너가 본격적인 IoC 컨테이너로서 동작하려면 **POJO 클래스와 설정 메타정보**이다.

---
**POJO 클래스**

애플리케이션의 핵심 로직을 담는 POJO 클래스를 준비해야 한다.
**특정 기술과 스펙에서 독립적이고 다른 POJO 클래스들끼리 느슨한 결합을 갖도록 만들어야 한다.**

다음과 같이 인터페이스를 두고 유연한 확장성을 가진 POJO 클래스를 만든다.

<br/>

![00.png](/static/assets/img/blog/web/2018-11-03-toby_spring_10_ioc_container_and_di/00.png)

