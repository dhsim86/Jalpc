---
layout: post
title:  "Java Web Programming Summary Note 00: Servlet Programming"
date:   2017-01-24
desc: "Java Web Programming Summary Note 00: Servlet Programming"
keywords: "java, web, server programming"
categories: [Web]
tags: [java, web, server programming]
icon: icon-html
---

> Java Web Development Workbook Chapter. 03

### Servlet Programming
**서블릿** 기술을 이용해 웹 애플리케이션 개발

<br>
### CGI
* 웹 애플리케이션은 웹 서버가 프로그램 찾아서 실행 및 결과를 리턴받음.
* 웹 서버는 그 결과를 **HTTP 형식** 에 맞추어 웹 브라우저로 리턴.
* CGI: 웹 서버와 프로그램 사이의 데이터를 주고 받는 규칙
  * Common Gateway Interface
<br>
### CGI Program
* 웹 서버에 의해 실행되며, **CGI 규칙** 에 따라 웹 서버와 데이터를 주고받는 프로그램
* Compile Language: C / C++ / Java
* Script Language: Perl, PHP, Python, VBScript

<br>
### Java CGI Program
* Compile 방식, Servlet
* **웹 서버와 직접 데이터를 주고 받지 않으며**, 전문 프로그램, 서블릿 컨테이너 (ex. Tomcat) 에 의해 관리
* 서블릿 컨테이너
  * 서블릿의 생성 및 실행, 소멸 관리
  * 서블릿을 대신하여 CGI 규칙에 따라 웹 서버와 교환
  * 개발자는 **서블릿 컨테이너와 서블릿의 규칙** 을 알아야 함.
      * JavaEE 기술 사양에 포함되어 있음
      <br>
       ![00.png](/static/assets/img/blog/web/2017-01-24-java_web_programming_00/00.png)

<br>       
### Servlet, JSP vs Java EE vs WAS
* Java EE with Servlet
  * Java EE 기술 사양은 여러가지 복합 기술들을 정의
  * 계속 버전 업되고 새로운 기술들이 추가됨
  * Java로 웹 애플리케이션을 개발한다는 것은 Servlet과 JSP 기술을 이용
* WAS
  * 애플리케이션 서버: 서버 쪽 애플리케이션 생성과 실행, 소멸을 관리
  * WAS: 서블릿과 서블릿 컨테이너와 같이 웹 기술을 기반으로 하는 서버, Web Application Server
    * Java에서 말하는 WAS란 Java EE 기술 사양을 준수하여 만든 서버
  * 서블릿 컨테이너: 서블릿, JSP 등 웹 부분만 구현한 서버 (웹 컨테이너)
    * Tomcat, Resin, Jetty.

<br>
### Web Project Directory 구조
* src
  * Java source, 서블릿 클래스, 필터, 리스너
* build / classes
  * Java clsss 파일
* WebContent
  * HTML, CSS, JavaScript, JSP, 이미지 파일 등 웹 콘텐츠
  * 웹 애플리케이션을 배치할 때 그대로 복사됨
* WebContent / WEB-INF
  * 웹 애플리케이션의 설정과 관련된 파일
  * 클라이언트에서 요청 불가
* WebContent / WEB-INF / web.xml
  * 웹 애플리케이션 배치 설명서. (Deployment Descriptor)
  * 웹 애플리케이션 컴포넌트들의 배치 정보
  * 서블릿 컨테이너는 클라이언트 요청을 처리할 때, 이 정보를 참고
* WebContent / WEB-INF / lib
  * Java Archive (.jar) 파일을 두는 디렉토리.

<br>
### javax.servlet.Servlet interface

* 서블릿 클래스는 **javax.servlet.Servlet** 인터페이스를 구현
* 서블릿 컨테이너가 서블릿에 대해 호출할 메서드를 정의한 것이 Servlet 인터페이스
* 서블릿의 생명 주기 메서드
  * init
    * 서블릿 컨테이너가 서블릿 생성 후 초기화 작업 수행
    * 클라이언트 요청 처리 전 준비할 작업
  * service
    * 클라이언트가 요청할 때마다 호출
    * 서비스 작업
  * destroy
    * 서블릿 컨테이너가 종료되거나 웹 애플리케이션이 멈출 때, 비활성화시킬 때
    * 자원 해제, 데이터 저장 등 마무리 작업
  * 서블릿의 기타 메서드
    * getServletConfig
      * 서블릿 설정 정보를 다루는 ServletConfig 객체 리턴
      * 서블릿 이름과 초기 매개변수 값, 환경정보
    * getServletInfo
      * 서블릿을 작성한 사람에 대한 정보, 서블릿 버전, 권리 등

