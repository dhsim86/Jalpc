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
