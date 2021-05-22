---
layout: post
title:  "Java Garbage Collection Algorithms"
date:   2018-02-05
desc:  "Java Garbage Collection Algorithms"
keywords: "java, garbage collection, gc, cms, g1, 가비지 컬렉션"
categories: [Java]
tags: [java]
icon: icon-html
---

# Java Garbage Collection Algorithms

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

첫 번째로, GC는 먼저 **Garbage Collection Root (GC Root)**라 불리는 특별한 객체를 정의한다. 다음은 GC Root라 불릴 수 있는 객체의 종류이다.

* Class Loader에 의해 로딩된 클래스
* Local Variable / Parameters (지역 변수 / 매개 변수)
* Active Threads (현재 활성화된 스레드)
* Static fields (정적 변수)
* JNI Reference
  * JNI 메소드의 지역 변수 / 매개 변수
  * 전역 JNI 참조 변수
* Monitor로 사용된 객체

다음으로, GC는 **GC Root로부터 시작하여, 객체가 참조하는 것을 따라가며 (위 그림을 대변하자면, 객체 그래프를 순회하며) 살아 있는 모든 객체를 탐색한다.** 탐색된 모든 객체는 **Marked** 된다.

위의 그림에서 **푸른색 vertex로 표현된 것은 살아있는 객체라 판별된 객체이다. 이 단계가 끝나면 살아있는 모든 객체는 모두 Marking 되었을 것이며,** 그 외의 모든 객체들은 (위의 그림에서 회색 그래프로 표현된 객체들) GC Root로부터 닿지 않는, 애플리케이션에서 더 이상 사용되지 않는 객체들로 간주된다. 이 객체들은 GC의 대상이며, 다음 단계에서 GC 알고리즘은 이 객체들이 점유한 메모리를 회수해야 한다.

Marking 단계에는 알아야 할 중요한 것은 다음과 같다.

* 이 단계에서 **애플리케이션 스레드는 잠시 멈출 필요가 있다.** 애플리케이션 스레드를 멈추지 않고 이 단계를 진행하면, 애플리케이션 스레드가 하는 일에 따라 영원히 끝나지 않을 수 있다. (그래프가 계속 변하게 될 것이므로). 따라서 애플리케이션 스레드를 잠시 멈추고 살아있는 객체들을 정확히 판별한다. 그래서 보통 GC 알고리즘에서 이 단계는 **Stop-The-World 이벤트이다.** (여러 단계로 나누어서 애플리케이션 스레드와 동시에 일을 할 수 있더라도 Stop-The-World 이벤트를 트리거하는 단계는 반드시 있다.)
* 이 단계에서 걸리는 시간은 heap 영역의 크기나 전체 객체의 수가 아니라, **살아있는 객체의 수에 비례한다.** 따라서 heap 영역 사이즈를 늘린다고 이 단계에서 걸리는 시간에 직접적인 영향을 주지는 않는다.

이 단계가 끝나면 GC는 다음 단계인, 사용되지 않는 객체를 정리하는 단계로 넘어갈 수 있다.

<br>
### Removing Unused Objects

더 이상 사용되지 않는 객체의 메모리를 회수하는 일은 GC 알고리즘마다 구현이 다르긴 하지만, 보통 **Mark and Sweep, Mark-Sweep-Compact, Mark and Copy 중의 하나에 들어간다.**

<br>
### Sweep

**Mark and Sweep**에서 이 Sweep 단계는 Marking 단계가 끝난 후, GC Root 및 살아있는 객체로 표현되는 그래프에 포함되지 않는 객체들의 **메모리 영역이 회수한다.** 회수된 메모리 영역은 내부적으로 이 영역을 관리하는 **free-list** 라는 자료구조를 통해 관리한다. 아마도 이 자료구조는 다시 사용할 수 있는 영역과 그 것의 크기를 기록해두었을 것이다.

<br>
![01.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/01.png)

> 메모리 단편화 여부에 따라 전체 메모리 공간은 충분하나, 실제 객체 생성을 할 수 있는 **충분한 연속적인 공간이 없다면** OOM이 발생할 수도 있다.

<br>
### Compact

**Mark-Sweep-Compact**의 Compact 단계에서 실제로 살아있는, **Marking 된 객체들을 메모리 영역의 처음부터 몰아넣음으로써 Marn and Sweep의 단점을 제거한다.** 이는 실제 객체를 복사하고 이 객체들의 참조 정보를 업데이트함으로써 이루어지는데, GC로 인해 애플리케이션 스레드가 멈추는 시간을 증가시킨다. 하지만 이 것을 통해 얻을 수 있는 이익은 여러 가지가 있다.

* 메모리 단편화를 줄임으로써 발생하는 문제를 해결할 수 있다. (메모리 생성 실패 문제와 같은)
* 연속적인 공간에서 객체 생성을 하는 것은 아주 적은 연산을 필요로 한다.
    * 즉, 새로 객체를 생성하기 위해 적절한 메모리를 찾는 연산을 동반하는 파편화된 메모리 공간에서 할당하는 것보다 빠르다.

<br>
![02.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/02.png)

<br>
### Copy

**Mark and Copy**의 Copy 단계는 메모리 영역을 여러 영역으로 나누고, **살아있는 객체를 다른 영역으로 복사한다는 것을 의미한다.** 
(ex. Eden -> Survivor / From survivor -> To survivor / Survivor -> Old)

> Copy 단계도 Stop-The-World를 유발시킨다.

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

**하나의 스레드를 통해 수행되므로, 멀티 코어의 이점을 제대로 못살린다.** CPU 코어가 몇 개이든 상관없이 이 GC를 사용할 때는 CPU 코어 하나만 사용하게 된다.
따라서 CPU가 하나인, 작은 크기의 heap 영역만 있으면 되는 환경일 때만 사용하는 것이 권장된다. 멀티코어 / 큰 크기의 메모리를 갖는, 시스템 리소스를 많이 사용할 수 있는 서버 환경에서 이 GC를 사용하는 것은 권장되지 않는다.

다음은 Serial GC를 사용하였을 때의 GC log 이다.
참고로, GC log를 확인하기 위해 다음과 같이 JVM 파라미터를 설정한다.
```
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps
```


```
2018-01-26T14:45:37.987-0200: 151.126: [GC (Allocation Failure) 151.126: [DefNew: 629119K->69888K(629120K), 0.0584157 secs] 1619346K->1273247K(2027264K), 0.0585007 secs] [Times: user=0.06 sys=0.00, real=0.06 secs]
2018-01-26T14:45:59.690-0200: 172.829: [GC (Allocation Failure) 172.829: [DefNew: 629120K->629120K(629120K), 0.0000372 secs]172.829: [Tenured: 1203359K->755802K(1398144K), 0.1855567 secs] 1832479K->755802K(2027264K), [Metaspace: 6741K->6741K(1056768K)], 0.1856954 secs] [Times: user=0.18 sys=0.00, real=0.18 secs]
```

단 두 줄밖에 되지 않는 로그이지만 많은 정보를 가지고 있다.
위 로그를 통해 두 번의 GC가 일어났다는 것을 알 수 있는데, 하나는 Young 영역에 대한 GC (Minor GC)이고 다른 하나는 heap 영역 전체에 대한 GC (Full GC)이다.

<br>
### Minor GC

```
2018-01-26T14:45:37.987-0200: 151.126: [GC (Allocation Failure) 151.126: [DefNew: 629119K->69888K(629120K), 0.0584157 secs] 1619346K->1273247K(2027264K), 0.0585007 secs] [Times: user=0.06 sys=0.00, real=0.06 secs]
```

다음은 이 로그에서 알 수 있는 내용들이다.

<div class="code-line-wrap">
<p class="code-line"><span class="node">2018-01-26T14:45:37.987-0200<sup>1</sup></span>:<span class="node">151.126<sup>2</sup></span>:[<span class="node">GC<sup>3</sup></span>(<span class="node">Allocation Failure<sup>4</sup></span>) 151.126: [<span class="node">DefNew<sup>5</sup></span>:<span class="node">629119K-&gt;69888K<sup>6</sup></span><span class="node">(629120K)<sup>7</sup></span>, 0.0584157 secs]<span class="node">1619346K-&gt;1273247K<sup>8</sup></span><span class="node">(2027264K)<sup>9</sup></span>,<span class="node">0.0585007 secs<sup>10</sup></span>]<span class="node">[Times: user=0.06 sys=0.00, real=0.06 secs]<sup>11</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">2018-01-26T14:45:37.987-0200</span> –GC가 일어난 시간</li>
<li class="description"><span class="node">151.126</span> – GC가 일어났을 때, JVM이 수행된 시간</li>
<li class="description"><span class="node">GC</span> – Minor GC / Full GC를 구분하는 플래그, 여기서는 Minor GC를 의미한다.</li>
<li class="description"><span class="node">Allocation Failure</span> – GC가 일어난 원인, 여기서는 Young 영역에서 새로운 객체를 생성하기 위한 공간이 부족해서 발생한 것이다. </li>
<li class="description"><span class="node">DefNew</span> – Garbage Collector의 이름. 이 Collector는 Young 영역에 대한 GC를 수행하는데, 싱글 스레드 기반 / Mark-Copy / Stop-The-World 이다.</li>
<li class="description"><span class="node">629119K-&gt;69888K</span> – GC 전후의 Young 영역의 사용량</li>
<li class="description"><span class="node">(629120K)</span> – Young 영역의 전체 크기</li>
<li class="description"><span class="node">1619346K-&gt;1273247K</span> – GC 전후의 Heap 영역의 사용량</li>
<li class="description"><span class="node">(2027264K)</span> – Heap 영역의 전체 크기</li>
<li class="description"><span class="node">0.0585007 secs</span> – GC가 수행된 시간 (초)</li>
<li class="description"><span class="node">[Times: user=0.06 sys=0.00, real=0.06 secs]</span> – GC가 수행된 시간인데, 각 시간은 다음과 같다:
<ul>
<li>user – GC가 진행되는 동안 Garbage Collector에 의해 수행된 CPU 시간이다.</li>
<li>sys – System Call과 같이 OS가 수행하거나 기다린 시간이다.</li>
<li>real – 애플리케이션이 GC로 인해 멈춘 시간이다. Serial GC는 싱글 스레드 기반의 Stop-The-World를 일으키는 GC이므로, 이 시간은 user 와 sys 시간을 합친 것과 같다. </li>
</ul>
</li>
</ol>
</div>

