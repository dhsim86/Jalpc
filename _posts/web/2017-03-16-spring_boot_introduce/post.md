---
layout: post
title:  "Spring Boot Reference Guide Review 01"
date:   2017-02-18
desc: "Spring Boot Reference Guide Review 01"
keywords: "spring boot, spring, server programming"
categories: [Web]
tags: [spring boot, spring]
icon: icon-html
---

## Spring Boot Getting Started!

 Spring Boot는 Spring Framework를 사용하는 프로젝트를 아주 간편하게 셋업할 수 있는, Spring Framework의 서브 프로젝트이다.
 Spring application을 개발하는데 있어 필요한 의존성과 xml 구성 등의 일반적인 공통된 설정 작업을 자동으로 진행해주고, 개발자는 즉시 application 로직 개발을 시작할 수 있도록 지원하는 도구이다.

 [https://projects.spring.io/spring-boot/][spring_boot_official]

 Spring Boot를 이용해 -jar를 이용하여 Java 애플리케이션을 만들거나, 이전 외부 tomcat를 사용하는 것처럼 웹앱을 만들 수 있다.

  * 수작업으로 초기 셋업없이 간단히 프로젝트를 생성할 수 있다. Spring에서 제공하는 STS를 사용해 기본적인 프로젝트 성격과 필요로 하는 라이브러리를 선택할 수 있다.
  * 프로젝트마다 일상적으로 설정하게 되는 사항을 이미 내부적으로 가지고 있고, 개별적으로 차이가 나는 부분만 설정 파일에 집어넣으면 된다. DB 드라이버나, 트랜잭션과 같은 것은 알아서 처리된다.
  * Spring Security, JPA와 같은 다른 Spring Framework 구성 요소를 쉽게 가져다 쓸 수 있으며, 이 과정에서 프로토타이핑이나 기능을 시험해보는 시간이 단축된다.
  * Tomcat이나 Jetty를 기본 내장할 수 있으며, 서블릿 컨테이너가 내장될 수 있으므로 간단히 jar 파일 형태로 간단히 만들어 배포 가능하다.
  * maven pom.xml에서 의존 라이브러리의 버전을 일일이 지정하지 않아도, Spring Boot가 권장하는 버전을 관리한다.

<br>
### System Requirement

 * Spring Boot 1.5.2 버전을 기준으로, Java 7 / Spring Framework 4.3.7 이상을 요구한다. 단, 약간의 설정을 가지고 Java 6과 함께 사용할 수도 있다.
 > 비록 Java 6을 지원하기는 하지만, 가능하다면 최신 버전의 Java를 사용하는 것이 좋다.

 * Spring Boot는 어떠한 IDE나 Text Editor도 상관이 없으며, jar 파일을 classpath에 넣어두는 것만으로도 사용가능하다.
 > 하지만 gradle이나 maven과 같은 dependency management tool을 사용하는 것이 좋다.
 Spring Boot는 maven 3.2 / gradle 2.9 이상과 호환된다.

<br>
#### Servlet Container

 Spring Boot에 내장된 Servlet Container는 다음과 같이 지원한다.

 | Name | Servlet Version | Java Version |
 | ---------- | :--------- | :----------: |
 | Tomcat 8 | 3.1 | Java 7+ |
 | Tomcat 7 | 3.0 | Java 6+ |
 | Jetty 9.3 | 3.1 | Java 8+ |
 | Jetty 9.2 | 3.1 | Java 7+ |
 | Jetty 8 | 3.0 | Java 6+ |
 | Undertow 1.3 | 3.1 | Java 7+ |

<br>
## Hello Spring Boot!

 * STS 3.8.4 기준으로 Spring Start Project를 생성하면 다음과 같은 class가 이미 만들어져 있다.

~~~java
// ServletInitializer
package com.nhnent.hellospringboot;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;

public class ServletInitializer extends SpringBootServletInitializer {

 @Override
 protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
   return application.sources(HelloSpringBootApplication.class);
 }
}
~~~

<br>
~~~java
//HelloSpringBootApplication
package com.nhnent.hellospringboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HelloSpringBootApplication {

	public static void main(String[] args) {
		SpringApplication.run(HelloSpringBootApplication.class, args);
	}
}
~~~
<br>
~~~java
//SpringApplication.run method
public static ConfigurableApplicationContext run(Object[] sources, String[] args) {
  return new SpringApplication(sources).run(args);
}
~~~

 * HelloSpringBootApplication의 main 메소드가 Spring Framework를 수행하기 위해 사용하는 SpringApplication 클래스는 Spring 기반의 web application을 구동하는 편리한 방법을 제공한다.
 * Spring MVC에서 servlet context 설정과 같은 복잡한 과정 대신에, main 메소드에서 SpringApplication의 run static 메소드에 class 및 main 메소드의 파라미터, args만 넘기는 것으로 Spring Framework를 실행한다. 과연 run method 에서는 어떤 일을 할까?

