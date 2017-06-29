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
  * 성격이 다르다는 것은 변화의 이유와 시기, 주기 등이 다르다.

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
  * 두 개의 클래스가 서로 종속적으로 긴밀하게 연결되지 않도록 인터페이스를 통해 느슨하게 해준다.
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
## 제어의 역전 (IOC)
