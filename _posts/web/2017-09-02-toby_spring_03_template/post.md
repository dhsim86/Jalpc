---
layout: post
title:  "Toby's Spring Chap 03: 템플릿"
date:   2017-09-02
desc: "Toby's Spring Chap 03: 템플릿"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

## 개방 폐쇄 원칙과 템플릿

코드에서 어떤 부분은 **변경을 통해** 그 기능이 다양해지고 확장하려는 성질이 있고, 어떤 부분은 **고정되어 있고** 변하지 않으려는 성질이 있다.

**변화의 특성이 다른 부분을 구분해주고 다른 목적과 다른 이유에 의해 다른 시점에 독립적으로 변경할 수 있도록 효율적인 구조를 만드는 것이 개방 폐쇄 원칙이다.**

* 템플릿: 변경이 거의 일어나지 않으며 일정한 패턴으로 유지되는 특성을 가진 부분을 자주 변경되는 부분과 독립시켜 효과적으로 활용할 수 있도록 하는 방법

<br>
## 다시 보는 초난감 DAO

~~~java
public void deleteAll() throws SQLException() {
  Connection c = dataSource.getConnection();

  // 밑의 두 라인에서 예외가 발생하면 실행이 중단된다.
  PreparedStatement ps = c.preparedStatement("delete from users");
  ps.executeUpdate();

  // 리소스 반환, Connection 및 PreparedStatement 는 Pool 방식으로 관리된다. close 메소드는 사용한 리소스를 다시 Pool로 돌려주는 역할을 한다.
  ps.close();
  c.close();
}
~~~

위 코드와 같이 만약 실행 중간에 예외가 발생하면 리소스가 제대로 반환되지 않을 수 있다.

> 일반적으로 서버에서는 제한된 개수의 DB Connection을 만들어서 재사용 가능한 풀로 관리한다. 따라서 사용하였으면 반드시 리소스를 반환해야 한다.

~~~java
public void deleteAll() throws SQLException() {
  Connection c = null;
  PreparedStatement ps = null;

  try {

  } catch (SQLException e) {
    throw e;
  } finally {
    if (ps != null) {
      try {
        ps.close();
      } catch (SQLException e) {
        ...
      }
    }

    if (c != null) {
      try {
        c.close();
      } catch (SQLException e) {
        ...
      }
    }
  }
}
~~~

위 코드의 문제는 **예외가 어느 시점에 나는가에 따라서** Connection과 PreparedStatement 중 어떤 것의 close 메소드를 호출할지가 달라진다는 것이다. try-catch 블록이 2중으로 중첩되어 나오고, 이 메소드 뿐만 아니라 다른 메소드에서도 DB 관련 작업을 한다면 또 반복적으로 블록으로 감싸주어야 한다.

이 문제의 핵심은 변하지 않는, 즉 많은 곳에서 중복되는 코드 (여기서는 try-catch 블록 및 예외처리 부분) 과 로직에 따라 변하는 코드를 분리하는 것이다.

