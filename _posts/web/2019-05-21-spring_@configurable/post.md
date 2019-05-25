---
layout: post
title:  "Spring DDD - @Configurable을 활용한 도메인 객체 의존성 주입"
date:   2019-05-21
desc: "Spring DDD - @Configurable을 활용한 도메인 객체 의존성 주입"
keywords: "spring, aop, aspectj, DDD, Domain, Domain Driven Design, @Configurable, @EnableLoadTimeWeaving, @EnableSpringConfigured"
categories: [Web]
tags: [spring]
icon: icon-html
---

**스프링 프레임워크는 객체지향 프로그래밍의 장점을 극대화하도록 돕는 도구이다.**  
기술적인 복잡함을 IoC 및 Di, AOP, 서비스 추상화를 통해 개발자로 하여금 기술적인 문제를 쉽게 해결하고 최대한 비즈니스 로직에 집중할 수 있게 돕는 것이다. 자신이 개발하는 애플리케이션 로직에 집중할 수 있다면 객체지향 프로그래밍 언어의 장점을 살려 효과적으로 개발할 수 있을 것이다.

**수많은 애플리케이션에서 다루어야 하는 문제에 대한 복잡성은 그 애플리케이션을 사용하는 사용자나 업무에 해당하는 도메인 그 자체이다.**  
도메인 주도 설계, 즉 DDD는 요구사항에 대한 회의부터 시작하여 코드의 구현에 이르기까지 통일된 언어를 바탕으로 도메인 문제를 해결하여 효과적인 커뮤니케이션, 각 요구사항에 잘 들어맞는 명확한 도메인 모델을 바탕으로 소프트웨어의 품질을 높이고자 하는 것이다.

스프링 프레임워크는 생산성과 애플리케이션 품질을 위한 애플리케이션 프레임워크일 뿐만 아니라, 개발자로 하여금 스프링이 지향하는 개발 원칙이나 철학, 원리를 자연스럽게 따라갈 수 있도록 하기 위해 등장한 것이다. DDD도 스프링이 지향하는 주된 가치이자 개발 원리로, 스프링 프레임워크 2.0이 발표되면서 DDD 방식의 개발을 지원하기 위해 많은 노력이 들어갔다고 한다. (물론 프레임워크 스스로도 DDD의 장점을 살려 개발되었다고 한다.) 

스프링 프레임워크 기반으로 DDD의 설계 원칙을 잘 살린다면 모두가 웃으면서 커뮤니케이션을 하고 개발을 할 수 있을 것 같다. 그럼 DDD 방식의 개발을 위해 스프링 프레임워크가 지원하는 것은 무엇일까?

그 중 하나가 @Configurable을 통한 도메인 객체에 대한 의존성 주입이다.

<br>

## [@Configurable](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/beans/factory/annotation/Configurable.html)

스프링 프레임워크가 DDD 개발을 위해 지원하는 애너테이션이다.

간단히 설명하면 **DDD에서 식별성과 연속성을 가지는 엔티티(Entity)나 애그리거트(Aggregate) 루트와 같은 도메인 객체에 대해서 자신을 나타내는 필드나 참조가 아닌, 그 객체의 기능 / 행위를 구현함에 있어서 필요한 의존성을 주입하기 위해 사용하는 것이다.** (값 객체(Value Object)도 의존성이 필요하다면 사용할 수 있을 것 같지만 그런 사례가 있는지는 모르겠다.)

스프링 프레임워크에서 의존성 주입을 위해 선제조건이 있는데, 의존성을 주입받는 객체나 주입이 되는 객체 모두 애플리케이션 컨텍스트에 미리 등록된 스프링 빈이어야 한다는 것이다.

또한 애플리케이션 컨텍스트에 등록되는 빈들은 보통 싱글톤 레지스트리에 존재하는 것으로, 애플리케이션이 종료될 때까지 자신의 상태가 변경되지 않는다. 상태가 변경되면 꼬일 수가 있고 초기화하기 위해서는 @DirtiesContext 애너테이션을 통해 다시 애플리케이션 컨텍스트를 로드해야 한다. **도메인 객체는 자신의 상태가 언제든지 변경될 수 있는 굉장히 유동적인 객체이다.**

