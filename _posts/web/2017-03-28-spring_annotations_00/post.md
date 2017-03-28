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

# Spring Annotations: 00

<br>
## @Component

package: org.springframework.stereotype
~~~java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Component {

	String value() default "";
}
~~~

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

---
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
#### java.util.Map 또는 org.springframework.ui.Model / org.springframework.ui.ModelMap
**View** 로 데이터를 전달해야 하는 경우, 위 타입의 파라미터를 정의하고, 메소드 내부에서 **View** 로 전달할 데이터를 추가

~~~java
@RequestMapping("/getProduct.do")
public String getProduct(@RequestParam("productNo") String productNo, Map map) {
  Product product = productService.getProduct(productNo);
  map.put("product", product);

  return "/WEB-INF/jsp/viewProduct.jsp";
}
~~~
~~~java
@RequestMapping("/getProduct.do")
public String getProduct(@RequestParam("productNo") String productNo, Model model) {
  Product product = productService.getProduct(productNo);
  model.addAttribute("product", product);

  return "/WEB-INF/jsp/viewProduct.jsp";
}
~~~
~~~java
@RequestMapping("/getProduct.do")
public String getProduct(@RequestParam("productNo") String productNo, ModelMap modelMap) {
  Product product = productService.getProduct(productNo);
  modelMap.addAttribute("product", product);

  return "/WEB-INF/jsp/viewProduct.jsp";
}
~~~

<br>
#### Command 또는 form 객체

**HTTP Request로 전달된 parameter를 binding** 한 객체로, **View** 에서 사용가능하고, **@SessionAttribute** 를 통해 session에 저장되어 관리될 수 있다.

~~~java
@RequestMapping("/addProduct.do")
public String updateProduct(Product product, SessionStatus status)
        throws Exception {
    // 여기서 'product'가 Command(/form) 객체이다.
    return "/listProduct.do";
}

@RequestMapping("/addProduct.do")
public String updateProduct(@ModelAttribute("updatedProduct") Product product,
        SessionStatus status) throws Exception {
    // 여기서 'updatedProduct'라는 이름의 'product'객체가 Command(/form) 객체이다.
    return "/listProduct.do";
}
~~~

<br>
#### org.springframework.validation.Errors 또는 org.springframework.validation.BindingResult

바로 이전의 입력파라미터인 **Command 또는 form 객체의 validation 결과 값을 저장하는 객체** 로 해당 command 또는 form 객체 바로 다음에 위치해야 함에 유의하도록 한다.

~~~java
@RequestMapping(params = "param=add")
public String addProduct(HttpServletRequest request,
        Product product, BindingResult result, SessionStatus status) throws Exception {        
    new ProductValidator().validate(product, result);
    if (result.hasErrors()) {
        return "/jsp/annotation/sales/product/productForm.jsp";
    } else {
        // 중략
        return "/listProduct.do";
    }
}
~~~

<br>
#### org.springframework.web.bind.support.SessionStatus

**폼 처리가 완료되었을 때 status를 처리** 하기 위해서 argument로 설정. SessionStatus.setComplete()를 호출하면 컨트롤러 클래스에 @SessionAttributes로 정의된 Model객체를 session에서 지우도록 이벤트를 발생시킨다.

~~~java
@RequestMapping(params = "param=add")
public String addProduct(HttpServletRequest request,
        Product product, BindingResult result, SessionStatus status) {
    // 중략
    productService.addProduct(product);
    status.setComplete();
    return "/listProduct.do";
}
~~~
---
| 리턴 타입 | 설명 |
| ---------- | :--------- |
| ModelAndView | View / Model 정보를 담고있는 ModelAndView 타입의 객체 |
| Model | View에 전달할 객체 정보를 담는 Model 타입의 객체를 리턴. View 이름은 요청 URL로부터 결정된다. |
| Map, ModelMap | View에 전달할 객체 정보를 담는 Map 혹은 ModelMap을 환리턴. View 이름은 요청 URL로부터 결정된다. |
| String | View 이름을 리턴 |
| View 객체 | View 객체를 직접 리턴. 해당 View 객체를 이용해서 View를 생성 |
| void | 메서드가 ServletResponse나 HttpServletResponse 타입의 파라미터를 가질 때 직접 응답을 처리한다고 가정 |
| @ResponseBody | 해당 annotation이 선언된 경우 리턴 객체를 HTTP response로 전송한다. HttpMessageConverter를 통해 객체를 HTTP 응답 스트림으로 변환 |

