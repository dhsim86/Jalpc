---
layout: post
title:  "Java Web Programming Summary Note 02: MVC Architecture"
date:   2017-01-25
desc: "Java Web Programming Summary Note 02: MVC Architecture"
keywords: "java, web, server programming"
categories: [Web]
tags: [java, web, server programming]
icon: icon-html
---

> Java Web Development Workbook Chapter. 05

Chapter05. MVC Architecture

### MVC (Model-View-Architecture)

![00.png](/static/assets/img/blog/web/2017-01-25-java_web_programming_02/00.png)
* Model
  * **비즈니스 로직 및 데이터 처리** 담당
  * 사용자가 요청한 데이터를 다루는 일
* View
  * 모델이 처리한 결과, **화면 생성** 담당
  * 모델이 처리한 데이터나 작업 결과를 가지고 화면을 만듬
* Controller
  * **요청 처리 및 흐름 제어** 담당
  * 클라이언트 요청받을 시, 모델 컴포넌트 호출
    * 모델에 데이터 전달하기 쉽게 가공
    * 결과에 대한 화면 생성하도록 뷰에 전달
* 장점
  * 화면 생성 부분을 별도로 분리하였으므로, 뷰 교체만으로 사용자 화면을 쉽게 변경 가능
  * 원 소스 멀티 유즈 구현 가능
    * 모델 컴포넌트가 작업한 결과를 다양한 뷰 컴포넌트로 클라이언트가 원하는 형식으로 출력 가능
  * 코드 재사용 용이
    * 재사용가능하므로 개발속도가 빨라짐

<br>
### MVC 구동 원리
* MVC 구조 (웹 애플리케이션)
<br>
![01.png](/static/assets/img/blog/web/2017-01-25-java_web_programming_02/01.png)

* 웹 서버가 요청을 받아 서블릿 컨테이너로 넘김.
* 서블릿 컨테이너는 서블릿 찾아서 실행
* 서블릿은 실제 업무를 처리하는 모델 자바 객체의 메서드 호출
  * 웹 브라우저가 보낸 데이터를 저장하거나 변경해야 한다면, 그 데이터를 가공하여 값 객체를 생성 후 모델 객체의 메서드 호출 때 인자로 넘김
* 모델 객체는 JDBC를 활용, 값 객체를 데이터베이스에 넘기거나 질의 결과를 받아서 값 객체로 만들어 반환
* 서블릿은 결과를 JSP에 전달
* JSP는 서블릿으로부터 받은 값 객체를 참조하여 출력할 결과 화면을 만듬

<br>
### JSP  
* 웹 브라우저가 출력할 화면을 생성
  * 서블릿이 직접 출력 함수를 이용해 화면을 만드는 것보다 용이.
  * 콘텐츠를 출력하는 코딩을 단순화가 목적
* JSP의 실행
<br>
![02.png](/static/assets/img/blog/web/2017-01-25-java_web_programming_02/02.png)
  * JSP 파일 작성 후 클라이언트가 요청하면 JSP 파일에 대응하는 자바 서블릿 실행
  * 서블릿이 없거나 JSP 파일이 변경되었다면 JSP 엔진을 통해 JSP 파일을 해석 후 **서블릿 자바 소스 생성**
  * 서블릿 자바 소스는 자바 컴파일러를 통해 클래스 파일로 컴파일 됨
  * 생성된 서블릿은 service 함수를 통해 서비스하고 출력 메서드를 통해 HTML 화면을 웹 브라우저로 보냄
* JSP 엔진이 자바 출력문을 생성하므로 HTML 작성하기가 쉬워짐
* 뷰 컴포넌트를 만들 때 JSP 사용

