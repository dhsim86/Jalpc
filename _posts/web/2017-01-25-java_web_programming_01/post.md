---
layout: post
title:  "Java Web Programming Summary Note 01: Servlet and JDBC"
date:   2017-01-25
desc: "Java Web Programming Summary Note 01: Servlet and JDBC"
keywords: "java, web"
categories: [Web]
tags: [java, web]
icon: icon-html
---

> Java Web Development Workbook Chapter. 04

### Retrieve Database
* 서블릿이 주로 하는 일은 클라이언트가 요청한 데이터를 다루는 일 **(CRUD)**
* 데이터 입력 / 변경 / 삭제 등을 처리하려면 DB의 도움을 받아야 함
  * DB에 요청을 전달하고 결과를 받을 때 사용하는 도구
    * 자바에서는 **JDBC** 를 사용
  * DB에 명령을 내릴 때 사용할 언어
    * SQL

<br>
### Prepare JDBC driver for mysql.
~~~xml
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <version>5.1.40</version>
</dependency>
~~~
<br>
### Database 연결

~~~java
@Override
 public void service(ServletRequest request, ServletResponse response)
  throws ServletException, IOException {
    Connection conn = null;
    Statement stmt = null;
    ResultSet rs = null;

    try {
      DriverManager.registerDriver(new com.mysql.jdbc.Driver());
      conn = DriverManager.getConnection("jdbc:mysql://localhost/studydb?useUnicode=true&characterEncoding=UTF-8",
      "study", "study");

      stmt = conn.createStatement();
      rs = stmt.executeQuery(
        "select mno, mname, email, cre_date" +
        " from members" +
        " order by mno asc"
        );
        ...
~~~

* DriverManager를 이용, **java.sql.Driver** 인터페이스 구현체 등록
  * mysql JDBC driver는 **com.mysql.jdbc.Driver** 클래스
  * DriverManager는 이 인터페이스에서 connect 메서드를 통해 DB 연결 수행

  * **java.sql.Driver** interface 메서드
    * getMajorVersion / getMinorVersion
    * acceptsURL: JDBC URL이 이 드라이버에서 사용가능 여부
    * connect: 데이터베이스 연결

* DriverManager의 getConnection 메서드를 통해 mysql 서버 연결
  * 1 번째 파라미터: JDBC URL
    * DriverManager는 이 URL를 승인하는 드라이버 찾아 연결
  * 2/3 번째 파라미터: 사용자 아이디 및 암호
    * 리턴 값: DB 접속 정보를 다루는 java.sql.Connection 인터페이스의 구현체

  * JDBC URL
    * ex) jdbc:mysql://localhost/studydb
    * jdbc:mysql -> JDBC 드라이버 이름
    * //localhost/studydb: 서버 주소 및 DB 이름

* java.sql.Connection: DB 접속 정보를 다룸

  * createStatement, prepareStatement, prepareCall: SQL문을 실행하는 객체 리턴
  -> **java.sql.Statement** 인터페이스의 구현체

  * commit / rollback: 트랜잭션 처리

* java.sql.Statement: SQL문을 서버에 쿼리 날릴 수 있음.

  * executeQuery: SQL 문을 실행. 보통 select 구문

  * executeUpdate: DML / DDL 관련 SQL 문 (ResultSet 만들지 않는 것)
    * DML: insert, update, delete (Data Manipulation Language)
    * DDL: create, alter, drop (Data Definition Language)

  * execute: select 뿐만 아닌 DML / DDL 모두 실행 가능
  * executeBatch: addBatch 메서드로 등록한 여러 개의 SQL문을 한 번에 처리.
  * 리턴 값: 질의 결과인 java.sql.ResultSet 인터페이스의 구현체 리턴
<br>
* java.sql.ResultSet: SQL 질의 결과
  * first: 서버에서 첫 번째 레코드를 리턴
  * last: 서버에서 마지막 레코드 리턴
  * previous: 서버에서 이전 레코드 리턴
  * next: 서버에서 다음 레코드 리턴
  * getXXX: 레코드에서 특정 컬럼의 값을 꺼내어 XXX라는 타입에 따라 리턴.
  ex) getInt(“MNO")
  * updateXXX: 레코드의 특정 컬럼의 값을 변경
  * deleteRow: 현재 레코드를 지움
  * [https://github.com/dhsim86/java_webdev_workbook/commit/2fcf87872e851f78aeafa139b3f9613a3637b183](https://github.com/dhsim86/java_webdev_workbook/commit/2fcf87872e851f78aeafa139b3f9613a3637b183)
<br>
* java.sql.PreparedStatement
  * 반복적인 질의를 하거나 입력 매개변수가 많을 때 유용.
    * SQL문을 미리 준비해두어 컴파일해놓고, 입력 매개변수 값만 추가하여 전송
  * 이미지나 바이너리 데이터를 사용할 때 PreparedStatement만 가능
  * 입력 매개 변수 인덱스는 SQL문에서 '?'로 표시된 입력 항목으로 1부터 시작.
    * 문자열이면 setString, 정수면 setInt
  * update할 때 executeUpdate 호출

* SQL문을 서버로 보내는 것인가?
  * 로컬에서 **SQL문을 실행하는 것이 아니라 JDBC API에서 SQL문을 보내고 결과를 받는 역할**
  * DB 전용 프로토콜에 맞게 변환하여 보내고 받음

<br>
### HttpServlet

![00.png](/static/assets/img/blog/web/2017-01-24-java_web_programming_01/00.png)

* **GenericServlet** 의 하위 클래스
* 일반적인 서블릿 객체는 반드시 **service** 메서드를 구현해야 함.
* HttpServlet의 경우 먼저 service 함수가 호출되고, 클라이언트의 요청에 따라 **doGet / doPost / doPut** 등의 메서드를 호출
* [https://github.com/dhsim86/java_webdev_workbook/commit/ea4a2e34907c04ae445365b619b9adda2c3c7836](https://github.com/dhsim86/java_webdev_workbook/commit/ea4a2e34907c04ae445365b619b9adda2c3c7836)

<br>
### Refresh
* HttpServletResponse의 addHeader 메서드를 이용, **Refresh 헤더** 를 추가함으로써 클라이언트의 웹브라우저가 자동으로 URL 열도록 함.
  * response.addHeader("Refresh", "1; url=list");
* HTML 본문의 <head> 태그안에 <meta> 태그를 이용해 Refresh 헤더를 추가 가능
  * \<meta http-equiv='Refresh' content='1; url=list'>”);
* [https://github.com/dhsim86/java_webdev_workbook/commit/f8cb79246c521ed65615e3aa04a8b6ea9b2eb913](https://github.com/dhsim86/java_webdev_workbook/commit/f8cb79246c521ed65615e3aa04a8b6ea9b2eb913)

<br>
### Redirect
* 웹 페이지의 해당 결과를 출력하지 않고 다른 페이지로 이동할 때 Redirect 사용
  * response.sendRedirect("list")
    * 상대 경로를 사용
  * 클라이언트에서는 HTTP 응답 코드를 302로 받음
    * 302: 요청한 자원이 다른 URL로 이동되었으니 Location 헤더에 있는 주소로 다시 요청할 것.
* [https://github.com/dhsim86/java_webdev_workbook/commit/4b15d454fc3eaffd1db7966ab4247eeaa522f8e5](https://github.com/dhsim86/java_webdev_workbook/commit/4b15d454fc3eaffd1db7966ab4247eeaa522f8e5)

<br>
### 서블릿 초기화 매개변수
* 서블릿 생성 및 초기화, **init()** 을 호출할 때 서블릿 컨테이너가 전달하는 데이터
* 초기화 매개변수 전달 방법
  * 초기화 매개변수, web.xml
    * <init-param> 서블릿 초기화 매개변수 설정 태그, <servlet>의 자식 엘리먼트
    * **this.getInitParameter** 로 얻을 수 있음.
      * this.getInitParameter("driver”)
    * 매개변수를 선언한 서블릿에서만 사용가능
    * [https://github.com/dhsim86/java_webdev_workbook/commit/36afd540e4b7cd3a5d32aa2f4a98c0a500ea3695](https://github.com/dhsim86/java_webdev_workbook/commit/36afd540e4b7cd3a5d32aa2f4a98c0a500ea3695)
  * 컨텍스트 초기화 매개변수
    * <context-param> 서블릿들이 공유하는 초기화 매개 변수 설정 태그
    * ServletContext sc = this.getServletContext() 식으로 객체를 얻은 후,
    * sc.getInitParameter("driver") 로 얻을 수 있음
    * [https://github.com/dhsim86/java_webdev_workbook/commit/721b501c24e284682b33caa99375e0f6a41871c7](https://github.com/dhsim86/java_webdev_workbook/commit/721b501c24e284682b33caa99375e0f6a41871c7)
  * MemberDeleteServlet class
    * [https://github.com/dhsim86/java_webdev_workbook/commit/9e64996750182cacc22c64c2209d3af1f015c979](https://github.com/dhsim86/java_webdev_workbook/commit/9e64996750182cacc22c64c2209d3af1f015c979)
  * MemberListServlet class
    * [https://github.com/dhsim86/java_webdev_workbook/commit/8379248c6bbe439ab5583f19c8de02dde20d3e49](https://github.com/dhsim86/java_webdev_workbook/commit/8379248c6bbe439ab5583f19c8de02dde20d3e49)

<br>    
### 필터
* 서블릿 공통적으로 실행 전 후에 어떤 작업을 하고자 할 때 사용
  * 클라이언트가 보낸 데이터의 암호 해제, 필요한 자원을 준비, 로그 남기기 등
  * 서블릿에 담는다면 서블릿마다 코드 삽입해야 하므로 번거로움
  <br>
  ![01.png](/static/assets/img/blog/web/2017-01-24-java_web_programming_01/01.png)

* 구현

~~~xml
<!-- filters -->
<filter>
  <filter-name>CharacterEncodingFilter</filter-name>
  <filter-class>Lesson04.CharacterEncodingFilter</filter-class>
  <init-param>
    <param-name>encoding</param-name>
    <param-value>UTF-8</param-value>
  </init-param>
</filter>

<!-- filter mapping -->
  <filter-mapping>
  <filter-name>CharacterEncodingFilter</filter-name>
  <url-pattern>/*</url-pattern>
  </filter-mapping>
~~~

  * web.xml에서 <filter> 태그 및 <filter-mapping>을 통해 매핑
  * <init-param> 등을 통해 필터 초기화 매개변수를 설정할 때, FilterConfig 객체를
통해 꺼낼 수 있음. config.getInitParameter("")
  * **init()**
    * 필터 객체가 생성되고 나서 준비 작업을 위해 한 번 호출됨
  * **doFilter()**
    * 필터와 연결된 URL에 대한 요청이 들어올 때 항상 호출
    * **nextFilter** 는 다음 필터를 가리킴 (nextFilter.doFilter 호출)
    * 서블릿 실행되기 전에 작업이 있으면 **doFilter 호출 전에** 작성
    * 서블릿 실행된 후 작업이 있으면 **doFilter 호출 후에** 작성
  * destroy()
    * 서블릿 컨테이너가 웹 애플리케이션을 종료하기 전에 필터들에 destroy 호출
  * [https://github.com/dhsim86/java_webdev_workbook/commit/19bc501f927555bee31be1502059ce67be125bdf](https://github.com/dhsim86/java_webdev_workbook/commit/19bc501f927555bee31be1502059ce67be125bdf)

<br>
### href를 통한 서블릿 호출
![02.png](/static/assets/img/blog/web/2017-01-24-java_web_programming_01/02.png)
