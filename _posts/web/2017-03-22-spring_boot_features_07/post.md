---
layout: post
title:  "Spring Boot Reference Guide Review 09"
date:   2017-03-22
desc: "Spring Boot Reference Guide Review 09"
keywords: "spring boot, spring, server programming"
categories: [Web]
tags: [spring boot, spring]
icon: icon-html
---

> Spring Boot Reference Guide Part4, Chapter 41 Testing

# Testing

Spring Boot는 애플리케이션 테스트를 위해 다양한 유틸리티나 annotation들을 지원한다.
이런 테스트 환경을 지원하는 것은 spring-boot-test 및 spring-boot-test-autoconfigure 모듈이다.

거의 모든 Spring Boot 개발자들은 다음과 같은 의존성을 추가하여 테스트에 사용하고 있다. 다음 의존성을 추가하는 것만으로도 Junit, AssertJ, Hamcrest, Mockito와 같은 다양한 라이브러리를 지원하기 때문이다.

~~~xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
~~~

만약 위의 의존성을 추가한다면 다음과 같은 테스트를 위한 라이브러리들을 사용할 수 있다.

* Junit: The de-facto standard for unit testing Java applications.
* Spring Test & Spring Boot Test: Utilities and Integration test support for Spring Boot applications.
* AssertJ: A fluent assertion library.
* Hamcrest: A library of matcher objects (also known as constraints or predicates.)
* Mockito: A Java mocking framework.
* JSONAssert: An assertion library for JSON.
* JsonPath: XPath for JSON.

> Spring Boot는 Mockito 1.* 버전을 사용한다. 물론 2.x 버전도 설정에 따라 사용 가능하다.

위의 라이브러리말고도 사용할만한 테스트용 라이브러리에 대한 의존성을 추가해서 사용가능하다.

<br>
## Testing Spring applications

Spring Boot에서는 다음과 같은 @annotation 만으로도 테스트를 쉽게 시작할 수 있다. (Spring Boot 1.4 이상)
~~~java
@RunWith(SpringRunner.class)
@SpringBootTest()
public class SpringBootTestApplicationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @MockBean
    public UserService userService;

    @Test
    public void simpleTest() {
      ...
    }
}
~~~

@SpringBootTest annotation을 붙여주는 것만으로 테스트 클래스를 만들 수 있는 것이다.
이 annotation에는 **webEnvironment** 라는 attribute가 있는데, 다음과 같은 파라미터를 통해 테스트의 환경을 바꿀 수 있다.

* MOCK: WebApplicationContext를 로드하고 서블릿 컨테이너 환경을 mocking 한다. 내장된 서블릿 컨테이너는 전혀 시작되지 않는다.
* RANDOM_PORT: EmbeddedWebApplicationContext를 로드하고 내장된 서블릿 컨테이너가 시작되는데 요청을 받아들이는 port를 랜덤하게 바꾸고 시작한다.
* DEFINED_PORT: 역시 EmbeddedWebApplicationContext를 로드하는데, 지정한 포트를 가지고 요청을 받아들인다. (default는 8080)
* NONE: ApplicationContext를 로드하기는 하지만 서블릿 컨테이너 환경을 제공하지 않는다.

> @RunWith(@SpringRunner.class) 도 빼먹지 말자. 추가하지 않는다면 @SpringBootTest annotation은 무시된다.


<br>
## Detecting test configuration

Spring Framework로 개발하다보면 **@ContextConfugration** annotation을 써서 ApplicationContext를 로드했을 것이다.

> **@ContextConfugration**
@ContextConfugration(locations={"/app-config.xml", "/test-config.xml"}) 와 같이 XML 파일로부터 ApplicationContext를 로드
@ContextConfugration(classes={AppConfig.class, TestConfig.class}) 와 같이 **@Configuration** 클래스로부터 ApplicationContext 로드
