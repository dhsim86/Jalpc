---
layout: post
title:  "Toby's Spring Chap 07: 스프링 핵심 기술의 응용 part.3"
date:   2017-10-28
desc: "Toby's Spring Chap 07: 스프링 핵심 기술의 응용 part.3"
keywords: "spring, spring boot"
categories: [Web]
tags: [spring, spring boot]
icon: icon-html
---

## 스프링 3.1의 DI

스프링이 처음 등장한 이후, 많은 변화가 있었지만 객체지향 언어인 자바의 특징과 장점을 극대화하는 스타일과 지원하는 도구로서 꾸준히 정체성을 유지하고 있다. 많은 변화 속에서 스프링이 호환성을 지키고 안정된 기술을 유지할 수 있었던 것은 객체지향적인 코드의 장점인 **유연성과 확장성을 스프링 스스로 충실하게 지켜왔기 때문이다.**

스프링이 제공하는 모든 기술의 기초가 되는 **DI의 원리** 는 변하지 않았으나, DI가 적용된 코드를 작성할 때 사용하는 도구인 자바 언어는 많은 변화가 있었다. 이런 변화가 스프링의 사용 방식에도 여러 가지 영향을 주었다.

<br>
### 애노테이션의 메타정보 활용

자바 코드의 메타정보를 활용한 프로그래밍 방식이다. 자바는 소스코드가 컴파일된 후 클래스 파일에 저장되었다가 JVM에 의해 로딩되어 실행된다. 그런데 자바 코드가 실행되는 것이 목적이 아니라, **다른 자바 코드에 의해 데이터처럼 사용되기도 한다.**

자바 코드의 일부를 **리플렉션** API를 통해 어떻게 만들어졌는지 확인하고 그에 따라 동작하는 기능이 점점 많이 사용되고 있다.

> 원래 리플렉션 API는 자바 코드나 컴포넌트를 작성하는 데 사용하는 툴을 개발할 때 이용하도록 만들어졌는데, 자바 코드의 메타정보를 데이터로 활용하는 스타일의 프로그래밍 방식에 더 많이 활용되고 있다.

이런 스타일의 프로그래밍에서 가장 많이 사용되는 것은 annotation 이다. 원래는 자바 코드를 실행하는데 직접 참여하지 않고 리플렉션 API를 통해 annotation의 메타정보를 조회하고 설정된 값을 가져와 참고하는 것이 전부인데, 이를 이용하는 프레임워크나 표준기술이 많이 늘고 있다.

Annotation 은 애플리케이션을 핵심로직을 담은 **자바코드** 와 이를 지원하는 IoC 방식의 **프레임워크**, 그리고 프레임워크가 참조하는 **메타정보** 라는 세 가지로 구성하는 방식에 어울린다. 이 annotation을 프레임워크가 사용하는 메타정보로 사용할 때 유리한 점이 많다.

DI를 위해 애플리케이션을 구성하는 많은 오브젝트들 간의 관계를 자바 코드를 통해 설정하면 코드 양이 많을 뿐만 아니라, 불편하다. 따라서 스프링은 초창기에는 **XML** 을 활용하여 오브젝트 관계 설정용 DI 메타정보로 활용해왔다.

그런데 annotation이 나오게 되면서 코드의 동작에는 영향을 주지 않지만, 메타정보로 활용하는 데는 XML에 비해 유리하다.

~~~java
@Special
public class MyClass{

}
~~~

위와 같이 **@Special** 이라는 annotation 하나를 클래스 선언 위에 정의하였다. 그런데 이렇게 하는 것만으로도 많은 정보를 얻을 수 있다. 가장 먼저 이 annotation이 **타입 레벨**, 즉 클래스에 부여되었다는 사실을 알 수 있다. 또한 이 annotation이 위치한 MyClass 클래스의 메타정보를 얻을 수 있다. 클래스의 패키지나 이름, 접근 제한자, 상속한 클래스나 구현 인터페이스 등을 알 수 있다. **Annotation을 단순히 자바 코드 한줄로 넣는 것만으로 다양한 부가정보를 얻을 수 있는 것이다.**

그런데 위의 annotation을 이용한 방법을 XML로 대체하려면 다음과 같이 작성해야 되는데, annotation 을 사용하는 방식에 비해 확실히 작성해야할 정보가 많다.

~~~xml
<x:special target="type" class="package.MyClass" />
~~~

반면에, XML를 사용하는 방식에 비해 annotation 사용하는 방식은 내용이 변경될 때 다시 빌드하는 과정을 거쳐야 한다.

