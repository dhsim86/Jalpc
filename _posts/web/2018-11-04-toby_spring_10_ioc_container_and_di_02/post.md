---
layout: post
title:  "Toby's Spring Chap 10: IOC 컨테이너와 DI part.2"
date:   2018-11-04
desc: "Toby's Spring Chap 10: IOC 컨테이너와 DI part.2"
keywords: "spring, toby spring, ioc, container, di"
categories: [Web]
tags: [spring]
icon: icon-html
---

<br>
## 빈 설정 메타정보 작성

IoC 컨테이너의 가장 기본적인 역할은 **코드를 대신하여 애플리케이션을 구성하는 오브젝트를 생성하고 관리하는 것이다.** 컨테이너는 빈 설정 메타정보를 통해 빈의 클래스와 이름을 제공받아 활용한다.

설정 메타정보는 외부 리소스에 맞는 리더를 통해 읽어 BeanDefinition 타입의 오브젝트로 변환되고 이를 컨테이너가 활용하는 것이다.

BeanDefinition 은 순수한 오브젝트로 표현되는 빈 생성 정보로 메타정보가 작성되는 형식의 종류와 작성 방식에 독립적이다.

<br/>

![00.png](/static/assets/img/blog/web/2018-11-04-toby_spring_10_ioc_container_and_di_02/00.png)

<br/>
### 빈 설정 메타정보

몇 가지 필수 값을 제외하면 컨테이너에 미리 지정된 디폴트 값이 적용된다. BeanDefinition은 여러 개의 빈을 만들기 위해 재사용될 수도 있다. 메타정보는 같으나 이름이 다른 여러 개의 빈 오브젝트를 만들 수도 있기 때문이다. 따라서 BeanDefinition에는 빈의 이름이나 아이디를 나타내는 정보는 포함되지 않는다.

---
**빈 등록 방법**

빈 등록은 빈 메타정보를 작성해서 컨테이너에게 건네주면 된다. 

가장 직접적인 방식으로 BeanDefinition 구현 오브젝트를 직접 생성하는 것이지만, 보통 XML이나 프로퍼티 파일, 자바 configuration을 통한 외부 리소스로 빈 메타정보를 작성하고 리더나 변환기를 통해 애플리케이션 컨텍스트가 사용할 수 있는 정보로 변환해주는 방법을 사용한다.

---
**자동 인식을 이용한 빈 등록**

XML이 아닌 특별한 애노테이션을 통해 자동으로 대상 클래스를 찾아 빈으로 등록하는 방법이 있다.

* 빈 스캐닝: 특정 애노테이션이 붙은 클래스를 찾아 빈으로 등록
* 빈 스캐너: 빈 스캐닝을 담당하는 오브젝트

스프링의 빈 스캐너는 지정한 클래스 패스 이하 모든 패키지의 클래스를 대상으로 **@Component** 애노테이션 또는 이 애노테이션을 메타 애노테이션으로 사용하는 클래스를 선택하여 빈으로 등록한다.

@Component나 이 애노테이션을 메타 애노테이션으로 사용하는 @Controller / @Service / @Repository 등을 **스테레오 타입 애노테이션** 이라고 부른다.

* @Controller: 프리젠테이션 계층의 MVC 컨트롤러에 사용. 웹 요청을 처리하는 컨트롤러 빈으로 등록된다.
* @Service: 서비스 계층의 클래스에 사용
* @Repository: 데이터 엑세스 계층의 DAO 또는 리포지토리 클래스에 사용. DataAccessException 자동 예외 변환과 같은 AOP 적용 대상을 선정하기 위해 사용된다.

다음과 같이 @Component를 메타 애노테이션을 사용해서 자신만의 스테레오 타입의 애노테이션을 만들 수도 있다.

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component  // 빈 스캐너 디폴트 필터의 자동 인식이 대상이 되게 한다.
public @interface cutomStereotypeAnnotation {
  String value() default "";
}
```

@Component를 통해 등록된 빈의 id는 첫 글자만 소문자로 바꾼 클래스 이름으로 등록된다. 물론 다른 이름을 지정할 수도 있다.

```java
@Component("OtherId")
public class Hello {

}
```

빈 스캐닝 방식은 XML처럼 상세한 메타정보 항목을 지정할 수 없고, 클래스 당 한 개 이상의 빈을 등록할 수 없다는 제한이 있다.

XML 파일에서는 다음과 같이 지정하여 자동으로 빈 스캐너를 등록할 수 있다.

```xml
<context:component-scan base-package="" />
```

ContextLoaderListener를 통한 루트 애플리케이션 등록할 때 빈 스캐닝을 사용하려면 **AnnotationConfigApplicationContext** 클래스와 contextConfigLocation 파라미터에 패키지 이름을 지정하면 된다.

```xml
<context-param>
  <param-name>contextClass</param-name>
  <param-value>org.springframework.web.context.support.AnnotationConfigWebApplicationContext</param-value>
