---
layout: post
title:  "Java Web Programming Summary Note 05: Spring IoC Container"
date:   2017-01-30
desc: "Java Web Programming Summary Note 05: Spring IoC Container"
keywords: "java, web, server programming, spring"
categories: [Web]
tags: [java, web, server programming, spring]
icon: icon-html
---

> Java Web Development Workbook Chapter. 08

# Spring IoC Container

<br>
## 의존성 주입(DI)와 역제어(IoC)

* 의존성 주입을 일반적인 용어로 역제어(IoC; Inversion of Control).
* 역제어의 형태가 의존성 주입

> IoC 란 개발자가 작성한 코드에 따라 제어가 이루어지는 것이 아니라, 외부에 의해 코드의 흐름이 바뀌는 것을 의미

<br>
### 의존성 주입

* 이전에는 자신이 사용할 객체(의존 객체, Dependencies)를 자신이 직접 만들어서 썼다.
~~~java
class ProjectListController {
  public void execute() {
    ProjectDao dao = new ProjectDao();
    List<Project> projects = dao.list();
  }
}
~~~

* 앞의 방식과 반대는 방식이 의존성 주입이다. 내부에서 생성하는 것이 아닌 외부에서 의존 객체를 주입해주는 방식이다.
~~~java
class ProjectListController {
  ProjectDao dao;

  public void setProjectDao(ProjectDao dao) {
    this.dao = dao;
  }

  public void execute() {
    List<Project> projects = dao.list();
  }
}
~~~

> 초창기에는 애플리케이션의 크기가 작아 객체가 필요할 때마다 직접 생성해서 사용해도 문제가 되지 않았다. 하지만 규모가 커지면서 성능이나 유지 보수에 문제가 생기게 된다. 이러한 문제를 해결하기 위해 등장한 것이 의존성 주입이다.

<br>
## Spring XML 기반 빈 관리 컨테이너

* Spring Framework는 객체 관리 컨테이너 (IoC 컨테이너)를 제공한다.
* Spring에서는 자바 객체를 **빈(bean)** 이라고 하며, 객체 관리 컨테이너를 **빈 컨테이너** 라고도 부른다.

<br>
### ApplicationContext interface

Spring은 IoC 컨테이너가 갖추어야 할 기능들을 **ApplicationContext** interface에 정의해 두었다. Spring에서 제공하는 IoC 컨테이너들은 모두 이 ApplicationContext interface로부터 상속받는다.

<br>
![00.png](/static/assets/img/blog/web/2017-01-30-java_web_programming_05/00.png)

* Spring에서 빈 정보는 XML 파일에 저장해두고, **ClassPathXmlApplicationContext** 나 **FileSystemXmlApplicationContext** 클래스를 사용하여 빈을 자동 생성한다.
  * ClassPathXmlApplicationContext: 자바 클래스 경로에서 XML로 된 빈 설정 파일을 검색
  * FileSystemXmlApplicationContext: 파일 시스템 경로에서 빈 설정 파일을 검색
  * **WebApplicationContext**: **web.xml** 파일에 설정된 정보에 따라 XML 파일을 검색

<br>
### \<bean\> tag

~~~xml
<bean id="score" class="exam.test01.Score">
</bean>
~~~

\<bean\> 태그를 통해 자바 빈을 선언할 때 id 속성이나 name 속성에 빈 이름을 지정할 수 있다.

| 항목 | id 속성 | name 속성 |
| ---------- | ---------- | :--------- |
| 용도 | 빈 식별자를 지정한다. 중복되어서는 안된다. | 인스턴스의 별명을 추가할 때 사용, id와 마찬가지로 중복되어서는 안된다. |
| 여러 개의 이름 지정 | 불가능 | 콤마, 세미콜론 또는 공백을 사용하여 여러 개의 이름 지정 가능. (첫번째 이름은 컨테이너에서 빈을 보관할 때 사용, 나머지 이름은 빈의 별명) |
| 빈 이름 작성 규칙 | 제약 없음 | 제약 없음 |

[[ch08] 8.3 Use ClassPathXmlApplicationContext
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/6402c1a91bafc245b43be3c3d01fb380efea13c2)

* 다음과 같이 빈의 이름을 설정하지 않으면 컨테이너에 보관할 때 **패키지 이름 + 클래스 이름 + \#인덱스** 로 사용한다.
~~~xml
<!-- exam.test01.Score#0 -->
<!-- exam.test01.Score 는 첫 번째 빈인 exam.test01.Score#0 에 대한 별명이 된다. -->
<bean class="exam.test01.Score">
~~~

[[ch08] 8.3 Use anonymous bean
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/fb201d072d82393079b1118a8ce2a579729e9689)

