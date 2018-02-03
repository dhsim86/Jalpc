---
layout: post
title:  "Spring Boot Reference Guide Review 06 : Working with databases"
date:   2017-03-20
desc: "Spring Boot Reference Guide Review 06 :Working with databases"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

> Spring Boot Reference Guide Part4, Chapter 29 / 30

## Working with SQL databases

Spring Framework는 SQL DB 사용을 위한 강력한 기능을 제공한다. JDBC access를 위한 JdbcTemplate부터, Hibernate를 통한 ORM (Object Relational Mapping) 까지 지원한다.

Spring Framework에서는 Entity 클래스와 Repository 인터페이스 구현을 통해 기본적인 CRUD가 가능하다.

<br>
### Configure a DataSource

Java의 javax.sql.DataSource 인터페이스는 DB connection을 위한 기본 메소드를 제공하며, URL을 통해 DB 연결을 진행한다. Spring Boot에서 DataSource를 설정하기 위해 application.properties에 다음과 같이 추가할 수 있다.
~~~
spring.datasource.url=jdbc:mysql://localhost/test
spring.datasource.username=dbuser
spring.datasource.password=dbpass
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
~~~
만약 위와 같은 설정을 하지 않으면 Spring Boot는 자동으로 내장된 database를 사용할 것이다.

> Spring Boot는 url을 보고 어떤 DB의 JDBC Driver를 사용할지 결정할 수 있으므로 꼭 driver-class-name의 설정이 필요한 것은 아니다. 만약 driver-class-name이 설정되면, Spring Boot는 이 Driver 클래스가 사용가능한지 체크하게 되므로, 반드시 관련 dependency를 추가해서 그 Driver 클래스가 사용할 수 있어야 한다.

<br>
### Using JdbcTemplate

Spring Boot에서 JdbcTemplate나 NamedParameterJdbcTemplate는 자동 설정되며, 다음과 같이 @Autowired annotation을 써서 사용가가 정의한 빈에서 추가할 수 있다.

~~~java
package com.nhnent.hellospringboot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public MyBean(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;

    }
}
~~~

<br>
### JPA and 'Spring Data'
JPA, Java Persistence API는 Object를 관계형 데이터베이스에 저장할 수 있도록 매핑을 해주는 기술로, sprig-boot-starter-data-jpa를 dependency로 추가함으로써 사용할 수 있다.

* Hibernate: JPA 구현 중 가장 많이 사용된다.
* Spring Data JPA: JPA 기반으로 구현된 Repository 클래스들을 쉽게 사용할 수 있게 해준다.
* Spring ORMs: Spring Framework에서 ORM을 지원하는 코어 모듈이다.

> Spring Boot는 기본적으로 Hibernate 5.0.x version을 사용한다. 물론 4.3.x version이나, 5.2.x version도 사용가능하다.

<br>
#### JPA 사용해보기

<br>
##### Entity 추가
JPA에서 Entity라는 것은 데이터베이스에 저장하기 위해 사용자가 정의하는 클래스이다. 일반적으로 RDBMS에서 Table의 정의와 같은 것이다. Table의 이름이나 컬럼들에 대한 정보를 가진다. 원래 persistence.xml 파일에서 정의되지만 Spring Boot에서는 **Entity Scanning** 으로 xml 파일을 추가할 필요가 없다.

먼저 Table을 다음과 같이 만든다.
![00.png](/static/assets/img/blog/web/2017-03-21-spring_boot_features_04/00.png)

그리고 Entity 클래스를 추가한다.
~~~java
package com.nhnent.hellospringboot.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Member {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private long id;

    @Column
    private String name;

    @Column
    private int age;

    public Member() {

    }
    ...
}

~~~
@Entity annotation을 클래스의 선언 부분에 넣어주고, 멤버 필드는 테이블의 각 컬럼에 대응하면 된다.
**기본 생성자는 반드시 넣어주어야 한다.**

* **@Id** annotation: primary key에 해당하는 변수에 선언한다. @GeneratedValue는 해당 Id 값을 어떻게 자동으로 생성할지 선택할 수 있다. 이 컬럼은 autoincrement로 지정해두었다.
* **@Table** annotation: @Entity annotation를 사용하면 클래스의 이름과 같은 이름을 가지는 테이블과 매핑하는데, @Table annotation을 사용함으로써 이름이 다른 테이블과 매핑할 수 있다. **@Table(name="XXX")**
* **@Column** annotation: 멤버 필드와 같은 이름을 가지는 컬럼과 자동 매핑하므로 꼭 필요한 것은 아니지만, 필드 이름과 컬럼 이름이 서로 다를 경우에 **@Column(name="XXX")** 와 같이 매핑할 수 있다.

<br>
##### Repository 추가
Entity 클래스를 만들었다면, Repository 인터페이스를 구현해야 한다.
Repository 인터페이스는 DB에 엑세스하기 위해 정의된 인터페이스로, 메소드 이름으로부터 JPA 쿼리가 자동으로 만들어진다.

Spring Framework에서는 Entity의 기본적인 삽입, 조회, 수정, 삭제 (CRUD)가 가능하도록 CrudRepository라는 인터페이스를 만들어두었다.

다음과 같이 CrudRepository 인터페이스를 구현해서 Member 테이블에 CRUD를 할 수 있도록 한다.
~~~java
package com.nhnent.hellospringboot.dao;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.nhnent.hellospringboot.entity.Member;

public interface MemberRepository extends CrudRepository<Member, Long> {

    List<Member> findByNameAndAgeLessThan(String name, int age);

    @Query("select t from Member t where name=:name and age < :age")
    List<Member> findByNameAndAgeLessThanSQL(@Param("name") String name, @Param("age") int age);

