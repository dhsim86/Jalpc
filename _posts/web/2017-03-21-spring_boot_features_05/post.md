---
layout: post
title:  "Spring Boot Reference Guide Review 07 : Caching"
date:   2017-03-21
desc: "Spring Boot Reference Guide Review 07 : Caching"
keywords: "spring, spring boot, cache"
categories: [Web]
tags: [spring]
icon: icon-html
---

> Spring Boot Reference Guide Part4, Chapter 31 caching

## Caching

Spring Framework는 서버 애플리케이션을 위해 다양한 캐시들을 지원한다. 기본적으로 여러 서드파티 캐시 라이브러리들을 지원하며 자신에 맞는 캐시를 골라서 사용하면 되겠다.

JSR-107(JCache) 구현체들은 모두 지원하며, EHCache, Hazelcast, Infinispan, Couchbase, Redis, Caffeine, Guava 등이 기본적으로 자동 설정을 지원한다.

Spring에서는 추상화된 캐시를 지원하는데 CacheManager라는 인터페이스로 구현해주면 된다. 물론 그에 따른 Cache도 구현해야 한다.

먼저 다음과 같이 pom.xml에 spring-boot-starter-cache dependency 를 추가하고 @EnableCaching annotation을 사용하면 된다.
~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
~~~
~~~java
package com.nhnent.hellospringboot;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Component;

@Component
@EnableCaching
public class MyBean {
    ...
}
~~~

**@EnableCaching** annotation은 프로젝트에서 캐시 관련 annotation **(@Cacheable, @CacheEvict)** 를 사용하겠다는 선언이다.

> 테스트 등 캐싱을 강제로 disable 시키고 싶으면 application.properties에 spring.cache.type property를 통해 disable 시킬 수 있다.

<br>
### 캐싱해보자

spring-boot-starter-cache는 기본 CacheManager로 **ConcurrentHashMap**을 사용하고 있어, 여기서는 **Ehcache** 를 사용하여 실험하기 위해 다음과 같이 의존성을 추가한다.
~~~xml
<dependency>
    <groupId>net.sf.ehcache</groupId>
    <artifactId>ehcache</artifactId>
    <version>2.9.1</version>
</dependency>
~~~

> Ehcache는 Java 생태계에서 간편하게 쓰이는 캐시 라이브러리이다. Spring Framework를 사용할 때 Ehcache를 Spring이 제공하는 Cache 관련 인터페이스에 붙여서 사용한다.

먼저 자동으로 Spring Boot가 dependency에 따라 Ehcache를 사용하는지 알아보자.
CommandLineRunner를 통해 Spring Boot 애플리케이션이 시작될 때 run 메소드가 시작되도록 하여 CacheManager를 확인한다.
~~~java
package com.nhnent.hellospringboot;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

@Component
public class MyCommandLineRoutine implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(MyCommandLineRoutine.class);

    private final CacheManager cacheManager;

    public MyCommandLineRoutine(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    public void run(String ... args) {

        logger.info("CommandLineRunner Do.");
        logger.info("Using cache manager: " + this.cacheManager.getClass().getName());
    }
}
~~~
<br>
그런데 dependency 추가하는 것만으로는 CacheManager가 바뀌지 않는다.
Ehcache를 사용하기 위한 다음 ehcache.xml 파일을 src/main/resources에 추가해야 한다.
~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:noNamespaceSchemaLocation="http://ehcache.org/ehcache.xsd"
	updateCheck="false">

	<diskStore path="java.io.tmpdir" />

	<cache 	name="findMemberCache"
			maxEntriesLocalHeap="10000"
			maxEntriesLocalDisk="1000"
			eternal="false"
			diskSpoolBufferSizeMB="20"
			timeToIdleSeconds="300"
			timeToLiveSeconds="600"
			memoryStoreEvictionPolicy="LFU"
			transactionalMode="off">
		<persistence strategy="localTempSwap" />
	</cache>
</ehcache>
~~~

여기서 중요하게 볼 것은 **<cache name="findMemberCache"** 이다.
findMemberCache는 캐시의 이름으로, 내가 캐시하고 싶은 메소드에서 이 이름의 캐시를 별도의 annotation을 통해 지정하게 되면 이 캐시를 사용하게 된다.

그러면 다음과 같이 Spring Boot가 실행될 때, CacheManager가 바뀌는 것을 확인할 수 있다.
![00.png](/static/assets/img/blog/web/2017-03-21-spring_boot_features_05/00.png)


<br>
#### Controller

Controller에
* **/member/cache/{name}**
* **/member/nocache/{name}**
* **/member/refresh/{name}**

path 를 통해 각 URL에서 특정 이름에 대해 caching 및 evict에 대한 실험을 진행한다.

