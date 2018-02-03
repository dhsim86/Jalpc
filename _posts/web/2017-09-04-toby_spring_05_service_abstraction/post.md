---
layout: post
title:  "Toby's Spring Chap 05: 서비스 추상화"
date:   2017-09-04
desc: "Toby's Spring Chap 05: 서비스 추상화"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

자바에는 사용 방법과 형식은 다르지만, 기능과 목적이 유사한 기술이 존재한다. 스프링은 성격이 비슷한 여러 종류의 기술을 추상화하고 이를 일관된 방법으로 사용할 수 있도록 지원하고 있다.

[Implemented UserService](https://github.com/dhsim86/tobys_spring_study/commit/c46c3cd12ef49fe09f69fd53672b57814da293e9)

* 코드 개선
  * 코드에 중복된 부분은 없는가?
  * 코드가 무엇을 하는 것인지 이해하기 불편하지 않은가?
  * 코드가 자신이 있어야 할 자리에 있는가?
  * 앞으로 변경이 일어난다면 어떤 것이 있을 수 있고, 그 변화에 쉽게 대응할 수 있게 작성되어 있는가?

> 객체지향적인 코드는 다른 오브젝트의 데이터를 가져와서 작업하는 대신에, 데이터를 갖고 있는 오브젝트에게 작업을 해달라고 요청한다.

[Refactored](https://github.com/dhsim86/tobys_spring_study/commit/e1eed87a77bbaf9e93eeda76e92a045fdefedc20)

<br>
## 트랜잭션 서비스 추상화

* 서비스 추상화: 기능은 유사하나 사용방법이 다른 로우레벨의 다양한 기술들에 대해 추상 인터페이스와 일관성있는 접근 방법을 제공해주는 것
  * 다양한 기술을 비즈니스 로직이 담긴 코드의 변경없이 자유롭게 바꿀 수 있을 뿐만 아니라 원활한 테스트가 가능하게 해준다.
* 트랜잭션(Transaction): 더 이상 나눌 수 없는 단위 작업, 작업을 쪼개서 더 작은 단위로 만들 수 없다는 것은 트랜잭션의 핵심 속성인 원자성을 의미한다.

> 부분적으로 성공하거나 여러 번에 걸쳐서 진행할 수 있는 작업이 아니어야 한다. 따라서 도중에 예외가 발생하면 작업을 시작하지 않은 것처럼 원래 상태로 돌려놔야 한다.

> DB는 하나의 SQL 구문에 대해서는 완벽한 트랜잭션을 지원한다.

* 트랜잭션 롤백(Transaction Rollback): 도중에 예외가 발생해서 작업 중단되면 이전에 수행한 SQL 작업을 취소
* 트랜잭션 커밋(Transaction Commit): 모든 SQL 작업이 성공적으로 마무리되면, DB에 알려주어 확정

<br>
### JDBC 트랜잭션의 트랜잭션 경계 설정

* 트랜잭션의 경계: 트랜잭션이 시작하고 끝나는 위치, 복잡한 로직에서 트랜잭션 경계를 설정하는 것은 매우 중요한 작업이다. 주로 비즈니스 로직안에서 설정한다.

~~~java
Connection c = dataSource.getConnection();

c.setAutoCommit(false); // 트랜잭션 시작

try {
  PreparedStatement st1 =
    c.PreparedStatement("update users....");
  st1.executeUpdate();

  PreparedStatement st2 =
    c.PreparedStatement("delete users....");
  st2.executeUpdate();

  c.commit(); // 트랜잭션 커밋

} catch (Exception e) {
  c.rollback(); // 트랜잭션 롤백
}

c.close();
~~~

JDBC에서는 **setAutoCommit(false)** 를 통해 자동 커밋 옵션을 false로 줌으로써 트랜잭션을 시작한다. 트랜잭션이 한 번 시작되면, **commit** 이나 **rollback** 메소드가 호출될 때까지 하나의 트랜잭션으로 묶인다. (트랜잭션의 경계설정)

> 트랜잭션의 경계는 하나의 Connection이 만들어지고 닫히는 범위 안에 존재한다. 이를 로컬 트랜잭션이라고 부른다. 어떤 일련의 작업이 하나의 트랜잭션으로 묶이려면 진행되는 동안 사용하는 DB Connection이 하나만 사용되어야 한다.

<br>
### 트랜잭션 동기화

트랜잭션을 시작하기 위해 만든 Connection 오브젝트를 **"특별한 장소"** 에 저장해두었다가, 이 후에 호출되는 DB 작업은 저장된 Connection을 가져다가 사용한다.

<br>
![00.png](/static/assets/img/blog/web/2017-09-04-toby_spring_05_service_abstraction/00.png)

Connection을 생성 후, 트랜잭션 동기화 저장소에 저장해둔다. (setAutoCommit(false) 로 둔채)
그리고 DB 작업을 수행할 때마다 트랜잭션 동기화 저장소에서 트랜잭션을 가진 Connection 오브젝트를 가져와 SQL 구문을 실행한다. 마지막에 Commit을 (예외가 발생했을 경우에는 rollback) 수행하여 트랜잭션을 완료시키고 저장소에서 Connection 오브젝트를 제거한다.

> 트랜잭션 동기화 저장소는 작업 스레드마다 독립적으로 Connection 오브젝트를 저장하고 관리하므로, 멀티스레드 환경에서도 사용할 수 있다.

스프링이 제공하는 트랜잭션 동기화 관리 클래스는 **TransactionSynchronizationManager** 클래스이다. 다음과 같이 트랜잭션 동기화 작업을 통해 트랜잭션을 사용할 수 있다.

~~~java
TransactionSynchronizationManager.initSynchronization();  // 트랜잭션 동기화 관리 클래스를 통해 동기화 작업 초기화
Connection c = DataSourceUtils.getConnection(dataSource); // DB Connection 생성 후, 트랜잭션 시작. DB Connection 생성과 동기화 (동기화 저장소에 바인딩)를 함께 해주는 메소드이다.
c.setAutoCommit(false);

// 트랜잭션 동기화가 된 상태로 JdbcTemplate를 사용하면 동기화시킨 DB Connection을 사용한다.
try {
  List<User> userList = userDao.getAll();

  for (User user : userList) {
    if (canUpgradeLevel(user) == true) {
      upgradeLevel(user);
    }
  }
  c.commit(); // 정상적으로 수행 후 트랜잭션 커밋

} catch (Exception e) {
  c.rollback(); // 예외가 발생시 롤백
  throw e;

} finally {
  DataSourceUtils.releaseConnection(c, dataSource);   // DB Connection을 안전하게 닫는다.
  TransactionSynchronizationManager.unbindResource(this.dataSource);
  TransactionSynchronizationManager.clearSynchronization(); // 동기화 작업 종료 및 정리
}
~~~

[Use TransactionSynchronizationManager for DB transaction.](https://github.com/dhsim86/tobys_spring_study/commit/1dda439fdc941df2798b915ed80525f64c66c209)

> JdbcTemplate 는 DB Connection이 미리 생성되서 트랜잭션 동기화 저장소에 등록되어 있지 않거나 트랜잭션이 없는 경우에는 직접 DB Connection을 생성하고 트랜잭션을 시작해서 JDBC 작업을 수행한다. 반면에 트랜잭션 동기화를 시작해놓았으면 JdbcTemplate 는 직접 Connection을 만드는 대신, 트랜잭션 동기화 저장소에 있는 Connection을 가져와서 사용한다. 따라서 트랜잭션이 굳이 필요없다면 바로 JdbcTemplate 메소드를 호출해서 사용하고, 필요하다면 외부에서 트랜잭션 동기화를 해주면 된다.

<br>
### 트랜잭션 서비스 추상화

로컬 트랜잭션은 하나의 DB에 대한 작업이 아닌, 여러 개의 DB에 대한 작업을 하나의 트랜잭션으로 묶는 것은 불가능하다. 로컬 트랜잭션은 하나의 DB Connection에 종속되기 때문이다.

이를 위해 별도의 트랜잭션 매니저를 통해 트랜잭션을 관리하는 **글로벌 트랜잭션** 방식을 사용해야 한다. 글로벌 트랜잭션을 사용하면 트랜잭션 매니저를 통해 여러 개의 DB가 참여하는 작업을 하나의 트랜잭션으로 묶을 수 있다.

> 또한 JMS와 같은 트랜잭션 기능을 지원하는 서비스도 트랜잭션에 참여시킬 수 있다.

자바는 JDBC 외에 글로벌 트랜잭션을 지원하는 트랜잭션 매니저를 위해 **JTA (Java Transaction API)** 를 제공한다.

<br>
![01.png](/static/assets/img/blog/web/2017-09-04-toby_spring_05_service_abstraction/01.png)

트랜잭션은 JDBC나 JMS API를 통해 직접 제어하지 않고, JTA를 통해 트랜잭션 매니저가 관리하도록 위임한다. 트랜잭션 매니저는 위와 같이 리소스 매니저와 XA 프로토콜을 통해 연결하여 종합적으로 트랜잭션을 제어한다. 이를 통해 여러 개의 DB나 트랜잭션을 지원하는 작업을 하나의 트랜잭션으로 통합하는 분산 트랜잭션 및 글로벌 트랜잭션을 사용할 수 있다.

~~~java
InitialContext ctx = new InitialContext();
UserTransaction tx = (UserTransaction)ctx.lookup(USER_TX_JNDI_NAME); // JNDI를 통해 서버의 UserTransaction 을 가져온다.

tx.begin();
Connection c = dataSource.getConnection();  // JNDI로 가져온 dataSource를 사용해야 한다.

try {
  ...
  tc.commit();
} catch (Exception e) {
  tx.rollback();
  throw e;
} finally {
  c.close();
}
~~~

위와 같이 JTA를 사용하여 글로벌 트랜잭션을 사용할 수 있지만, 특정 기술에 종속되어버리는 문제가 있다. JDBC나 JTA, Hibernate 등, 바뀔 때마다 위의 코드를 변경해야하는 문제가 생긴다. 다음과 같이 트랜잭션 경계 설정 코드로 인해 UserDao의 특정 구현 클래스에 간적접인 의존관계가 생겼기 때문이다.

<br>
![02.png](/static/assets/img/blog/web/2017-09-04-toby_spring_05_service_abstraction/02.png)

---

트랜잭션 경계설정을 담당하는 코드는 **일정한 패턴을 갖는 유사한 구조를 갖고 있어서 이들의 공통점을 뽑아내 추상화한 트랜잭션 관리 계층을 만들 수 있다.** 이를 통해 애플리케이션 코드에서는 해당 계층에서 제공하는 API를 활용하여 특정 기술에 종속되지 않는 트랜잭션 경계설정 코드를 사용하도록 한다.

스프링에서는 이러한 트랜잭션 기술의 공통점을 담은 트랜잭션 추상화 기술을 제공한다. 이를 통해 각 기술의 트랜잭션 API를 사용하지 않고 일관된 방식으로 트랜잭션을 제어하는 트랜잭션 경계설정 작업이 가능하다.

<br>
![03.png](/static/assets/img/blog/web/2017-09-04-toby_spring_05_service_abstraction/03.png)

~~~java
PlatformTransactionManager transactionManager = new DataSourceTransactionManager(dataSource); // JDBC 트랜잭션 추상 오브젝트 생성

// DefaultTransactionDefinition 은 트랜잭션에 대한 속성을 담고 있다.
// 트랜잭션은 TransactionStatus 변수에 저장되며 트랜잭션에 대한 조작이 필요하면 이 변수를 파라미터로 넘기면 된다.
TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition()); // 트랜잭션 시작

// 트랜잭션 동기화가 사용됨. DataSourceTransactionManager는 JdbcTemplate 에서 사용될 수 있는 방식으로 트랜잭션을 관리해준다.
try {
  ...
  transactionManager.commit(status);
} catch (Exception e) {
  transactionManager.rollback(status);
  throw e;
}
~~~

스프링에서 제공하는 트랜잭션 경계설정을 위한 추상 인터페이스는 **PlatformTransactionManager** 이다. **getTransaction** 메소드를 호출했을 때, 필요에 따라 트랜잭션 매니저가 DB Connection을 가져오는 작업도 같이 수행해준다. JDBC의 로컬 트랜잭션을 사용한다면, **DataSourceTransactionManager** 를 사용할 DB의 DataSource를 생성자 파라미터로 넘겨서 사용한다.

[Use TransactionManager](https://github.com/dhsim86/tobys_spring_study/commit/8730c87083e2bf1aafeac8154a3b950a3bac3790)

[Use TransactionManager with DI](https://github.com/dhsim86/tobys_spring_study/commit/f657e3285712f837f737a6e38b0185e5272e8e8a)

> 스프링의 트랜잭션 추상화 기술은 트랜잭션 동기화를 사용한다.

> 스프링의 DI는 관심, 책임, 성격이 다른 코드를 깔끔하게 분리한다. 이렇게 적절하게 분리함으로써, 하나의 모듈은 한 가지 책임을 가져야된다는 "단일 책임 원칙" 에 맞게 코드를 작성할 수 있다. 이 원칙을 잘 지키면 어떠한 수정 작업이 필요할 때 변경 대상이 명확해진다. 이를 위해 인터페이스를 도입하고 DI롤 통해 연결한다. 그 결과로 단일 책임 원칙 뿐만 아니라 개방 폐쇄 원칙도 지킬 수 있고 모듈 간의 결합도가 낮아져서 서로의 변경이 영향을 주지 않고 하나의 모듈은 하나의 관심에만 가질 수 있도록 할 수 있다.

> 스프링의 의존관계 주입 기술인 DI는 모든 스프링 기술의 기반이 되는 핵심이자 원리이며, DI에 담긴 원칙과 이를 응용하는 프로그래밍 모델을 자바 엔터프라이즈 기술의 문제를 해결하는데 적극 활용한다. 또한 스프링은 개발자가 작성하는 애플리케이션 코드 또한 DI를 활용해 깔끔하고 유연성있는 코드로 만들 수 있도록 적극 지원한다.

<br>
## 테스트 오브젝트

* 테스트 대상이 되는 오브젝트의 로직을 수정하지 않고도, 테스트에 원활히 수행할 수 있도록 타겟 오브젝트가 의존하는 의존 오브젝트를 테스트용 오브젝트로 바꿔치기 할 수 있다.
  * 이렇게 테스트 환경을 만들어주기 위해 테스트 대상이 되는 오브젝트의 기능에만 충실하게 수행하면서 빠르게, 자주 테스트를 실행할 수 있도록 사용하는 오브젝트를 **테스트 대역 (Test Double)** 이라고 한다.

* 테스트 스텁 (Test Stub): 테스트 대상 오브젝트의 의존객체로서 존재하면서 테스트 동안에 코드가 정상적으로 수행할 수 있도록 돕는 것을 말한다.
  * 일반적으로 테스트 스텁은 테스트 코드 내부에서 간접적으로 사용되며, 테스트할 때는 테스트 타겟 오브젝트가 의존하는 원래 오브젝트 대신에 테스트 스텁으로 변경하여 테스트한다.
  * 테스트 스텁이 결과를 돌려주어야 할 때도 있는데 이런 경우, 미리 테스트 중에 필요한 정보를 리턴해주도록 설정할 수도 있다.
  * 또한 메소드를 호출하면 예외를 발생시키게 할 수도 있다.

--

* 목 오브젝트 (Mock Object): 테스트 대상이 되는 타겟 오브젝트와 의존 오브젝트 사이에서 일어나는 일을 검증할 수 있도록 설계된 오브젝트이다.
  * 테스트 대상이 되는 오브젝트의 로직에 집중해서 충실히 검증할 수 있도록 도움을 준다.
  * 스텁처럼 테스트 대상이 되는 오브젝트가 정상적으로 실행하는 것을 도와준다.
  * 테스트 대상 오브젝트와 의존 오브젝트 사이에서 입출력이 어떻게 일어났는지, 얼마나 호출했는지 등에 대한 정보를 검증할 수 있다. 따라서 테스트 대상 오브젝트의 내부에서 일어나는 일이나 다른 오브젝트 사이에서 주고받는 정보까지 검증할 수 있다.

<br>
![04.png](/static/assets/img/blog/web/2017-09-04-toby_spring_05_service_abstraction/04.png)
