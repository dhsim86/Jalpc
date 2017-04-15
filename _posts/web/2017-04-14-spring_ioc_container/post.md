---
layout: post
title:  "Spring IoC Container"
date:   2017-04-14
desc: "Spring IoC Container"
keywords: "spring, spring boot, server programming"
categories: [Web]
tags: [spring, spring boot]
icon: icon-html
---

> 내용 참고: 토비의 스프링 10장, IoC 컨테이너와 DI

# Spring IoC Container

Spring Framework로 개발된 애플리케이션에서는 **빈 오브젝트의 생성과 관계설정, 사용, 제거 등의 작업을 개발자가 직접 애플리케이션 코드에서 구현하는게 아니라, 독립된 Container가 담당한다.** 이렇게 Container가 사용자의 코드 대신에 오브젝트에 대한 제어권을 가지고 있는데 이를 **IoC** 라고 부른다. 따라서 Spring Container를 IoC Container 라고도 한다.

> Spring에서는 IoC를 담당하는 Container를 빈 팩토리 또는 애플리케이션 컨텍스트라고 부르기도 한다.
오브젝트의 생성과 오브젝트 사이의 관계 설정하는 것으로 볼 때 Container를 빈 팩토리라고 부른다. 하지만 Spring Container는 이러한 DI 작업 뿐만 아니라, 여러가지 기능을 추가적으로 담당하고 있다.

Spring Framework에서는 이 애플리케이션 컨텍스트가 다음과 같이 BeanFactory와 ApplicationContext 라는 두 개의 인터페이스로 정의되어 있다.

~~~java
public interface ApplicationContext extends ListableBeanFactory, HierarchicalBeanFactory, MessageSource, ApplicationContextPublisher, ResourcePatternResolver {
  ...
}
~~~

> Spring Container는 이 ApplicationContext 인터페이스를 구현한 클래스의 오브젝트이다.

## IoC 컨테이너를 이용한 애플리케이션 만들기

가장 간단하기 IoC Container를 만드는 방법은 다음과 같이 ApplicationContext 인터페이스를 구현한 클래스의 인스턴스를 생성하는 것이다.

~~~java
StaticApplicationContext staticApplicationContext = new StaticApplicationContext();
~~~

그런데 위와 같이 막 생성한 이 것은 아무런 하는 일이 없는 비어 있는 Container이다. 이렇게 만들어지는 Container가 IoC Container로서 동작하기 위해 두 가지가 필요하다. **POJO 와 설정 메타정보** 이다.




<br>
![00.png](/static/assets/img/blog/web/2017-04-13-spring_boot_property_validation/00.png)

---

좀 더 복잡한 예를 살펴보자.
다음과 같이 property가 중첩되어 정의되어 있으면 어떻게 클래스를 정의할까?
~~~
spring:
  datasource:
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://localhost:3306/sample_db?useUnicode=true&characterEncoding=UTF-8
    username: sample
    password: sample1234
~~~

위의 예에서는 spring - datasource - ... 단계로 property가 중첩되어 있다. 이렇게 property가 중첩되어 정의되어 있으면 똑같이 클래스를 정의할 때도 **static 이너 클래스를 추가로 정의하고 해당 클래스의 오브젝트를 필드로 정의해야 한다.**

~~~java
import javax.validation.Valid;

import org.hibernate.validator.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "spring")
@Validated
@Data
public class SpringProperties {

	@Valid
	private final DataSource datasource = new DataSource();

	@Data
	public static class DataSource {

		@NotEmpty
		private String driverClassName;

		@NotEmpty
		private String url;

		@NotEmpty
		private String username;

		@NotEmpty
		private String password;
	}
}
~~~

위의 예에서 datasource 가 중첩되어 있는데 해당 부분을 static 이너 클래스로 정의하고, 안에 필드로써 property들을 정의하였다. 그리고 해당 클래스의 오브젝트를 필드로 정의하고, javax.validation의 **@Valid** annotation을 추가해주면 된다.


[configurationProperties-validation]: https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html#boot-features-external-config-validation
[type-safe-configuration-properties]: https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html#boot-features-external-config-typesafe-configuration-properties
