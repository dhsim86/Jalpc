---
layout: post
title:  "Spring annotations 00"
date:   2017-03-28
desc: "Spring annotations 00"
keywords: "spring, spring boot, server programming"
categories: [Web]
tags: [spring, spring boot]
icon: icon-html
---

# Spring Annotations 00

<br>
## @Component

package: org.springframework.stereotype

**\<context:component-scan\>** 태그를 application context xml 파일에 다음과 깉이 추가하면 해당 annotation 이 적용된 모든 클래스를 스프링 빈으로 등록한다.
~~~xml
...
<context:component-scan base-package="kr.co.myproject" />
...
~~~

위와 같이 xml 파일에 해당 태그를 추가하고 적용할 기본 패키지를 base-package 속성으로 등록하면 된다. base-package 하위에 **@Component** 로 선언된 클래스를 모두 빈으로 자동등록할 것이다. bean의 이름은 해당 클래스명 (첫글자는 소문자))이 사용된다.

다음과 같이 **include-filter** 와 **exclude-filer** 를 사용하면 이 **컴포넌트를 스캔하는** 작업에서 특정 타입이나 패턴에 매칭되는 클래스를 빈으로 자동 등록하거나 제외시킬 수 있다.
~~~xml
...
<context:component-scan base-package="kr.co.myproject">
  <context:include-filter type="regex" expression="*IBastisRepository"/>
  <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Controller" />
</context:component-scan>
...
~~~

위와 같이 작성하면 **IBastisRepository** 이름으로 끝나는 클래스들은 자동으로 빈으로 등록하고, **@Controller** annotation이 선언된 클래스는 빈으로 자동 등록하지 않을 것이다.

**\<context:include-filter\>** 태그와 **\<context:exclude-filter\>** 태그는 각각 **type** 속성과 **expression** 속성을 가지고 있는데, **type** 속성에 따라 **expression** 에 올 수 있는 값이 달라진다.

* annotation: 클래스에 지정된 annotation이 선언되었는지 여부, expression 속성에는 **"org.springframework.stereotype.Controller"** 와 같은 annotation 이름을 입력한다.
* assignable: 클래스가 지정한 타입으로 할당 가능한지의 여부, expression 속성에는 **"org.exampleClass"** 와 같은 타입 이름을 입력한다.
* regex: 클래스 이름이 정규 표현식에 매칭되는지의 여부, expression 속성에는 **"org\.example\.\*Controller"** 와 같은 정규표현식을 쓸 수 있다.
* aspectj: 클래스 이름이 AspectJ 의 표현식에 매칭되는지의 여부. expression 속성에는 **\"org.example..\*Controller+"** 와 같이 AspectJ 표현식을 입력한다.

<br>
## @Controller

package: org.springframework.stereotype

Spring MVC에서 Controller 역할을 하는 클래스 선언을 이 annotation을 통해 단순하게 할 수 있다.
Controller로 사용하기 위한 클래스에 이 annotation을 선언하면 **component-scan** 을 통해 스프링 빈으로 자동 등록된다.
또한 앞서 언급한 **\<context:exclude-filter\>** 태그를 통해 자동 등록되는 것을 막을 수도 있다.

이 annotation은 다음과 같이 정의되어 있다.
~~~java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface Controller {
  ...
~~~

위와 같이 **@Component** annotation이 선언되어 있는 덕분에, **@Controller** annotation이 선언된 클래스도 스프링 빈으로 등록될 수 있는 것이다.

이 **@Controller** annotation으로 선언된 클래스의 메서드에 다음과 같이 특정 타입이나 annotation을 사용해 자동 매핑하거나 특정 정보에 접근할 수 있다.
<br>
| 파라미터 타입 | 설명 |
| ---------- | :--------- |
| HttpServletRequest, HttpServletResponse, HttpSession | Servlet API |
| java.util.Locale | 현재 요청에 대한 Locale 정보 |
| InputStream, Reader | 요청 컨텐츠에 직접 접근 시 사용 |
| OutputStream, Writer | 응답 컨텐츠를 생성할 때 사용 |
| @PathVariable 이 적용된 변수 | URL 템플릿 변수이 접근시 사용 |
| @RequestParam 이 적용된 변수 | HTTP 파라미터와 매핑  |
| @RequestHeader 이 적용된 변수 | HTTP 헤더와 매핑 |
| @RequestBody 이 적용된 변수 | HTTP RequestBody에 접근시 사용. HttpMessageConverter를 이용해 해당 타입으로 변환한다. |
| Map, Model, ModelMap | 뷰에 전달할 모델 데이터를 설정시 사용 |
| 커맨드 객체 | HTTP 요청 파라미터를 저장한 객체 |
| Errors, BindingResult | HTTP 요청 파라미터를 커맨드 객체에 저장한 결과 |
| SessionStatus | 폼 처리를 완료했음을 처리하기 위해 사용 |

<br>
#### Servlet API의 HttpServletRequest, HttpServletResponse, HttpSession
~~~java
@RequestMapping(params = "param=add")
public String addProduct(HttpServletRequest request, HttpServletResponse response, HttpSession session)
  throws Exception {
    ...
}
~~~

<br>
#### java.util.Locale
~~~java
@RequestMapping(params = "param=add")
public String addProduct(Locale locale, Product product, BindingResult result, SessionStatus status)
  throws Exception {
    ...

    String message = messageSource.getMessage(
      "product.error.exist", new String[] {product.getProductNo()}, locale
    );
}
~~~

<br>
#### java.io.InputStream / java.io.Reader
Request의 content를 직접 처리할 경우 (Servlet API가 제공)

~~~java
@RequestParam(params = "param=add")
public String addProduct(InputStream is, Product product, BindingResult result, SessionStatus status)
  throws Exception {
    ...

    for (int totalRead = 0; totalRead < totalBytes; totalRead += readBytes) {
      readBytes = is.read(binArray, totalRead, totalBytes - totalRead);
    }
}
~~~

<br> **@RequestParam** 이 적용된 파라미터
~~~java
@RequestParam("/deleteProduct.do")
public String deleteProduct(@RequestParam("productNo") String productNo)
  throws Exception {

    productService.deleteProduct(productNo);
    return "/listProduct.do";
}
~~~

<br>
#### Servlet API의 HttpServletRequest, HttpServletResponse, HttpSession
~~~java
@RequestParam(params = "param=add")
public String addProduct(HttpServletRequest request, HttpServletResponse response, HttpSession session)
  throws Exception {
    ...
}
~~~
