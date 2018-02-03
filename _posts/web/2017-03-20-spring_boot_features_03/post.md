---
layout: post
title:  "Spring Boot Reference Guide Review 05 : Developing web applications"
date:   2017-03-20
desc: "Spring Boot Reference Guide Review 05 : Developing web applications"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

> Spring Boot Reference Guide Part4, Chapter 27 Developing web applications

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
### Error Handling

Spring Boot는 예외가 발생했을 때, /error 페이지로 매핑하여 리다이렉트시킨다.
기본 에러 페이지는 JSON 포맷으로 에러에 대한 정보를 보내며, HTTP status 및 exception message를 출력한다.

![00.png](/static/assets/img/blog/web/2017-03-20-spring_boot_features_03/00.png)

이 예외 처리에 대해 커스터마이징하고자할 때, ErrorController or ErrorAttribute 인터페이스를 구현하거나, 환경변수로 설정할 수 있다.

<br>
#### 환경변수로만 설정하는 법

application.properties에 다음과 같이 설정할 수 있다.
~~~
server.error.path=/error
server.error.include-stacktrace=always
server.error.whitelabel.enabled=true
~~~
* server.error.path는 예외가 발생시 리다이렉트할 URI를 지정한다.
* server.error.include-stacktrace는 예외가 발생했을 때 스택 트레이스를 볼 것인가를 지정한다.
  * never: 보지 않음. (기본값)
  * always: 항상 본다.
  * on_trace_param: URI에 파라미터로 trace=true로 주었을 때만 본다.
* server.error.whitelabel.enabled 는 스프링 부트에서 기본적으로 제공하는 윗 그림과 같은 에러페이지를 볼 것인지를 지정한다. false로 설정할 겨우 기본 서블릿 컨테이너 에러 화면을 보게 된다.

<br>
#### ErrorAttribute 인터페이스 구현

ErrorAttribute는 기본적으로 Spring Boot에서 에러 처리하는 BasicErrorController에서 사용하는 인터페이스로,
예외 정보를 관리하게 된다.

DefaultErrorAttributes는 Spring Boot에서 기본적으로 사용하는 클래스인데, HandlerExceptionResolver를 구현하여 예외를 가져오는 기능을 가진다.
org.springframework.boot.autoconfigure.web.DefaultErrorAttributes 클래스를 참고하여 커스터마이징한다.

~~~java
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.web.DefaultErrorAttributes;
import org.springframework.context.annotation.Bean;
import org.springframework.web.context.request.RequestAttributes;

@SpringBootApplication
public class HelloSpringBootApplication {

	public static void main(String[] args) {
		SpringApplication.run(HelloSpringBootApplication.class, args);
	}

	@Bean
	public DefaultErrorAttributes errorAttributes() {

	    return new DefaultErrorAttributes() {

	        @Override
	        public Map<String, Object> getErrorAttributes(
	                RequestAttributes requestAttributes, boolean includeStackTrace) {

	            includeStackTrace = true;
	            Map<String, Object> errorAttributes =
                    super.getErrorAttributes(requestAttributes, includeStackTrace);
	            errorAttributes.put("custom_data",
	                    requestAttributes.getAttribute("custom_data", RequestAttributes.SCOPE_REQUEST));

	            return errorAttributes;
	        }
	    };
	}
}
~~~

<br>
#### ErrorController 인터페이스 구현

Spring Boot에서는 예외 발생시, ErrorController 인터페이스를 찾아서 getErrorPath 메소드를 실행시켜 예외를 처리할 URI를 얻는다.
기본 설정된 클래스는 org.springframework.boot.autoconfigure.web.BasicErrorController 이며, 내부에서는 getErrorPath 메소드로 가져온 URI의 요청도 처리하는 역할을 가지고 있다.
커스터마이징시에 이 클래스를 참고하여 구현하면 된다.

ErrorAttribute와 마찬가지로 다음과 같이 Spring 빈으로 선언만 하면 사용가능하다.
~~~java
@Bean
public BasicErrorController errorController(
        ErrorAttributes errorAttributes, ServerProperties serverProperties) {

    return new BasicErrorController(errorAttributes, serverProperties.getError()) {

        protected Map<String, Object> getErrorAttributes(
                HttpServletRequest request, boolean includeStackTrace) {

            Map<String, Object> errorAttr = super.getErrorAttributes(request, includeStackTrace);

            //custom code

            return errorAttr;
        }
    };
}
~~~

<br>
#### Custom Error pages

만약 HTTP status에 따라 커스터마이징한 Error 페이지를 보여주고 싶다면 다음과 같이 /error 폴더를 만들어 그 안에 html이나 FreeMaker, jsp 등을 넣어두면 된다.

* src
  * main
    * java
      * source codes
    * resources
      * public
        * error
          * 404.html
      * templates
        * error
          * 5xx.ftl
