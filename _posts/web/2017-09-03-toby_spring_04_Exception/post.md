---
layout: post
title:  "Toby's Spring Chap 04: 예외"
date:   2017-09-03
desc: "Toby's Spring Chap 04: 예외"
keywords: "spring, spring boot"
categories: [Web]
tags: [spring, spring boot]
icon: icon-html
---

<br>
### 초난감 예외처리

~~~java
try {
  ...
} catch (Exception e) {

}
~~~

위의 코드는 예외를 잡고 아무것도 하지 않는다. 아무것도 하지 않고 별 문제가 없는 것처럼 넘어가버리는 것은 위험하다.
비정상적인 동작의 원인이 무엇인지 찾아내기가 매우 힘들다.

다음 코드와 같이 로그만 남겨서도 안되며 예외를 처리해야 한다.
~~~java
...
catch (Exception e) {
  log.error(...);
}
~~~

> 예외를 처리할 때 반드시 지켜야 하는 것은 모든 예외는 적절하게 복구하든지, 아니면 작업을 중단시키고 운영자 또는 개발자에게 분명히 통보되어야 한다. 또한 예외 처리할 방법이 없다면 잡지 말아야 한다.

<br>
## 예외의 종류와 특징

<br>
### Error

java.lang.Error 클래스의 서브클래스들이다. 에러는 시스템에 뭔가 비정상적인 상황이 발생했을 경우에 사용된다. 자바 VM에서 발생하는 것으로, **애플리케이션 코드에서 잡으면 안된다.**

Error를 잡아봤자 대응 방법이 없기 때문이다.

<br>
### Exception과 Checked Exception

java.lang.Exception 클래스와 그 서브클래스들은 Error와는 다르게 애플리케이션 코드의 작업 수행 도중에 예외상황이 발생했을 경우에 사용된다.

예외는 다시 Checked 와 Unchecked 로 구분되는데, Checked 예외는 Exception 클래스의 서브클래스이면서 RuntimeException을 상속받지 않는 예외들이고, 후자는 RuntimeException을 상속한 클래스들을 말한다.

<br>
![00.png](/static/assets/img/blog/web/2017-09-03-toby_spring_04_Exception/00.png)

Checked 예외는 반드시 예외를 처리하는 코드를 함께 작성해야 한다. 사용할 메소드가 Checked 예외를 던진다면 이를 catch 문으로 잡든가, 아니면 다시 메소드 밖으로 던져야 한다.

> Checked 예외는 어떤 식으로든 복구할 가능성이 있는 경우에 사용한다.

<br>
### RuntimeException과 Unchecked Exception

이 예외들은 명시적엔 예외처리를 강제하지 않는다. 주로 프로그램의 오류가 있을 때 발생하도록 의도된 것으로 피할 수는 있지만 개발자가 부주의해서 발생할 수 있는 경우에 발생하도록 만든 것이다. 미리 조건을 체크하도록 주의 깊게 코드 작성을 한다면 피할 수 있다.

> 이 예외들은 예상하지 못했던 예외상황에서 발생하는 것이 아니기 때문에 예외처리를 강제하지 않는 것이다.

<br>
## 예외처리 방법

<br>
### 예외 복구

예외상황을 파악하고 문제를 해결하여 정상 상태로 돌려놓는 것이다. 예외를 복구했으면 애플리케이션에서는 정상적으로 설계된 흐름을 따라 진행되어야 한다.

<br>
### 예외 회피

예외처리를 담당하지 않고 자신을 호출한 쪽으로 위임하는 것이다. 회피한다는 것은 반드시 다른 곳에서 예외를 대신 처리할 수 있도록 던져야 한다. 예외를 회피하는 것은 의도가 분명하고 이유가 있어야 한다.

<br>
### 예외 전환

예외를 던질 때 그대로 넘기는 것이 아닌 다른 예외로 전환해서 던지는 것이다. 의미를 추가적으로 부여하여 호출한 쪽에서 이 원인을 보고 적절히 처리를 할 수 있다.

