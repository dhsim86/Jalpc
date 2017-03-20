---
layout: post
title:  "Spring Boot Reference Guide Review 02"
date:   2017-03-17
desc: "Spring Boot Reference Guide Review 02"
keywords: "spring boot, spring, server programming"
categories: [Web]
tags: [spring boot, spring]
icon: icon-html
---

## Build Systems

 Spring Boot는 introduction을 review 할 때도 언급하였지만, maven이나 gradle과 같은 dependency managment를 함께 사용할 것을 강력히 권장한다. 또한 기본적으로 사용되는 의존성있는 라이브러리 및 version을 미리 구성해준다. 이렇게해서 개발자는 어떤 의존성을 사용할지, 또는 각 의존성간 어떤 버전이 호환성이 좋은지 걱정할 필요없이 즉시 작업을 시작할 수 있다.

<br>
### Dependency management

 Dependency management를 사용할 때, Spring MVC에서 하던 것처럼 version을 일일이 설정할 필요가 없다. Spring Boot는 version별 release list를 관리해주며, Spring Boot가 업데이트가 되면 자동적으로 프로젝트에서 사용하던 의존성 library들이 업데이트 될 것이다.

 > 입맛에 맞는 원하는 version을 설정할 수도 있다. 하지만 Spring Boot Reference Guide에서는 권장하지는 않는다.

<br>
### Maven

 Maven 사용자는 아래와 같이 pom.xml에 추가함으로써 Spring Boot를 사용할 수 있다.

~~~xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>1.5.2.RELEASE</version>
  <relativePath/> <!-- lookup parent from repository -->
</parent>
~~~

 위와 같이  spring-boot-starter-parent 를 상속하는 경우 UTF-8 소스 인코딩이나 pom.xml 내에 <version> 태그를 생략할 수 있는 다음과 같은 특징들이 적용된다.

 * 기본 컴파일 레벨을 Java 1.6으로 지정
 * UTF-8 소스 인코딩
 * spring-boot-starter-dependencies 를 상속하여 <version> 태그를 생략하고 의존성을 관리
 * resource filtering
 * exec plugin, surefire, Git commit ID, shade

<br>
#### Changing Java Version

 Spring Boot는 default compile level로 Java 1.6 이지만, 다음과 같이 <java.version> property를 추가하는 것으로 사용하기를 원하는 Java version을 선택할 수 있다.

 ~~~xml
 <properties>
   <java.version>1.8</java.version>
 </properties>
 ~~~

<br>
#### Package project as jar.

 Spring Boot는 하나의 jar 파일로 패키징할 수 있도록 지원한다. 만약 하나의 executable jar 파일로 만들고 싶다면 <plugins> 섹션에 다음과 같이 추가한다.

 ~~~xml
 <build>
   <plugins>
     <plugin>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-maven-plugin</artifactId>
     </plugin>
   </plugins>
 </build>
 ~~~

<br>
#### Locating the main application classes

 Spring Boot에서는 main method를 가지는 main application class를 다음과 같이 root package에 놓는 것을 권장한다.

 - com
   - example
      - myproject
        - **Application.java**
        - domain
          - Customer.java
          - CustomerRepostiory.java
        - service
          - CustomerService.java
        - web
          - CustomerController.java


 보통 @EnableAutoConfiguration annotation을 main application class에 사용하는데, 이것은 암묵적으로 다른 Package에 있는 빈을 찾기 위한 Base 로 정의하기 때문이다. main application class에는 @EnableAutoConfiguration이나 @ComponentScan, @SpringBootApplication annotation을 사용할 수 있다.

 > @Configuration
  현재의 클래스가 Spring의 설정 파일임을 애플리케이션 컨텍스트에 알려주는 역할
  만약 다른 클래스에도 추가할려면 @Configuration을 일일이 추가하는 것보다는 @Import annotation을 사용하도록 한다.

  > @EnableAutoConfiguration
   Spring Boot autoconfiguration은 추가된 jar dependency 기반으로 Spring application을 자동으로 설정하는 것을 시도한다. 예를 들어 HSQL DB가 class path에 있으면, DB 연결 빈을 정의하지 않아도 자동적으로 in-memory 데이터베이스에 접근할 것이다.
   자동 설정은 비 침입적으로, DataSource 빈을 추가한다면 디폴트로 자동 설정되는 것은 사라질 것이다.

  > @ComponentScan
  Spring에게 패키지안에서 다른 컴포넌트, 설정, 서비스를 스캔하도록 한다. 이를 통해 사용자가 추가한 Controller / Service 클래스를 찾는 것이 가능해진다. @Component, @Service, @Repository, @Controller와 같은 컴포넌트들이 자동적으로 Spring 빈으로 추가된다.
  [@ComponentScan analysis][componentscan_analysis]

  > @SpringBootApplication
  @Configuration, @EnableAutoConfiguration, @ComponentScan annotation들을 main application class에서 함께 사용하는 대신에, 이 annotation으로 사용할 수 있다.

