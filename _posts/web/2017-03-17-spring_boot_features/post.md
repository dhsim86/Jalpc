---
layout: post
title:  "Spring Boot Reference Guide Review 03"
date:   2017-03-17
desc: "Spring Boot Reference Guide Review 03"
keywords: "spring boot, spring, server programming"
categories: [Web]
tags: [spring boot, spring]
icon: icon-html
---

## SpringBootApplication

SpringApplication 클래스는 main method로부터 시작하는 Spring 애플리케이션을 쉽게 시작할 수 있도록 도와주는 클래스이다.
보통 Spring Boot를 사용한다면 다음과 같이 main method가 작성되어 있을 것이다.

~~~java
public static void main(String[] args) {
  SpringApplication.run(MySpringConfiguration.class, args)
}
~~~

![00.png](/static/assets/img/blog/web/2017-03-17-spring-boot-features/00.png)

> 만약 애플리케이션을 시작하는데 실패하면 FailureAnalyzers를 통해 에러 메시지를 확인하여 대응할 수 있다.

<br>
## Spring Boot Banner

배너는 Spring Boot 애플리케이션이 시작될 때, 출력되는 것으로 banner.txt를 클래스패스에 추가하는 것으로 기본적으로 출력되는 배너를 바꿀 수 있다.

Spring Boot 1.1 버전부터 커스터마이징이 가능하지만 1.4버전까지 업데이트되면서 그림파일도 넣을 수 있다.

[Spring Boot 시작배너 바꾸기][spring_banner_change]

> 그림파일을 아스키코드로 바꾸어 변경해주는 것을 통해 사용하고 싶은 그림으로 배너를 바꿀 수 있다. 그리고 1.4버전부터는 gif, jpg, png 이미지 파일을 직접 배너로 설정하는 것도 가능하다.

사용하고 싶은 배너를 banner.txt 라는 이름으로 src/main/resource 폴더에 넣어주기만 하면 다음과 같이 바뀌는 것을 확인할 수 있다.

![01.png](/static/assets/img/blog/web/2017-03-17-spring-boot-features/01.png)

<br>
## Customizing SpringApplication

 main 메소드에서 SpringApplication이 사용하는 디폴트 설정들을 쓰지 않고 몇몇 부분들을 정의하여 사용하고자할 때, main 메소드에서 다음과 같이 작성한다.

~~~java
@SpringBootApplication
public class HelloSpringBootApplication {

	public static void main(String[] args) {
		//SpringApplication.run(HelloSpringBootApplication.class, args);
	    SpringApplication app = new SpringApplication(HelloSpringBootApplication.class);
	    app.setBannerMode(Banner.Mode.OFF);
	    app.run(args);
	}
}
~~~
 > SpringApplcation.run static 메소드는 내부적으로 SpringApplication을 생성 후 run을 호출한다. run static 메소드를 사용하는 대신에 직접 SpringApplication 객체를 생성 후 run 을 호출하였다.

 > SpringApplication 객체의 run 메소드로 넘어가는 파라미터인 args 는 @Configuration class의 정보나 XML configuration 등 Spring 빈을 생성하기 위해 스캔해야될 정보이다.

 소스가 아니더라도 src/main/resources 에 있는 application.properties를 통해 SpringApplication 설정 정보를 다음과 같이 변경할 수 도 있다.

 ~~~
 spring:
  mvc.view:
    prefix: /WEB-INF/jsp/
    suffix: .jsp
 ~~~

[spring_banner_change]: http://5mango.com/_10
