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

위의 그림에서 **푸른색 vertex로 표현된 것은 살아있는 객체라 판별된 객체이다. 이 단계가 끝나면 살아있는 모든 객체는 모두 Marking 되었을 것이며,** 그 외의 모든 객체들은 (위의 그림에서 회색 그래프로 표현된 객체들) GC Roots로부터 닿지 않는, 애플리케이션에서 더 이상 사용되지 않는 객체들로 간주된다. 이 객체들은 GC의 대상이며, 다음 단계에서 GC 알고리즘은 이 객체들이 점유한 메모리를 회수해야 한다.

Marking 단계에는 알아야 할 중요한 것은 다음과 같다.

* 이 단계에서 **애플리케이션 스레드는 잠시 멈출 필요가 있다.** 애플리케이션 스레드를 멈추지 않고 이 단계를 진행하면, 애플리케이션 스레드가 하는 일에 따라 영원히 끝나지 않을 수 있다. (그래프가 계속 변하게 될 것이므로). 따라서 애플리케이션 스레드를 잠시 멈추고 살아있는 객체들을 정확히 판별한다. 그래서 보통 GC 알고리즘에서 이 단계는 **Stop-The-World 이벤트이다.** (여러 단계로 나누어서 애플리케이션 스레드와 동시에 일을 할 수 있더라도 Stop-The-World 이벤트를 트리거하는 단계는 반드시 있다.)
* 이 단계에서 걸리는 시간은 heap 영역의 크기나 전체 객체의 수가 아니라, **살아있는 객체의 수에 비례한다.** 따라서 heap 영역 사이즈를 늘린다고 이 단계에서 걸리는 시간에 직접적인 영향을 주지는 않는다.

이 단계가 끝나면 GC는 다음 단계인, 사용되지 않는 객체를 정리하는 단계로 넘어갈 수 있다.

<br>
### Removing Unused Objects

더 이상 사용되지 않는 객체의 메모리를 회수하는 일은 GC 알고리즘마다 구현이 다르긴 하지만, 보통 **Mark and Sweep, Mark-Sweep-Compact, Mark and Copy 중의 하나에 들어간다.**

<br>
### Sweep

**Mark and Sweep**에서 이 Sweep 단계는 Marking 단계가 끝난 후, GC Roots 및 살아있는 객체로 표현되는 그래프에 포함되지 않는 객체들의 **메모리 영역이 회수한다.** 회수된 메모리 영역은 내부적으로 이 영역을 관리하는 **free-list** 라는 자료구조를 통해 관리한다. 아마도 이 자료구조는 다시 사용할 수 있는 영역과 그 것의 크기를 기록해두었을 것이다.

<br>
![01.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/01.png)

> 메모리 단편화 여부에 따라 전체 메모리 공간은 충분하나, 실제 객체 생성을 할 수 있는 **충분한 연속적인 공간이 없다면** OOM이 발생할 수도 있다.

<br>
### Compact

**Mark-Sweep-Compact**의 Compact 단계에서 실제로 살아있는, **Marking 된 객체들을 메모리 영역의 처음부터 몰아넣음으로써 Marn and Sweep의 단점을 제거한다.** 이는 실제 객체를 복사하고 이 객체들의 참조 정보를 업데이트함으로써 이루어지는데, GC의 시간을 증가시킨다. 하지만 이 것을 통해 얻을 수 있는 이익은 여러 가지가 있다.

* 메모리 단편화를 줄임으로써 발생하는 문제를 해결할 수 있다. (메모리 생성 실패 문제와 같은)
* 연속적인 공간에서 객체 생성을 하는 것은 아주 적은 연산을 필요로 한다.
    * 즉, 새로 객체를 생성하기 위해 적절한 메모리를 찾는 연산을 동반하는 파편화된 메모리 공간에서 할당하는 것보다 빠르다.

<br>
![02.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/02.png)

<br>
### Copy

**Mark and Copy**의 Copy 단계는 메모리 영역을 여러 영역으로 나누고, **살아있는 객체를 다른 영역으로 복사한다는 것을 의미한다.** 
(ex. Eden -> Survivor / From survivor -> To survivor / Survivor -> Old)

<br>
![03.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/03.png)

다른 영역으로 살아있는 객체를 옮기는 것이므로, Marking과 Copy 단계를 동시에 할 수 있다는 이점이 있다.

---

<br>
## Java 에서의 GC 알고리즘들

JVM 에서는 Generational Hypothesis 개념에 따라 **Young 영역 및 Old 영역으로 메모리 공간을 나누고, 각 영역에 대한 GC 알고리즘도 다르게 적용한다.**