<br>
## AutoConfiguration

@EnableAutoConfiguration을 사용하면 자동 설정을 진행하지만 사용자가 원하는대로 특정 configuration class를 다음과 같이 제외할 수도 있다.

~~~java
import org.springframework.boot.autoconfigure.*;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import ogg.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableAutoConfiguration(exclude= {DataSourceAutoConfiguration.class})
public class Application{
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
~~~

 위 코드같이 작성하지 않아도, 자동 설정되는 클래스는 pom.xml에서 spring.autoconfigure.exclude에 property를 추가함으로써 조정할 수 있다.

<br>
## Developer tools

Spring Boot 1.3에서 Spring application 개발에 있어서 편리함을 제공하고자 추가된 프로젝트이다.
이를 통해 코드 변경시 서버 자동 재시작이나, 원격으로 디버깅, 업데이트, 리스타트 기능 등을 제공한다. 이것을 사용하기 위해 maven을 사용한다면 pom.xml에 다음과 같이 추가한다.

~~~java
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>
</dependency>
~~~

<br>
### Disable Cache

 몇몇 Spring Boot 라이브러리들은 성능 향상을 위해 일정 부분을 캐싱해둔다. Template Engine의 경우, 매번 template 파일을 파싱하는 것을 방지하기 위해 파싱된 template들을 캐싱한다. 또한 Spring MVC 또한 HTTP caching header를 통해 static resource들을 서비스하고 있다.

 이런 캐싱은 실제 서비스할 때는 유용한 것이지만, 개발 진행 중일 때는 개발자가 변경한 부분이 반영되지 않아 바로 확인할 수 없을 수 있는 단점이 있다. 따라서 Spring Boot에서 제공하는 developer tool, spring-boot-devtools를 사용하면 기본적으로 캐싱하는 옵션을 disable 시킨다.

 > 캐시 옵션은 application.properties 파일에 추가함으로써 조정할 수 있지만 developer tool을 사용하면 자동적으로 필요한 캐싱 옵션을 설정한다.

<br>
### Automatic Restart

 Developer tool을 사용하면 classpath에 있는 class source의 변경이 일어날 때마다 자동으로 서버를 재시작한다. 따라서 개발자에게는 코드 수정이 일어날 때마다 빠르게 확인해 볼 수 있다.

 * Restart
 Spring Boot는 두개의 클래스로더를 통해 서버를 재시작할 수 있는 메커니즘을 제공하는데, third-party 등에서 제공하는 jar파일에 대해서는 base 클래스로더를 통해 로드되며, 코드 수정이 일어나는 클래스에 대해서는 restart 클래스로더를 통해 로드된다.
 만약 재시작할 필요가 있을 때, restart 클래스로더를 통해 다시 시작하면 됨으로써 개발자가 직접 재시작하는 것보다 더 빠르게 서버를 시작할 수 있다.

 * Excluding resource
 몇몇의 resource 파일들은 변경이 일어나도 상관이 없다. /META-INF나 /resource, /static 폴더 등에 있는 파일들은 변경이 발생하도 재시작하지 않는다. 다만 Live Reload를 통해 해당 resource 파일들이 변경될 때 바로 확인해 볼 수 있다.

 * Live Reload
 Developer tool은 embedded LiveReload 서버를 제공하여, resource 파일의 변경이 일어날 때마다 browser를 refresh 함으로써 반영한 부분을 확인해볼 수 있다. LiveReload 를 위해 크롬이나 사파리, 파이어폭스 등에서 extension을 제공한다.
 만약 Live Reload를 사용하지 않으려면 다음과 같이 application.properties에 추가한다.
 ~~~
 spring.devtools.livereload.enabled=false
 ~~~

<br>
### trigger file

 보통 IDE를 사용하면 (특히 Intellij) 소스 파일을 에디트할 때마다 계속 컴파일하면서 변경하는 경우가 있다. 이럴 때, 트리거 파일을 통해 어느 특정 시점에 서버를 재시작하여 반영 여부를 확인해볼 수 있다.
 트리거 파일은 이 파일에 변경이 일어날 때만 서버를 자동 재시작하는 특별한 파일이다.

 이 트리거 파일은 다음과 같이 application.properties에 추가할 수 있다.
 ~~~
 spring.devtools.restart-trigger-file=...
 ~~~

<br>
### Remote applications

 Develop tool은 local에 대해서만 사용되는 것이 아니라, 원격에 대한 애플리케이션에 대해서도 사용할 수 있다. 

[componentscan_analysis]: http://thswave.github.io/spring/2015/02/02/spring-mvc-annotaion.html