자바 개발의 흐름은 XML과 같은 텍스트 형태의 메타 정보 활용 방식을 자바 코드에 내장된 annotation을 활용하는 방식으로 대체하는 쪽으로 가고 있다. 스프링은 2.5부터 DI와 웹 기능 일부에 annotation을 적용하기 시작했고, 3.0에서 다양한 영역으로 활용범위를 넓혔다. 그리고 3.1부터 annotation을 활용한 메타정보 작성 방식이 거의 모든 영역으로 확대되어, XML 없이도 스프링 애플리케이션을 작성할 수 있게 되었다.

<br>
### 정책과 관례를 이용한 프로그래밍

Annotation 이나 XML을 메타정보로 활용하는 프로그래밍 방식은, 코드를 이용해 명시적으로 어떻게 동작할지를 기술하는 것이 없이 **미리 약속한 규칙이나 관례를 따라서 프로그래밍이 동작하도록 만드는 프로그래밍 스타일로 가게 된다.**

예를 들어 XML에서 \<bean\> 태그를 작성하면 그에 따라 하나의 오브젝트가 만들어진다. 미리 약속된 관례에 따라 new 키워드를 통한 인스턴스 생성 코드가 동작하는 것이다.

이러한 스타일의 프로그래밍 방식은 자바 코드로 직접 모든 내용을 표현했을 때보다 **작성해야할 코드의 양이 줄어든다는 장점이 있다.** 반면에 **미리 정의돤 관례나 규칙을 알아야하고, 메타정보를 보고 프로그램이 어떻게 동작할지 이해해야 하는 부담이 되기도 한다.**

스프링은 annotation 으로 메타정보를 작성하고, 미리 정해진 정책과 관례를 통해 간결한 코드에 많은 내용을 담을 수 있는 방식을 적극 도입하고 있다.

<br>
## 자바 코드를 이용한 빈 설정

<br>
### @Configuration 사용

다음과 같이 **@ContextConfiguration** annotation 은 스프링이 DI 정보를 어디서 가져와야 하는지 지정할 때 쓰인다. **locations** 엘리먼트는 DI 설정정보를 담은 XML 파일의 위치를 가리킨다.

~~~java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "/applicationContext.xml")
public class UserDaoTest {
  ...
}
~~~

다음과 같이 **@Configuration** 클래스를 통해, XML 대신에 클래스를 통해 DI 정보로 사용할 수도 있다. DI 설정정보를 담은 클래스는 평범한 자바 클래스에 이 annotation을 다는 것으로 만들 수 있다.

~~~java
@Configuration
@ImportResource(locations = "/applicationContext.xml")  // XML의 설정정보를 가져올 수 있다.
public class ApplicationContext {
  ...
}

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = ApplicationContext.class)
public class UserDaoTest {
  ...
}
~~~

