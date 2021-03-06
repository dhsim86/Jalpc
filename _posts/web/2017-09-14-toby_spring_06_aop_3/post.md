---
layout: post
title:  "Toby's Spring Chap 06: AOP part.3"
date:   2017-09-14
desc: "Toby's Spring Chap 06: AOP part.3"
keywords: "spring, toby spring, aop, transaction"
categories: [Web]
tags: [spring]
icon: icon-html
---

## 트랜잭션 속성

코드로 트랜잭션 경계설정을 작성할 때 보통 다음과 같이 작성된다.

~~~java
public Object invoke(MethodInvocation invocation) throws Throwable {

  TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());

  try {

    Object ret = invocation.proceed();
    transactionManager.commit(status);
    return ret;

  } catch (RuntimeException e) {
    transactionManager.rollback(status);
    throw e;
  }
}
~~~

위 코드에서 **DefaultTransactionDefinition** 은 **TransactionDefinition** 인터페이스를 구현하는 객체로 **트랜잭션의 동작방식에 영향을 주는 네 가지 속성을 정의한다.**

~~~java
public interface TransactionDefinition {
    int PROPAGATION_REQUIRED = 0;
    int PROPAGATION_SUPPORTS = 1;
    int PROPAGATION_MANDATORY = 2;
    int PROPAGATION_REQUIRES_NEW = 3;
    int PROPAGATION_NOT_SUPPORTED = 4;
    int PROPAGATION_NEVER = 5;
    int PROPAGATION_NESTED = 6;
    int ISOLATION_DEFAULT = -1;
    int ISOLATION_READ_UNCOMMITTED = 1;
    int ISOLATION_READ_COMMITTED = 2;
    int ISOLATION_REPEATABLE_READ = 4;
    int ISOLATION_SERIALIZABLE = 8;
    int TIMEOUT_DEFAULT = -1;

    int getPropagationBehavior();
    int getIsolationLevel();
    int getTimeout();
    boolean isReadOnly();
    String getName();
}
~~~

<br>
### 트랜잭션 전파 (Transaction Propagation)

트랜잭션 전파란 트랜잭션의 경계에서 **이미 진행 중인 트랜잭션이 있을 때, 또는 없을 때 어떻게 동작할 것인가 결정하는 방식을 말한다.**

<br>
![00.png](/static/assets/img/blog/web/2017-09-14-toby_spring_06_aop_3/00.png)

위와 같이 각각 독립적인 2개의 트랜잭션이 있을 때, B 트랜잭션의 동작 방식을 결정할 수 있다.

B 트랜잭션이 A 트랜잭션에 참여시킬 경우, (2)에서 예외가 발생했을 때 B 트랜잭션 내용도 롤백시킬 수 있다.
반면에 B 트랜잭션을 A 트랜잭션에 독립적인 트랜잭션으로 만들 경우, A 트랜잭션은 B 트랜잭션 상황에 무관하게 진행될 수도 있다. 즉, B의 트랜잭션 경계를 빠져나오면 A 트랜잭션과는 무관하게 커밋되거나 롤백될 수 있다. 반대로 (2)에서 예외가 발생하더라도 B 트랜잭션의 결과는 영향을 받지 않는다.

대표적으로 다음과 같은 트랜잭션 전파 속성이 있다.

---
**PROPAGATION_REQUIRED**

가장 많이 사용되는 트랜잭션 속성으로, **진행 중인 트랜잭션이 없다면 새로 시작하고 이미 시작된 트랜잭션이 있다면 이에 참여한다.**

---
**PROPAGATION_REQUIRES_NEW**

항상 새로운 트랜잭션을 시작한다. 즉 트랜잭션이 있든 없든 항상 독립적인 트랜잭션을 만든다.

---
**PROPAGATION_NOT_SUPPORTED**

이 속성을 사용하면 트랜잭션 없이 동작한다. 진행 중인 트랜잭션이 있어도 무시한다.

보통 트랜잭션 경계설정할 때 AOP를 통해 한 번에 많은 메소드에 동시 적용하는 방법을 사용하는데 그 중 한 두개의 메소드만 제외하고 싶을 수 있다. 포인트컷을 잘 만들어 그 메소드들만 적용안하게 할 수도 있지만, 이 속성을 그 메소드에 적용해서 포인트컷을 간결하게 할 수도 있다.

---

