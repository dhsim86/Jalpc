---
layout: post
title:  "Toby's Spring Chap 10: IOC 컨테이너와 DI part.2"
date:   2018-11-04
desc: "Toby's Spring Chap 10: IOC 컨테이너와 DI part.2"
keywords: "spring"
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

