---
layout: post
title:  "Toby's Spring Chap 11: 트랜잭션"
date:   2018-11-17
desc: "Toby's Spring Chap 11: 트랜잭션"
keywords: "spring, toby spring, transaction"
categories: [Web]
tags: [spring]
icon: icon-html
---

<br>
## 트랜잭션

트랜잭션 경계설정 코드와 비즈니스 로직을 분리해주고, 코드의 중복을 제거해주는 스프링의 선언전 트랜잭션 기능은 다양한 데이터 엑세스 기술 뿐만 아니라 JMS 메시징 서비스, CCI처럼 트랜잭션 개념을 지원하는 서비스에도 활용할 수 있다.

<br>
## 트랜잭션 추상화와 동기화

스프링이 제공하는 트랜잭션 서비스는 트랜잭션 추상화와 트랜잭션 동기화 두 가지로 생각할 수 있다.

트랜잭션 서비스의 종류는 데이터 엑세스 기술보다 더 다양하다. 데이터 엑세스 기술은 변하지 않더라도 트랜잭션 서비스는 환경에 따라 바뀔 수 있기 때문이다.

스프링없이 선언적 트랜잭션을 사용하려면 특정 기술이나 플랫폼, 서비스에 종속될 수 밖에 없다. 스프링은 **데이터 엑세스 기술과 트랜잭션 서비스 사이의 종속성을 제거하고 트랜잭션 추상화 계층을 제공하여 트랜잭션을 활용하도록 해준다.**

트랜잭션 동기화는 트랜잭션을 일정 범위 안에서 유지해주고, 자유롭게 접근할 수 있도록 한다.

<br>
### PlatformTransactionManager

스프링 트랜잭션 추상화의 핵심 인터페이스는 **PlatformTransactionManager**이다. 모든 스프링의 트랜잭션 기능과 코드는 이 인터페이스를 통해 트랜잭션 서비스를 사용할 수 있다.

```java
public interface PlatformTransactionManager {
  TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException;

  void commit(TransactionStatus status) throws TransactionException;

  void rollback(TrnsactionStatus status) throws TransactionException;
}
```

이 인터페이스는 트랜잭션 경계를 지정하는데 사용한다. 트랜잭션이 어디서 시작하고 종료하는지, 종료할 때 커밋 / 롤백을 상황에 따라 결정할 수 있다.

스프링에서는 시작과 종료를 트랜잭션 전파 기법을 통해 자유롭게 조합하고 확장할 수 있다. 따라서 시작하는 메소드는 적절한 트래잭션을 가져온다는 **getTransaction** 이라는 이름으로 되어 있다. 속성에 따라 새로 시작하거나, 진행 중인 트랜잭션에 참여하거나, 진행 중인 것을 무시하고 새로 트랜잭션을 만들 수 있다.

**TransactionDefinition**은 트랜잭션의 네 가지 속성을 나타낸다. TransactionStatus는 현재 참여하고 있는 트랜잭션의 ID와 구분정보를 담고 있으며, 커밋 또는 롤백 시에 이 TransactionStatus를 사용한다.

<br>
## 트랜잭션 매니저의 종류

<br>
### DataSourceTransactionManager

Connection의 트랜잭션 API를 사용해서 트랜잭션을 관리해준다. 이 트랜잭션 매니저를 사용하기 위해서는 **DataSource를 빈으로 등록해야 되고 트랜잭션 매니저에게 주입해주어야 한다.** JDBC 및 MyBatis로 만든 DAO에 적용할 수 있다.

> DataSource는 getConnection() 메소드가 호출될 때마다 새로운 connection을 돌려주어야 한다. 이는 트랜잭션을 저장해두었다가 같은 connection을 돌려주는 DataSource를 사용해서는 안된다는 뜻이다. 

애플리케이션 코드 상에서 선언적아닌 프로그래밍적으로 트랜잭션을 사용할 때, 트랜잭션 매니저로부터 현재 진행 중인 트랜잭션을 가져오려면 DataSource의 getConnection 대신에 **DataSourceUtils** 클래스의 getConnection(DataSource)를 사용해야 한다. 

