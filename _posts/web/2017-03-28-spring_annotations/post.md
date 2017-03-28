---
layout: post
title:  "Spring annotations"
date:   2017-03-28
desc: "Spring annotations"
keywords: "spring, spring boot, server programming"
categories: [Web]
tags: [spring, spring boot]
icon: icon-html
---

# DispatcherServlet

## Servlet Mapping, web.xml

원래 Java 웹 프로그래밍을 할 때 다음과 같이 **web.xml** 에 일일이 서블릿의 정보를 등록하여, 어떠어떠한 URL에 대한 요청을 처리할 수 밖에 없었다.

~~~xml
<servlet>
  <servlet-name>Hello</servlet-name>
  <servlet-class>Lesson03.servlets.HelloWorld</servlet-class>
</servlet>

<servlet>
  <servlet-name>MemberUpdateServlet</servlet-name>
  <servlet-class>Lesson04.MemberUpdateServlet</servlet-class>
  <init-param>
      <param-name>driver</param-name>
      <param-value>com.mysql.jdbc.Driver</param-value>
  </init-param>
  ...
</servlet>

<servlet-mapping>
  <servlet-name>Hello</servlet-name>
  <url-pattern>/Hello</url-pattern>
</servlet-mapping>

<servlet-mapping>
    <servlet-name>MemberUpdateServlet</servlet-name>
    <url-pattern>/member/Lesson04/update</url-pattern>
</servlet-mapping>
~~~

그렇지만 Spring MVC에서 **DispatcherServlet** 의 등장으로 특정 URL에 대한 처리를 위한 서블릿을 일일이 추가할 필요가 없어졌다.
DispatcherServlet 이 해당 서버 애플리케이션으로 들어오는 모든 요청을 **핸들링** 해주니까 말이다.

<br>
## web.xml의 역할 축소

물론 Sping MVC에서도 **web.xml** 의 역할은 아직도 중요하다. 일단 서블릿으로 DispatcherServlet 을 다음과 같이 등록하고 이 객체가 처리할 URL 적용 범위도 지정해야 한다.

~~~xml
<servlet>
  <servlet-name>appServlet</servlet-name>
  <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  <init-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>classpath:/spring/servlet-context.xml</param-value>
  </init-param>
  <load-on-startup>1</load-on-startup>
</servlet>

<servlet-mapping>
  <servlet-name>appServlet</servlet-name>
  <url-pattern>/</url-pattern>
</servlet-mapping>
~~~

또한 고급 서비스를 위해 **filter** 나 **listener** 를 등록하는 역할도 web.xml의 기능으로 남아있다.
~~~xml
<listener>
  <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>

...

<filter>
  <filter-name>encodingFilter</filter-name>
  <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
  <init-param>
    <param-name>encoding</param-name>
    <param-value>UTF-8</param-value>
  </init-param>
</filter>

