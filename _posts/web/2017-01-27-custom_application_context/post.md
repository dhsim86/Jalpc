---
layout: post
title:  "Java Web Programming: Custom ApplicationContext"
date:   2017-01-27
desc: "Java Web Programming: Custom ApplicationContext"
keywords: "java, web, spring"
categories: [Web]
tags: [java, web, spring]
icon: icon-html
---

# Custom ApplicationContext

이 포스트는 자바 웹 개발을 진행할 때 가장 많이 사용하는 framework인 Spring에서의 IoC 컨테이너, 즉 ApplicationContext에 대한 이해를 하고자, **Spring을 사용하지 않고 특정 파일로부터 내용을 읽어 자동으로 필요한 빈 생성 및 의존관계 주입을 수행하는 "Custom ApplicationContext"** 를 직접 구현하는 내용을 다룬 포스트이다.

<br>
## Property 파일

Spring MVC에서 주로 사용하는, 스프링 빈 정보를 담고 있는 일명 ApplicationContext...xml 과 같은 파일을 만들어보자. 여기서는 간단하게 **key=value** 로 구성하도록 한다. 가령 다음과 같이 작성할 수 있을 것이다.
~~~
dataSource=org.apache.commons.dbcp.BasicDataSource
~~~

* 여기서 key는 사용하고자 하는 빈의 이름, 즉 ID 이며 value는 해당 빈의 **fully qualified class name** 으로 지정한다.
* ApplicationContext는 이 파일을 읽어 해당 **빈의 이름을 key 값으로 삼고 value에 있는 클래스 이름을 바탕으로 빈을 생성**하도록 할 것이다.

<br>
## Custom Annotation

Spring에서는 ApplicationContext.xml로부터 정보를 읽어 빈 생성 및 주입을 하지만, annotation을 통해 스프링 빈을 선언하고 다음과 같이 xml에 정의하면 자동으로 특정 annotation이 선언된 클래스를 검색하여 빈을 관리하다.

~~~xml
<context:component-scan base-package="com.nhnent.spring" />
~~~
~~~java
@Component
public class ExampleController {
  ...
}
~~~

위와 같이 **@Component** 가 선언된 클래스에 대해서 Spring은 자동으로 빈 생성하고 의존관계를 주입할 것이다.
component-scan에 대한 자세한 내용은 다음 글을 참조하자.

**[스프링 \<context:component-scan\> 분석][spring-component-scan]**

---

여기서도 **@Component** 라는 이름으로 custom annotation을 다음과 같이 정의한다.
~~~java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface Component {
	String value() default "";
}
~~~

* 위에서 value 라는 이름으로 들어가는 값은 해당 annotation이 선언되는 클래스의 ID, 즉 빈 이름으로 사용할 것이다.
* ApplicationContext는 이 annotation이 선언된 클래스를 스캔한 다음에, 해당 빈 이름으로 인스턴스를 생성하도록 할 것이다.
* **@Retention** annotation은 해당 annotation의 정보를 언제까지 유지할 것인지 지정한다. 여기서는 **RUNTIME** 으로 지정하여 실행 중일 때도 annotation 정보를 참조할 수 있도록 한다.

<br>
## Custom ContextLoaderListener

Tomcat과 같은 ServletContainer는 웹 애플리케이션의 상태를 모니터링 할 수 있도록 **웹 애플리케이션의 시작에서 종료까지, 주요한 사건에 대한 알림 기능을 제공한다.**

<br>
![00.jpg](/static/assets/img/blog/web/2017-01-27-custom_application_context/00.jpg)


이를 **ServletContextListener** 라고 하는데, Spring에서는 ApplicationContext를 등록하고 DB 연결 기능이나 로깅 같은 서비스를 만드는데 이 ServletContextListener 인터페이스를 구현한 **ContextLoaderListener** 를 제공한다.
Spring 으로 웹 개발을 하면 으레 web.xml에는 다음과 같이 ContextLoaderListener 선언이 있을 것이다.
~~~xml
<!-- Creates the Spring Container shared by all Servlets and Filters -->
<listener>
  <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>
