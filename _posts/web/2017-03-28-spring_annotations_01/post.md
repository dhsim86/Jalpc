---
layout: post
title:  "Spring annotations: 01"
date:   2017-03-28
desc: "Spring annotations: 01"
keywords: "spring, spring boot, annotation"
categories: [Web]
tags: [spring]
icon: icon-html
---

# Spring Annotations: 01

> 원본 글: [http://noritersand.tistory.com/156][original_url]

<br>
## @Service

package: org.springframework.stereotype
~~~java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface Service {

	String value() default "";
}

~~~

**@Controller** 마찬가지로 **@Component** annotation이 선언되어 있는 덕분에, **@Service** annotation이 선언된 클래스도 스프링 빈으로 등록될 수 있다.

~~~java
@Service
public class UserService {

    private void loadUser() {
        ...
    }
}
~~~

<br>
## @Repository

package: org.springframework.stereotype
~~~java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface Repository {

	String value() default "";

}
~~~

이 annotation은 일반적으로 데이터를 처리하는 **DAO** 에 사용되며, **DB Exception** 이 발생할 경우, **DataAccessException** 으로 변환한다. 마찬가지로 스프링 빈으로 자동 등록된다.

~~~java
@Repository
public class UserRepositoryImpl implements UserRepository {

    @Override
    public User findByName(String name) {
			...
    }
~~~

<br>
## @Required

package: org.springframework.beans.factory.annotation
~~~java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Required {

}
~~~

**@Required** annotation은 필수 프로퍼티임을 명시하는 것으로 설정하지 않을 경우 빈 생성할 때 예외를 발생시킨다.

다음과 같이 **@Required** annotation이 선언되어 있을 때,
~~~java
@Service
public class UserService {

    @Required
    private UserDao userDao;

		...
~~~

다음과 같이 xml에 반드시 설정해야 하며, 설정하지 않으면 예외를 발생시킬 것이다.
~~~xml
<bean class="org.springframework.beans.factory.annotation.RequiredAnnotationBeanpostProcessor"/>
<bean name="userService"  class="kr.co.UserService">
    <property name="userDao" ref="userDao"/>  
    <!-- @Required 어노테이션을 적용하였으므로 설정하지 않으면 예외를 발생시킨다. -->
</bean>
~~~

**RequiredAnnotationBeanpostProcessor** 클래스는 스프링 컨테이너에 등록된 빈들을 조사하여 **@Required** annotation이 선언된 프로퍼티 값이 설정되어 있는지 검사한다.

사실 위의 xml과 같이 할 필요없이, xml 파일에 다음과 같이 **annotation-config** 를 추가하면 된다.
~~~xml
...
	<context:annotation-config/>
...
~~~

<br>
## @Autowired

package: org.springframework.beans.factory.annotation
~~~java
@Target({ElementType.CONSTRUCTOR, ElementType.METHOD, ElementType.PARAMETER, ElementType.FIELD, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Autowired {

	boolean required() default true;

}
~~~

스프링 빈 간의 **의존관계를 자동설정 (DI)** 할 때 사용하며, 타입을 통해 의존성 있는 객체를 자동으로 주입시켜 준다.
그러므로, **해당 타입의 빈이 존재하지 않거나 2개 이상 존재할 경우 예외를 발생시킨다.**

다음과 같이 이 annotation을 선언한 프로퍼티 중에 반드시 설정할 필요가 없을 경우에는 예외를 발생시키지 않을 수도 있다.
**@Autowired** 정의를 보면 알겠지만 **required** 는 디폴트가 true로 되어 있다.
~~~java
...
	@Autowired(required=false)
	private UserDao userDao;
...
~~~

이 annotation을 사용하려면 xml에 다음과 같이 **AutowiredAnnotationBeanPostProcessor** 빈을 등록해야 하지만 **@Required** annotation 때와 마찬가지로 **annotation-config** 태그를 추가하면 사용할 수 있다.

~~~xml
<bean class="org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor" />
~~~

만약 2개 이상 같은 타입의 빈이 존재하면 예외가 발생하는데, **@Qualifier** annotation를 통해 동일한 타입 빈들 중에 특정 빈을 사용하도록 할 수 있다.
~~~java
@Autowired
@Qualifier("userDaoTest")
private UserDao userDao;
~~~

<br>
## @Qualifier

package: org.springframework.factory.annotation
~~~java
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Qualifier {

	String value() default "";

}
~~~

이 annotation은 보통 **@Autowired** annotation과 같이 사용된다. 이 annotation을 사용함으로써 동일한 타입의 빈이 여러 개 존재할 경우 특정 이름의 빈을 주입할 수 있게 설정한다.

<br>
## @Resource

package: javax.annotation.Resource
~~~java
@Target({TYPE, FIELD, METHOD})
@Retention(RUNTIME)
public @interface Resource {
	...
~~~

자바 6 및 JEE5에 추가된 annotation으로 애플리케이션에서 필요로 하는 자원을 자동 연결하고 싶을 때 사용한다.
스프링에서는 의존하는 빈 객체를 전달할 때 사용한다.


**@Autowired** annotation과 비슷하지만 **@Autowired** 는 빈 타입으로, **@Resource** 는 이름으로 연결한다는 점이 다르다.

다음과 같이 xml 파일에 빈이 등록되어 있다고 하면,
~~~xml
<bean name="adminUserService"  class="kr.co.UserService">
    ...
</bean>
~~~

다음과 같이 annotation을 사용할 수 있다.
~~~java
@Controller
public class UserController {

    @Resource(name="adminUserService")
    private UserService userService;

		...
~~~

마찬가지로 다음과 같이 **CommonAnnotationBeanPostProcessor** 빈을 등록해야 하지만 **annotation-config** 태그로 대체할 수 있다.
~~~xml
<bean class="org.springframework.beans.factory.annotation.CommonAnnotationBeanPostProcessor" />
~~~

<br>
## @PostConstruct

package: javax.annotation
~~~java
@Documented
@Retention (RUNTIME)
@Target(METHOD)
public @interface PostConstruct {
}
~~~

빈을 생성 한 후에 초기화 작업을 따로 수행할 때 사용한다.
다음과 같이 특정 메소드에 이 annotation을 선언하면 객체 생성 후 메소드가 자동 실행된다.

사용하기 위해서는 **CommonAnnotationBeanPostProcessor** 빈을 등록해야 하지만 마찬가지로 **annotation-config** 태그로 대체 가능하다.

이 annotation과 비슷하게 객체 소멸 전에 특정 메소드가 호출될 수 있게하는 **@PreDestroy** annotation 도 있다.

<br>
## @Inject

SR-330 표준 annotation으로 Spring 3부터 지원하는 annotation이다.

<br>
## @SessionAttributes

이 annotation은 세션 상에서 **model의 정보를 유지** 하고 싶을 때 사용한다.
~~~java
@Controller
@SessionAttributes("blog")
public class BlogController {
    // 중간생략

    @RequestMapping("/createBlog")
    public ModelMap createBlogHandler() {
        blog = new Blog();
        blog.setRegDate(new Date());
        return new ModelMap(blog);
    }

    // 중간생략
}
~~~

<br>
## @RequestBody
~~~java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequestBody {
	boolean required() default true;
}
~~~

이 annotation이 선언된 파라미터는 **HTTP Request Body** 내용이 그대로 전달된다.
~~~java
@RequestMapping(value="/test")
public void penaltyInfoDtlUpdate(@RequestBody String body,
        HttpServletRequest req, HttpServletResponse res,
        Model model, HttpSession session) throws Exception  {

    System.out.println(body);    
}
~~~

<br>
## @ResponseBody

~~~java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ResponseBody {
}
~~~

메소드에 이 annotation이 선언되면 메소드가 리턴되는 값은 **View**를 통해서 출력되지 않고, **HTTP Response Body** 에 내용이 직접 쓰여진다.
클라이언트로 **JSON** 형태의 값으로 리턴할 때 유용하다. 객체를 넘길 경우, **JASKSON** 에 의하여 문자열로 변환된다.

그리고 이 annotation이 설정될 경우 애플리케이션 컨텍스트에 설정된 **resolver** 를 무시한다.
~~~java
@RequestMapping("/getVocTypeList")
@ResponseBody
public ArrayList<Object> getVocTypeList() throws Exception {
    HashMap<String, Object> vocData = gvocInf.searchVocTypeList();
    return (ArrayList<Object>) vocData.get("data");
}
~~~

<br>
## @PathVariable

~~~java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PathVariable {
	...
~~~

URL의 템플릿 데이터를 **파라미터와 매핑** 시키고 싶을 때 사용한다.

~~~java
package com.sp.ex;

@Controller("ex.exController")
public class ExController{
    @RequestMapping(value="/blog/{userId}/main.action", method=RequestMethod.GET)
    public String main(HttpServletRequest req
                       , @PathVariable String userId) throws Exception    {

        req.setAttribute("userId", userId);
        return "restful/result";
    }
}
~~~

---

**annotation-config** 태그는 annotation과 관련하여 아래 **BeanPostProcess** 를 등록하는 기능을 담당한다.
~~~xml
<bean class="org.springframework.beans.factory.annotation.RequiredAnnotationBeanpostProcessor" />
<bean class="org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor" />
<bean class="org.springframework.beans.factory.annotation.CommonAnnotationBeanPostProcessor" />
<bean class="org.springframework.beans.factory.annotation.ConfigurationClassPostProcessor" />
~~~

[original_url]: http://noritersand.tistory.com/156
