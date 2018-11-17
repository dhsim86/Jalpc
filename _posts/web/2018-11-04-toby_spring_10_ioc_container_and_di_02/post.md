---
layout: post
title:  "Toby's Spring Chap 10: IOC 컨테이너와 DI part.2"
date:   2018-11-04
desc: "Toby's Spring Chap 10: IOC 컨테이너와 DI part.2"
keywords: "spring"
categories: [Web]
tags: [spring]
icon: icon-html
---

<br>
## 빈 설정 메타정보 작성

IoC 컨테이너의 가장 기본적인 역할은 **코드를 대신하여 애플리케이션을 구성하는 오브젝트를 생성하고 관리하는 것이다.** 컨테이너는 빈 설정 메타정보를 통해 빈의 클래스와 이름을 제공받아 활용한다.

설정 메타정보는 외부 리소스에 맞는 리더를 통해 읽어 BeanDefinition 타입의 오브젝트로 변환되고 이를 컨테이너가 활용하는 것이다.

BeanDefinition 은 순수한 오브젝트로 표현되는 빈 생성 정보로 메타정보가 작성되는 형식의 종류와 작성 방식에 독립적이다.

<br/>

![00.png](/static/assets/img/blog/web/2018-11-04-toby_spring_10_ioc_container_and_di_02/00.png)

<br/>
### 빈 설정 메타정보

몇 가지 필수 값을 제외하면 컨테이너에 미리 지정된 디폴트 값이 적용된다. BeanDefinition은 여러 개의 빈을 만들기 위해 재사용될 수도 있다. 메타정보는 같으나 이름이 다른 여러 개의 빈 오브젝트를 만들 수도 있기 때문이다. 따라서 BeanDefinition에는 빈의 이름이나 아이디를 나타내는 정보는 포함되지 않는다.

---
**빈 등록 방법**

빈 등록은 빈 메타정보를 작성해서 컨테이너에게 건네주면 된다. 

가장 직접적인 방식으로 BeanDefinition 구현 오브젝트를 직접 생성하는 것이지만, 보통 XML이나 프로퍼티 파일, 자바 configuration을 통한 외부 리소스로 빈 메타정보를 작성하고 리더나 변환기를 통해 애플리케이션 컨텍스트가 사용할 수 있는 정보로 변환해주는 방법을 사용한다.