<br>
### 서블릿 배치 정보 작성 (web.xml)
* 웹 애플리케이션의 배치 정보를 담고 있는데, 서블릿 컨테이너가 이를 참고
* 서블릿 선언

~~~xml
<servlet>
    <servlet-name>AppInitServlet</servlet-name>
    <servlet-class>AppInitServlet</servlet-class>
</servlet>
~~~
* 서블릿 URL 부여

~~~xml
<servlet>
    <servlet-name>AppInitServlet</servlet-name>
    <servlet-class>AppInitServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>
~~~
  * 서블릿을 요청할 때 클라이언트가 사용할 URL 설정

<br>
### 서블릿 구동 절차
1. 클라이언트 요청 -> 서블릿 컨테이너는 서블릿 검색
2. 서블릿이 없으면 서블릿 클래스 로딩, 인스턴스 준비 및 생성자 및 **init()** 호출
3. 클라이언트의 요청을 처리하는 **service()** 호출
4. service()에서 만든 결과를 HTTP 프로토콜에 맞추어 클라이언트에 response.
5. 시스템 운영자가 서블릿 컨테이너나 웹 애플리케이션을 종료하면 생성된 모든 서블릿에 대해 **destroy()** 호출

<br>
### 서블릿 인스턴스
* 서블릿 인스턴스는 하나만 생성되어 웹 애플리케이션이 종료될 때까지 사용.
* 인스턴스 변수에 특정 사용자를 위한 데이터를 저장하거나 일시적 데이터 보관용도로 사용하면 안됨.

<br>
### \<welcome-file\>
* 웰컴 파일은 디렉토리의 기본 웹 페이지
* 여러 개 정의되어 있으면 위에서부터 아래로 순차적으로 조회. 먼저 찾은 것을 response.

~~~xml
<!-- welcome file setting -->
<welcome-file-list>
  <welcome-file>index.html</welcome-file>
  <welcome-file>index.htm</welcome-file>
  <welcome-file>index.jsp</welcome-file>
  <welcome-file>default.html</welcome-file>
  <welcome-file>default.htm</welcome-file>
  <welcome-file>default.jsp</welcome-file>
</welcome-file-list>
~~~

<br>
### 웹 애플리케이션 배치
* 프로젝트의 Web 폴더에 들어있는 모든 파일과 폴더가 배치 폴더(Context root)로 복사
  * WebContent 폴더에 있는 모든 내용이 배치 폴더로 폭사
  * 컴파일된 자바 클래스들은 **배치폴더/WEB_INF/classes** 에 복사
* 웹 아카이브 (.war), Web Archive
  * 배치할 파일들을 하나의 웹 아카이브 파일로 만들어 배치 폴더에 복사

<br>
### GenericServlet
* Servlet 인터페이스를 구현할 때의 문제점인 "모든 추상 메서드를 구현해야한다" 라는 단점을 해소하기 위해 **GenericServlet** 추상 클래스 사용
* 하위 클래스에게 공통의 필드와 메서드를 상속.
**init() / destroy() / getServletConfig() / getServletInfo()** 를 미리 구현하여 상속
* **service()를 별도로 구현**
  * GenericServlet에 구현되어 있지 않음.
  <br>
  ![01.png](/static/assets/img/blog/web/2017-01-24-java_web_programming_00/01.png)

