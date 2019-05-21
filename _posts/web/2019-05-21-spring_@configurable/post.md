---
layout: post
title:  "Spring DDD - @Configurable을 활용한 도메인 객체 의존성 주입"
date:   2019-05-21
desc: "Spring DDD - @Configurable을 활용한 도메인 객체 의존성 주입"
keywords: "spring, aop, aspectj, DDD, Domain, Domain Driven Design, @Configurable, @EnableLoadTimeWeaving, @EnableSpringConfigured"
categories: [Web]
tags: [spring]
icon: icon-html
---

**스프링 프레임워크는 객체지향 프로그래밍의 장점을 극대화하도록 돕는 도구이다.** 
기술적인 복잡함을 IoC 및 Di, AOP, 서비스 추상화를 통해 개발자로 하여금 기술적인 문제를 쉽게 해결하고 최대한 비즈니스 로직에 집중할 수 있게 돕는 것이다. 자신이 개발하는 애플리케이션 로직에 집중할 수 있다면 객체지향 프로그래밍 언어의 장점을 살려 효과적으로 개발할 수 있을 것이다.

**수많은 애플리케이션에 다루어야 하는 문제에 대한 복잡성은 그 애플리케이션을 사용하는 사용자나 업무에 해당하는 도메인 그 자체이다.** 
도메인 주도 설계, 즉 DDD는 요구사항에 대한 회의부터 시작하여 코드의 구현에 이르기까지 통일된 언어를 바탕으로 도메인 문제를 해결하여 효과적인 커뮤니케이션, 각 요구사항에 잘 들어맞는 명확한 도메인 모델을 바탕으로 소프트웨어의 품질을 높이고자 하는 것이다.

스프링 프레임워크 기반으로 DDD의 설계 원칙을 잘 살린다면 모두가 웃으면서 커뮤니케이션을 하고 개발을 할 수 있을 것 같다. 좀 오래되긴 했지만 Spring Framework 2.0이 발표되면서 DDD 방식의 개발을 지원하기 위해 많은 노력이 들어갔다고 한다. (물론 프레임워크 스스로도 DDD의 장점을 살려 개발되었다고 한다.) 그 중 하나가 @Configurable을 통한 도메인 객체에 대한 의존성 주입이다.

<br>

## @Configurable