~~~

---

여기서도 Custom ContextLoaderListener 를 구현하여, **애플리케이션이 시작될 때 ApplicationContext가 프로퍼티와 annotation을 통해 필요한 빈 생성 및 의존관계 주입을 진행** 하도록 할 것이다.

다음과 같이 ServletContextListener 인터페이스로부터 구현하도록 할 수 있다.
~~~java
@WebListener
public class ContextLoaderListener implements ServletContextListener {

  // Custom ApplicationContext 선언
  static ApplicationContext applicationContext;

  public static ApplicationContext getApplicationContext() {
    return applicationContext;
  }

  @Override
  public void contextInitialized(ServletContextEvent event) {
    // ApplicationContext가 property 파일이나 Annotation을 통해 빈 생성 및 의존 관계 주입
  }

  @Override
  public void contextDestroyed(ServletContextEvent event) {
    // DB 연결 종료와 같은 자원 해제 코드
  }
}
~~~

* **contextInitialized** 메소드는 ServletContainer가 실행될 때 자동으로 호출하는 부분이다. 여기서 ApplicationContext는 정의한 property 파일과 annotation을 통해 클래스 스캔 및 빈 생성, 의존관계 주입을 한다.
* **contextDestroyed** 메소드는 애플리케이션이 종료될 때 호출된다. 여기서 DB 연결 종료나 자원 해제 코드가 들어갈 것이다.
* **@WebListener** annotation은 web.xml에 등록할 필요없이 해당 클래스 오브젝트를 등록할 수 있도록 한다.

<br>
## Custom ApplicationContext 정의

Custom ApplicationContext는 위에서 준비한 property 파일과 @Component annotation, 그리고 custom ContextLoaderListener를 통해 자동으로 빈을 생성하고 빈 간의 의존관계를 주입하도록 구현할 것이다.

<br>
### key / value 를 통한 빈 관리

앞서 만든 property 파일에는 **key=value** 쌍으로 빈 정보를 정의하였고, @Component annotation 또한 annotation 정보로 빈의 이름을 정의하도록 하였다.

여기서 ApplicationContext는 **key를 빈의 이름으로 value를 해당 빈 오브젝트** 로 관리하도록 할 것이다. 그럼 다음과 같이 ApplicationContext를 구현할 수 있다.

~~~java
public class ApplicationContext {

	Hashtable<String, Object> objTable = new Hashtable<>();

