---
layout: post
title:  "Toby's Spring Chap 12: 스프링 웹 기술과 스프링 MVC"
date:   2018-12-15
desc: "Toby's Spring Chap 12: 스프링 웹 기술과 스프링 MVC"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

스프링은 빠르게 기술의 변화가 일어나는 웹 계층과 여타 계층을 깔끔하게 분리해서 개발하는 아키텍처 모델을 지지한다. 따라서 스프링으로 개발하더라도 웹 계층은 어떤 기술로도 대체 가능하다. 물론 스프링에서도 자체 웹 기술과 프레임워크를 제공하고 있다.

<br>
## 스프링의 웹 프레젠테이션 계층 기술

프레젠테이션 계층은 복잡하고 다양한 기술의 조합으로 구성될 수 있다. 스프링 애플리케이션 입장에서는 간단히 두 가지로 구분할 수 있다.

* 스프링 웹 기술을 사용하는 프레젠테이션 계층
* 스프링 외의 웹 기술을 사용하는 프레젠테이션 계층

스프링은 의도적으로 **서블릿 웹 애플리케이션의 컨텍스트를 두 가지로 분리하였다.**
웹 기술에서 독립적인 비즈니스 서비스 계층과 데이터 엑세스 계층을 담은 **루트 애플리케이션 컨텍스트**와 스프링 웹 기술을 기반으로 동작하는 웹 관련 빈을 담은 **서블릿 애플리케이션 컨텍스트**이다.
이렇게 두 가지로 분리한 이유는 스프링 웹 서블릿 컨텍스트를 다른 기술로도 대체할 수 있도록 하기 위해서이다.

<br>
### 스프링 서블릿 / 스프링 MVC

스프링이 직접 제공하는 서블릿 기반의 MVC 프레임워크이다. 프론트 컨트롤러 역할을 하는 **DispatcherServlet**을 핵심 엔진으로 사용한다. 스프링 서블릿의 모든 컴포넌트는 스프링의 서블릿 애플리케이션 컨텍스트의 빈으로 등록되어 동작한다.

<br>
## 스프링 MVC와 DispatcherServlet의 전략

프레임워크 기술은 보통 두 가지 방향으로 발전한다.

<br>
### 범용적 프레임워크

스프링과 같이 **유연성과 확장성**을 중점을 두고 어떤 종류의 시스템 개발이나 환경, 요구조건에도 잘 들어맞도록 재구성할 수 있는 범용적 프레임워크이다. 이런 프레임워크는 각 계층과 기술 사이의 독립성을 중요하게 생각한다.
각 계층과 기술들이 서로의 내부를 잘 알고 강하게 결합되는 것을 극도로 꺼린다. **각 계층은 정해진 인터페이스 외에는 서로 알지 못한다.**

각 계층은 독립적으로 개발 / 테스트할 수 있고, 다른 계층의 코드에 영향을 주지 않은 채로 자유롭게 변경할 수 있어야 한다.

<br>
### 일체형 프레임워크

제한적인 기술만을 사용하도록 강제하지만, 그 기술의 장점을 극대화하도록 설계된다. 계층 간의 느슨한 결합이 없고, 강하게 결합되어 최적화된 코드를 만든다.

<br>
### 스프링의 지향점

스프링은 모든 기능을 다양한 방법으로 확장하도록 설계되어 있다. **스프링을 잘 사용한다는 것은, 유연한 확장성을 최대한 활용하면서 일체형 프레임워크와 같은 스타일을 지향하는 것이다.** 이는 유연하고 확장성이 뛰어난 구조를 활용해서 최적화된 구조를 만들고, 관례에 따라 빠르게 개발 가능한 스프링 기반의 프레임워크를 만들어서 사용해야 한다는 뜻이다.

스프링이 좋은 프레임워크이므로, 그냥 스프링에 제공하는 기술과 API만 사용하는 것만으로는 부족하다.