다음과 같이 Controller에 각 url에 대해 mapping하는 메소드를 추가한다.
~~~java
package com.nhnent.hellospringboot.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.nhnent.hellospringboot.dao.UserRepository;
import com.nhnent.hellospringboot.entity.User;하

@Controller
@EnableCaching
public class HelloController {

    private static Logger logger = LoggerFactory.getLogger(HelloController.class);

    @Autowired
    UserRepository userRepository;

    @GetMapping("/member/nocache/{name}")
    @ResponseBody
    public User getNoCacheMember(@PathVariable String name) {

        long start = System.currentTimeMillis();

        User user = userRepository.findByNameNoCache(name);

        long end = System.currentTimeMillis();

        logger.info(name + " NoCache time: " + Long.toString(end - start));

        return user;
    }


    @GetMapping("/member/cache/{name}")
    @ResponseBody
    public User getCacheMember(@PathVariable String name) {

        long start = System.currentTimeMillis();

        User user = userRepository.findByNameCache(name);

        long end = System.currentTimeMillis();

        logger.info(name + " Cache time: " + Long.toString(end - start));

        return user;
    }

    @GetMapping("/member/refresh/{name}")
    @ResponseBody
    public String refresh(@PathVariable String name) {

        userRepository.refresh(name);
        return "cache clear";
    }
}
~~~

**/member/nocache/{name}** 에 대해서는 캐싱을 진행하지 않고, **/member/cache/{name}** 에 대해서는 캐싱을 하며, **/member/refresh/{name}** 에 대해서는 캐싱된 이름을 evict 할 것이다.

* 앞서 언급하였듯, **@EnableCaching** annotation은 캐시 관련 annotation (@Cacheable, @CacheEvict)를 사용하겠다는 것을 나타낸다.

<br>
#### User class 추가
위의 controller에서 사용하는 user class는 다음과 같다.
~~~java
public class User implements Serializable {

    private long idx;
    private String email;
    private String name;

    ...
~~~

DB를 사용하지 않을 것이므로 어떠한 annotation도 사용하지 않았다.

<br>
#### User repository 추가

위의 User class의 오브젝트를 다루기 위한 repository 클래스를 추가한다.
~~~java
public interface UserRepository {

    User findByNameNoCache(String name);
    User findByNameCache(String name);
    void refresh(String name);
}

@Repository
public class UserRepositoryImpl implements UserRepository {

    private static Logger logger = LoggerFactory.getLogger(UserRepositoryImpl.class);

    @Override
    public User findByNameNoCache(String name) {
        slowQuery(2000);
        return new User(0, name + "@gmail.com", name);
    }

    @Override
    @Cacheable(value="findMemberCache", key="#name")
    public User findByNameCache(String name) {
        slowQuery(2000);
        return new User(0, name + "@gmail.com", name);
    }

    @Override
    @CacheEvict(value="findMemberCache", key="#name")
    public void refresh(String name) {
        logger.info(name + " cache clear.");
    }

    private void slowQuery(long seconds) {
        try {
            Thread.sleep(seconds);
        }
        catch (InterruptedException e) {
            throw new IllegalStateException(e);
        }
    }
}
~~~

캐싱을 위한 핵심 코드이다.
**@Cacheable(value="findMemberCache", key="#name")** 은 아까 **ehcache.xml** 파일에서 지정한 findMemberCache 캐시를 사용하겠다는 의미이며, key는 메소드 파라미터인 name을 사용하겠다는 것이다. 즉 name에 따라 별도로 캐시한다는 의미이다.

**@CacheEvict(value="findMemberCache", key="#name")** 은 해당 캐시 내용을 지우겠다는 의미이다.
캐시 데이터가 갱신되어야 한다면 @CacheEvict가 선언된 메소드를 실행시키면서 캐시 데이터는 삭제하고 새로운 데이터를 받게 할 수 있다.

캐시와 비캐시 메소드의 성능 비교를 확인하기 위해 **slowQuery** 라는 메소드를 추가하였다. slowQuery는 스레드를 2초동안 sleep 시키기 때문에 **findByNameNoCache** 메소드와 **findMemberCache** (Cache에 데이터가 없을 경우) 메소드는 최소 2초이상의 시간이 수행된다.


<br>
#### 실험

위의 설명대로 URL을 주어 캐시 사용 메소드 및 비캐시 메소드 간의 성능을 측정한다.
![01.png](/static/assets/img/blog/web/2017-03-21-spring_boot_features_05/01.png)

<br>
캐시 및 비캐시 URL에 대해 4번씩 요청 결과 다음의 결과를 확인할 수 있다.
![02.png](/static/assets/img/blog/web/2017-03-21-spring_boot_features_05/02.png)
<br>
또 다음과 같이 name 별로 캐싱을 진행하는 것을 확인할 수 있다.
![03.png](/static/assets/img/blog/web/2017-03-21-spring_boot_features_05/03.png)