<br>
### ServletRequest
~~~java
public interface ServletRequest {
    Object getAttribute(String var1);
    Enumeration<String> getAttributeNames();
    String getCharacterEncoding();
    void setCharacterEncoding(String var1) throws UnsupportedEncodingException;
    int getContentLength();
    long getContentLengthLong();
    String getContentType();
    ServletInputStream getInputStream() throws IOException;
    String getParameter(String var1);
    Enumeration<String> getParameterNames();
    String[] getParameterValues(String var1);
    Map<String, String[]> getParameterMap();
    String getProtocol();
    String getScheme();
    String getServerName();
    int getServerPort();
    BufferedReader getReader() throws IOException;
    String getRemoteAddr();
    String getRemoteHost();
    void setAttribute(String var1, Object var2);
    void removeAttribute(String var1);
    Locale getLocale();
    Enumeration<Locale> getLocales();
    boolean isSecure();
    RequestDispatcher getRequestDispatcher(String var1);

    /** @deprecated */
    String getRealPath(String var1);

    int getRemotePort();
    String getLocalName();
    String getLocalAddr();
    int getLocalPort();
    ServletContext getServletContext();
    AsyncContext startAsync() throws IllegalStateException;
    AsyncContext startAsync(ServletRequest var1, ServletResponse var2) throws IllegalStateException;
    boolean isAsyncStarted();
    boolean isAsyncSupported();
    AsyncContext getAsyncContext();
    DispatcherType getDispatcherType();
}
~~~
* 클라이언트의 요청 정보를 다룰 때 사용.
* getParameter: GET 이나 POST 요청으로 들어온 매개변수 값을 꺼낼 때 사용.
* getRemoteAddr: 서비스를 요청한 클라이언트의 IP 주소
* getScheme: 클라이언트가 요청한 URI 형식 scheme (http / https 등)
* getProtocol: 요청 프로토콜의 이름과 버전 (HTTP/1.1)
* getParameterNames: 요청 정보에서 매개변수 이름만 추출하여 반환
* getParameterValues: 요청 정보에서 매개변수 값만 추출하여 반환
* getParameterMap: 요청 정보에서 매개변수들을 Map 객체에 담아서 반환
* setCharacterEncoding: POST 요청의 매개변수에 대해 문자 집합 설정.
기본값: ISO-8859-1 -> UTF-8로 변경 가능
  * GET 요청의 매개변수에 대해서는 Tomcat 실행 환경 변경
    * URIEncoding

<br>
### ServletResponse
~~~java
public interface ServletResponse {
    String getCharacterEncoding();
    String getContentType();
    ServletOutputStream getOutputStream() throws IOException;
    PrintWriter getWriter() throws IOException;
    void setCharacterEncoding(String var1);
    void setContentLength(int var1);
    void setContentLengthLong(long var1);
    void setContentType(String var1);
    void setBufferSize(int var1);
    int getBufferSize();
    void flushBuffer() throws IOException;
    void resetBuffer();
    boolean isCommitted();
    void reset();
    void setLocale(Locale var1);
    Locale getLocale();
}

~~~
* 응답과 관련된 기능 제공
* setContentType: 출력할 데이터의 인코딩 형식과 문자 집합 지정 ("text/plain”)
  * 클라이언트는 지정된 형식에 맞추어 렌더링
* setChracterEncoding: 출력할 데이터의 문자 집합 설정 ("UTF-8")
기본값: ISO-8851-1
* getWriter: 출력 스트림 객체 반환
-> 이미지나 동영상과 같은 바이너리 데이터를 출력: getOutputStream 사용
* [https://github.com/dhsim86/java_webdev_workbook/commit/3de1f6b204f126e1b665d09050b50e4c3c7aaf72](https://github.com/dhsim86/java_webdev_workbook/commit/3de1f6b204f126e1b665d09050b50e4c3c7aaf72)

<br>
### Servlet에 데이터 전달 예제

![02.png](/static/assets/img/blog/web/2017-01-24-java_web_programming_00/02.png)

<br>
### @WebServlet 애노테이션
* 클래스위의 @WebServlet("") 으로 서블릿 배치 정보 설정 가능.
  * web.xml 에서 서블릿 선언 및 매핑부분 생략 가능
* [https://github.com/dhsim86/java_webdev_workbook/commit/a700245c92f62e6f842c97a1e05bec5704eb1362](https://github.com/dhsim86/java_webdev_workbook/commit/a700245c92f62e6f842c97a1e05bec5704eb1362)
