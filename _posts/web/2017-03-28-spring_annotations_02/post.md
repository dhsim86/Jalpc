---
layout: post
title:  "Spring annotations: 02"
date:   2017-03-28
desc: "Spring annotations: 02"
keywords: "spring, spring boot, annotation"
categories: [Web]
tags: [spring]
icon: icon-html
---

# Spring Annotations: 02

> 원본 글: [http://noritersand.tistory.com/457][original_url],  [http://noritersand.tistory.com/357][original_url2]

<br>
## @RequestMapping

package: org.springframework.web.bind.annotation
~~~java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Mapping
public @interface RequestMapping {

	String name() default "";

	@AliasFor("path")
	String[] value() default {};

	@AliasFor("value")
	String[] path() default {};

	RequestMethod[] method() default {};
	String[] params() default {};
	String[] headers() default {};
	String[] consumes() default {};
	String[] produces() default {};
}
~~~

URL을 **Controller** 의 메소드와 매핑시킬 때 사용하는 Spring의 annotation 이다.

보통 클래스나 메소드 선언부에 다음과 같이 이 annotation과 함께 **URL을 명시하여** 사용한다.
~~~java
@Controller
public class HelloController {

    @RequestMapping("/hello")
    public String index(Model model) {

       model.addAttribute("name", "Spring Blog");
       return "hello";
    }
		...
~~~

URL 외에도 **HTTP 요청 메소드 (GET / POST / PUT / DELETE) 나, 헤더 값에 매핑 될 수 있도록 -O= 옵션을 제공한다.**
위의 RequestMapping의 정의를 보면 옵션이 **path나 value, params, header 등이 있는 것을 알 수 있을 것이다.**

> 메소드 내에서 **View Name** 을 별도로 설정하지 않으면 @RequestMapping의 path 로 설정한 URL이 그대로 View Name으로 설정된다.

<br>
### @RequestMapping options

#### path (혹은 value)

요청된 URL에 따라 매핑시킨다.
URL을 명시할 때 다음과 같이 줄 수 있다.
~~~
path = "some.url.action"
path = {"some-url1", "some-url2"}
~~~

따라서 이 옵션을 사용할 때는 다음과 같이 코드를 작성할 수 있다. 다음과 같이 작성할 경우 URL **/hello 및 /hi** 의 요청은 index 메소드가 처리하게 될 것이다.
~~~java
@RequestMapping(path = {"/hello", "/hi"})
public String index(Model model) {

	 model.addAttribute("name", "Spring Blog");
	 return "hello";
}
~~~

<br>
#### method

GET, POST, PUT, DELETE 같은 **HTTP request methoad에 따라** 매핑을 결정한다.
줄 수 있는 HTTP Request method 값들은 **enum** 으로, 다음과 같이 정의되어 있다.
~~~java
public enum RequestMethod {
	GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS, TRACE
}
~~~

이 옵션을 **path 옵션과 사용** 할 때, 다음과 같이 특정 HTTP request method와 URL로 매핑시킬 수 있다.
~~~java
@RequestMapping(path = {"/hello", "/hi"}, method = RequestMethod.GET)
public String index(Model model) {

	 model.addAttribute("name", "Spring Blog");
	 return "hello";
}
~~~

이 옵션으로 사용할 수 있는 HTTP request method 중에 **GET / POST / PUT / PATCH / DELETE** 를 사용하고자 할 때 다음 annotation 들로 대체할 수 있다.

~~~java
@GetMapping
@PostMapping
@PutMapping
@PatchMapping
@DeleteMapping
~~~

위의 annotation은 특별한 것이 아니라 그냥 **@RequestMapping 에 옵션 method를 준 것과 다름없다.**
**@GetMapping** annotation은 다음과 같이 정의되어 있다.
~~~java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@RequestMapping(method = RequestMethod.GET)
public @interface GetMapping {

	@AliasFor(annotation = RequestMapping.class)
	String name() default "";

	@AliasFor(annotation = RequestMapping.class)
	String[] value() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] path() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] params() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] headers() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] consumes() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] produces() default {};
~~~
**@RequestMapping** annotation 정의과 비교했을 때 **method 옵션** 을 따로 줄 수 없는 것만 다른 것이다.

<br>
#### params

이 옵션은 요청된 파라미터에 따라 매핑시킬 수 있다.
~~~
params = {"someParam1=someValue", "someParam2"}
params = "!someExcludeParam"
~~~

