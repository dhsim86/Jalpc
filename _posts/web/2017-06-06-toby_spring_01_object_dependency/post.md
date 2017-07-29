---
layout: post
title:  "Toby's Spring Chap 01: 오브젝트와 의존관계"
date:   2017-06-06
desc: "Toby's Spring Chap 01: 오브젝트와 의존관계"
keywords: "spring, spring boot"
categories: [Web]
tags: [spring, spring boot]
icon: icon-html
---

# Introduction

<br>
## 스프링이란 무엇인가?

* 자바 엔터프라이즈 애플리케이션 개발에 사용되는 애플리케이션 프레임워크

> 애플리케이션 프레임워크는 애플리케이션 개발을 빠르고 효율적으로 진행할 수 있도록 틀과 공통 프로그래밍 모델, 기술 API를 제공한다.

* 애플리케이션의 기본틀: 스프링 컨테이너
  * 스프링은 **스프링 컨테이너** / **애플리케이션 컨텍스트** 라는 스프링 런타임 엔진을 제공
  * 스프링 컨테이너: 설정 정보를 참고, 애플리케이션을 구성하는 오브젝트 생성 및 관리

* 공통 프로그래밍 모델: IoC/DI, 서비스 추상화, AOP
  * IoC/DI: 오브젝트의 생명주기와 의존관계에 대한 프로그래밍 모델
    * 스프링은 이 유연하고 확장성이 뛰어난 코드를 만들 수 있도록 이 모델을 프레임워크의 근간으로 삼고 있다.
  * 서비스 추상화: 환경이나 특정 기술에 종속성이 없이 이식성이 뛰어난 유연한 애플리케이션 개발을 가능케 함
    * 스프링에서는 유연한 추상 계층을 두고 있다.
  * AOP: 애플리케이션 코드에 산재해서 나타나는 부가적인 기능을 독립적으로 모듈화하는 프로그래밍 모델
    * 스프링은 AOP를 사용하여 깔끔한 코드를 유지할 수 있도록 한다.

* 기술 API
  * 스프링은 엔터프라이즈 애플리케이션을 바로 활용할 수 있도록 기술 API를 제공
  * 스프링의 프로그래밍 모델에 따라 구현되어 있다.

> 클래스는 스프링 컨테이너 위에서 오브젝트로 만들어져 동작하고, 코드는 스프링의 프로그래밍 모델에 따라 작성하며 기술을 사용할 때 스프링이 제공하는 기술 API를 사용한다.

> 프레임워크: 애플리케이션을 구성하는 오브젝트가 생성되고 동작하는 방식에 대한 틀을 제공 및 어떻게 작성되어야 하는지에 대한 기준(프로그래밍 모델)을 제시

<br>
## 스프링의 성공 요인

스프링은 견고하고 건전한 자바와 엔터프라이즈 개발의 핵심 가치에 충실히하여 발전하게 되었다.

* 단순함
  * 복잡한 기술인 EJB 대비, 단순한 객체지향적인 개발 모델인 **POJO 프로그래밍** 모델을 지향한다.

* 유연성
  * 스프링은 유연성과 확장성이 뛰어나며, 다른 많은 프레임워크와 편리하게 접목돼서 사용가능하다.
  * "항상 프레임워크 기반의 접근 방법을 사용"

<br>
## 스프링 스터디

* 스프링의 핵심 가치와 원리에 대한 이해
  * 스프링이 중요시하는 핵심 가치와 기술, 중요한 프로그래밍 모델
* 스프링 기술에 대한 지식과 선택 기준 정립
  * 스프링을 사용하면서 다양한 선택의 문제를 각 기술영역 별로 효과적으로 다루는 법
  * 스프링이 제공하는 기술과 접근 방법을 알고, 선택의 기준을 마련해서 상황에 맞도록 최선의 기술과 접근 방법을 선택할 수 있어야 한다.
* 스프링의 적용과 확장
  * 스프링의 다양한 기술을 실제 애플리케이션 개발에 어떤 식으로 적용해야 되는지 공부해야 한다.
  * 스프링이 제공하는 기능 말고도 그것을 확장하거나 추상화해서 사용하는 방법을 알아야 한다.

