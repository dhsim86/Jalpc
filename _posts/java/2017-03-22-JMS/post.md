---
layout: post
title:  "JMS, Java Messaging System"
date:   2017-03-22
desc: "JMS, Java Messaging System"
keywords: "server programming"
categories: [Java]
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

![00.png](/static/assets/img/blog/java/2017-03-22-JMS/00.png)

위의 그림을 살펴보면 Java 애플리케이션은 표준화된 JMS API를 통해 Messaging System을 사용하게 된다.
JMS API는 각 Messaging System 벤더에서 제공하는 Provider Code를 통해 구현되어 있기 때문에, Java 애플리케이션 개발자는 JMS라는 표준 API만 사용한다면 대부분의 Messaging System을 이용할 수 있다.

> JMS라는 표준이 있긴하지만, 각 Messaging System의 특성에 따라 동작이 달라질 수 있다.

또한 Messaging System의 경우 JMS API 뿐만 아니라, C/C++과 같은 Non-Java 언어를 위한 라이브러리를 따로 제공하는 경우가 있는데, 이런 경우에는 Java 애플리케이션이 다른 언어로 개발된 애플리케이션과 호환이 되므로 서로 다른 언어로 만들어진 애플리케이션과 연동하는데도 많이 쓰인다.

<br>
### Feature of JMS

그럼 JMS API에는 어떤 특징이 있는지 살펴보자.

A 애플리케이션과 B 애플리케이션이 통신을 한다고 했을 때, 통신하는 방법은 방식에 따라 **data-centric** 이냐, **interface-centric** 이냐로 분리될 수 있다.

RMI, IIOP, SOAP 또는 직접 TCP Packet를 정의하여 socket으로 통신하는 방식은 **interface-centric** 방식이라고 한다.
데이터를 보내는 sender에서 데이터를 보내면, receiver는 어떤 데이터 형이 올지를 미리 알고 있다. (데이터 타입이 미리 약속되어 있다.) 마찬가지로, sender는 receiver가 어떤 형식의 데이터를 받을 것인지를 알고 있고, receiver는 그 데이터가 올 때까지 기다리는게 일반적인 흐름이다.
* 즉, 서로 통신을 하는 애플리케이션들이 데이터 타입이나 동작 방법에 대해서 서로 알고 있다.

그러나 JMS의 경우 **data-centric** 방식으로, sender는 데이터를 보내기만 한다. Receiver가 데이터를 받았건 말건, 내지는 receiver의 수가 얼마나 존재하는지는 상관하지 않는다.
JMS에서 sender는 JMS의 messaging system에 데이터를 보내기만 한다. Receiver는 이렇게 messaging system에 보내진 데이터를 중계해서 받으며, 이때 데이터 타입은 미리 정해져 있는 것이 아니다. (물론 데이터를 받으면 receiver가 처리할 수 있게 알맞은 방식으로 casting 하는 것이 필요하다.)
중요한 것은 데이터 형을 몰라도 데이터를 받는 것 자체는 문제가 없고, 따라서 이런 방식에는 sender와 receiver 간의 약속이 필요하지 않다.

<br>
### Asynchronous messaging

기본적으로 JMS messaging 시스템은 asynchronous 방식의 messaging을 지원한다. **interface-centric** 방식의 경우 데이터를 보내면 ack를 받거나 return 값을 받을 때까지는 sender는 waiting을 하게 되는 synchronous 방식으로 동작한다. 물론 receiver 역시, 계속 sender로부터 데이터가 오기를 기다린다.

그러나 asynchronous 방식에서 sender는 일단 messaging system에 데이터를 보내며, receiver가 데이터를 받았는지 안받았는지 여부를 확인할 필요가 없다. 따라서 sender는 계속해서 데이터를 보내게 되고, 데이터를 다 보내면 다른 일을 할 것이다.
Receiver는 sender로부터 데이터가 오기만을 기다리는 것이 아니라, 필요할 때 messaging system에 저장되어 있는 데이터를 꺼내서 바로 사용하면 된다.

* 즉 sender와 receiver 사이의 데이터 전송 작업이 동시에 일어나지 않는다.

<br>
### Reliable and unreliable messaging

앞에서 언급하였듯이, JMS에서 sender는 receiver의 상태에 상관없이 데이터를 보낸다고 설명하였다.
여기서 생각해야 될 것은 어떻게 sender가 보낸 데이터를 receiver가 받을 수 있도록 보장하냐라는 것이다. (네트워크 문제나 기타 이유로 데이터가 손실될 수 있다.)

이러한 점은 JMS messaging system이 보장해준다. Reliable messaging의 경우, sender가 데이터를 보냈으면 system이 중간에 다운되더라도 보낸 데이터는 receiver가 받을 수 있도록 보장한다.

다만, 신뢰성이 중요하지 않고 데이터가 전송되는 시간이 중요하다면 unreliable messaging을 이용하여 별도의 보장없이 데이터를 빨리 전송하는데에만 초첨을 맞출 수도 있다.

<br>
### Queue / Bus

JMS messaging system에서 sender가 데이터를 보내는 destination이 되고, receiver가 데이터를 읽어오게 되는 부분을 **Queue** 또는 **Bus** 라고 이야기 한다.

예를 들어, 포털 쇼핑몰에 입점한 여러 쇼핑몰이 있다고 하였을 때, 포털 쇼핑몰에서는 주문 내용을 데이터로 만들어 보내고, 이 데이터를 컴퓨터에 대한 주문은 **Queue A** 로, 전자제품에 대한 주문은 **Queue B** 로 보낸다고 하자.

컴퓨터 판매 쇼핑몰은 **Queue A** 로부터 주문 정보를 받고, 전자제품 쇼핑몰은 **Queue B** 로부터 주문을 받을 수 있다.

**Queue** 는 sender와 receiver 간의 데이터를 주고 받는 채널의 역할을 한다.

만약 여기서 포털 쇼핑몰이 하나 더 늘어났다고 가정했을 때, 주문 연동은 간단하게 할 수 있다. 새로운 포털 쇼핑몰이 기존 컴퓨터 판매 쇼핑몰에 주문을 넘기기 위해 **Queue A** 에 주문 내용을 보내기만 하면 된다.

이처럼 JMS messaging system에는 Queue의 개념을 이용하면 데이터의 경로 배정 (Routing)을 매우 유연적으로 할 수 있으며 업무 흐름 (Work flow)를 구현하는데 큰 강점으로 작용한다.
