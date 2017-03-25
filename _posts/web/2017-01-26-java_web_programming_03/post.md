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

## Front Controller

* 컨트롤러를 만들다 보면 요청 데이터를 처리하는 코드나, 모델과 뷰 제어코드가 중복되는 경우가 있음

<br>
### Front Controller Pattern

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

> 프론트 컨트롤러 디자인 패턴에서는 두 개의 컨트롤러를 사용하여 웹 브라우저 요청 처리
프론트 컨트롤러: VO 객체 준비, 뷰 컴포넌트로 위임, 오류 처리 등 공통 작업
페이지 컨트롤러: 요청한 페이지만을 위한 작업 수행

* 디자인 패턴: 시스템이 운영되면서 검증된 방법을 체계적으로 분류되어 정의된 것
* 프레임워크: 디자인 패턴을 적용해 만든 사례 중 베스트를 모아 하나의 개발 틀로 표준화
ㅅ

<br>
### 구현

[https://github.com/dhsim86/java_webdev_workbook/commit/6d803f61cd555875806931046701c97d8194d088](https://github.com/dhsim86/java_webdev_workbook/commit/6d803f61cd555875806931046701c97d8194d088)
[https://github.com/dhsim86/java_webdev_workbook/commit/df970742bdb81726048959595023f57ea1873e46](https://github.com/dhsim86/java_webdev_workbook/commit/df970742bdb81726048959595023f57ea1873e46)

* HttpServlet 요청 처리 방법
  * Service 메소드 오버라이딩
    * 매개변수로 ServletRequest, ServletResponse가 아닌 **HttpServletRequest**, **HttpServletResponse**

  * 클라이언트로부터 요청 발생
    * 서블릿 컨테이너는 규칙에 따라 Servlet 인터페이스의 **service** 메소드 호출
    * **service** (ServletRequest, ServletResponse) 메소드는 HttpServlet 클래스에 추가된
    **service** (HttpServletRequest, HttpServletResponse) 메소드 호출.
    * **service** (HttpServletRequest, HttpServletResponse) 메소드는 HTTP 요청 프로토콜 분석 후 **doGet / doPost** 호출
