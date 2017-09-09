---
layout: post
title:  "Toby's Spring Chap 06: AOP"
date:   2017-09-07
desc: "Toby's Spring Chap 06: AOP"
keywords: "spring, spring boot"
categories: [Web]
tags: [spring, spring boot]
icon: icon-html
---

## 트랜잭션 코드의 분리

다음과 같이 비즈니스 로직을 담고 있는 코드에서 트랜잭션 경계설정을 담당하는 코드가 포함되어 있다.

~~~java
public void upgradeLevels() throws Exception {

  TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());

  try {
    upgradeLevelsInternal();
    transactionManager.commit(status);

  } catch (Exception e) {
    transactionManager.rollback(status);
    throw e;

  }
}

private void upgradeLevelsInternal() {

  List<User> userList = userDao.getAll();

  for (User user : userList) {

    if (canUpgradeLevel(user) == true) {
      upgradeLevel(user);
    }
  }
}
~~~

위 코드을 봤을 때, 트랜잭션 경계설정 코드와 비즈니스 로직 코드가 서로 주고받는 정보가 없이 깔끔하게 분리되어 있다. 비즈니스 로직 코드에서 직접 DB를 다루지 않으므로, DB Connection 직접 참조같은 것을 하지 않기 때문이다. (트랜잭션 동기화 방법을 통해서)

다만 아직도 이 클래스에는 비즈니스 로직과는 관계가 없는, 그러나 트랜잭션을 위한 코드가 들어있다.

<br>
### DI 적용을 통한 트랜잭션 분리

보통 DI를 통해 인터페이스를 활용한 의존 오브젝트 주입은 구현 클래스를 바꿔가면서 쓰기 위함이다. 하지만 꼭 그 목적을 위해서만 DI를 쓸 필요는 없으며 다음과 같이 관심이 다른 코드를 분리하기 위해 DI를 사용할 수 있다.

<br>
![00.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/00.png)

트랜잭션 경계 설정만을 담당하는 또 다른 클래스인 **"UserServiceTx"** 를 만들고, 여기서 트랜잭션 경계설정만을 담당한 후 실제 비즈니스 로직을 담당하는 **"UserServiceImpl"** 에 실제 작업을 위임시키는 것이다.

결국 UserService 인터페이스를 갖고 사용하는 클라이언트 측에서는 트랜잭션이 적용된 비즈니스 로직의 구현이라는 기대하는 동작이 일어날 것이다.

<br>
![01.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/01.png)

