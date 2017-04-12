---
layout: post
title:  "Monitoring Spring Boot App with Actuator"
date:   2017-04-12
desc: "Monitoring Spring Boot App with Actuator"
keywords: "server programming"
categories: [Web]
tags: [server programming]
icon: icon-html
---

> 원본글: [How to choose the number of topics / partitions in a Kafka Cluster?][how-many-partition]
# Monitoring Spring Boot application with Actuator

Spring Boot에서 제공하는, 운영 중인 서버 애플리케이션을 모니터링하고, 관리할 수 있게 해주는 모듈인 Actuator에 대한 간략 설명 및 사용법, 그리고 이를 활용하여 web ui로 확인할 수 있는 **spring-boot-admin** 에 대한 내용을 다룬 포스트이다.

기본적으로 Actuator롤 사용하면, 제공하는 endpoint URL을 통해 서버 애플리케이션의 프로파일이나 등록된 빈 정보, 현재 상태를 확인할 수 있다.

<br>
## Actuator Endpoints

이 절에서 다루는 내용은 Spring Boot Reference Guide에서 설명한 내용을 위주로 다루며, 실제 endpoint URL을 통해 접속했을 때 어떤 정보를 확인할 수 있는지 다룬 것이다.

Spring Boot에서 제공하는 기본 endpoint 리스트는 다음과 같다. 물론 개발자가 임의로 추가한 **'custom endpoint'** 도 만들 수 있다.

| ID | Description |
| ---------- | :--------- |
| actuator | 현재 애플리케이션에서 제공 중인 endpoint들의 URL을 확인할 수 있다. |
| autoconfig | Spring Boot 애플리케이션이 시작하면서 자동 설정한 정보와 성공 / 실패 내역 및 이유를 확인할 수 있다. |
| beans | 현재 애플리케이션에 등록된 스프링 빈들의 리스트를 확인할 수 있다. |
| configprops | @ConfigurationProperty 로 등록된 모든 값들을 확인할 수 있다. |
| dump | 운영 중인 애플리케이션의 스레드 덤프를 진행한다. |
| env | 애플리케이션의 모든 프로퍼티를 확인할 수 있다. |
| health | 현재 서버 상태, 디스크나 DB 정보를 확인할 수 있다. |
| info | 서버 애플리케이션의 정보를 확인한다. |
| loggers | 각 컴포넌트들의 configuration 정보, 로그 레벨을 확인할 수 있다. |
| metrics | 메모리 상태나 스레드 개수, 클래스 정보 등을 확인할 수 있다. |
| mappings | mapping 된 URL path 및 빈, HTTP request method 등을 확인할 수 있다. |
| trace | 최근 애플리케이션에 요청된 100개의 HTTP request를 확인할 수 있다. |

<br>
Endpoint를 통해 확인할 때는 json 형식으로 정보를 리턴하므로, 만약 크롬 브라우저를 사용한다면 **[JSON Viewer][json-viewer]** 를 설치하자. 이 플러그인을 통해 json 형식의 데이터도 쉽게 확인할 수 있을 것이다.

<br>
### actuator

이 endpoint을 사용하기 위해서는 다음과 같이 **Spring Boot HATEOAS** 의 의존성을 추가해주어야 사용할 수 있다.
~~~xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-hateoas</artifactId>
</dependency>
~~~

---
#### **HATEOAS (Hypermedia As The Engine Of Application State)**
HATEOAS는 RESTful API를 사용하는 클라이언트가 전적으로 서버에 의해 동적으로 상호작용을 할 수 있게 해준다. 쉽게 말하면 클라이언트가 서버에 요청할 때, 서버는 **요청에 의존되는 URI를 HTTP response에 포함시켜 반환할 수 있다.**
예를 들어, 사용자 정보를 입력(POST) 하는 요청 후, 사용자를 조회(GET), 수정(PUT), 삭제(DELETE) 할 수 있는 URI를 동적으로 알려주게 되는 것이다. 이렇게 동적으로 모든 요청에 의존되는 URI 정보를 제공해줄 때 다음과 같은 이점이 있다.