<br>
#### ModelAndView 객체

**View** 와 **Model** 정보를 모두 포함한 객체를 리턴할 경우
~~~java
@RequestMapping(params = "param=addView")
public ModelAndView addProductView() {
    ModelAndView mnv = new ModelAndView("/jsp/product/productForm.jsp");
    // mnv.setViewName("/jsp/product/productForm.jsp");
    mnv.addObject("product", new Product());
    return mnv;
}
~~~

<br>
#### Map, ModelMap

**Web View** 로 전달할 데이터만 리턴할 경우
~~~java
@RequestMapping("/productList.do")
public Map getProductList() {
    List productList = productService.getProductList();
    ModelMap map = new ModelMap(productList); //productList가 "productList"라는 이름으로 저장됨.
    return map;
}
~~~
여기서 View에 대한 정보를 명시적으로 리턴하지는 않았지만, 내부적으로 View name은 **RequestToViewNameTranslator** 에 의해서 입력된 HTTP Request를 이용하여 생성된다. 예를 들어 **DefaultRequestToViewNameTranslator** 는 입력된 HTTP Request URI를 변환하여 View name을 다음과 같이 생성한다.

 * http://localhost:8080/display.do -> 생성된 View name: **'display'**

 * http://localhost:8080/admin/index.do -> 생성된 View name: **'admin/index'**

위와 같이 자동으로 생성되는 View name에 'jsp/'와 같이 prefix를 붙이거나 '.jsp' 같은 확장자를 덧붙이고자 할 때는 아래와 같이 속정 정의 xml(xxx-servlet.xml)에 추가하면 된다.

~~~xml
<bean id="viewNameTranslator"
        class="org.springframework.web.servlet.view.DefaultRequestToViewNameTranslator">
    <property name="prefix" value="jsp/"/>
    <property name="suffix" value=".jsp"/>
</bean>
~~~

<br>
#### ModelMap

**Web View** 로 전달할 데이터만 리턴하는 경우.
**Model** 은 Java-5 이상에서 사용할 수 있는 인터페이스이다. 기본적으로 ModelMap과 같은 기능을 제공한다.
Model 인터페이스의 구현클래스에는 BindingAwareModelMap 와 ExtendedModelMap 이 있다. View name은 위에서 설명한 바와 같이 RequestToViewNameTranslator에 의해 내부적으로 생성된다.

~~~java
@RequestMapping("/productList.do")
public Model getProductList() {
    List productList = productService.getProductList();
    ExtendedModelMap map = new ExtendedModelMap();
    map.addAttribute("productList", productList);
    return map;
}
~~~

<br>
#### String

**View 이름** 만 리턴하는 경우
~~~java
@RequestMapping(value = {"/addProduct.do", "/updateProduct.do" })
public String updateProduct(Product product, SessionStatus status) throws Exception {
    return "/listProduct.do";
}
~~~

<br>
#### void

메서드 내부에서 **직접 HTTP Response를 처리** 하는 경우. 또는 **View name** 이 **RequestToViewNameTranslator** 에 의해 내부적으로 생성되는 경우

~~~java
@RequestMapping("/addView.do")
public void addView(HttpServletResponse response) {
    // 중략
    // response 직접 처리
}

@RequestMapping("/addView.do")
public void addView() {
    // 중략
    // View name이 DefaultRequestToViewNameTranslator에 의해서 내부적으로 'addView'로 결정됨.
}
~~~

<br>
#### @ResponseBody annotation

해당 annotation이 붙어 있을 경우, **HTTP ResponseBody** 로 전송한다.
