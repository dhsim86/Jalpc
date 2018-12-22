---
layout: post
title:  "Toby's Spring Chap 13: 스프링 @MVC"
date:   2018-12-22
desc: "Toby's Spring Chap 13: 스프링 @MVC"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

스프링으 DispatcherServlet과 7가지 전략을 기반으로 한 MVC 프레임워크를 제공한다. 특히 2.5부터 시작하여 3.0에서 강화된 애노테이션을 활용한 전략은 컨트롤러 코드 작성에 있어서 많은 변화를 가져왔다.

<br>
## @RequestMapping 핸들러 매핑

@MVC의 가장 큰 특징은 **핸들러 매핑과 핸들러 어댑터 대상이 컨트롤러 오브젝트가 아닌 메소드라는 점이다.**
이전에는 특정 컨트롤러는 특정 인터페이스를 구현하는 구조로 인해, URL 당 하나의 컨트롤러 오브젝트가 매핑되고 그 인터페이스에 특정 메소드가 호출을 받을 수 있었다.

그러나 대상의 타입이나 코드에 영향을 받지 않는 **애노테이션을 활용함으로써 메소드 레벨까지 세분화해서 매핑 및 호출할 수 있게 되었다.**

DefaultAnnotationHandlerMapping (스프링 3.1부터는 RequestMappingHandlerMapping)은 핸들러 매핑 정보로 **@RequestMapping** 애노테이션을 활용한다.

@RequestMapping은 클래스나 메소드 둘다 붙일 수 있으므로, 스프링은 **클래스에 정의된 @RequestMapping을 기준으로 삼아 메소드 레벨의 @RequestMapping 정보를 통해 더 세분화하여 요청 정보와 핸들러 간의 매핑을 적용한다.**

<br>
### @RequestMapping

- value: String 배열로 하나 이상의 URL 패턴을 지정, ANT 패턴을 사용할 수도 있다.
- method: HTTP 메소드를 지정
- params: HTTP 요청 파라미터와 값을 추가적으로 매핑 정보로 활용한다.
- headers: HTTP 헤더 정보를 매핑 정보로 활용한다.

@RequestMapping 정보는 상속되며, 서브 클래스에서 @RequestMapping을 재정의하면 상위에서 정의한 @RequestMapping은 무시된다.

<br>
## 파라미터

@Controller 애노테이션은 컴포넌트 스캔에 의해 빈 자동 인식을 할 수 있게하는 스테레오 타입의 애노테이션이지만, 이 말고도 **컨트롤러 역할을 담당하는 메소드 정의를 자유롭게 지정할 수 있게 해준다.**

개발자가 마음대로 필요한 파라미터와 리턴 값을 자유롭게 애노테이션과 결합하여 정의할 수 있다. 이를 가능케하는 핸들러 어댑터는 매우 복잡하다. 스프링은 메소드의 파라미터와 리턴 값, 애노테이션이 어떻게 선언되어 있는지 살펴보고, 이를 이용해 적절한 파라미터 값을 준비하여 호출해준다.

- HttpServletRequest, HttpServletResponse: 해당 타입이 파라미터로 정의되어 있다면 해당 서블릿 오브젝트를 받을 수 있다.
- HttpSession: HTTP 세션이 필요할 경우 사용. 멀티스레드 안정성이 보장되지 않으므로 핸들러 어댑터의 synchronizeOnSession 프로퍼트를 true로 설정한다.
- WebRequest, NativeWebRequest: HttpServletRequest 대부분의 정보를 갖고 있는 서블릿 API에 종속적이지 않은 오브젝트 타입이다.
- Locale: java.util.Locale 타입으로 LocaleResolver가 결정한 Locale 오브젝트를 받을 수 있다.
- InputStream, Reader: HttpServletRequest의 getInputStream으로 얻을 수 있는 스트림이나 Reader를 받을 수 있다.
- OutputStream, Writer: HttpServletResponse의 getOutputStream으로 가져올 수 있는 스트림또는 Writer를 받을 수 있다.
- @PathVariable: @RequestMapping에 있는 {} 로 들어가는 PathVaraible의 값을 받는다.
- @RequestParam: 쿼리 파라미터들의 값을 받는다. 만약 파라미터 이름을 지정하지 않고 Map 형식의 파라미터 타입을 지정하면 모든 파라미터를 Map 오브젝트로 받는다. 필수 여부나 디폴트 값을 지정할 수도 있다.
  - 타입 변환 작업이 실패하면 예외가 발생한다.