* 요청 URI 정보가 변경되어도 클라이언트에서 동적으로 생성된 URI를 사용한다면, 클라이언트 입장에서는 URI 수정에 따른 코드 변경이 불필요하다.
* URI 정보를 통해 의존되는 요청을 예측가능하게 한다.
* 기존 URI 정보가 아니라 resource까지 포함된 URI를 보여주기 때문에 reesource에 대한 확신을 갖게 된다.

---

actuator endpoint는 actuator URI 요청에 따른 의존되는 URI(즉 다른 endpoint들)의 정보를 제공하기 위해 HATEOAS가 필요한 것이다.

애플리케이션에서 제공 중인 endpoint들의 URL들을 다음과 같이 확인할 수 있다.
<br>
![00.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/00.png)

<br>
### autoconfig

이 endpoint를 통해 서버 애플리케이션이 시작될 때 자동 구성되는 요소들의 정보와 적용 혹은 미적용된 이유를 표시한다.
다음과 같이 condition 과 message를 통해 확인할 수 있다.
<br>
![01.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/01.png)

<br>
### beans

이 endpoint는 현재 등록된 스프링 빈들의 타입이나 스코프 등의 정보를 제공한다.
<br>
![02.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/02.png)

<br>
### configprops

**@ConfigurationProperties** annotation으로 생성한 property 값들을 보여준다. 이는 application.properties나 application.yml 에서 설정한 property 들도 포함된다. **@ConfigurationProperties** annotation과 관련해서 Spring Boot Reference 관련 절을 살펴보자. [(Type-safe Configuration Properties)][ConfigurationProperties]

<br>
![03.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/03.png)

<br>
### dump

이 endpoint들을 통해 스레드 덤프를 진행하여, 현재 운영 중인 서버 애플리케이션에서 동작 중인 스레드들의 정보를 확인할 수 있다. 스레드 정보뿐만 아니라 stackTrace를 통해 dump 진행 당시의 스레드들의 스택 프레임 및 해당 메소드 정보까지 확인할 수 있다.

아래와 같이 DispatcherServlet의 doService 메소드가 doDispatch 메소드를 거쳐 HTTP request에 대해 핸들링하는 것을 확인할 수 있다.
<br>
![04.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/04.png)

<br>
### env

Spring Boot에서 설정된 property 부터 시작해서, 현재 운영 중인 서버의 시스템 환경변수나 JVM 까지 확인할 수 있다.
<br>
![05.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/05.png)
![06.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/06.png)

<br>
### health

다음과 같이 현재 서버 상태 및 디스크, DB 정보를 확인할 수 있다.
<br>
![07.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/07.png)

<br>
### loggers

루트 로깅 레벨 및 각 컴포넌트 별로 설정된 로깅 레벨들을 확인할 수 있다.
<br>
![08.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/08.png)

<br>
### metrics

현재 실행 중인 서버 애플리케이션의 다음과 같이 보여준다.
<br>
![09.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/09.png)

각각의 게이지를 항목 별로 분류하면 다음과 같다.

| Category | Prefix | Description |
| ---------- | :--------- | ---------- |
| Garbage Collector | gc.* | GC 발생 횟수나 GC를 수행하는데 걸린 시간을 보여준다. |
| Memory | mem.* | 애플리케이션에 할당된 메모리 용량과 여유 공간을 보여준다. |
| Heap | heap.* | 현재 메모리 사용량을 보여준다. |
| Class Loader | classes.* | JVM 클래스 로더로 로드, 언로드된 클래스 개수를 보여준다. |
| System | processors, uptime, instance.uptime, systemload.average | 프로세스 개수와 같은 시스템 정보나 가동시간, 평균 시스템 로드 등을 보여준다.
| Thread Pool | threads.* | 스레드, 데몬 스레드 개수와, JVM이 시작된 이후 최대 스레드 개수를 보여준다.|
| Data Source | datasource.* | datasource 커넥션 수를 보여준다. |
| Tomcat Session | httpsessions.* | Tomcat의 활성화된 세션과 최대 세션 개수를 보여준다. |
| HTTP | counter.status.*, gauge.response.* | 애플리케이션에서 서비스한 HTTP 요청에 대해 다양한 게이지와 카운터를 보여준다. |