<br>
### HttpJspPage 인터페이스
* JSP 엔진은 JSP 파일로부터 서블릿 클래스 생성할 때 **HttpJspPage** 인터페이스를 구현한 클래스 생성
<br>
![03.png](/static/assets/img/blog/web/2017-01-25-java_web_programming_02/03.png)
* JspPage
  * **jspInit**
    * JspPage에 생성된 jspInit은 JSP 객체 (JSP로부터 생성된 서블릿 객체)가 생성될 때 호출
      * 자동 생성된 서블릿 코드를 보면 init 호출될 때 **jspInit을 호출**
      * JSP 페이지에서 init 오버라이딩이 아닌 jspInit을 오버라이딩
  * **jspDestory**
    * JSP 객체가 언로드될 때 호출
  * **_jspService**
    * JSP 페이지가 해야 할 작업이 들어 있는 메서드
    * 서블릿 컨테이너가 service를 호출하면 service에서는 **_jspService** 호출

<br>
### 5. JSP 객체 분석
* 서블릿 클래스 이름은 Hello_jsp, 이름 짓는 방식은 서블릿 컨테이너마다 다름
* Hello_jsp는 HttpJspBase를 상속
  * **HttpJspBase**는 톰캣에서 제공하는 클래스로, **HttpJspPage** 인터페이스 구현 및 **HttpServlet** 클래스 상속받은 클래스
* **_jspService**
  * 매개변수는 HttpServletRequest, HttpServletResponse
  * 로컬 변수 중 반드시 존재해야하는 객체 (JSP 내장 객체)
  * jsp 파일에 생성한 출력문을 그대로 **_jspService** 메서드에서 구현됨.

<br>
### HttpJspBase
* HttpServlet 클래스 상속 및 HttpJspPage 인터페이스 구현
  * init -> jspInit 호출
  * destory -> jspDestroy 호출

<br>
### JSP 구성 요소
* 템플릿 데이터
  * 클라이언트로 출력되는 콘텐츠 (HTML, 자바스크립트, 스타일 시트 등)
  * 별도의 문법이 없이 **문서 작성 하듯 출력할 내용을 작성**