스프링은 특정 기술이나 방식에 얽매이지 않으면서 웹 프레젠테이션 계층의 각종 기술을 조합, 확장해서 사용할 수 있는 매우 유연한 웹 애플리케이션 개발의 기본 틀을 제공해준다. 이 틀이 제공하는 다양한 전략의 확장포인트를 이용하여 스프링 스스로 기본적인 MVC 프레임워크를 만들어두었다.

개발자는 MVC 프레임워크 위에 필요한 전략을 추가해서 사용할 수 있어야 한다. MVC 프레임워크를 완성된 고정적인 프레임워크로 보지 말고, 진행하려는 프로젝트의 특성에 맞게 빠르고 편리한 개발이 가능하도록 자신만의 웹 프레임워크를 만드는 데 쓰는 도구라고 생각할 필요가 있다.

스프링의 웹 기술의 핵심이자 기반이 되는 것은 **DispatcherServlet**이다. 이 서블릿은 스프링의 웹 기술을 구성하는 다양한 전략을 DI로 구성해서 확장하도록 만들어진 스프링 서블릿 / MVC의 엔진과 같은 역할을 한다.

<br>
### DispatcherServlet과 MVC 아키텍처

스프링의 웹 기술은 MVC 아키텍처를 근간으로 한다. 정보를 담은 모델과 화면 출력 로직을 담은 뷰, 제어 로직을 담은 컨트롤러로 프레젠테이션 계층의 구성 요소를 분리하고 서로 협력해서 하나의 웹 요청을 처리한다.

MVC 아키텍처는 **프론트 컨트롤러** 패턴과 함께 사용된다.
프론트 컨트롤러 패턴은 **중앙 집중형 컨트롤러를 프레젠테이션 계층의 제일 앞단에 두어 서버로 들어오는 모든 요청을 먼저 받아서 처리하도록 한다.**
프론트 컨트롤러는 먼저 공통적인 작업을 수행한 후, 적절한 세부 컨트롤러로 작업을 위임하고 클라이언트에게 보낼 뷰를 선택하여 최종 결과를 생성하는 등의 작업을 수행한다. 예외가 발생하면 이를 일관된 방식으로 처리하는 것도 프론트 컨트롤러의 역할이다.

스프링 서블릿 / MVC의 핵심은 **DispatcherServlet**이라는 프론트 컨트롤러이다. 이 DispatcherServlet은 MVC 아키텍처로 구성된 프레젠테이션 계층을 만들 수 있도록 설계되어 있다.

<br>

![00.png](/static/assets/img/blog/web/2018-12-15-toby_spring_12_web/00.png)

<br>
#### **(1) DispatcherServlet의 HTTP 요청 접수**

  - 자바 서버의 서블릿 컨테이너는 HTTP 프로토콜을 통해 들어오는 요청이 스프링의 DispatcherServlet으로 할당된 것이면 HTTP 요청정보를 Dispatcher 서블릿으로 전달한다. 보통 web.xml은 다음과 같이 정의되어 있다.

```xml
<servlet-mapping>
  <servlet-name>Spring MVC Dispatcher Servlet</servlet-name>
  <url-pattern>/app/*</url-pattern>
</servlet-mapping>
```

  - 위의 설정은 /app으로 시작하는 모든 요청을 스프링의 프론트 컨트롤러인 DispatcherServlet으로 할당하는 것이다. DispatcherServlet은 공통으로 진행해야하는 작업이 있다면 먼저 수행한다.

