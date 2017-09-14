---
layout: post
title:  "Toby's Spring Chap 06: AOP part.3"
date:   2017-09-14
desc: "Toby's Spring Chap 06: AOP part.3"
keywords: "spring, spring boot"
categories: [Web]
tags: [spring, spring boot]
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

<br>
### 트랜잭션 전파 (Transaction Propagation)

트랜잭션 전파란 트랜잭션의 경계에서 **이미 진행 중인 트랜잭션이 있을 때, 또는 없을 때 어떻게 동작할 것인가 결정하는 방식을 말한다.**

<br>
![00.png](/static/assets/img/blog/web/2017-09-14-toby_spring_06_aop_3/00.png)

위와 같이 각각 독립적인 2개의 트랜잭션이 있을 때, B 트랜잭션의 동작 방식을 결정할 수 있다.

B 트랜잭션이 A 트랜잭션에 참여시킬 경우, (2)에서 예외가 발생했을 때 B 트랜잭션 내용도 롤백시킬 수 있다.
반면에 B 트랜잭션을 A 트랜잭션에 독립적인 트랜잭션으로 만들 경우, A 트랜잭션은 B 트랜잭션 상황에 무관하게 진행될 수도 있다. 반대로 (2)에서 예외가 발생하더라도 B 트랜잭션의 결과는 영향을 받지 않는다.

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

격리수준은 기본적으로 DB에 설정되어 있으나, JDBC 드라이버나 DataSource 등에서 재설정 가능하고 필요에 따라 트랜잭션 단위로 격리수준을 조정할 수 있다. **DefaultTransactionDefinition** 의 기본 격리수준은 **ISOLATION_DEFAULT** 이다. 이는 DataSource에 설정된 디폴트 격리수준을 그대로 따른다는 것이다.

<br>
### 제한시간

트랜잭션을 수행하는데 제한시간을 설정할 수 있다. **DefaultTransactionDefinition** 의 기본설정은 제한시간이 없다. 독립적인 트랜잭션을 직접 시작할 수 있는 **PROPAGATION_REQUIRED** 나 **PROPAGATION_REQUIRES_NEW** 와 함께 사용해야만 의미가 있다.

<br>
### 읽기전용

트랜잭션 내에서 데이터를 조작하는 시도를 막는다. 또한 데이터 엑세스 기술에 따라 성능이 향상될 수도 있다.

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

위 xml 설정과 같이 트랜잭션 매니저를 설정하는 것 외에 **transactionAttributes** 프로퍼티를 통해 각 메소드 패턴별로 적용할 트랜잭션 속성을 정의할 수 있다.

---
**rollbackOn**

transactionAttributes 프로퍼티는 **TransactionAttribute** 인터페이스를 구현한 클래스의 오브젝트로 트랜잭션 네 가지 속성 말고도 **어떤 예외가 발생하면 롤백을 할 것인가를 결정하는 메소드를 추가적으로 가지고 있다.** 이 프로퍼티를 통해 트랜잭션 부가기능의 모든 동작방식을 제어할 수 있다.

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
