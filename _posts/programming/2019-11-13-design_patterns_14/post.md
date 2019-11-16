---
layout: post
title:  "디자인 패턴 14 - 명령(Command)"
date:   2019-11-12
desc:  "디자인 패턴 14 - 명령(Command)"
keywords: "디자인 패턴, Design Patterns, 행동 패턴, 명령, Command"
categories: [Programming]
tags: [Design Patterns]
icon: icon-html
---

명령(Command) 패턴은 **요청 자체를 캡슐화**하는 패턴이다. 이를 통해 **요청 처리하는 것을 호출하는 객체와 이를 수행하는 객체를 분리시켜 융통성을 확보할 수 있다.**

드물지만 요청받은 연산이 무엇인지, 또는 이 요청을 처리할 객체가 누구인지 아무런 정보없이, 어느 임의의 객체로 요청을 보내야할 때가 있다. 예를 들면 버튼, 메뉴를 추상화하는 사용자 인터페이스 툴킷은 사용자로부터 직접 명령을 받아 이 툴킷을 사용하는 애플리케이션으로 명령을 처리하도록 전달해야 하는데, 툴킷 입장에서는 이 명령이 애플리케이션의 어느 객체가 처리할 수 있을지 알 수 없다.

명령 패턴의 핵심은 **연산을 실행하는데 필요한 인터페이스를 정의하는 추상 클래스(Command)**이다. 이 클래스에는 **명령을 처리하는 기본적인 연산(execute)**를 정의하며, 이를 구현하는 서브 클래스들이 **명령을 처리할 객체를 인스턴스 필드로 저장하고, 이 객체에 요청을 호출하도록 execute를 구현**하는 것이다.

![00.png](/static/assets/img/blog/programming/2019-11-13-design_patterns_14/00.png)

Invoker에서 명령을 처리할 것을 요청하며, ConcreteCommand가 이 명령을 받아 실제 처리할 객체인 Receiver로 명령을 전달하며 처리할 수 있도록 한다. 이를 통해 **요청 처리하는 것을 호출하는 객체(Invoker)와 이를 수행하는 객체(Receiver)를 Command 객체를 통해 분리**할 수 있다.

