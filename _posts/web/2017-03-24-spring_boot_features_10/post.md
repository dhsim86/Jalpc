---
layout: post
title:  "Spring Boot Reference Guide Review 10"
date:   2017-03-24
desc: "Spring Boot Reference Guide Review 10"
keywords: "spring boot, spring, server programming"
categories: [Web]
tags: [spring boot, spring]
icon: icon-html
---

> Spring Boot Reference Guide Part5, Spirng Boot Actuator, Production-Ready features.

# Spring Boot Actuator

Spring Boot에서 제공하는 Actuator는 라이브 시스템에서 운영 중인 서버 애플리케이션을 모니터링하고, 관리할 수 있게 해주는 모듈이다. URI를 통해 현자 운영 중인 서버 애플리케이션의 상태를 확인할 수 있다.

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

[spring_boot_endpoint]: https://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/#production-ready-endpoints
