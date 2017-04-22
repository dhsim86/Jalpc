---
layout: post
title:  "Java Web Programming Summary Note 03: Mini MVC Framework"
date:   2017-01-26
desc: "Java Web Programming Summary Note 03: Mini MVC Framework"
keywords: "java, web, server programming"
categories: [Web]
tags: [java, web, server programming]
icon: icon-html
---

> Java Web Development Workbook Chapter. 06

# Front Controller

* 컨트롤러를 만들다 보면 요청 데이터를 처리하는 코드나, 모델과 뷰 제어코드가 중복되는 경우가 있음

<br>
## Front Controller Pattern

![00.png](/static/assets/img/blog/web/2017-01-26-java_web_programming_03/00.png)

* 웹 브라우저에서 요청들어올 때, **프론트 컨트롤러** 에서 요청을 받음
  * VO 객체 생성 후, 데이터를 담음
  * ServletRequest 보관함에 VO 객체 저장
  * 요청 URL에 따라 페이지 컨트롤러로 위임
* 페이지 컨트롤러는 DAO를 사용하여 VO 객체 처리
  * 화면 생성을 위한 데이터 준비 후, ServletRequest 보관소에 저장
  * 프론트 컨트롤러로 뷰 정보를 넘김
* 프론트 컨트롤러는 JSP로 실행 위임
  * 오류 발생시 error 페이지로 실행 위임
* JSP는 데이터를 가지고 화면 생성 후 출력
* 프론트 컨트롤러는 응답 완료

프론트 컨트롤러 디자인 패턴에서는 두 개의 컨트롤러를 사용하여 웹 브라우저 요청 처리
* 프론트 컨트롤러: VO 객체 준비, 뷰 컴포넌트로 위임, 오류 처리 등 공통 작업
* 페이지 컨트롤러: 요청한 페이지만을 위한 작업 수행

---
* 디자인 패턴: 시스템이 운영되면서 검증된 방법을 체계적으로 분류되어 정의된 것
* 프레임워크: 디자인 패턴을 적용해 만든 사례 중 베스트를 모아 하나의 개발 틀로 표준화
---

<br>
## 구현