스프링은 빈 스코프로 싱글톤 뿐만 아니라 프로토타입 스코프도 지원하기는 하지만 문제는 그게 아니다. 도메인 객체가 되는 엔티티나 애그리거트 루트는 스프링 프레임워크의 빈 팩토리가 생성하는 것이 아니라 **우리가 직접 비즈니스 로직을 구현하면서 생성하는 것이다.** 직접 만든 객체 (new를 통해 직접 생성자 호출하는 형식)는 스프링이 의존성을 주입해줄 수 없다.

그렇다고 개발자가 도메인 객체 생성시 필요한 의존성을 주입해주기에는 너무 힘이 든다. 매번 객체가 생성할 때마가 매번 개입을 해야하며, 도중에 의존성 하나만 추가되어도 많은 양의 코드가 추가되어야 한다.

스프링 프레임워크는 이 문제를 해결하여 비즈니스 로직 상에서 직접 도메인 객체를 생성할 때에도, 적절하게 의존성을 주입해주는 기능을 제공한다. 그 것이 @Configurable 애너테이션이다.

> 의존성 주입이 가능하다는 것은 빈 형태로 제공되는 각종 서비스, 예를 들어 AOP를 통한 어드바이스 적용이나 트랜잭션 지원도 가능하다는 것이다. @Configurable 애너테이션을 통해 의존성을 주입받을 수 있다면, 비즈니스 로직이 직접 생성하는 도메인 객체에 대해서도 AOP나 트랜잭션과 같은 서비스들을 적용시킬 수 있다.

<br>

## AspectJ

스프링 프레임워크는 애플리케이션 컨텍스트의 BeanDefinition 들을 참조하여 등록된 스프링 빈들에 대한 의존성을 해결한다. 그런데 빈으로 등록되지 않은, 개발자가 직접 생성하는 도메인 객체에 대해서 어떻게 의존성을 주입해주는 것일까?

다음 클래스가 있다고 해보자. User 도메인 객체는 자신의 정보를 DB에 저장하기 위해 repository를 필요로 한다고 하자.

```java
@Getter
@Setter
public class User {

    @Autowired
    private UserRepository repository;

    private Integer id;

    private String name;
    private int age;

    public User save() {
        return repository.save(this);
    }
}

...
public void businessLogic() {
    ...
    User user = new User();
    ...
}
```

User 도메인 객체는 비즈니스 로직 중간에 생성되는 객체이다. 스프링은 new 연산자를 통해 직접 생성되는 객체에 대해 의존성, userRepository를 주입해주어야 한다. 이를 위해서는 기존 방식과는 특별한 방식이 필요하다.

스프링 프레임워크는 이러한 도메인 객체에 의존성을 주입해주기 위해 **AspectJ**를 활용한 AOP를 적용한다. 즉, AspectJ를 통해 바이트코드를 조작하여 해당 객체의 생성자가 호출될 때 의존성을 주입해주는 코드를 슬쩍 추가하는 것이다. 따라서 이러한 기능이 필요할 경우, AspectJ를 사용해야 한다.

> AspectJ는 아주 강력한 AOP 도구이다. 데코레이터 패턴을 활용하는 JDK 다이내믹 프록시나 CGLib을 활용한 클래스 프록시 방식보다 더 강력한 기능을 제공한다. 메소드 호출에 끼어들어 AOP 적용을 할 수 있었던 두 방식에 비해 AspectJ는 직접 바이트코드를 조작하여 생성자 호출할 때나 어느 변수에 값을 대입할 때 등 여러 상황에 대해 끼어들어 AOP를 적용해준다.

AspectJ는 다음과 같은 기능을 제공한다. 위빙(Weaving)은 AOP 로직인 어드바이스(Advice)를 비즈니스 로직 코드에 적용하는 것을 말한다.

* Compile-time weaving: 소스를 컴파일할 때 위빙 작업을 진행하는 것을 말한다. 컴파일할 때 직접 바이트코드를 조작한다.
* Post-compile weaving: 자바 class 파일이나 jar 파일에 위빙 작업을 진행한다.
* Load-time weaving: 자바 클래스 로더가 클래스를 로딩할 때 위빙 작업을 진행한다. 별도의 위빙 agent가 필요하다.

여기서 @Configurable을 활용한 도메인 객체에 대한 의존성 주입에 필요한 것은 **Load-time weaving(LTW)** 이다. LTW를 통해 위빙을 위한 별도의 컴파일 작업이 필요없이 클래스가 로딩되는 시점에 자동으로 의존성을 주입해줄 수 있다.