따라서 트랜잭션 매니저를 통해 트랜잭션을 시작할 때 다음 코드와 같이 **getTransaction** 이라는 이름의 메소드를 사용하는 이유는 트랜잭션 전파속성때문이다.

~~~java
TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
~~~

**getTransaction** 메소드는 트랜잭션 전파 속성에 따라 새로운 트랜잭션을 시작할 수도 있고, 이미 진행 중인 트랜잭션에 참여만 할 수도 있다. 진행 중인 트랜잭션에 참여하는 경우, 트랜잭션 경계 끝에서 트랜잭션을 커밋하지도 않는다.

<br>
### 격리수준 (Isolation Level)

모든 DB 트랜잭션은 격리수준을 가져야 한다. 서버 환경에서는 여러 개의 트랜잭션이 동시에 진행될 수 있는데 모든 트랜잭션이 순차적으로 진행되어 서로 독립적인 것이 좋겠지만 그러면 성능이 크게 떨어진다. **적절하게 격리수준을 조정하여 가능한 많은 트랜잭션을 동시에 수행하면서도 문제가 발생하지 않도록 제어가 필요하다.**

격리수준은 기본적으로 DB에 설정되어 있으나, JDBC 드라이버나 DataSource 등에서 재설정 가능하고 필요에 따라 트랜잭션 단위로 격리수준을 조정할 수 있다. **DefaultTransactionDefinition** 의 기본 격리수준은 **ISOLATION_DEFAULT** 이다. 이는 DataSource에 설정된 디폴트 격리수준을 그대로 따른다는 것이다. 특별한 작업을 수행하는 메소드의 경우에는 독자적인 격리수준을 지정할 필요가 있다.

<br>
### 제한시간

트랜잭션을 수행하는데 제한시간을 설정할 수 있다. **DefaultTransactionDefinition** 의 기본설정은 제한시간이 없다. 독립적인 트랜잭션을 직접 시작할 수 있는 **PROPAGATION_REQUIRED** 나 **PROPAGATION_REQUIRES_NEW** 와 함께 사용해야만 의미가 있다.

<br>
### 읽기전용

트랜잭션 내에서 데이터를 조작하는 시도를 막는다. 또한 데이터 엑세스 기술에 따라 성능이 향상될 수도 있다.

> 제한시간(timeout) 및 읽기전용(readOnly) 속성은 트랜잭션이 처음 시작할 때가 아니라면 적용되지 않는다. 즉 트랜잭션에 참여할 때, 참여하는 트랜잭션 속성과 충돌하지 않는다.

<br>
## TransactionInterceptor

다음과 같은 어드바이스와 같이 트랜잭션 경계설정 부가기능을 사용할 때, 트랜잭션 속성을 바꾸면 이 어드바이스를 사용하는 모든 트랜잭션의 속성이 일괄적으로 바뀐다.

~~~java
public class TransactionAdvice implements MethodInterceptor {
  private PlatformTransactionManager transactionManager;

  public void setTransactionManager(PlatformTransactionManager transactionManager) {
    this.transactionManager = transactionManager;
  }

  public Object invoke(MethodInvocation invocation) throws Throwable {

    TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());

    try {
      Object ret = invocation.proceed();
      transactionManager.commit(status);
      return ret;
    } catch (RuntimeException e) {
      transactionManager.rollback(status);
      throw e;
    }
  }
}
~~~

구현하기에 따라선, 메소드마다 다른 트랜잭션 속성을 부여하고 싶을 수 있다. 메소드별로 다른 트랜잭션 속성을 적용하려면 어드바이스의 기능을 확장해야 한다. 스프링의 **TransactionInterceptor** 를 사용하면 메소드 이름 패턴에 따라 트랜잭션 속성을 다르게 적용시킬 수 있다.

**TransactionInterceptor 는 트랜잭션 속성 정의를 메소드 이름 패턴을 이용해서 다르게 지정할 수 있는 방법을 추가적으로 제공한다.** 다음과 같이 xml에 적용한다.

~~~xml
<bean id="transactionAdvice" class="org.springframework.transaction.interceptor.TransactionInterceptor">
    <property name="transactionManager" ref="transactionManager" />
    <property name="transactionAttributes">
        <props>
            <prop key="get*">PROPAGATION_REQUIRED,readOnly,timeout_30</prop>
            <prop key="upgrade*">PROPAGATION_REQUIRES_NEW,ISOLATION_SERIALIZABLE</prop>
            <prop key="*">PROPAGATION_REQUIRED</prop>
        </props>
    </property>
