---
layout: post
title:  "Spring Boot Profile 설정"
date:   2017-03-28
desc: "Spring Boot Profile 설정"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

# Spring Boot profile 나누는 여러가지 방법

<br>
## Sping MVC 에서는...

Spring Boot가 아닌 기존 **Spring MVC** 에서는 다음과 같이 maven 자체 profile 기능을 사용하는 경우가 많다.

~~~xml
  <profiles>
    <profile>
      <id>local</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <properties>
        <environment>local</environment>
        <maven.test.skip>true</maven.test.skip>
      </properties>
    </profile>
    <profile>
      <id>dev</id>
      <properties>
        <environment>dev</environment>
        <maven.test.skip>true</maven.test.skip>
      </properties>
    </profile>
    <profile>
      <id>prd</id>
      <properties>
        <environment>prd</environment>
        <maven.test.skip>true</maven.test.skip>
      </properties>
    </profile>
  </profiles>

....
<webResource>
  <directory>${basedir}/src/main/resources-${environment}</directory>
  <targetPath>WEB-INF</targetPath>
</webResource>
~~~

위와 같이 설정하면 **mvn package -Dlocal / mvn package -Ddev** 이런식으로 profile 별로 사용하는 리소스를 다르게 할 수 있었다.

<br>
## Spring Boot 에서의 profile 설정

Spring Boot는 Spring MVC 처럼 maven 자체 profile 기능을 사용하는 것도 가능하기는 하지만 Spring Boot Reference Guide도 그렇고 다른 방식을 사용한다.

<br>
### Spring Boot의 디렉토리 구조

먼저 Spring Boot의 디렉토리 구조부터 살펴보자.
Spring Boot Reference Guide에서는 다음과 같은 코드 구조를 추천한다.

[Spring Boot Reference Guide: 14. Structuring your code][spring_boot_structuring_code]
<br>
![00.png](/static/assets/img/blog/web/2017-03-28-spring_boot_profile/00.png)

그리고 보통 **STS** 나 **Intellij** 를 통해 Spring Boot 프로젝트를 생성하면 다음과 같이 프로젝트 디렉토리 구조가 생성된다.

**STS**
<br>
![01.png](/static/assets/img/blog/web/2017-03-28-spring_boot_profile/01.png)

**Intellij IDEA**
<br>
![02.png](/static/assets/img/blog/web/2017-03-28-spring_boot_profile/02.png)

**/src/main/java** 및 **/src/test/java** 디렉토리에는 각각 자바 소스 및 테스트 소스를 놔두고, **/src/main/resources** 에는 각종 리소스 및 프로퍼티 파일을 위치시킨다.

**Spring MVC** 에서는 프로젝트 생성하면 **webapp** 디렉토리가 생성되고 그 안에 css, img 등 다양한 리소스들을 넣게 되며, **WEB-INF** 에는 view 파일을 생성했었다.

**Spring Boot** 에서는 **webapp** 이나 **WEB-INF** 는 아예 존재하지 않고, **/src/main/resources** 폴더 안에는 보통 다음과 같이 리소스 파일을 구분해서 위치시킴으로써 좀 더 정확하게 관리하고 있다.

<br>
#### **/src/main/resources/static**
이 디렉토리 안에는 **static** 콘텐츠들을 담는다. 그럼 알아서 **/src/main/resources** 경로를 default로 생각하고 하위 static 콘텐츠들을 불러온다. 보통 image, css, js 등 디렉토리를 만들고 여기서 관리하면 된다.

org.springframework.boot.autoconfigure.web.WebMvcAutoConfiguration 중에서
~~~java
private static final String[] CLASSPATH_RESOURCE_LOCATIONS = {
			"classpath:/META-INF/resources/", "classpath:/resources/",
			"classpath:/static/", "classpath:/public/" };
~~~

위에서 보는 것과 같이 클래스패스 상에서 **/META-INF/resources, /resources, /static, /public** 경로를 기본 탐색한다.

> **/WEB-INF/resources** 의 경우 jar 파일로 배포할 때 인식하지 않기 때문에 쓰지말자.
> static 콘텐츠를 서비스하는 이야기를 [여기서][spring_boot_serving_static] 조금 더 참고해보도록 하자.