이제 사전에 필요한 지식은 습득하였으니 직접 간단한 코드와 유닛 테스트를 작성하여 의존성 주입이 되는지 확인해보자.

<br>

## 사전 준비

<br>

### maven 설정

여기서는 Spring Boot 2.0.9 버전을 사용한다. 이 버전에 맞게 Spring Boot Starter를 통해 maven 의존성을 추가할 것이다. 테스트 용도로 데이터베이스는 H2 데이터베이스를 사용할 것이며, JPA를 통해 DB 엑세스할 것이다.

다음은 pom.xml이다. H2 및 JPA를 통해 DB를 사용하며, 유닛테스트를 위해 spring-boot-starter-test 의존성도 추가하였다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.dongho</groupId>
    <artifactId>Configurable</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>ConfigurableTest</name>
    <description>Spring DDD Configurable Test</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.9.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <java.version>1.8</java.version>

        <h2.version>1.4.199</h2.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
            <version>${h2.version}</version>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

이제 @Configurable 및 AspectJ의 LTW를 통한 도메인 객체 의존성을 주입을 위해 필요한 의존성을 maven에 추가하자. 필요한 의존성은 스프링 프레임워크의 AOP 지원을 위한 **spring-boot-starter-aop** 및 AspectJ의 LTW를 위한 **aspectjweaver** 이다.

> maven에서 AspectJ는 다양한 의존성이 있다. 여기서는 LTW만 사용할 것이므로 aspectjweaver만 추가한다.

다음과 같이 pom.xml에 필요한 의존성을 추가한다.

```xml
<aspectj.version>1.9.4</aspectj.version>

...


<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>

<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>${aspectj.version}</version>
    <scope>compile</scope>
</dependency>
```

그리고 앞서 언급하였는데, AspectJ의 LTW를 위해서는 위빙 작업을 위해 별도의 Agent가 필요하다. JVM 옵션, -javaagent 를 추가하여 애플리케이션을 실행해야 하지만, 여기서는 **maven-surefire-plugin** 플러그인을 통해 pom.xml에서 javaagent를 지정하도록 하겠다. 다음과 같이 플러그인을 추가한다.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>2.10</version>
    <configuration>
        <argLine>
            -javaagent:"${settings.localRepository}"/org/aspectj/aspectjweaver/${aspectj.version}/aspectjweaver-${aspectj.version}.jar
        </argLine>
        <useSystemClassLoader>true</useSystemClassLoader>
        <forkMode>always</forkMode>
    </configuration>
</plugin>
```

<br>

### H2 데이터베이스 설정

테스트를 위해 H2 데이터베이스를 사용할 것이다.
H2 데이터베이스 및 JPA를 사용하기 위해 Spring Boot의 application.yml에 다음과 같이 설정을 추가하자.

```yml
spring:
  profiles:
    active:
      - local
  datasource:
    platform: h2
    url: jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    generate-ddl: true
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        format_sql: true
        jdbc:
          batch_size: 100
        order_inserts: true
        order_updates: true
  h2:
    console:
      enabled: true

server:
  port: 8080
```

H2를 사용하기 위해 JDBC 드라이버 및 url을 설정하였고, 콘솔 화면에서 SQL 쿼리 확인 및 벌크 작업에 대한 JPA 설정을 추가하였다. 그리고 테스트 시작시에 미리 지정한 DB 스키마를 실행하여 자동으로 필요한 테이블 및 row 데이터를 insert 할 수 있도록 spring.jpa.generate-ddl을 true로 설정하였다.

Spring Boot는 H2 사용시, 클래스패스 경로에 있는 schema.sql 및 data.sql을 읽어들여 미리 테이블 생성 및 데이터를 적재해주는 기능을 제공한다. schema.sql에는 DDL 구문을 작성하고, 데이터 insert와 같은 DML 구문은 data.sql에 작성한다.

다음과 같이 /src/main/resources 디렉터리 안에 다음과 같이 schema.sql 및 data.sql을 작성하자.

**schema.sql**
```sql
DROP TABLE IF EXISTS user;