* [메소드 추출](https://github.com/dhsim86/tobys_spring_study/commit/22c3f9b49041259e8058957802027ce6db09677b)
  * 보통 메소드 추출시에는 분리시킨 메소드를 다른 곳에서도 사용하려고 하는데, 이것은 분리시키고 남은 메소드가 재사용이 필요한 부분으로 반대가 되었다.
* [템플릿 메소드 패턴 적용](https://github.com/dhsim86/tobys_spring_study/commit/fc36e6fbd73c9f3ff7a0090018ebe7004c5ccf4a)
  * DAO 로직마다 상속하여 새로운 클래스를 만들어야 한다. 또 확장구조가 이미 클래스를 설계하는 시점에서 고정되어 버린다.
* [전략 패턴 적용](https://github.com/dhsim86/tobys_spring_study/commit/1eb246c2597333eed0ad08e6c08ad2d3877dc2b6)
  * 전략 패턴은 오브젝트를 아예 분리하고 클래스 레벨에서는 인터페이스를 통해서만 의존하도록 한다.
  * 변하지 않는 부분인 컨텍스트가 어떤 전략을 사용할 것인가는 컨텍스트를 사용하는 클라이언트가 결정하여 DI 할 수 있도록 한다.
  * [Apply strategy pattern(add)](https://github.com/dhsim86/tobys_spring_study/commit/67b27105cdf9aea2b93ba91ec7643d0621763cf5)
  * 단점
    * DAO 로직마다 매번 StatementStrategy 구현 클래스를 만들어야하고, AddStatement와 같이 필요한 부가적인 정보가 필요할 경우 이 정보를 어딘가에 저장해두어야 한다.

<br>
## 전략 패턴 구조 개선

<br>
### 익명 클래스 사용

StatementStrategy 전략 클래스를 매번 독립된 클래스로 만들지 말고, 익명 클래스로 만든다.
이 방식의 장점은 내부 클래스이므로 자신이 선언된 곳의 정보, 즉 메소드의 변수에 접근할 수 있다는 것이다. 따라서 부가적인 정보가 필요할 경우에 대비해 생성자나 따로 주입을 해줄 필요가 없다.

[Use anonymous inner class](https://github.com/dhsim86/tobys_spring_study/commit/ae4f7bf38da1fa17d59ba7cb5ddbd0eae4625ca7)

<br>
### 컨텍스트와 DI

전략 패턴에서 만든 **jdbcContextWithStatementStrategy** 메소드는 컨텍스트이다. 이 메소드는 JDBC의 일반적인 작업 흐름을 가지고 있어 다른 DAO에서도 사용할 수 있으므로 UserDao 클래스 밖으로 독립시킬 수 있다.

[Use JdbcContext](https://github.com/dhsim86/tobys_spring_study/commit/370420ce238fb7a48e4dbcda7a8ee433c364342e)

<br>
![00.png](/static/assets/img/blog/web/2017-09-02-toby_spring_03_template/00.png)
<br>
![01.png](/static/assets/img/blog/web/2017-09-02-toby_spring_03_template/01.png)

JdbcContext는 싱글톤 빈으로서, DataSource 오브젝트를 주입받도록 되어 있다. 다른 빈을 주입받으므로 스프링 빈으로 등록되어야 한다. 인터페이스를 따로 두지 않음으로써 UserDao와 JdbcContext는 강하게 결합되어 있다. 그러나 JdbcContext 는 다른 구현으로 대체할 일이 없으므로 강력한 결합을 가진 관계를 허용하면서 스프링 빈으르 등록하여 DI 되도록 만들어도 된다.

> 의존관계 주입이라는 개념을 충실히 따르자면, 인터페이스를 사이에 두어 클래스 레벨에서는 의존관계가 고정되지 않게하고, 런타임 시에 의존할 오브젝트의 관계를 다이내믹하게 주입해주는 것이 맞다. 그러나 스프링의 DI는 객체의 생성과 관계설정에 대한 권한을 외부로 위임한다는 IoC의 개념을 포괄한다.

<br>
## 템플릿과 콜백

JdbcContext와 익명 클래스와 같이 일정한 패턴을 갖는 작업 흐름이 있고, 그 중 일부분만 자주 바꿔서 사용하는 방식을 스프링에서는 **템플릿/콜백 패턴** 이라고 한다.

* 템플릿: 전랙 패턴의 컨텍스트, 고정된 작업 흐름을 가진 코드가 있다.
* 콜백: 익명 내부 클래스로 만들어지는 오브젝트, 실행되는 것을 목적으로 다른 오브젝트 메소드에 전달되는 오브젝트이다. 템플릿안에서 호출되는 것을 목적으로 한다.

> 템플릿/콜백 패턴의 콜백은 보통 단일 메소드 인터페이스를 사용한다. 템플릿의 작업 흐름 중 특정 기능을 위해 한 번 호출되는 경우가 많기 때문이다. 만약 여러 종류의 전략을 사용한다면 하나 이상의 콜백 오브젝트를 사용한다.

> 콜백 인터페이스의 메소드에는 보통 파라미터가 있으며 템플릿의 작업 흐름 중에 만들어지는 컨텍스트의 정보를 받을 때 사용된다.

<br>
### 템플릿/콜백의 작업 흐름

<br>
![02.png](/static/assets/img/blog/web/2017-09-02-toby_spring_03_template/02.png)

* 클라이언트의 역할은 템플릿 안에서 실행될 로직을 담은 콜백 오브젝트를 만들고, 콜백이 참조할 정보를 제공하는 것이다.
* 템플릿은 정해진 작업 흐름을 따라 작업을 진행하다가 콜백 오브젝트의 메소드를 호출한다.
* 콜백은 템플릿이 넘겨준 파라미터와 함께 작업을 수행하고 결과를 템플릿으로 리턴한다.
* 템플릿은 작업을 마저 수행한다. 경우에 따라 클라이언트로 결과를 리턴해주기도 한다.

> 템플릿/콜백 에서는 미리 인스턴스 변수에 사용할 오브젝트를 저장해두는 일반 DI와는 다르게, 메소드 단위로 사용할 오브젝트를 새롭게 전달받는 방식이다. 또한 콜백 오브젝트는 내부 클래스로서 자신을 생성한 클라이언트 메소드내의 변수 등의 정보를 참조할 수 있다.

<br>
### 콜백의 분리와 재활용

~~~java
public void deleteAll() throws SQLException {
  this.jdbcContext.workWithStatementStrategy(new StatementStrategy() {
    @Override
    public PreparedStatement makePreparedStatement(Connection c) throws SQLException {
      PreparedStatement ps = c.prepareStatement("delete from users");
      return ps;
    }
  });
}
~~~

위의 코드에서 익명 클래스를 만드는 부분과 SQL 문장을 분리시킬 수 있다. 각 DAO의 로직마다 익명 클래스를 만드는 것은 같지만 SQL 문장은 다르다.

[Sql Query 및 익명 클래스 생성 분리](https://github.com/dhsim86/tobys_spring_study/commit/670cc5dfb2ccc7fee1b784e0c1b841c9481b674c)

<br>
![03.png](/static/assets/img/blog/web/2017-09-02-toby_spring_03_template/03.png)

> 고정된 작업 흐름을 가지고 있으면서 여기저기서 반복되는 코드가 있다면 중복되는 코드를 분리할 방법을 생각하는 습관을 가져야 한다. 중복된 코드를 메소드로 추출하거나 인터페이스를 통한 DI로 전략 패턴을 적용해볼 수 있다. 또한 바뀌는 부분이 여러 종류가 만들어질 수 있다면 템플릿/콜백 패턴을 적용하는 것도 고려해볼 수 있을 것이다.

[Calculator with Template_Callback](https://github.com/dhsim86/tobys_spring_study/commit/2e6c24bdb573f86592348516e9fe9b3d546b5cde)

<br>
## 스프링의 JdbcTemplate

스프링에서는 JDBC를 이용하는 DAO에서 사용할 수 있도록 준비된 다양한 템플릿과 콜백을 제공한다.

[Use JdbcTemplate](https://github.com/dhsim86/tobys_spring_study/commit/ab1e0ff81b49b56effe4ed368f1050b961648e2d)
