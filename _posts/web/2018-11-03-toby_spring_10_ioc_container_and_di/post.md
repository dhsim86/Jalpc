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

<br>
### IoC 컨테이너의 종류와 사용 방법

스프링에는 다양한 용도로 사용할 수 있는 여러 ApplicationContext 구현 클래스가 존재한다. 보통 직접 ApplicationContext 오브젝트를 생성하는 경우는 거의 없다.

---
**StaticApplicationContext**

코드를 통해 빈 메타정보를 등록하기 위해 사용한다. 실전에서는 사용하면 안된다.

---
**GenericApplicationContext**

가장 일반적인 ApplicationContext의 구현 클래스다. 실전에서 사용될 수 있는 모든 기능을 갖추고 있으며, 컨테이너의 주요 기능을 DI를 통해 확장할 수 있다.

XML 파일과 같은 **외부 리소스에 있는 빈 설정 메타정보를 리더를 통해 읽어 메타정보로 변환하여 사용한다.**

특정 포맷의 빈 설정 메타정보를 읽어 이를 애플리케이션 컨텍스트가 사용할 수 있는 BeanDefinition 정보로 변환하는 기능을 가진 오브젝트는 **BeanDefinitionReader** 인터페이스를 구현해서 만들고, 빈 설정정보 리더로 불린다.

XML을 읽을 수 있는 리더는 **XmlBeanDefinitionReader** 이다.
이 리더는 스프링의 리소스 로더를 통해 XML 내용을 읽어온다. 따라서 다양한 리소스 타입의 XML 문서를 읽을 수 있다.

[GenericApplicationContext / XmlBeanDefinitionReader Test](https://github.com/dhsim86/tobys_spring_study/commit/dd0128b8de239c96c65e167378ad900c023b1a86)

스프링 IoC 컨테이너가 사용할 수 있는 **BeanDefinition** 오브젝트로 변환만 할 수 있다면 설정 메타정보는 어떤 포맷으로 만들어져도 상관없다. 예를 들어 프로퍼티 파일을 통해 빈 설정 메타정보륾 가져오는 **PropertiesBeanDefinitionReader** 도 제공한다.

빈 설정 리더를 만들기만 하면 어떤 형태로도 빈 설정 메타정보를 작성할 수 있다.

GenericApplicationContext는 여러 개의 빈 설정 리더를 사용해서 여러 리소스로부터 설정 메타정보를 읽어들이게도 할 수 있다.

스프링 테스트 컨텍스트 프레임워크를 활용하는 JUnit 테스트는 테스트내에서 사용할 수 있도록 애플리케이션 컨텍스트를 자동으로 만들어준다. 이 때도 사용되는 애플리케이션 컨텍스트는 GenericApplicationContext 이다.

```java
// 애플리케이션 컨텍스트 생성과 동시에 XML 파일을 읽어오고 초기화까지 수행한다.
@RunWith(SpringJunit4ClassRunner.class)
@ContextConfiguration(locations = "/text-applicationContext.xml")
public class UserServiceTest {
  @Autowired ApplicationContext applicationContext;
}
```

---
**GeneticXmlApplicationContext**

GenericApplicationContext 및 XmlBeanDefinitionReader가 결합된 클래스이다.

```java
GenericApplicationContext ac = new GeneticXmlApplicationContext("/text-applicationContext.xml");
Hello hello = ac.getBean("hello", Hello.class);
```

---
**WebApplicationContext**

스프링 애플리케이션에서 가장 많이 사용되는 애플리케이션 컨텍스트이다. 웹 환경에서 사용할 때 필요한 기능을 추가된 것이다. XML 설정파일을 사용하도록 만들어지는 클래스는 **XmlWebApplicationContext** 이다.

스프링 IoC 컨테이너는 빈 설정 메타정보를 통해 오브젝트를 만들고 DI 작업을 수행한다. 그러나 그것만으로는 애플리케이션이 동작하지 않는다. **누군가가 특정 빈의 메소드를 호출해서 애플리케이션을 기동해야 한다.**

```java
ApplicationContext sc = ...
Hello hello = ac.getBean("hello", Hello.class);
hello.print(); // 메인 메소드의 역할을 하는 빈의 메소드를 한 번은 호출해야 애플리케이션이 동작한다.
```

IoC 컨테이너의 역할은 **빈 오브젝트 생성 및 DI 한 후, 최초로 애플리케이션을 기동할 빈 하나를 제공해주는 것까지이다.**

그런데 웹 애플리케이션의 동작방식은 일반적인 애플리케이션과는 다르다. 웹 환경에서는 **서블릿 컨테이너가 HTTP 요청을 받아 해당 요청에 매핑된 서블릿을 실행해주는 방식으로 동작한다.** 서블릿이 일종의 main 메소드와 같은 역할을 하는 것이다.

스프링에서는 main 메소드 역할을 하는 서블릿을 만들어두고, 애플리케이션 컨텍스트를 초기화한 다음, 요청이 서블릿으로 올 때마다 필요한 빈을 가져와 정해진 메소드를 실행해주는 방식으로 동작한다.

<br/>

![02.png](/static/assets/img/blog/web/2018-11-03-toby_spring_10_ioc_container_and_di/02.png)

독립 애플리케이션과 다른 점은 main 메소드에서 했던 작업을 특정 서블릿이 대신하는 것이다.

스프링에서 애플리케이션 컨텍스트를 생성하고 설정 메타정보를 초기화한 후, 클라이언트로부터 들어오는 요청마다 적절한 빈을 찾아 이를 실행해주는 기능을 가진 **DispatchServlet** 이름의 서블릿을 제공한다. 이 서블릿을 **web.xml**에 등록하는 것만으로 웹 환경에서 스프링 컨테이너가 만들어지고 애플리케이션을 실행할 수 있다.

WebApplicationContext의 특징은 자신이 만들어지고 동작하는 환경인 웹 모듈에 대한 정보를 접근할 수 있다는 점이다. 웹 환경으로부터 정보를 가져오거나 자신을 웹 환경에 노출시킬 수 있다.

<br>
### IoC 컨테이너 계층 구조