또는 DAO와 DataSource 사이에 **TransactonAwareDataSourceProxy** 클래스를 이용하여 레거시 DAO 코드에서 DataSource의 getConnection을 호출해도 트랜잭션 매니저가 관리하는 진행 중인 트랜잭션이 담긴 connection을 돌려주게 할 수 도 있다.

```java
@Bean(name = "dataSource")
public TransactionAwareDataSourceProxy dataSource(DataSource dataSource) {
  TransactionAwareDataSourceProxy proxy = new TransactionAwareDataSourceProxy();
  proxy.setTargetDataSource(dataSource);
  return proxy;
}
```

만약 서버에서 제공하는 DataSource와 트랜잭션 서비스를 JNDI로 접근해 사용하면 DataSourceTransactionManager를 사용할 수 없다. 글로벌 트랜잭션이 필요한 경우에도 이 트랜잭션 매니저가 아닌 JTA를 사용해야 한다.

<br>
### JpaTransactionManager

JPA를 사용할 때는 이 트랜잭션 매니저를 사용한다. 마찬가지로 글로벌 트랜잭션을 사용할 떄는 이 매니저를 사용할 수 없다.

<br>
### JtaTransactionManager

하나 이상의 DB나 트랜잭션 리소스가 참여하는 글로벌 트랜잭션을 적용하려면 JTA를 사용해야 한다. JTA는 **여러 개의 트랜잭션 리소스 (DB / JMS 등)에 대한 작업을 하나의 트랜잭션으로 묶을 수 있고, 여러 대의 서버에 분산되어 진행되는 작업을 트랜잭션으로 연결해준다.**

DB가 하나라면 트랜잭션 매니저가 하나만 등록되어야 한다. DB가 여러 개라도 JTA를 통해 글로벌 트랜잭션을 사용하려면 JtaTransactionManager가 하나만 등록되어야 한다.

<br>
## 트랜잭션 경계설정 전략

보통 트랜잭션 경계는 서비스 계층의 오브젝트 메소드이다. 코드에 의한 프로그래밍적 방식과 AOP를 이용한 선언적 방식으로 구현될 수 있다.

<br>
### 코드에 의한 트랜잭션 경계설정

스프링의 트랜잭션 매니저는 모두 **PlatformTransactionManager**를 구현하는데, 이 인터페이스로 트랜잭션 매니저 빈을 가져오면 종류에 상관없이 동일한 방식으로 트랜잭션을 제어하는 코드를 구현할 수 있다. 단, 이 인터페이스의 메소드를 그대로 사용하는 것은 try/catch 블록을 사용해야 되기 때문에 직접 사용하는 대신, 템플릿 / 콜백 방식의 **TransactionTemplate**를 이용하면 편하다.

```java
public class MemberService {
  @Autowired
  private MemberDao memberDao;

  private TransactionTemplate transactionTemplate;

  @Autowired
  public void init(PlatformTransactionManager transactionManager) {
    transactionTemplate = new TransactionTemplate(transactionManager);
  }

  public void addMembers(final List<Member> members) {
    transactionTemplate.execute(new TranactionCallback {
      public Object doInTransaction(TransactionStatus status) {
        for (Member m : members) {
          memberDao.addMember(m);
        }
        ...
      }
    })
  }
}
```
doInTransaction 메소드에서 트랜잭션 안에서 동작해야 될 코드를 구현한다. 이와 같이 스프링이 제공하는 트랜잭션 서비스 추상화와 동기화 기법을 통해 기술에 독립적인 트랜잭션 코드를 만들 수 있다.

> 어디서는 PlatformTransactionManager 빈을 DI 받아 getTransaction을 통해 리턴되는 TransactionStatus 오브젝트를 이용하면 현재 진행 중인 트랜잭션을 확인할 수 있다.

<br>
### 선언적 트랜잭션 경계설정

코드에 전혀 영향을 주지 않으면서 특정 메소드 실행 전 후에 트랜잭션이 시작되고 종료되거나 기존 트랜잭션에 참여시킬 수 있다. 이는 데코레이터 패턴을 적용한 **트랜잭션 프록시 빈 덕분에 가능하다.**

**@Transactional** 애노테이션을 통해 트랜잭션 AOP를 적용할 수 있다. 트랜잭션이 적용될 타깃의 인터페이스나 클래스, 메소드에 이 애노테이션을 붙이면 된다.