<br>
#### **(2)DispatcherServlet에서 컨트롤러로 HTTP 요청 위임**
   
 - DispatcherServlet은 URL이나 파라미터 정보, HTTP 메소드를 참고하여 어떤 컨트롤러로 작업을 위임할지 결정한다. 컨트롤러를 설정하는 것은 DispatcherServlet의 **핸들러 매핑 전략**을 이용한다. 사용자 요청 기준으로 어떤 핸들러에게 작업을 위임할지를 결정해주는 것을 핸들러 매핑 전략이라고 한다.
 - DispatcherServlet의 **핸들러 매핑 전략은 DispatcherServlet 수정없이 DI를 통해 언제든지 확장이 가능하다.** 어떤 URL이 들어오면 어떤 컨트롤러가 이를 처리할지를 매핑해주는 전략을 만들어서 제공해주면 된다.
 - 어떤 컨트롤러가 처리할지를 결정했다면, 해당 컨트롤러 오브젝트의 메소드를 호출하여 실제로 웹 요청을 위임한다. 그런데 실제로 실행하려면 컨트롤러 메소드를 어떻게 호출할지를 알아야 한다. **컨트롤러는 특정 인터페이스를 구현한다는 식의 제약없이 어떤 종류의 형태로도 정의할 수 있다.**
 - DispatcherServlet은 각기 다른 메소드와 포맷을 가진 컨트롤러 오브젝트를 사용하기 위해 **어댑터를 사용한다.** 특정 컨트롤러를 호출할 때는 해당 컨트롤러 타입을 지원하는 어댑터를 중간에 끼워넣어 호출하는 것이다. 따라서 DispatcherServlet 입장에서는 항상 일정한 방식으로 컨트롤러를 호출하고 결과를 받을 수 있다.

<br>

![01.png](/static/assets/img/blog/web/2018-12-15-toby_spring_12_web/01.png)

 - DispatcherServlet은 컨트롤러가 어떠한 메소드를 가졌으며 어떤 인터페이스를 구현했는지 전혀 알지 못한다. 다만 컨트롤러에 따른 적절한 어댑터만을 사용할 뿐이다.
 - **각 어댑터는 자신이 담당하는 컨트롤러에 맞게 호출 방법을 이용하여 컨트롤러에 작업 요청을 보내고, 결과를 받아 다시 DispacherServlet으로 돌려준다.** 스프링 서블릿 / MVC 확장 구조의 기본은 이 어댑터를 통한 컨트롤러 호출 방식이다.
 - DispatcherServlet이 어떤 어댑터를 사용할지는 **핸들러 어댑터 전략**을 통해 결정한다.
 - DispatcherServlet은 핸들러 어댑터로 웹 요청을 전달할 때는 모든 웹 요청 정보가 담긴 **HttpServletRequest** 타입의 오브젝트를 전달한다. 어댑터는 이를 받아 컨트롤러의 메소드가 받을 수 있는 파라미터로 변환해서 전달해준다.
 - DispatcherServlet은 **HttpServletResponse**도 같이 전달한다. 이는 컨트롤러에서 HttpServletResponse 오브젝트안에 직접 결과를 넣어줄 수 있기 때문이다.

<br>
#### **(3) 컨트롤러의 모델 생성과 정보 등록**

 - MVC 패턴의 장점은 정보를 담는 모델과 정보를 어떻게 뿌려줄지를 알고 있는 뷰가 분리된다는 점이다. 
 - 컨트롤러의 작업은 먼저 사용자 요청을 해석한 후, 비즈니스 로직을 수행하도록 서비스 계층의 오브젝트로 작업을 위임, 결과를 받아 모델을 생성 후 어떤 뷰를 사용할지를 결정하는 네 가지로 분류할 수 있다.
 - 모델을 생성하고 모델에 정보를 넣어주는 것이 컨트롤러가 해야 할 마지막 중요한 두 가지 작업 중의 하나이다. 컨트롤러에서 DispatcherServlet으로 결과를 돌려주는 두 가지 정보가 **모델과 뷰이다.**

<br>
#### **(4) 컨트롤러의 결과 리턴: 모델과 뷰**

 - MVC의 모든 요소랑 마찬가지로 뷰도 하나의 오브젝트인데, 컨트롤러가 뷰 오브젝트를 직접 리턴할 수도 있지만 보통은 **뷰의 논리적인 이름을 리턴하여 DispatcherServlet의 전략인 뷰 리졸버가 이를 이용해 뷰 오브젝트를 생성하도록 한다.**
 - 컨트롤러가 리턴하는 정보는 모델과 뷰로, 이를 표현하는 **ModelAndView**라는 이름의 오브젝트가 있다. 이 오브젝트가 DispatcherSevlet이 어댑터를 통해 컨트롤러로부터 돌려받는 오브젝트이다.

