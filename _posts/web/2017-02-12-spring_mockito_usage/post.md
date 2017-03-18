---
layout: post
title:  "Spring 에서 mockito 기본 사용법"
date:   2017-02-12
desc: "Spring 에서 mockito 기본 사용법"
keywords: "mockito, spring, unit test, server programming"
categories: [Web]
tags: [mockito, spring, unit test]
icon: icon-html
---

# Overview mockito
 mockito는 유닛 테스트를 위한 java mocking framework이다.
 mockito를 사용하면 대부분의 비즈니스 로직을 검증가능한데, 여기서는 기본 사용법에 대해 작성하였다.

---

## Declare Maven Dependency
 mocktio는 maven repository를 지원하는데, 다음과 같이 pom.xml에서 선언하면 사용 가능하다.

<br>
### Maven repository

![2017-02-12-spring_mockito_usage_00.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_00.jpg)
여기서는 mocktio를 1.10.19, junit을 4.12 버전으로 사용한다.

---

## Mockito usage examples

<br>
### mock()

 mock() 메소드는 mock 객체를 만들어서 반환한다.
예를 들어 다음과 같이 Person 클래스를 만들고 테스트한다고 가정하자.

![2017-02-12-spring_mockito_usage_01.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_01.jpg)

그러면 다음과 같이 mock 메소드를 통해 mock 객체를 만들 수 있다.

![2017-02-12-spring_mockito_usage_02.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_02.jpg)

<br>
### @Mock

 mock() 메소드 말고도 mock 객체를 만들기 위해 @Mock annotation을 선언하는 방법도 있다.
이 방법은 다음과 같이 사용한다.

![2017-02-12-spring_mockito_usage_03.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_03.jpg)

MockitoAnnotations.initMocks(this)를 이용하면, Mockito annotation이 선언된 변수들을
객체로 만들어낸다.

<br>
### When 01

 아주 간단한 when() 메소드 사용법이다.
when() 메소드는 지정 메소드에 대해 반환해줄 값을 설정할 수 있다.

![2017-02-12-spring_mockito_usage_04.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_04.jpg)

 위의 예에서 Person 클래스의 getName() 메소드에서 "Dongho Sim"을 리턴하도록 설정하였지만,
getAge() 메소드에 대해서는 24를 리턴하도록 하였다. 39번 라인에서 AssertionError가 발생하는 것을 확인할 수 있다.

<br>
### When 02

 다음 getList() 메소드와 같이 조금 복잡한 메소드에 대해서 return을 어떻게 사용을 해야할까?

![2017-02-12-spring_mockito_usage_05.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_05.jpg)

 매개변수가 어떤 값이라도 관계가 없다면, any...로 시작하는 메소드를 사용한다.
밑의 예에서는 anyString() 밑 anyInt()를 사용하였다.

![2017-02-12-spring_mockito_usage_06.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_06.jpg)

 만약 특정 값을 넣어야 한다면, eq() 메소드를 사용하여 매개변수 값을 넣어준다.

<br>
### doThrow
 테스트할 클래스의 어떤 메소드에서 특정 예외를 던지고 싶을 때에는 doThrow() 메소드를 사용한다.

![2017-02-12-spring_mockito_usage_07.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_07.jpg)

 위의 예에서는 Person클래스의 setName() 메소드 호출시,  IllegalArgumentException이 던지도록 하였다.
@Test annotation에 해당 exception을 설정하였으므로, 테스트가 통과하는 것을 알 수 있다.

<br>
### doNothing

 리턴 값이 없는 메소드에 대해서 when을 걸 때는 doNothing()을 사용하도록 한다.

![2017-02-12-spring_mockito_usage_08.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_08.jpg)


<br>
### Verify

 Verify() 메소드는 테스트할 특정 메소드가 호출되었는지를 여러가지 조건으로 체크한다.
단순한 호출 횟수 뿐만 아니라, 타임아웃 시간까지 지정해서 체크할 수 있다.

![2017-02-12-spring_mockito_usage_09.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_09.jpg)

 위의 예에서 setName() 메소드에 "ETC" 라는 String을 넣은적이 없으므로, fail이 발생하는 것이다..

<br>
### @InjectMocks

 만약 테스트할 클래스 내부에 다른 클래스를 포함할 경우에 어떻게 테스트해야할까?
비즈니스 로직을 점검할 때 일일이 외부에서 주입하도록 setter 메소드나 생성자를 구현해야할까?

 mocktio 에서는 이런 경우를 위해 @InjectMocks annotation을 제공한다.
이 annotation은 @Mock이나 @Spy annotation이 붙은 mock 객체를 테스트 클래스의 멤버 클래스와 일치하면
주입시켜준다.

 예를 들어 다음과 같이 AuthDao와 AuthService 클래스가 있다고 하자.
AuthService는 AuthDao를 포함하고 AuthService의 isLogin() 메소드는 AuthDao를 사용하여 로직을 구현하고 있다.

![2017-02-12-spring_mockito_usage_10.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_10.jpg)
![2017-02-12-spring_mockito_usage_11.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_11.jpg)

 테스트하고 싶은 것은 AuthService의 isLogin() 메소드이다.
이 메소드에서는 AuthDao의 isLogin() 메소드의 반환 값에 따라 다르게 동작한다.

따라서 AuthService의 isLogin() 메소드를 테스트하고 싶을 때, AuthDao의 isLogin() 메소드가 리턴하는
값을 조작할 필요가 있다.

 다음은 해당 상황을 mockito 로 처리한 것이다.

![2017-02-12-spring_mockito_usage_12.jpg](/static/assets/img/blog/web/2017-02-12-spring_mockito_usage/2017-02-12-spring_mockito_usage_12.jpg)

 위의 예에서 @InjectMocks annotation을 써서 AuthService 객체에 AuthDao 객체를 주입하고 있으며,
해당 AuthDao 객체의 isLogin 메소드는 "Dongho Sim" String을 받을 때 true를 리턴하도록 설정하였다.

 따라서 "Dongho Sim" String을 매개 변수로 전달하면 true를 리턴하고, 그 외에는 false를 리턴할 것이다.

### [Source Link][src_url]

[src_url]: https://github.com/dhsim86/tobys_spring_study/commit/fbb6f68d9bf9904bc10f76322ca3611b6e6822d8