```java
@Transactional
public interface MemberDao {
  public void add(Member m);

  public void add(List<Member> memberList);

  public void deleteAll();

  @Transactional(readOnly = true) // read-only 속성을 가지는 것이 우선 적용된다.
  public long count();
}
```

메소드에 부여된 것이 있으면, 클래스 레벨보다 더 우선되어서 적용된다. 또한 인터페이스 레벨보다 클래스 레벨이 더 우선한다.

* **클래스의 메소드 > 클래스 > 인터페이스의 메소드 > 인터페이스**

<br>
### 프록시 모드: 인터페이스와 클래스

스프링 AOP는 기본적으로 **다이내믹 프록시** 기법을 이용해 동작한다. 이 기법은 인터페이스가 필요한데, 때로는 인터페이스를 구현하지 않은 클래스에다가 트랜잭션을 적용해야 할 수도 있다. 

이 때는 스프링이 지원하는 **클래스 프록시 모드**를 사용한다. 스프링은 JDK 기반의 다이내믹 프록시 뿐만 아니라 CGLib 라이브러리가 제공해주는 클래스 레벨의 프록시도 사용할 수 있도록 한다.

```java
@EnableTransactionManagement(proxyTargetClass = true)
@Configuration
public class AppConfig {

}
```

위와 같이 proxyTargetClass를 true로 주면 된다.

인터페이스를 구현하는 클래스인 경우에도 강제로 클래스 프록시 모드를 적용할 수 있다.

이 때 주의점은 **@Transaction 애노테이션은 반드시 클래스에 부여해야 한다.** 인터페이스를 구현하는 클래스일 경우라도 마찬가지이다. 만약 인터페이스에만 붙일 경우, 그 정보가 구현 클래스로 전달되지 않는다. 따라서 이 경우에는 트랜잭션이 적용되지 않는다. **(JDK 다이내믹 프록시 / 클래스 프록시 모드, 모두)**

@Transactional 애노테이션을 클래스에만 붙이더라도 타깃 클래스가 인터페이스를 구현하고, proxyTargetClass를 **false**(Spring Boot 2.0부터)로 했을 경우 JDK 다이내믹 프록시로 AOP가 적용된다. **(단, 애너테이션을 활용한 JDK 다이내믹 프록시 AOP 적용시 인터페이스, 클래스 모두 애너테이션을 붙이는게 좋다.)**

> 클래스 프록시 모드는 final 클래스에는 적용할 수 없다. 클래스 프록시는 타깃 클래스를 상속하여 프록시를 만드는 방법을 사용하기 때문에 final 클래스인 경우 적용이 불가능하다.

~~클래스 프록시 모드를 사용할 때는 **DB와 관련없는 모든 public 메소드에 트랜잭션이 적용된다.** 인터페이스를 사용할 경우에는 인터페이스에는 DB 관련 메소드만 정의함으로써 구분을 둘 수 있었지만, 클래스는 그런 구분을 둘 수 없다. 따라서 시간과 리소스 낭비가 발생할 수 있다.~~
~~클래스 프록시 모드는 레거시 코드나 여러 제한으로 인해 인터페이스를 못 쓸 경우에만 사용해야 한다.~~

> 위의 제약사항은 Spring 4 부터 해결되어 메서드 하나 하나 따로 적용이 가능하다. 단 여전히 final 클래스 및 final 메서드에는 AOP 적용이 불가능하다. [Spring Manual 5.8 Proxying Mechanisms](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop-proxying)

<br>
### AOP 방식: 프록시와 AspectJ

스프링의 AOP는 기본적으로 프록시 방식으로, 프록시 오브젝트를 타깃 오브젝트 앞에 두고 호출과정을 가로채어 트랜잭션과 같은 부가작업을 진행해준다.

이 방식말고도, AspectJ의 AOP를 사용하면 더 강력한 기능을 사용할 수 있다. AspectJ의 AOP 방식은 **타깃 오브젝트 자체를 조작하여 부가기능을 직접 넣는 방식을 사용한다.** 따라서 메소드 실행 지점만 조인 포인트로 사용할 수 있는 프록시 방식과는 다르게, 다양한 조인 포인트와 고급 기능을 사용할 수 있다. 대신 별도의 빌드 과정이나 로드타임 위버 설정과 같은 작업이 필요하다.

