---
layout: post
title:  "Garbage Collection Algorithms"
date:   2018-02-05
desc:  "Garbage Collection Algorithms"
keywords: "java"
categories: [Java]
tags: [java]
icon: icon-html
---

# Garbage Collection Algorithms

<br>
## GC Algorithms: Basics

자바의 GC 알고리즘들을 설명하기에 앞서서, 이 알고리즘을 설명하는데에 있어서 필요한 기본 개념을 다시 살펴볼 필요가 있다. GC 알고리즘마다 다르긴 하지만 보통 GC 알고리즘들은 다음 두 가지 일에 포커싱을 맞춘다.

* 현재 살아있는 객체를 판별하는 것
* 더 이상 사용되지 않는다고 간주되는, 그 외의 객체는 정리하는 것

GC에 구현된 살아있는 객체를 조사하는 첫 번째 일은 **Marking**이라 부른다.

<br>
### Marking Reachable Objects

JVM에서 사용할 수 있는 모든 GC 알고리즘은 **어느 객체가 살아있는지 조사하는 것부터 시작한다.** 이 컨셉은 다음 그림에서 보여주는 JVM의 메모리 레이아웃을 통해 설명할 수 있다.

<br>
![00.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/00.png)

첫 번째로, GC는 먼저 **Garbage Collection Roots (GC Roots)**라 불리는 특별한 객체를 정의한다. 다음은 GC Roots라 불릴 수 있는 객체의 종류이다.

* 지역 변수나 현재 수행되고 있는 메소드의 파라미터 객체들
* 활성화된 스레드
* Static 객체
* JNI 참조 정보

다음으로, GC는 **GC Roots로부터 시작하여, 객체가 참조하는 것을 따라가며 (위 그림을 대변하자면, 객체 그래프를 순회하며) 살아있는 모든 객체를 탐색한다.** 탐색된 모든 객체는 **Marked** 된다.

위의 그림에서 **푸른색 vertex로 표현된 것은 살아있는 객체라 판별된 객체이다. 이 단계가 끝나면 살아있는 모든 객체는 모두 Marking 되었을 것이며,** 그 외의 모든 객체들은 (위의 그림에서 회색 그래프로 표현된 객체들) GC Roots로부터 닿지 않는 더 이상 사용되지 않는 객체들로 간주된다. 이 객체들은 GC의 대상이며, 다음 단계에서 GC 알고리즘은 이 객체들이 점유한 메모리를 회수해야 한다.

Marking 단계에는 알아야 할 중요한 것은 다음과 같다.

* 이 단계에서 **애플리케이션 스레드는 잠시 멈출 필요가 있다.** 애플리케이션 스레드를 멈추지 않고 이 단계를 진행하면, 애플리케이션 스레드가 하는 일에 따라 영원히 끝나지 않을 수 있다. (그래프가 계속 변하게 될 것이므로). 따라서 애플리케이션 스레드를 잠시 멈추고 살아있는 객체들을 정확히 판별한다. 그래서 보통 GC 알고리즘에서 이 단계는 **Stop-The-World 이벤트이다.** (여러 단계로 나누어서 애플리케이션 스레드와 동시에 일을 할 수 있더라도 Stop-The-World 이벤트를 트리거하는 단계는 반드시 있다.)
* 이 단계에서 걸리는 시간은 heap 영역에 있는 전체 객체의 수가 아니라, **살아있는 객체의 수에 비례한다.** 따라서 heap 영역 사이즈를 늘린다고 이 단계에서 걸리는 시간에 직접적인 영향을 주지는 않는다.

이 단계가 끝나면 GC는 다음 단계인, 사용되지 않는 객체를 정리하는 단계로 넘어갈 수 있다.

<br>
### Removing Unused Objects

더 이상 사용되지 않는 객체의 메모리를 회수하는 일은 GC 알고리즘마다 구현이 다르긴 하지만, 보통 **Mark and Sweep, Mark-Sweep-Compact, Mark and Copy 중의 하나에 들어간다.**

<br>
### Sweep

**Mark and Sweep**에서 이 Sweep 단계는 Marking 단계가 끝난 후, GC Roots 및 살아있는 객체로 표현되는 그래프에 포함되지 않는 객체들의 **메모리 영역을 회수한다.** 회수된 메모리 영역은 내부적으로 이 영역을 관리하는 **free-list** 라는 자료구조를 통해 관리한다. 아마도 이 자료구조는 다시 사용할 수 있는 영역과 그 것의 크기를 기록해두었을 것이다.

<br>
![01.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/01.png)

> 메모리 단편화 여부에 따라, 전체 메모리 공간은 충분하나 실제 객체 생성에 실패하여 OOM이 발생할 수도 있다.

<br>
### Compact

**Mark-Sweep-Compact**의 Compact 단계에서는 실제로 살아있는, **Marking 된 객체들을 메모리 영역의 처음부터 몰아넣는다.** 이는 실제 객체를 복사하고 이 객체들의 참조 정보를 업데이트함으로써 이루어지는데, GC의 시간을 증가시킨다. 하지만 이 것을 얻을 수 있는 이익은 여러 가지가 있다.

* 메모리 단편화를 줄임으로써 발생하는 문제를 해결할 수 있다. (메모리 생성 실패 문제와 같은)
* 연속적인 공간에서 객체 생성을 하는 것은 아주 적은 연산을 필요로 한다.
    * 즉, 새로 객체를 생성하기 위해 적절한 메모리를 찾는 연산을 동반하는 파편화된 메모리 공간에서 할당하는 것보다 빠르다.

<br>
![02.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/02.png)

<br>
### Copy

**Mark and Copy**의 Copy 단계는 메모리 영역을 여러 영역으로 나누고, **살아있는 객체를 다른 영역으로 복사한다는 것을 의미한다.** (Eden -> Survivor / From survivor -> To survivor / Survivor -> Old)

<br>
![03.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/03.png)

다른 영역으로 살아있는 객체를 옮기는 것이므로, Marking과 Copy 단계를 동시에 할 수 있다는 이점이 있다.

---