<br>
### \<constructor-arg\> tag

생성되는 인스턴스에 대해 호출될 생성자를 지정할 수 있다.

~~~xml
<bean id="score" class="exam.test01.Score">
  <constructor-arg>
    <!-- value 를 통해 매개변수 값을 지정한다-->
    <!-- type 속성은 매개변수의 타입, 타입은 생략가능하며, 생략하면 자동 형변환을 수행 -->
    <value type="java.lang.String">example</value>
  </constructor-arg>
  <constructor-arg>
    <value type="float">91</value>
  </constructor-arg>
</bean>
~~~
위와 같이 정의했을 때, **Score(String name, float value)** 생성자가 호출될 것이다.

[[ch08] 8.3 contructor-args usage
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/f19145a69de65c6d1e6b5b9cc9f7f466e46bc39e)

다음과 같이 **'c'** 네임스페이스를 사용하면, **c:** 로 시작하는 속성을 통해 생성자의 파라미터를 지정할 수 있다.
~~~xml
<beans xmlns="http://www.springframework.org/schema/beans" ...
  xmlns:p="http://www.springframework.org/schema/c" ... >
  <bean id="score" class"exam.test01.Score" c:name="example" c:value="91" />
</beans>
~~~

생성자를 통해 의존 객체를 주입할 때, 새로 빈을 생성하여 넘겨주고 싶다면 자식 태그로 \<bean\> 을 다음과 같이 선언하면 된다.

~~~xml
<bean id="score" class="exam.test01.Score">
  <constructor-arg>
    <bean class="exam.test01.final">
      ...
    </bean>
  </constructor-arg>
</bean>
~~~

<br>
### \<property\> tag

인스턴스를 선언할 때 프로퍼티 값을 설정할 수 있다.

~~~xml
<bean id="score" class="exam.test01.Score">
  <property name="name">
    <value>example</value>
  </property>
  <property name="value">
    <value>10</value>
  </property>
</bean>
~~~
위와 같이 정의하면 Score 클래스의 **setName(String name) / setValue(int value)** 가 호출된다.
[[ch08] 8.3 property usage.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/e422e93a27c53f54d09f1c959016662d62076fdb)

다음과 같이 **'p'** 네임스페이스를 사용하면, **p:** 로 시작하는 속성을 통해 프로퍼티를 설정할 수 있다.
~~~xml
<beans xmlns="http://www.springframework.org/schema/beans" ...
  xmlns:p="http://www.springframework.org/schema/p" ... >
  <bean id="score" class"exam.test01.Score" p:name="example" p:value="10" />
</beans>
~~~

<br>
### 의존 객체 주입

다음과 같이 Car 클래스가 의존하는 객체인 Engine 타입의 빈을 주입할려면 다음과 같이 설정한다.
~~~java
class Car {
  private String model;
  private Engine engine;
  ...
}

class Engine {
  ...
}
~~~
~~~xml
<bean id="car" class="exam.test.Car">
  <property name="model">
    <value>pride</value>
  </property>
  <property name="engine">
    <ref bean="engine1" />
  </property>
</bean>

<bean id="engine1" class="exam.test.Engine">
</bean>
~~~

* \<ref\> 태그를 이용하여 빈의 레퍼런스를 설정하면 해당 빈을 찾아 주입해줄 것이다.

[[ch08] 8.3 Use dependency Injection.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/45587907c0a1be3e8951446cee7e92bc10867115)
<br>
[[ch08] 8.3 Use dependency Injection with new bean.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/a992e733092c9e45ef5eb3130beeda44da7945be)

<br>
### 컬렉션 값 주입

<br>
#### Array, List, Set

~~~xml
<bean id="engine1" class="exam.test.Engine">
</bean>

<bean id="car" class="exam.test.Car">
  <property name="model">
    <value>pride</value>
  </property>
  <property name="engines">
    <list>
      <bean class="exam.test.Engine" />
      </bean>
      <ref bean ="engine1" />
    </list>
  </property>
  <property name="values">
    <list>
      <value>10</value>
      <value>20</value>
    </list>
  </property>
</bean>
~~~

* java.util.Set 타입도 같은 방식으로 설정할 수 있는데, 값을 넣을 때 기존에 등록된 객체와 같이 같은지 조사하여 같지 않을 경우에만 추가한다.

[[ch08] 8.3 Use dependency Injection with list.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/ff45f7cc518e218f16215f1d16290f02dcc58278)

<br>
#### Map, Properties