* JSP 전용 태그
  * 특정 **자바 명령문으로 바뀜**
  * <%@ 지시자 속성="값" 속성="값" ... %>
    * 지시자나 속성에 따라 자바 코드 생성
    * page 지시자
      * JSP 페이지와 관련된 속성을 정의
      * language 속성
        * 스크립트릿이나 표현식, 선언부 작성시 사용할 프로그래밍 언어 명시
        * JSP 페이지에 삽입되는 코드의 스크립팅 언어를 지정
      * contentType 속성
        * 출력할 데이터의 MIME 타입과 문자 집합
        * 자바가 문자열 출력시 pageEncoding이나 contentType에 설정된 **문자 집합으로 변환**
      * pageEncoding 속성
        * 출력할 데이터의 문자 집합
      * pageEncoding 및 contentType 속성은 **response.setContentType** 호출 코드 생성
      * import 속성
        * java의 import 처리
        <br>
        ![04.png](/static/assets/img/blog/web/2017-01-25-java_web_programming_02/04.png)

    * 스크립트릿 <% ... %>
      * JSP 페이지 안에 자바 코드 생성시 스크립트릿 태그 (<% %>)안에 작성
      * 서블릿 파일 생성 시 그대로 복사
      * **_jspService** 함수 내부에 복사됨

    * JSP 내장 객체
      * JSP에서는 선언없이 바로 사용가능한 9개 객체 정의
      * request, response, pageContext, session, application, config, out, page, exception

      * 스크립트릿 및 표현식 (<%= %>)에서 작성된 자바코드는 **_jspService** 메서드로 복사될 때 **JSP 내장 객체를 선언한 문장 뒤에 놓임.**

    * 선언문 <%! ... %>
      * 서블릿 클래스의 멤버 (변수나 메서드)를 선언할 때 사용
      * JSP 내에 어디에 있든 상관없음.
        * **_jspService 밖** 의 클래스 블록에 복사됨

    * 표현식 <%= %>
      * **문자열 출력 때** 사용, out.print()의 인자 값으로 복사됨
      * **_jspService** 안에 순서대로 복사
  * [https://github.com/dhsim86/java_webdev_workbook/commit/e4aff02d5bd4bda61e6c333ec52d7108e484ac8b](https://github.com/dhsim86/java_webdev_workbook/commit/e4aff02d5bd4bda61e6c333ec52d7108e484ac8b)

<br>
### 서블릿에서 뷰 분리하기
* 서블릿은 데이터를 준비 (모델 역할) / JSP에 전달 (컨트롤러 역할)
* JSP는 준비한 데이터를 가지고 웹 브라우저로 출력할 화면을 만듬
* JSP에 데이터를 준비하기 위해 값 객체 (VO)가 필요
  * RequestDispatcher
    * 다른 서블릿이나 JSP로 작업 위임시 사용
    * HttpServletRequest로부터 얻음

    * forward
      * 서블릿으로 제어권 위임. 돌아오지 않음.
      * jsp에서 jsp로 포워드 위임 <jsp:forward page=".jsp"/>
    * include
      * 제어권을 넘기면 그 서블릿이 작업 후 다시 제어권이 돌아옴
      * jsp에서 jsp로 인클루딩 위임 <jsp:include page=".jsp"/>
      <br>
      ![05.png](/static/assets/img/blog/web/2017-01-25-java_web_programming_02/05.png)

  * ServletRequest
    * 클라이언트 요청을 다루는 기능외에, **어떤 값을 보관하는 보관소 기능도 지님.**
    * setAttribute
      * 값을 보관.
    * getAttribute
      * 값을 꺼냄
      <br>
      ![06.png](/static/assets/img/blog/web/2017-01-25-java_web_programming_02/06.png)
      <br>
      ![07.png](/static/assets/img/blog/web/2017-01-25-java_web_programming_02/07.png)
    * [https://github.com/dhsim86/java_webdev_workbook/commit/e0d969a0ead645d8df5f61d38445a77ab5865c87](https://github.com/dhsim86/java_webdev_workbook/commit/e0d969a0ead645d8df5f61d38445a77ab5865c87)
    * [https://github.com/dhsim86/java_webdev_workbook/commit/75a56320b6268fa3dfc689f748e3283bc9cc4e04](https://github.com/dhsim86/java_webdev_workbook/commit/75a56320b6268fa3dfc689f748e3283bc9cc4e04)

<br>
### 데이터 보관소
* 데이터 공유 방법. 서블릿 기술은 네 가지 종류의 데이터 보관소를 제공
<br>
![08.png](/static/assets/img/blog/web/2017-01-25-java_web_programming_02/08.png)
* ServletContext 보관소
  * 웹 애플리케이션이 시작될 때 생성 및 종료될 때까지 유지되는 객체
  * 모든 서블릿이 사용 가능
  * jsp에서는 **application** 변수를 통해 참조
  * HttpServlet으로 부터 상속 후, init 및 destroy 메서드 오버라이딩 후 보관소 사용
  * [https://github.com/dhsim86/java_webdev_workbook/commit/7e0cbaf44ef2bb732b4f9838dbba1abc5387da16](https://github.com/dhsim86/java_webdev_workbook/commit/7e0cbaf44ef2bb732b4f9838dbba1abc5387da16)

* HttpSession 보관소
  * 클라이언트 최초 요청시 생성 후 브라우저를 닫을 때까지 유지
    * 클라이언트 당 하나 생성
    * HttpSession 객체는 그 웹브라우저로부터 일정 시간 동안 timeout 요청이 없으면 삭제 됨
  * 로그인할 때 초기화, 로그아웃하면 비움.
  * jsp에서는 session 변수를 통해 참조
  * [https://github.com/dhsim86/java_webdev_workbook/commit/a53bb3830196ccde678f34e73c0c36e2229e659f](https://github.com/dhsim86/java_webdev_workbook/commit/a53bb3830196ccde678f34e73c0c36e2229e659f)

* ServletRequest 보관소
  * 요청이 들어올 때 생성 후 응답할 때까지 유지
  * 포워딩이나 인클루딩하는 서블릿들 사이에서 값을 공유할 때 유용
    * request나 response를 같이 사용
  * request 변수를 통해 참조

* JspContext 보관소
  * jsp 페이지를 실행하는 동안만 유지
    * jsp 페이지 내부에서만 사용될 데이터 공유하는데 사용
  * 태그 핸들러는 JspContext만 참조가능 (Include된 jsp에서 다른 jsp의 로컬 변수는 참조 불가)
  * jsp에서는 pageContext를 통해 참조

* 모든 보관소는 setAttribute 및 getAttribute를 통해 값을 다룸

<br>
### JSP 액션 태그
  * JSP에서 기본으로 제공하는 태그
  * <jsp:useBean>
    * application, session, request, page 보관소에 저장된 자바 객체를 꺼낼 수 있음
    * [https://github.com/dhsim86/java_webdev_workbook/commit/216642d0148bf249d6805f05b7ab7305453f14f4](https://github.com/dhsim86/java_webdev_workbook/commit/216642d0148bf249d6805f05b7ab7305453f14f4)

  * 5.7 Exercise
    * [https://github.com/dhsim86/java_webdev_workbook/commit/efa163c7299540903e5194f7f42d478af27d10b8](https://github.com/dhsim86/java_webdev_workbook/commit/efa163c7299540903e5194f7f42d478af27d10b8)

<br>
### EL
* 콤마와 대괄호를 사용하여 자바 빈의 프로퍼티나 맵, 리스트, 배열의 값을 쉽게 꺼내주는 기술
* static으로 선언된 메서드를 호출 가능
* ${} -> 즉시 적용.
* #{} -> 지연 적용. 시스템에서 필요하다고 판단하면 사용
  * 객체의 프로퍼티보다는 사용자가 입력한 값을 객체의 프로퍼티에 담는 용도
* pageContext.findAttribute
  * 보관소를 뒤져서 객체를 찾음.
  * JspContext -> ServletRequest -> HttpSession -> ServletContext -> null
* ServletRequest에서 값을 꺼내는 코드
  * ${requestScope.member.no}
    * Member obj = (Member)request.getAttribute("member");
    int value = ojb.getNo();
  * 보관소를 지정하면 해당 보관소에서만 객체를 찾음.
* [https://github.com/dhsim86/java_webdev_workbook/commit/5a6fb0f6507ffd6ece0bcc03169bfa428f525774](https://github.com/dhsim86/java_webdev_workbook/commit/5a6fb0f6507ffd6ece0bcc03169bfa428f525774)
* [https://github.com/dhsim86/java_webdev_workbook/commit/b605749655ad4f563fb388537b360d5399b50855j](https://github.com/dhsim86/java_webdev_workbook/commit/b605749655ad4f563fb388537b360d5399b50855j)

<br>
### JSTL
* Maven Dependency

~~~xml
<!-- JSTL -->
<dependency>
  <groupId>javax.servlet</groupId>
  <artifactId>jstl</artifactId>
  <version>1.2</version>
</dependency>

<dependency>
  <groupId>taglibs</groupId>
  <artifactId>standard</artifactId>
  <version>1.1.2</version>
</dependency>
~~~

* JSTL 확장 태그를 사용
  * <%@ taglib uri=“사용할 태그의 라이브러리 URI” prefix=“접두사” %>
  * [https://github.com/dhsim86/java_webdev_workbook/commit/7a835c8e1c9c7b093782d81e92810c673c6ed04a](https://github.com/dhsim86/java_webdev_workbook/commit/7a835c8e1c9c7b093782d81e92810c673c6ed04a)
  * [https://github.com/dhsim86/java_webdev_workbook/commit/7fe7f26ea2d0e57f11007cb3d55d41ac4995b9fd](https://github.com/dhsim86/java_webdev_workbook/commit/7fe7f26ea2d0e57f11007cb3d55d41ac4995b9fd)

<br>
### DAO
* 데이터 처리를 전문으로 하는 객체 (Data Access Object)
  * DB나 파일 / 메모리 등을 이용, 애플리케이션 데이터를 CRUD 하는 역할
  * 하나의 DB 테이블이나 뷰에 대응
* [https://github.com/dhsim86/java_webdev_workbook/commit/d616b7a0b1e963dd41611aafb65aaec78dd81486](https://github.com/dhsim86/java_webdev_workbook/commit/d616b7a0b1e963dd41611aafb65aaec78dd81486)