또한 예외 전환시 원래 발생했던 예외를 담아서 **중첩 예외** 로 만드는 것이 좋다. 또한 처리하기가 불가능한 Checked 예외를 던질 때, RuntimeException으로 포장하여 던질 수 있다.

> 애플리케이션 로직 상에서 예외 조건이 발견되거나 의도적으로 던지는 예외가 있으면 checked 예외를 사용한다. 비즈니스적인 의미가 있는 예외는 적절한 대응이나 복구 작업이 필요하기 때문이다. 그러나 복구가 불가능한 예외는 RuntimeException 으로 포장해서 다른 계층의 메소드가 throws를 남발하지 않도록 해야 한다.

> 스프링의 JdbcTemplate는 SQLException을 Unchecked 예외인 DataAccessException으로 전환하여 던진다. 일반적으로 SQLException은 복구방법이 없기 때문이다. 발생한 예외를 빨리 전달하는 것 외에는 할 수 있는게 없다. JdbcTemplate는 DataAccessException으로 포장할 뿐만 아니라 분석이 힘든 예외정보를 의미있고 일관성있는 예외로 전환해서 추상화해준다.

<br>
## JDBC의 한계

JDBC는 자바를 이용해 DB에 접근하는 방법을 추상화된 API 형태로 정의해놓고, 각 DB 업체가 JDBC 표준을 따라 만들어진 드라이버를 제공하게 해준다. 개발자들은 표준화된 API를 통해 DB 종류에 상관없이 일관된 방법으로 개발할 수 있다.

그러나 DB를 자유롭게 변경해서 사용할 수 있는 유연한 코드를 보장해주지는 못한다.

<br>
### 비표준 SQL

대부분의 DB는 표준을 따르지 않는 비표준 문법 및 기능을 제공한다. 성능 향상과 최적화를 위해 비표준 SQL 문장이 들어갈 때마가 많은데 이런 코드를 사용하는 DAO는 특정 DB에 대해 종속적인 코드가 되어버린다. 만약 다른 DB로 변경시 SQL을 적지 않게 수정해야 할 것이다.

<br>
### 호환성없는 SQLException의 DB 에러정보

DB를 사용하다가 발생할 수 있는 예외는 다양한데, DB마다 에러의 종류와 원인도 제각각이라는 점이다.
또한 SQLException의 getErrorCode 메소드로 가져올 수 있는 DB 에러코드는 DB별로 다르다.

호환성없는 에러코드와 표준을 잘 따르지 않는 상태코드를 가지는 SQLException 만으로 DB에 독립적인 유연한 코드를 작성하는 것은 불가능하다.

<br>
## 스프링의 DataAccessException

DB 에러코드는 DB에서 직접 제공하는 것이므로 어느 정도는 일관성이 유지된다. 각 DB별로 달라지는 에러코드를 일관성있는 예외로 전달받을 수 있도록 매핑해주는 것이 좋을 수 있다.

스프링은 DataAccessException 뿐만 아니라 서브클래스로 세분화된 예외를 두고 있다. 스프링은 SQLException을 단지 Unchecked 예외를 DataAccessException 으로 단순히 포장하는 것이 아니라, DB 에러코드를 참조하여 DataAccessException 의 서브클래스 예외로 전환해준다.

DataAccessException은 JPA나 ORM, myBatis와 같이 데이터 엑세스 기술은 달라도 의미가 같은 예외라면 일관된 예외가 발생하도록 만들어준다. 스프링은 자바의 주요 데이터 엑세스 기술에서 발생할 수 있는 대부분의 예외를 DataAccessException 및 그 서브클래스 예외로 추상화해주고 있는 것이다.

같은 상황에서 데이터 엑세스 기술에 따라 달리지는 예외를 스프링은 기술의 종류에 상관없이 드라이버나 DB 메타정보를 참고하여 DB 종류를 확인하고 DB 별로 준비된 매핑정보를 참조하여 적절한 예외 클래스를 선택하여 던진다.

<br>
![01.png](/static/assets/img/blog/web/2017-09-03-toby_spring_04_Exception/01.png)

[DuplicatedKeyException](https://github.com/dhsim86/tobys_spring_study/commit/3edfa61cabf6015d457c14f0e89ada508451690d)