[[ch06] 6.1 Implemented DispatcherServlet.
](https://github.com/dhsim86/java_webdev_workbook/commit/6d803f61cd555875806931046701c97d8194d088)
<br>
[[ch06] 6.1 Updated servlets according to DispatcherServlet.](https://github.com/dhsim86/java_webdev_workbook/commit/df970742bdb81726048959595023f57ea1873e46)

* HttpServlet 요청 처리 방법
  * HttpServlet의 service 메소드 오버라이딩 (GenericServlet의 service 메소드가 아님)
    * 매개변수로 ServletRequest, ServletResponse가 아닌 **HttpServletRequest**, **HttpServletResponse**

  * 클라이언트로부터 요청 발생
    * 서블릿 컨테이너는 규칙에 따라 Servlet 인터페이스의 **service** 메소드 호출
    * **service** (ServletRequest, ServletResponse) 메소드는 HttpServlet 클래스에 추가된
    **service** (HttpServletRequest, HttpServletResponse) 메소드 호출.
    * **service** (HttpServletRequest, HttpServletResponse) 메소드는 HTTP 요청 프로토콜 분석 후 **doGet / doPost** 호출

<br>
## 요청 URL에서 서블릿 경로 알아내기

* 프론트 컨트롤러의 역할: 클라이언트의 요청을 적절한 페이지 컨트롤러에게 전달
  * 요청을 처리할 서블릿의 URL을 알아내야 함.

* HttpServletRequest의 메소드를 이용, 요청 URL에서 특정 정보를 추출가능
  * ex: http://localhost:9999/web06/member/list.do?pageNo=1&pageSize=10
<br>

| 메서드 | 설명 | 반환값 |
| ---------- | :--------- | --------- |
| getRequestURL() | 요청 URL 리턴 (단, 매개변수 제외) | http://localhost:9999/web06/member/list.do |
| getRequestURI() | 서버 주소를 제외한 URL | /web06/member/list.do |
| getContextPath() | 웹 애플리케이션 경로 | /web06 |
| getServletPath() | 서블릿 경로 | /member/list.do |
| getQueryString() | 요청 매개변수 정보 | pageNo=1&pageSize=10 |

<br>
## Controller 추가

* 페이지 컨트롤러를 서블릿으로 만들 필요가 없음
  * 일반 클래스로 전환, 메소드로 호출
  * 프론트 컨트롤러와 일반 클래스로 전환된 컨트롤러 사이에 인터페이스 정의 및 구현
[[ch06] 6.2 Implemented controllers.](https://github.com/dhsim86/java_webdev_workbook/commit/819632323644a2951361b01eb926d373e60dac1d)

<br>
## DI를 이용한 빈 의존성 관리

특정 작업 수행시, 사용하는 객체를 **"의존객체"**, 이 관계를 **의존관계** 라고 한다.
<br>
![01.jpg](/static/assets/img/blog/web/2017-01-26-java_web_programming_03/01.jpg)

* B 객체를 A객체가 사용할 경우

<br>
### 의존 객체와의 결합도 증가에 따른 문제

* 의존 객체 사용시, 사용하는 쪽과 객체사이의 결합도가 높으면 변경이 발생할 때 바로 영향을 받음
* 의존 객체를 다른 객체로 대체하기가 어려움

<br>
### 의존 객체를 외부에서 주입

의존객체를 직접 생성 및 관리하는 것이 아닌 **외부에서 주입** 받는 방식
<br>
![02.png](/static/assets/img/blog/web/2017-01-26-java_web_programming_03/02.png)

* 의존 객체를 전문으로 관리하는 **빈 컨테이너** 를 사용
* 빈 컨테이너: 의존 객체를 관리 및 주입해주는 역할 (DI, Dependency Injection)

<br>
### 인터페이스 사용

의존객체를 사용시, 구체적인 클래스 대신 **인터페이스를 사용**

* 인터페이스를 통해 의존객체가 갖추어야할 규격을 정의, 유연성 확보
* 사용할 의존객체에 대한 선택 폭을 넓히고, 확장성 고려, 교체하기 쉬움
<br>
![03.png](/static/assets/img/blog/web/2017-01-26-java_web_programming_03/03.png)

[[ch06] 6.3 Use dependency injection on MemberDao and interface.](https://github.com/dhsim86/java_webdev_workbook/commit/aa3e526bb5d73d2a8390e9f2dc32e4bd24ec9551)

<br>
## 리플렉션 API를 이용한 프론트 컨트롤러 개선

다음과 같이 페이지 컨트롤러를 추가할 때마다 코드를 변경해야 함.
~~~java
if ("/member/list.do".equals(servletPath)) {
}
else if ("/member/add.do".equals(servletPath)) {
    if (request.getParameter("email") != null) {
        model.put("member",
            new Member().setEmail(request.getParameter("email"))
                        .setPassword(request.getParameter("password"))
                        .setName(request.getParameter("name")));
    }
}
else if ("/member/update.do".equals(servletPath)) {
  ...
~~~

<br>
### DataBinding 정의

* **ServletRequestBinder** 를 이용하여 페이지 컨트롤러가 원하는 형식의 값 VO 객체를 생성
* 페이지 컨트롤러가 원하는 데이터 형식을 알아내기 위한 인터페이스 정의
~~~java
public interface DataBinding {
  Object[] getDataBinders(); // new Object[] {"Data name", Data Type, "Data name", Data Type, ...}
}
~~~
* Object 배열은 데이터의 이름과 타입 정보를 담은 배열
* 프론트 컨트롤러가 이 배열을 통해 데이터 정보를 얻어옴
* 프론트 컨트롤러는 **Reflection API** 를 통해 해당 타입의 오브젝트를 생성 후, request 파라미터로부터 값을 오브젝트에 주입

<br>
### Reflection API

* 클래스나 메소드의 내부 구조를 조사할 때 사용
* 이 API를 사용하여 컨트롤러가 필요한 타입을 조사하여 알맞게 값을 주입시켜줄 수 있음

[[ch06] 6.4 Used reflection API.](https://github.com/dhsim86/java_webdev_workbook/commit/3e216743932df295d0be19ca948aa4ec38e77a55)

<br>
## 프로퍼티를 이용한 객체 관리

다음과 같이 DAO나 페이지 컨트롤러를 추가할 때마다 ContextLoaderListener에서 코드를 변경해야 함
~~~java
public class ContextLoaderListener implements ServletContextListener {

  ...

  @Override
  public void contextInitialized(ServletContextEvent event) {

    try {
      ...

      MemberDao memberDao = new MySqlMemberDao();
      memberDao.setDataSource(dataSource);

      sc.setAttribute("/auth/login.do", new MemberLoginController().setMemberDao(memberDao));
      sc.setAttribute("/auth/logout.do", new MemberLogoutController());
      sc.setAttribute("/member/list.do", new MemberListController().setMemberDao(memberDao));

      ...
    }
~~~

<br>
### ApplicationContext 를 통한 객체 생성 및 관리

ContextLoaderListener 에서 ApplicationContext를 생성 및 객체 관리
* ApplicationContext 생성
* ApplicationContext 는 프로퍼티 파일을 로드
* 프로퍼티 파일에 선언되어 있는대로 객체 생성 및 객체 테이블에 저장
* 객체 테이블에 저장된 각 객체에 대해 의존 객체를 찾아 주입
  * 타입과 일치하는 의존 객체를 찾아 주입

<br>
#### 프로퍼티 파일의 로딩

ApplicationContext 생성자가 호출될 때, 매개변수로 지정된 프로퍼티 파일의 내용을 로딩.
* **java.util.Properties** 사용
* Properties 는 "이름=값" 형태로 된 파일을 다룰 때 사용하는 클래스
  * **load()**: 파일을 읽어, 프로퍼티 내용을 키-값 형태로 맵에 보관
  * **keySet()**: 키 목록 반환

key 값을 통해 value (type)을 얻어 필요한 빈을 생성
~~~java
for (Object item : props.keySet()) {
  key = (String)item;
  value = props.getProperty(key);
  ...

  objTable.put(key, Class.forName(value).newInstance());

  ...
~~~

[[ch06] 6.5 Used ApplicationContext.](https://github.com/dhsim86/java_webdev_workbook/commit/00751f14e53c3647c110cf142237b60c93fac948)

<br>
## Annotation을 이용한 객체 관리

* Annotation
  * 컴파일이나 배포, 실행 시 참조할 수 있는 특별한 주석
  * 클래스나 필드, 메소드에 대해 부가 정보를 등록

* ApplicationContext는 자바 classpath를 뒤져서 annotation이 붙은 클래스를 검색
* Annotation에 지정된 정보에 따라 인스턴스 생성

~~~java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface Component {
	String value() default "";
}
~~~
* interface 키워드 앞에 **@** 가 붙음
* 객체 이름을 저장하는 용도로 사용할 **"value"** 속성을 정의
  * **default**: 기본값을 지정

<br>
### Annotation 유지 정책

Annotation 정보를 언제까지 유지할 것인지 설정

~~~java
@Retention(RetentionPolicy.RUNTIME)
~~~

| Policy | Description |
| ---------- | :--------- |
| RetentionPolicy.SOURCE | 소스파일에서만 유지, 컴파일할 때 제거됨, 클래스 파일에 annotation 정보가 없음 |
| RetentionPolicy.CLASS | 클래스파일에 기록됨, 실행시에는 유지되지 않음, 실행 중일 때는 클래스에 기록된 정보를 꺼낼 수 없음 |
| RetentionPolicy.RUNTIME | 클래스파일에 기록됨, 실행시에도 유지됨. 실행 중일 때도 정보 참조 가능 |

> Annotation 정책을 지정하지 않으면 디폴트로 RetentionPolicy.CLASS 로 지정됨

<br>
#### Reflections package를 사용

자바 classpath를 뒤져서 클래스 정보를 추출하기 위해 **"Reflections"** 오픈소스 라이브러리 사용
* 자바에서 제공하는 Reflection API 사용하는 것보다 쉽게 추출 가능

~~~xml
<dependency>
  <groupId>org.reflections</groupId>
  <artifactId>reflections</artifactId>
  <version>0.9.10</version>
</dependency>
~~~

[[ch06] 6.6 Use annotation to regiter bean with Reflections library.](https://github.com/dhsim86/java_webdev_workbook/commit/f1c8738a6a6c859c496508981712ad6fbb3d4cd9)

<br>
## Project 관리 구현

[[ch06] 6.7 Exercise #0, Implemented printing the list of projects.](https://github.com/dhsim86/java_webdev_workbook/commit/52af366be24e86ddd6b2b4d3f714a1dd58a31dc1)
<br>
[[ch06] 6.7 Exercise #1, Implemented the management of projects.](https://github.com/dhsim86/java_webdev_workbook/commit/f23c69a9d1c81f2669278855827763c24d5d6f4d)