<br>
#### **(5) DispatcherServlet의 뷰 호출과 (6) 모델 참조**

 - DispatcherServlet은 컨트롤러로부터 모델과 뷰를 전달받은 후, **뷰 오브젝트에게 모델을 전달하여 최종 결과물을 생성해달라고 요청한다.**
 - 뷰 오브젝트는 모델을 받아 적절한 최종 결과물을 생성한다.
 - 최종 결과물은 HttpServletResponse에 담긴다.

<br>
#### **(7) HTTP 응답 돌려주기**

 - 뷰 생성까지 모든 작업을 마친 후, DispatcherServlet은 등록된 후처리기가 있는지 확인 후 있다면 후처리기에서 후속 작업을 진행 후 뷰가 만들어준 HttpServletResponse에 담긴 결과를 서블릿 컨테이너로 돌려준다.
 - 서블릿 컨테이너는 HttpServletResponse에 담긴 정보를 HTTP 응답으로 만들어 사용자의 브라우저나 클라이언트로 전송하고 작업을 종료한다.

<br>
### DispacherServlet의 DI 가능한 전략

DispatcherServlet은 DI로 확장 가능한 여러 전략들이 있다. 스프링 MVC는 자주 사용되는 전략을 디폴트로 설정해주고 있다. 따라서 필요한 전략만 확장해서 사용하고 나머지는 디폴트 전략을 사용해도 된다.

다음 전략들은 DispatcherServlet의 동작 방식을 확장하는 확장 포인트라고 할 수 있다. 
**DispatcherServlet은 서블릿 컨테이너가 생성하고 관리하는 오브젝트이지, 스프링 컨텍스트에서 관리하는 빈 오브젝트가 아니다.** 하지만 DispatcherServlet은 내부에 서블릿 웹 애플리케이션 컨텍스트를 가지고 있고 내부 컨텍스트로부터 전략이 담긴 빈 오브젝트를 찾아 사용한다.

DispatcherServlet에 적용할 전략을 선택하고, 필요에 따라 확장하거나 다른 방식으로 사용하는 것이 스프링 MVC를 바로 사용하는 첫 걸음이다.

<br>
#### **HandlerMapping**

```java
public interface HandlerMapping {

	@Nullable
	HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception;

}
```

URL과 요청 정보를 기준으로 **어떤 핸들러 오브젝트, 즉 컨트롤러를 사용할 것인지를 결정하는 로직을 담당한다.** **HandlerMapping** 인터페이스를 구현해서 만들 수도 있다. 

DispatcherServlet은 하나 이상의 핸들러 매핑을 가질 수 있다. 디폴트는 **BeanNameUrlHandlerMapping**과 **DefaultAnnotationHandlerMapping** 두 가지가 설정되어 있다.

- DefaultAnnotationHandlerMapping: @RequestMapping이라는 애노테이션을 컨트롤러 클래스나 메소드에 직접 부여하고 이를 이용해 매핑하는 전략이다. 스프링 3.1부터 deprecated되고, 대신에 **RequestMappingHandlerMapping**이 추가되었다.

> RequestMappingHandlerMapping은 웹 요청을 핸들러 오브젝트가 아닌 핸들러 메소드(HandlerMethod)로 매핑한다.

<br>
#### **HandlerAdapter**

```java
public interface HandlerAdapter {

	boolean supports(Object handler);

	@Nullable
	ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception;

	long getLastModified(HttpServletRequest request, Object handler);

}
```

핸들러 매핑으로 선택한 컨트롤러 / 핸들러를 DispatcherServlet이 **호출할 때 사용하는 어댑터**이다.
컨트롤러 타입에는 제한이 없으며, 호출 방식은 타입에 따라 다르기 때문에 컨트롤러를 결정한다고 해서 DispatcherServlet이 바로 호출할 수 없다. 따라서 컨트롤러 타입을 지원하는 HandlerAdapter가 필요하다.

