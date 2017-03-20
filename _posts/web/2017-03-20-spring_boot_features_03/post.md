---
layout: post
title:  "Spring Boot Reference Guide Review 04"
date:   2017-03-20
desc: "Spring Boot Reference Guide Review 04"
keywords: "spring boot, spring, server programming"
categories: [Web]
tags: [spring boot, spring]
icon: icon-html
---

> Spring Boot Reference Guide Part4, Chapter 26 Logging

## Developing web applications

Spring Boot는 기본적으로 웹 애플리케이션 개발에 대해 강력한 기능을 제공한다. HTTP Server를 내장된 Tomcat이나 Jetty, Undertow를 통해 제공하며, spring-boot-start-web 아티팩트만 추가한다면 큰 어려움없이 빠르게 웹 애플리케이션 개발을 시작할 수 있다.

<br>
### The 'Spring Web MVC Framework'

Spring Web MVC 프레임워크는 MVC 패턴에 입각한 (Model - View - Controller) 웹 개발 프레임워크이다.
@Controller나 @RestController를 통해 HTTP request에 대해 처리하는데 @RequestMapping을 통해 각 URL에 따른 HTTP request 처리 메소드를 매핑할 수 있다.

~~~java
@RestController
@RequestMapping(value="/users")
public class MyRestController {

  @RequestMapping(value="/{user}", method=RequestMethod.GET)
  public User getUser(@PathVariable Long user) {...}

  @RequestMapping(value="/{user}/customers", method=RequestMethod.GET)
  public User getUserCustomers(@PathVariable Long user) {...}

  @RequestMapping(value="/{user}", method=RequestMethod.DELETE)
  public User deleteUser(@PathVariable Long user) {...}
}
~~~

<br>
### Spring MVC auto-configuration

Spring Boot는 Spring MVC 프레임워크를 사용하기 위해 auto configuration 기능을 제공한다.

* ContentNegotiatingViewResolver / BeanNameViewResolver 빈을 포함
* static resource 를 서비스할 수 있고, WebJars를 지원한다.
* Converter, GenericConverter, Formatter 빈을 자동 등록한다.
* HttpMessageConverters 를 지원한다.
* MessageCodesResolver를 자동 등록
* 커스텀 파비콘을 사용할 수 있고, ConfigurableWebBindingInitializer 빈을 자동으로 사용한다.

<br>
#### HttpMessageConverters

Spring MVC는 HttpMessageConverter 인터페이스를 통해 HTTP request 및 response를 변환한다. 각 데이터 오브젝트들은 Jackson 라이브러리를 통해 JSON 형식으로 변환하거나 JAXB나 Jackson XML 확장을 통해 XML 형식으로 변환할 수 있으며 기본적으로 UTF-8로 인코딩한다.

Spring Boot에서 만약 사용할 HttpMessageConverter 를 바꾸고 싶으면 다음과 같이 클래스를 추가해서 사용할 수 있다.
~~~java
import org.springframework.boot.autoconfigure.web.HttpMessageConverters;
import org.springframework.context.annotation.*;
import org.springframework.http.converter.*;

@Configuration
public class MyConfiguration {

  @Bean
  public HttpMessageConverters customConverters() {
    HttpMessageConverter<?> additional = ...
    HttpMessageConverter<?> another = ...
    return new HttpMessageConverters(additional, another);
  }
}
~~~

<br>
#### Custrom JSON Serializers and Deserializers



[spring_banner_change]: http://5mango.com/_10