</bean>
~~~

xml에서 트랜잭션 속성을 정의할 때 **메소드 이름 패턴을 키로 잡고, 문자열로써 트랜잭션 속성을 정의하면 된다.**

> 메소드 이름이 하나 이상의 패턴과 일치할 때는, 등록된 이름 패턴 중에서 가장 정확히 일치하는 것이 적용된다.

**PROPAGATION_NAME, ISOLATION_NAME, readOnly, timeout_NNNN, -Exception1, +Exception2**

* PROPAGATION_NAME: 트랜잭션 전파 방식, PROPAGATION_ 으로 시작한다.
* ISOLATION_NAME: 격리 수준, ISOLATION_ 으로 시작한다.
* readOnly: 읽기 전용 설정
* timeout_NNNN: timeout_ 으로 시작한다.
* -Exception1: 롤백 대상으로 추가할 것을 **"-"** 로 붙인다.
* +Exception2: **"+"** 를 통해 해당 예외에 대해서도 롤백하지 않고 커밋시키게 할 수 있다.

이 속성들중 트랜잭션 전파 항목만 필수사항이고 나머지는 모두 생략가능하며 순서는 바뀌어도 상관없다.

위 xml 설정과 같이 트랜잭션 매니저를 설정하는 것 외에 **transactionAttributes** 프로퍼티를 통해 각 메소드 패턴별로 적용할 트랜잭션 속성을 정의할 수 있다.

---
**rollbackOn**

transactionAttributes 프로퍼티는 **TransactionAttribute** 인터페이스를 구현한 클래스의 오브젝트로 트랜잭션 네 가지 속성 말고도 **어떤 예외가 발생하면 롤백을 할 것인가를 결정하는 메소드를 추가적으로 가지고 있다.** 이 프로퍼티를 통해 트랜잭션 부가기능의 모든 동작방식을 제어할 수 있다.

~~~java
public interface TransactionAttribute extends TransactionDefinition {
    String getQualifier();
    boolean rollbackOn(Throwable var1);
}
~~~

스프링이 제공하는 **TransactionInterceptor** 는 기본적으로 두 가지 종류의 예외처리 방식이 있는데, **RuntimeException** 에 대해서는 트랜잭션을 롤백시키고, **Checked 예외를 던질 경우 이 것을 예외상황으로 받아들이지 않고 비즈니스 로직에 따른 리턴 방식의 한 가지로 인식하여 트랜잭션을 커밋시킨다.**

**이는 비즈니스적인 의미가 있는 예외상황이고 복구가능한 예외상황에서만 Checked 예외를 사용하고, 복구 불가능한 수준의 예외는 RuntimeException으로 포장해서 전달하는 방식을 따른다고 가정하기 때문이다.**

그런데 이런 기본 예외처리 원칙을 따르지 않을 경우에는 **rollbackOn** 메소드를 통해 기본 원칙과는 다른 예외처리가 가능하게 해준다. 즉, 이 것을 활용하여 특정 Checked 예외에 대해서 롤백시키고, 특정 런타임 예외에 대해서는 트랜잭션을 커밋시킬 수도 있다.

---

TransactionInterceptor는 TransactionAttribute를 **Properties 라는 일종의 맵 타입 오브젝트로 전달받는다.**
즉 다음과 같이 setter 가 정의되어 있다.

~~~java
public void setTransactionAttributes(Properties transactionAttributes) {
    NameMatchTransactionAttributeSource tas = new NameMatchTransactionAttributeSource();
    tas.setProperties(transactionAttributes);
    this.transactionAttributeSource = tas;
}
~~~

