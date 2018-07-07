---
layout: post
title:  "Spring Boot Reference Guide Review 09 : Testing "
date:   2017-03-22
desc: "Spring Boot Reference Guide Review 09 : Testing"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

> Spring Boot Reference Guide Part4, Chapter 41 Testing

# Testing

Spring Boot는 애플리케이션 테스트를 위해 다양한 유틸리티나 annotation들을 지원한다.
이런 테스트 환경을 지원하는 것은 spring-boot-test 및 spring-boot-test-autoconfigure 모듈이다.

거의 모든 Spring Boot 개발자들은 다음과 같은 의존성을 추가하여 테스트에 사용하고 있다. 다음 의존성을 추가하는 것만으로도 Junit, AssertJ, Hamcrest, Mockito와 같은 다양한 라이브러리를 지원하기 때문이다.

~~~xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
~~~

만약 위의 의존성을 추가한다면 다음과 같은 테스트를 위한 라이브러리들을 사용할 수 있다.

* Junit: The de-facto standard for unit testing Java applications.
* Spring Test & Spring Boot Test: Utilities and Integration test support for Spring Boot applications.
* AssertJ: A fluent assertion library.
* Hamcrest: A library of matcher objects (also known as constraints or predicates.)
* Mockito: A Java mocking framework.
* JSONAssert: An assertion library for JSON.
* JsonPath: XPath for JSON.

> Spring Boot는 Mockito 1.* 버전을 사용한다. 물론 2.x 버전도 설정에 따라 사용 가능하다.

위의 라이브러리말고도 사용할만한 테스트용 라이브러리에 대한 의존성을 추가해서 사용가능하다.

<br>
## Testing Spring applications

Spring Boot에서는 다음과 같은 @annotation 만으로도 테스트를 쉽게 시작할 수 있다. (Spring Boot 1.4 이상)

보통 테스트 클래스를 작성할 때 이렇게 작성했을 것이다. (Spring Boot 1.3)

다음과 같이 @ContextConfugration annotation과 SpringApplicationContextLoader 조합으로 사용했을 수도 있고,
~~~java
@RunWith(SpringJunit4ClassRunner.class)
@ContextConfugration(classes=MyApp.class, loader=SpringApplicationContextLoader.class)
public class MyTest {
  ...
}
~~~

아래와 같이 @SpringApplicationConfiguration annotation을 사용했을 수도 있고,
~~~java
@RunWith(SpringJunit4ClassRunner.class)
@SpringApplicationConfiguration(MyApp.class)
public class MyTest {
  ...
}
~~~

아니면 @IntegrationTest annotation을 조합했을 수도 있다.
~~~java
@RunWith(SpringJunit4ClassRunner.class)
@SpringApplicationConfiguration(MyApp.class)
@IntegrationTest
public class MyTest {
  ...
}
~~~

**Spring Boot 1.4** 에서는 좀 더 단순해져서, @SpringBootTest annotation 단 하나만 사용하여 일반적인 테스트를 수행할 수 있다.
~~~java
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment=WebEnvironment.RANDOM_PORT)
public class SpringBootTestApplicationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @MockBean
    public UserService userService;

    @Test
    public void simpleTest() {
      ...
    }
}
~~~

@SpringBootTest annotation을 붙여주는 것만으로 테스트 클래스를 만들 수 있는 것이다.
이 annotation에는 **webEnvironment** 라는 attribute가 있는데, 다음과 같은 파라미터를 통해 테스트의 환경을 바꿀 수 있다.

* MOCK: WebApplicationContext를 로드하고 서블릿 컨테이너 환경을 mocking 한다. 내장된 서블릿 컨테이너는 전혀 시작되지 않는다.
* RANDOM_PORT: EmbeddedWebApplicationContext를 로드하고 내장된 서블릿 컨테이너가 시작되는데 요청을 받아들이는 port를 랜덤하게 바꾸고 시작한다.
* DEFINED_PORT: 역시 EmbeddedWebApplicationContext를 로드하는데, 지정한 포트를 가지고 요청을 받아들인다. (default는 8080)
* NONE: ApplicationContext를 로드하기는 하지만 서블릿 컨테이너 환경을 제공하지 않는다.