<filter-mapping>
  <filter-name>encodingFilter</filter-name>
  <url-pattern>/*</url-pattern>
~~~

이제 DispatcherServlet 을 통해 web.xml에서 하던 \<servlet\> 매핑은 하지 않아도 좋다. 위 xml의 예와 같이 DispatcherServlet의 **url-pattern을 '/'을 설정함으로써 모든 요청은 DispatcherServlet 이 핸들링하게 된다.**

<br>
## DispatcherServlet의 역할

DispatcherServlet을 사용한다는 것은 Spring에서 제공하는 **@MVC** 를 이용하겠다는 뜻이다.
@MVC는 그동한 추상적으로만 알아오고 발전했던 **MVC (Model, View, Controller)** 설계 영역을 분할하여 사용자가 무조건 MVC로 애플리케이션을 설계하게끔 한다. (Spring이 전략패턴을 dependency injection 이란 이름하에 유도하는 방식과 마찬가지).
이 것은 어떤 사용자건간에, 모두 @MVC를 이용해 애플리케이션을 개발한다면 99% MVC 설계의 원칙대로 웹 애플리케이션이 제작될 수 있게 된다는 뜻이다.
<br>
![00.jpg](/static/assets/img/blog/web/2017-03-27-spring_dispatcherservlet/00.jpg)

우리가 @MVC 라는 이름하에 DispatcherServlet 클래스를 web.xml에 등록하는 순간, 모델 1 / 모델 2  대로 설계를 하고자 머리를 싸맬 필요가 없어진다. **@MVC는 모델 2방식으로 설계할 수 있도록 환경을 조성해주기 때문이다.**

> @MVC는 모델 2방식의 설계가 아니지만 코드를 작성하는 방식이 모델 2와 비슷하다.

---
이제 DispatcherServlet의 역할이 무엇인지 알아보자.
먼저 DispatcherServlet에 대해 간단히 정의하자면 **Model과 Controller, View를 조합하여 브라우저로 출력해주는 역할을 수행하는 클래스** 라 할 수 있다.
<br>
![01.png](/static/assets/img/blog/web/2017-03-27-spring_dispatcherservlet/01.png)

위의 두 그림은 DispatcherServlet이 어떤 식으로 클라이언트의 요청을 처리하고 응답하는지 나타낸 것이다.

(1) 클라이언트가 웹 애플리케이션에 요청하면, 그 URL 요청을 **DispatcherServlet** 이 가로챈다.
요청을 가로챌 수 있는 것은 web.xml에 등록된 **DispatcherServlet** 의 \<url-pattern\>이 '/'와 같이 해당 애플리케이션의 모든 URL로 등록되었기 때문이다.
~~~xml
<servlet>
  <servlet-name>appServlet</servlet-name>
  <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  ...
</servlet>

<servlet-mapping>
  <servlet-name>appServlet</servlet-name>
  <url-pattern>/</url-pattern>
</servlet-mapping>
~~~

(2) 가로챈 정보를 **HandlerMapping** 에게 보내 해당 요청을 처리할 수 있는 **Controller** 를 찾아낸다. 이 부분은 Spring의 디폴트 전략에 의해 **BeanNameUrlHandlerMapping** 과 **DefaultAnnotationHandlerMapping** 이 기본으로 설정되기 때문에 특별한 경우가 아니면 이 부분에 대해 따로 설정할 필요는 없다.

(3) **HandlerMapping** 이 해당 요청을 처리할 **Controller** 를 찾아내면 요청을 해당 **Controller** 에게 보내준다.
**Controller** 는 사용자가 직접 구현하는 부분이다. @MVC는 매우 다양한 코딩 방식과 직관적이고 편리한 Controller 작성 방법을 제공하므로, 자신에 알맞는 방식으로 개발해야 한다.

(4) **Controller** 는 해당 요청을 처리한 후에 요청을 응답받을 **View** 의 이름을 리턴하게 된다. (물론 다른 HandlerMapping 전략을 이용한다면 응답 과정이 다를 수 있다.)

(5) 그 때 이 이름을 **ViewResolver** 가 먼저 받아 해당하는 **View** 가 존재하는지 검색한다.

(6) 해당 **View** 가 있다면 View에 보낸다.

(7) 이 결과를 다시 **DispatcherServlet** 으로 보낸다.

(8) **DispatcherServlet** 은 최종 결과를 클라이언트로 전송한다.

<br>
## DispatcherServlet의 웹 요청 흐름

다시 한번 세부적으로 분석해보자. 클라이언트의 웹 요청시에 **DispatcherServlet** 에서 처리하는 흐름은 다음과 같다.
<br>
![05.jpg](/static/assets/img/blog/web/2017-03-27-spring_dispatcherservlet/05.jpg)

(1) **DispatcherServlet** 의 **doService** 메소드에서부터 웹 요청의 처리가 시작된다. **DispatcherServlet** 에서 사용되는 몇몇 정보를 **request** 객체에 담는 작업을 진행 후 **doDispatch** 메소드를 호출한다.

(2) 아래 (3) 부터 (13)의 작업은 **doDispatch** 메소드 안에 있다. **Controller / View** 등의 컴포넌트를 이용한 실제적인 웹 요청 처리가 이루어진다.


(3) **getHandler** 메소드는 **RequestMapping** 객체를 이용하여 요청에 해당하는 **Controller(Handler)** 를 얻는다.

(4) 요청에 해당하는 **Handler** 를 찾았다면 **Handler** 를 **HandlerExecutionChain** 이라는 객체에 담아 리턴하는데, 이 때 **HandlerExecutionChain** 은 요청에 해당하는 **intercepter** 들이 있다면 함께 담아서 리턴한다.

(5) 실행될 **intercepter** 들이 있다면 **intercepter** 의 **preHandle** 메소드를 차례로 실행한다.

(6) **Controller** 의 인스턴스는 **HandlerExecutionChain** 객체의 **getHandler** 메소드를 통해 얻는다.

(7) **getHandlerAdapter** 메소드는 **Controller** 에 적절한 **HandlerAdapter** 하나를 리턴한다.

(8) 선택된 **HandlerAdapter** 의 **handle** 메소드가 수행되는데, 실제 실행은 파라미터로 넘어온 **Controller** 를 실행한다.

(9) 계층형 **Controller** 의 경우 **handleRequest** 메소드가 실행된다. **@Controller** 인 경우 **HandlerAdapter(AnnotationMethodHandlerAdapter)** 가 **HandlerMethodInvoker** 를 통해 실행할 **Controller** 의 메소드를 **invoke()** 한다.

(10) **intercepter** 의 **postHandle** 메소드가 실행된다.

(11) **resolveViewName** 메소드는 논리적 뷰 이름을 가지고 해당 **View** 객체를 리턴한다.

(12) **Model** 객체의 데이터를 보여주기 위해 해당 **View** 객체의 **render** 메소드가 수행된다.

<br>
## DispatcherServlet이 처리하면 안되는 것들..

그런데 이런 방식일 경우 문제가 발생한다.
**DispatcherServlet** 이 모든 요청을 **Controller** 에게 넘겨주는 것은 괜찮은데, 모든 요청을 처리하다보니 이미지나 HTML을 불러오는 요청마처 전부 **Controller** 로 넘긴다는 것이다. 게다가 JSP 안의 자바스크립트나 스타일시트 파일도 전부 **DispatcherServlet** 이 요청을 가로채는 바람에 제대로 불러오지도 못하는 상황이다.
<br>
![02.jpg](/static/assets/img/blog/web/2017-03-27-spring_dispatcherservlet/02.jpg)

만약 이에 대해 예외 처리를 하지 않으면 위와 같이 에러가 로그에 기록될 것이다. **DispatcherServlet** 이 해당 요청을 처리할 **Controller** 를 찾지 못했다는 메시지이다. 이 문제를 해결하기 위해 방법이 몇 가지가 있다.

(1) **DispatcherServlet** 이 처리할 URL과 자바와 관련없는 Resource의 영역을 분리시키는 것

  * /apps: 클라이언트가 이 URL로 접근하면 앞으로 **DispatcherServlet** 이 담당.
  * /resources: 이 URL은 **DispatcherServlet** 이 처리하지 않는 영역으로 분리

  근데 이 방식은 상당히 코드가 지저분해지는데 form에서 모든 요청을 보낼 때 **apps** 라는 URL를 붙여주어야 하므로 직관적인 설계가 불가능해진다.

(2) 모든 요청을 **Controller** 에 등록하는 방법

  이 방식은 대규모 서비스를 위한 웹 애플리케이션이라면 해서는 안되는 방법이다.

---
Spring 에서는 이 문제를 해결함과 동시에 굉장히 편리한 해결 방법을 고안해 내었다.
바로 **\<mvc: resource /\>** 이다. 보통 IDE에서 생성하면 **servlet-context.xml** 에 다음과 같은 구문이 있을 것이다.
~~~xml
...
<mvc:resources mapping="resources/**" location="resources/"/>
...
~~~

이 전략은 다음과 같다. 먼저 **DispatcherServlet** 을 통해 요청을 처리하는데 만약 **DispatcherServlet** 이 해당 요청에 대한 **Controller** 를 찾을 수 없다면 2차적으로 위의 설정된 경로를 검색하여 해당 자원을 찾아내는 것이다.

실제로 많은 대형 웹서비스들의 비 애플리케이션 자원 URL을 보면 철저하게 static 성격의 외부 자원들을 분리시켜 사용하고 있다.
다음은 네이버 메인 페이지에 대한 page source이다. 밑의 그림과 같이 **static.naver.net** URL을 통해 이런 자원들을 분리하고 있다.
<br>
![03.png](/static/assets/img/blog/web/2017-03-27-spring_dispatcherservlet/03.png)

또한 페이스북은 **static.ak.fbcdn.net** 과 같은 URL로 분리시키고 있다. 이런 예를 볼 때 차후 확장을 위해 비애플리케이션 자원은 반드시 분리해야될 영역이라는 것을 알 수 있다.