JVM에서 제공하는 GC 알고리즘은 옵션을 통해 선택할 수 있으며, 선택하지 않으면 디폴트로 지정된 GC 알고리즘을 사용하게 된다.

다음은 옵션에 따라 적용되는 GC 알고리즘을 나타낸 것이다.

<br>

| Young GC | Old GC | JVM Options |
| --- | --- | --- |
| Incremental | Incremental | -Xincgc |
| **Serial** | **Serial** | **-XX:+UseSerialGC** |
| Parallel Scavenge | Serial | -XX:+UseParallelGC -XX:-UseParallelOldGC |
| Parallel New | Serial | N/A |
| Serial | Parallel Old | N/A |
| **Parallel Scavenge** | **Parallel Old** | **-XX:+UseParallelGC -XX:+UseParallelOldGC** |
| Parallel New | Parallel Old | N/A |
| Serial | CMS | -XX:-UseParNewGC -XX:+UseConcMarkSweepGC |
| Parallel Scavenge | CMS | N/A |
| **Parallel New** | **CMS** | **-XX:+UseParNewGC -XX:+UseConcMarkSweepGC** |
| **G1** | **G1** | **-XX:+UseG1GC** |

<br>
복잡하게 보이지만, 다음 4가지 케이스만 알아두면 된다. JVM Option이 없는 것들은 deprecated 되었거나, 실제 사용에 있어서는 적절하지 않은 알고리즘들이다.

* Serial GC (Young 영역 / Old 영역 모두)
* Parallel GC (Young 영역 / Old 영역 모두)
* Parallel New (Young 영역) + Concurrent Mark and Sweep (CMS, Old 영역)
* G1 (Young / Old 를 나타내는 바둑판(?) 영역)

<br>
## Serial GC

이 알고리즘에서는 **Young 영역에 대해서는 Mark-Copy, Old 영역에 대해서는 Mark-Sweep-Compact 를 사용한다.** Serial GC 라는 이름을 통해 짐작할 수 있겠지만, **하나의 스레드에 의해 수행되며 Young 영역 및 Old 영역에 대한 GC는 모두 Stop-The-World 를 일으킨다.**

JVM에서 이 알고리즘을 사용하기 위해서는 다음과 같이 JVM 파라미터를 설정하면 된다.

```
java -XX:+UseSerialGC com.mypackages.MyExecutableClass
```

**하나의 스레드를 통해 수행되므로, 멀티 코어의 이점을 제대로 못살린다.** CPU 코어가 몇 개이든 상관없이 이 GC를 사용할 때는 CPU 코어 하나만 사용하게 된다. 따라서 CPU가 하나인, 작은 크기의 heap 영역만 있으면 되는 환경일 때만 사용하는 것이 권장된다. 멀티코어 / 큰 크기의 메모리를 갖는, 시스템 리소스를 많이 사용할 수 있는 서버 환경에서 이 GC를 사용하는 것은 권장되지 않는다.

다음은 Serial GC를 사용하였을 때의 GC log 이다.
참고로, GC log를 확인하기 위해 다음과 같이 JVM 파라미터를 설정한다.
```
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps
```


```
2018-05-26T14:45:37.987-0200: 151.126: [GC (Allocation Failure) 151.126: [DefNew: 629119K->69888K(629120K), 0.0584157 secs] 1619346K->1273247K(2027264K), 0.0585007 secs] [Times: user=0.06 sys=0.00, real=0.06 secs]
2018-05-26T14:45:59.690-0200: 172.829: [GC (Allocation Failure) 172.829: [DefNew: 629120K->629120K(629120K), 0.0000372 secs]172.829: [Tenured: 1203359K->755802K(1398144K), 0.1855567 secs] 1832479K->755802K(2027264K), [Metaspace: 6741K->6741K(1056768K)], 0.1856954 secs] [Times: user=0.18 sys=0.00, real=0.18 secs]
```

단 두 줄밖에 되지 않는 로그이지만 많은 정보를 가지고 있다. 위 로그를 통해 두 번의 GC가 일어났다는 것을 알 수 있는데, 하나는 Young 영역에 대한 GC (Minor GC)이고 다른 하나는 heap 영역 전체에 대한 GC (Full GC)이다.

<br>
### Minor GC

```
2018-05-26T14:45:37.987-0200: 151.126: [GC (Allocation Failure) 151.126: [DefNew: 629119K->69888K(629120K), 0.0584157 secs] 1619346K->1273247K(2027264K), 0.0585007 secs] [Times: user=0.06 sys=0.00, real=0.06 secs]
```

다음은 이 로그에서 알 수 있는 내용들이다.