<br>
### mappings

Actuator에서 제공하는 endpoint를 포함한 controller 매핑 정보를 확인할 수 있다. 어떤 HTTP 메소드 형식을 받는지, 또한 response로 어떤 타입을 리턴하는지 확인할 수 있다.
<br>
![10.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/10.png)

<br>
### trace

이 endpoint를 통해 최근 요청된 HTTP request들의 정보를 100개까지 확인가능하다.
<br>
![11.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/11.png)

---
<br>
## Spring Boot Admin

Actuator에서 제공하는 endpoint들로 애플리케이션을 모니터링할 수는 있지만 좀 더 보기 좋게 모니터링을 할 수 있다.
**[spring-boot-admin][spring-admin]** 은 Spring Boot 애플리케이션을 심플한 web UI를 통해 모니터링을 할 수 있도록 도와준다. Actuator의 endpoint에서 제공하는 정보를 좀 더 쉽게 확인할 수 있도록 하는 것이다. **[Reference Guide (1.4.6)][spring-admin-ref]** 도 제공하니 참고하도록 하자.

먼저 다음과 같이 spring-boot-admin을 사용하기 위해 의존성을 추가하자.
~~~xml
<dependency>
  <groupId>de.codecentric</groupId>
  <artifactId>spring-boot-admin-server</artifactId>
  <version>1.4.6</version>
</dependency>

<dependency>
  <groupId>de.codecentric</groupId>
  <artifactId>spring-boot-admin-server-ui</artifactId>
  <version>1.4.6</version>
</dependency>
~~~

spring.boot.admin.url에 서비스 진행할 Spring Boot 애플리케이션의 주소를 포트번호 포함하여 설정한다. 밑의 예는 yml 파일을 통해 설정한 것이다.
~~~yml
spring:
  profiles:
    active: local
  boot:
    admin:
      url: http://localhost:10080

server:
  port: 10080
~~~

<br>
그리고 main 메소드가 있는 Spring Boot 메인클래스에 다음과 같이 **@EnableAdminServer** annotation을 추가한다.
~~~java
import de.codecentric.boot.admin.config.EnableAdminServer;

@SpringBootApplication
@EnableAdminServer
public class TemplateApplication {

	public static void main(String[] args) {
		SpringApplication.run(TemplateApplication.class, args);
	}
}
~~~

<br>
여기까지 진행하였으면 **spring.boot.admin.url** 에 설정된 URI를 통해 다음과 같이 spring-boot-admin page로 접속할 수 있다.
<br>
![12.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/12.png)

<br>
메인 페이지에서는 현재 실행 중인 애플리케이션의 상태를 확인할 수 있고 다음과 같이 상세 정보도 확인할 수 있다.
<br>
![13.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/13.png)

<br>
### Environment

현재 설정된 환경설정 변수 값이나 property들을 확인할 수 있다.
<br>
![14.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/14.png)

<br>
### Logger

컴포넌트 별로 현재 로깅 레벨을 UI를 통해 확인할 수 있다.
<br>
![15.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/15.png)

<br>
### Threads

현재 실행 중인 스레드들의 정보와 stackTrace를 확인할 수 있다.
<br>
![16.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/16.png)

<br>
### Trace

애플리케이션으로 요청된 HTTP request들을 타임라인으로 보여주고 있다.
<br>
![17.png](/static/assets/img/blog/web/2017-04-12-spring_boot_actuator/17.png)

[json-viewer]: https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh?hl=ko
[ConfigurationProperties]: http://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-external-config-typesafe-configuration-properties
[spring-admin]: https://github.com/codecentric/spring-boot-admin
[spring-admin-ref]: http://codecentric.github.io/spring-boot-admin/1.4.6/