~~~xml
<!-- 다음과 같이 java.util.Properties 타입의 값을 설정 -->
<bean id="spareTire" class="exam.test.Tire">
  <property name="spec">
    <props>
      <prop key="width">205</prop>
      <prop key="ratio">65</prop>
    </props>
  </property>
</bean>

<!-- java.util.Map 타입의 값을 설정 -->
<bean id="car" class="exam.test.Car">
  <property name="options">
    <map>
      <entry key="airbag" value="dual" />
      <entry>
        <key> <value> sunroof </value> </key>
        <value> yes </value>
      </entry>
      <entry key="sparetire">
        <ref bean="spareTire" />
      </entry>
    </map>
  </property>
</bean>
~~~

[[ch08] 8.3 Use dependency Injection with map, props.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/2231eb927408c1d08d2e968a1037b689a642d28e)

<br>
### 팩토리 메서드와 팩토리 빈

팩토리 메소드 패턴을 이용하여 빈 생성을 하고자 할 때 다음과 같이 설정한다.
~~~java
public class TireFactory {
  public static Tire createTire(String make) {
    ...
  }
}
~~~
~~~xml
<bean id="hankookTire" class="exam.test.TireFactory" factory-method="createTire">
  <constructor-arg value="Hankook" />
</bean>
<bean id="kumhoTire" class="exam.test.TireFactory" factory-method="createTire">
  <constructor-arg value="Kumho" />
</bean>
~~~

* Spring에서 빈 생성을 담당하는 팩토리 메소드는 반드시 static 으로 선언해야 된다.
  * class 속성에 팩토리 클래스 이름을 지정한다.
  * **factory-method** 속성에는 반드시 static 메소드 이름을 지정한다.
  * **팩토리 메소드에 넘겨줄 매개변수 값은 \<constructor-arg\> 태그로 지정한다.**
  * **"hankookTire" 와 "kumhoTire" 라는 id로 등록된 객체는 TireFactory 객체가 아니라 Tire 객체이다.**

[[ch08] 8.3 Use factory method.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/3d1ba384b5c6c7912901891f5205ffc3527ebedc)

다음과 같이 팩토리 클래스의 객체를 만들고, 이 팩토리 객체로부터 인스턴스를 생성할 수도 있다.
~~~java
public class TireFactory {
  public Tire createTire(String make) {
    ...
  }
}
~~~
~~~xml
<bean id="tireFactory" class="exam.test.TireFactory" />
<bean id="hankookTire" factory-bean="tireFactory" factory-method="createTire">
  <constructor-arg value="Hankook" />
</bean>
<bean id="kumhoTire" factory-bean="tireFactory" factory-method="createTire">
  <constructor-arg value="Kumho" />
</bean>
~~~

* 팩토리 객체를 빈으로 생성하고, **factory-bean** 을 통해 해당 빈의 아이디를 지정한다.
  * class 속성은 지정하지 않는다.

[[ch08] 8.3 Use factory bean.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/5b1ffe205bdb2a98b1620a782f1c99c1a5e8062e)

<br>
### 스프링 규칙에 따른 팩토리 빈

