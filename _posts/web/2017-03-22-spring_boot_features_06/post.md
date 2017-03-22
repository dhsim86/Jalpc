---
layout: post
title:  "JMS, Java Messaging System"
date:   2017-03-22
desc: "JMS, Java Messaging System"
keywords: "server programming"
categories: [Web]
tags: [java, messaging]
icon: icon-html
---

> Spring Boot Reference Guide Part4, Chapter 32 messaging

## JMS

먼저 Spring 에서 사용하는 messaging feature를 설명하기 전에, JMS란 무엇인가에 대해 살펴보자.

JMS는 Java Messaging System의 약자로 Java에서 Messaging System을 사용하기 위한 API들의 정의이다.

<br>
### Messaging System
Messaing System이란 애플리케이션 사이에서의 통신을 하도록 지원해주는 시스템을 이야기한다.

예를 들어, 각 지점에 설치된 매출 관리 시스템 A라는 애플리케이션과 본점에 설치된 B라는 애플리케이션이 있다고 하자.
A 애플리케이션은 매출이 발생할 때마다 그 내용을 로컬에 저장하기도 하겠지만, 그 내용을 본사에 전송해서 취합한다고 하자.

일반적으로 Messaging System이 만들어기 전에는 이런 업무를 A와 B 애플리케이션 사이에 socket을 직접 연결해서 packet을 정의하고, 그 packet에 따라서 통신했다. 이 통신을 위해 packet에 대한 flow control이나 네트워크에 문제 발생시 예외처리들을 직접 프로그래밍을 해야했다. 

그러나 Messaging System을 통해 이런 모든 통신에 대한 여러 기능을 제공하여 통신에 대한 부분을 간결화시켜준다.

Messaging System에는 이외에도 하나의 Producer가 여러 Consumer에게 메시지를 전송하는 모델이나 P2P 모델, 메시지가 전송되는 것을 보장하는 Reliable Messaging, 비동기방식으로 메시지 전달, 분산 트랜잭션, 클러스터링 등을 지원한다.

<br>
### What is JMS?

JMS는 앞서 언급하였듯이, 이런 Messaging System을 Java에서 사용하기 위한 표준 API들의 집합이다. 우리가 DBMS를 사용할 때 JDBC를 사용하는 것처럼, JMS는 Messaging System을 사용하기 위한 API 인것이다.

![00.png](/static/assets/img/blog/web/2017-03-22-spring_boot_features_06/00.png)

위의 그림을 살펴보면 Java 애플리케이션은 표준화된 JMS API를 통해 Messaging System을 사용하게 된다.
JMS API는 각 Messaging System 벤더에서 제공하는 Provider Code를 통해 구현되어 있기 때문에, Java 애플리케이션 개발자는 JMS라는 표준 API만 사용한다면 대부분의 Messaging System을 이용할 수 있다.

> JMS라는 표준이 있긴하지만, 각 Messaging System의 특성에 따라 동작이 달라질 수 있다.

또한 Messaging System의 경우 JMS API 뿐만 아니라, C/C++과 같은 Non-Java 언어를 위한 라이브러리를 따로 제공하는 경우가 있는데, 이런 경우에는 Java 애플리케이션이 다른 언어로 개발된 애플리케이션과 호환이 되므로 서로 다른 언어로 만들어진 애플리케이션과 연동하는데도 많이 쓰인다.

<br>
### Feature of JMS