<br>
### SpringApplication.run method

 이 메소드에서 하는 역할은 크게 두가지이다.

 * Main Class 셋팅

 SpringApplication run static 메소드는 내부적으로 SpringApplication 객체를 생성하여 생성자로 application class 를 넘기고, args는 run 메소드에 넘기는데 application class, 즉 개발자가 만든 main class로 다음 코드와 같이 셋팅하는 것을 알 수 있다.

~~~java
@SuppressWarnings({ "unchecked", "rawtypes" })
private void initialize(Object[] sources) {
  if (sources != null && sources.length > 0) {
    this.sources.addAll(Arrays.asList(sources));
  }
  this.webEnvironment = deduceWebEnvironment();
  setInitializers((Collection) getSpringFactoriesInstances(
      ApplicationContextInitializer.class));
  setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));
  this.mainApplicationClass = deduceMainApplicationClass();
}
~~~

 > 파라미터로 넘어간 application class를 바로 mainApplicationClass로 설정해도 될 것 같았지만, 그렇지 않고 deduceMainApplicationClass 함수를 사용하여 설정한다. 다음 코드와 같이 StackTrace를 사용해여 main 메소드를 가지는 클래스를 찾아 셋팅한다.

~~~java
private Class<?> deduceMainApplicationClass() {
  try {
    StackTraceElement[] stackTrace = new RuntimeException().getStackTrace();
    for (StackTraceElement stackTraceElement : stackTrace) {
      if ("main".equals(stackTraceElement.getMethodName())) {ㄴ
        return Class.forName(stackTraceElement.getClassName());
      }
    }
  }
  catch (ClassNotFoundException ex) {
    // Swallow and continue
  }
  return null;
~~~
 * ApplicationContext (ConfigurableApplicationContext) 생성 및 refresh

  SpringApplication run 메소드에서는 ConfigurableApplicationContext를 생성하고, refreshContext 메소드를 실행하여
  Spring 을 구동한다.

 ~~~java
 public ConfigurableApplicationContext run(String... args) {
   StopWatch stopWatch = new StopWatch();
   stopWatch.start();
   ConfigurableApplicationContext context = null;
   FailureAnalyzers analyzers = null;
   configureHeadlessProperty();
   SpringApplicationRunListeners listeners = getRunListeners(args);
   listeners.starting();
   try {
     ApplicationArguments applicationArguments = new DefaultApplicationArguments(
         args);
     ConfigurableEnvironment environment = prepareEnvironment(listeners,
         applicationArguments);
     Banner printedBanner = printBanner(environment);
     context = createApplicationContext();
     analyzers = new FailureAnalyzers(context);
     prepareContext(context, environment, listeners, applicationArguments,
         printedBanner);
     refreshContext(context);
     afterRefresh(context, applicationArguments);
     listeners.finished(context, null);
     stopWatch.stop();
     if (this.logStartupInfo) {
       new StartupInfoLogger(this.mainApplicationClass)
           .logStarted(getApplicationLog(), stopWatch);
     }
     return context;
   }
   catch (Throwable ex) {
     handleRunFailure(context, listeners, analyzers, ex);
     throw new IllegalStateException(ex);
   }
 }
 ~~~

<br>
#### Writing your code

~~~java
package com.nhnent.hellospringboot.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloRestController {

    @RequestMapping("/")
    public String index() {

        return "Hello World!";
    }
}
~~~

 > @RestController
  Spring 4.0에 추가된 annotation으로 @Controller 및 @ResponseBody를 합쳐놓은 기능을 제공한다.
  @Conroller annotation과는 달리 요청을 처리하는 모든 메소드에 @ResponseBody를 추가할 필요가 없다.

 > @EnableAutoConfiguration
  Spring Boot autoconfiguration은 추가된 jar dependency 기반으로 Spring application을 자동으로 설정하는 것을 시도한다. 예를 들어 HSQL DB가 class path에 있으면, DB 연결 빈을 정의하지 않아도 자동적으로 in-memory 데이터베이스에 접근할 것이다.
  자동 설정은 비 침입적으로, DataSource 빈을 추가한다면 디폴트로 자동 설정되는 것은 사라질 것이다.

[spring_boot_official]: https://projects.spring.io/spring-boot/