> DispatcherServlet은 빈으로 등록된 모든 핸들러 어댑터의 supports 메소드를 호출해서 핸들러 매핑으로 찾아낸 핸들러 오브젝트를 처리할 수 있는지 확인하고, 처리할 수 있는 핸들러 어댑터의 handle 메소드를 호출하여 컨트롤러를 실행시킨다.

> 핸들러 어댑터는 DispatcherServlet으로부터 HttpServletRequest와 HttpServletResponse를 받아 이를 컨트롤러가 사용하는 파라미터 타입으로 변환해서 제공한다. 그리고 받은 결과를 ModelAndView 타입의 오브젝트에 담아 DispatcherServlet으로 돌려준다.

컨트롤러 타입에 적합한 어댑터를 가져다가 이를 통해 컨트롤러를 호출한다. 디폴트는 **HttpRequestHandlerAdapter**, **SimpleControllerHandlerAdapter**, **AnnotationMethodHandlerAdapter**이다.

핸들러 매핑과 어댑터는 서로 연관이 있을 수도 있고 없을 수도 있다.
다만 @RequestMapping과 @Controller 어노테이션을 통해 정의되는 컨트롤러의 경우, **DefaultAnnotationHandlerMapping**에 의해 핸들러가 결정되고, **AnnotationMethodHandlerAdapter**에 의해 호출이 일어난다.

> 스프링 3.1부터는 DefaultAnnotationHandlerMapping -> RequestMappingHandlerMapping / AnnotationMethodHandlerAdapter -> RequestMappingHandlerAdapter 를 사용한다.

- AnnotationMethodHandlerAdapter: 지원하는 컨트롤러의 타입이 정해져있지 않다. 클래스와 메소드에 붙은 몇 가지 애노테이션 정보와 메소드 이름, 파라미터, 리턴 타입에 대한 규칙을 종합적으로 분석해서 컨트롤러를 선별하고 호출 방식을 결정한다. 또한 URL 매핑 단위가 클래스가 아닌 메소드 단위이다. 스프링 3.1부터 deprecated 되었고, 대신에 **RequestMappingHandlerAdapter** 를 사용한다.

<br>
#### HandlerExceptionResolver

```java
public interface HandlerExceptionResolver {

	@Nullable
	ModelAndView resolveException(
			HttpServletRequest request, HttpServletResponse response, @Nullable Object handler, Exception ex);

}
```

**예외가 발생했을 때, 이를 처리하는 로직을 가진다.**
예외가 발생했을 때, 예외의 종류에 따라 에러 페이지를 표시한다던가 관리자에게 통보하는 작업은 개별 컨트롤러가 아닌 프론트 컨트롤러인 DispatcherServlet을 통해 처리되어야 한다.

DispatcherServlet은 등록된 HandlerExceptionResolver 중에서 발생한 예외에 적합한 것을 찾아 예외처리를 위임한다.

디폴트는 **AnnotationMethodHandlerExceptionResolver**, **ResponseStatusExceptionResolver**, **DefaultHandlerExceptionResolver** 세 가지가 등록되어 있다. 
단 3.1부터는 AnnotationMethodHandlerExceptionResolver 대신, **ExceptionHandlerExceptionResolver를 사용한다.**

<br>
#### ViewResolver

```java
public interface ViewResolver {

	@Nullable
	View resolveViewName(String viewName, Locale locale) throws Exception;

}
```

뷰 리졸버는 컨트롤러가 리턴한 **뷰 이름을 참고해서 적절한 뷰 오브젝트를 찾는 로직을 가진다.**
스프링이 지원하는 뷰의 종류는 다양하므로, 뷰의 종류에 따라 적절한 뷰 리졸버를 추가로 설정하면 된다.