<br>
#### **/src/main/resources/template**
이 디렉토리 안에는 **dynamic HTML** 콘텐츠들을 담는다. freemaker, groovy, thymeleaf, velocity 등과 같은 다양한 dynamic HTML에 대한 파일을 여기서 관리하는 것이다.
  * JSTL이나 freemaker 문법을 사용하려면 무조건 이 아래에 파일을 위치시켜야 한다. static 디렉토리에 view 디렉토리 만들어서 백날 해봐야 안먹힌다!

  > spring boot에서는 몇가지 제한 사항 때문에 가능하다면 JSP를 피하라고 한다. [JSP Limitations][spring_boot_jsp_limit]


인터넷에서 가장 best인 Spring Boot 디렉토리 구조를 살펴보았지만 정답은 없었고 [stackoverflow][spring_boot_best_directory] 에서도 찾아보았지만 IDE에서 만들어준 디렉토리 구조가 best 인것 같았다.

그럼 다음으로 Spring Boot에서 profile 설정하는 방법을 알아보자.

---

### spring.profiles.active를 이용한 방법

Spring Boot에서는 각종 환경설정 정보를 **src/main/resources** 안에 **application.properties** 파일에 저장해두고 로드될 수 있도록 한다.

~~~
server.port=9999
~~~

위와 같은 내용을 **application.properties** 이름으로 **src/main/resource** 안에 두면 Spring Boot 애플리케이션이 시작될 때 자동으로 로드하여 웹 서버 포트를 9999로 지정한다.

이 application.properties 파일을 통하여 profile 설정하고자 할 때는 다음과 같이 **application-{profile}.properties** 라는 이름으로 **/src/main/resource** 에 두는 것부터 시작한다.

<br>
![03.png](/static/assets/img/blog/web/2017-03-28-spring_boot_profile/03.png)

아무것도 없는 **application.properties** 에는 프로파일과 관계없는 공통 속성을 설정하고, 각 환경마다 다른 설정을 각각의 **application-{profile}.properties** 에 두면 된다.

예를 들어 다음과 같이 속성을 설정하였다고 하자.

**application.properties**
~~~
spring.profiles.active=local

property.hello=default_hello
property.hi=default_hi
property.hey=default_hey
~~~

**application-local.properties**
~~~
property.hello=local_hello
~~~

**application-dev.properties**
~~~
property.hi=dev_hi
~~~

**application-production.properties**
~~~
property.hey=production_hey
~~~

그리고 다음과 같이 CommandLineRunner에서 프로파일에 따라 어떤 속성값이 설정되는지 확인하였다.
~~~java
@SpringBootApplication
public class SpringbootUsepropertyApplication {

    private static final Logger logger = LoggerFactory.getLogger(SpringbootUsepropertyApplication.class);

    @Value("${property.hello}")
    private String propertyHello;

    @Value("${property.hi}")
    private String propertyHi;

    @Value("${property.hey}")
    private String propertyHey;

	public static void main(String[] args) {
		SpringApplication.run(SpringbootUsepropertyApplication.class, args);
	}

	@Bean
	public CommandLineRunner runner() {

	    return (a) -> {

	        logger.info("CommandLineRunner: " + propertyHello);
	        logger.info("CommandLineRunner: " + propertyHi);
	        logger.info("CommandLineRunner: " + propertyHey);
	    };
	};
}
~~~

위와 같이 각 프로파일 별로 다른 속성을 읽게하고 싶으면 **java -jar** 커맨드를 통해 Spring Boot 애플리케이션을 시작시킬 때 다음과 같이 **-Dspring.profiles.active=dev** 같이 옵션을 주면 된다.

<br>
#### 아무것도 주지 않았을 때 (**java -jar app.jar**)

다음과 같이 아무 옵션도 주지 않았을 때 **propertyHello** 를 제외한 나머지 속성 값들은 **application.properties** 에 있는 디폴트 속성 값이 설정된 것을 알 수 있다. **spring.profiles.active=local** 로 설정하였기 때문에 디폴트 프로파일이 **local** 로 설정되어 **application-local.properties** 에 있는 **propertyHello** 값이 설정된 것이다.
<br>
![04.png](/static/assets/img/blog/web/2017-03-28-spring_boot_profile/04.png)

<br>
#### profile로 dev 속성을 주었을 경우 (**java -jar -Dspring.profiles.active=dev app.jar**)

다음과 같이 공통 속성을 뺀 **application-dev.properties** 있는 값만 따로 설정된 것을 알 수 있다.
<br>
![05.png](/static/assets/img/blog/web/2017-03-28-spring_boot_profile/05.png)