> @RunWith(@SpringRunner.class) 도 빼먹지 말자. 추가하지 않는다면 @SpringBootTest annotation은 무시된다.
이 구문은 JUnit에게 Spring 테스트 지원사항을 사용하겠다고 알려주는 구문이다. **SpringRunner** 는 SpringJunit4ClassRunner의 새로운 이름이다.

> @SpringBootTest annotation은 "Spring 테스트 지원의 부트스트랩입니다. (bootstrap with Spring Boot's support)" 라는 걸 의미한다.

> 테스트 시작시 먼저 @Configuration이 붙은 클래스들을 로드하려고 시도할 것이고, 실패한다면 @SpringBootApplication이 붙은 클래스를 찾을 것이다.


<br>
## Detecting test configuration

Spring Framework로 개발하다보면 **@ContextConfugration** annotation을 써서 ApplicationContext를 로드했을 것이다. 아니면  **@Configuration** annotation을 써서 configuration을 설정하도록 했을 것이다.

> **@ContextConfugration**: 
@ContextConfugration(locations={"/app-config.xml", "/test-config.xml"}) 와 같이 XML 파일로부터 ApplicationContext를 로드 <br>
@ContextConfugration(classes={AppConfig.class, TestConfig.class}) 와 같이 **@Configuration** 클래스로부터 ApplicationContext 로드

* **@TestConfiguration**:
이 annotation을 **테스트 클래스의 이너 클래스에 사용한다면** @SpringBootApplication 이나 @SpringBootConfiguration이 그 클래스를 찾아 반영시킨다. 만약 테스트 진행시에만 ApplicationContext를 커스터마이징하고 싶다면, **@TestConfiguration** annotation을 사용할 수 있다.
<br>

* **@TestComponent, @TestConfiguration**: 
@SpringBootApplication이나 @ComponentScan annotation을 써서 개발을 진행할 때 테스트 시에만 사용할려고 정의해둔 여러 컴포넌트나 configuration 들도 실제 환경에서 추가될 수가 있다. 이 것을 피하기 위해 Spring Boot에서는 **@TestComponent** 와 **@TestConfiguration** annotation을 제공한다. 이 것은 **src/test/java** 에 있는 클래스에 붙여 테스트가 아닌 환경에서는 Spring Boot의 auto configuration 진행시 추가되는 것을 피할 수 있다.

> @TestConfiguration 클래스는 테스트 클래스의 이너 클래스에 정의하도록 되어 있다. 만약 이너 클래스가 아닌 별도의 클래스에 정의하면, 테스트 클래스에서 사용하기 위해서는 **@Import** annotation을 통해 별도로 추가시켜야 한다. 테스트 진행시 @SpringBootApplication에 의해 스캔되는 대상이 아니다.

> @TestComponent도 마찬가지로 실제 실행 환경에서, 테스트 용도로 사용할 빈을 자동으로 추가되는 것을 피하기 위해 @Component 대신에 쓰라고 만든 annotation으로, @SpringBootApllication에 의해 자동 스캔되는 대상이 아니다. 단, @CompoentScan을 사용시 exclude filter를 따로 추가해야 자동 스캔되는 것을 막을 수 있다.