[Use @Configuration class instead of applicationContext.xml](https://github.com/dhsim86/tobys_spring_study/commit/e9b563672604f451935bd41d41d1fe20939285a2)

> 위와 같이 @Configuration 클래스를 사용하게 되면 더 이상 \<context:annotation-config /\> 태그를 XML에 사용할 필요가 없다. 컨테이너가 알아서 @PostConstruct annotation을 처리하는 빈 후처리기를 등록해준다.

> @Configuration 클래스에서 정의한 빈과 XML 에서 정의한 빈은 얼마든지 서로 참조가 가능하다.

<br>
### \<bean\>의 전환

\<bean\> 으로 정의된 DI 정보는 **@Bean** annotation과 정확하게 1:1 매핑된다. 즉 @Configuration 이 정의된 DI 설정 정보용 클래스에서 빈 오브젝트를 생성할 때 이 annotation을 사용할 수 있다.

보통 다음과 같이 **@Bean** 이 붙은 public 메소드를 통해 빈 오브젝트를 생성한다.

~~~java
@Bean
public DataSource dataSource() {
  ...
}
~~~

위에서 **메소드 이름은 빈의 아이디로 지정된다.** 이 메소드 안에서 실제 빈 오브젝트를 생성하는 코드와 프로퍼티 설정을 담으면 된다.

> @Bean annotation을 활용하여 빈 오브젝트를 생성할 때, 클래스는 반드시 public 접근 제한자를 가져야 한다. XML로 설정할 때는 내부적으로 리플렉션 API를 사용하므로 굳이 public 일 필요는 없지만, 자바 코드에서 참조할 때는 public 이어야 한다.

다음과 같이 parent 속성을 통해 프로퍼티 정의를 상속받는 것은, 클래스를 통한 DI 설정에서는 활용할 수 없다. 모든 프로퍼티 값을 일일이 넣어주어야 한다.

~~~xml
<bean id="testUserService" class="ch01.springbook.user.UserServiceTest$TestUserService" parent="userService" />
~~~

[Replace XML application context using @Configuration class.](https://github.com/dhsim86/tobys_spring_study/commit/99a6acad9f8795d322de7c16bfffcea5da209eff)

<br>
### @Autowired를 이용한 자동와이어링

**@Autowired** annotation을 사용하여 스프링 컨테이너가 조건에 맞는 (이름이나 타입을 기준으로) 빈 오브젝트를 찾아 자동으로 setter나 필드에 주입해주므로 DI 설정을 위한 자바 코드나 XML 설정을 대폭 줄일 수 있다.

다음과 같이 setter에 annotation을 붙여주면, 먼저 컨테이너가 **파라미터 타입을 보고** 주입 가능한 빈을 찾아 주입해준다. 만약 주입 가능한 타입의 빈 오브젝트가 2개 이상이라면, 프로퍼티와 **동일한 이름의 빈을 찾아 주입한다.** 만약 찾지 못한다면 에러를 일으킨다.

~~~java
@Autowired
public void setDataSource(DataSource dataSource) {
  this.jdbcTemplate = new JdbcTemplate(dataSource);
}
~~~

> 스프링은 리플렉션 API를 통해 값을 넣어주므로, private 필드라도 주입해줄 수 있다. 그리고 단순히 필드에 값을 그래도 넣어주기만 한다면 필드에 annotation을 다는 것만으로 충분하나, 만약 위의 예처럼 주입받은 오브젝트로 별도의 처리가 필요할 경우에는 setter 에 annotation을 달고 처리 로직을 구현하는 것이 좋다.

> @Autowired 는 먼저 타입을 기준으로 적용할 빈 오브젝트를 찾아보고, 만약 주입할 수 있는 오브젝트가 2개 이상 발견되면 다시 이름을 기준으로 최종적으로 주입할 오브젝트를 선택한다.

[Use @Autowired annotation.](https://github.com/dhsim86/tobys_spring_study/commit/4b7de1ac7f2bfe53a4edd1a959164e4f99b2e23b)

<br>
### @Component 를 이용한 자동 빈 등록

**@Component** annotation 은 타입에 부여된다. **이 annotation이 붙은 클래스는 빈 스캐너를 통해 자동으로 빈으로 등록된다.** 정확히는 **@Component** 및 이 것을 메타 annotation으로 갖고 있는 annotation이 달린 (예를 들면 @Service, @Controller) 클래스가 자동 빈 등록 대상이 된다.

이 annotation을 사용하기 위해서는 **빈 스캔기능** 을 사용하겠다는 **@ComponentScan** annotation 정의가 별도로 필요하다.

~~~java
@Configuration
@EnableTransactionManagement
@ComponentScan(basePackages = "ch01")
public class TestApplicationContext {
  ...
}
~~~

위의 basePackages 엘리먼트는 클래스를 스캔할 기준 패키지를 지정할 때 사용한다. 여러 기준 패키지를 사용할 수도 있다. 빈 스캔 중에 @Component 붙은 클래스가 발견되면 새로운 빈 오브젝트로 등록한다. **빈의 아이디를 따로 지정하지 않으면 클래스 이름의 첫 글자를 소문자로 바꾸어서 사용한다.** 만약 이름을 지정하고 싶다면 다음과 같이 사용하면 된다.

~~~java
@Component("userDao")
public class UserDaoJdbc implements UserDao {
  ...
}
~~~

스프링은 @Component 가 아닌 이 annotation을 메타로 갖고 있는 annotation에 대해서도 자동으로 빈 등록 해준다. **보통 여러 개의 annotation에 공통적인 속성을 부여하려면 메타 annotation을 사용한다.** 스프링이 DAO 빈에 대해서 사용하도록 권장하는 **@Repository** annotation은 다음과 같이 @Component 를 메타 annotation으로 사용하고 있다.

~~~java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface Repository {
  ...
}
~~~

[Use @Component / @ComponentScan](https://github.com/dhsim86/tobys_spring_study/commit/e419f849be267ec4e2a0a7365a171bb56b1396d9)

<br>
### 컨텍스트 분리

보통 DI 설정 정보는 테스트용과 실제 서비스에서 사용되는 운영용으로 나누어야 한다. 테스트할 때는 의존 오브젝트로 mock 을 사용하고, 운영시에는 실제 사용할 의존 오브젝트를 사용해야 하기 때문이다. 따라서 **환경에 따라 성격이 다른 DI 정보를 분리할 필요가 있다.**

실제 운영할 때 필요한 빈 오브젝트를 구성한 Configuration 클래스와 테스트용 오브젝트를 구성하는 Configuration 클래스, 2개로 나누어 사용하면 된다. 테스트 클래스에는 다음과 같이 사용할 수 있을 것이다.

~~~java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {AppContext.class, TestAppContext.class})
public class UserDaoTest {
  ...
}
~~~

위와 같이 정의하면 TestAppContext.class 를 통해 테스트할 때 필요한 빈 오브젝트를 추가적으로 DI 받을 수 있게 된다.

[Separated configuration class into 'operation' and 'test'.](https://github.com/dhsim86/tobys_spring_study/commit/56c983b2da652f0eb8b0e8235988a1bc74886cee)

또한 **@Import** annotation을 사용하면 같은 환경에서 사용되는 빈 오브젝트들이더라도 서로 성격이 다른 오브젝트들의 구성정보를 분리시킬 수 있다. 서로 성격이 다른 빈 오브젝트를 다른 Configuration 클래스에서 구성하고, **메인 Configuration 클래스에서 다른 Configuration 클래스들을 import 하는 것이다.**

~~~java
@Configuration
@EnableTransactionManagement
@ComponentScan(basePackages = "ch01")
@Import(SqlServiceContext.class)
public class AppContext {
  ...
}
~~~

[Use @Import annotation.](https://github.com/dhsim86/tobys_spring_study/commit/21679a2c36a6878e4e3ab10ac31522c592adb7d5)

<br>
### 프로파일

만약 다음과 같이 운영용과 테스트용 의존 오브젝트들이 서로 다른 @Configuration 클래스에 정의되어 있다고 했을 때, 테스트할 때 충돌을 일으킨다.

~~~java
@Configuration
public class AppContext {
  @Bean
  public MailSender mailSender() {
    return new MailSender();
  }
}

@Configuration
public class TestAppContext {
  @Bean
  public MailSender mailSender() {
    return mock(MailSender.class);
  }
}

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {AppContext.class, TestAppContext.class})
public TestClass {
  ...
}
~~~

위 코드에서 테스트를 실행할 때, AppContext 와 TestAppContext 에 정의되어 있는 빈들이 함께 사용되는데 이 mailSender 라는 이름을 가진 빈이 2개가 된다. 이럴 경우에는 **스프링이 빈 설정 정보를 읽는 순서에 따라, 뒤의 빈 설정이 앞에서 발견된 빈 설정에 우선해서 적용한다.**

위의 코드와 같은 순서라면 문제가 없지만, 만약 순서가 **classes = {TestAppContext.class, AppContext.class}** 이면 테스트할 때 실제 운영시에 사용하는 오브젝트를 사용할 것이다.

스프링에서는 환경에 따라 빈 설정정보가 달라져야 하는 경우에, 별도의 annotation을 통해 간단히 설정할 수 있도록 해준다. **실행환경에 따라 빈 구성이 달라지는 내용을 프로파일로 정의하여 만들고 실행 시점에 어떤 프로파일의 빈 설정을 사용할지 지정하는 것이다.**

보통 다음과 같이 프로파일은 **@Profile** annotation을 사용하여 Configuration 클래스 단위로 지정한다.

~~~java
@Profile("production")
@Configuration
public class AppContext {
  ...
}
~~~

위와 같이 @Profile이 붙은 Configuration 클래스는 @Import 나 @ContextConfiguration 에 의해 지정되어도 현재 컨테이너의 활성 프로파일 목록에 자신의 프로파일 이름이 있지 않으면 무시된다.

> 활성 프로파일이란 스프링 컨테이너를 실행할 때 추가로 지정해주는 속성이다. 만약 프로파일을 지정하지 않으면 스프링은 디폴트 빈 설정정보로 취급하여 항상 적용시킨다.

테스트 진행할 때 활성 프로파일로 "test" 프로파일을 지정하려면 **@ActiveProfiles** annotation을 사용하면 된다. 그러면 "test" 프로파일로 지정된 Configuration 클래스가 사용될 것이다.

~~~java
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles("test")
@ContextConfiguration(classes = {AppContext.class, TestAppContext.class})
public class classTest {
  ...
}
~~~