    List<Member> findByNameAndAgeLessThanOrderByAgeDesc(String name, int age);
}
~~~

위의 코드는 Member Entity를 사용하기 위한 클래스로, 기본적인 메소드 외에 추가적인 메소드를 지정할 수 있다.
메소드 이름을 기반(Query Method)를 통해 만들 수도 있고, @Query annotation을 이용해 기존의 SQL 처럼 사용해도 된다.

> 위의 findByNameAndAgeLessThan 메소드와 findByNameAndAgeLessThanSQL 은 같은 루틴이다. 전자는 메소드 이름을 기반으로 쿼리를 날릴 것이고, 후자는 @Query annotation에 있는 SQL 문을 가지고 쿼리를 날릴 것이다.

> 메소드 이름을 기반으로 작성하는 것은 특정한 규칙이 있으므로, 만드는 방법은 다음을 참조한다.
[spring.io, Query Creation][query_creation]

다음과 같이 코드를 작성해서 추가한 Repository와 Entity 클래스를 사용하면 된다.
~~~java
@Component
public class MyApplicationRunnerRoutine implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(MyApplicationRunnerRoutine.class);

    @Autowired
    private MemberRepository memberRepository;

    public void run(ApplicationArguments args) {  
        memberRepository.save(new Member("a", 10));
        memberRepository.save(new Member("b", 15));
        memberRepository.save(new Member("c", 10));
        memberRepository.save(new Member("a", 5));

        Iterable<Member> memberList = memberRepository.findAll();

        logger.info("findAll() method");
        for (Member member : memberList) {
            logger.info(member.toString());
        }

        memberList = memberRepository.findByNameAndAgeLessThan("a", 10);

        logger.info("findAll() method");
        for (Member member : memberList) {
            logger.info(member.toString());
        }

        memberList = memberRepository.findByNameAndAgeLessThanSQL("a", 10);

        logger.info("findAll() method");
        for (Member member : memberList) {
            logger.info(member.toString());
        }

        memberList = memberRepository.findByNameAndAgeLessThanOrderByAgeDesc("a", 15);

        logger.info("findAll() method");
        for (Member member : memberList) {
            logger.info(member.toString());
        }

        memberRepository.deleteAll();
    }
}
~~~

그러면 다음과 같은 결과를 확인할 수 있다.

![01.png](/static/assets/img/blog/web/2017-03-21-spring_boot_features_04/01.png)

<br>
## Working with NoSQL technologies

Spring Data는 MongoDB, ElasticSearch, Redis, Cassandra와 같은 다양한 NoSQL을 지원한다. Spring Boot는 이러한 NoSQL을 위한 자동 설정을 지원한다.

<br>
### Redis

Redis는 "REmote DIctionary System"의 약자로 memory 기반의 key / value store 이다.
Spring Boot는 Jedis와 같은 Redis client 라이브러리를 위하 auto configuration을 지원하며, spring-boot-starter-data-redis 아티팩트 추가를 통해 쉽게 사용가능하다.

먼저 다음과 같이 Redis를 사용하기 위해 pom.xml에 dependency를 추가한다.
~~~xml
<dependency>
  <groupId>org.springframework.session</groupId>
  <artifactId>spring-session</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-redis</artifactId>
    <version>1.3.8.RELEASE</version>
</dependency>
~~~

그리고 Redis를 사용하기 위해 application.properties에 다음과 같이 추가한다.
~~~
redis.host=localhost
redis.port=6379
redis.database=0
~~~

여기서는 HttpSession을 사용하여 Cookie 값을 Redis로 저장해보겠다.
Spring Boot에서는 JedisConnectionFactory와 CookieSerializer를 @Bean annotation을 사용해서 주입할 수 있기 때문에, 다음과 같이 JedisConnectionFactory와 CookieSerializer를 리턴하는 @Bean 메소드를 정의한다.

~~~java
package com.nhnent.hellospringboot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
@EnableRedisHttpSession
@PropertySource("classpath:application.properties")
public class SessionConfig {

    @Value("${redis.host}")
    private String host;

    @Value("${redis.port}")
    private int port;

    @Value("${redis.database}")
    int database;

    @Bean
    public JedisConnectionFactory connectionFactory() {

        JedisConnectionFactory conn = new JedisConnectionFactory();

        conn.setHostName(host);
        conn.setPort(port);
        conn.setDatabase(database);
        conn.setUsePool(true);

        return conn;
    }

    @Bean
    public CookieSerializer cookieSerializer() {

        DefaultCookieSerializer serializer = new DefaultCookieSerializer();

        return serializer;
    }
}
~~~
위의 소스와 같이 application.properties 에 정의한 Redis 관련 값들을 @Value annotation으로 주입받아 JedisConnectionFactory를 초기화하고, CookieSerializer로는 DefaultCookieSerializer를 사용한다.

그리고 다음과 같이 controller에 테스트용 url를 만들어 Redis에 쿠키 관련 값들이 저장되는지 확인한다.
~~~java
import javax.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloRestController {

    @RequestMapping(path="/session-test", produces="text/plain")
    public String sessionTest(HttpSession session) {

        session.setAttribute("test", "hello");
        return (String)session.getAttribute("test");
    }
}
~~~

그리고 웹 브라우저로 /session-test에 접속, 현재 쿠키 값을 확인해보자.
![02.png](/static/assets/img/blog/web/2017-03-21-spring_boot_features_04/02.png)

redis-cli를 통해 Redis 에 저장된 쿠키 값을 다음과 같이 키로 저장되어 있는 것을 확인할 수 있을 것이다.
![03.png](/static/assets/img/blog/web/2017-03-21-spring_boot_features_04/03.png)


[query_creation]:http://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.query-methods.query-creation
