---
layout: post
title:  "Spring Boot Reference Guide Review 11 : 'How-to' guide"
date:   2017-03-24
desc: "Spring Boot Reference Guide Review 11 : 'How-to' guide"
keywords: "spring boot, spring, server programming"
categories: [Web]
tags: [spring boot, spring]
icon: icon-html
---

> Spring Boot Reference Guide Part9, 'How-to' guide

# Spring Boot Actuator / Remote Shell

Spring Boot에서 제공하는 Actuator는 라이브 시스템에서 운영 중인 서버 애플리케이션을 모니터링하고, 관리할 수 있게 해주는 모듈이다. URI를 통해 현재 운영 중인 서버 애플리케이션의 상태를 확인할 수 있다.

<br>
## pom.xml 추가

다음과 같이 pom.xml에 Actuator의 의존성을 추가하면 사용할 수 있다.
~~~xml
<dependency>
   <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
~~~

그리고 application.properties 파일에 다음 항목을 추가한다.
~~~
management.security.enabled=false
~~~
위의 property는 권한없이 Actuator를 통해 서버 애플리케이션의 상태를 모니터링할 수 있도록 한다.

<br>
## Endpoints

Actuator의 Endpoint는 서버 애플리케이션과 상호작용을 통해 모니터를 할 수 있도록 한다.
Spring Boot는 다양한 built-in endpoint 들을 제공하며, 물론 사용자가 직접 추가해서 사용할 수도 있다.

Endpoint 들은 각자 자신의 ID를 가지고 있는데, 그 ID 명으로 URL이 매핑된다. 예를 들어 **"health"** endpoint는 **/health** 로 매핑될 것이다.

**autoconfig** endpoint는 Spring Boot 애플리케이션이 시작될 때 설정된 auto-configuration 정보와 왜 적용되고 적용이 안되었는지 대해 리포트한다.
<br>
![01.png](/static/assets/img/blog/web/2017-03-24-spring_boot_features_10/01.png)


**beans** Endpoint는 서버 애플리케이션이 사용하는 모든 빈들의 정보를 리포트한다.
![02.png](/static/assets/img/blog/web/2017-03-24-spring_boot_features_10/02.png)

위와 같이 여러 URL로 매핑되는 각 EndPoint들로 서버 애플리케이션의 상태나 정보를 확인할 수 있는 것이다.
Spring Boot가 지원하는 EndPoint는 [여기에서][spring_boot_endpoint] 확인하자.

<br>
# Remote Shell

Spring Boot는 SSH 접속을 통해 모니터링할 수 있는 기능을 제공한다.
먼저 이 기능을 사용해보기 위해 다음과 같이 pom.xml에 의존성을 추가한다.
~~~xml
<dependency>
   <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-remote-shell</artifactId>
</dependency>
~~~

Remote shell과 관련하여 설정할 것이 유저 아이디 및 비밀번호가 있는데 비밀번호를 설정하지 않으면 다음과 같이 애플리케이션이 시작될 때 랜덤한 비밀번호가 생성되며, 기본 유저 아이디는 **user** 가 된다.
<br>
![03.png](/static/assets/img/blog/web/2017-03-24-spring_boot_features_10/03.png)

다음과 같이 application.properties에 property를 추가하여 유저 아이디 및 비밀번호를 설정하자.
~~~
management.shell.auth.simple.user.name=dongho
management.shell.auth.simple.user.password=1234
~~~

그리고 애플리케이션에 remote shell을 통해 ssh 접속을 해보자. (기본 포트는 2000 이다.)
다음과 같이 ssh를 통해 접속하면 이전에 설정해둔 배너가 출력되고 쉘 프롬프트가 사용자가 커맨드를 입력하기를 기다릴 것이다.
![04.png](/static/assets/img/blog/web/2017-03-24-spring_boot_features_10/04.png)

<br>
## Remote shell command

Spring Boot는 Remote Shell에서 다양한 커맨드를 통해서 강력한 기능을 제공한다.
특히 마음에 드는 부분이 **"dashboard"** 커맨드였다.

이 커맨드의 실행 결과는 다음과 같이 나타난다.
<br>
![05.png](/static/assets/img/blog/web/2017-03-24-spring_boot_features_10/05.png)

위의 스냅샷을 보면 알 수 있겠지만 현재 CPU 점유율이 높은 모듈을 리눅스 커맨드의 **"top"** 처럼 보여주고,
밑에는 자바 시스템 속성들, 그리고 자바 힙 영역을 eden / servivor / old gen 으로 체계적으로 보여주고 있다.

이 외에도 다른 명령어를 통해 현재 애플리케이션의 자동 설정 정보나, 빈 정보, jvm 정보까지 확인할 수 있다.

[spring_boot_endpoint]: https://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/#production-ready-endpoints