<br>
# 오브젝트와 의존관계

스프링은 객제지향 프로그래밍 가치를 중요시하여, 가장 많이 관심을 두는 대상은 **"오브젝트"** 이다.

* 애플리케이션에서 오브젝트가 생성되고 다른 오브젝트와 관계를 맺고, 사용되고, 소멸되기까지의 전 과정을 진지하게 생각해야 한다.
* 오브젝트가 어떻게 설계되어야 하는지, 어떤 단위로 만들어지며 어떤 과정을 통해 생성되고 사용할 수 있는지 살펴봐야 한다.

> 스프링은 오브젝트를 어떻게 효과적으로 설계 및 구현하고, 사용하고, 이를 개선해나갈 것인가에 대한 기준을 제시한다.

* 자바빈: 다음의 두 가지 관례를 따라 만들어진 오브젝트를 가리킨다.
  * 디폴트 생성자: 파라미터가 없는 디폴트 생성자를 가져야 한다.
    * 프레임워크에서 리플렉션을 통해 오브젝트를 생성하기 위해 필요하다.
  * 프로퍼티: 자바빈이 노출하는 속성에 접근할 수 있도록 Setter 및 Getter 를 제공한다.

* 초난감 DAO
  * [[ch01] Implemented helplessness DAO.
](https://github.com/dhsim86/tobys_spring_study/commit/59386df3331b4ea04903c4b585a75cd626211acf)

<br>
## 관심사의 분리

* 소프트웨어 개발에서 끝이란 개념은 없다.
  * 오브젝트에 대한 설계와 이를 구현한 코드는 추후에도 요구사항에 따라 끊임없이 변한다.

* 객체 설계시 염두해두어야 할 사항
  * 미래의 변화에 어떻게 대비할 것인가?
  * 변화의 폭을 최소화해야 한다.

* 분리와 확장을 고려한 설계
  * 분리
    * 모든 변경과 발전은 한 번에 한 가지 관심사항에 집중해서 일어난다.
    * 코드 상에서 한 가지 관심이 한 군데에 집중되게 구현해야 한다.
    * 관심사가 같은 것끼리 모으고, 다른 것은 분리해주어야 한다.

* UserDao의 관심사항
  * DB와의 연결을 위한 connection 가져오기
    * add / get 메소드에 중복되어 있다.
  * 사용자 등록을 위해 SQL 문장 준비 및 실행
  * 작업이 끝난 후 사용한 리소스 해제

<br>
### 중복 코드의 메소드 추출
* Connection 을 가져오는 중복된 코드를 분리. 중복된 DB 연결 코드를 하나의 메소드로 묶는다.
* [[ch01] Separated the routine of getting DB connection
](https://github.com/dhsim86/tobys_spring_study/commit/30c1d9b6c6bfa9f0dfc5e2a702e34925f46b0e73)

> 리팩토링: 기존의 코드를 외부의 동작방식에는 변화없이, 내부 구조를 변경해서 재구성하는 작업 또는 기술. 코드 내부의 설계가 개선되어 이해하기가 쉽고 변화에 효율적으로 대응할 수 있다.

<br>
### DB 커넥션 만들기의 독립
* DB 커넥션을 가져오는데에 있어서 종종 변경될 가능성이 있음.

* 상속을 통한 확장
  * 상속을 통해 관심사를 서브클래스로 분리
    * DB 작업에 대한 관심은 슈퍼클래스 / DB connection 작업에 대한 관심은 서브클래스로 분리
    * 서브클래스를 통해 오브젝트 생성 방법을 위임 (팩토리 메소드 패턴)
    * **변화의 성격이 다른 것을 분리하여 각 필요한 시점에 독립적으로 변경할 수 있도록 함**
  * DB connection 구현 코드를 제거하고, **getConnection** 메소드를 추상 메소드로 정의
  * 고객사에서는 이 추상 메소드를 구현하도록 하여 입맛에 맞게 **getConnection** 메소드를 정의
  * [[ch01] Separated getConnection method into subclass
  ](https://github.com/dhsim86/tobys_spring_study/commit/33317774d234d53576a293429ed07180e58f1147)

<br>
![00.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/00.png)

> 템플릿 메소드 패턴: 슈퍼클래스에 기본적인 로직의 흐름을 구현하고, 기능의 일부를 추상 메소드나 오버라이딩이 가능한 메소드로 만든 후, 서브클래스에서 필요에 맞게 구현하는 방법. 변하지 않는 기능은 슈퍼클래스에 구현하고 자주 변경되며 확장할 기능은 서브클래스에서 만들도록 한다.

~~~java
public abstract class Super {
  public void templateMethod() {  // 코드의 기본 로직을 담고 있는 "템플릿 메소드"
    // 기본 알고리즘 코드
    hookMethod();      
    abstractMethod();
    ...
  }
  protected void hookMethod() { // 디폴트 기능이 정의되어 있거나 서브클래스에서 선택적으로 오버라이드 가능한 "훅 메소드"
    ...
  }
  public abstract void abstractMethod(); // 서브클래스에서 반드시 구현해야하는 추상 메소드
}

public class Sub1 extends Super() {
  protected void hookMethod() {
    ...
  }
  public void abstractMethod() {
    ...
  }
}
~~~

<br>
![01.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/01.png)

> 팩토리 메소드 패턴: 서브 클래스에서 구체적인 오브젝트 생성 방법을 위임하는 방식. 슈퍼클래스 코드에서 서브클래스에서 구현하는 메소드를 호출하여 필요한 타입의 오브젝트를 사용한다.

> 디자인 패턴: 특정 상황에서 자주 발생하는 문제를 해결하기 위한, 재사용 가능한 솔루션. 패턴의 핵심이 담긴 목적 또는 의도를 잘 알고 적용할 상황 / 해결해야할 문제 / 각 요소의 역할을 잘 알아야 한다.

* 상속을 통한 확장의 한계점
  * 다중 상속의 문제점
  * 다른 목적으로 UserDao에 상속을 적용하기 힘듬
  * 슈퍼클래스에 변경이 일어날 경우, 서브클래스도 함께 수정해야될 수도 있음
  * 다른 DAO에 대해서 적용할 수가 없음

<br>
## DAO의 확장

* 변화의 성격
  * 모든 오브젝트가 다 동일한 방식으로 변하는 것이 아니다.
  * 변화의 성격이 다르다는 것은 변화의 이유와 시기, 주기 등이 다르다.
    * 변화의 성격이 다른 것을 분리하는 것이 "관심사의 분리"

* 클래스의 분리
  * DB 커넥션과 관련된 부분을 상속을 통한 서브클래스에서가 아닌, 별도의 클래스에서 구현 후 UserDao가 이를 사용하도록 함
  * [[ch01] Separated the routine of getting DB connection into other class
  ](https://github.com/dhsim86/tobys_spring_study/commit/feac2bdabfd0a25131370d1e4897630a8d2c64ab)

<br>
![02.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/02.png)

* 클래스 분리의 문제점
  * UserDao 코드가 **SimpleConnectionMaker** 특정 클래스에 종속
    * DB 커넥션 생성 기능을 변경할 방법이 없음
    * UserDao가 바뀔 수 있는 정보인 DB 커넥션 생성해주는 클래스에 대해 너무 많이 알고 있다.

---
* 인터페이스를 통한 관심사의 분리
  * 두 개의 클래스가 서로 종속적으로 긴밀하게 연결되지 않도록 **인터페이스** 를 통해 느슨하게 해준다.
  * 인터페이스를 사용하면 구현 클래스가 무엇인지는 관심가질 필요가 없다.
    * 사용하는 쪽에서는 인터페이스를 통해 사용하기만 하면 된다.
  * [[ch01] Use interface to loose relationship between UserDao and SimpleConnectionMaker ](https://github.com/dhsim86/tobys_spring_study/commit/dfb01136bf2482878db89eea0774ac79d7b5818d)

<br>
![03.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/03.png)

* 구현 코드의 문제점
  * 아직도 UserDao 생성자에서는 특정 클래스 생성자를 호출함으로써 의존성이 있다.

~~~java
public abstract class UserDao {
  private ConnectionMaker connectionMaker;

  public UserDao() {
    connectionMaker = new SimpleConnectionMaker();  // 문제는 이 부분
  }

  public void add(User user) throws ClassNotFoundException, SQLException {
    Connection c = connectionMaker.makeNewConnection();
    ...
  }
}
~~~

<br>
![04.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/04.png)

---
* 관계설정 책임의 분리
  * UserDao에는 아직 분리되지 않은, **"관계설정"** 에 대한 관심이 분리되어 있지 않다.
    * UserDao의 모든 코드는 ConnectionMaker 인터페이스 외에는 어떤 클래스와도 관계를 가져서 안되게 해야 한다.
  * UserDao를 사용하는 쪽에서 **"관계설정"** 에 대한 책임을 부여한다.
    * UserDao가 어떤 ConnectionMaker 인터페이스의 구현 객체를 사용할지 결정하여 **다이나믹한 관계** 가 설정되도록 한다.
    * 외부에서 만든 오브젝트를 전달받기 위해, 메소드 파라미터나 생성자 파라미터를 사용


* 의존관계
  * 오브젝트 사이에서 런타임시에 맺어지는 관계
  * 런타임 오브젝트 관계를 생성해주는 것은 UserDao를 사용하는 "클라이언트"의 책임이다.
  * [[ch01] Use dependency injection for ConnectionMaker and UserDao ](https://github.com/dhsim86/tobys_spring_study/commit/42d47c29deb52b5ded7bc651ca11db17a6891195)

<br>
![05.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/05.png)

~~~java
public class UserDaoTest {
  public static void main(String[] args) throws ClassNotFoundException, SQLException {
    ConnectionMaker connectionMaker = new SimpleConnectionMaker();
    UserDao dao = new UserDao(connectionMaker);
    ...
  }
}
~~~

<br>
![06.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/06.png)

* 의존관계의 장점
  * ConnectionMaker 인터페이스를 구현하기만 했다면, 다른 DAO에 대해서도 유연하게 적용할 수 있다.
  * DB 접속 방법에 대한 관심과 DB를 사용하는 관심을 서로 분리했기 때문이다.

<br>
## 원칙과 패턴

<br>
### 개방 폐쇄 원칙

클래스나 모듈은 확장에는 열려 있어야 하고, 변경에는 닫혀 있어야 한다.

* UserDao는 "DB 연결 방법" 이라는 기능에 대해서는 열려 있고, UserDao의 핵심 코드는 변화에 영향을 받지 않고 닫혀 있다.

~~~
객체 지향 설계 원칙

- 객체지향의 특징을 잘 살릴 수 있는 설계의 특징

원칙: 예외는 있을 수는 있지만, 대부분의 상황에 잘 들어맞는 가이드라인. 좀 더 일반적인 상황에서 적용 가능한 설계 기준이라 할 수 있다.

SOLID

* SRP(The Single Responsibility Principle): 단일 책임 원칙
* OCP(The Open Closed Principle): 개방 폐쇄 원칙
* LSP(The Liskov Substitution Principle): 리스코프 치환 원칙
* ISP(The Interface Segregation Principle): 인터페이스 분리 원칙
* DIP(The Dependency Inversion Principle): 의존관계 역전 원칙

~~~

<br>
### 높은 응집도와 낮은 결합도

* 응집도가 높다
  * 하나의 모듈, 클래스가 하나의 책임 또는 관심사에만 집중되어 있다.
  * 불필요하거나 직접 관련이 없는 외부의 관심이나 책임이 얽혀 있지 않다.

* 높은 응집도
  * 변화가 발생시, 해당 모듈에서 변하는 부분이 **함께** 바뀐다.
  * UserDao의 경우 DB 연결 기능이 변경되더라도 코드의 변경이 없고, ConnectionMaker 에 대해서만 신경쓰면 된다.

* 낮은 결합도
  * 책임과 관심사가 다른 오브젝트, 모듈 사이의 관계는 **느슨하게** 연결된 형태를 유지한다.
  * 느슨한 연결: 관계를 유지하는데 꼭 필요한, 최소한의 간접적인 형태로 제공
  * 결합도가 낮으면 변화에 쉽게 대응할 수 있고 확장에도 편리하다.

> 결합도: 하나의 오브젝트에서 변경이 일어나면 관계를 맺고 있는 다른 오브젝트에게 변화를 요구하는 정도. 당연히 결합도가 낮을수록 변화에 잘 대응하는 코드이다.

<br>
### 전략 패턴

자신의 컨텍스트에서 필요에 따라 **변경이 필요한** 알고리즘 / 루틴을 인터페이스를 통해 외부로 분리하고, 이 인터페이스를 통한 느슨한 관계를 이용하여 필요에 따라 바꿔서 사용하는 디자인 패턴이다.

* UserDao의 경우 **DB 연결** 이라는 기능을 필요에 따라 인터페이스를 통해 바꾸면서 사용할 수 있다.

> 스프링은 이러한 객체지향적 설계 원칙과 디자인 패턴에 나타난 장점을 개발자들이 활용할 수 있도록 해주는 프레임워크이다.

<br>
## 제어의 역전 (IoC)

<br>
### 오브젝트 팩토리

* 팩토리, factory: 객체 생성 방법을 결정하고 만들어진 오브젝트를 리턴
  * 오브젝트 생성 및 런타임 의존관계 설정을 팩토리로 위임
    * UserDao 및 ConnectionMaker는 각기 관심사항에 대한 비즈니스 로직을 담당
    * DaoFactory는 오브젝트들을 구성하고 관계를 정의하는 책임
  * [[ch01] Separated the routine for creating UserDao to DaoFactory. ](https://github.com/dhsim86/tobys_spring_study/commit/c7d6fa7ff56382b893a3b1d02050891d192e5cf8)

* 팩토리는 애플리케이션을 구성하는 컴포넌트들의 구조와 관계를 정의한 설계도 같은 역할을 수행한다.
  * **애플리케이션의 컴포넌트 역할** 을 하는 오브젝트와 **애플리케이션의 구조를 결정** 하는 오브젝트를 분리하느데 의미가 있다.

<br>
![07.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/07.png)


* 제어의 역전: 프로그램의 제어 흐름 구조가 뒤바뀜
  * 일반적인 프로그램: 프로그램이 시작되는 지점에서 사용할 오브젝트를 직접 결정, 생성, 메소드 호출하고 결정한다.
  * 제어의 역전은 이러한 흐름을 뒤집은 것이다.
    * 사용할 오브젝트를 스스로 선택하지 않으며, 생성하지도 않는다. 모든 제어 권한을 다른 대상에게 위임한다.

> 프레임워크도 제어의 역전 개념이 적용된 기술이다. 프레임워크는 단지 만들어져있거나 확장해서 사용될 수 있도록 준비된 집합이 아니다. 애플리케이션 코드가 프레임워크에 의해 사용되는, 제어의 역전의 개념이 들어가 있다.

* DaoFactory 가 컴포넌트 생성 및 관리의 책임을 지고, 다른 컴포넌트들은 수동적으로 동작하므로 제어의 역전이 적용된 것이다.

> 제어의 역전에서는 프레임워크 또는 컨테이너와 같이 애플리케이션 컴포넌트의 생성과 관계 설정 등을 관리할 존재가 필요하다.

<br>
## 스프링의 IoC

<br>
### 애플리케이션 컨텍스트와 설정정보

* 빈 (Bean): 스프링이 제어권을 가지고, 직접 생성하고 관계를 부여하는 오브젝트
  * 스프링 빈: 스프링 컨테이너가 생성과 관계설정, 사용 등을 제어해주는 제어의 역전이 적용된 오브젝트

* 빈 팩토리, 애플리케이션 컨텍스트: 스프링에서 빈의 생성과 제어를 담당하는 IoC 오브젝트

> 애플리케이션 컨텍스트는 별도의 정보를 참고하여 빈의 생성 및 관계 설정과 같은 제어 작업을 총괄

<br>
### DaoFactory를 사용하는 애플리케이션 컨텍스트

* DaoFactory를 자바 코드로 만들어진 애플리케이션 컨텍스트의 설정 정보로 활용가능
  * **@Bean** / **@Configuration** annotation 사용

* **@Configuration** : 빈 팩토리를 위한 오브젝트 설정을 담당하는 클래스로 인식
* **@Bean** : 오브젝트를 만들어주는 메소드에 정의

[[ch01] Use Spring's application context to management for components. ](https://github.com/dhsim86/tobys_spring_study/commit/1815285309d66fcd2639cf70e9ab2db6bcf9b65d)

~~~java
package ch01.springbook.user.dao;

@Configuration
public class DaoFactory {

  @Bean
  public UserDao userDao() {
    return new UserDao(connectionMaker());
  }
  // 메소드의 이름이 빈의 이름이 된다.

  @Bean
  public ConnectionMaker connectionMaker() {
    return new SimpleConnectionMaker();
  }
}

...
public class UserDaoTest {

  public static void main(String[] args) throws ClassNotFoundException, SQLException {

  ApplicationContext applicationContext =
    new AnnotationConfigApplicationContext(DaoFactory.class);
  UserDao dao = applicationContext.getBean("userDao", UserDao.class);
  ...
}
~~~

* **AnnotationConfigApplicationContext**: @Configuration annotation을 사용하는, 자바 코드를 설정 정보를 사용할 때 이 애플리케이션 컨택스트를 사용
* **getBean**: 애플리케이션 컨텍스트가 관리하는 오브젝트를 요청하는 메소드

<br>
### 애플리케이션 컨텍스트의 동작방식

* 오브젝트 팩토리에 대응되는 것이 스프링의 애플리케이션 컨텍스트
  * 스프링에서는 IoC 컨테이너라 하기도 하고, 스프링 컨테이너라고 부르기도 한다.

* 애플리케이션 컨텍스트는 **ApplicationContext** 인터페이스를 구현하며, 빈 팩토리가 구현하는 **BeanFactory** 인터페이스를 상속한다.
  * 애플리케이션에서 IoC를 적용해서 관리할 모든 오브젝트에 대한 생성과 관계설정을 담당

<br>
![08.jpg](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/08.jpg)

* **@Configuration** 이 붙은 DaoFactory를 IoC 설정정보로 활용하며, DaoFactory의 userDao 메소드를 호출해서 오브젝트를 가져온 것을 **getBean** 을 통해 요청될 때 전달해준다.
  * **@Bean** 이 붙은 메소드의 이름을 가져와 빈 목록을 만들고, 요청시 해당 메소드를 호출하여 오브젝트를 생성 후 전달

<br>
![09.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/09.png)

* 애플리케이션 컨택스트를 사용하는 이유는 범용적이고 유연한 방법으로 IoC 기능을 확장하기 위해서이다.
  * 클라이언트는 구체적인 팩토리 클래스를 알 필요가 없다.
    * 어떤 팩토리 클래스를 사용할지 알 필요가 없으며, 팩토리 오브젝트를 생성할 필요도 없다.
    * XML 을 통한 단순한 방법을 통해 설정 정보를 만들 수 있다.
  * 종합 IoC 서비스 제공
    * 오브젝트가 만들어지는 방식, 시점과 전략을 유연하게 가져갈 수 있다.
  * 빈을 검색하는 다양한 방법을 제공
    * 이름 뿐만 아니라, 타입이나 특별한 annotation 설정이 되어 있는 빈을 찾을 수도 있다.

<br>
### 스프링 IoC의 용어 정리

* 빈 (Bean): 스프링이 IoC 방식으로 관리하는 오브젝트, 스프링이 직접 그 생성과 제어를 담당하는 오브젝트
* 빈 팩토리 (Bean Factory): 스프링의 IoC 를 담당하는 핵심 컨테이너, 빈을 등록 / 생성 / 조회 / 전달하며 관리하는 기능을 담당
* 애플리케이션 컨텍스트 (Application Context): 빈 팩토리를 확장한 IoC 컨테이너. 스프링이 제공하는 각종 부가 서비스를 추가로 제공
* 설정정보/설정 메타정보 (Configuration Metadata): IoC를 적용하기 위해 사용하는 메타정보. IoC 컨테이너에 의해 관리되는 애플리케이션 오브젝트를 생성하고 구성할 때 사용.
* 컨테이너, IoC 컨테이너: IoC 방식으로 빈을 관리한다는 의미로 애플리케이션 컨텍스트나 빈 팩토리를 컨테이너 또는 IoC 컨테이너라고도 부른다.
* 스프링 프레임워크: IoC 컨테이너, 애플리케이션 컨텍스트를 포함해서 스프링이 제공하는 모든 기능을 총칭

<br>
## 싱글톤 레지스트리와 오브젝트 스코프

* 애플리케이션 컨텍스트를 통해 생성된 빈은 **디폴트로** 몇번 요청하더라도 **동일한** 빈이 전달된다.
  * 매번 동일한 빈을 돌려준다. (매번 new 메소드를 통해 새로운 빈이 생성되지 않는다.)

* 애플리케이션 컨텍스트는 빈을 **싱글톤** 으로서 저장하고 관리하는 **싱글톤 레지스트리** 이다.

> 스프링이 주로 적용되는 대상이 서버 환경인데, 이 환경은 수많은 요청을 처리해야 하는 높은 성능이 요구된다. 각 요청에 대해 새로운 오브젝트를 생성한다면 부하가 걸리게 되므로, 하나의 오브젝트만 만들어두고 요청을 처리하는 스레드들이 서로 오브젝트를 공유하면서 사용하도록 한다.

> 싱글톤 패턴: 어떤 클래스를 애플리케이션에서 제한된 인스턴스 개수, 주로 하나만 존재하도록 강제하는 패턴.

<br>
### 싱글톤 패턴의 한계

* 보통 싱글톤을 구현할 때 다음과 같이 구현한다.

~~~java
public class UserDao {
  private static UserDao userDao;

  private UserDao(ConnectionMaker connectionMaker) {
    this.connectionMaker = connectionMaker;
  }

  public static synchronized UserDao getInstance() {
    if (userDao == null) {
      userDao = new userDao(?);
    }
    return userDao;
  }
}
~~~

* private 생성자를 가지고 있으므로 상속이 불가능하다.
  * 싱글톤 패턴은 private로 생성자를 만드는데, 다른 생성자가 없다면 상속이 불가능해진다.
* 테스트하기가 힘들다.
  * Mock 오브젝트 등으로 대체하기가 어렵다.
* 서버환경에서는 싱글톤이 하나만 만들어지는 것을 보장하지 못한다.
* 싱글톤의 사용은 전역 상태를 만들어버리므로 바람직하지 않다.
  * 아무곳에서나 static 메소드를 통해 해당 오브젝트를 사용할 수 있다.

<br>
### 싱글톤 레지스트리

* 스프링은 서버환경에서 오브젝트들이 싱글톤으로 만들어져서 오브젝트 방식으로 만드는 것을 권장하는데, 싱글톤 패턴 구현 방식은 한계가 있으므로 직접 오브젝트를 만들고 관리하는 기능을 제공한다.

* 스프링 컨테이너는 싱글톤을 생성하고 관리하는 싱글톤 관리 컨테이너이다.
  * 싱글톤 패턴이 아닌 일반 생성자로 구성된 평범한 자바 클래스도 싱글톤으로 활용할 수 있게 해준다.
  * 일반적인 자바 클래스를 사용할 수 있으므로, 싱글톤 패턴과는 다르게 **객체지향적인 설계 방식과 디자인 패턴을 적용하는데 아무런 제약이 없다.**

<br>
### 싱글톤과 오브젝트 상태

* 싱글톤은 멀티스레드 환경에서 여러 스레드가 동시에 접근해서 사용할 수 있다.
  * 따라서 오브젝트 내부적으로 상태 정보를 가지고 있으면 안된다.
  * 파라미터나 로컬 변수와 같은 것은 스택에 따로 만들어지므로 상관이 없음.

<br>
### 스프링 빈의 스코프
* 스코프: 스프링이 관리하는 빈이 생성되고 존재하고, 적용되는 범위

* 싱글톤 스코프: 스프링 빈의 기본 스코프, 한 개의 오브젝트만 생성된다.
* 프로토타입 스코프: 빈을 요청할 때마다 새로운 빈이 생성된다.

> 그 외 Http 요청이 생길 때마다 생성되닌 요청 스코프 / 웹의 세션과 유사한 세션 스코프도 있다.

<br>
## 의존관계 주입 (DI)

<br>
### 제어의 역전과 의존관계 주입

* 스프링 IoC 기능의 대표적인 원리는 의존관계 주입이다.

---
**의존관계**

<br>
![10.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/10.png)

* 의존한다는 것은, 위의 그림을 예로 들때 B가 변하면 A에 영향을 미친다는 뜻이다.
  * B의 기능이 변화하면 A의 기능이 수행되는 데도 영향이 미친다.
  * B를 수정할 때, A로 그에 따라 수정되어야 할 수 있다.
  * 의존관계에는 방향성이 있다.

* UserDao와 같이 인터페이스를 통해서만 의존관계를 만들면 인터페이스 구현 클래스와의 관계는 느슨해지면서 영향을 덜 받게 할 수 있다.

<br>
![11.png](/static/assets/img/blog/web/2017-06-06-toby_spring_01_object_dependency/11.png)

---
**의존관계 주입**

* 클래스 모델이나 코드에는 런타임 시점의 의존관계가 드러나지 않는다. 그러기 위해 인터페이스에만 의존하고 있어야 한다.
* 런타임 시점의 의존관계는 컨테이너나 팩토리 같은 제 3자가 설정한다.
* 의존관계는 외부에서 오브젝트를 주입해줌으로써 만들어진다.

~~~java
public UserDao() {
  connectionMaker = new SimpleConnectionMaker();
}
~~~

위 코드의 문제는 코드 상에서 런타임 의존관계가 있다는 것이다.

<br>
### 메소드를 이용한 의존관계 주입

* 생성자뿐만 아니라 **Setter** 를 통해 의존관계를 주입할 수 있다.
  * 스프링에서는 XML 과 같은 설정 정보를 사용할 때 **Setter** 를 통해 주입하는 것이 더 편하다.

~~~java
  package ch01.springbook.user.dao;

  @Configuration
  public class DaoFactory {

    @Bean
    public UserDao userDao() {
      UserDao userDao = new UserDao();
      userDao.setConnectionMaker(connectionMaker());
      return userDao;
    }

    @Bean
    public ConnectionMaker connectionMaker() {
      return new SimpleConnectionMaker();
    }
  }
~~~

<br>
## XML을 이용한 설정

* 스프링에서는 XML 을 통해 DI 의존관계 설정정보를 만들 수 있다.
  * 자바코드로 만드는 설정정보와는 다르게, 빌드 작업도 필요 없고 빠르게 반영할 수 있다.

| -- | 자바 코드 설정 정보 | XML 설정 정보 |
| ---------- | :--------- | --------- |
| 빈 설정파일 | @Configuration | \<beans\> |
| 빈의 이름 | @Bean methodName() | \<bean id="methodName"\> |
| 빈의 클래스 | return new BeanClass() | class="a.b.c... BeanClass"\> |

~~~xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.3.xsd">

    <bean id="connectionMaker" class="ch01.springbook.user.dao.SimpleConnectionMaker" />
    <!-- bean 태그는 @Bean에 대응 -->
    <!-- class 에는 오브젝트 생성시 사용하는 클래스 이름, 패키지까지 모두 포함 -->

    <bean id="userDao" class="ch01.springbook.user.dao.UserDao">
        <property name="connectionMaker" ref="connectionMaker" />
        <!-- Setter 를 통한 의존관계 주입, UserDao 클래스에는 setConnectionMaker 이름의 setter가 있어야 한다. -->
        <!-- name은 Setter의 프로퍼티 이름 -->
        <!-- ref는 Setter 를 통해 주입할 오브젝트의 빈 ID이다. -->
    </bean>

</beans>
~~~

* XML 을 통한 설정정보를 활용하기 위해서는 **GenericXmlApplicationContext** 를 사용한다.

[[ch01] Use XML as bean configurations. ](https://github.com/dhsim86/tobys_spring_study/commit/87cb981e00ee04b084973e38bb2ff28860ba9eff)

[[ch01] Use DataSource to get connection. ](https://github.com/dhsim86/tobys_spring_study/commit/7045fc54788e8e542a04bdfe3416c190cec69533)