</context-param>
<context-param>
  <param-name>contextConfigLocation</param-name>
  <param-value>springbook.learningtest.spring.ioc.bean</param-value>
</context-param>
```

서블릿 컨텍스트라면 \<init-param\> 으로 지정하면 된다.

---

**@Resource**

주입할 빈을 빈의 id로 지정할 때 사용한다. 자바 클래스의 setter 뿐만 아니라 필드에도 붙일 수 있다.

```java
@Resource(name = "printer")
public void setPrinter(Printer printer) {
  this.printer = printer
}
```

@Resource와 같은 애노테이션으로 된 의존관계 정보를 통해 DI가 되게하려면 다음 세 가지 방법 중 하나를 사용해야 한다.

* XML의 \<context:annotaion-config\>
  * 애노테이션 의존 관계 정보를 읽어 메타정보를 추가해주는 기능을 가진 빈 후처리기를 등록하는 전용 태그이다. 이미 등록된 빈의 메타정보에 프로퍼티 항목을 추가해주는 역할이다.
* XML의 \<context:component-scan\>
* AnnotationConfigApplicationContext / AnnotationContigWebApplicationContext

```java
@Resource // name을 생략가능하며, 생략하면 빈의 이름이 프로퍼티나 필드 이름과 같다고 간주한다.
private Printer printer; 
```

> @Resource는 위와 같이 name을 지정하지 않았을 때, 주입할 적절한 빈을 찾지 못하면 타입을 이용해 다시 한번 빈을 찾는다.

---
**@Autowired / @Inject**

두 애노테이션 모두 타입에 의한 자동와이어링 방식을 사용할 때 붙인다.

> @Inject는 JavaEE6 표준 스펙인 JSK-330에서 정의된 것으로 @Autowired와 동일하다. 스프링이 아닌 다른 프레임워크에서 DI를 사용하려면 이 애노테이션을 사용한다.

@Autowired를 사용할 때 같은 타입의 빈이 하나 이상 존재할 경우, 그 빈들을 모두 DI 받게 할 수도 있다.

```java
@Autowired
private Collection<Printer> printerList;

...

@Autowired
private Printer[] printerArray;

...
@Autowired
private Map<String, Printer> printerMap;  // 빈의 이름을 키로 하는 맵으로 DI 받는다.
```
* 이 때문에, DI할 빈의 타입 자체가 Collection 일 경우, @Autowired를 통해 자동 설정이 불가능하다. 이 때는 @Resource를 사용한다.
  * @Autowired 를 Collection에 사용했을 경우, 같은 타입의 빈이 여러 개 존재해서 한번에 모두 DI 받는다고 생각하면 된다.
  
* 컬렉션과 배열을 단지 **같은 타입의 빈이 여러 개 있을 경우 충돌을 피하려는 목적으로 사용해서는 안된다.**
* @Autowired를 통해 빈을 찾지 못할 경우 에러가 발생한다. 못찾아도 상관없을 경우, required 엘리먼트를 false로 지정한다.

---
**@Qualifier**

타입 외의 정보를 추가하여 자동와이어링을 세밀하게 제어할 때 사용한다.
동일한 타입을 가진 여러 개의 빈이 존재할 때, @Autowired를 사용하면 에러가 발생한다. **이를 위해 빈 선정을 도와주기 위한 부가 정보를 부여할 때 사용하는 애노테이션이다.**

```java
@Component
@Qualifier("main")
public class DataSource {

}

@Component
@Qualifier("slave")
public class DataSource {

}

...

@Autowired
@Qualifier("main")
private DataSource dataSource;
```

* @Qualifier를 메타 애노테이션으로 지정하여 자신만의 커스텀 한정자 애노테이션을 만들 수도 있다.

> @Qualifier를 사용시 해당 한정자에 대한 메타정보를 가지는 빈이 없다면, @Qualifier에서 지정한 이름을 가진 빈을 찾는다. 그러나 이 방식은 권장되지 않으며 @Resource로 사용해야 한다.

Setter나 생성자에서 사용할 경우 다음과 같이 각 파라미터마다 애노테이션을 지정해야 한다.

```java
@Autowired
public void setDataSource(@Qualifier("main") DataSource dataSource) {
  ...
}
```