아래처럼 작성하였을 때, URL 파라미터에 **param1 과 param2 가 존재** 해야하고, **param1의 값은 a** 여야 하며, **myParam** 는 있으면 안된다.
~~~java
@RequestMapping(params = {"param1=a", "param2", "!myParam"})
public String myMethod() {

}
~~~

<br>
## @RequestParam

이 annotation은 **key=value** 로 넘어오는 쿼리스트링 혹은 form 데이터를 메소드의 파라미터로 지정한다.
대체로 파라미터의 개수가 적을 때 사용한다.

~~~
methodName(@RequestParam("param") obj)
methodName(@RequestParam Map)
~~~
* 전달되는 파라미터의 이름을 지정한다. 이름 외에 기본값(defaultValue), 필수여부(required)를 설정할 수 있다. 값이 할당될 변수의 타입이 Map 혹은 MultiValueMap 일 때는 명시하지 않는다
* **obj** 는 지정한 이름과 일치하는 파라미터의 값을 할당할 변수이다. 보통 **String** 타입을 선언하지만, 넘어온 값이 숫자일 경우에 한해 **int 등의 숫자 타입** 도 가능하다.

~~~java
@Controller
public class BlogController {

    @RequestMapping("/editBlog")
    public ModelMap editBlogHandler(@RequestParam("blogId") int blogId) {
        blog = blogService.findBlog(blogId);
        return new ModelMap(blog);
    }

    // ...
}
~~~

~~~java
@RequestMapping(value="/...", method={RequestMethod.GET, RequestMethod.POST})
public String submit(HttpServletRequest req,
        @RequestParam(value="num1") int num1,
        @RequestParam(value="num2") int num2,
        @RequestParam(value="oper") String oper) throws Exception {
    // value: request parameter의 이름

    // 생략
}

//@RequestParam 어노테이션이 적용된 파라미터는 기본적으로 필수 파라미터이다.
//따라서, 명시한 파라미터가 존재하지 않을 경우 400 에러가 발생한다.
//여기서 파라미터에 값이 있을수도 없을수도 있는 로직을 구현하려면 다음처럼 작성한다.

@RequestMapping(value="/...", method={RequestMethod.GET, RequestMethod.POST})
public String submit(HttpServletRequest req,
        @RequestParam(value="num1", defaultValue = "0") int num1,
        @RequestParam(value="num2", defaultValue = "0") int num2,
        @RequestParam(value="oper", required=false) String oper)
        throws Exception {

    // 생략
}
~~~

<br>
### Map 에 할당 (여러 파라미터의 값을 Map에 넘겨준다)

~~~java
@RequestMapping("/faqDetail")
public String faqDetail(@RequestParam HashMap<String, String> map) {
    String searchValue = map.get("searchValue");
    // req.getParameter("searchValue") 와 같다.

    return "/board/faq/faqDetail";
}
~~~

<br>
## @ControllerAdvice / @ExceptionHandler

이 annotation들은 서버 애플리케이션이 운영 도중에 **Exception** 이 발생했을 때 작업을 처리하기 위해 사용한다.
annotation들의 정의는 다음과 같다.
~~~java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface ControllerAdvice {
	...

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ExceptionHandler {
~~~

**@ControllerAdvice** 가 선언된 클래스는 자동으로 스프링 빈으로 등록되며, **@ExceptionHandler** annotation 은 메소드에 선언할 수 있는 것을 알 수 있다.

다음은 이 annotation들을 사용해서 예외처리를 담당하는 클래스를 정의한 것이다.

~~~java
@ControllerAdvice
public class ExceptionHandler {

	private static Logger logger = (Logger)LoggerFactory.getLogger(ExceptionHandler.class);

	@ExceptionHandler(Exception.class)
	public void handleException(Exception e) {
		logger.debug("Exception");
	}

	@ExceptionHandler(RuntimeException.class)
	public ModelAndView handleRuntimeException(RuntimeException e) {
		ModelAndView mnv = new ModelAndView("exceptionHandler");
		mnv.addObject("data", e.getMessage());

		return mnv;
	}
}
~~~

위와 같이 클래스에 **@ControllerAdvice** annotation을 선언해주고, 각 메소드마다 **@ExceptionHandler** annotation 으로
어떠한 Exception을 처리할 것인지 정의할 수 있다.

이렇게 처리하면 특정 Exception이 발생할 때 **@ExceptionHandler** annotation이 선언된 메소드가 그 Exception을 받아 처리할 수 있는 것이다.

리턴 값으로는 void 부터 ModelAndView 까지 다양하게 리턴할 수 있다.


[original_url]: http://noritersand.tistory.com/457
[original_url2]: http://noritersand.tistory.com/357