다음 그림과 같이 프록시 방식은 클라이언트와 타깃 오브젝트 사이에 프록시를 두어 투명하게 부가작업을 추가한다.

<br>

![00.png](/static/assets/img/blog/web/2018-11-17-toby_spring_11_transaction/00.png)

여기서 프록시는 클라이언트가 타깃 오브젝트를 호출하는 과정에서만 동작한다. 이 말은 **타깃 오브젝트 자신이 자신의 메소드를 호출할 경우에는 적용이 되지 않는다는 것을 의미한다.**

<br>

![01.png](/static/assets/img/blog/web/2018-11-17-toby_spring_11_transaction/01.png)

1번의 경우에는 프록시를 통해 호출되므로 프록시 기능이 동작하지만 2번의 경우 바로 호출이 일어나므로 프록시 기능이 동작하지 않는다.

따라서 다음과 같은 코드 인 경우 자기 자신의 메소드를 호출할 때는 그 메소드에 붙은 트랜잭션 속성이 적용되지 않는다.

```java
@Trasnactional
public class MemberService {
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void addMember(Member m) {
    ...
  }

  public void do() {
    ...
    this.add(new Member()); // 이 경우 addMember 메소드의 REQUIRES_NEW 트랜잭션 속성이 적용되지 않는다.
  }
}
```

그러나 AspectJ는 타깃 오브젝트 자체를 조작하므로, 자기 자신의 메소드를 호출하는 경우에도 AOP는 잘 동작한다.

```java
@EnableTransactionManagement(mode = AdviceMode.ASPECTJ)
@Configuration
public class AppConfig {

}
```

AspectJ를 통해 트랜잭션을 적용할 때는, @Transactional 애노테이션을 클래스 및 클래스 메소드에 붙여야 한다. 인터페이스에만 붙일 경우 트랜잭션이 적용되지 않는다.

<br>
## 트랜잭션 속성

<br>
### 트랜잭션 전파: propagation

**트랜잭션을 시작하거나 참여하는 방법을 결정한다.**
트랜잭션 경계 시작 부분에서 특정 범위의 트랜잭션을 어떤 식으로 진행할지 결정할 수 있다.

총 7가지 있는데, 모든 트래잭션 매니저나 데이터 엑세스 기술에서 이 7가지를 다 지원하는 것은 아니다.

* REQUIRED: 디폴트 속성, 시작된 트랜잭션이 있다면 참여하고 없다면 새로 트랜잭션을 시작한다.
* SUPPORTS: 이미 시작된 트랜잭션이 있다면 참여만 하고, 없다면 그냥 트랜잭션 없이 수행한다. 트랜잭션은 없지만, 해당 경계 내에서 connection이나 하이버네이트 세션을 공유할 수 있다.
* MANDATORY: REQUIRED와 마찬가지로 이미 시작된 것이 있으면 참여만 한다. 단 시작된 트랜잭션이 없으면 예외를 발생시킨다. 혼자서 독립적으로 트랜잭션을 진행하면 안되는 경우 사용한다.
* REQUIRES_NEW: 항상 새로운 트랜잭션을 시작한다. 이미 진행 중인 트랜잭션이 있다면 보류시킨다. JTA를 사용한다면 서버의 트랜잭션 매니저가 트랜잭션 보류가 가능하도록 설정해야 한다.
* NOT_SUPPORTED: 트랜잭션을 사용하지 않도록 한다. 이미 진행 중인 트랜잭션도 보류시킨다.
* NEVER: 트랜잭션을 사용하지 않도록 하며, 이미 진행 중인 것이 있다면 예외를 발생시킨다.
* NESTED: 이미 시작된 트랜잭션이 있다면 중첩 트랜잭션을 시작한다. 중첩 트랜잭션은 트랜잭션 안에 트랜잭션을 만드는 것이다.

> 중첩된 트랜잭션은 먼저 시작된 부모 트랜잭션의 커밋과 롤백에는 영향을 받지만, 자신의 커밋과 롤백은 부모 트랜잭션에게 영향을 주지 않는다. 따라서 부모 트랜잭션에서 문제 발생하면 자식 트랜잭션도 롤백되지만, 자식 트랜잭션에서 문제가 발생하더라도 부모 트랜잭션이 이상이 없다면 성공적으로 커밋된다.

