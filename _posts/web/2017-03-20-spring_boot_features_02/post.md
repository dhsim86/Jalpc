---
layout: post
title:  "Spring Boot Reference Guide Review 04 : Logging"
date:   2017-03-20
desc: "Spring Boot Reference Guide Review 04 : Logging"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

> Spring Boot Reference Guide Part4, Chapter 26 Logging

## Logging

Spring Boot는 개발자에게 알려야할 메시지를 로깅 라이브러리를 통해 로그로 출력한다.
만약 pom을 통해 spring-boot-start 또는 spring-boot-start-web 아티팩트를 추가한 상태에서는 spring-boot-starter-logging 아티팩트도 자동 포함하므로, 로깅을 위해 별도의 라이브러리를 추가할 필요가 없다.

Spring Boot는 디폴트로 Logback 로깅 라이브러리를 사용하여 로그를 출력하며, 개발자는 추상체인 SLF4J를 통해 로그를 기록하면 된다.
> Java에서 로깅을 위한 다양한 로깅 라이브러리가 있지만, Spring Boot가 제공하는 default 로깅 라이브러리도 충분히 사용할만 하다.

다음 코드와 같이 slf4j.Logger 를 통해 로깅을 할 수 있다.
밑의 코드는 info를 통해 INFO 레벨로 로깅한다. debug나 error와 같은 레벨도 메소드로서 호출한다.
~~~java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class MyCommandLineRoutine implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(MyCommandLineRoutine.class);

    public void run(String ... args) {

        logger.info("CommandLineRunner Do.");
    }
}
~~~

<br>
### Log Format

가장 기본적인 로그 포맷은 다음과 같다.
![00.png](/static/assets/img/blog/web/2017-03-20-spring_boot_features_02/00.png)

1. Date and Time: 기본적으로 ms 단위
2. Log Level: ERROR, WARN, INFO, DEBUG 그리고 TRACE 레벨로 나뉘어진다.
3. Process ID
4. ---: Separator
5. Thread Name
6. Logger Name
7. 로그 메시지

<br>
### Console Output

로깅을 하게 되면, console에 로그 메시지를 출력하게 되는데, 기본적으로 ERROR, WARN, INFO 레벨의 로그 메시지가
출력되고, --debug 옵션에 따라서 DEBUG 레벨의 로그 메시지도 추가적으로 출력할 수 있다.

DEBUG나 TRACE 레벨의 로그 메시지를 출력하기 위해 application.properties에 다음과 같이 property를 셋팅하면 출력할 수 있다.
~~~
debug=true
trace=true
~~~

<br>
### File Output

Spring Boot는 console에만 로그 메시지를 출력하므로, 파일에 쓸려면 logging.file이나 logging.path property를 application.properties에 추가해야 한다.

> 기본적으로 console과 같이 ERROR, WARN, INFO 레벨의 로그 메시지가 파일에 쓰여지게 되며, 로그 파일이 10MB가 넘어가게 되면 다시 파일 처음으로 돌아가 덮어쓰게 된다.