Spring 에서는 팩토리 빈이라면 갖추어야 할 규칙을 **org.springframework.beans.factory.FactoryBean** 인터페이스에 정의하였다. 팩토리 클래스를 만들 때 이 인터페이스에 따라 메소드를 구현하면 된다.
[What's a FactoryBean?](factory-bean)

~~~java
public interface FactoryBean<T> {
  T getObject() throws Exception;
  Class<T> getObjectType();
  boolean isSingleton();
}
~~~

그런데 **FactoryBean** 인터페이스를 직접 구현하기보다는 Spring에서 제공하는 추상 클래스를 상속하는 것이 일반적이다.
**org.springframework.beans.factory.config.AbstractFactoryBean** 은 FactoryBean 인터페이스를 미리 구현하였다.

~~~java
public abstract class AbstractFactoryBean<T>
		implements FactoryBean<T>, BeanClassLoaderAware, BeanFactoryAware, InitializingBean, DisposableBean {
  ...
  @Override
  public abstract Class<?> getObjectType();
  protected abstract T createInstance() throws Exception;
  ...

}
~~~

이 클래스에는 **createInstance()** 라는 추상 메소드가 있다. 빈을 생성할 때 팩토리 메소드로써 **getObject()** 가 호출되는데, 이 메소드는 내부적으로 **createInstance()** 메소드를 호출한다.
* createInstance(): **AbstractFactoryBean** 클래스를 상속받을 때는 이 메소드에 빈 생성 코드를 구현해야한다.
* getObjectType(): 팩토리 메소드인 **getObject()** 가 생성하는 객체의 타입을 알려주는 역할을 하는데, 이 메소드도 구현해야 한다.

~~~java
public class TireFactory extends AbstractFactoryBean<Tire> {

	String maker;

	public void setMaker(String maker) {
		this.maker = maker;
	}

	@Override
	public Class<?> getObjectType() {
		return exam.test13.Tire.class;
	}

	protected Tire createInstance() {
		if (maker.equals("Hankook")) {
			return createHankookTire();
		} else {
			return createKumhoTire();
		}
	}
  ...
~~~

* 타입 매개변수 T에 생성할 빈의 인스턴스 타입을 지정한다.

~~~xml
<bean id="hankookTire" class="exam.test13.TireFactory">
    <property name="maker" value="Hankook" />
</bean>
~~~

* 팩토리 역할을 수행하는 메소드를 지정할 필요가 없다. Spring IoC 컨테이너는 FactoryBean 타입의 클래스일 경우, **이 클래스의 인스턴스를 직접 보관하는 것이 아니라 이 클래스가 생성한 빈을 컨테이너에 보관한다.**
  * TireFactory 객체를 보관하는 것이 아닌, 이 객체가 생성하는 Tire 객체를 "hankookTire" 라는 이름으로 컨테이너에 보관한다.

[[ch08] 8.3 Use AbstractFactoryBean.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/831f969ac509296d560c34ce01bae4f1779c211f)

<br>
## 빈의 범위 설정

Spring IoC 컨테이너는 빈 생성시, 기본으로 하나만 생성한다. 따라서 **getBean()** 메소드를 호출하면 계속 동일한 객체를 반환한다. 하지만 설정을 통해 이런 빈의 생성 방식을 조정할 수 있다.

| 범위 | 설명 |
| ---------- | ---------- |
| singleton | 오직 하나의 빈만 생성 (기본 설정) |
| prototype | getBean() 을 호출할 때마다 생성 |
| request | HTTP 요청이 발생할 때마다 생성, 웹 애플리케이션에서만 이 범위를 설정 가능 |
| session | HTTP 세션이 생성될 때마다 생성, 웹 애플리케이션에서만 이 범위를 설정 가능 |
| globalsession | 전역 세션이 준비될 때 빈을 생성. 웹 애플리케이션에서만 이 범위를 설정 가능, 포틀릿 컨텍스트에서 사용 |

<br>
### singleton / prototype

다음과 같이 scope 속성을 통해 빈 생성 방식을 prototype 형식으로 변경할 수 있다.
**kiaEngine** 이름의 빈을 getBean 메소드가 호출될 때마다 새로 생성할 것이다.
~~~xml
<bean id="hyundaiEngine" class="exam.test14.Engine">
    <property name="maker" value="Hyundai" />
    <property name="cc" value="1997" />
</bean>

<bean id="kiaEngine" class="exam.test14.Engine" scope="prototype">
    <property name="maker" value="Kia" />
    <property name="cc" value="3000" />
</bean>
~~~

[[ch08] 8.8 Setting bean scope.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/66f30d06aa5dfc7b191963dc2d3bb7a29c9b282b)

<br>
### Date 타입 주입

빈 설정 파일은 XML 이므로, 결국 프로퍼티의 값은 문자열로 표현하게 된다.
문자열은 숫자로 변환하기 쉽기 때문에, 숫자 타입의 프로퍼티일 경우 추가 작업없이 자동 변환해주는데에 비해 다른 타입에 대해서는 변환해주지 않는다.

여기서는 **java.util.Date** 타입의 프로퍼티 값을 설정한다.
**SimpleDateFormat** 클래스와 팩토리 메소드 방식을 통해 날짜 값을 설정한다.
~~~xml
<bean id="dateFormat" class="java.text.SimpleDateFormat" >
    <constructor-arg value="yyyy-MM-dd" />
</bean>

<bean id="hankookTire" class="exam.test15.Tire" >
    <property name="maker" value="Hankook" />
    <property name="createdDate">
        <bean factory-bean="dateFormat" factory-method="parse">
            <constructor-arg value="2014-5-5" />
        </bean>
    </property>
</bean>

<bean id="kumhoTire" class="exam.test15.Tire" >
    <property name="maker" value="Kumho" />
    <property name="createdDate">
        <bean factory-bean="dateFormat" factory-method="parse">
            <constructor-arg value="2014-1-14" />
        </bean>
    </property>
</bean>
</beans>
~~~

* constructor-arg 태그의 value는 Tire 클래스 생성자의 파라미터로 들어가는 것이 아니라, 팩토리 메소드로 설정한 SimpleDateFormat의 parse 메소드의 파라미터로 들어간다.

[[ch08] 8.9 Injection bean of java.util.Date.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/7fcc0817385c60e2d6a7b05de2da553971040008)

<br>
### 커스텀 프로퍼티 에디터

java.util.Date 값을 설정한 위의 방식은 날짜 프로퍼티 값을 설정할 때마다 팩토리 메소드 빈을 선언해야 한다는 것이다. 이런 불편한 점을 해소하기 위해, Spring IoC 컨테이너는 **프로퍼티 에디터** 를 도입하였다.

* 프로퍼티 에디터: 문자열을 특정 타입의 값으로 변환해주는 객체

Spring 에서는 java.util.Date 처럼 자주 사용하는 타입에 대해 몇 가지 프로퍼티 에디터를 제공한다.
* CustomDateEditor: 날짜 형식의 문자열을 java.util.Date 객체로 변환
* URLEditor: URL 형식의 문자열을 java.net.URL 객체로 변환
* 그외 프로퍼티 에디터는 **org.springframework.beans.propertyeditors** 패키지에 있다.

1. SimpleDateFormat 빈 생성
  문자열을 java.util.Date 객체를 생성해 줄 SimpleDateFormat 빈 생성
2. **CustomDateEditor** 빈 생성
  날짜 프로퍼티 값을 처리해주는 빈 생성, 생성자로 SimpleDateFormat 빈을 넘김
3. **CustomPropertyEditorRegistrar** 클래스 정의 및 빈 생성
  Spring IoC 컨테이너에 CustomDateEditor 를 설치하기 위해 에디터 등록기 정의가 필요
4. List 객체에 에디터 등록기 add
  최종적으로는 에디터 등록기 리스트를 넘겨줘야 한다.
5. **CustomEditorConfigurer** 객체에 리스트를 넘김
  이 객체는 프로퍼티 에디터 등록기를 싱행하여 IoC 컨테이너에 설치한다.

<br>
#### CustomPropertyEditorRegistrar 정의

다음과 같이 **PropertyEditorRegistrar** 를 구현한 CustomPropertyEditorRegistrar 클래스를 정의해야 한다.
이 클래스에는 IoC 컨테이너가 프로퍼티 에디터를 설치할 때 **registerCustomEditors** 메소드를 호출하는데, 에디터 등록기는 이 메서드를 구현해야 한다.
~~~java
public class CustomPropertyEditorRegistrar implements PropertyEditorRegistrar {

	private CustomDateEditor customDateEditor;

	public void setCustomDateEditor(CustomDateEditor customDateEditor) {
		this.customDateEditor = customDateEditor;
	}

	@Override
	public void registerCustomEditors(PropertyEditorRegistry registry) {
		registry.registerCustomEditor(java.util.Date.class, customDateEditor);
	}
}
~~~
위의 registerCustomEditors는 java.util.Date 타입에 대해 프로퍼티 에디터를 등록하는데, 이 java.util.Date 타입의 프로퍼티 값을 처리할 때 customDateEditor 가 사용된다.

#### xml 설정

다음과 같이 앞서 정의한 **CustomPropertyEditorRegistrar** 타입의 빈에 **CustomDateEditor** 빈을 주입하고, 이 빈을 **CustomEditorConfigurer** 에 리스트로 프로퍼티를 설정한다.
~~~xml
<bean id="dateFormat" class="java.text.SimpleDateFormat">
    <constructor-arg value="yyyy-MM-dd"/>
</bean>

<bean id="dateEditor" class="org.springframework.beans.propertyeditors.CustomDateEditor">
    <constructor-arg ref="dateFormat"/>
    <constructor-arg value="true"/>
</bean>

<bean id="customPropertyEditorRegistrar" class="exam.test16.CustomPropertyEditorRegistrar">
    <property name="customDateEditor" ref="dateEditor"/>
</bean>

<bean class="org.springframework.beans.factory.config.CustomEditorConfigurer">
    <property name="propertyEditorRegistrars">
        <list>
            <ref bean="customPropertyEditorRegistrar"/>
        </list>
    </property>
</bean>

<bean id="hankookTirme" class="exam.test15.Tire">
    <property name="aker" value="Hankook"/>
    <property name="createdDate" value="2014-5-5"/>
</bean>

<bean id="kumhoTire" class="exam.test15.Tire">
    <property name="maker" value="Kumho"/>
    <property name="createdDate" value="2014-1-14"/>
</bean>
~~~

[[ch08] 8.9 Use custom property editor.
](https://github.com/dhsim86/java_webdev_workbook_spring/commit/0372edf00055ac79432cf18ac27c1d74002efb60)

[factory-bean]: https://spring.io/blog/2011/08/09/what-s-a-factorybean