CREATE TABLE user (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(250) NOT NULL,
  age INT NOT NULL
)
```

**data.sql**
```sql
INSERT INTO user (name, age) VALUES ('member_00', 15)
INSERT INTO user (name, age) VALUES ('member_01', 16)
```

Spring Boot 시작시 user 테이블을 생성하고, 두 명분의 사용자 데이터를 insert 해둘 것이다.
이렇게 설정 후 Spring Boot 애플리케이션 시작 후 http://localhost:8080/h2-console 로 접속하여 다음 화면과 같이 접속하면 H2 콘솔에서 user 테이블 및 데이터를 확인할 수 있다.

![00.png](/static/assets/img/blog/web/2019-05-21-spring_@configurable/00.png)

<br>

![01.png](/static/assets/img/blog/web/2019-05-21-spring_@configurable/01.png)

<br>

### Entity 및 Repository 정의

H2 데이터베이스 및 초기 데이터 설정을 완료하였으니, 이제 이 user 테이블을 사용하기 위한 User 클래스 및 UserRepository 클래스를 정의해보자.

지금 우리가 정의하려는 User 클래스는 도메인 객체로 DDD에서 얘기하는 엔티티(Entity) 객체이다.

> **DDD에서 엔티티(Entity) 객체는 객체 생명 주기내에 있어서의 연속성과 식별성으로 정의되는 객체로, 식별성을 나타내는 어느 특정한 값(식별자)를 통해 고유한 객체를 찾을 수 있어야 한다.**

JPA를 사용하므로 JPA 애너테이션을 사용한다.

```java
@Getter
@Setter
@Entity
public class User {

    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private int age;
}

```

@Id 애너테이션으로 user 테이블의 primary key인 "user_id" 컬럼을 지정하였다.

> 여기서 JPA의 @Entity 애너테이션을 사용하는 것이 DDD에서 얘기하는 엔티티(Entity) 객체로 정의한다는 말이 아니라는 것에 주의하자. JPA의 @Entity는 어느 DB 테이블과 연관관계를 맺는 (오브젝트 매핑)를 클래스라는 것을 의미하는 것이다.

다음으로 DB 접근을 위해 UserRepository 인터페이스를 다음과 같이 정의한다. DB에 대한 기본적인 CRUD 기능을 제공하는 CrudRepository를 상속하였다. List 형태로 받기 위해 원래 Iterable\<T\> 타입으로 리턴하는 findAll 메서드를 오버라이드하였다.

```java
public interface UserRepository extends CrudRepository<User, Integer> {

    @Override
    List<User> findAll();

}
```

이제 이렇게 정의한 User 클래스 및 UserRepository를 설정한 H2 데이터베이스와 함께 잘 동작하는지 테스트해보자. 다음과 같이 유닛 테스트를 만들어 실행시키면 테스트 결과가 정상이라는 것을 알 수 있다.

```java
@SpringBootTest
@RunWith(SpringRunner.class)
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void findTest() {
        // 애플리케이션 시작시 user 테이블 생성 및 row 데이터 2개를 insert 하였다.
        List<User> userList = userRepository.findAll();
        assertThat(userList).isNotEmpty().hasSize(2);
    }
}
```

<br>

![02.png](/static/assets/img/blog/web/2019-05-21-spring_@configurable/02.png)

<br>

## @Configurable을 이용한 User 도메인 객체 구현

이제 우리가 하고자 하는 것은 비즈니스 로직에서 직접 생성하는 **도메인 객체**인 User 클래스의 인스턴스에 자동으로 필요한 의존성을 주입하는 것이다.

앞에서 문제 제기한 것처럼, User 클래스의 어떤 행위를 구현하기 위해(save 메서드), UserRepository 인스턴스가 필요하다고 생각해보자. User 인스턴스는 스프링 빈이 아니므로 다음 코드와 같이 UserRepository 인스턴스를 주입받을 수 없다.

```java
@Getter
@Setter
@Entity
public class User {

    // save 메서드에서 repository를 필요로 하지만 스프링 빈이 아니므로 주입받을 수 없다.
    @Autowired
    private UserRepository repository;

    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private int age;

    public User save() {
        return repository.save(this);
    }
}
```

스프링 프레임워크는 DDD의 도메인 객체 구현에 있어서 필요한 의존성을 주입받을 수 있도록 @Configurable 애너테이션 및 AspectJ를 통해 해결한다고 언급하였다. AspectJ를 통해 도메인 객체 생성자 호출시 필요한 의존성을 자동으로 주입해줄 수 있도록 위빙해주는 것이다. 이런 스프링 프레임워크의 지원을 받아 우리는 도메인 객체 생성시 필요한 의존성을 쉽게 주입받을 수 있다.

다음과 같이 @Configurable 애너테이션을 추가한다.

```java
@Configurable(value = "user", autowire = Autowire.BY_TYPE, dependencyCheck = true, preConstruction = true)
@Entity
@Getter
@Setter
public class User {