> 중첩된 트랜잭션은 모든 트랜잭션 매니저에 적용 가능한 것은 아니다.

<br>
### 트랜잭션 격리수준: isolation

격리수준은 동시에 여러 트랜잭션이 진행될 때에 **트랜잭션의 작업 결과가 여타 트랜잭션에게 어떻게 노출할 것인지를 결정한다.**

* DEFAULT: 데이터 엑세스 기술 또는 드라이버의 디폴트 설정을 따른다. 보통 기본 격리수준은 **READ_COMMITTED**이다.
* READ_UNCOMMITTED: 가장 낮은 격리수준으로, 하나의 트랜잭션이 커밋되기 전에 그 변화가 다른 트랜잭션에게 그대로 노출된다. 성능이 가장 빠르다.
* READ_COMMITTED: 가장 많이 사용되는 격리수준으로, 다른 트랜잭션이 커밋하지 않은 변화는 다른 트랜잭션이 읽을 수 없다. 단, 하나의 트랜잭션이 읽은 로우는 다른 트랜잭션에서 수정할 수 있다. 따라서 처음 트랜잭션이 같은 로우를 다시 읽을 경우 다른 내용이 나올 수 있다.
* REPEATABLE_READ: 하나의 트랜잭션이 읽은 로우를 다른 트랜잭션이 수정하는 것을 막아준다. 하지만 새로운 로우를 추가하는 것은 막지 않는다. 따라서 SELECT를 통해 조건에 맞는 로우를 가져올 경우, 트랜잭션이 끝나기 전에 추가된 로우를 볼 수 있다.
* SERIALIZABLE: 가장 강력한 격리수준으로, 트랜잭션을 순차적으로 진행시켜준다. 여러 트랜잭션이 같은 테이블의 정보를 엑세스하지 못하므로 가장 안전하지만 성능이 가장 떨어진다.

<br>
### 트랜잭션 제한시간: timeout

트랜잭션에 시간 제한을 둔다. 값은 초 단위로, 디폴트는 트랜잭션 시스템의 제한시간을 따른다.

<br>
### 읽기전용 트랜잭션: readOnly

트랜잭션을 읽기전용으로 설정한다. 성능을 최적화하기 위해 사용할 수도 있고, 특정 트랜잭션 작업 안에서 쓰기 작업이 일어나는 것을 의도적으로 방지하기 위해 사용한다. 일부 트랜잭션 매니저는 이 속성을 무시할 수도 있다. 이 트랜잭션이 시작된 후, 쓰기작업이 일어나면 예외가 발생한다.

<br>
### 트랜잭션 롤백 예외: rollbackFor, rollbackForClassName

기본적으로 스프링은 체크 예외를 예외적인 상황에서 발생한 것보다는 리턴 값을 대신하는 비즈니스 의미를 담은 결과를 돌려주는 용도로 사용한다고 가정하므로, 런타임 예외만을 롤백 대상으로 삼는다.

체크 예외 또한 롤백 대상으로 삼기 위해서 이 속성을 사용한다.

<br>
### 트랜잭션 커밋 예외: noRollbackFor, noRollbackForClassName

rollbackFor과는 반대로 런타임 예외를 트랜잭션 커밋 대상으로 지정해준다.

<br>
## 데이터 엑세스 기술 트랜잭션의 통합

스프링은 자바의 다양한 데이터 엑세스 기술을 위한 트랜잭션 매니저를 제공해준다. 보통 여러 개의 DB를 사용하지 않는 경우에는 트랜잭션 매니저는 하나만 사용한다.

**DB가 하나인데 데이터 엑세스 기술을 여러 개 사용할 수도 있다. 이는 두 개 이상의 기술을 사용해서 만든 DAO를 하나의 트랜잭션 안에서 사용한다는 뜻이다.**

스프링은 두 개 이상의 데이터 엑세스 기술로 만든 DAO를 하나의 트랜잭션으로 묶어서 사용하는 방법을 제공한다. 물론 DB 당 트랜잭션 매니저는 하나라는 것은 바뀌지 않는다. 하나의 트랜잭션 매니저가 여러 개의 데이터 엑세스 기술의 트랜잭션 기능을 지원하는 것이다.