[@TestConfiguration](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/test/context/TestConfiguration.html)
[@TestComponent](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/test/context/TestComponent.html)
[Excluding Test Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html#boot-features-testing-spring-boot-applications-excluding-config)
[Top Level @TestConfiguration classes should be picked up by SpringBootTest](https://github.com/spring-projects/spring-boot/issues/6769)
[@TestComponent are not picked up during tests](https://github.com/spring-projects/spring-boot/issues/8421)


<br>
## Mocking and spying beans

때때로 테스트 진행할 때 사용하는 빈들 중 특정 빈들을 목아웃 (mock out) 하는 것이 도움이 된다는 것을 알 수 있다. 서비스 시뮬레이션을 포함하는 mocking의 일반적인 케이스는 테스트가 진행 중일 때는 사용할 수 없는 것이나 라이브 시스템에서 발생시키기 어려울 때이다.

Spring Boot 1.4 이후부터 이미 존재하는 빈을 대체하거나 새로 생성하는 mockito를 다음과 같이 손쉽게 만들 수 있다.

~~~java
@Runwith(SpringRunner.class)
@SpringBootTest(webEnvironment = webEnvironment.RANDOM_PORT)
public class SampleTestApplicationWebIntegrationTests {

  @Autowired
  private TestRestTemplate restTemplate;

  @MockBean
  private VehicleDetailsService vehicleDetailsService;

  @Before
  public void setUp() {
    given(this.vehicleDetailsService.
      getVehicleDetails("123")
    ).willReturn(
        new VehicleDetails("Honda", "Civic"));
  }

  @Test
  public void test() {
    this.restTemplate.getForEntity("/{username}/vehicle", String.class, "sframework");
  }
}
~~~

위와 같이 **@MockBean** annotation을 통해 VehicleDetailsService의 모형(mock)으로 mockito bean을 생성할 수 있으며, setup 메소드에 그 빈을 통해 getVehicleDetails 메소드가 호출될 때 어떻게 동작할 것인지를 기술할 수 있다.

> ApplicationContext내에 mock을 새로 생성하거나 같은 타입의, 한 개의 bean을 mock으로 대체한다. 또한 한 테스트 메소드가 끝날 때마다 mock은 새로 초기화된다.

<br>
## Auto-configured Test

Spring Boot의 자동 설정은 애플리케이션의 대부분의 경우에 잘 동작하지만, test 진행할 때는 기능이 조금 부족한 면이 있다.
예를 들어 Spring MVC controller들을 테스트할 때 오직 URL이 잘 매핑되었는지만 테스트 진행하고 싶을 때 (DB까지 갈 필요없이), 혹은 JPA 엔티티 클래스들을 테스트할 때 Controller 나 RestController 등 HTTP 요청을 받는 클래스는 제외하고 싶을 때가 있다.

이를 위해 Spring Boot는 spring-boot-test-autoconfigure 모듈을 통해 테스트의 성격에 따라 configuration 정보들 중 일부분만 로드하고 자동 설정하여 테스트를 진행할 수 있다. **@...Test** annotation들을 통해 ApplicationContext를 테스트 성격에 따라 로드하고 **@AutoConfigure...** annotation을 통해 자동 설정을 커스터마이징할 수 있다.

> @...Test annotation에 대해서 excludeAutoConfiguration 애트리뷰트를 통해 특정 configuration 클래스를 제외시킬 수 있다.

<br>
### Auto-configured JSON tests

JSON 오브젝트가 제대로 직렬화를하는데 테스트를 진행하기 위해 **@JsonTest** annotation을 통해 테스트할 수 있다.
이 annotation은 **Jackson** ObjectMapper 및 **@JsonComponent** 클래스, Jackson 모듈을 자동 설정한다.

다음은 @JsonTest를 통해 구현된 테스트 클래스이다.
~~~java
import org.junit.*;
import org.junit.runner.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.autoconfigure.json.*;
import org.springframework.boot.test.context.*;
import org.springframework.boot.test.json.*;
import org.springframework.test.context.junit4.*;

import static org.assertj.core.api.Assertions.*;

@RunWith(SpringRunner.class)
@JsonTest
public class MyJsonTests {

    @Autowired
    private JacksonTester<VehicleDetails> json;

    @Test
    public void testSerialize() throws Exception {
        VehicleDetails details = new VehicleDetails("Honda", "Civic");
        // Assert against a `.json` file in the same package as the test
        assertThat(this.json.write(details)).isEqualToJson("expected.json");
        // Or use JSON path based assertions
        assertThat(this.json.write(details)).hasJsonPathStringValue("@.make");
        assertThat(this.json.write(details)).extractingJsonPathStringValue("@.make")
                .isEqualTo("Honda");
    }

    @Test
    public void testDeserialize() throws Exception {
        String content = "{\"make\":\"Ford\",\"model\":\"Focus\"}";
        assertThat(this.json.parse(content))
                .isEqualTo(new VehicleDetails("Ford", "Focus"));
        assertThat(this.json.parseObject(content).getMake()).isEqualTo("Ford");
    }

}
~~~

<br>
### Auto-configured Spring MVC tests

Spring MVC Controller를 테스트 하기 위해 **@WebMvcTest** annotation을 사용한다. 이 annotation을 통해 Spring MVC 를 자동 설정하고, @Conroller 및 @ControllerAdvice, @JsonComponent, Filter, WebMvcConfigurer 그리고 HandlerMethodArgumentResolve 만 스캔하여 주입한다.
  > @Component 빈은 전혀 스캔되지 않는다.

이 테스트를 진행할 때 **@MockBean** annotation 사용할 수 있을 뿐만 아니라 **MockMvc** 를 자동 설정하여 HTTP server를 시작할 필요없이 MVC Controller들을 테스트할 수 있다.

> **@MockBean** annotation은 Spring ApplicationContext에 mock을 주입해주는 기능을 한다. Mock은 클래스 타입이나 빈 이름을 가지고 등록되며, 만약 같은 타입의, 하나의 빈이 이미 ApplicationContext에 등록되어 있었으면 그 것을 mock으로 대체시킨다.

다음은 그 예제 소스이다.
~~~java
import org.junit.*;
import org.junit.runner.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.boot.test.mock.mockito.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringRunner.class)
@WebMvcTest(UserVehicleController.class)
public class MyControllerTests {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private UserVehicleService userVehicleService;

    @Test
    public void testExample() throws Exception {
        given(this.userVehicleService.getVehicleDetails("sboot"))
                .willReturn(new VehicleDetails("Honda", "Civic"));
        this.mvc.perform(get("/sboot/vehicle").accept(MediaType.TEXT_PLAIN))
                .andExpect(status().isOk()).andExpect(content().string("Honda Civic"));
    }

}
~~~

<br>
### Auto-configured Data JPA tests

**@DataJpaTest** 를 통해 entity 및 repository 클래스들을 실제 DB를 사용하지 않고 테스트를 진행할 수 있다.이 annotation을 사용할 때 in-memory의 내장된 DB를 사용하며 @Entity 가 붙은 클래스를 스캔하고, JPA repository 클래스들을 자동 설정한다.
> @Component 빈은 전혀 스캔되지 않는다.

또한 이 테스트를 진행할 때는 각 테스트에서 수행하는 쿼리문이 하나의 Transaction으로 처리되며, 테스트가 끝나면 자동 롤백된다.

다음은 이 테스트를 진행하는 클래스의 예이다.
~~~java
import org.junit.*;
import org.junit.runner.*;
import org.springframework.boot.test.autoconfigure.orm.jpa.*;

import static org.assertj.core.api.Assertions.*;

@RunWith(SpringRunner.class)
@DataJpaTest
public class ExampleRepositoryTests {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository repository;

    @Test
    public void testExample() throws Exception {
        this.entityManager.persist(new User("sboot", "1234"));
        User user = this.repository.findByUsername("sboot");
        assertThat(user.getUsername()).isEqualTo("sboot");
        assertThat(user.getVin()).isEqualTo("1234");
    }

}
~~~

만약에 테스트 진행시 실제 DB를 가지고 테스트를 진행하고 싶다면 **@AutoConfigureTestDatabase** annotation을 다음과 같이 사용한다.
~~~java
@RunWith(SpringRunner.class)
@DataJpaTest
@AutoConfigureTestDatabase(replace=Replace.NONE)
public class ExampleRepositoryTests {

    // ...

}
~~~

<br>
### Auto-configured JDBC tests

**@JdbcTest** annotation을 통해 테스트를 진행하는데 @DataJpaTest annotation을 통한 JPA 테스트 진행과 거의 비슷하다.
이 테스트 또한 in-memory 내장된 DB를 사용하며, JdbcTemplate 를 자동 설정한다. 또한 테스트 중 쿼리는 Transaction으로 처리되고 자동 롤백도 지원한다.

~~~java
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@RunWith(SpringRunner.class)
@JdbcTest
public class ExampleNonTransactionalTests {

}
~~~