<div class="code-line-wrap">
<p class="code-line"><span class="node">2015-05-26T14:45:37.987-0200<sup>1</sup></span>:<span class="node">151.126<sup>2</sup></span>:[<span class="node">GC<sup>3</sup></span>(<span class="node">Allocation Failure<sup>4</sup></span>) 151.126: [<span class="node">DefNew<sup>5</sup></span>:<span class="node">629119K-&gt;69888K<sup>6</sup></span><span class="node">(629120K)<sup>7</sup></span>, 0.0584157 secs]<span class="node">1619346K-&gt;1273247K<sup>8</sup></span><span class="node">(2027264K)<sup>9</sup></span>,<span class="node">0.0585007 secs<sup>10</sup></span>]<span class="node">[Times: user=0.06 sys=0.00, real=0.06 secs]<sup>11</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">2015-05-26T14:45:37.987-0200</span> –GC가 일어난 시간</li>
<li class="description"><span class="node">151.126</span> – GC가 일어났을 때, JVM이 수행된 시간</li>
<li class="description"><span class="node">GC</span> – Minor GC / Full GC를 구분하는 플래그, 여기서는 Minor GC를 의미한다.</li>
<li class="description"><span class="node">Allocation Failure</span> – GC가 일어난 원인, 여기서는 Young 영역에서 새로운 객체를 생성하기 위한 공간이 부족해서 발생한 것이다. </li>
<li class="description"><span class="node">DefNew</span> – Garbage Collector의 이름. 이 Collector는 Young 영역에 대한 GC를 수행하는데, 싱글 스레드 기반 / Mark-Copy / Stop-The-World 이다.</li>
<li class="description"><span class="node">629119K-&gt;69888K</span> – GC 전후의 Young 영역의 사용량</li>
<li class="description"><span class="node">(629120K)</span> – Young 영역의 전체 크기</li>
<li class="description"><span class="node">1619346K-&gt;1273247K</span> – GC 전후의 Heap 영역의 사용량</li>
<li class="description"><span class="node">(2027264K)</span> – Heap 영역의 전체 크기</li>
<li class="description"><span class="node">0.0585007 secs</span> – GC가 수행된 시간 (초)</li>
<li class="description"><span class="node">[Times: user=0.06 sys=0.00, real=0.06 secs]</span> – GC가 수행된 시간인데, 각 시간은 다음과 같다.:
<ul>
<li>user – GC가 진행되는 동안 Garbage Collector에 의해 수행된 CPU 시간이다.</li>
<li>sys – System Call과 같이 OS가 수행하거나 기다린 시간이다.</li>
<li>real – 애플리케이션이 GC로 인해 멈춘 시간이다. Serial GC는 싱글 스레드 기반의 Stop-The-World를 일으키는 GC이므로, 이 시간은 user 와 sys 시간을 합친 것과 같다. </li>
</ul>
</li>
</ol>
</div>

위의 로그를 통해 해당 GC 이벤트 전후로 Memory 사용량이 어떻게 변화하였는지 알 수 있다.
GC가 일어나기 전에는 Heap 영역의 사용량이 1,619,346K 이었다. 그리고 Young 영역의 사용량은 629,119K 인 것으로 보아, **Old 영역은 990,227K 이다.**

GC가 일어난 후, Young 영역은 559,231K 의 빈 공간을 확보하였는데,  Heap 영역의 사용량은 346,099K 밖에 줄어들지 않았다.
**이를 통해 213,132K 만큼의 오브젝트들이 Young 영역에서 Old 영역으로 이동하였다는 것을 알 수 있다.**

<br>
![04.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/04.png)

<br>
### Full GC

<br>
## Parallel GC

<br>
## Concurrent Mark and Sweep

## G1

<style>
ol li, ul li {
    min-height: 1px;
    vertical-align: bottom;
}

.code-line-wrap {
    margin: 30px 0;
    border-left: 3px solid #ddd;
    border-radius: 3px;
}
.code-line {
    margin: 0;
    padding: 10px;
    background: #faf8f6;
    color: #009cd5;
    line-height: 24px;
    text-shadow: 0 1px 0 #fff;
    font-family: consolas,"courier new",monospace;
    overflow: auto;
}
.code-line-wrap span.node {
    display: inline-block;
    padding: 0 3px;
    line-height: 18px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #fff;
    color: #009cd5;
    white-space: nowrap;
    font-family: consolas,"courier new",monospace;
}
.code-line-wrap ol {
    line-height: 20px;
}
.code-line-components {
    margin-left: 0;
    padding: 0 0 20px 3.038em;
    overflow: auto;
}
.code-line-wrap ol li {
    padding: 2px 5px;
    position: relative;
    transition-duration: 0.2s;
    border: 0 solid #fff;
}
</style>