위의 로그를 통해 해당 GC 이벤트 전후로 Memory 사용량이 어떻게 변화하였는지 알 수 있다.
GC가 일어나기 전에는 Heap 영역의 사용량이 1,619,346K 이었다. 그리고 Young 영역의 사용량은 629,119K 인 것으로 보아, Old 영역의 사용량은 990,227K 이다.

GC가 일어난 후, Young 영역은 559,231K 의 빈 공간을 확보하였는데,  Heap 영역의 사용량은 346,099K 밖에 줄어들지 않았다.
이를 통해 213,132K 만큼의 오브젝트들이 Young 영역에서 Old 영역으로 이동하였다는 것을 알 수 있다.

<br>
![04.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/04.png)

<br>
### Full GC

다음 2번째 줄의 로그는 Full GC에 대한 로그이다.

```
2018-01-26T14:45:59.690-0200: 172.829: [GC (Allocation Failure) 172.829: [DefNew: 629120K->629120K(629120K), 0.0000372 secs]172.829: [Tenured: 1203359K->755802K(1398144K), 0.1855567 secs] 1832479K->755802K(2027264K), [Metaspace: 6741K->6741K(1056768K)], 0.1856954 secs] [Times: user=0.18 sys=0.00, real=0.18 secs]
```

<div class="code-line-wrap">
<p class="code-line"><span class="node">2018-01-26T14:45:59.690-0200<sup>1</sup></span>: <span class="node">172.829<sup>2</sup></span>:[GC (Allocation Failure) 172.829:<span class="node"> [DefNew: 629120K-&gt;629120K(629120K), 0.0000372 secs<sup>3</sup></span>]172.829:[<span class="node">Tenured<sup>4</sup></span>: <span class="node">1203359K-&gt;755802K <sup>5</sup></span><span class="node">(1398144K) <sup>6</sup></span>,<span class="node">0.1855567 secs<sup>7</sup></span>] <span class="node">1832479K-&gt;755802K<sup>8</sup></span><span class="node">(2027264K)<sup>9</sup></span>,<span class="node">[Metaspace: 6741K-&gt;6741K(1056768K)]<sup>10</sup></span> <span class="node">[Times: user=0.18 sys=0.00, real=0.18 secs]<sup>11</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">2018-01-26T14:45:59.690-0200</span> – GC가 일어난 시간</li>
<li class="description"><span class="node">172.829</span> – GC가 일어났을 때, JVM이 수행된 시간</li>
<li class="description"><span class="node">[DefNew: 629120K-&gt;629120K(629120K), 0.0000372 secs</span> –이전 로그와 비슷하게 Young 영역에 대한 GC가 일어났다. 그런데 사실은 이전 로그에서 알 수 있듯이 Young 영역에 대한 GC가 일어났었기 때문에, 이미 이 시간 때의 Young 영역은 이미 비워져 있다. 이는 JVM의 버그로 Young 영역이 가득 차 있는 것처럼 리포트한 것이다. 이 GC가 걸린 시간이 "0.0000372 초"가 걸린 것을 보면 알 수 있을 것이다.</li>
<li class="description"><span class="node">Tenured</span> – Old 영역에 대한 Garbage Collector의 이름이다. 이 Collector도 또한 싱글 스레드 기반이며, Mark-Sweep-Compact / Stop-The-World 이다.</li>
<li class="description"><span class="node">1203359K-&gt;755802K </span> – GC 전후의 Old 영역의 사용량</li>
<li class="description"><span class="node">(1398144K) </span> – Old 영역의 전체 크기</li>
<li class="description"><span class="node">0.1855567 secs</span> – Old 영역을 청소하는데 걸린 시간</li>
<li class="description"><span class="node">1832479K-&gt;755802K</span> – Young / Old 영역에 대한 GC 전후의 Heap 사용량</li>
<li class="description"><span class="node">(2027264K)</span> – Heap 영역의 전체 크기</li>
<li class="description"><span class="node">[Metaspace: 6741K-&gt;6741K(1056768K)]</span> – Metaspace 영역에 대한 정보이다. 여기서 이 영역으로부터 회수된 메모리 공간은 없다.</li>
<li class="description"><span class="node">[Times: user=0.18 sys=0.00, real=0.18 secs]</span> – GC가 수행된 시간인데, 각 시간은 다음과 같다:
<ul>
<li>user – GC가 진행되는 동안 Garbage Collector에 의해 수행된 CPU 시간이다.</li>
<li>sys – System Call과 같이 OS가 수행하거나 기다린 시간이다.</li>
<li>real – 애플리케이션이 GC로 인해 멈춘 시간이다. Serial GC는 싱글 스레드 기반의 Stop-The-World를 일으키는 GC이므로, 이 시간은 user 와 sys 시간을 합친 것과 같다. </li>
</ul>
</li>
</ol>
</div>

Minor GC 때와는 다른데, Young 영역 뿐만 아니라 Old 영역 및 Metaspace 영역에 대해서도 GC를 수행한다. GC 전후의 메모리 레이아웃은 다음 그림과 비슷할 것이다.

<br>
![05.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/05.png)

<br>
## Parallel GC

Serial GC와 마찬가지로 **Young 영역은 mark-copy, Old 영역에 대해서는 mark-copy-compact 가 수행된다. 마찬가지로 모두 Stop-The-World를 일으킨다.**
단 Serial GC와는 다른 점은 GC를 수행하는 여러 스레드가 병렬로 수행된다는 점이다. 따라서 Serial GC에 비해 걸리는 시간이 짧다.

> 병렬로 GC를 수행하여 빠르게 끝내는 전략으로 대용량 Heap 영역을 사용할 경우 유리하다.

GC를 수행하는 스레드의 개수는 **-XX:ParallelGCThreads=NNN** 라는 JVM 파라미터를 통해 설정할 수 있다. 기본 값은 JVM에 수행되는 환경의 core 개수이다.

다음과 같이 파라미터를 설정하여 Parallel GC를 사용할 수있다. Young / Old 영역별로 수행되는 GC를 다르게 설정한다.

```
java -XX:+UseParallelGC com.mypackages.MyExecutableClass
java -XX:+UseParallelOldGC com.mypackages.MyExecutableClass
java -XX:+UseParallelGC -XX:+UseParallelOldGC com.mypackages.MyExecutableClass
```

Parallel GC는 **애플리케이션의 Throughput이 아주 중요할 때 고려해 볼 수 있다.** 

* GC가 수행되는 동안에는 모든 코어가 병렬적으로 GC를 수행하므로, 결국 GC로 인해 애플리케이션이 멈추는 시간이 짧아질 수 있다.
* GC 사이클 간격, 즉 애플리케이션이 수행될 때는 GC 로직을 위해 시스템 리소스가 낭비되지 않는다.

> Hotspot JVM에서는 여러 스레드에 의해 병렬로 GC가 수행될 경우, Young / Survivor 영역에서 Old 영역으로 객체를 이동시킬 때 동기화 문제를 회피하기 위해 PLAB(Parallel Allocation Buffer)를 사용한다. PLAB는 각 GC 스레드가 받는 Old 영역의 객체 할당 공간이다. 각 GC 스레드는 이를 통해 스레드 경합하지 않고 바로 Old 영역에 객체를 이동시킬 수 있다.

반면에, **GC는 수행되는 도중에 중단되지 않기 때문에 GC가 수행되는 시간이 길어지면 여전히 애플리케이션 스레드도 장기간 멈출 수 있다.**
즉, 애플리케이션의 Latency가 중요할 때는 다음에 설명할 CMS나 G1 GC도 고려해봐야 한다.

다음은 Parallel GC를 사용했을 때의 GC 로그이다.

```
2018-01-26T14:27:40.915-0200: 116.115: [GC (Allocation Failure) [PSYoungGen: 2694440K->1305132K(2796544K)] 9556775K->8438926K(11185152K), 0.2406675 secs] [Times: user=1.77 sys=0.01, real=0.24 secs]
2018-01-26T14:27:41.155-0200: 116.356: [Full GC (Ergonomics) [PSYoungGen: 1305132K->0K(2796544K)] [ParOldGen: 7133794K->6597672K(8388608K)] 8438926K->6597672K(11185152K), [Metaspace: 6745K->6745K(1056768K)], 0.9158801 secs] [Times: user=4.49 sys=0.64, real=0.92 secs]
```

<br>
### Minor GC

```
2018-01-26T14:27:40.915-0200: 116.115: [GC (Allocation Failure) [PSYoungGen: 2694440K->1305132K(2796544K)] 9556775K->8438926K(11185152K), 0.2406675 secs] [Times: user=1.77 sys=0.01, real=0.24 secs]
```

<div class="code-line-wrap">
<p class="code-line"><span class="node">2018-01-26T14:27:40.915-0200<sup>1</sup></span>: <span class="node">116.115<sup>2</sup></span>:[<span class="node">GC<sup>3</sup></span>(<span class="node">Allocation Failure<sup>4</sup></span>)[<span class="node">PSYoungGen<sup>5</sup></span>: <span class="node">2694440K-&gt;1305132K<sup>6</sup></span><span class="node">(2796544K)<sup>7</sup></span>]<span class="node">9556775K-&gt;8438926K<sup>8</sup></span><span class="node">(11185152K)<sup>9</sup></span>, <span class="node">0.2406675 secs<sup>10</sup></span>]<span class="node">[Times: user=1.77 sys=0.01, real=0.24 secs]<sup>11</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">2018-01-26T14:27:40.915-0200</span> – GC가 일어난 시간</li>
<li class="description"><span class="node">116.115</span> –GC가 일어났을 때, JVM이 수행된 시간</li>
<li class="description"><span class="node">GC</span> – Minor GC / Full GC를 구분하는 플래그, 여기서는 Minor GC를 의미한다.</li>
<li class="description"><span class="node">Allocation Failure</span> – GC가 일어난 원인, 여기서는 Young 영역에서 새로운 객체를 생성하기 위한 공간이 부족해서 발생한 것이다.</li>
<li class="description"><span class="node">PSYoungGen</span> – Garbage Collector의 이름. 이 Collector는 Young 영역에 대한 GC를 수행하는데, 멀티 스레드 기반으로 병렬로 수행되는 collector이며, Mark-Copy / Stop-The-World 이다.</li>
<li class="description"><span class="node">2694440K-&gt;1305132K</span> – GC 전후의 Young 영역의 사용량</li>
<li class="description"><span class="node">(2796544K)</span> – Young 영역의 전체 크기</li>
<li class="description"><span class="node">9556775K-&gt;8438926K</span> – GC 전후의 Heap 영역의 사용량</li>
<li class="description"><span class="node">(11185152K)</span> – Heap 영역의 전체 크기</li>
<li class="description"><span class="node">0.2406675 secs</span> – GC가 수행된 시간 (초)</li>
<li class="description"><span class="node">[Times: user=1.77 sys=0.01, real=0.24 secs]</span> – GC가 수행된 시간인데, 각 시간은 다음과 같다:
<ul>
<li>user – GC가 진행되는 동안 Garbage Collector에 의해 수행된 CPU 시간이다.</li>
<li>sys – System Call과 같이 OS가 수행하거나 기다린 시간이다.</li>
<li>real –애플리케이션이 GC로 인해 멈춘 시간이다. Parallel GC에서 이 시간은 user와 sys 시간을 GC 수행하는 스레드 개수로 나눈 것에 근접한다. 여기서는 8개의 스레드가 GC를 수행했다는 것을 알 수 있다. GC의 모든 로직이 완전히 병렬적으로 수행되지는 않을 것이므로, user와 sys 시간을 스레드 개수로 나눈 값보다는 높다.  </li>
</ul>
</li>
</ol>
</div>

GC가 수행되기 전의 Heap 사용량은 9,556,775K 였는데, 이 중 Young 영역의 사용량은 2,694,440K 이다.이는 GC가 수행되기 전, Old 영역의 사용량은 6,862,335K 라는 것을 의미한다.

GC가 수행되고 난 후에 Young 영역의 사용량은 1,389,308K 가 줄었지만 Heap 영역의 사용량은 1,117,849K 밖에 줄어들지 않았다. 이를 통해 나머지 271,459K 크기에 해당하는 객체들은
모두 Young 영역에서 Old 영역으로 이동하였다는 것을 알 수 있다.

<br>
![06.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/06.png)

<br>
### Full GC

```
2018-01-26T14:27:41.155-0200: 116.356: [Full GC (Ergonomics) [PSYoungGen: 1305132K->0K(2796544K)] [ParOldGen: 7133794K->6597672K(8388608K)] 8438926K->6597672K(11185152K), [Metaspace: 6745K->6745K(1056768K)], 0.9158801 secs] [Times: user=4.49 sys=0.64, real=0.92 secs]
```

<div class="code-line-wrap">
<p class="code-line"><span class="node">2018-01-26T14:27:41.155-0200<sup>1</sup></span>:<span class="node">116.356<sup>2</sup></span>:[<span class="node">Full GC<sup>3</sup></span> (<span class="node">Ergonomics<sup>4</sup></span>)<span class="node">[PSYoungGen: 1305132K-&gt;0K(2796544K)]<sup>5</sup></span>[<span class="node">ParOldGen<sup>6</sup></span>:<span class="node">7133794K-&gt;6597672K <sup>7</sup></span><span class="node">(8388608K)<sup>8</sup></span>] <span class="node">8438926K-&gt;6597672K<sup>9</sup></span><span class="node">(11185152K)<sup>10</sup></span>, <span class="node">[Metaspace: 6745K-&gt;6745K(1056768K)] <sup>11</sup></span>, <span class="node">0.9158801 secs<sup>12</sup></span>, <span class="node">[Times: user=4.49 sys=0.64, real=0.92 secs]<sup>13</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">2018-01-26T14:27:41.155-0200</span> – GC가 일어난 시간</li>
<li class="description"><span class="node">116.356</span> – GC가 일어났을 때, JVM이 수행된 시간이다. 여기서는 아까 전의 Minor GC가 일어난 후 바로 시작된 것을 알 수 있다.</li>
<li class="description"><span class="node">Full GC</span> – Young 영역 및 Old 영역에 대해서 수행하는 Full GC를 가리키는 플래그이다.</li>
<li class="description"><span class="node">Ergonomics</span> – GC가 일어난 원인으로, 여기서는 JVM 내부 조건으로 인해 트리거되었음을 의미한다.</li>
<li class="description"><span class="node">[PSYoungGen: 1305132K-&gt;0K(2796544K)]</span> – Minor GC 때와 비슷하게, 병렬적으로 수행되는 mark-copy / stop-the-world인 "PSYoungGen" 이라는 collector가 Young 영역에 대한 GC를 수행했다는 것을 알 수 있다. Young 영역의 사용량이 1,305,132K 에서 0으로 비워졌다는 것을 알 수 있다.</li>
<li class="description"><span class="node">ParOldGen</span> – Old 영역에 대해 GC를 수행하는 Collector로, 병렬적으로 수행되며 mark-sweep-compact / stop-the-world 이다.</li>
<li class="description"><span class="node">7133794K-&gt;6597672K </span> –GC 전후의 Old 영역의 사용량</li>
<li class="description"><span class="node">(8388608K)</span> – Old 영역의 전체 크기</li>
<li class="description"><span class="node">8438926K-&gt;6597672K</span> – Young / Old 영역에 대한 GC 전후의 Heap 사용량</li>
<li class="description"><span class="node">(11185152K)</span> – Heap 영역의 전체 크기</li>
<li class="description"><span class="node">[Metaspace: 6745K-&gt;6745K(1056768K)] </span> – Metaspace 영역에 대한 정보이다. 여기서 이 영역으로부터 회수된 메모리 공간은 없다.</li>
<li class="description"><span class="node">0.9158801 secs</span> – GC가 수행된 시간 (초)</li>
<li class="description"><span class="node">[Times: user=4.49 sys=0.64, real=0.92 secs]</span> – GC가 수행된 시간인데, 각 시간은 다음과 같다:
<ul>
<li>user – GC가 진행되는 동안 Garbage Collector에 의해 수행된 CPU 시간이다.</li>
<li>sys – System Call과 같이 OS가 수행하거나 기다린 시간이다.</li>
<li>real – 애플리케이션이 GC로 인해 멈춘 시간이다. Parallel GC에서 이 시간은 user와 sys 시간을 GC 수행하는 스레드 개수로 나눈 것에 근접한다. 여기서는 8개의 스레드가 GC를 수행했다는 것을 알 수 있다. GC의 모든 로직이 완전히 병렬적으로 수행되지는 않을 것이므로, user와 sys 시간을 스레드 개수로 나눈 값보다는 높다.</li>
</ul>
</li>
</ol>
</div>

이 로그를 통해 Young 영역 뿐만 아니라 Old 및 Metaspace 영역에 대한 GC도 수행되었다는 것을 알 수 있다. GC 전후의 메모리 레이아웃은 다음 그림과 비슷할 것이다.

<br>
![07.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/07.png)

<br>
## Concurrent Mark and Sweep

이 GC의 공식적인 이름은 **"Mostly Concurrent Mark and Sweep Garbage Collector"** 이다.
Young 영역에 대해서는 Parallel GC와 마찬가지로 mark-copy 알고리즘을 사용하며 stop-the-world를 일으킨다. 또한 멀티 스레드를 통해 병렬적으로 수행된다.

**Old 영역에 대해서는 mark-sweep 알고리즘을 사용하는데, GC의 대부분 로직들이 애플리케이션 스레드와 "거의" 동시에 수행된다. (Monstly Concurrent)**

이 GC는 Old 영역에 대한 GC가 발생할 때, 애플리케이션 스레드가 장시간 멈추는 것을 되도록 피하고자 디자인된 것이다.
다음 두 가지 방법을 통해, 애플리케이션 스레드가 멈추는 것을 막는다.

1. Old 영역에 대해서 Compaction을 수행하지 않고, 객체를 할당할 수 있는 공간을 관리하는 자료구조 (free-list)를 따로 관리한다. Compaction도 객체 복사가 일어나므로 애플리케이션 스레드를 멈추게 된다.
2. Mark와 Sweep 단계에서는 특정 단계 빼고는 애플리케이션 스레드와 병렬적으로 수행된다.

이 의미는 애플리케이션 스레드가 GC로 인해 멈추는 시간을 현저히 줄일 수 있다는 것이다.

> 각 GC 단계 중 특정 단계는 애플리케이션 스레드와 병렬로 수행하는 것과 더불어, 애플리케이션 스레드가 멈추는 기간인 Stop-The-World를 분산함으로써 응답 시간을 개선한다.

당연히 GC를 수행하기 위해서는 CPU 코어를 사용하게 되므로 애플리케이션 스레드와 CPU 자원을 얻기 위해 경쟁하게 된다. 기본적으로 이 GC를 위해 수행되는 스레드 개수는 실제 환경의 CPU 코어 개수의 1/4 이다.

이 GC를 수행하기 위해 다음과 같이 JVM 파라미터를 사용한다.

```
java -XX:+UseConcMarkSweepGC com.mypackages.MyExecutableClass
```

Parallel GC와는 다르게, **Latency가 중요할 때는 애플리케이션 스레드의 멈춤을 되도록 피하는 이 GC를 고려해볼 수 있다.**

애플리케이션 스레드와 병렬적으로 수행되는 단계가 있는 이 GC를 사용함으로써, 애플리케이션의 responsiveness가 향상된다.

단, 모든 CPU 코어가 애플리케이션 스레드를 위해 사용되지 않고 GC를 위해 일부가 사용될 수도 있기 때문에, Parallel GC를 사용할 때보다는 Throughput이 줄어들 수 있다. (CPU 바운드인 애플리케이션에 한해서)

다음은 이 GC를 사용했을 때의 GC 로그이다. 여기서 첫 번째 로그는 Minor GC 로그이며, 나머지는 모두 Old 영역에 대한 GC 로그이다.

```
2018-01-26T16:23:07.219-0200: 64.322: [GC (Allocation Failure) 64.322: [ParNew: 613404K->68068K(613440K), 0.1020465 secs] 10885349K->10880154K(12514816K), 0.1021309 secs] [Times: user=0.78 sys=0.01, real=0.11 secs]
2018-01-26T16:23:07.321-0200: 64.425: [GC (CMS Initial Mark) [1 CMS-initial-mark: 10812086K(11901376K)] 10887844K(12514816K), 0.0001997 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]
2018-01-26T16:23:07.321-0200: 64.425: [CMS-concurrent-mark-start]
2018-01-26T16:23:07.357-0200: 64.460: [CMS-concurrent-mark: 0.035/0.035 secs] [Times: user=0.07 sys=0.00, real=0.03 secs]
2018-01-26T16:23:07.357-0200: 64.460: [CMS-concurrent-preclean-start]
2018-01-26T16:23:07.373-0200: 64.476: [CMS-concurrent-preclean: 0.016/0.016 secs] [Times: user=0.02 sys=0.00, real=0.02 secs]
2018-01-26T16:23:07.373-0200: 64.476: [CMS-concurrent-abortable-preclean-start]
2018-01-26T16:23:08.446-0200: 65.550: [CMS-concurrent-abortable-preclean: 0.167/1.074 secs] [Times: user=0.20 sys=0.00, real=1.07 secs]
2018-01-26T16:23:08.447-0200: 65.550: [GC (CMS Final Remark) [YG occupancy: 387920 K (613440 K)]65.550: [Rescan (parallel) , 0.0085125 secs]65.559: [weak refs processing, 0.0000243 secs]65.559: [class unloading, 0.0013120 secs]65.560: [scrub symbol table, 0.0008345 secs]65.561: [scrub string table, 0.0001759 secs][1 CMS-remark: 10812086K(11901376K)] 11200006K(12514816K), 0.0110730 secs] [Times: user=0.06 sys=0.00, real=0.01 secs]
2018-01-26T16:23:08.458-0200: 65.561: [CMS-concurrent-sweep-start]
2018-01-26T16:23:08.485-0200: 65.588: [CMS-concurrent-sweep: 0.027/0.027 secs] [Times: user=0.03 sys=0.00, real=0.03 secs]
2018-01-26T16:23:08.485-0200: 65.589: [CMS-concurrent-reset-start]
2018-01-26T16:23:08.497-0200: 65.601: [CMS-concurrent-reset: 0.012/0.012 secs] [Times: user=0.01 sys=0.00, real=0.01 secs]
```

<br>
### Minor GC

```
2018-01-26T16:23:07.219-0200: 64.322: [GC (Allocation Failure) 64.322: [ParNew: 613404K->68068K(613440K), 0.1020465 secs] 10885349K->10880154K(12514816K), 0.1021309 secs] [Times: user=0.78 sys=0.01, real=0.11 secs]
```

<div class="code-line-wrap">
<p class="code-line"><span class="node">2018-01-26T16:23:07.219-0200<sup>1</sup></span>: <span class="node">64.322<sup>2</sup></span>:[<span class="node">GC<sup>3</sup></span>(<span class="node">Allocation Failure<sup>4</sup></span>) 64.322: [<span class="node">ParNew<sup>5</sup></span>: <span class="node">613404K-&gt;68068K<sup>6</sup></span><span class="node">(613440K) <sup>7</sup></span>, <span class="node"> 0.1020465 secs<sup>8</sup></span>] <span class="node">10885349K-&gt;10880154K <sup>9</sup></span><span class="node">(12514816K)<sup>10</sup></span>, <span class="node">0.1021309 secs<sup>11</sup></span>]<span class="node">[Times: user=0.78 sys=0.01, real=0.11 secs]<sup>12</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">2018-01-26T16:23:07.219-0200</span> – GC가 일어난 시간</li>
<li class="description"><span class="node">64.322</span> – GC가 일어났을 때, JVM이 수행된 시간</li>
<li class="description"><span class="node">GC</span> – Minor GC / Full GC를 구분하는 플래그, 여기서는 Minor GC를 의미한다.</li>
<li class="description"><span class="node">Allocation Failure</span> – GC가 일어난 원인, 여기서는 Young 영역에서 새로운 객체를 생성하기 위한 공간이 부족해서 발생한 것이다.</li>
<li class="description"><span class="node">ParNew</span> – Garbage Collector의 이름. Collector는 Young 영역에 대한 GC를 수행하는데, 병렬적으로 수행되며 Mark-Copy / Stop-The-World 이다. 또한 이 Collector는 Old 영역에 대한 GC를 수행하는 Concurrent Mark &amp; Sweep Garbage Collector와 유기적으로 수행될 수 있도록 디자인되었다.  </li>
<li class="description"><span class="node">613404K-&gt;68068K</span> – GC 전후의 Young 영역의 사용량</li>
<li class="description"><span class="node">(613440K) </span> – Young 영역의 전체 크기</li>
<li class="description"><span class="node"> 0.1020465 secs</span> – GC가 수행되고 난 후의 정리 작업(clean up)을 제외한 시간</li>
<li class="description"><span class="node">10885349K-&gt;10880154K </span> – GC 전후의 Heap 영역의 사용량</li>
<li class="description"><span class="node">(12514816K)</span> – Heap 영역의 전체 크기</li>
<li class="description"><span class="node">0.1021309 secs</span> – Collector가 Young영역에 대해서 mark-copy를 진행하는데 걸린 시간. Old 영역으로 오래된 객체를 이동시키는 것과 GC의 마지막 정리 작업과 같이 Concurrent Mark &amp; Sweep Garbage Collector와 커뮤니케이션 한 시간도 포함된다.</li>
<li class="description"><span class="node">[Times: user=0.78 sys=0.01, real=0.11 secs]</span> – GC가 수행된 시간인데, 각 시간은 다음과 같다:
<ul>
<li>user – GC가 진행되는 동안 Garbage Collector에 의해 수행된 CPU 시간이다.</li>
<li>sys – System Call과 같이 OS가 수행하거나 기다린 시간이다.</li>
<li>real – 애플리케이션이 GC로 인해 멈춘 시간이다. Parallel GC와 마찬가지로, 이 시간은 user와 sys 시간을 GC 수행하는 스레드 개수로 나눈 것에 근접한다. 여기서는 8개의 스레드가 GC를 수행했다는 것을 알 수 있다. GC의 모든 로직이 완전히 병렬적으로 수행되지는 않을 것이므로, user와 sys 시간을 스레드 개수로 나눈 값보다는 높다.</li>
</ul>
</li>
</ol>
</div>

위 로그에서 GC가 수행되기 전의 Heap 사용량은 10,885,349K 이고 Young 영역의 사용량은 613,404K 인 것으로 나온다. 이를 통해 Old 영역의 사용량은 10,271,945K 인 것을 알 수 있다.

GC가 수행된 후, Young 영역의 사용량은 545,336K 가 줄었지만 Heap 영역의 사용량은 5,195K 밖에 줄지 않았다. 이는 540,141K 크기의 객체들이 Young 영역에서 Old 영역으로 이동했다는 것을 알 수 있다.

<br>
![08.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/08.png)

<br>
### Full GC

다음 로그를 보면 알 수 있겠지만 Serial GC나 Parallel GC와는 로그 형식이 완전히 다르다.
이 로그들은 Old 영역에 대해 GC를 수행하는, CMS GC의 각 단계에 대한 로그들이다.

```
2018-01-26T16:23:07.321-0200: 64.425: [GC (CMS Initial Mark) [1 CMS-initial-mark: 10812086K(11901376K)] 10887844K(12514816K), 0.0001997 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]
2018-01-26T16:23:07.321-0200: 64.425: [CMS-concurrent-mark-start]
2018-01-26T16:23:07.357-0200: 64.460: [CMS-concurrent-mark: 0.035/0.035 secs] [Times: user=0.07 sys=0.00, real=0.03 secs]
2018-01-26T16:23:07.357-0200: 64.460: [CMS-concurrent-preclean-start]
2018-01-26T16:23:07.373-0200: 64.476: [CMS-concurrent-preclean: 0.016/0.016 secs] [Times: user=0.02 sys=0.00, real=0.02 secs]
2018-01-26T16:23:07.373-0200: 64.476: [CMS-concurrent-abortable-preclean-start]
2018-01-26T16:23:08.446-0200: 65.550: [CMS-concurrent-abortable-preclean: 0.167/1.074 secs] [Times: user=0.20 sys=0.00, real=1.07 secs]
2018-01-26T16:23:08.447-0200: 65.550: [GC (CMS Final Remark) [YG occupancy: 387920 K (613440 K)]65.550: [Rescan (parallel) , 0.0085125 secs]65.559: [weak refs processing, 0.0000243 secs]65.559: [class unloading, 0.0013120 secs]65.560: [scrub symbol table, 0.0008345 secs]65.561: [scrub string table, 0.0001759 secs][1 CMS-remark: 10812086K(11901376K)] 11200006K(12514816K), 0.0110730 secs] [Times: user=0.06 sys=0.00, real=0.01 secs]
2018-01-26T16:23:08.458-0200: 65.561: [CMS-concurrent-sweep-start]
2018-01-26T16:23:08.485-0200: 65.588: [CMS-concurrent-sweep: 0.027/0.027 secs] [Times: user=0.03 sys=0.00, real=0.03 secs]
2018-01-26T16:23:08.485-0200: 65.589: [CMS-concurrent-reset-start]
2018-01-26T16:23:08.497-0200: 65.601: [CMS-concurrent-reset: 0.012/0.012 secs] [Times: user=0.01 sys=0.00, real=0.01 secs]
```

> CMS GC에서 Old 영역에 대한 GC가 수행되는 도중에도, Young 영역에 대한 GC가 발생할 수 있다. 
이 때 로그 상에서는 Minor GC 로그가 한데 섞여서 보일 것이다.

---

**Phase 1: Initial Mark**

```
2018-01-26T16:23:07.321-0200: 64.425: [GC (CMS Initial Mark) [1 CMS-initial-mark: 10812086K(11901376K)] 10887844K(12514816K), 0.0001997 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]
```

CMS GC에서 Stop-The-World 를 일으키는 두 개의 이벤트 중 하나이다.
이 단계에서는 **GC Root 로부터 바로 참조되거나, Young 영역의 살아있는 객체로부터 참조되는 모든 Old 영역의 객체를 mark 한다.**

> mark 되는 객체는 GC Root로부터 바로 참조되는 살아 있는 객체이다. 비로 Stop-The-World를 일으키지만 속도가 빠르다.

<br>
![09.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/09.png)

<div class="code-line-wrap">
<p class="code-line"><span class="node">2018-01-26T16:23:07.321-0200: 64.42<sup>1</sup></span>: [GC (<span class="node">CMS Initial Mark<sup>2</sup></span>[1 CMS-initial-mark: <span class="node">10812086K<sup>3</sup></span><span class="node">(11901376K)<sup>4</sup></span>] <span class="node">10887844K<sup>5</sup></span><span class="node">(12514816K)<sup>6</sup></span>, <span class="node">0.0001997 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]<sup>7</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">2018-01-26T16:23:07.321-0200: 64.42</span> – GC가 일어난 시간 및 JVM이 수행된 시간이다.</li>
<li class="description"><span class="node">CMS Initial Mark</span> – GC 단계로 GC Root가 될 수 있는 모든 객체를 mark 한다.</li>
<li class="description"><span class="node">10812086K</span> – Old 영역의 현재 사용량</li>
<li class="description"><span class="node">(11901376K)</span> – Old 영역의 전체 크기</li>
<li class="description"><span class="node">10887844K</span> – Heap 영역의 전체 사용량</li>
<li class="description"><span class="node">(12514816K)</span> – Heap 영역의 전체 크기</li>
<li class="description"><span class="node">0.0001997 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]</span> – 해당 단계에서 걸린 시간으로 user 및 system, real 로 나누어서 보여주고 있다.</li>
</ol>
</div>

---

**Phase 2: Concurrent Mark**

```
2018-01-26T16:23:07.321-0200: 64.425: [CMS-concurrent-mark-start]
2018-01-26T16:23:07.357-0200: 64.460: [CMS-concurrent-mark: 0.035/0.035 secs] [Times: user=0.07 sys=0.00, real=0.03 secs]
```

이 단계에서는 이전 단계인 "Initial Mark" 단계에서 mark 한 객체부터 시작해서 **Old 영역을 순회하면서 살아있는 모든 객체들을 mark 한다.**
Concurrent 라는 이름이 나타내는 것처럼, 이 단계에서 애플리케이션 스레드를 멈추지 않고 동작한다. 

이 단계에서 살아있는 모든 객체가 **완전히 mark 되지 않는다.** 애플리케이션 스레드가 돌고 있으므로, 애플리케이션의 객체들의 상태는 계속 변화할 수 있다.

<br>
![10.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/10.png)

위의 그림에서 볼 수 있듯이, 검은색 테두리인 "Current Object"의 그래프가 변하였다.
(Mark 하고 있는 도중에, Current Object가 가지고 있던 참조 객체가 지워졌다는 것이다.)

<div class="code-line-wrap">
<pre class="code-line">2018-01-26T16:23:07.321-0200: 64.425: [CMS-concurrent-mark-start]
2018-01-26T16:23:07.357-0200: 64.460: [<span class="node">CMS-concurrent-mark<sup>1</sup></span>: <span class="node">035/0.035 secs<sup>2</sup></span>] <span class="node">[Times: user=0.07 sys=0.00, real=0.03 secs]<sup>3</sup></span></pre>
<ol class="code-line-components">
<li class="description"><span class="node">CMS-concurrent-mark</span> – "Concurrent Mark" 단계로, Old 영역에 있는 살아 있는 오브젝트들을 mark 한다.</li>
<li class="description"><span class="node">035/0.035 secs</span> – 이 단계에서 걸린 시간으로 elapsed time(user) 및 wall clock time(real)을 나타낸다.</li>
<li class="description"><span class="node">[Times: user=0.07 sys=0.00, real=0.03 secs]</span> – 해당 단계에서 걸린 시간으로 user 및 system, real 로 나누어서 보여주고 있다.</li>
</ol>
</div>

---

**Phase 3: Concurrent Preclean**

```
2018-01-26T16:23:07.357-0200: 64.460: [CMS-concurrent-preclean-start]
2018-01-26T16:23:07.373-0200: 64.476: [CMS-concurrent-preclean: 0.016/0.016 secs] [Times: user=0.02 sys=0.00, real=0.02 secs]
```

이 단계도 "Concurrent" 단계로서, 애플리케이션 스레드를 멈추지 않고 동작한다.

이전 단계에서 애플리케이션 스레드와 동시에 동작하였기 때문에, 객체들 간의 참조 그래프가 변했을 수 있다. (Young 영역의 GC가 발생되어 Old 영역으로 객체가 이동되거나, 새로운 객체가 생성되었을 경우. **CMS의 Old 영역 GC 도중에도 Young 영역에 대한 GC가 일어날 수 있다.**)

JVM은 **힙 영역을 일정 크기로 나누어 각 영역을 "Card"**라 불리는 것으로 관리하고, 
Marking 단계에서 **변화한 객체를 갖고 있는 Card를 dirty로 표시해두는 "[Card Marking](http://psy-lob-saw.blogspot.com/2014/10/the-jvm-write-barrier-card-marking.html)" 이라는 기법을 사용한다.**

<br>
![11.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/11.png)

"Concurrent Preclean" 단계에서는 이 **Card 안에 있는 "dirty 한" 객체로부터 참조되고 있는 객체들을 mark 한다.** 그리고 Card의 dirty 표시는 지워질 것이다.

<br>
![12.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/12.png)

마지막으로 **"Final Remark" 단계를 위해 필요한 작업을 수행한다.**

<div class="code-line-wrap">
<pre class="code-line">2018-01-26T16:23:07.357-0200: 64.460: [CMS-concurrent-preclean-start]
2018-01-26T16:23:07.373-0200: 64.476: [<span class="node">CMS-concurrent-preclean<sup>1</sup></span>: <span class="node">0.016/0.016 secs<sup>2</sup></span>] <span class="node">[Times: user=0.02 sys=0.00, real=0.02 secs]<sup>3</sup></span></pre>
<ol class="code-line-components">
<li class="description"><span class="node">CMS-concurrent-preclean</span> – "Concurrent Preclean" 단계로, 이전 mark 단계에서 변화한 객체들의 상태를 확인하고 작업을 수행한다.</li>
<li class="description"><span class="node">0.016/0.016 secs</span> – 이 단계에서 걸린 시간으로 elapsed time(user) 및 wall clock time(real)을 나타낸다.</li>
<li class="description"><span class="node">[Times: user=0.02 sys=0.00, real=0.02 secs]</span> – 해당 단계에서 걸린 시간으로 user 및 system, real 로 나누어서 보여주고 있다.</li>
</ol>
</div>

---

**Phase 4: Concurrent Abortable Preclean**

```
2018-01-26T16:23:07.373-0200: 64.476: [CMS-concurrent-abortable-preclean-start]
2018-01-26T16:23:08.446-0200: 65.550: [CMS-concurrent-abortable-preclean: 0.167/1.074 secs] [Times: user=0.20 sys=0.00, real=1.07 secs]
```

"Concurrent" 라는 것은 애플리케이션 스레드와 동시에 동작한다는 의미이기 때문에, 객체의 상태는 GC의 mark 도중에 계속 변화할 수 있다.
이 단계는 Stop-The-World를 일으키는 **"Final Remark" 단계를 되도록 빨리 끝내기 위해서 수행된다.**

Young (Eden) 영역의 사용량이 "CMSScheduleRemarkEdenSizeThreshold" 보다 높으면, "CMSScheduleRemarkEdenPenetration"에 설정된 비율보다 사용량이 낮아질 떄까지 **precleaning, 즉 변화한 객체들을 계속 스캔한다.**

<div class="code-line-wrap">
<pre class="code-line">2018-01-26T16:23:07.373-0200: 64.476: [CMS-concurrent-abortable-preclean-start]
2018-01-26T16:23:08.446-0200: 65.550: [<span class="node">CMS-concurrent-abortable-preclean<sup>1</sup></span>: <span class="node">0.167/1.074 secs<sup>2</sup></span>] <span class="node">[Times: user=0.20 sys=0.00, real=1.07 secs]<sup>3</sup></span></pre>
<ol class="code-line-components">
<li class="description"><span class="node">CMS-concurrent-abortable-preclean</span> – "Concurrent Abortable Preclean" 단계이다.</li>
<li class="description"><span class="node">0.167/1.074 secs</span> – 이 단계에서 걸린 시간으로 elapsed time(user) 및 wall clock time(real)을 나타낸다. clock time보다 elapsed time이 더 적은 것을 알 수 있다. 원래 GC에 의해 수행되는 동작들이 병렬로 수행될 때, real time이 더 적다는 것을 확인하였었다. 근데 여기서는 실제로 GC에 의해 수행된 시간인 elapsed time이 더 적은데, 이는 GC가 어떤 동작을 위해 wait를 많이 하였다는 것읠 의미한다. </li>
<li class="description"><span class="node">[Times: user=0.20 sys=0.00, real=1.07 secs]</span> – 해당 단계에서 걸린 시간으로 user 및 system, real 로 나누어서 보여주고 있다.</li>
</ol>
</div>

이 단계에서 수행한 결과에 따라, 다음 단계인 "Final Remark"의 수행시간에 큰 영향을 끼친다.

---

**Phase 5: Final Remark**

```
2018-01-26T16:23:08.447-0200: 65.550: [GC (CMS Final Remark) [YG occupancy: 387920 K (613440 K)]65.550: [Rescan (parallel) , 0.0085125 secs]65.559: [weak refs processing, 0.0000243 secs]65.559: [class unloading, 0.0013120 secs]65.560: [scrub symbol table, 0.0008345 secs]65.561: [scrub string table, 0.0001759 secs][1 CMS-remark: 10812086K(11901376K)] 11200006K(12514816K), 0.0110730 secs] [Times: user=0.06 sys=0.00, real=0.01 secs]
```

이 단계는 Stop-The-World를 일으키는 두 번째 단계로써, Old 영역에 있는 살아있는 모든 객체들을 완전히 mark 한다.

이전 단계들은 애플리케이션 스레드와 병렬적으로 수행했기 때문에, **애플리케이션의 동작에 따라 변화하는 객체들의 상태를 빠르게 반영하지 못했을 수 있다.**
따라서 이 단계에서 다시 Stop-The-World를 통해 애플리케이션 스레드를 잠시 멈춤으로써, **객체들의 상태를 완전히 반영하는 것이다.**

CMS GC는 이 단계를 **되도록 Young 영역이 거의 비워져있을 때 수행하게 하도록 하여, Stop-The-World 를 일으키는 동작이 연쇄적으로 발생하는 것을 방지한다.**
(Young 영역이 가득차 있으면 Young 영역의 GC가 발생하고 오래된 객체들은 Old 영역으로 이동하는데, 그로 인해 Old 영역이 부족해지면 또 Old 영역에 대한 GC가 발생하게 되므로, 결국 Stop-The-World를 일으키는 동작이 연쇄적으로 발생할 가능성이 있다.)

<div class="code-line-wrap">
<p class="code-line"><span class="node">2018-01-26T16:23:08.447-0200: 65.550<sup>1</sup></span>: [GC (<span class="node">CMS Final Remark<sup>2</sup></span>) [<span class="node">YG occupancy: 387920 K (613440 K)<sup>3</sup></span>]65.550: <span class="node">[Rescan (parallel) , 0.0085125 secs]<sup>4</sup></span>65.559: [<span class="node">weak refs processing, 0.0000243 secs]65.559<sup>5</sup></span>: [<span class="node">class unloading, 0.0013120 secs]65.560<sup>6</sup></span>: [<span class="node">scrub string table, 0.0001759 secs<sup>7</sup></span>][1 CMS-remark: <span class="node">10812086K(11901376K)<sup>8</sup></span>] <span class="node">11200006K(12514816K) <sup>9</sup></span>, <span class="node">0.0110730 secs<sup>10</sup></span>] [<span class="node">[Times: user=0.06 sys=0.00, real=0.01 secs]<sup>11</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">2018-01-26T16:23:08.447-0200: 65.550</span> –GC가 일어난 시간 및 JVM이 수행된 시간이다.</li>
<li class="description"><span class="node">CMS Final Remark</span> –"Final Remark" 단계로 이전 GC 단계에서 새로이 업데이트된 객체들을 모두 포함하여, Old 영역의 살아있는 객체들을 완전히 mark 한다.</li>
<li class="description"><span class="node">YG occupancy: 387920 K (613440 K)</span> – Young 영역의 현재 사용량 및 크기</li>
<li class="description"><span class="node">[Rescan (parallel) , 0.0085125 secs]</span> – 이 "Rescan" 동작에서 애플리케이션 스래드가 멈추어 있을 때, 살아있는 객체들을 mark 하는 것을 완료한다. 여기서는 이 동작이 병렬로 수행되었고, 0.0085125 초가 걸렸다.</li>
<li class="description"><span class="node">weak refs processing, 0.0000243 secs]65.559</span> – Week reference에 대한 처리 및 이에 걸린 시간이다.</li>
<li class="description"><span class="node">class unloading, 0.0013120 secs]65.560</span> –사용하지 않는 클래스들을 언로드하는데 걸린 시간이다.</li>
<li class="description"><span class="node">scrub string table, 0.0001759 secs</span> – Symbol 및 클래스 레벨 메타데이터 등을 참조하는 String들을 지우는 것이다.</li>
<li class="description"><span class="node">10812086K(11901376K)</span> – 이 단계가 지난 후의 Old 영역의 사용량 및 크기이다.</li>
<li class="description"><span class="node">11200006K(12514816K) </span> – 이 단계가 지난 후의 Heap 영역의 사용량 및 크기이다.</li>
<li class="description"><span class="node">0.0110730 secs</span> – 이 단계에서 걸린 시간</li>
<li class="description"><span class="node">[Times: user=0.06 sys=0.00, real=0.01 secs]</span> – 해당 단계에서 걸린 시간으로 user 및 system, real 로 나누어서 보여주고 있다.</li>
</ol>
</div>

Mark 단계가 끝나면 Old 영역에 있는 모든 살아있는 객체들은 mark 되었을 것이며, 이제 Old 영역을 청소함으로써 새로 객체를 할당하기 위한 공간을 확보할 수 있다.

---

**Phase 6: Concurrent Sweep**

```
2018-01-26T16:23:08.458-0200: 65.561: [CMS-concurrent-sweep-start]
2018-01-26T16:23:08.485-0200: 65.588: [CMS-concurrent-sweep: 0.027/0.027 secs] [Times: user=0.03 sys=0.00, real=0.03 secs]
```

애플리케이션 스레드와 **병렬적으로 수행되며, 사용하지 않는 객체들을 정리하여 빈 공간을 확보한다.**

<br>
![13.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/13.png)

<div class="code-line-wrap">
<p class="code-line">2018-01-26T16:23:08.458-0200: 65.561: [CMS-concurrent-sweep-start]
2018-01-26T16:23:08.485-0200: 65.588: [<span class="node">CMS-concurrent-sweep<sup>1</sup></span>: <span class="node">0.027/0.027 secs<sup>2</sup></span>] [<span class="node">[Times: user=0.03 sys=0.00, real=0.03 secs] <sup>3</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">CMS-concurrent-sweep</span> – "Concurrent Sweep" 단계로 mark 되지 않은 객체들을 정리하여 공간을 확보한다.</li>
<li class="description"><span class="node">0.027/0.027 secs</span> – 이 단계에서 걸린 시간으로 elapsed time(user) 및 wall clock time(real)을 나타낸다.</li>
<li class="description"><span class="node">[Times: user=0.03 sys=0.00, real=0.03 secs] </span> – 해당 단계에서 걸린 시간으로 user 및 system, real 로 나누어서 보여주고 있다.</li>
</ol>
</div>

---

**Phase 7: Concurrent Reset**

```
2018-01-26T16:23:08.485-0200: 65.589: [CMS-concurrent-reset-start]
2018-01-26T16:23:08.497-0200: 65.601: [CMS-concurrent-reset: 0.012/0.012 secs] [Times: user=0.01 sys=0.00, real=0.01 secs]
```

CMS 알고리즘 내부에서 사용하는 데이터들을 리셋하고, 다음 사이클을 준비한다.

<div class="code-line-wrap">
<p class="code-line">2018-01-26T16:23:08.485-0200: 65.589: [CMS-concurrent-reset-start]
2018-01-26T16:23:08.497-0200: 65.601: [<span class="node">CMS-concurrent-reset<sup>1</sup></span>: <span class="node">0.012/0.012 secs<sup>2</sup></span>] [<span class="node">[Times: user=0.01 sys=0.00, real=0.01 secs]<sup>3</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">CMS-concurrent-reset</span> – "Concurrent Reset" 단계로, CMS 알고리즘 내부에서 사용하는 데이터들을 리셋하고, 다음 사이클을 준비한다.</li>
<li class="description"><span class="node">0.012/0.012 secs</span> – 이 단계에서 걸린 시간으로 elapsed time(user) 및 wall clock time(real)을 나타낸다.</li>
<li class="description"><span class="node">[Times: user=0.01 sys=0.00, real=0.01 secs]</span> – 해당 단계에서 걸린 시간으로 user 및 system, real 로 나누어서 보여주고 있다.</li>
</ol>
</div>

CMS GC는 이렇게 각 단계를 나누어, 애플리케이션 스레드와 병렬적으로 GC 동작을 수행함으로써 Stop-The-World로 인해 애플리케이션이 멈추는 시간을 줄인다.

하지만 CMS GC도 단점이 있는데, **Old 영역에 대한 Compaction을 수행하지 않음으로써 Old 영역에서 단편화가 발생할 수 있다.** 그리고 또한 **큰 Heap 영역을 가지는 환경에서는 애플리케이션 스레드가 멈추는 시간을 예측하기가 힘들 수 있다.**

---

<br>
## G1

G1 알고리즘의 목표 중 하나는, GC로 인해 애플리케이션 스레드가 멈추는 **Stop-The-World의 시간과 빈도를 설정을 통해 예측 가능하도록 하는 것이다.**

이 G1(Garbage-First)은 soft real-time garbage collector로서, 사용자가 설정한대로 garbage collection의 성능이나 GC로 인해 멈추는 시간을 **거의** 맞출 수 있다. 5 millisecond 내에, 사용자가 설정한 시간에 따라 Stop-The-World로 인해 애플리케이션 스레드가 멈추는 시간을 조정할 수 있다. Garbage-First GC는 사용자가 설정한, 이 **"목표"**에 따라 멈추는 시간을 넘지 않도록 동작한다. (최대한 사용자가 의도한대로 동작한다는 것이다. 그럴 수 있다면 hard real-time garbage collector가 될 것이다.)

이를 위해 G1은 다음과 같이 구현된다.

앞서 살펴봤던 연속된 Young 영역 및 Old 영역으로 Heap을 관리하지 않는다. **대신 Heap 영역을 일정한 크기의 작은 공간(region)으로 나눈다.** (기본 2048개의 region이다.) 각 region은 Eden이거나 Survivor, Old 가 된다. 물론 논리적으로 봤을 때, Eden 및 Survivor에 해당하는 region을 합쳐서 본다면 Young 영역으로 볼 수 있다. Old 또한 마찬가지.

<br>

![14.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/14.png)

이렇게 구현한다면 garbage collector 입장에서는 전체 heap을 대상으로 하는 것이 아니라 점진적으로 해결해야 될 문제에 접근하도록 할 수 있다. 한 GC 사이클에 모든 Young / Old 영역에 대해 GC를 수행할 필요가 없다는 것이다.

G1 GC는 잘개 나누어진 각 region들을 collection set이라 불리는 것으로 분류하여 이 region만을 고려하여 garbage collection을 수행한다.

> Young 영역에 해당하는 모든 region에 대해서는 Collection Set에 모두 포함되어 한 GC 사이클에 모두 GC가 수행되며, **Old 영역의 경우 collection set에 포함되어 garbage collection의 대상이 되거나 안될 수 있다.**

<br>

![15.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/15.png)

또한 GC를 수행할 때, 각 region이 가지고 있는 살아있는 객체의 수를 조사하는데 이 정보는 애플리케이션 스레드와 동시에 수행되는 concurrent phase에 수행되어 Collection Set을 만들 때 참조된다. <br>
G1 GC는 살아있는 객체가 아닌 garbage collector 대상이 되는, **더 이상 사용하지 않는 객체가 많은 region부터 Collection Set에 포함시킨다.** <br>
따라서 이 GC의 이름이 Garbage-First 인 것이다.

G1 GC를 사용하기 위해서는 다음과 같이 JVM 파라미터를 설정한다.

```
java -XX:+UseG1GC com.mypackages.MyExecutableClass
```

<br>
### Evacuation Pause: Fully Young

애플리케이션이 처음 시작되었을 때는, G1은 GC를 위해 참조될 정보가 없기 때문에 **Young 영역에 대해서만 수행하는 fully-young 모드로 동작한다.**
Young 영역이 가득찼을 경우에 살아있는 객체를 마킹하기 위해 애플리케이션 스레드는 잠시 멈추게 되고, Young 영역에 있는 살아있는 객체들은 Survivor 영역으로 이동시킨다. 객체 이동하는 동작을 Evacuation이라고 부르는데, 이전에 봤던 GC 알고리즘들과 거의 동일하다. 

Evacuation에 대한 로그는 좀 많은데, 여기서는 fully-young 모드와는 관계가 없는 로그를 빼고 살펴보도록 한다. 해당 로그들은 애플리케이션 스레드와 동시에 동작하는 concurrent 단계일 때 다시 볼 것이다. 또한 GC 스레드가 병렬로 동작할 때 남는 로그(Parallel) 들과 "Other" 단계일 때의 로그도 나누어서 볼 것이다.

<div class="code-line-wrap">
<p class="code-line nowrap"><span class="node">0.134: [GC pause (G1 Evacuation Pause) (young), 0.0144119 secs]<sup>1</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Parallel Time: 13.9 ms, GC Workers: 8]<sup>2</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">…<sup>3</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Code Root Fixup: 0.0 ms]<sup>4</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Code Root Purge: 0.0 ms]<sup>5</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;<code>[Clear CT: 0.1 ms]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Other: 0.4 ms]<sup>6</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">…<sup>7</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Eden: 24.0M(24.0M)-&gt;0.0B(13.0M) <sup>8</sup></span><span class="node">Survivors: 0.0B-&gt;3072.0K <sup>9</sup></span><span class="node">Heap: 24.0M(256.0M)-&gt;21.9M(256.0M)]<sup>10</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node"> [Times: user=0.04 sys=0.04, real=0.02 secs] <sup>11</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">0.134: [GC pause (G1 Evacuation Pause) (young), 0.0144119 secs]</span> – Young 영역에 대해서만 GC를 수행하는데, JVM이 시작되고 난 후 134ms 후에 시작되었고 0.0144 초가 걸렸다.</li>
<li class="description"><span class="node">[Parallel Time: 13.9 ms, GC Workers: 8]</span> – 8개의 스레드에 수행되었는데 13.9ms (real time) 걸렸다.</li>
<li class="description"><span class="node">…</span> – 병렬로 동작한 동작은 따로 살펴본다.</li>
<li class="description"><span class="node">[Code Root Fixup: 0.0 ms]</span> – 병렬로 수행되는 GC 동작을 위해 갖고 있던 정보를 정리한다.</li>
<li class="description"><span class="node">[Code Root Purge: 0.0 ms]</span> – 역시 GC를 위해 가지고 있던 정보를 정리한다.</li>
<li class="description"><span class="node">[Other: 0.4 ms]</span> – GC를 위해 자잘한 일을 수행한 것이다.</li>
<li class="description"><span class="node">…</span> – 따로 살펴본다.</li>
<li class="description"><span class="node">[Eden: 24.0M(24.0M)-&gt;0.0B(13.0M) </span> – 이 단계 전후의 Eden region의 사용량 및 크기이다.</li>
<li class="description"><span class="node">Survivors: 0.0B-&gt;3072.0K </span> – 이 단계 전후의 Survivor 크기이다.</li>
<li class="description"><span class="node">Heap: 24.0M(256.0M)-&gt;21.9M(256.0M)]</span> – 이 단계 전후의 Heap 영역의 사용량 및 크기이다.</li>
<li class="description"><span class="node"> [Times: user=0.04 sys=0.04, real=0.02 secs] </span> – 해당 단계에서 걸린 시간으로 user 및 system, real 로 나누어서 보여주고 있다:
<ul>
<li>user – GC가 진행되는 동안 Garbage Collector에 의해 수행된 CPU 시간이다.</li>
<li>sys – System Call과 같이 OS가 수행하거나 기다린 시간이다.</li>
<li>real – 애플리케이션이 GC로 인해 멈춘 시간이다. 이 시간은 user와 sys 시간을 GC 수행하는 스레드 개수로 나눈 것에 근접한다. 이 케이스에 대해서는 8개의 스레드가 GC를 수행되었다. GC의 모든 로직이 완전히 병렬적으로 수행되지는 않을 것이므로, user와 sys 시간을 스레드 개수로 나눈 값보다는 높다.</li>
</ul>
</li>
</ol>
</div>

이 단계에서 제일 시간이 많이 걸린 것은, 8개의 스레드에 의해 병렬적으로 동작한 일들이다.
다음과 같이 로그 상에서 확인할 수 있다.

<div class="code-line-wrap">
<p class="code-line nowrap"><span class="node">[Parallel Time: 13.9 ms, GC Workers: 8]<sup>1</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node"> [GC Worker Start (ms)<sup>2</sup></span><code>: Min: 134.0, Avg: 134.1, Max: 134.1, Diff: 0.1]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Ext Root Scanning (ms)<sup>3</sup></span><code>: Min: 0.1, Avg: 0.2, Max: 0.3, Diff: 0.2, Sum: 1.2]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<code>[Update RS (ms): Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.0]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code>[Processed Buffers: Min: 0, Avg: 0.0, Max: 0, Diff: 0, Sum: 0]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<code>[Scan RS (ms): Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.0]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Code Root Scanning (ms)<sup>4</sup></span><code>: Min: 0.0, Avg: 0.0, Max: 0.2, Diff: 0.2, Sum: 0.2]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Object Copy (ms)<sup>5</sup></span><code>: Min: 10.8, Avg: 12.1, Max: 12.6, Diff: 1.9, Sum: 96.5]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Termination (ms)<sup>6</sup></span><code>: Min: 0.8, Avg: 1.5, Max: 2.8, Diff: 1.9, Sum: 12.2]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Termination Attempts<sup>7</sup></span><code>: Min: 173, Avg: 293.2, Max: 362, Diff: 189, Sum: 2346]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[GC Worker Other (ms)<sup>8</sup></span><code>: Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.1]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">GC Worker Total (ms)<sup>9</sup></span><code>: Min: 13.7, Avg: 13.8, Max: 13.8, Diff: 0.1, Sum: 110.2]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[GC Worker End (ms)<sup>10</sup></span>: Min: 147.8, Avg: 147.8, Max: 147.8, Diff: 0.0]
</p><ol class="code-line-components">
<li class="description"><span class="node">[Parallel Time: 13.9 ms, GC Workers: 8]</span> – 다음 로그에 있는 동작들이 수행된 시간이다.</li>
<li class="description"><span class="node"> [GC Worker Start (ms)</span> – 해당 동작들을 수행하기 시작할 때의 timestamp이다. Min 과 Max의 값이 많이 다르면 이는 너무 많이 스레드의 개수를 설정하였거나 JVM이 아닌 다른 프로세스가 CPU 시간을 많이 잡아먹었을 때이다.  </li>
<li class="description"><span class="node">[Ext Root Scanning (ms)</span> – Heap 영역에 존재하지 않는 클래스 로더나 JNI 참조 정보, JVM 시스템 정보를 스캔하면서 걸린 시간이다.</li>
<li class="description"><span class="node">[Code Root Scanning (ms)</span> – 로컬변수와 같은 GC root로부터 참조되는 객체들을 스캔하는데 걸린 시간이다.</li>
<li class="description"><span class="node">[Object Copy (ms)</span> – GC 대상이 되는 region으로부터 객체들을 복사하는데 걸린 시간이다.</li>
<li class="description"><span class="node">[Termination (ms)</span> – GC 동작을 수행 후 스레드들이 더 이상 할 작업이 없다는 것을 확인하고 종료하는데 걸린 시간이다.</li>
<li class="description"><span class="node">[Termination Attempts</span> – 스레드들이 GC 동작을 종료하기 위해 시도한 횟수이다. GC 종료를 시도할 때 실패하는 경우는 GC를 위해 할 동작이 아직 있다는 것이다.</li>
<li class="description"><span class="node">[GC Worker Other (ms)</span> – GC를 위해 자잘한 일을 하는데 걸린 시간이다.</li>
<li class="description"><span class="node">GC Worker Total (ms)</span> – GC 스레드들이 GC를 수행하는데 걸린 전체 시간이다.</li>
<li class="description"><span class="node">[GC Worker End (ms)</span> – GC가 각자의 일을 마쳤을 때의 timestamp이다. 보통 Min 및 Avg, Max가 같지만, 그렇지 않은 경우에는 스레드들이 기다린 동작이 많거나, 해당 스레드들과 CPU 시간을 경쟁하는 다른 프로세스들이 많다는 것이다.</li>
</ol>
</div>

위의 동작말고도 Evacuation 단계에서 자잘한 일들도 많이 수행되었는데 다음과 같다.

<div class="code-line-wrap">
<p class="code-line nowrap"><span class="node">[Other: 0.4 ms]<sup>1</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;<code>[Choose CSet: 0.0 ms]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Ref Proc: 0.2 ms]<sup>2</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Ref Enq: 0.0 ms]<sup>3</sup></span><br>&nbsp;&nbsp;&nbsp;&nbsp;<code>[Redirty Cards: 0.1 ms]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<code>[Humongous Register: 0.0 ms]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<code>[Humongous Reclaim: 0.0 ms]</code><br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="node">[Free CSet: 0.0 ms]<sup>4</sup></span></p>
<ol class="code-line-components">
<li class="description"><span class="node">[Other: 0.4 ms]</span> – GC를 위해 기타 작업을 하는데 있어서 걸린 시간으로 GC 스레드들이 병렬로 수행한다.</li>
<li class="description"><span class="node">[Ref Proc: 0.2 ms]</span> – non-strong reference들과 관련된 작업을 수행하면서 걸린 시간이다.</li>
<li class="description"><span class="node">[Ref Enq: 0.0 ms]</span> – 남아있는 non-strong reference들을 ReferenceQueue에 큐잉하는데 걸린 시간이다.</li>
<li class="description"><span class="node">[Free CSet: 0.0 ms]</span> – Collection Set에 있던, GC를 수행해서 비어버린 region들을 반환하기 위해 걸린 시간이다. 이 region들은 다음 객체 생성할 때 쓰일 것이다. </li>
</ol>
</div>

<br>
### Concurrent Marking

G1 GC 알고리즘의 컨셉은 CMS GC와 많이 비슷하기 때문에, CMS 알고리즘을 잘 이해하고 있다면 이 알고리즘을 이해하는데도 별 어려움이 없을 것이다.
비록 디테일한 구현은 다르겠지만, 애플리케이션 스레드와 동시에 동작하는 Concurrent Mark는 매우 비슷하다.

G1 GC의 Concurrent Mark는 Snapshot-At-The-Beginning 접근법에 따라, mark 단계의 시작점에서, 비록 애플리케이션 스레드의 동작에 따라 객체의 그래프가 변하더라도, 살아있는 모든 객체를 mark 를 시도한다. 이 정보는 각 region의 살아있는 객체들의 정보를 유지할 수 있게 하고 Collection Set를 만드는데 참조된다.

Concurrent Marking 단계는 head 영역의 사용량이 일정 이상이 되었을 때 시작된다. 디폴트는 힙 전체 영역의 45%이지만, **InitiatingHeapOccupancyPercent** 라는 JVM 옵션을 통해 변경할 수 있다. CMS GC랑 비슷하게 이 단계도 여러 세부 단계로 나누어 수행되는데 어떤 단계는 애플리케이션과 동시에 동작하지만, 어떤 단계는 Stop-The-World 를 유발한다.

<br>

![16.png](/static/assets/img/blog/java/2018-02-05-gc_algorithms/16.png)

---

**Phase 1: Initial Mark**

**이 단계에서는 GC Root로부터 바로 참조되는 살아 있는 객체를 mark 한다. (Old region의 객체로부터 참조되는 Survivor Region을 mark**)
CMS GC는 Stop-The-World를 일으키는 단계였지만, G1 GC는 Evacuation 단계 (Young GC)로부터 트리거되기 때문에 (piggy-backed) 그 오버헤드는 덜하다. 다음 로그와 같이 확인할 수 있다.

```
1.631: [GC pause (G1 Evacuation Pause) (young) (initial-mark), 0.0062656 secs]
```

---

**Phase 2: Root Region Scan**

이 단계에서는 **Root region (Survivor region)에 속해 있는, 살아있는 모든 객체를 mark 한다.**
애플리케이션 스레드와 동시에 동작하며, 다음 Evacuation 단계 (Young GC)가 일어나기 전까지 반드시 완료해야 한다. (객체의 그래프, 상태를 변화시키는 Young GC가 발생하면 많은 문제가 발생하기 때문이다.)


```
1.362: [GC concurrent-root-region-scan-start]
1.364: [GC concurrent-root-region-scan-end, 0.0028513 secs]
```

---

**Phase 3: Concurrent Mark**

CMS GC와 매우 유사하게, **객체 그래프를 따라 Heap 영역의 모든 살아있는 객체를 식별하여 특별한 비트맵을 이용하여 mark 해둔다.**
애플리케이션 스레드와 동시에 동작한다.

> 만약 이 단계에서 비어 있는 region (살아있는 객체를 보유하고 있지 않은)이 발견되면 즉시 회수된다.

```
1.364: [GC concurrent-mark-start]
1.645: [GC concurrent-mark-end, 0.2803470 secs]
```

---

**Phase 4: Remark**

이 단계는 **Stop-The-World를 일으키는 단계로, mark 하는 단계를 완료**하는 단계이다. 애플리케이션 스레드를 잠시 멈추고 log buffer에 있던 정보를 참조하여 객체 상태 업데이트를 완료한다.

또한 모든 **region에 대해서 가지고 있는 살아있는 객체의 수를 나타내는 live stat (Region Liveness)를 계산한다.**

```
1.645: [GC remark 1.645: [Finalize Marking, 0.0009461 secs] 1.646: [GC ref-proc, 0.0000417 secs] 1.646: [Unloading, 0.0011301 secs], 0.0074056 secs]
[Times: user=0.01 sys=0.00, real=0.01 secs]
```

---

**Phase 5: Cleanup / Copying**

마지막 단계는 먼저 다음 GC를 위해 heap 영역에 있는 모든 살아있는 객체 정보를 조사해둔다. 

각 로직에 따라 애플리케이션 스레드와 동시에 수행되는 것도 있고, Stop-The-World를 일으키는 것도 있다.
**각 region의 liveness, 즉 살아 있는 객체가 가장 적은 region을 선택하여 collect 한다.**

> Young / Old region은 이 시점에 같이 collect 된다.

 해당 단계에서 완전히 비어 있는 region을 회수하는 것이나 살아있는 객체의 상태를 계산하는 것과 같은 일부 로직은 애플리케이션 스레드와 동시에 동작하지만, 어떤 로직은 Stop-The-World를 일으켜 애플리케이션 스레드의 방해없이 자기 자신의 작업을 완료한다.

```
1.652: [GC cleanup 1213M->1213M(1885M), 0.0030492 secs]
[Times: user=0.01 sys=0.00, real=0.00 secs]
```


---


<style>
ol li, ul li {
    min-height: 1px;
    vertical-align: bottom;
}

pre, code, kbd, samp {
    font-family: consolas, 'courier new', monospace;
    font-size: 1em;
    color: #009cd5;
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