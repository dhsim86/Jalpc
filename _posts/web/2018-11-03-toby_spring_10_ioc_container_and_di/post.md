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

---
**설정 메타정보**

두 번째로 필요한 것은 POJO 클래스 중에 **애플리케이션에서 사용할 것을 선정하고 이를 IoC 컨테이너가 제어할 수 있도록 메타정보를 만들어 제공하는 작업이다.**

IoC 컨테이너의 가장 기초적인 역할은 **오브젝트를 생성하고 이를 관리**하는 것이다.

> 스프링 컨테이너가 관리하는 오브젝트를 빈(Bean)이라고 한다.

설정 메타정보는 바로 이 빈을 어떻게 만들고 어떻게 동작할 것인가에 관한 정보이다.

> 스프링의 설정 메타정보는 XML 파일이 아니다. XML 파일을 통해 설정 메타정보로 활용하는 것은 맞지만, XML로 된 설정 메타정보를 가진 것은 아니다.

스프링의 설정 메타정보는 **BeanDefinition** 인터페이스로 표현되는 순수한 추상정보이다.

애플리케이션 컨텍스트는 바로 이 BeanDefinition으로 만들어지는 메타정보를 담은 오브젝트를 사용해 IoC와 DI 작업을 수행한다.

메타정보는 특정한 파일 포맷이나 형식에 제한되거나 종속되지 않는다. BeanDefinition으로 정의되는 스프링의 설정 메타정보의 내용을 표현한 것이 있다면 무엇이든 사용 가능하다. 원본의 포맷과 구조, 자료의 특성에 맞게 읽어와 BeanDefinition 오브젝트로 변환해주는 **BeanDefinitionReader**가 있으면 된다.

IoC 컨테이너가 사용하는 빈 메타정보는 다음과 같다.

* 빈 아이디, 이름, 별칭: 빈 오브젝트를 구분할 수 있는 식별자
* 클래스 또는 클래스 이름: 빈으로 만들 POJO 클래스 또는 서비스 클래스 정보
* 스코프: 싱글톤, 프로토타입과 같은 빈의 생성 방식 및 존재 범위
* 프로퍼티 값 또는 참조: DI에 사용할 프로퍼티 이름과 값 또는 참조하는 빈의 이름
* 생성자 파라미터 값 또는 참조: DI에 사용할 생성자 파라미터 이름과 값 또는 참조할 빈의 이름
* 지연된 로딩 여부, 우선 빈 여부, 자동와이어링 여부, 부모 빈 정보, 빈팩토리 이름 등

스프링 IoC 컨테이너는 설정 메타정보를 읽은 후, 이를 참고하여 빈 오브젝트를 생성하고 프로퍼티나 생성자를 통해 의존 오브젝트를 주입해주는 DI 작업을 수행한다. 이를 통해 DI로 연결되는 오브젝트들이 모여 하나의 애플리케이션을 구성하고 동작하게 된다.

<br/>

![01.png](/static/assets/img/blog/web/2018-11-03-toby_spring_10_ioc_container_and_di/01.png)

스프링 애플리케이션이란 **POJO 클래스와 설정 메타정보를 이용하여 IoC 컨테이너가 만들어주는 오브젝트의 조합**이라고 할 수 있다.

[StaticApplicationContext Test](https://github.com/dhsim86/tobys_spring_study/commit/27f17f983af95cee26f262669780f031c1f75c35)

IoC 컨테이너가 관리하는 빈은 **오브젝트 단위지 클래스 단위가 아니다.** 경우에 따라서는 하나의 클래스를 통해 여러 개의 빈으로 등록할 때도 있다.

다음은 BeanDefinition의 기본적인 구현 클래스인 **RootBeanDefinition** 오브젝트를 통해 메타정보를 직접 만들어 등록하는 방법이다.

```java
// 빈 메타정보를 담은 오브젝트 생성. <bean class="Hello"/> 메타정보
BeanDefinition helloDef = new RootBeanDefinition(Hello.class);

// 빈의 name 프로퍼티에 들어갈 값 지정 <property name="name" value="Spring" />
helloDef.getPropertyValues().addPropertyValue("name", "Spring");

// 빈 메타정보를 hello2 라는 이름의 빈으로 등록 <bean id="hello2" ... />
ac.registerBeanDefinition("hello2", helloDef);
```

IoC 컨테이너는 빈 설정 메타정보를 담은 BeanDefinition을 이용해 오브젝트를 생성하고 DI 작업을 진행한 후 빈으로 사용할 수 있도록 등록해준다. 

[BeanDefinition Register Test](https://github.com/dhsim86/tobys_spring_study/commit/263a2b7557223713d244f25ae5079092b190f77b)

빈에 DI 되는 프로퍼티는 값 뿐만 아니라 다른 빈 오브젝트를 가리키는 레퍼런스도 주입할 수 있다. 이는 **다른 빈 오브젝트를 주입함으로써 오브젝트 사이의 관계를 만들어낸다.** IoC 컨테이너는 이를 참고하여 런타임 시에 관계를 맺어준다.

DI 진행시 **BeanReference** 타입의 레퍼런스 오브젝트를 **addPropertyValue** 메소드의 파라미터로 넘겨주면 된다.

[DI Test using BeanDefinition](https://github.com/dhsim86/tobys_spring_study/commit/a1077873ef932ad3c191af5ddfdb36c6fc3f25be)