production 프로파일도 마찬가지로 **application-production.properties** 에 있는 값만 따로 설정되고 나머지 공통 속성은 **application.properties** 있는 값이 설정된다.

<br>
### yaml 사용

Spring Boot에서는 application.properties가 아닌 **application.yml** 을 이용해 프로파일 간의 속성들을 관리할 수 있다.
**src/main/resources** 안에 application.properties가 아닌 **application.yml** 파일을 위치시키면 자동으로 그 파일을 로드하여 설정한다.

application.properties 와 마찬가지로 **java -jar -Dspring.profiles.active=dev app.jar** 같이 옵션을 주어 프로파일 별로 다르게 속성을 설정할 수 있는데 **한 yml 파일에 프로파일 간의 다른 속성들을 설정할 수 있다는 것이 다르다.**

**application-{profile}.properties** 를 통해 프로파일 설정한 것과 마찬가지로 똑같이 yml 파일을 이용해서 프로파일 별 속성이 올바르게 로드되는지 확인해보자. 다음을 **src/main/resources** 안에 **application.yml** 이라는 이름의 파일에 작성하면 java의 **"-D"** 옵션에 따라 다르게 프로파일 속성을 로드할 수 있다.

~~~
spring:
  profiles:
    active: local

property:
  hello: default_hello
  hi: default_hi
  hey: default_hey

---
spring:
  profiles: local

property:
  hello: local_hello

---

spring:
  profiles: dev

property:
  hi: dev_hi

---

spring:
  profiles: production

property:
  hey: production_hey
~~~

> .properties 파일과는 다르게 yml 파일로 작성하면 각 프로퍼티 간에 계층화시켜 작성할 수 있다는 장점이 있다.

<br>
### 프로파일별 디렉토리 사용

**src/main/resource** 에 두는 것이 아니라 이 디렉토리 안에 프로파일 별로 디렉토리를 생성하고 그 안에 속성을 담은 파일을 두고 싶을 수도 있다.
<br>
![06.png](/static/assets/img/blog/web/2017-03-28-spring_boot_profile/06.png)

각 프로파일 디렉토리 (local, dev, production)에는 각 프로파일마다 필요한 값만 설정되어 있고 profile 디렉토리에 있는 application.properties에는 공통 속성이 있다고 했을 때 다음과 같이 jar 파일을 실행시킬 때 **--spring-config.location** 을 이용하여 프로파일 별로 properties 파일을 다르게 로드하면 된다.

**java -jar useproperty-0.0.1-SNAPSHOT.jar --spring.config.location=classpath:/profiles/application.properties,classpath:/profiles/local/application.properties**

> --spring.config.location에는 properties 파일을 여러 개 줄 수 있는데, 각 properties 파일에 같은 속성에 대한 값이 있다면 **나중에 오는 properties 파일에 있는 값으로 오버라이드 된다.**
이런 식으로 공통 속성이 있는 properties 파일을 먼저 로드하고 프로파일 별 properties 파일은 나중에 로드함으로써 각 프로파일 별 속성을 다르게 줄 수 있다.

> 이 옵션을 사용할 때 각 파일 path 간에 빈칸을 주면 안된다.

이 옵션을 jar 파일을 실행할 때 주기 싫고 자동으로 주고 싶다면 **환경변수, SPRING_CONFIG_LOCATION** 를 활용하자.
이 것을 이용하면, 각 환경마다 미리 환경 변수를 설정해놓고 아무 옵션없이 알맞는 프로파일을 로드하는 것이 가능해지므로, 실행 스크립트 같은 것을 별도로 만들 필요 없다.

* \*nix system
**export SPRING_CONFIG_LOCATION=classpath:/profiles/application.properties,classpath:/profiles/local/application.properties**

* Windows OS
**set SPRING_CONFIG_LOCATION=classpath:/profiles/application.properties,classpath:/profiles/local/application.properties**

[spring_boot_structuring_code]: http://docs.spring.io/spring-boot/docs/current/reference/html/using-boot-structuring-your-code.html
[spring_boot_serving_static]: https://spring.io/blog/2013/12/19/serving-static-web-content-with-spring-boot
[spring_boot_best_directory]: http://stackoverflow.com/questions/40902280/what-is-the-recommended-project-structure-for-spring-boot-rest-projects
[spring_boot_jsp_limit]: http://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-jsp-limitations