[Use TransactionInterceptor](https://github.com/dhsim86/tobys_spring_study/commit/5ee66c82588cba009b74a3a6daaaf9d4c9fd1fb2)

<br>
### tx 네임스페이스를 통한 등록

**TransactionInterceptor** 및 **TransactionAttribute** 타입의 속성 정보도 **tx 스키마 전용 태그** 를 이용해 정의가능하다.

~~~xml
<beans ...
  xmlns:tx="http://www.springframework.org/schema/tx"
  xsi:schemaLocation="...
  http://www.springframework.org/schema/tx
  http://www.springframework.org/schema/tx/spring-tx-4.3.xsd">

...

<!-- advice 태그에 의해, TransactionInterceptor 빈이 등록된다 -->
<tx:advice id="transactionAdvice" transaction-manager="transactionManager">
  <!-- 트랜잭션 매니저의 빈 아이디가 "transactionManager" 라면 생략 가능하다. -->
    <tx:attributes>
        <tx:method name="get*" propagation="REQUIRED" read-only="true" timeout="30"/>
        <tx:method name="upgrade*" propagation="REQUIRES_NEW" isolation="SERIALIZABLE" />
        <tx:method name="*" propagation="REQUIRED" />
        <!-- 디폴트 값이 스키마에 정의되어 있어 속성이 REQUIRED 라면 생략 가능하다. -->
    </tx:attributes>
</tx:advice>

<aop:config>
    <aop:pointcut id="transactionPointcut" expression="execution(* *..*ServiceImpl.upgrade*(..))" />
    <aop:advisor advice-ref="transactionAdvice" pointcut-ref="transactionPointcut" />
</aop:config>
~~~

트랜잭션 속성을 개별 애트리뷰트를 통해 지정할 수 있어 읽기가 쉽고, XML 에디터의 자동 완성을 통해 편하게 작성가능하다.

[Use tx schema](https://github.com/dhsim86/tobys_spring_study/commit/5a0a08560baa6bfc97a206c8a06069659a714235)

<br>
## 포인트컷과 트랜잭션 속성의 적용 전략

트랜잭션 부가기능을 적용할 메소드를 지정하는 작업은 포인트컷에 의해 진행되고, 전파 속성을 개별적으로 지정하는 것은 어드바이스의 트랜잭션 전파 속성에 따라 결정된다.

<br>
### 트랜잭션 포인트컷 표현식은 타입 패턴이나 빈 이름을 사용

일반적으로 트랜잭션을 적용할 타깃 클래스의 메소드는 모두 트랜잭션 적용 후보가 되는 것이 바람직하다. 메소드 단위까지 세밀하게 포인트컷을 정의해줄 필요는 없다. 단순한 DB 쓰기 작업을 진행하는 메소드의 경우에도 트랜잭션에 참여할 필요가 생길 수 있다.

따라서 단순히 쓰기와 조회 작업만 하는 메소드에도 모두 트랜잭션을 적용하는 것이 좋다. 조회의 경우, 트랜잭션 속성을 **읽기 전용으로 해두면 성능의 향상을 가져올 수도 있다.** 복잡한 조회의 경우에는 타임아웃을 걸어야 할 때도 있고, 격리 수준에 따라 조회도 반드시 트랜잭션 안에서 진행할 필요가 생긴다.

**트랜잭션용 포인트컷 표현식 에는 메소드나 파라미터, 예외에 대한 패턴을 정의하지 않는 것이 바람직하다.** 트랜잭션 경계를 사용할 클래스들이 선정된다면 그 클래스를 포함하는 패키지나 클래스 이름에서 일정한 패턴을 결정하여 표현식으로 만든다.

스프링의 빈 이름을 사용하는 **bean()** 표현식을 사용하는 것도 고려해볼 수 있다.

<br>
### 공통된 메소드 이름 규칙을 통해 최소한의 트랜잭션 어드바이스와 속성을 정의

기준이 되는 몇 가지 트랜잭션 속성을 정의하고 그에 따라 **적절한 메소드 명명 규칙을 만들어두는 것이 좋다.**
다음과 같이 디폴트로 트랜잭션 속성을 정의하고, DB 조회 전용 메소드들은 **get / find** 로 시작하는 이름으로 만들고 트랜잭션 속성에 readOnly를 추가한다.

~~~xml
<tx:advice id="transactionAdvice">
  <tx:attributes>
    <tx:method name="get*" read-only="true" /> <!-- get 으로 시작하는 모든 조회 메소드에 읽기 전용 속성을 부여 -->
    <tx:method name="*" /> <!-- 나머지 메소드는 모두 기본 속성이 적용 -->
  </tx:attributes>
</tx:advice>
~~~

**위와 같이 일반화하기에는 적당하지 않은, 특별한 트랜잭션 속성이 필요한 경우에는 해당 타깃 오브젝트에 대해 따로 어드바이스와 포인트컷 표현식을 사용하는 것이 좋다.**

~~~xml
<aop:config>
    <aop:advisor advice-ref="transactionAdvice" pointcut="bean(*Service)" />

    <!-- a.b 패키지에 있는 BatchJob 으로 끝나는 타입의 모든 메소드에 적용될 것이다.-->
    <aop:advisor advice-ref="batchTxAdvice" pointcut="execution(a.b.*BatchJob.*.(..))" />
</aop:config>

<tx:advice id="transactionAdvice">
  <tx:attributes>
    ...
  </tx:attributes>
</tx:advice>

<tx:advice id="batchTxAdvice">
  <tx:attributes>
    ...
  </tx:attributes>
</tx:advice>
~~~

<br>
### 프록시 방식 AOP는 같은 타깃 오브젝트 내의 메소드를 호출할 때는 적용되지 않는다.

프록시 방식의 AOP에서는 **프록시를 통한 부가 기능의 적용은 클라이언트로부터 호출이 일어날 때만 가능하다.** 즉, 타깃 오브젝트를 사용하는 외부의 모든 오브젝트를 통해서 호출할 때는 부가 기능이 적용되나, **타깃 오브젝트가 자기 자신의 메소드를 호출할 때는 부가 기능이 적용되지 않는다.**

<br>
![01.png](/static/assets/img/blog/web/2017-09-14-toby_spring_06_aop_3/01.png)

위의 그림에서 클라이언트로 호출될 때 (1번과 3번)에는 AOP가 적용되지만, 2번과 같이 자기 자신의 메소드를 호출시에는 적용되지 않는다. **자기 자신의 메소드를 호출할 때는 프록시를 거치지 않기 때문이다.**

위의 예에서 update 메소드의 트랜잭션 속성이 **REQUIRES_NEW** 라고 했을 때, delete 메소드를 통해 호출될 경우 속성이 무시되고 트랜잭션에 단순하게 참여만 할 것이다. 또한 아예 트랜잭션 속성이 적용되지 않는 메소드를 통해 update 메소드가 호출될 경우 트랜잭션이 적용되지 않는다.

스프링 정식 document 에서도 **@Transactional** annotation은 **외부 클라이언트가 호출할 수 있는 public 메소드에 걸어야하고, 외부의 클래스에서 그 메소드를 호출해야 트랜잭션이 걸린다고 나와있다.**

[Spring Document, Using @Transactional](https://docs.spring.io/spring/docs/current/spring-framework-reference/html/transaction.html#transaction-declarative-annotations)

> When using proxies, you should apply the @Transactional annotation only to methods with public visibility. If you do annotate protected, private or package-visible methods with the @Transactional annotation, no error is raised, but the annotated method does not exhibit the configured transactional settings. Consider the use of AspectJ (see below) if you need to annotate non-public methods.

> In proxy mode (which is the default), only external method calls coming in through the proxy are intercepted. This means that self-invocation, in effect, a method within the target object calling another method of the target object, will not lead to an actual transaction at runtime even if the invoked method is marked with @Transactional. Also, the proxy must be fully initialized to provide the expected behaviour so you should not rely on this feature in your initialization code, i.e. @PostConstruct.

**같은 타깃 오브젝트안에서 메소드 호출이 일어날 경우에는 프록시 AOP를 통해 부여한 부가기능이 적용되지 않음을 주의해야 한다.** 만약 위와 같은 경우에도 부가기능을 적용하고 싶다면 AspectJ 와 같은 프록시 AOP 방식이 아닌 다른 방식으로 AOP를 적용해야 한다.

<br>
### 트랜잭션 경계설정의 일원화

트랜잭션 경계설정 부가기능을 여러 계층에서 중구난방으로 적용하는 것은 좋지 않다. **특정한 계층의 경계를 트랜잭션 경계와 일치시키는 것이 좋다.** 보통 비즈니스 로직을 담고 있는 서비스 계층의 메소드가 트랜잭션 경계를 설정하기가 적절하다.

**서비스 계층을 트랜잭션 경계로 정했다면, 다른 계층이나 모듈에서 DAO에 직접 접근하는 것은 차단되어야 한다.** 트랜잭션은 보통 서비스 계층의 메소드 조합으로 만들어지므로, 다른 모듈의 DAO에 접근하고자 할 때는 서비스 계층을 거치는게 바람직하다.

[Apply transaction pointcut, advice to UserService. ](https://github.com/dhsim86/tobys_spring_study/commit/ff73da0a3d9089384cd98d06deb88e80f1192810)

<br>
## 애노테이션 트랜잭션 속성과 포인트컷

보통 트랜잭션 속성을 적용할 때 포인트컷 표현식과 TransactionInterceptor 어드바이스를 통해 일괄적으로 적용하는 방식은 일반적인 상황에 대해서는 잘 들어맞는다. 그러나 클래스나 메소드에 따라서 제각각 속성이 다른 트랜잭션 속성이 필요할 때 앞서 설명한 것처럼 포인트컷과 어드바이스를 계속 추가해나가야 하므로, 이런 경우에는 **메소드 이름 패턴을 통해 일괄적으로 트랜잭션 속성을 적용하는 방식은 적합하지 않다.**

이를 위해 스프링에서는 @Transactional annotation을 통해, 트랜잭션 속성을 정의하는 방법을 제공한다.

~~~java
@Target({ElementType.METHOD, ElementType.TYPE}) // annotation을 사용할 대상을 지정, 메소드나 타입에 지정할 수 있다.
@Retention(RetentionPolicy.RUNTIME) // annotation 정보가 언제까지 유지되는지를 지정
@Inherited // 상속을 통해서도 annotation 정보를 얻을 수 있도록 한다.
@Documented
public @interface Transactional {
  @AliasFor("transactionManager") // transactionManager 이라는 빈 이름을 가진 트랜잭션 매니저를 디폴트로 사용한다.
  String value() default "";

  @AliasFor("value")
  String transactionManager() default "";

  Propagation propagation() default Propagation.REQUIRED;
  Isolation isolation() default Isolation.DEFAULT;
  int timeout() default -1;
  boolean readOnly() default false;
  Class<? extends Throwable>[] rollbackFor() default {};
  String[] rollbackForClassName() default {};
  Class<? extends Throwable>[] noRollbackFor() default {};
  String[] noRollbackForClassName() default {};

  // 트랜잭션 속성의 모든 항목을 지정할 수 있고, 디폴트 값이 설정되어 있으므로 생략 가능하다.
}
~~~

위의 annotation을 사용하기 위해 다음과 같이 애플리케이션 컨텍스트에 추가한다.
~~~xml
<tx:annotation-driven />
~~~

**@Transactional** 의 타깃은 메소드와 타입이다. 따라서 메소드나 클래스, 인터페이스에 지정할 수 있다. 스프링은 이 annotation이 부여된 모든 오브젝트를 **자동으로 타깃 오브젝트로 인식한다.** 이 때 사용되는 포인트컷은 **TransactionAttributeSourcePointcut** 인데, annotation이 부여된 모든 빈 오브젝트를 찾아 포인트컷의 선정 결과로 돌려준다.

<br>
![02.png](/static/assets/img/blog/web/2017-09-14-toby_spring_06_aop_3/02.png)

위 그림은 @Transactional을 사용했을 때, 어드바이저의 동작방식을 보여준다. **TransactionInterceptor** 는 메소드 이름 패턴을 통해 부여되는 일괄적인 트랜잭션 속성정보 대신에, **@Transactional annotation의 엘리먼트에서 트랜잭션 속성을 가져오는 AnnotationTransactionAttributeSource** 를 가져온다. 포인트컷도 @Transactional을 통해 트랜잭션 속성 정보를 참조하도록 한다. 이를 통해 포인트컷과 트랜잭션 속성을 annotation 하나로 지정할 수 있다.

스프링은 @Transactional을 적용할 때 4단계의 대체(fallback) 정책을 이용한다. 타깃 메소드 -> 타깃 클래스 -> 선언 메소드 -> 선언 타입 (클래스, 인터페이스 순서)의 순서에 따라 @Transactional이 적용됐는지 차례대로 확인하고 **가장 먼저 발견되는 속성 정보를 사용한다.**

~~~java
@Transactional
public interface Service {
  @Transactional
  void method1();

  void method2();
}

@Transactional
public class ServiceImpl implements Service {
  @Transactional
  public void method1();

  public void method2();
}
~~~

위와 같이 코드가 정의되어 있을 때, ServiceImpl의 method1에 대해서는 **메소드에 정의된 속성을 사용한다.** ServiceImpl의 **method2에 대해서는 ServiceImpl 클래스에 정의된 속성을 사용할 것이다.**

따라서 **클래스 레벨에서 @Transactional을 붙여 모든 메소드에 공통 트랜잭션 속성이 적용되게 하고, 특수한 속성이 필요한 메소드에 대해서 추가적으로 @Transactional 을 붙이는 것이 좋다.** 그러면 그 메소드에 대해서는 메소드에 붙인 @Transactional 속성을 사용할 것이다.

타깃 클래스에 대해서 @Transactional 을 발견하지 못하면 스프링은 인터페이스에 대해서도 조사한다.

> 인터페이스를 사용하는 AOP가 아닌 방식으로 트랜잭션을 적용하면, 인터페이스에 정의된 @Transactional은 무시된다. 인터페이스에 정의하면 인터페이스를 통해 호출할 때만 트랜잭션이 적용된다.

[Use @Transactional](https://github.com/dhsim86/tobys_spring_study/commit/1f4a242f912be99f635f29cb703ccb560054afe2)

<br>
## 트랜잭션 지원 테스트

트랜잭션 전파 속성은 매우 유용한 개념이다. 예를 들어 **REQUIRED** 로 전파 속성을 지정할 경우, 앞에서 진행 중인 트랜잭션이 있다면 참여하고, 없으면 자동으로 새로운 트랜잭션을 시작한다. **트랜잭션 적용 때문에 불필요한 코드를 중복하는 것도 피할 수 있고 애플리케이션을 작은 기능 단위로 쪼개서 개발할 수 있다.**

<br>
![03.png](/static/assets/img/blog/web/2017-09-14-toby_spring_06_aop_3/03.png)

AOP를 이용해 코드 외부에서 트랜잭션의 기능을 부여해주고 속성을 지정할 수 있게 하는 방법을 **선언적 트랜잭션 (Declarative Transaction)** 이라고 하고, TransactionTemplate나 개별 데이터 기술의 트랜잭션 API를 사용해 직접 코드 안에서 사용하는 방법을 **프로그램에 의한 트랜잭션 (Programmatic Transaction)** 이라고 한다.

트랜잭션의 자유로운 전파와 그로 인한 유연한 개발이 가능할 수 있었던 기술적인 배경은 **AOP로, 프록시를 이용한 트랜잭션 부가기능을 간단하게 애플리케이션 전반에 적용할 수 있다.** 또한 스프링의 트랜잭션 추상화를 통해 데이터 엑세스 기술이나 트랜잭션 기술에 상관없이 DAO에서 일어나는 작업들을 하나의 트랜잭션으로 묶을 수 있었다.

<br>
### @Rollback

테스트 클래스나 테스트 메소드에 사용하는 @Transactional은 일반적인 애플리케이션 클래스에서 사용할 때와 디폴트 속성은 동일하지만, 한 가지 다른 점은 **자동으로 롤백한다는 것이다.** 테스트에 적용되는 @Transactional 은 테스트가 끝나면 기본적으로 강제 롤백시킨다.

만약 테스트 클래스나 메소드에서 DB 작업 결과를 반영하고 싶다면 **@Rollback** annotation을 사용해야 한다. @Transactional은 기본적으로 롤백에 관한 설정이 없으므로 @Rollback 을 통해 롤백 여부를 지정한다.

~~~java
@Test
@Transactional  // 테스트 클래스나 테스트 메소드에서 사용하면 기본적으로 롤백시킨다.
@Rollback(false)  // false로 지정하면 롤백시키지 않는다.
public void transactionTest() {
  ...
}
~~~

이 @Rollback 은 메소드 레벨에서만 지정할 수 있으므로 만약 테스트 클래스에 수행하는 모든 테스트 메소드에서 롤백하고 싶지 않다면, 다음과 같이 **@TransactionConfiguration** annotation을 통해 롤백 여부를 지정해야 한다.

~~~java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "/applicationContext.xml")
@Transactional
@TransactionConfiguration(defaultRollback=false)  // 사용하는 디폴트 트랜잭션 매니저 아이디는 "transactionManager" 이다.
public class UserServiceTest {
  ...

  @Test
  @Rollback // 여기서 @Rollback 을 사용하여 이 테스트 메소드만 롤백시킬 수 있다.
  public void notRollbackTest() {
    ...
  }

  @Test
  @Transactional(propagation=Propagation.NEVER) // 이 테스트에 한해서 트랜잭션을 시작되지 않도록 할 수 있다.
  public void notUseTransactionTest() {
    ...
  }
~~~