[Separate transaction code using DI](https://github.com/dhsim86/tobys_spring_study/commit/c05f7741dd1febfb9bb7d6f101de0ed6d0c3b501)

이렇게 DI를 활용하여 비즈니스 로직을 분리함으로써, 비즈니스 로직만을 담은 코드를 작성할 때 트랜잭션과 같은 기술적인 내용에는 신경쓰지 않아도 된다. 또한 비즈니스 로직에 대한 테스트를 쉽게 만들 수 있다는 것이다.

<br>
## 고립된 단위 테스트

가장 편하고 좋은 테스트 방법은 가능한 작은 단위로 쪼개서 테스트하는 것이다. 테스트가 실패했을 때 그 원인을 찾기가 쉽고 테스트의 대상이 커지면 충분한 테스트를 만들기도 쉽지 않기 때문이다.

그러나 테스트 대상이 다른 오브젝트와 환경에 의존하고 있다면 작은 단위의 테스트가 주는 장점을 얻기 힘들다.

<br>
### 복잡한 의존관계 속의 테스트

다음과 같이 **"UserService"** 클래스는 여러 의존 오브젝트가 있다.

<br>
![02.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/02.png)

UserService 테스트의 단위는 UserService 클래스여야 하는데, 위와 같이 의존 오브젝트들이 여러 개 있다면 테스트 준비하기가 힘들고 환경이 조금이라도 달라지면 테스트가 실패할 수 있다. 하고자 하는 테스트는 UserService가 가지고 있는 비즈니스 로직인데 DB 연결이 제대로 안되거나 트랜잭션 서비스가 제대로 수행되지 않으면, UserService 를 목적으로 하는 테스트가 실패할 수 있다는 것이다.

따라서 다음과 같이 테스트의 대상이 환경이나 외부 서버, 다른 클래스의 코드에 의해 종속되고 영향을 받지 않도록 **고립시킬 필요가 있다.** 테스트 대역을 사용하여, 테스트 대상이 의존하는 오브젝트로부터 분리해서 테스트하는 것이다.

<br>
![03.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/03.png)

<br>
### 단위 테스트와 통합 테스트

단위 테스트의 단위는 정하기 나름이다. 사용자 관리라는 기능 전체를 하나의 단위로 볼 수도 있고, 하나의 클래스나 하나의 메소드를 단위로 볼 수도 있다. 보통은 다음과 같이 정의한다.

* 단위 테스트: 테스트 대상을 의존하는 오브젝트 대신 목 오브젝트 사용하거나 외부의 환경에 영향받지 않도록 고립시켜서 하는 테스트
* 통합 테스트: 두 개 이상의 성격이나 계층이 다른 오브젝트가 연동하도록 만들어 테스트하거나, 외부의 DB나 환경에 의존하는 테스트
  * 스프링의 테스트 컨텍스트 프레임워크를 이용하여, 컨텍스트에서 생성되고 DI된 오브젝트를 테스트하는 것도 통합 테스트이다.

* 테스트 가이드라인
  * 항상 단위 테스트를 먼저 고려한다.
  * 단위 테스트 수행시, 항상 외부와의 의존관계를 차단하고 필요에 따라 목 오브젝트나 스텁을 사용하여 테스트 대역을 이용하도록 만든다.
  * 외부 리소스에 의존하는 테스트는 통합 테스트로 만든다.
    * 여러 개의 단위가 의존관계를 가지고 동작할 때를 위한 통합 테스트는 필요하다.
    * 스프링의 테스트 컨텍스트 프레임워크를 이용하는 테스트도 통합 테스트이다.
  * DAO는 그 자체로 비즈니스 로직을 담고 있다기 보다는 DB를 통해 로직을 수행하는 인터페이스와 같은 역할을 한다. 고립된 테스트를 만들기가 어려우며, 만든다해도 가치가 없는 것이 대부분이다. 따라서 DAO는 DB까지 연동하는 테스트로 만드는 편이 효과적이다.
    * DAO 테스트는 DB라는 외부 리소스를 사용하므로, 통합 테스트로 분류된다. DAO를 테스트를 통해 충분히 검증하면, DAO를 이용하는 코드는 DAO 역할을 하는 오브젝트를 목 오브젝트나 스텁으로 대체하여 단위 테스트를 수행할 수 있다.

---

테스트는 코드가 작성되고 빠르게 진행되는 편이 좋다. 테스트를 코드가 작성된 후에 만드는 경우에도 가능한 빨리 작성하도록 해야 한다. 테스트하기 편하게 만들어진 코드는 깔끔하고 좋은 코드가 될 가능성이 높다. 스프링이 지지하고 권장하는, 깔끔하고 유연한 코드를 만들다보면 테스트도 그만큼 만들기 쉬워지고, 테스트는 다시 코드의 품질을 높여준다.

<br>
### 목 프레임워크

단위 테스트시에 필요한 목 오브젝트나 스텁을 쉽게 만들 수 있도록 도와주는, **Mockito** 와 같은 목 오브젝트 지원 프레임워크가 있다.

Mockito와 같이 목 프레임워크의 특징은 의존 오브젝트를 대신하는 목 오브젝트를 일일이 준비해둘 필요가 없다는 것이다. 간단한 메소드 호출만으로도, 다음과 같이 테스트용 목 오브젝트를 만들 수 있다.

~~~java
UserDao mockUserDao = mock(UserDao.class);
when(mockUserDao.getAll()).thenReturn(userList);
~~~

<br>
## 다이내믹 프록시와 팩토리 빈

<br>
### 프록시와 프록시 패턴, 데코레이터 패턴

트랜잭션 경계설정과 같은 비즈니스 로직이 아닌 코드는 전략 패턴을 통해 비즈니스 로직을 담은 클래스 외부로 빼낼 수가 있다.

<br>
![04.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/04.png)

위와 같은 분리된 **"부가기능"** 을 담은 클래스는 부가기능 외의 나머지 모든 기능은 원래 비즈니스 로직을 담은, 핵심 기능을 가진 클래스로 위임한다는 것이다. 비즈니스 로직을 담은 **"핵심기능"** 을 담당하는 클래스는 부가기능을 가진 클래스의 존재 자체를 모른다. 따라서 부가기능이 핵심기능을 사용하는 구조이다.

그런데 클라이언트에서 핵심기능을 가진 클래스를 직접 사용할 때, 부가기능이 적용될 기회가 없다는 점이다. 따라서 부가기능을 가진 클래스는 마차 자신이 핵심기능을 가진 클래스인 것처럼 꾸며서 **자신을 거쳐서 핵심기능을 사용하도록 해야한다.**

이를 위해 클라이언트는 **인터페이스를 통해서만 핵심기능을 사용** 하게하고, 부가기능 자신도 **같은 인터페이스를 구현** 한 뒤에, 자신이 그 사이에 끼어들어야 한다.

<br>
![05.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/05.png)

위와 같이 적용되었을 때, 자신이 가진 부가적인 기능을 적용해줄 수 있다. 비즈니스 로직 코드에서 트랜잭션 기능을 부여해주는 것이 바로 그런 대표적인 경우이다.

> 이렇게 마치 자신이 클라이언트가 사용하려는 실제 대상인 것처럼 위장해서 클라이언트의 요청을 받아주는 것을 **프록시(Proxy)** 라고 하며, 프록시를 통해 최종적으로 요청을 받아 처리하는 실제 오브젝트를 **타깃** 또는 **실체** 라고 한다.

<br>
![06.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/06.png)

프록시의 특징은 **타깃과 같은 인터페이스를 구현했다는 것과 타깃을 제어할 수 있는 위치에 있다는 것이다.** 프록시의 사용 목적은 클라이언트가 타깃에 접근하는 방법을 제어하는 것과, 타깃에 부가적인 기능을 부여해주기 위해서이다.

<br>
### 데코레이터 패턴

타깃에 **부가적인 기능을 런타임시에 다이내믹하게 부여해주기 위하여, 프록시를 사용하는 패턴이다.** 즉 코드 상에서는 어떤 방법과 순서로 프록시와 타깃이 연결되어 있는지 나타나지 않는다. 부가적인 기능을 담당하는 데코레이터는 여러 개 있을 수 있다.

<br>
![07.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/07.png)

프록시로서 동작하는 각 데코레이터들은 자신이 위임하는 대상에도 인터페이스로 접근하므로, 최종 타깃으로 위임하는 것인지 다음 단계의 데코레이터 프록시로 위임하는지 알지 못한다.

> Java의 InputStream과 OutputStream 구현 클래스는 데코레이터 패턴이 사용된 대표적인 예이다.

스프링에서는 다음과 같이 데코레이터의 정의와 런타임 시의 구성 방법을 DI를 통해 쉽게 데코레이터 패턴을 적용할 수 있다.
~~~xml
<!-- Decorator -->
<bean id="userService" class="org.service.UserServiceTx">
  <property name="transactionManager" ref="transactionManager" />
  <property name="userService" ref="userServiceImpl" />
</bean>

<!-- Target -->
<bean id="userServiceImpl" class="org.service.UserServiceImpl" />
  <property name="userDao" ref="userDao" />
</bean>
~~~

위와 같이 코드 레벨에서 데코레이터와 타깃 간의 연결은 나타내지 않고, 다이내믹하게 연결을 할 수 있다. **데코레이터 패턴은 타깃의 코드를 손대지 않고, 클라이언트가 호출하는 방법도 변경하지 않은 채로 새로운 기능을 추가할 때 유용한 방법이다.**

<br>
### 프록시 패턴

* 프록시: 클라이언트와 타깃 사이에 대리 역할을 맡은 오브젝트를 총칭
* 프록시 패턴: 프록시를 사용하는 방법 중, **타깃에 대한 접근방법을 제어하려는 목적** 을 가진 경우

프록시 패턴의 프록시는 **타깃의 기능을 추가하거나 확장하지 않는다.** 대신 클라이언트가 **타깃에 접근하는 방식을 변경해준다.**

예를 들어 타깃 오브젝트가 생성하기가 복잡하거나 당장 필요하지 않은 경우, 필요한 시점까지 생성하지 않고 레퍼런스가 필요한 클라이언트 쪽에서는 프록시를 넘겨줄 수 있다. 프록시의 메소드를 통해 실제 호출하였을 때, 그 시점에 타깃 오브젝트를 생성하고 위임해주는 것이다.

---

**접근 권한을 제어** 하기 위해 프록시 패턴을 사용할 수도 있다. 특정 계층에서 타깃 오브젝트가 읽기 전용으로 강제해야된다고 했을 때, 프록시를 사용하여 데이터 변경을 유발하는 메소드는 예외를 던지게 할 수도 있다. (ex: Collections의 unmodifiableCollection())

프록시 패턴은 타깃의 기능 자체에는 관여하지 않으면서 **접근하는 방법을 제어해주는 프록시를 이용하는 것이다.**

> 프록시는 코드에서 자신이 만들거나 접근할 타깃 클래스 정보를 알고 있는 경우가 많다. 생성을 지연시키는 프록시라면 타깃에 대한 구체적인 생성 방법을 알아야 하기 때문이다. 물론 프록시 패턴을 사용하는 경우라도 인터페이스를 통해 위임하게 만들 수도 있다.

<br>
### 다이내믹 프록시

프록시는 기존 코드에 영향을 주지 않으면서 **기능을 확장하거나 접근 방법을 제어할 수 있는 유용한 방법이다.** 그러나 매번 새로운 클래스를 정의하고 인터페이스로부터 구현할 메소드가 많으면 번거롭기 때문에, **자바의 리플렉션을 통해 쉽게 프록시를 만든다.**

* 프록시 작성의 문제점
  * 타깃의 인터페이스를 구현하고 위임하는 코드를 작성하기가 번거롭다. 타깃의 메소드가 추가되거나 변경되면 함께 수정해야 한다.
  * 부가기능 코드가 중복될 가능성이 높다. 보통 부가기능은 일반적인 코드가 많아 여러 곳에서 쓰일 수 있다.

다이내믹 프록시는 **리플렉션** 기능을 활용하여 프록시로 만드는 것이다.

[Reflection Sample Test](https://github.com/dhsim86/tobys_spring_study/commit/cefecb7cb20e1d65d85904000c1fa34e9a1a42c8)

---

다이내믹 프록시가 동작하는 방식은 다음과 같다.

<br>
![08.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/08.png)

다이내믹 프록시는 **프록시 팩토리에 의해** 런타임시 다이내믹하게 만들어진다. 이 프록시는 타깃의 **인터페이스와 같은 타입** 으로 만들어지며 클라이언트는 이 프록시 오브젝트를 타깃 인터페이스를 통해 사용할 수 있다. 따라서 프록시 생성시 인터페이스를 모두 구현할 필요가 없고 프록시 팩토리에게 인터페이스 정보만 알려주면 된다.

다이내믹 프록시가 인터페이스 구현 클래스의 오브젝트로 만들어지긴 하지만, 필요한 부가기능 코드는 직접 작성해야 한다. 부가기능은 프록시와 독립적인 **InvocationHandler** 를 구현한 오브젝트에 담는다. InvocationHandler 인터페이스는 다음과 같이 메소드 하나만 가진 간단한 인터페이스이다.

~~~java
public Object invoke(Object proxy, Method method, Object[] args);
~~~

위의 invoke 메소드는 Method 인터페이스 및 메소드를 호출할 때 전달되는 파라미터인 args를 받는다. 다이내믹 프록시 오브젝트는 클라이언트의 **모든 요청을 리플렉션 정보로 변환하여 InvocationHandler 구현 오브젝트의 invoke 메소드로 넘긴다.**
InvocationHandler 인터페이스 구현체에서는 Method 인터페이스 구현체 및 args를 통해 실제 타깃 오브젝트의 메소드를 호출할 수 있다. 중복되는 부가적인 기능을 InvocationHandler 인터페이스의 구현체를 통해 쉽게 작성할 수 있다.

<br>
![09.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/09.png)

~~~java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class UppercaseHandler implements InvocationHandler {

  private Hello target;

  public UppercaseHandler(Hello target) {
    this.target = target;
  }

  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    // 만약 타깃 메소드에 대한 예외발생시 여기에서는 "InvocationTagetException" 으로 잡아야 한다.
    // 타깃 오브젝트에서 발생하는 예외가 "InvocationTagetException" 으로 한 번 포장되서 전달된다.
    String ret = (String)method.invoke(target, args);
    return ret.toUpperCase();
  }
}


Hello proxyHello = (Hello)Proxy.newProxyInstance(getClass().getClassLoader(), //다이내믹 프록시 클래스의 로딩에 사용할 클래스 로더
                        new Class[] { Hello.class }, // 구현할 인터페이스, 다이내믹 프록시는 하나이상의 인터페이스를 구현할 수 있다.
                        new UppercaseHandler(new HelloTarget())); // 부가기능과 위임코드를 담은 InvocationHandler
~~~

위의 코드와 같이 리플렉션 API를 활용하여 타깃 오브젝트의 메소드를 호출한다.

[Dynamic Proxy](https://github.com/dhsim86/tobys_spring_study/commit/bc3b6cdef9263cae1f610c873cd31d8e1200f906)

[UserServiceTx using Dynamic Proxy](https://github.com/dhsim86/tobys_spring_study/commit/249bba7411386d4fcfeb92325f7f21f655bde355)

<br>
### 다이내믹 프록시를 위한 팩토리 빈

다이내믹 프록시 오브젝트는 일반적인 스프링의 빈으로 등록할 방법이 없다. 스프링 빈은 기본적으로 **미리 정의된 클래스 이름과 프로퍼티를 가지고 해당 클래스의 오브젝트를 생성한다.**

다음과 같이 클래스 이름을 가지고 리플렉션을 이용하여 파라미터가 없는 디폴트 생성자를 호출하고 오브젝트를 생성한다.

~~~java
Date now = (Date)Class.forName("java.util.Date").newInstance();
~~~

다이내믹 프록시 오브젝트는 이런 식으로 생성되지 않는다. 다이내믹 프록시 클래스는 **내부적으로 다이내믹하게 새로 정의해서 사용되기 때문에 사전에 애플리케이션 컨텍스트를 이용하여 스프링 빈으로 정의할 방법이 없다.** 다이내믹 프록시 오브젝트는 **Proxy.newProxyInstance()** 를 통해서만 만들 수 있다.

---

스프링은 미리 정의된 클래스 정보를 가지고 디폴트 생성자를 통해 오브젝트를 만드는 방법 외에, 빈을 만들 수 있는 여러가지 방법을 제공하는데 그 중에 하나가 **팩토리 빈** 을 이용한 빈 생성 방법을 들 수 있다.

* 팩토리 빈: 스프링을 대신해서 오브젝트의 생성 로직을 담당하도록 만들어진 특별한 빈

팩토리 빈을 만드는 방법은 여러가지가 있는데 다음과 같은 **FactoryBean** 인터페이스를 구현하는 것이다.

~~~java
public interface FactoryBean<T> {
  T getObject() throws Exception; // 빈 오브젝트를 생성해서 리턴
  Class<? extends T> getObjectType(); // 생성되는 오브젝트의 타입을 리턴
  boolean isSingleton(); // getObject가 리턴하는 오브젝트가 싱글톤 오브젝트인지를 알려준다.
}
~~~

위의 인터페이스를 구현한 클래스를 스프링 빈으로 등록하면 팩토리 빈으로서 동작한다. 스프링 빈으로 등록하기가 힘든 클래스에 대해서는 다음과 같이 FactoryBean을 활용하여 빈으로 사용될 오브젝트를 생성할 수 있다.

~~~java
import org.springframework.beans.factory.FactoryBean;

public class MessageFactoryBean implements FactoryBean<Message> {

  private String text;

  // 오브젝트 생성시 필요한 정보를 팩토리 빈의 프로퍼티로 설정하여 DI 받을 수 있도록 한다.
  // 주입된 정보는 실제 사용하고자 하는 클래스의 오브젝트를 생성할 때 사용한다.
  public void setText(String text) {
    this.text = text;
  }

  // 실제 빈으로 사용될 오브젝트를 직접 생성한다. 코드를 이용하므로 복잡한 초기화 방식을 가진 오브젝트도 생성할 수 있다.
  public Message getObject() throws Exception {
    return Message.newMessage(this.text);
  }

  // 빈으로 사용되는 오브젝트의 타입을 리턴한다.
  public Class<? extends Message> getObjectType() {
    return Message.class;
  }

  // getObject 메소드가 돌려주는 오브젝트가 싱글톤인지 알려준다.
  public boolean isSingleton() {
    return false;
  }
}
~~~

~~~xml
<bean id="message" class="ch06.springbook.factorybean.MessageFactoryBean">
    <property name="text" value="Factory Bean" />
</bean>
~~~

~~~java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "/applicationContext.xml")
public class FactoryBeanTest {

  @Autowired
  private ApplicationContext applicationContext;

  @Test
  public void getMessageFromFactoryBeanTest() {
    Object message = applicationContext.getBean("message"); // "message" 라는 이름의 빈의 타입이 Message.class 이다.
    assertThat(Message.class.isInstance(message), is(true));
    assertThat(((Message)message).getText(), is("Factory Bean"));
  }

  @Test
  public void getFactoryBeanTest() {
    Object factory = applicationContext.getBean("&message"); // &을 붙이면 팩토리 빈이 리턴된다.
    assertThat(MessageFactoryBean.class.isInstance(factory), is(true));
  }
}
~~~

위와 같이 FactoryBean을 구현한 클래스가 빈의 클래스로 지정되면, 팩토리 빈 클래스의 오브젝트의 **getObject** 메소드를 통해 오브젝트를 가져오고 이를 빈 오브젝트로 사용한다.

> 스프링은 Private 생성자를 가진 클래스도 빈으로 등록하면 리플렉션을 통해 오브젝트를 만들어주기는 한다. 그러나 Private 생성자를 가진 클래스를 빈으로 등록하는 일은 권장되지 않으며 바르게 동작하지 않을 수 있다. 따라서 이 팩토리 빈을 활용하여 빈으로 등록하는 것이다.

[FactoryBean example](https://github.com/dhsim86/tobys_spring_study/commit/6fdfcdbbecf51152b064a6a648babd5ed6feab43)

---

미리 클래스가 정의되지 않아서 일반적인 방법으로는 스프링 빈으로 등록할 수 없는 다이내믹 프록시 오브젝트를 팩토리 빈을 사용하면 스프링 빈으로 만들어줄 수 있다. 팩토리 빈의 **getObject** 메소드에 다이내믹 프록시 오브젝트를 만들어주는 코드를 넣으면 된다.

<br>
![10.png](/static/assets/img/blog/web/2017-09-07-toby_spring_06_aop/10.png)

[Dynamic Proxy using FactoryBean](https://github.com/dhsim86/tobys_spring_study/commit/fce3afd31a8c495d5ec4ee88c521bbfa82601332)