	public Object getBean(String key) {
		return objTable.get(key);
	}
~~~
* Hashtable 타입으로 정의된 objTable을 통해 빈의 이름을 key 값으로 가지고, 해당 빈의 인스턴스를 value로 가지도록 한다.
* **getBean** 메소드를 통해 해당 빈의 이름이 파라미터로 넘어오면 해당 객체를 리턴하도록 한다.

<br>
### property 파일로부터 빈 생성

먼저 ApplicationContext가 property 파일을 읽어 빈 생성 및 관리를 할 수 있도록 하자.
앞서 만든 property 파일은 다음과 같이 **key=value** 쌍으로 만들었다.
~~~
dataSource=org.apache.commons.dbcp.BasicDataSource
~~~

이 파일을 쉽게 읽을 수 있도록 Java 에서는 **Properties** 클래스를 제공한다. 위와 같은 파일이 있을 때 코드 상에서 다음과 같이 쉽게 파일을 읽어 key / value 를 로드할 수 있다.
~~~java
Properties props = new Properties();
props.load(new FileReader(propertiesPath));
...
for (Object item : props.keySet()) {

  key = (String)item;
  value = props.getProperty(key);
...
~~~

ApplicationContext에서도 해당 클래스를 통해 property 파일을 읽어 value, 즉 클래스 이름을 통해 빈의 인스턴스를 생성하고 **objTable** 에 key (빈의 이름)으로 관리하도록 다음과 같이 구현한다.
~~~java

public ApplicationContext(String propertiesPath) throws Exception {
  Properties props = new Properties();
  props.load(new FileReader(propertiesPath));

  prepareObjects(props);
  ...
}
private void prepareObjects(Properties props) throws Exception {
  String key = null;
  String value = null;

  for (Object item : props.keySet()) {

    key = (String)item;
    value = props.getProperty(key);

    ...

    try {
      objTable.put(key, Class.forName(value).newInstance());
    }
    catch (ClassNotFoundException e) {
      ...
    }
  }
}
~~~
* ApplicationContext 생성자에서 **propertiesPath**, 즉 property 파일의 경로를 받아 해당 파일을 읽어 빈을 생성하고, **objTable** 에 등록하도록 하였다. 이 생성자는 아까 정의한 custom ContextLoaderListener 에서 호출할 것이다.
* Properties 클래스를 통해 key 값으로 해당 value, 즉 클래스 이름을 얻어 인스턴스를 생성하였다.

<br>
### Annotation을 통한 빈 생성

이번에는 아까 정의한 **@Component** annotation 을 통해 빈 생성을 하도록 하자. 여기서는 **리플렉션** 이라는 클래스의 정보를 분석하는 기법을 사용할 것이다. 예를 들어 자바 클래스 가진 모든 필드의 이름을 얻거나 메소드의 리스트를 얻을 수 있다.

자바에서는 기본적으로 **java.lang.reflect** 패키지를 통해 리플렉션 기능을 제공하지만 여기서는 **Reflections** 라이브러리를 사용한다. 특정 패키지를 베이스로 하여 모든 클래스를 검색하는 기능을 필요한데 자바에서 제공하는 기본 리플렉션 기능으로는 코드가 길어지기 때문이다.

먼저 **Reflections** 라이브러리를 사용하기 위해 다음과 같이 의존성을 추가한다.
~~~xml
<dependency>
    <groupId>org.reflections</groupId>
    <artifactId>reflections</artifactId>
    <version>0.9.10</version>
</dependency>
~~~

> Reflections 라이브러리의 사용법은 다음 사이트를 참조한다. **[Class Reflections][reflections-doc]**

이 라이브러리를 써서 ApplicationContext는 특정 annotation **(여기서는 @Component)** 이 선언된 모든 클래스를 검색하여 인스턴스를 생성하도록 한다. 다음과 같이 구현할 수 있다.
~~~java
public ApplicationContext(String propertiesPath) throws Exception {
  ...
  prepareAnnotationObjects();
  ...
}
private void prepareAnnotationObjects() throws Exception {

  Reflections reflector = new Reflections();

  Set<Class<?>> list = reflector.getTypesAnnotatedWith(Component.class);
  String key = null;

  for (Class<?> clazz : list) {
    key = clazz.getAnnotation(Component.class).value();
    objTable.put(key,  clazz.newInstance());
  }
}
~~~

* Reflections 클래스의 **getTypesAnnotatedWith** 메소드를 통해 해당 annotation의 class를 파라미터로 넘기면 이 annotation이 정의된 모든 클래스의 리스트를 Set 형태로 리턴한다.
* 리턴된 **Set을 통해 클래스 이름을 얻어 인스턴스를 생성하고, @Component annotation의 value 값을 통해 해당 빈의 이름을 얻어 objTable에 등록**하였다. 따라서 @Component annotation을 사용할 때 다음과 같이 선언해야 한다.
~~~java
@Component("memberDao")
public class MyCustomMemberDao implements MemberDao {
  ...
~~~
* 위와 같이 빈의 이름을 설정하면 ApplicationContext는 해당 이름으로 빈을 등록할 것이다.

<br>
### 의존관계 주입

Property 파일 및 Annotation을 통해 빈을 생성했으니, 이제 등록한 빈 간의 의존관계를 주입할 차례이다.

여기서는 등록한 빈 오브젝트의 **Class**를 통해 메소드 리스트를 얻어 **set** 으로 시작하는 모든 메소드, 즉 **setter**를 모두 검색하여 해당 메소드의 파라미터 타입과 일치하는 빈을 서로 주입하도록 할 것이다.

다음과 같은 메소드를 통해 특정 오브젝트의 클래스 정보, 메소드 리스트, 파라미터 타입을 얻을 수 있다.
~~~java
for (Method m : obj.getClass().getMethods()) {

  if (m.getName().startsWith("set")) {
    ...
    dependency = findObjectByType(m.getParameterTypes()[0]);
    ...
~~~
* **.getClass().getMethods()** 를 통해 메소드 리스트를 얻는다.
* 메소드마다 **.getName().startsWith("set")** 을 통해 setter 인지 검사하고, 찾으면 **getParameterTypes()[0]** 를 통해 파라미터 타입을 얻는다. getParameterTypes 메소드는 파라미터 리스트를 배열로 리턴한다.

이를 이용해 다음과 같이 ApplicationContext 클래스에서 구현할 수 있다.
~~~java
public ApplicationContext(String propertiesPath) throws Exception {
  ...
  injectDependency();
}

private void injectDependency() throws Exception {
  for (String key : objTable.keySet()) {
      callSetter(objTable.get(key));
  }
}

private void callSetter(Object obj) throws Exception {
  Object dependency = null;
  for (Method m : obj.getClass().getMethods()) {
    if (m.getName().startsWith("set")) {
      dependency = findObjectByType(m.getParameterTypes()[0]);
      if (dependency != null) {
        m.invoke(obj, dependency);
      }
    }
  }
}

private Object findObjectByType(Class<?> type) {
  for (Object obj : objTable.values()) {
    if (type.isInstance(obj)) {
      return obj;
    }
  }
  return null;
}
~~~
* ApplicationContext 생성자의 마지막에 빈 간의 의존관계를 설정하도록 하였다.
* 의존관계 설정시, setter를 찾아 해당 파라미터 타입과 일치하는 빈, 즉 **isInstance** 메소드를 통해 해당 빈이 그 타입의 인스턴스이면 **invoke** 를 통해 해당 빈이 주입될 수 있도록 하였다.

<br>
### ContextLoaderListener 에서의 ApplicationContext 호출

Spring으로 웹 개발 진행할 때 web.xml에서 빈 정보를 담는 context xml 의 path를 다음과 같이 지정한다.
~~~xml
<context-param>
  <param-name>contextConfigLocation</param-name>
  <param-value>classpath:/spring/root-context.xml</param-value>
</context-param>
~~~

여기서도 마찬가지로 web.xml에 property 파일이 저장된 path를 지정하고 ContextLoaderListener가 이 path를 ApplicationContext 생성자로 넘겨 property 파일을 읽을 수 있도록 한다.
~~~xml
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>/WEB-INF/application-context.properties</param-value>
</context-param>
~~~

다음과 같이 **contextInitialized** 메소드에서 **contextConfigLocation** 값을 얻은 후에 ApplicationContext를 생성하도록 하여, 웹 애플리케이션이 시작될 때 자동으로 빈 생성 및 의존관계를 주입할 수 있도록 하였다.
~~~java
public class ContextLoaderListener implements ServletContextListener {

  static ApplicationContext applicationContext;

  public static ApplicationContext getApplicationContext() {
    return applicationContext;
  }

  @Override
  public void contextInitialized(ServletContextEvent event) {

    try {
      ServletContext sc = event.getServletContext();

      String propertiesPath = sc.getRealPath(sc.getInitParameter("contextConfigLocation"));
      applicationContext = new ApplicationContext(propertiesPath);
      ...
    }
    catch (Throwable e) {
      e.printStackTrace();
    }
  }
~~~

Spring 에서 제공하는 여러가지 ApplicationContext 와 비교하면 아주 간단한 로직이지만 Spring Framework에서 어떻게 컨테이너가 빈을 생성하고 의존관계를 주입할 수 있는지 이해를 쉽게 이해할 수 있을 것이다.

> 해당 내용은 Java Web Development Workbook Chapter. 06 의 내용을 바탕으로 작성된 것이다.


[spring-component-scan]: http://thswave.github.io/spring/2015/02/02/spring-mvc-annotaion.html
[reflections-doc]: http://static.javadoc.io/org.reflections/reflections/0.9.10/org/reflections/Reflections.html
