---
layout: post
title:  "스프링 Custom TransactionManager 구현"
date:   2017-11-04
desc: "스프링 Custom TransactionManager 구현"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

## TransactionManager

스프링은 여러가지 트랜잭션 기술을 트랜잭션 서비스 추상화를 통해, 비즈니슬 로직이 담긴 코드의 변경이 없이 일관성이 있는 접근 방법을 제공해주고 있다. 각 기술의 트랜잭션 API를 사용하지 않고 일관된 방식으로 트랜잭션을 제어하는 작업이 가능하다.

스프링은 트랜잭션 경계설정을 위해 **[PlatformTransactionManager](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/PlatformTransactionManager.html)** 를 제공하는데, 이 추상 인터페이스는 스프링 트랜잭션 서비스 추상화의 핵심 인터페이스이다. 모든 스프링의 트랜잭션 기능과 그 코드는 이 인터페이스를 통해 로우레벨의 트랜잭션 서비스가 가능하다.

정식 document에서도 나와있겠지만, 이 인터페이스에는 다음과 같이 3개의 메소드를 가지고 있다.
~~~java
public interface PlatformTransactionManager {
  TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException;
  void commit(TransactionStatus status) throws TransactionException;
  void rollback(TransactionStatus status) throws TransactionException;
}
~~~

트랜잭션이 어디서 시작하고 종료하는지, 그리고 종료할 때 정상종료 (commit) 인지 비정상종료 (rollback) 인지를 결정하는 **트랜잭션 경계를 지정하는 것이다.**

그리고 스프링은 시작과 종료를 트랜잭션 전파를 통해 자유롭게 조합하고 확장할 수 있다. 따라서 트랜잭션을 시작할 때는 **getTransaction** 이라는 이름의 메소드를 사용한다. 이 메소드를 통해 트랜잭션 속성에 따라 **새로 시작하거나 진행 중인 트랜잭션에 참여하거나, 진행 중인 트랜잭션을 무시하고 새로운 트랜잭션을 만드는 등** 상황에 따라 다르게 동작한다.

<br>
### AbstractPlatformTransactionManager

보통 트랜잭션을 사용하는데에 있어서, DB 작업이나 기타 트랜잭션이 필요한 (예를 들면 JMS와 같은 MQ) 기술이 있으면 다음과 같이 각 맞는 트랜잭션 매니저를 빈으로 등록하고 사용할 것이다.

~~~java
@Bean
public DataSourceTransactionManager transactionManager(DataSource dataSource) {
  return new DataSourceTransactionManager(DataSource dataSource);
}
~~~