컨트롤러가 작업을 마친 후 뷰 정보를 **ModelAndView** 타입 오브젝트를 DispatcherServlet으로 돌려주는데, 뷰 이름을 넣어주거나 **View** 타입의 오브젝트를 돌려주는 방법이 있다. 뷰 이름을 넣어주는 경우, 위의 뷰 리졸버가 필요하다.

```java
public interface View {

	@Nullable
	default String getContentType() {
		return null;
	}

	void render(@Nullable Map<String, ?> model, HttpServletRequest request, HttpServletResponse response)
			throws Exception;

}
```

View 인터페이스는 뷰 오브젝트가 생성하는 콘텐츠의 타입 정보 제공 및 모델을 전달받아 클라이언트에 돌려줄 결과물을 만들어주는 메소드들로 구성되어 있다.

<br>
#### LocaleResolver

```java
public interface LocaleResolver {

	Locale resolveLocale(HttpServletRequest request);

	void setLocale(HttpServletRequest request, @Nullable HttpServletResponse response, @Nullable Locale locale);

}
```

**지역 정보를 결정해주는 전략이다.**
디폴트인 **AcceptHeaderLocaleResolver**는 HTTP 헤더의 정보를 보고 지역정보를 설정한다. 헤더말고도 세션이나 URL 파라미터, 쿠키 정보를 고려하도록 다른 전략을 통해 결정하게 할 수 있다.

<br>
#### ThemeResolver

테마를 가지고 이를 변경해서 사이트를 구성할 경우, 쓸 수 있는 테마 정보를 결정해주는 전략이다.

<br>
#### RequestToViewNameTranslator

컨트롤러에서 뷰 이름이나 뷰 오브젝트를 지정해주지 않았을 경우, **URL과 같은 요청정보를 참고하여 자동으로 뷰 이름을 생성해주는 전략이다.** 디폴트는 **DefaultRequestToViewNameTranslator**이다.

---

DispatcherServlet을 프론트 컨트롤러로 사용하는 스프링 MVC의 가장 큰 특징은 매우 유연한 컨트롤러 호출 방식을 사용한다는 것이다. 컨트롤러 종류에 제약을 받지 않고, 적절한 어댑터만 제공해준다면 다양한 종류의 컨트롤러를 사용할 수 있다.

<br>
#### 핸들러 인터셉터

핸들러 매핑의 역할은 URL과 요청정보로부터 컨트롤러 빈을 찾는 것 뿐만 아니라, 핸들러 인터셉터를 적용해주는 것도 있다. 핸들러 인터셉터는 DispatcherServlet이 **컨트롤러를 호출하기 전과 후에 요청과 응답을 참조하거나 가공할 수 있는 일종의 필터이다.**

핸들러 매핑은 DispatcherServlet으로부터 매핑 작업을 요청받으면 그 결과로 **핸들러 실행 체인(HandlerExecutionChain)**을 돌려준다. 
핸들러 실행 체인은 하나 이상의 핸들러 인터셉터를 걸쳐서 컨트롤러가 실행될 수 있도록 구성되어 있다. 핸들러 인터셉터가 등록되어 있다면 순서에 따라 인터셉터를 거친 후 컨트롤러가 호출된다.

```java
public interface HandlerInterceptor {

	boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		return true;
	}

	void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			@Nullable ModelAndView modelAndView) throws Exception {
	}

  void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
			@Nullable Exception ex) throws Exception {
	}

}
```

핸들러 인터셉터는 기본적으로 핸들러 매핑 단위로 등록한다. 다시 말하자면, 핸들러 매핑 빈의 interceptors 프로퍼티에 핸들러 인터셉터 빈을 레퍼런스로 넣어줘야 한다는 것이다.

스프링 3.0부터는 핸들러 인터셉터를 URL 패턴을 이용해 모든 핸들러 매핑에 일괄 적용할 수 있게 하는 기능이 추가되었다.
  
[Example for SimpleController interface, SimpleHandlerAdapter.](https://github.com/dhsim86/tobys_spring_study/commit/8eccfb8f4a07fa8754c8d316f98b81715ce2603d)