<br>
### 트랜잭션 매니저별 조합 가능 기술

<br>

![02.png](/static/assets/img/blog/web/2018-11-17-toby_spring_11_transaction/02.png)

* DataSourceTransactionManager: 동일한 DataSource를 사용하게 함으로써, JDBC와 MyBatis에서 같은 트랜잭션을 사용할 수 있다. DataSourceTransactionManager는 DataSource로부터 connection 정보를 가져와 같은 DataSource를 사용하는 JDBC와 MyBatis DAO에게 트랜잭션 동기화 기능을 제공한다. 

<br>

![03.png](/static/assets/img/blog/web/2018-11-17-toby_spring_11_transaction/03.png)

* JPATransactionManager: JPA는 JPA API를 통해 트랜잭션이 처리된다. 스프링에서는 JPA의 EntityManagerFactory가 스프링의 빈으로 등록된 DataSource를 사용할 수 있으므로, 같은 DataSource를 공유하게 해주면 JPATransactionManager에 의해 세 가지 기술을 이용하는 DAO 작업을 하나의 트랜잭션으로 관리해줄 수 있다.

<br>

* JTATransactionManager: 모든 종류의 데이터 엑세스 기술의 DAO가 같은 트랜잭션안에서 동작하게 만들 수 있다.

<br>
### ORM과 비 ORM DAO를 함께 사용할 경우 주의 사항

JPA나 하이버네이트와 같은 엔티티 기반의 ORM 기술과 JDBC, MyBatis와 같은 SQL 기반의 비 ORM 기술을 같이 사용할 경우 예상치 못한 오류를 만날 수 있다.

```java
public class MemberJPADao {
  @PersistenceContext EntityManager entityManager;

  public void add(Member m) {
    entityManager.persist(m)
  }
}
public class MemberJdbcDao extends JdbcDaoSupports {
  SimpeJdbcInsert insert;
  protected void initTemplateConfig() {
    insert = new SimpleJdbcInsert(getDataSource()).withTableName("member");
  }
  public void addMember(Member m) {
    insert.execute(new BeanPropertySqlParameterSource(m))
  }
  public long count() {
    return getJdbcTemplate().queryForObject("select count(*) from member", Long.class).longValue()
  }
}

...
@Transactional
public void test() {
  jdbcDao.add(new Member())
  jpaDao.add(new Member())
  int count = jdbcDao.count() // Return -> 1
}
```

위와 같이 코드를 수행할 때, 2가 되어야 할 값이 1이라고 나온다. 이는 ORM과 비 ORM 특성이 다르기 때문이다.

JPA나 하이버네이트는 **새로 만든 오브젝트에 영속성을 부여해주면 DB에 바로 반영되는 것이 아니다.** 새로 등록된 오브젝트는 엔티티 매니저가 관리하는 영속성 컨텍스트나 세션에만 저장해둔다. 이를 1차 캐시라고도 부르기도 하는데 이는 DB에 작업하는 것을 최대한 지연시키기 위해서이다.

DB에 동기화가 필요한 시점, 즉 트랜잭션이 종료되거나 등록된 엔티티가 반영되어야만 정상적인 결과가 나올 수 있는 쿼리가 실행되기 전까지는 실제 DB 작업은 지연시킨다.

따라서 1번째 DB 작업인 **jpaDao.add(new Member())** 구문은 DB에 반영하지 않고 1차 캐시에만 저장했을 것이다.

JDBC는 이런 것을 모르며, 따라서 현재 DB에 반영된 것만을 가져올 뿐이다.

이를 해결하기 위해서는 JDBC를 사용하기 전에는 JPA나 하이버네이트의 1차 캐시 내용을 DB에 반영시켜야 한다. JDBC의 DAO가 호출될 때마다 AOP 등을 활용해 JPA나 하이버네이트의 캐시를 **flush** 하도록 하면 쉽게 해결할 수 있다.

<br>
## JTA를 이용한 글로벌 트랜잭션

한 개 이상의 DB나 JMS의 작업을 하나의 트랜잭션 안에서 동작하게 하려면 글로벌 트랜잭션을 사용해야 한다.

JTA를 위한 트랜잭션 매니저는 ObjectWeb의 JOTM이나 Atomikos의 TransactionalEssential이 대표적이다.
