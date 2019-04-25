---
layout: post
title:  "REST (REpresentational State Transfer)"
date:   2017-03-24
desc: "REST (REpresentational State Transfer)"
keywords: "web, rest, rest api"
categories: [Web]
tags: [web]
icon: icon-html
---

# REST (REpresentational State Transfer)

REST는 네트워크 구조 원리의 모음으로, **리소스를 정의하고 자원에 대한 주소를 지정하는 방법에 대한 조건** 들을 의미한다.
즉 도메인 지향 데이터를 HTTP 위에서 부가적인 전송 레이어 없이 전송하기 위한 간단한 구조를 정의한 것이다.

2000년에 Roy Fielding이 자신의 논문에서 REST(Representational State Transfer) 라고 이름을 붙인 웹의 구조적 스타일에 대한 제약 조건을 설명하였다. 그 조건들은 다음과 같다.

1. 클라이언트 / 서버: 웹의 일관된 인터페이스를 따른다는 전체하에 클라이언트와 서버는 독립적으로 구현되어야 한다.
2. 균일한 인터페이스: 자원 식별, 표현을 통한 자원 처리, 자기서술적 메시지, HATEOAS(Hypermedia as the Engine of Application State) 같은 인터페이스 제약에 따라 서로 일관성 있게 상호 운영되어야 한다.
3. 계층 시스템: 웹의 일관된 인터페이스를 사용해서 프록시 또는 게이트웨이 같은 네트워크 기반의 중간 매체를 사용할 수 있어야 한다.
4. 캐시 처리: 웹 서버가 응답 데이터마다 캐시 여부를 선언할 수 있어야 한다.
5. 무상태: 웹 서버가 클라이언트의 상태를 관리할 필요가 없어야 한다.
6. 주문형 코드: 선택사항으로, 스크립트가 플러그인 같은 실행 가능한 프로그램을 클라이언트에 전송하여 클라이언트가 실행할 수 있도록 해야한다.

이러한 REST 원리를 충실히 따르면, **'RESTful'** 하다고 할 수 있다.

<br>
## REST API

웹 서비스는 네크워크 상에서 서로 다른 시스템 간의 상호작용을 위한 기술이다.
이는 주고 받는 데이터 형식에 대한 표준을 정의함으로써 플랫폼과 프로그램 언어와는 독립된 방법으로 서로 연동할 수 있다.

간단히 말하면, 클라이언트가 웹 서버에서 제공하는 API를 이용하여 데이터와 기능을 제공받을 수 있다.

예전에는 SOAP (Simple Object Access Protocol)을 기반으로 웹 서비스를 많이 구현하였다. 하지만 SOAP 처리의 오버헤드 및 복잡성 때문에 요즘에는 REST 구조 스타일을 사용한 웹 서비스를 많이 사용한다. 이런 REST 구조 스타일에 적합한 API를 REST API 라고 한다.

<br>
![00.png](/static/assets/img/blog/web/2017-03-24-REST/00.png)

<br>
## Resource

REST API는 URI (Uniform Resource Identifier) 경로를 사용해서 자원을 나타내고, 포워드 슬래시 (/)로 경로 구문을 나눈다.
예를 들어 bookstoare 사이트의 1번 책은 **http://www.bookstoare.com/books/1** 이라고 나타낼 수 있다. 이 경로 구문은 자원 계층에서 유일한 자원을 나타낸다.

그렇다면 해당 자원에 대한 행위는 어떻게 나타내야 할까? REST API에서는 **CRUD** 기능을 수행할 때는 URI에 나타내지 않는다.
URI는 자원을 식별할 때만 사용하고, CRUD 기능을 수행할 때는 HTTP Request Methoad를 사용한다. 즉, **GET, POST, PUT, DELETE** 메소드를 이용하여 처리한다.

| HTTP Method | 의미 | CRUD |
| ---------- | :--------- | :----------: |
| POST | 새로운 자원을 생성한다. | Create |
| GET | 자원을 조회한다. | Read |
| PUT | 기존에 존재하는 자원을 변경한다. | Update |
| DELETE | 기존에 존재하는 자원을 삭제한다. | Delete |