스프링은 다양한 로우레벨 트랜잭션 기술을 지원하기 위해, PlatformTransactionManager 인터페이스를 구현한 여러 TransactionManager를 미리 제공하는데, **[DataSourceTransactionManager](https://docs.spring.io/autorepo/docs/spring-framework/current/javadoc-api/org/springframework/jdbc/datasource/DataSourceTransactionManager.html)**, **[JpaTransactionManager](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/orm/jpa/JpaTransactionManager.html)**,  **[JmsTransactionManager](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jms/connection/JmsTransactionManager.html)** 등을 제공하고 있다.

그런데 이들 클래스를 보면, 다음과 같은 **[AbstractTransactionManager](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/support/AbstractPlatformTransactionManager.html)** 추상 클래스를 상속받고 있다.

~~~java
public abstract class AbstractPlatformTransactionManager implements PlatformTransactionManager, Serializable {
  ...
}
~~~

이 클래스는 PlatformTransactionManager 를 구현하는 추상 클래스로서, 스프링의 **기본적인 트랜잭션 흐름** 을 구현하고 있는 클래스이다. 현재 수행 중인 트랜잭션이 있는지를 체크하는 것부터 시작해서 트랜잭션 전파에 대한 로직이나 트랜잭션 중단, 재시작 등과 같은 **디폴트 로직** 을 구현하고 있다.

스프링이 제공하는 **완전한** 트랜잭션 매니저들도 이 추상 클래스를 상속받아 구현하였다. 다음과 같이 DataSourceTransactionManager도 AbstractTransactionManager를 상속하는 것을 알 수 있다.
~~~java
public class DataSourceTransactionManager extends AbstractPlatformTransactionManager
  implements ResourceTransactionManager, InitializingBean {

    private DataSource dataSource;
    private boolean enforceReadOnly = false;
  ...
~~~

---

스프링의 기본 트랜잭션 흐름을 따르지 않고, 순수한 자신만의 트랜잭션 매니저를 구현할려면 **PlatformTransactionManager** 인터페이스를 바로 구현해도 되지만, 스프링의 강력한 트랜잭션 추상화 서비스를 서비스 받으려면(?) 이 **AbstractPlatformTransactionManager** 를 사용하는 것도 나쁘지 않다.

이 추상 클래스를 상속받아 자신만의 트랜잭션 매니저를 구현하기 위해서는 다음의 4가지 추상 메소드를 반드시 구현해야 한다.

~~~java
protected abstract Object doGetTransaction() throws TransactionException;
protected abstract void doBegin(Object transaction, TransactionDefinition definition) throws TransactionException;
protected abstract void doCommit(DefaultTransactionStatus status) throws TransactionException;
protected abstract void doRollback(DefaultTransactionStatus status) throws TransactionException;
~~~

위 메소드 이름을 보면 알 수 있듯이 트랜잭션을 시작하거나(doGetTransaction, doBegin), 종료(doCommit, doRollback) 될 때 수행되어야할 로직을 구현해야 된다는 것을 알 수 있다.

덧붙여 다음의 3가지 메소드도 같이 오버라이드하여 자신의 로직을 구현하는 것이 좋다.
~~~java
protected boolean isExistingTransaction(Object transaction) throws TransactionException;
protected void doSetRollbackOnly(DefaultTransactionStatus status) throws TransactionException
protected void doCleanupAfterCompletion(Object transaction);
~~~

---

**스프링의 트랜잭션 흐름**

스프링의 트랜잭션의 흐름은 간략하게 나타내면 다음과 같다. 밑의 그림에서 볼드체로 표기된 메소드는 자신이 트랜잭션 매니저를 구현할 때, 반드시 구현해야하는 추상 메소드들이다. (**isExistingTransaction, doCleanupAfterCompletion** 메소드는 제외)

<br>
![00.png](/static/assets/img/blog/web/2017-11-04-spring_custom_transactionmanager/00.png)

TransactionInterceptor의 **invokeWithinTransaction** 메소드는 **@Transactional** annotation이 선언된 메소드가 수행될 때, 자동으로 호출되는데 스프링의 TransactionManager 를 활용하여 트랜잭션을 시작하고 종료하는 매쉬업 코드가 구현되어 있다.

~~~java
protected Object invokeWithinTransaction(Method method, Class<?> targetClass, final InvocationCallback invocation)
    throws Throwable {
  ...
  if (txAttr == null || !(tm instanceof CallbackPreferringPlatformTransactionManager)) {
    TransactionInfo txInfo = createTransactionIfNecessary(tm, txAttr, joinpointIdentification);
    Object retVal = null;
    try {
      retVal = invocation.proceedWithInvocation(); // 타깃 오브젝트의 메소드를 호출하여 비즈니스 로직 실행
    }
    catch (Throwable ex) {
      completeTransactionAfterThrowing(txInfo, ex);
      throw ex;
    }
    finally {
      cleanupTransactionInfo(txInfo);
    }
    commitTransactionAfterReturning(txInfo);
    return retVal;
  }
~~~

**@Transactional** annotation이 설정된 메소드가 실행될 때, 스프링에 의해 **[TransactionInterceptor](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/interceptor/TransactionInterceptor.html)** 및 **[TransactionAspectSupport](https://docs.spring.io/spring/docs/current/javadoc-api//org/springframework/transaction/interceptor/TransactionAspectSupport.html)** 를 통해 AbstractPlatformTransactionManager 클래스의 **getTransaction** 메소드가 처음으로 호출된다.


~~~java
@Override
public final TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException {
  Object transaction = doGetTransaction();
  ...

  if (isExistingTransaction(transaction)) {
    return handleExistingTransaction(definition, transaction, debugEnabled);
  }
  ...

  if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_MANDATORY) {
    ...
  }
  else if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRED ||
    definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRES_NEW ||
    definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_NESTED) {
      ...
  try {
    ...
    doBegin(transaction, definition);
    prepareSynchronization(status, definition);
    return status;
  }
  ...
~~~

위의 코드를 보면 알겠지만 트랜잭션를 가져오는 것부터 시작해서 현재 진행 중인 트랜잭션이 있는지를 체크, 전파 속성에 따라 트랜잭션을 시작하는 코드 등이 담겨 있다.

<br>
## CustomTransactionManager 구현

앞서 언급하였듯이, 자신만의 트랜잭션 기술을 스프링의 트랜잭션 서비스 추상화를 통해 구현하려면 **AbstractPlatformTransactionManager** 클래스의 추상 메소드들을 구현하면 된다. 이에 덧붙여, 추가적으로 스프링에서 제공하는 트랜잭션 관련 클래스들이 있는데, 스프링의 추상화 서비스를 제대로 활용하기 위해 이 클래스들도 사용하는 것이 좋다.

<br>
### [ResourceHolderSupport](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/transaction/support/ResourceHolderSupport.html)

스프링 트랜잭션 추상화 레이어에서 사용하는 클래스 중의 하나로, 이 클래스와 다음에 설명할 **TransactionSynchronizationManager**과 함께 **트랜잭션과 관련된 리소스를 관리한다.**

타임아웃을 걸거나 리소스의 레퍼런스 카운트를 증감시키는 등의 메소드가 구현되어 있으며 이 클래스를 구현할 때는 자신이 구현하는 트랜잭션 기술에서 사용하는 리소스 (Connection이나 기타 자원들)를 여기에 두면 된다.

리소스를 관리하는데에 있어서 필요한 디폴트 로직은 이미 ResourceHolderSupport 클래스에 구현되어 있다. 단 연결 해제와 같은 리소스 해제와 같은 로직이 필요하다면 **clear()** 메소드를 오버라이드하는 것이 좋다.

~~~java
public abstract class ResourceHolderSupport implements ResourceHolder {
  ...
  public void clear() {
    this.synchronizedWithTransaction = false;
    this.rollbackOnly = false;
    this.deadline = null;
  }
}
~~~

<br>
### [SmartTransactionObject](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/transaction/support/SmartTransactionObject.html)

이 인터페이스를 구현해서 자신만의 트랜잭션 오브젝트를 만든다. 스프링의 트랜잭션 추상화 레이어에서는 트랜잭션 매니저의 메소드를 호출할 때, 이 트랜잭션 오브젝트를 파라미터로서 사용한다.

보통 트랜잭션 매니저에서 주로 사용하는 트랜잭션 오브젝트 클래스는 이 클래스를 상속받아 구현하며 이 클래스를 구현하지 않고 자신만의 클래스를 통해 사용할 수도 있다.

여기서 구현할 메소드는 다음과 같이 2가지의 메소드인데, 특별한 기능이 필요로 하지 않는 한 구현하지 않아도 상관은 없다.

~~~java
public interface SmartTransactionObject extends Flushable {

  // rollback-only 를 체크하는 메소드로, 보통 ResourceHolderSupport 의 isRollbackOnly 메소드를 그대로 호출하면 된다.
  boolean isRollbackOnly();

  // 트랜잭션을 통해 메모리 상에 변경된 사항을 persistence store에 flush하고자 할 때 호출한다.
  // SQL 명령을 캐싱하는 Hibernate 에서 주로 사용한다.
  @Override
  void flush();
}
~~~

<br>
### [TransactionSynchronizationManager](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/transaction/support/TransactionSynchronizationManager.html)

스프링에서는 이 클래스를 통해 각 트랜잭션 기술에서 사용하는 리소스를 관리하며 동기화한다. 관리되는 리소스는 스레드 바운드되므로, 동시성 문제도 없다. 쉽게 말해서 동시성 문제가 없는, 같은 키로 overwrite가 불가능한 맵 저장소라 생각하면 편하다.

[Toby's Spring Chap 05: 서비스 추상화](https://dhsim86.github.io/web/2017/09/04/toby_spring_05_service_abstraction-post.html) 에서 나왔듯이, 이 클래스를 사용하기 위해서는 **initSynchronization()** 이나 **clearSynchronization()** 메소드를 트랜잭션 코드 전후로 반드시 호출해야 했지만, AbstractPlatformTransactionManager 클래스를 사용하면 이 것이 자동으로 호출되므로 신경 쓸 필요가 없다.

이 클래스를 통해 트랜잭션에서 필요한 리소스에 트랜잭션 동기화를 수행한다.

<br>
## **[CustomTransactionManager 구현 소스](https://github.com/dhsim86/custom_transactionmanager_sample)**
