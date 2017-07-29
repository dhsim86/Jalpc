---
layout: post
title:  "Toby's Spring Chap 02: 테스트"
date:   2017-07-29
desc: "Toby's Spring Chap 02: 테스트"
keywords: "spring, spring boot"
categories: [Web]
tags: [spring, spring boot]
icon: icon-html
---

> 애플리케이션은 계속 변하고 복잡해져 간다. 그 변화에 대응하는 첫 번째 전략이 확장과 변화를 고려한 객체지향적 설계와 그 것을 효과적으로 담아낼 수 있는 IoC / DI 같은 기술이라면, 두 번째 전략은 만들어진 코드를 확신할 수 있게 해주고, 변화에 유연하게 대처할 수 있는 자신감을 주는 테스트 기술이다.

> 테스트는 스프링을 학습하는 데에 있어 가장 효과적인 방법 중의 하나이다. 테스트 작성은 다양한 기술을 활용하는 방법을 이해하고 검증할 수 있다.

<br>
## UserDao 테스트 다시 보기

<br>
### 웹을 통한 DAO 테스트 방법의 문제점

웹 프로그램에서 사용하는 DAO를 테스트할 떄, 서비스 계층이나 MVC 프레젠테이션 계층까지 모든 입출력 기능을 포함한 코드와 같이 테스트를 하면, 모든 레이어의 기능을 다 구현한 뒤에야 테스트를 할 수 있고 에러 발생시 어디에서 발생한 것인지도 분간하기가 어렵다.

<br>
### 작은 단위의 테스트

* 테스트하고자 하는 대상이 명확하다면, 그 대상에만 집중해서 테스트하는 것이 바람직한다.
  * 한꺼번에 많은 것을 몰아서 하면 테스트 수행과정도 복잡해지고, 정확한 오류의 원인을 찾기도 어렵다.

* 테스트는 가능하면 작은 단위로 쪼개서 집중해서 할 수 있어야 한다.
  * 테스트 메소드는 한 번에 한 가지 검증 목적에만 충실한 것이 좋다.
  * 테스트는 실행 순서에 상관없이 독립적으로 항상 동일한 결과가 나와야 한다.

> 작은 단위의 코드에 대해 테스트를 수행하는 것을 **단위 테스트 (Unit Test)** 라고 한다. 여기서 단위란 충분히 하나의 관심에 집중해서 효율적으로 테스트할 만한 범위이다.

> 통제할 수 없는 외부의 리소스에 의존하는 테스트는 단위 테스트가 아니다. 항상 일관성있는 결과가 보장되어야 하며, 외부 환경에 영향을 받아서는 안된다.

* 단위 테스트를 하는 이유는 개발자가 설계하고 작성한 코드가 원래 의도한 대로 동작하는지를 개발자 스스로 빨리 확인하기 위해서이다.
  * 개발 과정에서 또는 유지보수를 하면서 기존 애플리케이션 코드에 수정을 할 때 마음의 평안을 얻고, 자신이 만지는 코드에 대해 항상 자신감을 가질 수 있다.

<br>
### 자동수행 테스트 코드

* 테스트는 자동으로 수행되도록 코드로 만들어지는 것이 중요하다.
  * 자동으로 수행되는 테스트의 장점은 자주 반복할 수 있으며, 언제든지 코드를 수정하고 테스트를 해볼 수 있다.

[[ch02] Use Junit framework for UserDaoTest.
](https://github.com/dhsim86/tobys_spring_study/commit/b27d965ba5de007e16af759c2d5111308f9892c9)

[[ch02] Update UserDaoTest.
](https://github.com/dhsim86/tobys_spring_study/commit/1ec2601bd7963237983777b7510cd1f2c5d9fbe6)

[[ch02] Refactored UserDaoTest.
](https://github.com/dhsim86/tobys_spring_study/commit/5c05fb5feac93c0c46f9c32db62bbd09f9a1b049)

<br>
### 테스트 주도 개발 (TDD)

* 만들고자 하는 기능의 내용을 먼저 담고 있으면서, 만들어진 코드를 검증도 해줄 수 있도록 테스트 코드를 먼저 만들고, 테스트를 성공하게 해주는 코드를 작성하는 방식의 개발 방법

* TDD의 장점은 코드를 만들어 테스트를 실행하는 사이의 간격이 매우 짧아 코드의 오류를 매우 빠르게 확인할 수 있다.

<br>
## 스프링 테스트 적용

* 스프링은 Junit을 이용하는 테스트 컨텍스트 프레임워크를 제공한다.
  * 간단한 annotation 설정만으로 테스트에서 필요로 하는 애플리케이션 컨텍스트를 만들어 모든 테스트가 공유하게 할 수 있다.

~~~java
// @RunWith 는 Junit 프레임워크 테스트 실행 방법을 확장할 때 사용한다.
// SpringJUnit4ClassRunner 라는 확장 클래스를 지정하면 테스트가 사용할 애플리케이션 컨텍스트를 만들고 관리하는 작업을 진행해준다.
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "/applicationContext.xml") // 자동으로 만들 애플리케이션 컨텍스트의 설정 파일 위치를 지정한다.
public class UserDaoTest {

  // 스프링 테스트 컨텍스트에 의해 자동으로 값이 주입된다.
  // 스프링의 Junit 확장 기능은 테스트가 실행되기 전 애플리케이션 컨텍스트를 한 번 만들어두고, 테스트 오브젝트가 만들어질 때마다 주입시켜준다. 두 개 이상의 테스트 오브젝트가 있을 때에도 마찬가지이다.
  @Autowired
  private ApplicationContext applicationContext;

  private UserDao userDao;

  private User user1;
  private User user2;
  private User user3;
~~~

* 테스트 클래스마다 다른 설정 파일을 사용하도록 만들어도 되고, 몇 개의 테스트에서만 다른 설정 파일을 사용할 수도 있다. 스프링은 설정파일의 종류만큼 애플리케이션 컨텍스트를 만들고, 같은 설정 파일을 지정한 테스트 오브젝트끼리 이를 공유하게 해준다.

* 스프링 애플리케이션 컨텍스트는 자기 자신도 빈으로 등록한다.

[[ch02] Use spring test.
](https://github.com/dhsim86/tobys_spring_study/commit/558884d7b753b31b33499664e54da98d24f1108d)

* **@DirtiesContext**
  * 다음과 같이 애플리케이션 컨텍스트가 관계 설정한 빈들의 런타임 의존관계를 변경하면 **@DirtiesContext** annotation을 통해 스프링에게 애플리케이션 컨텍스트가 변한다는 것을 알려줘야 한다. 이 annotation이 붙은 테스트 클래스에는 애플리케이션 컨텍스트를 공유하지 않고 매번 새로운 애플리케이션 컨텍스트를 만든다. **다른 테스트가 변경된 애플리케이션 컨텍스트에 의해 영향을 주지 않게 하기 위해서이다.**

~~~java
@DirtiesContext
public class UserDaoTest {
  @Autowired
  private UserDao dao;

  @Before
  public void setUp() {
    ...
    DataSource dataSource = ...
    dao.setDataSource(dataSource);
    ...
  }
}
~~~