- @CookieValue: 쿠키 값을 받는다.
- @RequestHeader: HTTP 헤더의 정보를 받는다.
- Map, Model, ModelMap: 이 타입의 오브젝트를 통해 모델의 정보를 넣어줄 수 있다.
- @ModelAttribute: 도메인 오브젝트의 프로퍼티에 요청 파라미터를 바인딩하여 한 번에 받을 수 있다. 스프링은 setter를 통해 프로퍼티에 값을 설정해준다. 
  - 컨트롤러가 리턴하는 모델 맵이 담기는 모델 오브젝트의 한 가지로, 해당 오브젝트를 다시 모델 맵에 추가시켜준다. 
  - 사용자 요청 값에 대한 추가적인 검증 작업이 추가된다. 핸들러 어댑터는 검증 결과를 컨트롤러에게 제공해준다.
  - @RequestParam과는 다르게 요청 값에 대한 타입 변환이 실패하였다고 해서 작업이 중지되지 않는다. 다만 BindingResult나 Error에 변환 결과가 같이 저장되어 컨트롤러로 전달된다. 
  - 변환 작업이나 검증에 실패했을 때, BindingResult나 Error 타입의 파라미터가 없다면 BindingException 예외가 발생한다.
- Errors, BindingResult: @ModelAttribute가 정의된 파라미터 바로 뒤에 붙여서 사용해야 한다.
- SessionStatus: 모델 오브젝트를 세션에 저장해두어 다음 request에도 활용할 수 있는데, 필요없게 될 경우 제거해야 한다. 이 때 필요한 것이 SessionStatus 타입 오브젝트이다.
- @RequestBody: HTTP 요청의 바디 부분이 전달된다. 핸들러 어댑터는 미디어 타입과 파라미터 타입을 보고, 결정한 **HttpMessageConverter**를 거쳐서 변환된 바디 내용을 전달해준다.
- @Value: 시스템 프로퍼티나 다른 빈의 프로퍼티 값 등을 사용할 수 있다.
- @Valid: 빈 검증기를 통해 모델 오브젝트를 검증하도록 지시하는 애노테이션이다. 보통 @ModelAttribute와 같이 사용한다.

<br>
## 리턴 타입의 종류

@MVC 컨트롤러 메소드는 리턴 타입도 자유롭게 지정할 수 있다.
컨트롤러가 DispatcherServlet에게 돌려줘야 하는 것은 모델과 뷰이다. 핸들러 어댑터를 통해 최종적으로 DispatcherServlet으로 리턴되는 것은 ModelAndView 타입이다. 물론 ModelAndView를 무시하고 HttpServletResponse에 직접 응답 값을 넣어줄 수도 있다.

리턴 타입은 기타 정보와 결합하여 최종적으로 ModelAndView로 만들어진다.

- ModelAndView / Map / Model / ModelMap : 컨트롤러가 리턴하는 정보를 담는다.
- String: 뷰 이름으로 사용된다.
- void: 뷰 이름은 RequestToViewNameResolver 전략에 의해 자동으로 결정된다.
- 모델 오브젝트: 뷰 이름은 RequestToViewNameResolver를 통해 자동 생성하도록 하고, 모델 오브젝트가 하나 뿐이라면 Model이나 ModelAndView 대신 바로 모델 오브젝트를 리턴해도 된다. 스프링은 이를 모델에 자동으로 추가시켜 준다.
- View
- @ResponseBody: HttpMessageConverter에 HTTP 응답 바디로 전환된다.

> Map 자체가 모델 오브젝트인 경우 바로 리턴해서는 안된다. 스프링이 모델 맵으로 인식하여 다시 각 엔트리를 다시 개별적인 모델로 추가시키기 때문이다.

<br>
### 자동 추가 모델 오브젝트와 자동생성 뷰 이름

다음 네 가지는 메소드 리턴 타입과는 상관없이, 모델에 자동으로 추가된다.

- @ModelAttribute 오브젝트: 해당 애노테이션이 붙거나, 단순 타입이 아니라 커맨드 오브젝트로 처리된 오브젝트는 자동으로 모델에 추가된다.
- Map, Model, ModelMap 파라미터: 컨트롤러에서 별도로 ModelAndView 오브젝트를 만들어 리턴하는 경우라도 빠짐없이 모델에 추가된다.
- @ModelAttribute 메소드: 메소드 레벨에 붙일 경우, 모델 오브젝트를 생성하는 메소드를 지정하기 위해 사용한다. @RequestMapping과 같이 사용해서는 안되며, 다른 컨트롤러의 메소드가 호출될 때 자동으로 해당 메소드가 만든 오브젝트를 모델에 추가시킨다.
- BindingResult