    // User 클래스의 repository 필드는 DB에 저장되는 값이 아니므로, @Transient 애너테이션을 통해 제외시킨다. 
    @Transient
    @Autowired
    private UserRepository repository;

    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private int age;

    public User save() {
        return repository.save(this);
    }
}
```

그리고 이 @Configurable 애너테이션 및 AspectJ의 LTW를 Spring Boot에서 사용하기 위해서 다음과 같은 설정을 추가해주어야 한다.

```java
@Configuration
@EnableLoadTimeWeaving(aspectjWeaving = EnableLoadTimeWeaving.AspectJWeaving.ENABLED)
@EnableSpringConfigured
public class AspectJConfig {

    @Bean
    public InstrumentationLoadTimeWeaver loadTimeWeaver() {
        InstrumentationLoadTimeWeaver loadTimeWeaver = new InstrumentationLoadTimeWeaver();
        return loadTimeWeaver;
    }
}
```

[**@EnableSpringConfigured**](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/context/annotation/aspectj/EnableSpringConfigured.html) 애너테이션은 Spring Boot가 @Configurable 애너테이션이 붙은, 스프링 빈 팩토리에 의해 생성되지 않는 클래스의 인스턴스에 대해 의존성을 주입해주기 위해 사용하는 애너테이션이다.

[**@EnableLoadTimeWeaving**](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/context/annotation/EnableLoadTimeWeaving.html)은 AspectJ의 LTW를 사용하기 위한 애너테이션이다. 디폴트는 AUTODETECT 인데, 클래스패스에 AspectJ 설정인 aop.xml이 있는 경우에만 활성화한다. 우리는 여기서 따로 AspectJ 설정을 추가하지는 않았으므로 활성화하기 위해 ENABLED로 설정한다.

[**InstrumentationLoadTimeWeaver**](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/instrument/classloading/InstrumentationLoadTimeWeaver.html) 타입의 오브젝트는 LTW를 위한 바이트 코드 조작시 필요한 스프링 Agent를 활성화하기 위한 빈이다.

이로써 User 도메인 객체를 위한 필요한 설정 작업을 마쳤다. 다음으로 유닛 테스트를 통해 정상 동작하는지 확인해보자. 다음 테스트는 User 인스턴스 생성시 UserRepository 인스턴스를 제대로 주입받았는지, 그리고 실제로 비즈니스 로직(DB에 User 인스턴스 저장)이 잘 실행되었는지 확인한다.

```java
@SpringBootTest
@RunWith(SpringRunner.class)
public class UserTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void userDependencyTest() {
        User user;

        given: {
        }

        when: {
            user = new User();
        }

        then: {
            assertThat(user.getRepository()).isNotNull();
        }
    }

    @Test
    public void saveItselfTest() {
        User user;

        given: {
            user = new User();
            user.setId(0);
            user.setName("saveItself");
            user.setAge(10);
        }

        when: {
            user = user.save();
        }

        then: {
            Optional<User> optUser = userRepository.findById(user.getId());
            assertThat(optUser.isPresent()).isTrue();
            assertThat(optUser.map(User::getId).get()).isEqualTo(user.getId());
            assertThat(optUser.map(User::getName).get()).isEqualTo(user.getName());
            assertThat(optUser.map(User::getAge).get()).isEqualTo(user.getAge());
        }
    }
}
```

위의 테스트를 실행하면 다음과 같이 테스트가 통과되는 것을 확인할 수 있다. User 인스턴스를 직접 생성하였는데 @Autowired를 통한 자동 와이어링으로 필요한 UserRepository 인스턴스를 주입받은 것을 확인할 수 있었고, save 메서드도 잘 동작함을 확인할 수 있다.

<br>

![03.png](/static/assets/img/blog/web/2019-05-21-spring_@configurable/03.png)

이렇게 스프링 프레임워크에서 DDD 방식의 개발을 위해, 도메인 객체에 의존성 주입하는 설정, 테스트를 진행해보았다. 스프링 프레임워크를 사용하고 DDD에 관심이 많다면 스프링 프레임워크가 DDD를 위해 어떻게 지원하는지 알아보는 것도 나쁘지 않은 선택일 것이다.